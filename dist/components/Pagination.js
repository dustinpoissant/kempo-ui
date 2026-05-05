import{html as t,css as e,nothing as s}from"../lit-all.min.js";import a from"./ShadowComponent.js";const i=Symbol(),o=Symbol();export default class r extends a{static properties={page:{type:Number,reflect:!0,attribute:"page"},totalItems:{type:Number,reflect:!0,attribute:"total-items"},itemsPerPage:{type:Number,reflect:!0,attribute:"items-per-page"},controls:{type:String,reflect:!0}};constructor(){super(),this.page=1,this[i]=!1,this.totalItems=0,this.itemsPerPage=10,this.controls=""}async loadControls(){if(this[i])return;this[i]=!0;const t=new URL("./paginationControls/",import.meta.url).href;await Promise.all([import(`${t}PrevPage.js`),import(`${t}NextPage.js`),import(`${t}FirstPage.js`),import(`${t}LastPage.js`),import(`${t}PageInfo.js`),import(`${t}ItemsPerPage.js`),import(`${t}GotoPage.js`),import(`${t}PageCount.js`)]),this.requestUpdate()}willUpdate(t){if(t.has("itemsPerPage")&&void 0!==t.get("itemsPerPage"))this[o]=!0,this.page=1;else if(t.has("totalItems")){const t=Math.max(1,Math.ceil(this.totalItems/this.itemsPerPage));this.page>t&&(this[o]=!0,this.page=t)}if(t.has("page")&&!this[o]){const t=Math.max(1,Math.min(this.page,this.totalPages));t!==this.page&&(this.page=t)}}updated(t){super.updated(t),t.has("page")&&void 0!==t.get("page")&&!this[o]&&this.dispatchEvent(new CustomEvent("page-change",{detail:{currentPage:this.page,totalPages:this.totalPages,itemsPerPage:this.itemsPerPage,totalItems:this.totalItems},bubbles:!0})),this[o]=!1,t.has("itemsPerPage")&&void 0!==t.get("itemsPerPage")&&this.dispatchEvent(new CustomEvent("items-per-page-change",{detail:{itemsPerPage:this.itemsPerPage,totalPages:this.totalPages,totalItems:this.totalItems},bubbles:!0})),t.has("controls")&&this.controls&&"none"!==this.controls&&this.loadControls()}get totalPages(){return this.totalItems&&this.itemsPerPage?Math.ceil(this.totalItems/this.itemsPerPage):1}nextPage(){this.page=this.page+1}previousPage(){this.page=this.page-1}render(){const e=this.constructor.controlSets[this.controls]??this.constructor.controlSets[""];return t`
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