import ButtonControl from './Button.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class TcDeleteSelected extends ButtonControl {
  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Delete Selected';
  }

  handleAction() { this.host?.deleteSelected(); }

  render() { return html`<slot><k-icon name="delete_sweep"></k-icon></slot>`; }
}

customElements.define('kc-tc-delete-selected', TcDeleteSelected);
