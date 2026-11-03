import readMediaTags from './readMediaTags.js';

const props = { title: 'trackTitle', artist: 'artist', album: 'album', year: 'year' };

/*
  Fills the host's empty trackTitle, artist, album and year from the tags stored in its media file,
  unless the host has readMetadata turned off. Values the host was given itself always win, and values
  filled in for a previous src are cleared first.
*/
export default async (host) => {
  const src = host.src;
  const tags = src && host.readMetadata !== false ? await readMediaTags(src) : {};
  if(src !== host.src) return;
  const previous = host.fileMetadata || {};
  const filled = {};
  Object.entries(props).forEach(([tag, prop]) => {
    if(host[prop] && host[prop] === previous[prop]) host[prop] = '';
    if(!host[prop] && tags[tag]){
      host[prop] = tags[tag];
      filled[prop] = tags[tag];
    }
  });
  host.fileMetadata = filled;
};
