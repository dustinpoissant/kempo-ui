import Button from '../Button.js';
import { css } from '../../lit-all.min.js';

export default class PaginationButtonControl extends Button {
  /*
    Lifecycle Callbacks
  */
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this.handleActionClick);
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
    this.removeEventListener('click', this.handleActionClick);
    if(this.boundPagination && this.pageChangeHandler) {
      this.boundPagination.removeEventListener('page-change', this.pageChangeHandler);
    }
    this.attrObserver?.disconnect();
    this.boundPagination = null;
    this.pageChangeHandler = null;
    this.attrObserver = null;
  }

  /*
    Protected Members
  */
  get pagination() {
    return this.closest('k-pagination')
      || (this.getRootNode() instanceof ShadowRoot ? this.getRootNode().host : null);
  }

  /*
    Public Methods
  */
  handleAction() {}

  /*
    Event Handlers
  */
  handleActionClick = () => this.handleAction();

  /*
    Rendering
  */
  static styles = [
    Button.styles,
    css`
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
				background: transparent;
				border: 1px solid var(--c_border);
				padding: var(--spacer_h);
				color: inherit;
      }
			:host(:not([disabled]):hover) {
				background: oklch(from var(--c_bg__inv) l c h / 0.2);
				color: inherit;
			}
			:host(:not([disabled]):focus),
			:host(:not([disabled]):focus-visible) {
				box-shadow: var(--focus_shadow);
				z-index: 1;
			}
    `
  ];
}
