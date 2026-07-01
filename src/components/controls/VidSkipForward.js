import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class VidSkipForward extends ButtonControl {
  static requires = ['skip'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Forward 10 Seconds';
  }

  handleAction() { this.host?.skip?.(10); }

  render() { return html`<slot><k-icon name="fast_forward"></k-icon></slot>`; }
}

customElements.define('kc-vid-skip-forward', VidSkipForward);
