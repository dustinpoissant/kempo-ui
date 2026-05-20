import ButtonControl from './Button.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class InlineCode extends ButtonControl {
  static requires = ['inlineCode'];
  static hostMode = ['visual', 'write'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Inline Code';
  }

  handleAction() { this.invokeHost('inlineCode'); }

  render() { return html`<slot><k-icon name="code_blocks"></k-icon></slot>`; }
}

customElements.define('kc-inline-code', InlineCode);
