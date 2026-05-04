import PaginationControl from './PaginationControl.js';
import { html, css } from '../../lit-all.min.js';

export default class PaginationGotoPage extends PaginationControl {
  /*
    Event Handlers
  */
  handleChange = (e) => {
    this.pagination?.setPage(parseInt(e.target.value, 10));
  };

  /*
    Rendering
  */
  render() {
    const pg = this.pagination;
    const current = pg?.currentPage ?? 1;
    const total = pg?.totalPages ?? 1;
    return html`
      <select @change=${this.handleChange}>
        ${Array.from({ length: total }, (_, i) => html`
          <option value=${i + 1} ?selected=${i + 1 === current}>${i + 1}</option>
        `)}
      </select>
    `;
  }

  static styles = [
    PaginationControl.styles,
    css`
      select {
        font: inherit;
      }
    `
  ];
}

customElements.define('k-pg-goto-page', PaginationGotoPage);
