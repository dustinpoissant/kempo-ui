import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class BulletList extends ButtonControl {
  static requires = ['bulletList'];
  static hostMode = ['visual', 'write'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Bulleted List';
  }

  handleAction() { this.host?.bulletList?.(); }

  render() { return html`<slot><k-icon name="format_list_bulleted"></k-icon></slot>`; }
}

customElements.define('kc-bullet-list', BulletList);
