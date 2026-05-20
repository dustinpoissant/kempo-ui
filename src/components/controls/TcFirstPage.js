import ButtonControl from './Button.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class TcFirstPage extends ButtonControl {
  static hostEvents = ['pageChange'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'First Page';
  }

  willUpdate(changed) {
    super.willUpdate(changed);
    const host = this.host;
    this.disabled = !host || host.getCurrentPage() === 1;
  }

  handleAction() { this.host?.firstPage(); }

  render() { return html`<slot><k-icon name="chevron-line" direction="left"></k-icon></slot>`; }
}

customElements.define('kc-tc-first-page', TcFirstPage);
