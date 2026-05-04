import PaginationControl from './PaginationControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class PaginationLastPage extends PaginationControl {
  render() {
    const pg = this.pagination;
    const disabled = !pg || pg.page >= pg.totalPages;
    return html`
      <button
        type="button"
        title="Last Page"
        aria-label="Last Page"
        ?disabled=${disabled}
        @click=${() => pg?.setPage(pg.totalPages)}
      >
        <k-icon name="chevron-line"></k-icon>
      </button>
    `;
  }
}

customElements.define('k-pg-last', PaginationLastPage);
