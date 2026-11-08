import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class PbDelete extends ButtonControl {
  static requires = ['removeSelection'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Delete (Delete key)';
  }

  handleAction() { this.host?.removeSelection?.(); }

  render() { return html`<slot><k-icon name="delete"></k-icon></slot><slot name="menu-text">Delete</slot>`; }
}

customElements.define('kc-pb-delete', PbDelete);
