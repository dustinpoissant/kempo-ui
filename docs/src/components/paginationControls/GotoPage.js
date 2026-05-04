import e from"./PaginationControl.js";import{html as t,css as n}from"../../lit-all.min.js";export default class a extends e{handleChange=e=>{this.pagination?.setPage(parseInt(e.target.value,10))};render(){const e=this.pagination,n=e?.currentPage??1,a=e?.totalPages??1;return t`
      <select @change=${this.handleChange}>
        ${Array.from({length:a},(e,a)=>t`
          <option value=${a+1} ?selected=${a+1===n}>${a+1}</option>
        `)}
      </select>
    `}static styles=[e.styles,n`
      select {
        font: inherit;
      }
    `]}customElements.define("k-pg-goto-page",a);