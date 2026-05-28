import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class Undo extends ButtonControl {
  static requires = ['undo'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Undo';
  }

  handleAction() { this.invokeHost('undo'); }

  render() { return html`<slot><k-icon name="undo"></k-icon></slot>`; }
}

customElements.define('kc-undo', Undo);
