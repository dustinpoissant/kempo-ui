import e from"./PaginationControl.js";import{html as t,css as a}from"../../lit-all.min.js";const s=[10,25,50,100];export default class n extends e{handleChange=e=>{const t=this.pagination;t&&(t.itemsPerPage=parseInt(e.target.value,10))};render(){const e=this.pagination,a=e?.itemsPerPage??10;return t`
      <label>
        Items per page:
        <select @change=${this.handleChange}>
          ${s.map(e=>t`<option value=${e} ?selected=${e===a}>${e}</option>`)}
        </select>
      </label>
    `}static styles=[e.styles,a`
      label {
        display: inline-flex;
        align-items: center;
        gap: var(--spacer_q, 0.25rem);
        white-space: nowrap;
      }
    `]}customElements.define("k-pg-items-per-page",n);