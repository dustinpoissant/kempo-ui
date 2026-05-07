import e from"./PaginationControl.js";import{html as t,css as a}from"../../lit-all.min.js";export default class s extends e{handleChange=e=>{const t=this.pagination;t&&(t.itemsPerPage=parseInt(e.target.value,10))};render(){const e=this.pagination,a=e?.itemsPerPage??10,s=e?.pageSizes??[5,10,25,50,100];return t`
      <label>
        <slot>Items per page:</slot>
        <select @change=${this.handleChange}>
          ${s.map(e=>t`<option value=${e} ?selected=${e===a}>${e}</option>`)}
        </select>
      </label>
    `}static styles=[e.styles,a`
      :host {
        align-items: center;
      }
      label {
        display: inline-flex;
        align-items: center;
        gap: var(--spacer_q, 0.25rem);
        padding: 0;
        white-space: nowrap;
      }
      select {
        min-height: 2.5rem;
        box-sizing: border-box;
      }
    `]}customElements.define("k-pg-items-per-page",s);