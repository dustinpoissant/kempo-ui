import PaginationControl from './PaginationControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class PaginationFirstPage extends PaginationControl {
  render() {
    const pg = this.pagination;
    const disabled = !pg || pg.page <= 1;
    return html`
      <button
        type="button"
        title="First Page"
        aria-label="First Page"
        ?disabled=${disabled}
        @click=${() => pg?.setPage(1)}
      >
        <k-icon name="chevron-line" direction="left"></k-icon>
      </button>
    `;
  }
}

customElements.define('k-pg-first', PaginationFirstPage);
