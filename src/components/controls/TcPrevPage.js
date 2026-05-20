import ButtonControl from './Button.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class TcPrevPage extends ButtonControl {
  static hostEvents = ['pageChange'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Previous Page';
  }

  willUpdate(changed) {
    super.willUpdate(changed);
    const host = this.host;
    this.disabled = !host || host.getCurrentPage() === 1;
  }

  handleAction() { this.host?.prevPage(); }

  render() { return html`<slot><k-icon name="chevron" direction="left"></k-icon></slot>`; }
}

customElements.define('kc-tc-prev-page', TcPrevPage);
