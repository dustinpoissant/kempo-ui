import readMediaTags from '../../src/utils/readMediaTags.js';
import loadFileMetadata from '../../src/utils/loadFileMetadata.js';

/*
  Byte Builders
*/

const latin1 = text => Uint8Array.from(text, c => c.charCodeAt(0));

const utf8 = text => new TextEncoder().encode(text);

const concat = (...parts) => {
  const all = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  parts.forEach(part => {
    all.set(part, offset);
    offset += part.length;
  });
  return all;
};

const uint32 = n => Uint8Array.from([n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]);

const synchsafe = n => Uint8Array.from([(n >>> 21) & 127, (n >>> 14) & 127, (n >>> 7) & 127, n & 127]);

const id3Frame = (id, text) => {
  const body = concat(Uint8Array.from([3]), utf8(text));
  return concat(latin1(id), uint32(body.length), Uint8Array.from([0, 0]), body);
};

const id3v2 = (...frames) => {
  const body = concat(...frames);
  return concat(latin1('ID3'), Uint8Array.from([3, 0, 0]), synchsafe(body.length), body);
};

const padded = (text, length) => concat(utf8(text), new Uint8Array(length - utf8(text).length));

const id3v1 = (title, artist, album, year) => concat(latin1('TAG'), padded(title, 30), padded(artist, 30), padded(album, 30), latin1(year), new Uint8Array(31));

const atom = (type, ...parts) => {
  const body = concat(...parts);
  return concat(uint32(body.length + 8), typeof type === 'string' ? latin1(type) : type, body);
};

const ilstItem = (type, text) => atom(type, atom('data', uint32(1), uint32(0), utf8(text)));

const mp4 = (mdatBytes, tagged) => {
  const ilst = atom('ilst', ilstItem(Uint8Array.from([0xa9, 0x6e, 0x61, 0x6d]), 'Evo'), ilstItem(Uint8Array.from([0xa9, 0x41, 0x52, 0x54]), 'Kempo'), ilstItem(Uint8Array.from([0xa9, 0x61, 0x6c, 0x62]), 'Demo'), ilstItem(Uint8Array.from([0xa9, 0x64, 0x61, 0x79]), '2026-06-29T00:00:00Z'));
  const moov = atom('moov', atom('mvhd', new Uint8Array(100)), tagged ? atom('udta', atom('meta', uint32(0), ilst)) : new Uint8Array());
  return concat(atom('ftyp', latin1('isom'), uint32(0), latin1('isom')), atom('mdat', new Uint8Array(mdatBytes)), moov);
};

/*
  Stubs a fetch that honours Range, or ignores it when ranges is false
*/

const withFile = async (bytes, ranges, run) => {
  const original = globalThis.fetch;
  globalThis.fetch = async (src, { headers }) => {
    const range = headers?.Range?.match(/^bytes=(-?\d+)(?:-(\d+))?$/);
    if(ranges && range){
      const start = Number(range[1]) < 0 ? Math.max(bytes.length + Number(range[1]), 0) : Number(range[1]);
      const end = range[2] === undefined ? bytes.length : Math.min(Number(range[2]) + 1, bytes.length);
      return new Response(bytes.slice(start, end), { status: 206 });
    }
    return new Response(bytes, { status: 200 });
  };
  try{
    return await run();
  } finally {
    globalThis.fetch = original;
  }
};

/*
  Tests
*/

export default {
  'should read ID3v2 title, artist, album and year': async ({pass, fail}) => {
    const file = concat(id3v2(id3Frame('TIT2', 'Song'), id3Frame('TPE1', 'Band'), id3Frame('TALB', 'Record'), id3Frame('TDRC', '2024-05-06')), new Uint8Array(500));
    const tags = await withFile(file, true, () => readMediaTags('/a.mp3'));
    if(tags.title !== 'Song' || tags.artist !== 'Band' || tags.album !== 'Record' || tags.year !== '2024') return fail(`Got ${JSON.stringify(tags)}`);
    pass('ID3v2 read');
  },
  'should read ID3v1 from the end of an mp3 with no ID3v2 header': async ({pass, fail}) => {
    const file = concat(Uint8Array.from([0xff, 0xfb, 0xe0, 0x64]), new Uint8Array(1000), id3v1('Old Song', 'Old Band', 'Old Record', '1999'));
    const tags = await withFile(file, true, () => readMediaTags('/a.mp3'));
    if(tags.title !== 'Old Song' || tags.artist !== 'Old Band' || tags.album !== 'Old Record' || tags.year !== '1999') return fail(`Got ${JSON.stringify(tags)}`);
    pass('ID3v1 read');
  },
  'should read MP4 tags from a moov atom after a large mdat': async ({pass, fail}) => {
    const tags = await withFile(mp4(600000, true), true, () => readMediaTags('/a.mp4'));
    if(tags.title !== 'Evo' || tags.artist !== 'Kempo' || tags.album !== 'Demo' || tags.year !== '2026') return fail(`Got ${JSON.stringify(tags)}`);
    pass('MP4 read');
  },
  'should resolve to an empty object when the file has no tags': async ({pass, fail}) => {
    const tags = await withFile(mp4(1000, false), true, () => readMediaTags('/a.mp4'));
    if(Object.keys(tags).length) return fail(`Got ${JSON.stringify(tags)}`);
    pass('No tags');
  },
  'should still read tags from the start when the server ignores Range': async ({pass, fail}) => {
    const file = concat(id3v2(id3Frame('TIT2', 'Song')), new Uint8Array(1000));
    const tags = await withFile(file, false, () => readMediaTags('/a.mp3'));
    if(tags.title !== 'Song') return fail(`Got ${JSON.stringify(tags)}`);
    pass('Range ignored');
  },
  'should resolve to an empty object when the request fails': async ({pass, fail}) => {
    const original = globalThis.fetch;
    globalThis.fetch = async () => { throw new Error('offline'); };
    const tags = await readMediaTags('/a.mp3');
    globalThis.fetch = original;
    if(Object.keys(tags).length) return fail(`Got ${JSON.stringify(tags)}`);
    pass('Failure handled');
  },
  'loadFileMetadata should fill only empty fields and clear them on a new src': async ({pass, fail}) => {
    const file = concat(id3v2(id3Frame('TIT2', 'Song'), id3Frame('TPE1', 'Band')), new Uint8Array(500));
    const host = { src: '/a.mp3', trackTitle: 'Mine', artist: '', album: '', year: '' };
    await withFile(file, true, () => loadFileMetadata(host));
    if(host.trackTitle !== 'Mine') return fail('An explicit title was overwritten');
    if(host.artist !== 'Band') return fail(`Artist was ${host.artist}`);
    host.src = '/b.mp3';
    await withFile(new Uint8Array(500), true, () => loadFileMetadata(host));
    if(host.artist !== '') return fail(`Artist from the previous file stayed: ${host.artist}`);
    if(host.trackTitle !== 'Mine') return fail('An explicit title was cleared');
    pass('Fills and clears');
  },
  'loadFileMetadata should not read the file when readMetadata is false': async ({pass, fail}) => {
    const file = concat(id3v2(id3Frame('TIT2', 'Song')), new Uint8Array(500));
    const host = { src: '/a.mp3', readMetadata: false, trackTitle: '', artist: '', album: '', year: '' };
    await withFile(file, true, () => loadFileMetadata(host));
    if(host.trackTitle !== '') return fail(`Title was read: ${host.trackTitle}`);
    pass('Skipped');
  }
};
