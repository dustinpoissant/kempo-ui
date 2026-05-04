import PaginationControl from './PaginationControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class PaginationNextPage extends PaginationControl {
  render() {
    const pg = this.pagination;
    const disabled = !pg || pg.currentPage >= pg.totalPages;
    return html`
      <button
        type="button"
        title="Next Page"
        aria-label="Next Page"
        ?disabled=${disabled}
        @click=${() => pg?.nextPage()}
      >
        <k-icon name="chevron"></k-icon>
      </button>
    `;
  }
}

customElements.define('k-pg-next', PaginationNextPage);
