import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class Quote extends ButtonControl {
  static requires = ['quote'];
  static hostMode = ['visual', 'write'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Quote';
  }

  handleAction() { this.host?.quote?.(); }

  render() { return html`<slot><k-icon name="format_quote"></k-icon></slot>`; }
}

customElements.define('kc-quote', Quote);
