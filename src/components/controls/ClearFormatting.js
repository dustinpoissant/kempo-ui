import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class ClearFormatting extends ButtonControl {
  static requires = ['removeFormat'];
  static hostMode = 'visual';

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Clear Formatting';
  }

  handleAction() { this.host?.removeFormat?.(); }

  render() { return html`<slot><k-icon name="format_clear"></k-icon></slot>`; }
}

customElements.define('kc-clear-formatting', ClearFormatting);
