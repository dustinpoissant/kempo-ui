import e from"./PaginationControl.js";import{html as t,css as a}from"../../lit-all.min.js";export default class n extends e{handleChange=e=>{this.pagination?.setPage(parseInt(e.target.value,10))};render(){const e=this.pagination,a=e?.page??1,n=e?.totalPages??1;return t`
      <select @change=${this.handleChange}>
        ${Array.from({length:n},(e,n)=>t`
          <option value=${n+1} ?selected=${n+1===a}>${n+1}</option>
        `)}
      </select>
    `}static styles=[e.styles,a`
      select {
        font: inherit;
      }
    `]}customElements.define("k-pg-goto-page",n);