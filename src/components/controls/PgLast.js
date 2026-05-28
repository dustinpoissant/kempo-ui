import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class PgLast extends ButtonControl {
  static hostEvents = ['page-change'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Last Page';
    if(!this.hasAttribute('aria-label')) this.setAttribute('aria-label', 'Last Page');
  }

  willUpdate(changed) {
    super.willUpdate(changed);
    const host = this.host;
    this.disabled = !host || host.page >= host.totalPages;
  }

  handleAction() {
    const host = this.host;
    if(host) host.page = host.totalPages;
  }

  render() { return html`<slot><k-icon name="chevron-line"></k-icon></slot>`; }
}

customElements.define('kc-pg-last', PgLast);
