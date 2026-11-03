import t from"./Control.js";import{html as e,css as r,nothing as o}from"../../lit-all.min.js";export default class a extends t{static properties={...t.properties,href:{type:String,reflect:!0},target:{type:String,reflect:!0}};constructor(){super(),this.href="",this.target=""}updateHostSupport(){}render(){return e`
      <a
        href=${this.href||o}
        target=${this.target||o}
        rel=${"_blank"===this.target?"noopener":o}
        aria-label=${this.title||o}
      ><slot></slot><slot name="menu-text">${this.title}</slot></a>
    `}static styles=[t.styles,r`
      a {
        display: inline-flex;
        align-items: center;
        gap: var(--spacer_h);
        box-sizing: border-box;
        height: 100%;
        min-width: var(--control_height, 40px);
        padding: 0 var(--spacer_h);
        justify-content: center;
        color: var(--tc_link);
        text-decoration: none;
        border-radius: var(--radius);
        outline: none;
        white-space: nowrap;
      }
      a:hover {
        background: oklch(from currentColor l c h / 0.15);
        color: var(--tc_link);
      }
      a:focus-visible {
        box-shadow: var(--focus_shadow);
      }
      :host([in-menu]) {
        padding: 0;
      }
      :host([in-menu]) a {
        width: 100%;
        height: auto;
        min-height: 2rem;
        justify-content: flex-start;
        padding: var(--spacer_h) var(--spacer);
        border-radius: 0;
        color: var(--tc);
      }
      :host([in-menu]) a:hover {
        color: var(--tc);
      }
    `]}customElements.define("kc-nav-link",a);