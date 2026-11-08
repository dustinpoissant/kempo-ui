import readMediaTags from '../utils/readMediaTags.js';

/*
  Symbols
*/
const fileTags = Symbol();

export default class AudioTrack extends HTMLElement {
  static observedAttributes = ['src', 'read-metadata'];

  /*
    Constructor
  */
  constructor() {
    super();
    this[fileTags] = {};
  }

  /*
    Lifecycle Callbacks
  */
  connectedCallback() {
    this.style.display = 'none';
    this.readTags();
  }

  attributeChangedCallback() {
    if(this.isConnected) this.readTags();
  }

  /*
    Protected Members
  */
  get src() {
    return this.getAttribute('src') ?? '';
  }

  get artist() {
    return this.getAttribute('artist') || this[fileTags].artist || '';
  }

  get trackTitle() {
    return this.getAttribute('track-title') || this[fileTags].title || '';
  }

  get album() {
    return this.getAttribute('album') || this[fileTags].album || '';
  }

  get year() {
    return this.getAttribute('year') || this[fileTags].year || '';
  }

  get downloadName() {
    return this.getAttribute('download-name') ?? '';
  }

  /*
    Public Methods
  */
  readTags = async () => {
    const src = this.src;
    const reading = src && this.getAttribute('read-metadata') !== 'false' && this.closest('k-audio')?.readMetadata !== false;
    const tags = reading ? await readMediaTags(src) : {};
    if(src !== this.src) return;
    this[fileTags] = tags;
    this.dispatchEvent(new CustomEvent('playlist-changed', { bubbles: true }));
  };
}

customElements.define('k-audio-track', AudioTrack);
