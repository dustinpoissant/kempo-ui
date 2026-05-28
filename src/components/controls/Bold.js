import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class Bold extends ButtonControl {
  static requires = ['bold'];
  static hostMode = ['visual', 'write'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Bold';
  }

  handleAction() { this.host?.bold?.(); }

  render() { return html`<slot><k-icon name="format_bold"></k-icon></slot>`; }
}

customElements.define('kc-bold', Bold);
