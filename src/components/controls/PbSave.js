import ButtonControl from './ButtonControl.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';

/* Saves the page. While there are changes that have not been saved (`dirty`), it is green, so it is clear what to press. */
export default class PbSave extends ButtonControl {
  static requires = ['save'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Save the page (Ctrl+S)';
  }

  handleAction() { this.host?.save?.(); }

  render() { return html`<slot><k-icon name="save"></k-icon></slot><slot name="menu-text">Save</slot>`; }

  static styles = [
    ...ButtonControl.styles,
    css`
      :host([dirty]) {
        background: var(--c_success);
        border-color: var(--c_success);
        color: var(--tc_on_success);
      }
      :host([dirty]:not([disabled]):hover) {
        background: var(--c_success__hover);
      }
    `
  ];
}

customElements.define('kc-pb-save', PbSave);
