import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class PbMoveDown extends ButtonControl {
  static requires = ['moveDown'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Move down (Alt+Shift+Down)';
  }

  handleAction() { this.host?.moveDown?.(); }

  render() { return html`<slot><k-icon name="arrow" direction="down"></k-icon></slot><slot name="menu-text">Move Down</slot>`; }
}

customElements.define('kc-pb-move-down', PbMoveDown);
