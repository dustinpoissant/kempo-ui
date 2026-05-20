import ButtonControl from './Button.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class Underline extends ButtonControl {
  static requires = ['underline'];
  static hostMode = 'visual';

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Underline';
  }

  handleAction() { this.invokeHost('underline'); }

  render() { return html`<slot><k-icon name="format_underlined"></k-icon></slot>`; }
}

customElements.define('kc-underline', Underline);
