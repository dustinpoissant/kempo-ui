import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class FormatCode extends ButtonControl {
  static requires = ['formatCode'];
  static hostMode = 'code';

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Format Code';
  }

  handleAction() { this.invokeHost('formatCode'); }

  render() { return html`<slot><k-icon name="frame_source"></k-icon></slot>`; }
}

customElements.define('kc-format-code', FormatCode);
