import PaginationControl from './PaginationControl.js';
import { html, css } from '../../lit-all.min.js';
import '../Combobox.js';

export default class PaginationGotoPage extends PaginationControl {
  /*
    Event Handlers
  */
  handleInput = (e) => {
    const cb = e.target;
    if(this.pagination && cb.value) {
      const page = parseInt(cb.value, 10);
      if(!isNaN(page) && page > 0) this.pagination.page = page;
    }
  };

  handleBlur = (e) => {
    const pg = this.pagination;
    if(pg) {
      e.target.value = String(pg.page);
    }
  };

  /*
    Rendering
  */
  render() {
    const pg = this.pagination;
    const current = pg?.page ?? 1;
    const total = pg?.totalPages ?? 1;
    return html`
      <k-combobox
        .value=${String(current)}
        @input=${this.handleInput}
        @blur=${this.handleBlur}
        placeholder="page"
				no-results-message="Invalid Page"
      >
        ${Array.from({ length: total }, (_, i) => html`
          <k-option value=${i + 1}>${i + 1}</k-option>
        `)}
      </k-combobox>
    `;
  }

  static styles = [
    PaginationControl.styles,
    css`
      k-combobox {
        width: 5rem;
      }
    `
  ];
}

customElements.define('k-pg-goto-page', PaginationGotoPage);
