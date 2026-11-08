import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class PbDuplicate extends ButtonControl {
  static requires = ['duplicateSelection'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Duplicate (Ctrl+D)';
  }

  handleAction() { this.host?.duplicateSelection?.(); }

  render() { return html`<slot><k-icon name="content_copy"></k-icon></slot><slot name="menu-text">Duplicate</slot>`; }
}

customElements.define('kc-pb-duplicate', PbDuplicate);
