import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class PbMoveUp extends ButtonControl {
  static requires = ['moveUp'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Move up (Alt+Shift+Up)';
  }

  handleAction() { this.host?.moveUp?.(); }

  render() { return html`<slot><k-icon name="arrow" direction="up"></k-icon></slot><slot name="menu-text">Move Up</slot>`; }
}

customElements.define('kc-pb-move-up', PbMoveUp);
