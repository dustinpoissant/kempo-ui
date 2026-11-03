export default class AudioTrack extends HTMLElement {
  connectedCallback() {
    this.style.display = 'none';
  }

  get src() {
    return this.getAttribute('src') ?? '';
  }

  get artist() {
    return this.getAttribute('artist') ?? '';
  }

  get trackTitle() {
    return this.getAttribute('track-title') ?? '';
  }

  get album() {
    return this.getAttribute('album') ?? '';
  }

  get year() {
    return this.getAttribute('year') ?? '';
  }

  get downloadName() {
    return this.getAttribute('download-name') ?? '';
  }
}

customElements.define('kc-audio-track', AudioTrack);
