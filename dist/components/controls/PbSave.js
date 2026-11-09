import t from"./ButtonControl.js";import{html as e,css as s}from"../../lit-all.min.js";import"../Icon.js";export default class o extends t{static requires=["requestSave"];connectedCallback(){super.connectedCallback(),this.hasAttribute("title")||(this.title="Save the page (Ctrl+S)")}handleAction(){this.host?.requestSave?.()}render(){return e`<slot><k-icon name="save"></k-icon></slot><slot name="menu-text">Save</slot>`}static styles=[...t.styles,s`
      :host([dirty]) {
        background: var(--c_success);
        border-color: var(--c_success);
        color: var(--tc_on_success);
      }
      :host([dirty]:not([disabled]):hover) {
        background: var(--c_success__hover);
      }
    `]}customElements.define("kc-pb-save",o);