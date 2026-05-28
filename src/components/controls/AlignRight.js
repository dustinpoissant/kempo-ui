import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class AlignRight extends ButtonControl {
  static requires = ['alignRight'];
  static hostMode = 'visual';

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Align Right';
  }

  handleAction() { this.host?.alignRight?.(); }

  render() { return html`<slot><k-icon name="format_align_right"></k-icon></slot>`; }
}

customElements.define('kc-align-right', AlignRight);
