import e from"./PaginationControl.js";import{html as t,css as a}from"../../lit-all.min.js";export default class s extends e{render(){const e=this.pagination;return t`<span class="info">Page ${e?.currentPage??1} of ${e?.totalPages??1}</span>`}static styles=[e.styles,a`
      .info {
        padding: 0 var(--spacer_q, 0.25rem);
        white-space: nowrap;
      }
    `]}customElements.define("k-pg-page-info",s);