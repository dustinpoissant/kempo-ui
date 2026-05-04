import t from"./PaginationControl.js";import{html as e}from"../../lit-all.min.js";import"../Icon.js";export default class a extends t{render(){const t=this.pagination,a=!t||t.currentPage>=t.totalPages;return e`
      <button
        type="button"
        title="Last Page"
        aria-label="Last Page"
        ?disabled=${a}
        @click=${()=>t?.setPage(t.totalPages)}
      >
        <k-icon name="chevron-line"></k-icon>
      </button>
    `}}customElements.define("k-pg-last",a);