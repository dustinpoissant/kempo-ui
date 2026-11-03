const HEAD_BYTES = 262144;
const MAX_ATOM_BYTES = 4194304;

const decoder = (label) => new TextDecoder(label);

/*
  Fetches a byte range. A server that ignores Range answers 200 with the whole file, so the stream
  is cancelled once enough bytes have arrived instead of downloading the rest.
*/
const readRange = async (src, start, end) => {
  const response = await fetch(src, { headers: { Range: start < 0 ? `bytes=${start}` : `bytes=${start}-${end - 1}` } });
  if(response.status === 206) return new Uint8Array(await response.arrayBuffer());
  if(!response.ok || start !== 0){
    response.body?.cancel();
    return new Uint8Array();
  }
  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  while(total < end){
    const { done, value } = await reader.read();
    if(done) break;
    chunks.push(value);
    total += value.length;
  }
  reader.cancel();
  const all = new Uint8Array(total);
  let offset = 0;
  chunks.forEach(chunk => {
    all.set(chunk, offset);
    offset += chunk.length;
  });
  return all.slice(0, end);
};

const ascii = (bytes, start, length) => String.fromCharCode(...bytes.subarray(start, start + length));

const clean = text => text.replace(/^\0+|\0+$/g, '').trim();

/*
  ID3
*/
const synchsafe = (bytes, offset) => (bytes[offset] << 21) | (bytes[offset + 1] << 14) | (bytes[offset + 2] << 7) | bytes[offset + 3];

const readId3Text = (bytes) => {
  const encoding = bytes[0];
  const body = bytes.subarray(1);
  if(encoding === 0) return clean(decoder('iso-8859-1').decode(body));
  if(encoding === 3) return clean(decoder('utf-8').decode(body));
  if(encoding === 2) return clean(decoder('utf-16be').decode(body));
  const littleEndian = body[0] === 0xff && body[1] === 0xfe;
  const hasBom = littleEndian || (body[0] === 0xfe && body[1] === 0xff);
  return clean(decoder(littleEndian ? 'utf-16le' : 'utf-16be').decode(hasBom ? body.subarray(2) : body));
};

const id3Fields = {
  TIT2: 'title', TT2: 'title',
  TPE1: 'artist', TP1: 'artist',
  TALB: 'album', TAL: 'album',
  TYER: 'year', TYE: 'year', TDRC: 'year'
};

const readId3v2 = (bytes) => {
  const version = bytes[3];
  const size = synchsafe(bytes, 6);
  const idLength = version === 2 ? 3 : 4;
  const headerLength = version === 2 ? 6 : 10;
  const tags = {};
  let offset = 10;
  if(version > 2 && (bytes[5] & 0x40)){
    offset += version === 4 ? synchsafe(bytes, 10) : 4 + ((bytes[10] << 24) | (bytes[11] << 16) | (bytes[12] << 8) | bytes[13]);
  }
  const end = Math.min(10 + size, bytes.length);
  while(offset + headerLength <= end){
    const id = ascii(bytes, offset, idLength);
    if(!/^[A-Z0-9]+$/.test(id)) break;
    const sizeOffset = offset + idLength;
    const frameSize = version === 2 ? (bytes[sizeOffset] << 16) | (bytes[sizeOffset + 1] << 8) | bytes[sizeOffset + 2]
      : version === 4 ? synchsafe(bytes, sizeOffset)
      : ((bytes[sizeOffset] << 24) | (bytes[sizeOffset + 1] << 16) | (bytes[sizeOffset + 2] << 8) | bytes[sizeOffset + 3]) >>> 0;
    const field = id3Fields[id];
    if(field && !tags[field]){
      const text = readId3Text(bytes.subarray(offset + headerLength, offset + headerLength + frameSize));
      tags[field] = field === 'year' ? text.slice(0, 4) : text;
    }
    offset += headerLength + frameSize;
  }
  return tags;
};

const readId3v1 = (bytes) => {
  if(bytes.length < 128 || ascii(bytes, bytes.length - 128, 3) !== 'TAG') return {};
  const start = bytes.length - 128;
  const text = (offset, length) => clean(decoder('iso-8859-1').decode(bytes.subarray(start + offset, start + offset + length)));
  return { title: text(3, 30), artist: text(33, 30), album: text(63, 30), year: text(93, 4) };
};

/*
  MP4 (also M4A, M4V, MOV)
*/
const uint32 = (bytes, offset) => ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0;

const mp4Fields = { '©nam': 'title', '©ART': 'artist', '©alb': 'album', '©day': 'year' };

const mp4Containers = ['moov', 'udta', 'meta', 'ilst'];

const readMp4Atoms = (bytes, start, end, tags) => {
  let offset = start;
  while(offset + 8 <= end){
    let size = uint32(bytes, offset);
    const type = String.fromCharCode(...bytes.subarray(offset + 4, offset + 8));
    if(size < 8) break;
    size = Math.min(size, end - offset);
    if(mp4Fields[type]){
      const dataAtom = offset + 8;
      if(ascii(bytes, dataAtom + 4, 4) === 'data'){
        const text = clean(decoder('utf-8').decode(bytes.subarray(dataAtom + 16, dataAtom + uint32(bytes, dataAtom))));
        tags[mp4Fields[type]] = type === '©day' ? text.slice(0, 4) : text;
      }
    } else if(mp4Containers.includes(type)){
      readMp4Atoms(bytes, offset + (type === 'meta' ? 12 : 8), offset + size, tags);
    }
    offset += size;
  }
};

/*
  The moov atom holds the tags and may sit after a very large mdat, so the top level atoms are
  hopped over with small reads until it is found.
*/
const readMp4 = async (src, head) => {
  let offset = 0;
  let bytes = head;
  let base = 0;
  while(offset < 1e12){
    if(offset + 16 > base + bytes.length || offset < base){
      bytes = await readRange(src, offset, offset + 16);
      base = offset;
      if(bytes.length < 8) return {};
    }
    const at = offset - base;
    let size = uint32(bytes, at);
    const type = ascii(bytes, at + 4, 4);
    if(size === 1) size = uint32(bytes, at + 8) * 4294967296 + uint32(bytes, at + 12);
    if(size < 8) return {};
    if(type === 'moov'){
      if(size > MAX_ATOM_BYTES) return {};
      const moov = await readRange(src, offset, offset + size);
      const tags = {};
      readMp4Atoms(moov, 0, moov.length, tags);
      return tags;
    }
    offset += size;
  }
  return {};
};

/*
  Resolves the title, artist, album and year stored in the file itself (ID3v2, ID3v1 or MP4 tags).
  Fields that are not present are left out, and a file with no readable tags resolves to {}.
*/
export default async (src) => {
  try{
    const head = await readRange(src, 0, HEAD_BYTES);
    if(ascii(head, 0, 3) === 'ID3') return readId3v2(head);
    if(ascii(head, 4, 4) === 'ftyp') return await readMp4(src, head);
    return readId3v1(await readRange(src, -128));
  } catch(e){
    return {};
  }
};
