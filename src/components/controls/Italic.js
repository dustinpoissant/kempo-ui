import ButtonControl from './Button.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class Italic extends ButtonControl {
  static requires = ['italic'];
  static hostMode = ['visual', 'write'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Italic';
  }

  handleAction() { this.invokeHost('italic'); }

  render() { return html`<slot><k-icon name="format_italic"></k-icon></slot>`; }
}

customElements.define('kc-italic', Italic);
