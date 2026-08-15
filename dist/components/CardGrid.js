import{html as e,css as t}from"../lit-all.min.js";import s from"./ShadowComponent.js";import"./Card.js";import{boolExists as i}from"../utils/propConverters.js";const r=Symbol("selected"),a=Symbol("hidden"),o=Symbol("index");export default class n extends s{static properties={enablePages:{type:Boolean,reflect:!0,converter:i,attribute:"enable-pages"},pageSize:{type:Number,reflect:!0,attribute:"page-size"},currentPage:{type:Number,reflect:!0,attribute:"current-page"},pageSizeOptions:{type:Array,attribute:"page-size-options"},enableSelection:{type:Boolean,reflect:!0,converter:i,attribute:"enable-selection"},requestDelete:{type:Boolean,reflect:!0,converter:i,attribute:"request-delete"},placeholder:{type:String,reflect:!0},filteredPlaceholder:{type:String,reflect:!0,attribute:"filtered-placeholder"},minCardWidth:{type:String,reflect:!0,attribute:"min-card-width"},records:{type:Array},cardTemplate:{attribute:!1}};constructor(e={}){super(),void 0===this.pageSize&&(this.pageSize=50),void 0===this.currentPage&&(this.currentPage=1),void 0===this.pageSizeOptions&&(this.pageSizeOptions=[10,25,50,100,500]),void 0===this.records&&(this.records=e.records||[]),void 0===this.cardTemplate&&(this.cardTemplate=e.cardTemplate||null),void 0===this.requestDelete&&(this.requestDelete=!1),void 0===this.placeholder&&(this.placeholder="No Records"),void 0===this.filteredPlaceholder&&(this.filteredPlaceholder=""),void 0===this.minCardWidth&&(this.minCardWidth="11rem")}handleSelectAllChange=e=>{e.target.checked?this.selectAllOnPage():this.deselectAllOnPage()};handleRecordSelectionChange=(e,t)=>{e[r]=!!t.target.checked,this.requestUpdate(),this.dispatchEvent(new CustomEvent("selectionChange",{bubbles:!0}))};connectedCallback(){super.connectedCallback(),this.hasAttribute("controlled")||this.setAttribute("controlled","")}firstUpdated(){this.setData({records:this.records,cardTemplate:this.cardTemplate})}childrenUpdated(){this.requestUpdate()}updated(e){if(super.updated(e),this.enableSelection){const e=this.shadowRoot.getElementById("select-all");e&&(e.checked=this.getDisplayedRecords().length>0&&this.allOnPageSelected())}}renderCardsTemplate(){let t=this.getDisplayedRecords(),s=0,i=this.pageSize;if(this.enablePages&&(s=(this.currentPage-1)*this.pageSize,i=s+this.pageSize,t=t.slice(s,i)),0===t.length){const t=this.records.length>0?this.filteredPlaceholder:this.placeholder;return t?e`<p class="placeholder">${t}</p>`:e``}return t.map(e=>this.renderCardTemplate(e))}renderCardTemplate(t){const s=this.hasBeforeControls()?this.getClonedControls("before"):[],i=this.hasAfterControls()?this.getClonedControls("after"):[],a=this.enableSelection||s.length;return e`
      <k-card class="tile" data-index=${t[o]}>
        ${a?e`
          <div class="tile-controls tile-controls-before">
            ${this.enableSelection?e`
              <input
                type="checkbox"
                class="card-select"
                .checked=${t[r]}
                @click=${e=>e.stopPropagation()}
                @change=${e=>this.handleRecordSelectionChange(t,e)}
              />
            `:""}
            ${s}
          </div>
        `:""}
        ${this.cardTemplate?this.cardTemplate(t,this):""}
        ${i.length?e`<div class="tile-controls tile-controls-after">${i}</div>`:""}
      </k-card>
    `}getClonedControls(e){const t=[];return this.querySelectorAll(`[slot="${e}"]`).forEach(e=>{const s=e.tagName.toLowerCase(),i=document.createElement(s);Array.from(e.attributes).forEach(e=>{"slot"!==e.name&&i.setAttribute(e.name,e.value)}),e.innerHTML&&(i.innerHTML=e.innerHTML),t.push(i)}),t}hasTopControls(){return!!this.querySelector('[slot="top"]')}hasBottomControls(){return!!this.querySelector(":scope > :not([slot])")}hasBeforeControls(){return!!this.querySelector('[slot="before"]')}hasAfterControls(){return!!this.querySelector('[slot="after"]')}getCurrentPage(){return this.currentPage}getTotalPages(){return Math.max(1,Math.ceil(this.getDisplayedRecords().length/this.pageSize))}setPage(e){e<1||e>this.getTotalPages()||(this.currentPage=e,this.requestUpdate(),this.dispatchEvent(new CustomEvent("pageChange",{bubbles:!0})))}firstPage(){1!==this.currentPage&&this.setPage(1)}nextPage(){this.currentPage<this.getTotalPages()&&this.setPage(this.currentPage+1)}prevPage(){this.currentPage>1&&this.setPage(this.currentPage-1)}lastPage(){this.currentPage!==this.getTotalPages()&&this.setPage(this.getTotalPages())}setPageSize(e){this.pageSize=e,this.currentPage=1,this.requestUpdate(),this.dispatchEvent(new CustomEvent("pageSizeChange",{bubbles:!0}))}getPageSize(){return this.pageSize}getPageSizeOptions(){return this.pageSizeOptions}setPageSizeOptions(e){this.pageSizeOptions=e,this.requestUpdate()}setData({records:e=!1,cardTemplate:t=!1,pageSize:s=!1,pageSizeOptions:i=!1,currentPage:n=!1,enableSelection:l}={}){let d=!1;const c=this.getTotalPages(),h=this.currentPage;e&&(this.records=e.map(e=>({...e})),this.records.forEach((e,t)=>{e[o]=t,e[r]=!1,e[a]=!1}),d=!0),t&&(this.cardTemplate=t,d=!0),s&&(this.pageSize=s,d=!0),i&&(this.pageSizeOptions=i),n&&(this.currentPage=n,d=!0),void 0!==l&&(this.enableSelection=l,d=!0),d&&this.requestUpdate();const p=this.getTotalPages();p!==c&&this.dispatchEvent(new CustomEvent("pageCountChanged",{detail:{totalPages:p},bubbles:!0})),h>p&&this.setPage(p)}setRecords(e,t){const s=this.getTotalPages(),i=this.currentPage;this.records=e.map(e=>({...e})),this.records.forEach((e,t)=>{e[o]=t,e[r]=!1,e[a]=!1}),t&&(this.cardTemplate=t),this.requestUpdate(),this.dispatchEvent(new CustomEvent("recordsSet",{detail:{records:e},bubbles:!0}));const n=this.getTotalPages();n!==s&&this.dispatchEvent(new CustomEvent("pageCountChanged",{detail:{totalPages:n},bubbles:!0})),i>n&&this.setPage(n)}addRecord(e){e[r]=!1,e[a]=!1,e[o]=this.records.length,this.records.push(e),this.requestUpdate(),this.dispatchEvent(new CustomEvent("recordAdded",{detail:{record:e},bubbles:!0}))}updateRecord(e,t){let s=!1,i=this.records.find(t=>t===e);i||void 0===e[o]||(i=this.records[e[o]]),Object.keys(t).forEach(e=>{i.hasOwnProperty(e)&&(i[e]=t[e],s=!0)}),s&&this.requestUpdate()}deleteRecord(e){let t=this.records.find(t=>t===e);const s=this.getTotalPages();if(t||void 0===e[o]||(t=this.records[e[o]]),!t)return;const i=()=>{const e=this.records.indexOf(t);this.records.splice(e,1),this.records.forEach((e,t)=>{e[o]=t}),this.requestUpdate(),this.dispatchEvent(new CustomEvent("selectionChange",{bubbles:!0})),this.dispatchEvent(new CustomEvent("recordDeleted",{detail:{index:e},bubbles:!0}));const i=this.getTotalPages();this.currentPage>i&&this.setPage(i),i!==s&&this.dispatchEvent(new CustomEvent("pageCountChanged",{detail:{totalPages:i},bubbles:!0}))};if(this.requestDelete){const e=this.shadowRoot.querySelector(`.tile[data-index="${t[o]}"]`);e?.classList.add("pending");const s=()=>{e?.classList.remove("pending"),i()},r=()=>{e?.classList.remove("pending")};this.dispatchEvent(new CustomEvent("requestDelete",{detail:{records:[t],approve:s,reject:r},bubbles:!0}))}else i()}deleteSelected(){const e=this.getTotalPages(),t=this.getSelectedRecords().map(e=>this.records.find(t=>t===e)??(void 0!==e[o]?this.records[e[o]]:null)).filter(Boolean);if(!t.length)return;const s=()=>{t.forEach(e=>{const t=this.records.indexOf(e);-1!==t&&this.records.splice(t,1)}),this.records.forEach((e,t)=>{e[o]=t}),this.requestUpdate();const s=this.getTotalPages();this.currentPage>s&&this.setPage(s),s!==e&&this.dispatchEvent(new CustomEvent("pageCountChanged",{detail:{totalPages:s},bubbles:!0})),this.dispatchEvent(new CustomEvent("selectionChange",{bubbles:!0}))};if(this.requestDelete){const e=t.map(e=>this.shadowRoot.querySelector(`.tile[data-index="${e[o]}"]`)).filter(Boolean);e.forEach(e=>e.classList.add("pending"));const i=()=>{e.forEach(e=>e.classList.remove("pending")),s()},r=()=>{e.forEach(e=>e.classList.remove("pending"))};this.dispatchEvent(new CustomEvent("requestDelete",{detail:{records:t,approve:i,reject:r},bubbles:!0}))}else s()}getSelectedRecords(){return this.records.filter(e=>e[r])}selectAllOnPage(){const e=(this.currentPage-1)*this.pageSize,t=Math.min(e+this.pageSize,this.records.length);for(let s=e;s<t;s++)this.records[s][r]=!0;this.requestUpdate(),setTimeout(()=>this.dispatchEvent(new CustomEvent("selectionChange",{bubbles:!0})),0)}deselectAllOnPage(){const e=(this.currentPage-1)*this.pageSize,t=Math.min(e+this.pageSize,this.records.length);for(let s=e;s<t;s++)this.records[s][r]=!1;this.requestUpdate(),setTimeout(()=>this.dispatchEvent(new CustomEvent("selectionChange",{bubbles:!0})),0)}allOnPageSelected(){const e=(this.currentPage-1)*this.pageSize,t=Math.min(e+this.pageSize,this.records.length);for(let s=e;s<t;s++)if(!this.records[s][r])return!1;return!0}hideRecord(e){let t=this.records.find(t=>t===e);t||void 0===e[o]||(t=this.records[e[o]]),t&&(t[a]=!0,this.requestUpdate(),this.dispatchEvent(new CustomEvent("recordHidden",{bubbles:!0})))}showRecord(e){let t=this.records.find(t=>t===e);t||void 0===e[o]||(t=this.records[e[o]]),t&&(t[a]=!1,this.requestUpdate(),this.dispatchEvent(new CustomEvent("recordShown",{bubbles:!0})))}showAllRecords(){this.records.forEach(e=>{e[a]=!1}),this.requestUpdate(),this.dispatchEvent(new CustomEvent("recordShown",{bubbles:!0})),this.dispatchEvent(new CustomEvent("allRecordsShown",{bubbles:!0}))}getDisplayedRecords(){return this.records.filter(e=>!e[a])}getHiddenRecords(){return this.records.filter(e=>e[a])}render(){return this.records?(this.hasTopControls()?this.setAttribute("top-controls","true"):this.removeAttribute("top-controls"),this.hasBottomControls()?this.setAttribute("bottom-controls","true"):this.removeAttribute("bottom-controls"),e`
      <div id="wrapper">
        <div id="top"><slot name="top"></slot></div>
        ${this.enableSelection?e`
          <div id="select-all-bar">
            <input type="checkbox" id="select-all" @change=${this.handleSelectAllChange} />
            <span class="small tc-muted">Select all</span>
          </div>
        `:""}
        <div id="grid-container">
          <div id="grid" style="grid-template-columns: repeat(auto-fill, minmax(${this.minCardWidth}, 1fr))">
            ${this.renderCardsTemplate()}
          </div>
        </div>
        <div id="bottom"><slot></slot></div>
      </div>
    `):e`
        <div id="wrapper">
          <div id="top"><slot name="top"></slot></div>
          <div id="grid-container"></div>
          <div id="bottom"><slot></slot></div>
        </div>
      `}static styles=t`
    :host {
      display: block;
      margin-bottom: var(--spacer);
    }
    #grid {
      display: grid;
      gap: var(--spacer_h);
    }
    .tile {
      position: relative;
      --card_padding: 0;
      --card_margin: 0;
    }
    /* .tile prefix, not just .card-select: kempo-css's own input[type="checkbox"] rule is a
       type+attribute selector (specificity 0,1,1), which beats a single class (0,1,0) even with no
       !important on either side. Sizing only now — position comes from being the first flex item in
       .tile-controls-before, not from an absolute overlay. */
    .tile .card-select {
      width: 1.25rem;
      height: 1.25rem;
      flex: 0 0 auto;
    }
    .tile-controls {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--spacer_q);
      padding: var(--spacer_q);
    }
    /* getClonedControls() clones every registered before/after control into every tile regardless of
       record type — a control that hides itself for this particular record (e.g. a files-only action
       on a folder tile) still leaves an empty child behind. Without this rule the strip's own padding
       renders anyway, showing as dead space even though nothing inside it is visible. */
    .tile-controls:not(:has(> :not([hidden]))) {
      display: none;
    }
    .tile-controls-before {
      justify-content: flex-end;
    }
    .tile.pending {
      pointer-events: none;
      position: relative;
      overflow: hidden;
    }
    .tile.pending::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(128, 128, 128, 0.15), transparent);
      transform: translateX(-100%);
      animation: card-pending 1.2s ease-in-out infinite;
      z-index: 2;
    }
    @keyframes card-pending {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    #select-all-bar {
      display: flex;
      align-items: center;
      gap: var(--spacer_q);
      margin-bottom: var(--spacer_h);
    }
    #select-all-bar input {
      width: 1.25rem;
      height: 1.25rem;
    }
    .placeholder {
      text-align: center;
      color: var(--c_text__muted);
      font-style: italic;
      padding: var(--spacer);
    }
    #top, #bottom {
      display: flex;
      width: 100%;
    }
    /* flex, not block: slotted controls need to be real flex items — e.g. a plain flex-spacer div
       among them, to push a later control to the far edge — not just wrapping inline content inside
       a block box. */
    #top slot {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      width: 100%;
      border-bottom: 1px solid var(--c_border);
      margin-bottom: var(--spacer);
    }
    #bottom slot {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      width: 100%;
      border-top: 1px solid var(--c_border);
      margin-top: var(--spacer);
    }
    :host(:not([top-controls])) #top,
    :host(:not([bottom-controls])) #bottom {
      display: none;
    }
  `}window.customElements.define("k-card-grid",n);