import t from"./PaginationControl.js";import{html as e}from"../../lit-all.min.js";import"../Icon.js";export default class i extends t{render(){const t=this.pagination,i=!t||t.currentPage<=1;return e`
      <button
        type="button"
        title="First Page"
        aria-label="First Page"
        ?disabled=${i}
        @click=${()=>t?.setPage(1)}
      >
        <k-icon name="chevron-line" direction="left"></k-icon>
      </button>
    `}}customElements.define("k-pg-first",i);