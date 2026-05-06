import t from"../Button.js";import{css as e}from"../../lit-all.min.js";export default class n extends t{connectedCallback(){super.connectedCallback(),this.addEventListener("click",this.handleActionClick);const t=this.pagination;t&&(this.boundPagination=t,this.pageChangeHandler=()=>this.requestUpdate(),t.addEventListener("page-change",this.pageChangeHandler),this.attrObserver=new MutationObserver(()=>this.requestUpdate()),this.attrObserver.observe(t,{attributes:!0,attributeFilter:["total-items","items-per-page","page-sizes"]}))}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("click",this.handleActionClick),this.boundPagination&&this.pageChangeHandler&&this.boundPagination.removeEventListener("page-change",this.pageChangeHandler),this.attrObserver?.disconnect(),this.boundPagination=null,this.pageChangeHandler=null,this.attrObserver=null}get pagination(){return this.closest("k-pagination")||(this.getRootNode()instanceof ShadowRoot?this.getRootNode().host:null)}handleAction(){}handleActionClick=()=>this.handleAction();static styles=[t.styles,e`
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
    `]}