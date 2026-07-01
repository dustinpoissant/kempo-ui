import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class VidMute extends ButtonControl {
  static requires = ['toggleMute'];
  static hostEvents = ['volumechange'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Mute / Unmute';
  }

  handleAction() { this.host?.toggleMute?.(); }

  render() {
    const muted = !this.host || this.host.muted || this.host.volume === 0;
    return html`<slot><k-icon name="${muted ? 'volume_off' : 'volume_up'}"></k-icon></slot>`;
  }
}

customElements.define('kc-vid-mute', VidMute);
