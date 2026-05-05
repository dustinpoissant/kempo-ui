import t from"./PaginationControl.js";import{html as e,css as a}from"../../lit-all.min.js";export default class n extends t{handleChange=t=>{this.pagination&&(this.pagination.page=parseInt(t.target.value,10))};render(){const t=this.pagination,a=t?.page??1,n=t?.totalPages??1;return e`
      <select @change=${this.handleChange}>
        ${Array.from({length:n},(t,n)=>e`
          <option value=${n+1} ?selected=${n+1===a}>${n+1}</option>
        `)}
      </select>
    `}static styles=[t.styles,a`
      select {
        font: inherit;
      }
    `]}customElements.define("k-pg-goto-page",n);