import t from"./Control.js";import{css as e,html as i}from"../../lit-all.min.js";export default class s extends t{connectedCallback(){super.connectedCallback(),this.hasAttribute("role")||this.setAttribute("role","button"),this.hasAttribute("tabindex")||(this.tabIndex=this.disabled?-1:0),this.setAttribute("aria-disabled",String(!!this.disabled)),this.addEventListener("click",this.handleClick),this.addEventListener("keydown",this.handleKeyDown)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("click",this.handleClick),this.removeEventListener("keydown",this.handleKeyDown)}updated(t){super.updated(t),t.has("disabled")&&(this.tabIndex=this.disabled?-1:0,this.setAttribute("aria-disabled",String(this.disabled)))}handleAction(){}handleClick=t=>{this.disabled?t.stopImmediatePropagation():this.handleAction()};handleKeyDown=t=>{this.disabled||"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this.click())};render(){return i`<slot></slot>`}static styles=[t.styles,e`
      :host {
        align-items: center;
        justify-content: center;
        min-width: var(--control_height, 40px);
        min-height: 0;
        background: transparent;
        border: 1px solid var(--c_border);
        border-radius: var(--radius);
        margin: var(--spacer_q);
        padding: var(--spacer_h);
        color: inherit;
        cursor: pointer;
        outline: none;
        font-size: inherit;
        user-select: none;
        transition: background-color var(--animation_ms), box-shadow var(--animation_ms);
      }
      :host(:not([disabled]):hover) {
        background: oklch(from var(--c_bg__inv) l c h / 0.15);
      }
      :host(:not([disabled]):focus),
      :host(:not([disabled]):focus-visible) {
        box-shadow: var(--focus_shadow);
        z-index: 1;
      }
      :host([disabled]) {
        cursor: default;
      }
      :host([active]) {
        background: oklch(from var(--c_primary) l c h / 0.18);
      }
      :host([in-menu]) {
        justify-content: flex-start;
        text-align: left;
        white-space: nowrap;
      }
    `]}customElements.define("kc-button",s);