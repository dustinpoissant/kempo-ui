import PaginationControl from './PaginationControl.js';
import { html, css } from '../../lit-all.min.js';

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
    const options = pg?.pageSizes ?? [5, 10, 25, 50, 100];
    return html`
      <label>
        <slot>Items per page:</slot>
        <select @change=${this.handleChange}>
          ${options.map(n => html`<option value=${n} ?selected=${n === current}>${n}</option>`)}
        </select>
      </label>
    `;
  }

  static styles = [
    PaginationControl.styles,
    css`
      :host {
        align-items: center;
      }
      label {
        display: inline-flex;
        align-items: center;
        gap: var(--spacer_q, 0.25rem);
        padding: 0;
        white-space: nowrap;
      }
      select {
        min-height: 2.5rem;
        box-sizing: border-box;
      }
    `
  ];
}

customElements.define('k-pg-items-per-page', PaginationItemsPerPage);
