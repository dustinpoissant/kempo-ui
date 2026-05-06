import ShadowComponent from '../ShadowComponent.js';
import { css } from '../../lit-all.min.js';

/*
  Base class for <k-pagination> control elements. Subclass and override
  render() to create custom pagination controls. The pagination component
  is located via closest('k-pagination'), or via getRootNode().host when
  rendered as slot fallback content inside the shadow root.
*/
export default class PaginationControl extends ShadowComponent {
  connectedCallback() {
    super.connectedCallback();
    const pg = this.pagination;
    if(!pg) return;
    this.boundPagination = pg;
    this.pageChangeHandler = () => this.requestUpdate();
    pg.addEventListener('page-change', this.pageChangeHandler);
    this.attrObserver = new MutationObserver(() => this.requestUpdate());
    this.attrObserver.observe(pg, { attributes: true, attributeFilter: ['total-items', 'items-per-page', 'page-sizes'] });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if(this.boundPagination && this.pageChangeHandler){
      this.boundPagination.removeEventListener('page-change', this.pageChangeHandler);
    }
    this.attrObserver?.disconnect();
    this.boundPagination = null;
    this.pageChangeHandler = null;
    this.attrObserver = null;
  }

  get pagination() {
    return this.closest('k-pagination')
      || (this.getRootNode() instanceof ShadowRoot ? this.getRootNode().host : null);
  }

  static styles = css`
    :host {
      display: inline-flex;
    }
  `;
}
