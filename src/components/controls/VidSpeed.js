import Control from './Control.js';
import { html, css } from '../../lit-all.min.js';
import '../Dropdown.js';
import '../Icon.js';

const RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

/*
  Renders its own k-dropdown menu instead of a native <select> — the
  native popup's background can't be styled cross-browser, which clashes
  against the dark video overlay. See VidVolume for the same pattern.
*/
export default class VidSpeed extends Control {
  static requires = ['setPlaybackRate'];
  static hostEvents = ['ratechange'];

  handleSelect = (rate) => {
    this.host?.setPlaybackRate?.(rate);
  };

  render() {
    const rate = this.host?.playbackRate ?? 1;
    return html`
      <k-dropdown open-direction="up center">
        <button slot="trigger" type="button" class="no-btn" title="Playback Speed">
          ${rate}x
          <k-icon name="arrow_drop_down"></k-icon>
        </button>
        ${RATES.map(r => html`
          <button type="button" @click=${() => this.handleSelect(r)}>${r === rate ? '✓ ' : ''}${r}x</button>
        `)}
      </k-dropdown>
    `;
  }

  static styles = [
    Control.styles,
    css`
      :host {
        display: inline-flex;
        margin: var(--spacer_q);
      }
      k-dropdown {
        display: inline-flex;
        --tc: #fff;
        --c_bg__alt: rgba(255, 255, 255, 0.2);
      }
      button[slot="trigger"] {
        display: inline-flex;
        align-items: center;
        gap: 0.1rem;
        min-width: 1.75rem;
        min-height: 1.5rem;
        padding: 0 0.35rem;
        background: transparent;
        border: 1px solid var(--c_border);
        border-radius: var(--radius);
        color: inherit;
        cursor: pointer;
        font: inherit;
      }
      k-dropdown::part(menu) {
        background: rgba(0, 0, 0, 0.85);
        border: none;
        box-shadow: var(--drop_shadow);
        min-width: 4.5rem;
      }
    `
  ];
}

customElements.define('kc-vid-speed', VidSpeed);
