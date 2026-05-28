import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class AlignLeft extends ButtonControl {
  static requires = ['alignLeft'];
  static hostMode = 'visual';

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Align Left';
  }

  handleAction() { this.invokeHost('alignLeft'); }

  render() { return html`<slot><k-icon name="format_align_left"></k-icon></slot>`; }
}

customElements.define('kc-align-left', AlignLeft);
