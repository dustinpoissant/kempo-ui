import t from"./PaginationControl.js";import{html as o,css as a}from"../../lit-all.min.js";import"../Combobox.js";export default class e extends t{handleInput=t=>{const o=t.target;if(this.pagination&&o.value){const t=parseInt(o.value,10);!isNaN(t)&&t>0&&(this.pagination.page=t)}};handleBlur=t=>{const o=this.pagination;o&&(t.target.value=String(o.page))};render(){const t=this.pagination,a=t?.page??1,e=t?.totalPages??1;return o`
      <k-combobox
        .value=${String(a)}
        @input=${this.handleInput}
        @blur=${this.handleBlur}
        placeholder="page"
				no-results-message="Invalid Page"
      >
        ${Array.from({length:e},(t,a)=>o`
          <k-option value=${a+1}>${a+1}</k-option>
        `)}
      </k-combobox>
    `}static styles=[t.styles,a`
      k-combobox {
        width: 5rem;
      }
    `]}customElements.define("k-pg-goto-page",e);