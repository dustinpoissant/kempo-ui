import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class PbTree extends ButtonControl {
  static requires = ['toggleTree'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Show or hide the widget tree';
  }

  handleAction() { this.host?.toggleTree?.(); }

  render() { return html`<slot><k-icon name="account_tree"></k-icon></slot><slot name="menu-text">Widget tree</slot>`; }
}

customElements.define('kc-pb-tree', PbTree);
