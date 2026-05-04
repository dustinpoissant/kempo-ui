import a from"./PaginationControl.js";import{html as e,css as s}from"../../lit-all.min.js";export default class t extends a{render(){const a=this.pagination;return e`<span class="info">Page ${a?.page??1} of ${a?.totalPages??1}</span>`}static styles=[a.styles,s`
      .info {
        padding: 0 var(--spacer_q, 0.25rem);
        white-space: nowrap;
      }
    `]}customElements.define("k-pg-page-info",t);