import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class NumberList extends ButtonControl {
  static requires = ['numberList'];
  static hostMode = ['visual', 'write'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Numbered List';
  }

  handleAction() { this.host?.numberList?.(); }

  render() { return html`<slot><k-icon name="format_list_numbered"></k-icon></slot>`; }
}

customElements.define('kc-number-list', NumberList);
