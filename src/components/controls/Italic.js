import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class Italic extends ButtonControl {
  static requires = ['italic'];
  static hostMode = ['visual', 'write'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Italic';
  }

  handleAction() { this.host?.italic?.(); }

  render() { return html`<slot><k-icon name="format_italic"></k-icon></slot>`; }
}

customElements.define('kc-italic', Italic);
