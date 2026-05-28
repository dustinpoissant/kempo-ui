import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class AlignJustify extends ButtonControl {
  static requires = ['alignJustify'];
  static hostMode = 'visual';

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Justify';
  }

  handleAction() { this.invokeHost('alignJustify'); }

  render() { return html`<slot><k-icon name="format_align_justify"></k-icon></slot>`; }
}

customElements.define('kc-align-justify', AlignJustify);
