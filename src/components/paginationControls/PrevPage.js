import PaginationButtonControl from './PaginationButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class PaginationPrevPage extends PaginationButtonControl {
  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('aria-label')) this.setAttribute('aria-label', 'Previous Page');
    if(!this.hasAttribute('title')) this.setAttribute('title', 'Previous Page');
  }

  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    const pg = this.pagination;
    this.disabled = !pg || pg.page <= 1;
  }

  handleAction() { this.pagination?.previousPage(); }

  render() {
    return html`<k-icon name="chevron" direction="left"></k-icon>`;
  }
}

customElements.define('k-pg-prev', PaginationPrevPage);

