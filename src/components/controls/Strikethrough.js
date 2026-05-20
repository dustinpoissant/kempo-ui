import ButtonControl from './Button.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class Strikethrough extends ButtonControl {
  static requires = ['strikethrough'];
  static hostMode = ['visual', 'write'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Strikethrough';
  }

  handleAction() { this.invokeHost('strikethrough'); }

  render() { return html`<slot><k-icon name="strikethrough_s"></k-icon></slot>`; }
}

customElements.define('kc-strikethrough', Strikethrough);
