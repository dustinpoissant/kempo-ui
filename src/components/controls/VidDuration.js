import Control from './Control.js';
import { html, css } from '../../lit-all.min.js';
import formatDuration from '../../utils/formatDuration.js';

export default class VidDuration extends Control {
  static requires = [];
  static hostEvents = ['durationchange', 'loadedmetadata'];

  render() {
    return html`<span class="duration">${formatDuration(this.host?.duration ?? 0)}</span>`;
  }

  static styles = [
    Control.styles,
    css`
      .duration { padding: 0 0.15rem; white-space: nowrap; font-variant-numeric: tabular-nums; }
    `
  ];
}

customElements.define('kc-vid-duration', VidDuration);
