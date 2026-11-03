import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class AudioPrevious extends ButtonControl {
  static requires = ['previousTrack'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Previous track';
  }

  handleAction() { this.host?.previousTrack?.(); }

  render() { return html`<slot><k-icon name="skip_previous"></k-icon></slot><slot name="menu-text">Previous track</slot>`; }
}

customElements.define('kc-audio-previous', AudioPrevious);
