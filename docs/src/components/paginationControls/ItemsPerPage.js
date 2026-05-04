import e from"./PaginationControl.js";import{html as t,css as s}from"../../lit-all.min.js";const i=[5,10,25,50,100];export default class a extends e{static properties={...e.properties,options:{converter:{fromAttribute:e=>e?e.split(",").map(e=>parseInt(e.trim(),10)).filter(e=>!isNaN(e)):i,toAttribute:e=>e.join(",")},reflect:!0}};constructor(){super(),this.options=i}handleChange=e=>{const t=this.pagination;t&&(t.itemsPerPage=parseInt(e.target.value,10))};render(){const e=this.pagination,s=e?.itemsPerPage??10;return t`
      <label>
        Items per page:
        <select @change=${this.handleChange}>
          ${this.options.map(e=>t`<option value=${e} ?selected=${e===s}>${e}</option>`)}
        </select>
      </label>
    `}static styles=[e.styles,s`
      label {
        display: inline-flex;
        align-items: center;
        gap: var(--spacer_q, 0.25rem);
        white-space: nowrap;
      }
    `]}customElements.define("k-pg-items-per-page",a);