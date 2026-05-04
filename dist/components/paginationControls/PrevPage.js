import e from"./PaginationControl.js";import{html as t}from"../../lit-all.min.js";import"../Icon.js";export default class o extends e{render(){const e=this.pagination,o=!e||e.currentPage<=1;return t`
      <button
        type="button"
        title="Previous Page"
        aria-label="Previous Page"
        ?disabled=${o}
        @click=${()=>e?.previousPage()}
      >
        <k-icon name="chevron" direction="left"></k-icon>
      </button>
    `}}customElements.define("k-pg-prev",o);