import e from"./Control.js";import{css as t,html as o}from"../../lit-all.min.js";import"../Dropdown.js";import"../Icon.js";export default class n extends e{static properties={...e.properties,opened:{type:Boolean,reflect:!0}};constructor(){super(),this.opened=!1}updateHostSupport(){}handleToggle=()=>{this.opened=!this.opened};handleOpened=()=>{this.opened=!0};handleClosed=()=>{this.opened=!1};handleItems=t=>t.target.assignedElements().forEach(t=>{t instanceof e&&t.setAttribute("in-menu","")});render(){return o`
      <k-dropdown
        ?opened=${this.opened}
        @opened=${this.handleOpened}
        @closed=${this.handleClosed}
      >
        <button slot="trigger" class="no-btn icon-btn">
          <slot name="icon"><k-icon name="arrow_drop_down"></k-icon></slot>
          <slot name="label"></slot>
        </button>
        <slot @slotchange=${this.handleItems}></slot>
      </k-dropdown>
    `}static styles=[e.styles,t`
      :host {
        border: 1px solid var(--c_border);
        border-radius: var(--radius);
        margin: var(--spacer_q);
      }

      k-dropdown {
        display: inline-flex;
      }

      button[slot="trigger"] {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        min-width: calc(var(--control_height, 40px) - 2px);
        min-height: calc(var(--control_height, 40px) - 2px);
        padding: 0 0.75rem;
        background: transparent;
        border: none;
        color: inherit;
        cursor: pointer;
        font-size: inherit;
      }

      /* Slotted menu items: remove individual borders/radii so the menu
         reads as a single unified surface. */
      ::slotted(:not([slot="icon"]):not([slot="label"]):not([in-menu])) {
        display: block !important;
      }
      ::slotted([in-menu]) {
        display: flex !important;
      }
      ::slotted(:not([slot="icon"]):not([slot="label"])) {
        margin: 0 !important;
        border: none !important;
        border-radius: 0 !important;
        border-bottom: 1px solid var(--c_border) !important;
      }
      ::slotted(:not([slot="icon"]):not([slot="label"]):last-child) {
        border-bottom: none !important;
      }
    `]}customElements.define("kc-menu",n);