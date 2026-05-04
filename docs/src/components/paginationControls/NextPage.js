import t from"./PaginationControl.js";import{html as e}from"../../lit-all.min.js";import"../Icon.js";export default class n extends t{render(){const t=this.pagination,n=!t||t.currentPage>=t.totalPages;return e`
      <button
        type="button"
        title="Next Page"
        aria-label="Next Page"
        ?disabled=${n}
        @click=${()=>t?.nextPage()}
      >
        <k-icon name="chevron"></k-icon>
      </button>
    `}}customElements.define("k-pg-next",n);