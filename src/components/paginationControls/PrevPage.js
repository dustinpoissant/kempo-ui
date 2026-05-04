import PaginationControl from './PaginationControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class PaginationPrevPage extends PaginationControl {
  render() {
    const pg = this.pagination;
    const disabled = !pg || pg.page <= 1;
    return html`
      <button
        type="button"
        title="Previous Page"
        aria-label="Previous Page"
        ?disabled=${disabled}
        @click=${() => pg?.previousPage()}
      >
        <k-icon name="chevron" direction="left"></k-icon>
      </button>
    `;
  }
}

customElements.define('k-pg-prev', PaginationPrevPage);
