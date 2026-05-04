import PaginationControl from './PaginationControl.js';
import { html, css } from '../../lit-all.min.js';

const OPTIONS = [10, 25, 50, 100];

export default class PaginationItemsPerPage extends PaginationControl {
  /*
    Event Handlers
  */
  handleChange = (e) => {
    const pg = this.pagination;
    if(!pg) return;
    pg.itemsPerPage = parseInt(e.target.value, 10);
  };

  /*
    Rendering
  */
  render() {
    const pg = this.pagination;
    const current = pg?.itemsPerPage ?? 10;
    return html`
      <label>
        Items per page:
        <select @change=${this.handleChange}>
          ${OPTIONS.map(n => html`<option value=${n} ?selected=${n === current}>${n}</option>`)}
        </select>
      </label>
    `;
  }

  static styles = [
    PaginationControl.styles,
    css`
      label {
        display: inline-flex;
        align-items: center;
        gap: var(--spacer_q, 0.25rem);
        white-space: nowrap;
      }
    `
  ];
}

customElements.define('k-pg-items-per-page', PaginationItemsPerPage);
