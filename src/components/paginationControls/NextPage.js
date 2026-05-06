import PaginationButtonControl from './PaginationButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class PaginationNextPage extends PaginationButtonControl {
  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('aria-label')) this.setAttribute('aria-label', 'Next Page');
    if(!this.hasAttribute('title')) this.setAttribute('title', 'Next Page');
  }

  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    const pg = this.pagination;
    this.disabled = !pg || pg.page >= pg.totalPages;
  }

  handleAction() { this.pagination?.nextPage(); }

  render() {
    return html`<k-icon name="chevron"></k-icon>`;
  }
}

customElements.define('k-pg-next', PaginationNextPage);

