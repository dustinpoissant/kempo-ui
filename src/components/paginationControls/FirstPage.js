import PaginationButtonControl from './PaginationButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class PaginationFirstPage extends PaginationButtonControl {
  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('aria-label')) this.setAttribute('aria-label', 'First Page');
    if(!this.hasAttribute('title')) this.setAttribute('title', 'First Page');
  }

  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    const pg = this.pagination;
    this.disabled = !pg || pg.page <= 1;
  }

  handleAction() { if(this.pagination) this.pagination.page = 1; }

  render() {
    return html`<k-icon name="chevron-line" direction="left"></k-icon>`;
  }
}

customElements.define('k-pg-first', PaginationFirstPage);

