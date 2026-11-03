import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class AudioNext extends ButtonControl {
  static requires = ['nextTrack'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Next track';
  }

  handleAction() { this.host?.nextTrack?.(); }

  render() { return html`<slot><k-icon name="skip_next"></k-icon></slot><slot name="menu-text">Next track</slot>`; }
}

customElements.define('kc-audio-next', AudioNext);
