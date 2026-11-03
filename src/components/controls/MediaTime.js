import Control from './Control.js';
import { html, css } from '../../lit-all.min.js';
import formatDuration from '../../utils/formatDuration.js';

export default class MediaTime extends Control {
  static requires = [];
  static hostEvents = ['timeupdate', 'loadedmetadata', 'seeked'];

  render() {
    return html`<span class="time">${formatDuration(this.host?.currentTime ?? 0)}</span>`;
  }

  static styles = [
    Control.styles,
    css`
      .time { padding: 0 0.15rem; white-space: nowrap; font-variant-numeric: tabular-nums; }
      :host([in-menu]) .time { padding: 0; }
    `
  ];
}

customElements.define('kc-media-time', MediaTime);
