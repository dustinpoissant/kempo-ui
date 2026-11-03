import e from"./Control.js";import{html as t,css as a}from"../../lit-all.min.js";export default class s extends e{static hostEvents=["page-change"];handleChange=e=>{const t=this.host;if(!t)return;const a=parseInt(e.target.value,10);isNaN(a)||(t.page=Math.min(Math.max(a,1),t.totalPages)),e.target.value=String(t.page)};render(){const e=this.host;return t`
      <div class="field">
        <input
          type="number"
          min="1"
          max=${e?.totalPages??1}
          .value=${String(e?.page??1)}
          title="Go to page"
          aria-label="Go to page"
          @change=${this.handleChange}
        />
      </div>
      <slot name="menu-text">Go to page</slot>
    `}static styles=[e.styles,a`
      .field { display: flex; flex: 0 0 auto; width: 5rem; align-self: stretch; }
      input { padding: 0 var(--spacer_h, 0.5rem); }
      :host([in-menu]) { gap: var(--spacer_h, 0.5rem); }
      :host([in-menu]) .field { width: 4.5rem; align-self: center; }
      :host([in-menu]) slot[name="menu-text"] { white-space: nowrap; }
    `]}customElements.define("kc-pg-goto-page",s);