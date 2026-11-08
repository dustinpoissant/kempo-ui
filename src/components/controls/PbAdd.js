import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class PbAdd extends ButtonControl {
  static requires = ['openInserter'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Add a widget (Ctrl+K)';
  }

  handleAction() { this.host?.openInserter?.(); }

  render() { return html`<slot><k-icon name="add"></k-icon></slot><slot name="menu-text">Add a widget</slot>`; }
}

customElements.define('kc-pb-add', PbAdd);
