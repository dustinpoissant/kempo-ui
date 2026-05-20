import ButtonControl from './Button.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class CopyCode extends ButtonControl {
  static requires = ['copyToClipboard'];
  static hostMode = 'code';

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Copy Code';
  }

  handleAction() { this.invokeHost('copyToClipboard'); }

  render() { return html`<slot><k-icon name="content_copy"></k-icon></slot>`; }
}

customElements.define('kc-copy-code', CopyCode);
