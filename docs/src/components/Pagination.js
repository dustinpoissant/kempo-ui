import{html as t,css as e,nothing as s}from"../lit-all.min.js";import a from"./ShadowComponent.js";const i=Symbol(),o=Symbol();export default class r extends a{static properties={totalItems:{type:Number,reflect:!0,attribute:"total-items"},itemsPerPage:{type:Number,reflect:!0,attribute:"items-per-page"},controls:{type:String,reflect:!0}};constructor(){super(),this[i]=1,this[o]=!1,this.totalItems=0,this.itemsPerPage=10,this.controls=""}async loadControls(){if(this[o])return;this[o]=!0;const t=new URL("./paginationControls/",import.meta.url).href;await Promise.all([import(`${t}PrevPage.js`),import(`${t}NextPage.js`),import(`${t}FirstPage.js`),import(`${t}LastPage.js`),import(`${t}PageInfo.js`),import(`${t}ItemsPerPage.js`),import(`${t}GotoPage.js`),import(`${t}PageCount.js`)]),this.requestUpdate()}willUpdate(t){if(t.has("itemsPerPage"))this[i]=1;else if(t.has("totalItems")){const t=Math.max(1,Math.ceil(this.totalItems/this.itemsPerPage));this[i]>t&&(this[i]=t)}}updated(t){super.updated(t),t.has("itemsPerPage")&&this.dispatchEvent(new CustomEvent("page-change",{detail:{currentPage:this[i],totalPages:this.totalPages,itemsPerPage:this.itemsPerPage,totalItems:this.totalItems},bubbles:!0})),t.has("controls")&&this.controls&&"none"!==this.controls&&this.loadControls()}get currentPage(){return this[i]}get totalPages(){return this.totalItems&&this.itemsPerPage?Math.ceil(this.totalItems/this.itemsPerPage):1}setPage(t){const e=Math.max(1,Math.min(t,this.totalPages));e!==this[i]&&(this[i]=e,this.requestUpdate(),this.dispatchEvent(new CustomEvent("page-change",{detail:{currentPage:this[i],totalPages:this.totalPages,itemsPerPage:this.itemsPerPage,totalItems:this.totalItems},bubbles:!0})))}nextPage(){this.setPage(this[i]+1)}previousPage(){this.setPage(this[i]-1)}render(){const e=this.constructor.controlSets[this.controls]??this.constructor.controlSets[""];return t`
      <nav aria-label="Pagination">
        <slot>${e??s}</slot>
      </nav>
    `}static styles=e`
    :host {
      display: block;
    }
    nav {
      display: flex;
      align-items: center;
      gap: var(--spacer_q, 0.25rem);
      flex-wrap: wrap;
    }
  `;static controlSets={"":null,none:null,simple:t`
      <k-pg-prev></k-pg-prev>
      <k-pg-page-info></k-pg-page-info>
      <k-pg-next></k-pg-next>
    `,full:t`
      <k-pg-first></k-pg-first>
      <k-pg-prev></k-pg-prev>
      <k-pg-goto-page></k-pg-goto-page>
      <k-pg-next></k-pg-next>
      <k-pg-last></k-pg-last>
      <k-pg-items-per-page></k-pg-items-per-page>
    `}}window.customElements.define("k-pagination",r);