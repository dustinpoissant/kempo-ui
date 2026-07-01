import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class VidPlayPause extends ButtonControl {
  static requires = ['togglePlayPause'];
  static hostEvents = ['play', 'pause', 'playing', 'ended'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Play / Pause';
  }

  handleAction() { this.host?.togglePlayPause?.(); }

  render() {
    const paused = this.host ? (this.host.paused || this.host.ended) : true;
    return html`<slot><k-icon name="${paused ? 'play' : 'pause'}"></k-icon></slot>`;
  }
}

customElements.define('kc-vid-play-pause', VidPlayPause);
