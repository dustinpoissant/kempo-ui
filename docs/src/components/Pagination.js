import{html as t,css as e,nothing as s}from"../lit-all.min.js";import a from"./ShadowComponent.js";import{bound as i,closest as r}from"../utils/number.js";import{commaSeparatedArray as o}from"../utils/propConverters.js";export default class l extends a{static properties={page:{type:Number,reflect:!0,attribute:"page"},totalItems:{type:Number,reflect:!0,attribute:"total-items"},itemsPerPage:{type:Number,reflect:!0,attribute:"items-per-page"},controls:{type:String,reflect:!0},pageSizes:{converter:o(t=>{const e=parseInt(t);return isNaN(e)?null:e},[5,10,25,50,100]),reflect:!0,attribute:"page-sizes"}};constructor(){super(),this.page=1,this.totalItems=0,this.itemsPerPage=10,this.pageSizes=[5,10,25,50,100],this.controls=""}loadControls(){const t=this.constructor.controlModules[this.controls];if(!t?.length)return;const e=this.constructor.loadedModules,s=new URL("./paginationControls/",import.meta.url).href;t.filter(t=>!e.has(t)).forEach(t=>{e.add(t),import(`${s}${t}.js`)})}willUpdate(t){t.forEach((t,e)=>{const s=this[e];switch(e){case"pageSizes":void 0===s?this.pageSizes=[5,10,25,50,100]:this.itemsPerPage=r(this.itemsPerPage,this.pageSizes);break;case"itemsPerPage":void 0===s?this.itemsPerPage=this.pageSizes?.[0]||10:(this.itemsPerPage=r(this.itemsPerPage,this.pageSizes),void 0!==t&&(this.page=Math.ceil(((this.page-1)*t+1)/this.itemsPerPage)));break;case"totalItems":if(void 0===s)this.totalItems=0;else{const t=Math.max(1,Math.ceil(this.totalItems/this.itemsPerPage));this.page>t&&(this.page=t)}break;case"page":if(void 0===s)this.page=1;else{const t=i(this.page,1,this.totalPages);t!==this.page&&(this.page=t)}break;case"controls":void 0===s&&(this.controls="")}})}updated(t){super.updated(t);(t.has("page")&&void 0!==t.get("page")||t.has("itemsPerPage")&&void 0!==t.get("itemsPerPage"))&&this.dispatchEvent(new CustomEvent("page-change",{detail:{currentPage:this.page,totalPages:this.totalPages,itemsPerPage:this.itemsPerPage,totalItems:this.totalItems},bubbles:!0})),t.has("controls")&&this.controls&&"none"!==this.controls&&this.loadControls()}get totalPages(){return this.totalItems&&this.itemsPerPage?Math.ceil(this.totalItems/this.itemsPerPage):1}nextPage(){this.page=i(this.page+1,1,this.totalPages)}previousPage(){this.page=i(this.page-1,1,this.totalPages)}render(){const e=this.constructor.controlSets[this.controls];return t`
      <div id="controls" aria-label="Pagination">
        <div class="left">
          <slot>${e?.left??s}</slot>
        </div>
        <div class="right">
          <slot name="right">${e?.right??s}</slot>
        </div>
			</div>
    `}static styles=e`
    :host {
      display: block;
    }
    #controls {
      display: flex;
      align-items: center;
      gap: var(--spacer_q, 0.25rem);
      flex-wrap: wrap;
    }
    .left {
      display: flex;
      align-items: center;
      gap: var(--spacer_q, 0.25rem);
      flex-wrap: wrap;
    }
    .right {
      display: flex;
      align-items: center;
      gap: var(--spacer_q, 0.25rem);
      flex-wrap: wrap;
      margin-left: auto;
    }
  `;static loadedModules=new Set;static controlModules={simple:["PrevPage","NextPage","PageInfo"],full:["FirstPage","PrevPage","GotoPage","NextPage","LastPage","ItemsPerPage"]};static controlSets={"":{left:null,right:null},none:{left:null,right:null},simple:{left:t`
        <k-pg-prev></k-pg-prev>
        <k-pg-page-info></k-pg-page-info>
        <k-pg-next></k-pg-next>
      `,right:null},full:{left:t`
        <k-pg-first></k-pg-first>
        <k-pg-prev></k-pg-prev>
        <k-pg-goto-page></k-pg-goto-page>
        <k-pg-next></k-pg-next>
        <k-pg-last></k-pg-last>
      `,right:t`<k-pg-items-per-page></k-pg-items-per-page>`}}}window.customElements.define("k-pagination",l);