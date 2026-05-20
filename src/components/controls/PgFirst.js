import ButtonControl from './Button.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class PgFirst extends ButtonControl {
  static hostEvents = ['page-change'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'First Page';
    if(!this.hasAttribute('aria-label')) this.setAttribute('aria-label', 'First Page');
  }

  willUpdate(changed) {
    super.willUpdate(changed);
    const host = this.host;
    this.disabled = !host || host.page <= 1;
  }

  handleAction() {
    const host = this.host;
    if(host) host.page = 1;
  }

  render() { return html`<slot><k-icon name="chevron-line" direction="left"></k-icon></slot>`; }
}

customElements.define('kc-pg-first', PgFirst);
