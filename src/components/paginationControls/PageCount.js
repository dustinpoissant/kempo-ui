import PaginationControl from './PaginationControl.js';
import { html } from '../../lit-all.min.js';

export default class PaginationPageCount extends PaginationControl {
  render() {
    return html`<span>${this.pagination?.totalPages ?? 1}</span>`;
  }
}

customElements.define('k-pg-count', PaginationPageCount);
