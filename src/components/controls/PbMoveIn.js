import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class PbMoveIn extends ButtonControl {
  static requires = ['moveInto'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Move into the widget before it (Alt+Shift+Right)';
  }

  handleAction() { this.host?.moveInto?.(); }

  render() { return html`<slot><k-icon name="arrow" direction="right"></k-icon></slot><slot name="menu-text">Move Into Widget</slot>`; }
}

customElements.define('kc-pb-move-in', PbMoveIn);
