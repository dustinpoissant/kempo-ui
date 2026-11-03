import Control from './Control.js';
import { html, css } from '../../lit-all.min.js';
import '../Dropdown.js';
import '../Slider.js';
import '../Icon.js';

export default class MediaVolume extends Control {
  static requires = ['setVolume', 'toggleMute'];
  static hostEvents = ['volumechange'];

  handleMuteClick = (e) => {
    e.stopPropagation();
    this.host?.toggleMute?.();
  };

  handleVolumeChange = (e) => {
    const value = Number(e.detail?.value ?? e.target?.value);
    if(!isNaN(value)) this.host?.setVolume?.(value / 100);
  };

  render() {
    const host = this.host;
    const muted = !host || host.muted || host.volume === 0;
    const volumePct = Math.round((host?.volume ?? 1) * 100);
    if(this.inMenu){
      return html`
        <button type="button" class="mute no-btn" title="Mute / Unmute" @click=${this.handleMuteClick}>
          <k-icon name="${muted ? 'volume_off' : 'volume_up'}"></k-icon>
        </button>
        <k-slider
          min="0"
          max="100"
          .value=${String(volumePct)}
          @change=${this.handleVolumeChange}
        ></k-slider>
      `;
    }
    return html`
      <k-dropdown hover open-direction="up center">
        <div slot="trigger" @click=${this.handleMuteClick} title="Mute / Unmute" style="display: inline-flex; align-items: center; justify-content: center;">
          <k-icon name="${muted ? 'volume_off' : 'volume_up'}"></k-icon>
        </div>
        <div class="popup">
          <k-slider
            vertical
            min="0"
            max="100"
            .value=${String(volumePct)}
            @change=${this.handleVolumeChange}
          ></k-slider>
        </div>
      </k-dropdown>
    `;
  }

  static styles = [
    Control.styles,
    css`
      :host {
        border: 1px solid var(--c_border);
        border-radius: var(--radius);
        margin: var(--spacer_q);
        padding: var(--spacer_h);
        display: inline-flex;
        background: transparent;
        color: inherit;
      }
      k-dropdown {
        display: inline-flex;
      }
      k-dropdown::part(menu) {
        background: transparent;
        border: none;
        box-shadow: none;
        padding: 0.875rem 0.5rem;
        margin: 0;
        overflow: visible;
      }
      button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        color: inherit;
        cursor: pointer;
        padding: 0;
        font-size: inherit;
      }
      .popup {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0;
      }
      k-slider {
        --vertical_height: 6rem;
        --track_background: rgba(255, 255, 255, 0.3);
      }
      :host([in-menu]) {
        border-color: transparent;
      }
      :host([in-menu]) k-slider {
        flex: 1;
        min-width: 8rem;
        --track_background: var(--c_border);
      }
      .mute {
        display: inline-flex;
        cursor: pointer;
        color: inherit;
      }
    `
  ];
}

customElements.define('kc-media-volume', MediaVolume);
