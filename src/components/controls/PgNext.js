import ButtonControl from './Button.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class PgNext extends ButtonControl {
  static hostEvents = ['page-change'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Next Page';
    if(!this.hasAttribute('aria-label')) this.setAttribute('aria-label', 'Next Page');
  }

  willUpdate(changed) {
    super.willUpdate(changed);
    const host = this.host;
    this.disabled = !host || host.page >= host.totalPages;
  }

  handleAction() { this.host?.nextPage(); }

  render() { return html`<slot><k-icon name="chevron"></k-icon></slot>`; }
}

customElements.define('kc-pg-next', PgNext);
