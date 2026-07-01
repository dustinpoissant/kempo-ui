import Control from './Control.js';
import { html, css } from '../../lit-all.min.js';
import '../Slider.js';

/*
  Scrub bar. Doesn't use Control's static hostEvents machinery because that
  would re-bind k-slider's `.value` on every timeupdate (4x/sec) and fight
  the user's own drag — `scrubbing` suppresses host-driven re-renders while
  a pointer is down on the slider.
*/
export default class VidSeek extends Control {
  static requires = ['seek'];

  scrubbing = false;

  connectedCallback() {
    super.connectedCallback();
    const host = this.host;
    if(host){
      host.addEventListener('timeupdate', this.handleHostUpdate);
      host.addEventListener('durationchange', this.handleHostUpdate);
      host.addEventListener('loadedmetadata', this.handleHostUpdate);
      host.addEventListener('seeked', this.handleHostUpdate);
    }
  }

  disconnectedCallback() {
    const host = this.boundHost;
    super.disconnectedCallback();
    if(host){
      host.removeEventListener('timeupdate', this.handleHostUpdate);
      host.removeEventListener('durationchange', this.handleHostUpdate);
      host.removeEventListener('loadedmetadata', this.handleHostUpdate);
      host.removeEventListener('seeked', this.handleHostUpdate);
    }
  }

  handleHostUpdate = () => {
    if(!this.scrubbing) this.requestUpdate();
  };

  handlePointerDown = () => {
    this.scrubbing = true;
    const stop = () => {
      this.scrubbing = false;
      this.requestUpdate();
      window.removeEventListener('pointerup', stop);
    };
    window.addEventListener('pointerup', stop);
  };

  handleChange = (e) => {
    const value = Number(e.detail?.value ?? e.target?.value);
    if(!isNaN(value)) this.host?.seek?.(value);
  };

  render() {
    const host = this.host;
    const duration = host?.duration || 0;
    const current = host?.currentTime || 0;
    return html`
      <div class="seek" @pointerdown=${this.handlePointerDown}>
        <k-slider
          min="0"
          max=${duration || 1}
          .value=${String(current)}
          @change=${this.handleChange}
        ></k-slider>
      </div>
    `;
  }

  static styles = [
    Control.styles,
    css`
      :host {
        flex: 1 1 auto;
        min-width: 4rem;
        margin: 0 var(--spacer_q, 0.25rem);
      }
      .seek {
        width: 100%;
      }
      k-slider {
        width: 100%;
        --thumb_size: 14px;
        --track_height: 4px;
        --track_background: rgba(255, 255, 255, 0.3);
      }
    `
  ];
}

customElements.define('kc-vid-seek', VidSeek);
