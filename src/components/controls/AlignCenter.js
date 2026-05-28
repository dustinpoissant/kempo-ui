import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class AlignCenter extends ButtonControl {
  static requires = ['alignCenter'];
  static hostMode = 'visual';

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Align Center';
  }

  handleAction() { this.host?.alignCenter?.(); }

  render() { return html`<slot><k-icon name="format_align_center"></k-icon></slot>`; }
}

customElements.define('kc-align-center', AlignCenter);
