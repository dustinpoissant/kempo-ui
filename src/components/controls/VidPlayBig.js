import Control from './Control.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';

/*
  Large centered play/replay button, slotted into k-video's slot="center".
  Only renders while the host is paused; hidden entirely during playback.
*/
export default class VidPlayBig extends Control {
  static requires = ['play', 'seek'];
  static hostEvents = ['play', 'pause', 'playing', 'ended'];

  handleClick = () => {
    const host = this.host;
    if(!host) return;
    if(host.ended) host.seek(0);
    host.play();
  };

  render() {
    const host = this.host;
    if(!host || !host.paused) return html``;
    return html`
      <button type="button" class="no-btn" title="${host.ended ? 'Replay' : 'Play'}" @click=${this.handleClick}>
        <k-icon name="${host.ended ? 'replay' : 'play'}"></k-icon>
      </button>
    `;
  }

  static styles = [
    Control.styles,
    css`
      :host {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: inline-flex;
      }
      button.no-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 5rem;
        height: 5rem;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.55);
        border: none;
        color: #fff;
        font-size: 2.25rem;
        cursor: pointer;
        transition: background 0.2s, transform 0.2s;
      }
      button.no-btn:hover {
        background: rgba(0, 0, 0, 0.75);
        transform: scale(1.08);
      }
    `
  ];
}

customElements.define('kc-vid-play-big', VidPlayBig);
