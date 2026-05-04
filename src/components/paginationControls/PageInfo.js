import PaginationControl from './PaginationControl.js';
import { html, css } from '../../lit-all.min.js';

export default class PaginationPageInfo extends PaginationControl {
  render() {
    const pg = this.pagination;
    const current = pg?.currentPage ?? 1;
    const total = pg?.totalPages ?? 1;
    return html`<span class="info">Page ${current} of ${total}</span>`;
  }

  static styles = [
    PaginationControl.styles,
    css`
      .info {
        padding: 0 var(--spacer_q, 0.25rem);
        white-space: nowrap;
      }
    `
  ];
}

customElements.define('k-pg-page-info', PaginationPageInfo);
