import ButtonControl from './ButtonControl.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';

export default class AudioLoop extends ButtonControl {
  static requires = ['togglePlaylistLoop'];
  static hostEvents = ['playlist-loop-changed'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Loop playlist';
  }

  updated(changed) {
    super.updated(changed);
    this.toggleAttribute('active', !!this.host?.playlistLoop);
  }

  handleAction() { this.host?.togglePlaylistLoop?.(); }

  render() { return html`<slot><k-icon name="repeat"></k-icon></slot><slot name="menu-text">Loop playlist</slot>`; }

  static styles = [
    ...ButtonControl.styles,
    css`
      :host([active]) {
        color: var(--tc_primary);
      }
    `
  ];
}

customElements.define('kc-audio-loop', AudioLoop);
