import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class PbShortcuts extends ButtonControl {
  static requires = ['openShortcuts'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Keyboard shortcuts';
  }

  handleAction() { this.host?.openShortcuts?.(); }

  render() { return html`<slot><k-icon name="keyboard"></k-icon></slot><slot name="menu-text">Keyboard shortcuts</slot>`; }
}

customElements.define('kc-pb-shortcuts', PbShortcuts);
