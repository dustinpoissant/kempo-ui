import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class PbMoveOut extends ButtonControl {
  static requires = ['moveOutOf'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Move out of its parent (Alt+Shift+Left)';
  }

  handleAction() { this.host?.moveOutOf?.(); }

  render() { return html`<slot><k-icon name="arrow" direction="left"></k-icon></slot><slot name="menu-text">Move Out of Widget</slot>`; }
}

customElements.define('kc-pb-move-out', PbMoveOut);
