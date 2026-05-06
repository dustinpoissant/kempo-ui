import PaginationButtonControl from './PaginationButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class PaginationLastPage extends PaginationButtonControl {
  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('aria-label')) this.setAttribute('aria-label', 'Last Page');
    if(!this.hasAttribute('title')) this.setAttribute('title', 'Last Page');
  }

  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    const pg = this.pagination;
    this.disabled = !pg || pg.page >= pg.totalPages;
  }

  handleAction() { if(this.pagination) this.pagination.page = this.pagination.totalPages; }

  render() {
    return html`<k-icon name="chevron-line"></k-icon>`;
  }
}

customElements.define('k-pg-last', PaginationLastPage);

