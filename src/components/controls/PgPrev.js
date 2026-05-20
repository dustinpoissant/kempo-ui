import ButtonControl from './Button.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class PgPrev extends ButtonControl {
  static hostEvents = ['page-change'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Previous Page';
    if(!this.hasAttribute('aria-label')) this.setAttribute('aria-label', 'Previous Page');
  }

  willUpdate(changed) {
    super.willUpdate(changed);
    const host = this.host;
    this.disabled = !host || host.page <= 1;
  }

  handleAction() { this.host?.previousPage(); }

  render() { return html`<slot><k-icon name="chevron" direction="left"></k-icon></slot>`; }
}

customElements.define('kc-pg-prev', PgPrev);
