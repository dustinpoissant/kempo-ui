import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class FontSizeDecrease extends ButtonControl {
  static requires = ['decreaseFontSize'];
  static hostMode = 'code';

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Decrease Font Size';
  }

  handleAction() { this.invokeHost('decreaseFontSize'); }

  render() { return html`<slot><k-icon name="text_decrease"></k-icon></slot>`; }
}

customElements.define('kc-font-size-decrease', FontSizeDecrease);
