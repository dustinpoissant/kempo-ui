import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class Redo extends ButtonControl {
  static requires = ['redo'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Redo';
  }

  handleAction() { this.host?.redo?.(); }

  render() { return html`<slot><k-icon name="redo"></k-icon></slot>`; }
}

customElements.define('kc-redo', Redo);
