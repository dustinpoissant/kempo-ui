import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class FontSizeIncrease extends ButtonControl {
  static requires = ['increaseFontSize'];
  static hostMode = 'code';

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Increase Font Size';
  }

  handleAction() { this.host?.increaseFontSize?.(); }

  render() { return html`<slot><k-icon name="text_increase"></k-icon></slot>`; }
}

customElements.define('kc-font-size-increase', FontSizeIncrease);
