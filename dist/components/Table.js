import{html as e,css as t,unsafeStatic as s,literal as r}from"../lit-all.min.js";import i from"./ShadowComponent.js";import{toTitleCase as o}from"../utils/string.js";import{boolExists as n}from"../utils/propConverters.js";import l from"../utils/openUrl.js";import a from"./controls/Control.js";const c=Symbol("selected"),d=Symbol("hidden"),h=Symbol("index"),u=Symbol("editing");export default class p extends i{static properties={enablePages:{type:Boolean,reflect:!0,converter:n,attribute:"enable-pages"},pageSize:{type:Number,reflect:!0,attribute:"page-size"},currentPage:{type:Number,reflect:!0,attribute:"current-page"},pageSizeOptions:{type:Array,attribute:"page-size-options"},enableSelection:{type:Boolean,reflect:!0,converter:n,attribute:"enable-selection"},enableSorting:{type:Boolean,reflect:!0,converter:n,attribute:"enable-sorting"},caseSensitiveFilters:{type:Boolean,reflect:!0,converter:n,attribute:"case-sensitive-filters"},requestEdit:{type:Boolean,reflect:!0,converter:n,attribute:"request-edit"},requestDelete:{type:Boolean,reflect:!0,converter:n,attribute:"request-delete"},openOnClick:{type:Boolean,reflect:!0,converter:n,attribute:"open-on-click"},rowTarget:{type:String,reflect:!0,attribute:"row-target"},controls:{type:String,reflect:!0},placeholder:{type:String,reflect:!0},filteredPlaceholder:{type:String,reflect:!0,attribute:"filtered-placeholder"},fields:{type:Array},records:{type:Array},filters:{type:Array},sort:{type:Array},columnSizes:{type:Object},fetchPending:{type:Boolean}};constructor(e={}){super(),void 0===this.pageSize&&(this.pageSize=50),void 0===this.currentPage&&(this.currentPage=1),void 0===this.pageSizeOptions&&(this.pageSizeOptions=[10,25,50,100,500]),void 0===this.records&&(this.records=e.records||[]),void 0===this.fields&&(this.fields=e.fields||[]),void 0===this.filters&&(this.filters=e.filters||[]),void 0===this.sort&&(this.sort=[]),void 0===this.columnSizes&&(this.columnSizes={}),void 0===this.fetchPending&&(this.fetchPending=!1),void 0===this.requestEdit&&(this.requestEdit=!1),void 0===this.requestDelete&&(this.requestDelete=!1),void 0===this.controls&&(this.controls=""),void 0===this.placeholder&&(this.placeholder="No Records"),void 0===this.filteredPlaceholder&&(this.filteredPlaceholder="")}handleSelectAllChange=e=>{e.target.checked?this.selectAllOnPage():this.deselectAllOnPage()};handleFieldClick=e=>{const t=this.sort.find(t=>t.name===e),s=!t||!t.asc;this.sortBy(e,s)};handleRecordSelectionChange=(e,t)=>{e[c]=!!t.target.checked,this.requestUpdate(),this.dispatchEvent(new CustomEvent("selectionChange",{bubbles:!0}))};handleRecordClick=(e,t)=>{!e[u]&&e._url&&(t.target.closest(".controls, input, select, textarea, button, a")||l(e._url,this.rowTarget))};connectedCallback(){super.connectedCallback(),this.hasAttribute("controlled")||this.setAttribute("controlled","")}willUpdate(e){e.has("controls")&&a.load(Object.values(this.preset).map(e=>"function"==typeof e?e(this):{strings:[e.map(e=>`<${e}>`).join("")]}))}firstUpdated(){this.setData({records:this.records,fields:this.fields,filters:this.filters})}childrenUpdated(){this.requestUpdate()}updated(e){if(super.updated(e),this.enableSelection){const e=this.shadowRoot.getElementById("select-all");e&&(e.checked=this.getDisplayedRecords().length>0&&this.allOnPageSelected())}}renderColgroupTemplate(){const t=[];return this.enableSelection&&t.push(e`<col style="width: 40px" />`),this.hasBeforeControls()&&t.push(e`<col style="width: ${this.columnSizes.beforeControls}px" />`),this.fields.forEach(({size:s,hidden:r})=>{r||t.push(s?e`<col style="width: ${s}px" />`:e`<col />`)}),this.hasAfterControls()&&t.push(e`<col style="width: ${this.columnSizes.afterControls}px" />`),t}getColumnCount(){let e=0;return this.enableSelection&&e++,this.hasBeforeControls()&&e++,this.fields.forEach(({hidden:t})=>{t||e++}),this.hasAfterControls()&&e++,e}renderFieldsTemplate(){const t=[];return this.enableSelection&&t.push(e`
        <th class="controls field-select">
          <input type="checkbox" id="select-all" @change=${this.handleSelectAllChange} />
        </th>
      `),this.hasBeforeControls()&&t.push(e`<th class="controls field-before-controls"></th>`),this.fields.forEach(({name:s,label:r,hidden:i})=>{if(i)return;const o=this.sort.find(e=>e.name===s),n=this.sort.length>0&&this.sort[this.sort.length-1].name===s,l=o?o.asc?"sort-asc":"sort-desc":"";t.push(e`
        <th
          class="${l}"
          style="${this.enableSorting?"cursor: pointer;":""}"
          @click=${this.enableSorting?()=>this.handleFieldClick(s):null}
        >
          ${r}
          ${n?e`<k-icon name="arrow" direction="${o.asc?"down":"up"}" class="icon-sort"></k-icon>`:""}
        </th>
      `)}),this.hasAfterControls()&&t.push(e`<th class="controls field-after-controls"></th>`),t}renderRecordsTemplate(){let t=this.getDisplayedRecords(),s=0,r=this.pageSize;if(this.enablePages&&(s=(this.currentPage-1)*this.pageSize,r=s+this.pageSize,t=t.slice(s,r)),0===t.length){const t=this.records.filter(e=>null!==e).length>0?this.filteredPlaceholder:this.placeholder;if(t)return[e`<tr class="placeholder"><td colspan="${this.getColumnCount()}">${t}</td></tr>`]}let i=null,o=0;const n=t.map((t,r)=>null!==t?this.renderRecordTemplate(t):(null===i&&(i=s+r),o++,e`<tr class="record fetching"><td class="cell" colspan="${this.getColumnCount()}">Loading...</td></tr>`));return null===i||this.fetchPending||setTimeout(()=>{this.fetchPending||this.dispatchEvent(new CustomEvent("fetchRecords",{detail:{start:i,count:o},bubbles:!0}))},0),n}renderRecordTemplate(t){const s=[];this.enableSelection&&s.push(e`
        <td class="cell selection controls">
          <input
            type="checkbox"
            .checked=${t[c]}
            @change=${e=>this.handleRecordSelectionChange(t,e)}
          />
        </td>
      `),this.hasBeforeControls()&&s.push(this.renderBeforeControlsTemplate()),this.fields.forEach(({name:r,formatter:i,calculator:o,type:n,editor:l,hidden:a,editable:c})=>{if(a)return;let d=t[r]||"";s.push(e`
        <td class="cell" data-field=${r}>
          ${t[u]?this.renderEditingCell(t,r,d,o,l,n,c):this.renderDisplayCell(t,r,d,o,i)}
        </td>
      `)}),this.hasAfterControls()&&s.push(this.renderAfterControlsTemplate());const r=this.openOnClick&&t._url;return e`
      <tr
        class="record ${t[u]?"editing":""} ${r?"linked":""}"
        data-index=${t[h]}
        @click=${this.openOnClick?e=>this.handleRecordClick(t,e):null}
      >
        ${s}
      </tr>
    `}renderEditingCell(t,s,r,i,o,n,l){if(!1===l)return this.renderDisplayCell(t,s,r,i,null);if(i)return e`<input disabled .value=${i(t,this)} />`;if(o){const t=o(r);return e`${t}`}switch(n||typeof r){case"number":return e`<input type="number" .value=${r} />`;case"date":return e`<input type="date" .value=${r} />`;case"boolean":return e`
            <select .value=${r}>
              <option value="true" ?selected=${r}>True</option>
              <option value="false" ?selected=${!r}>False</option>
            </select>
          `;default:return e`<input type="text" .value=${r} />`}}renderDisplayCell(e,t,s,r,i){return r?r(e,this):i?i(s):s}renderBeforeControlsTemplate(){const t=[];return this.querySelectorAll('[slot="before"]').forEach(e=>{const s=e.tagName.toLowerCase(),r=document.createElement(s);Array.from(e.attributes).forEach(e=>{"slot"!==e.name&&r.setAttribute(e.name,e.value)}),e.innerHTML&&(r.innerHTML=e.innerHTML),t.push(r)}),e`
      <td class="cell controls controls-before">
        <div>${t}</div>
      </td>
    `}renderAfterControlsTemplate(){const t=[],s=this.querySelectorAll('[slot="after"]');return s.length||this.preset.after?.forEach(e=>t.push(document.createElement(e))),s.forEach(e=>{const s=e.tagName.toLowerCase(),r=document.createElement(s);Array.from(e.attributes).forEach(e=>{"slot"!==e.name&&r.setAttribute(e.name,e.value)}),e.innerHTML&&(r.innerHTML=e.innerHTML),t.push(r)}),e`
      <td class="cell controls controls-after">
        <div>${t}</div>
      </td>
    `}hasBeforeControls(){return!!this.querySelector('[slot="before"]')}hasAfterControls(){return!!this.querySelector('[slot="after"]')||!!this.preset.after?.length}get preset(){return this.constructor.controlSets[this.controls]??{}}hasTopControls(){return!!this.querySelector('[slot="top"]')||!!this.preset.top}hasBottomControls(){return!!this.querySelector(":scope > :not([slot])")||!!this.preset.bottom}editRecord(e){e[u]=!0;const t=this.shadowRoot.querySelector(`.record[data-index="${e[h]}"]`);t&&(t.classList.add("editing"),t.setAttribute("editing","true"),t.querySelectorAll(".cell[data-field]").forEach(t=>{const s=t.dataset.field,r=this.fields.find(e=>e.name===s);if(r){if(!1===r.editable)return;const i=e[s]||"";if(t.innerHTML="",r.calculator){const s=document.createElement("input");s.disabled=!0,s.value=r.calculator(e,this),t.appendChild(s)}else if(r.editor)t.appendChild(r.editor(i));else{const e=r.type||typeof i,s=p.editors[e]||p.editors.string;t.appendChild(s(i))}}})),this.dispatchEvent(new CustomEvent("editingChange",{detail:{record:e,editing:!0},bubbles:!0}))}saveEditedRecord(e){const t=this.shadowRoot.querySelector(`.record[data-index="${e[h]}"]`),s={};t&&t.querySelectorAll(".cell[data-field]").forEach(e=>{const t=e.dataset.field,r=this.fields.find(e=>e.name===t);if(r&&!r.calculator){const r=e.querySelector("input, select");r&&(s[t]=r.value)}});const r=()=>{Object.assign(e,s),e[u]=!1,t&&(t.classList.remove("editing"),t.removeAttribute("editing"),t.querySelectorAll(".cell[data-field]").forEach(t=>{const s=t.dataset.field,r=this.fields.find(e=>e.name===s);if(r){const i=e[s]||"";r.calculator?t.textContent=r.calculator(e,this):r.formatter?t.innerHTML=r.formatter(i):t.textContent=i}})),this.dispatchEvent(new CustomEvent("editingChange",{detail:{record:e,editing:!1},bubbles:!0}))};if(Object.keys(s).some(t=>String(e[t]??"")!==s[t]))if(this.requestEdit){t?.classList.add("pending");const i=()=>{t?.classList.remove("pending"),r()},o=()=>{t?.classList.remove("pending")};this.dispatchEvent(new CustomEvent("requestSave",{detail:{record:e,newData:s,approve:i,reject:o},bubbles:!0}))}else r();else this.cancelEditedRecord(e)}cancelEditedRecord(e){e[u]=!1;const t=this.shadowRoot.querySelector(`.record[data-index="${e[h]}"]`);t&&(t.classList.remove("editing"),t.removeAttribute("editing"),t.querySelectorAll(".cell[data-field]").forEach(t=>{const s=t.dataset.field,r=this.fields.find(e=>e.name===s);if(r){const i=e[s]||"";r.calculator?t.textContent=r.calculator(e,this):r.formatter?t.innerHTML=r.formatter(i):t.textContent=i}})),this.dispatchEvent(new CustomEvent("editingChange",{detail:{record:e,editing:!1},bubbles:!0}))}recordIsEditing(e){return e[u]}getCurrentPage(){return this.currentPage}getTotalPages(){return Math.ceil(this.getDisplayedRecords().length/this.pageSize)}setPage(e){e<1||e>this.getTotalPages()||(this.currentPage=e,this.requestUpdate(),this.dispatchEvent(new CustomEvent("pageChange",{bubbles:!0})))}firstPage(){1!==this.currentPage&&this.setPage(1)}nextPage(){this.currentPage<this.getTotalPages()&&this.setPage(this.currentPage+1)}prevPage(){this.currentPage>1&&this.setPage(this.currentPage-1)}lastPage(){this.currentPage!==this.getTotalPages()&&this.setPage(this.getTotalPages())}setPageSize(e){this.pageSize=e,this.currentPage=1,this.requestUpdate(),this.dispatchEvent(new CustomEvent("pageSizeChange",{bubbles:!0}))}getPageSize(){return this.pageSize}getPageSizeOptions(){return this.pageSizeOptions}getFieldLabel(e){const t=this.fields.find(t=>t.name===e);return t?t.label:o(e)}setPageSizeOptions(e){this.pageSizeOptions=e,this.requestUpdate()}setData({records:e=!1,fields:t=!1,pageSize:s=!1,pageSizeOptions:r=!1,currentPage:i=!1,enableSelection:o}={}){let n=!1,l=this.getTotalPages(),a=this.currentPage;e&&(this.records=e.map(e=>({...e})),this.records.forEach((e,t)=>{e[h]=t,e[c]=!1,e[d]=!1,e[u]=!1}),this.fields=t||p.extractFieldsFromRecords(this.records),n=!0),s&&(this.pageSize=s,n=!0),r&&(this.pageSizeOptions=r),i&&(this.currentPage=i,n=!0),void 0!==o&&(this.enableSelection=o,n=!0),n&&this.requestUpdate();const g=this.getTotalPages();g!==l&&this.dispatchEvent(new CustomEvent("pageCountChanged",{detail:{totalPages:this.getTotalPages()},bubbles:!0})),a>g&&this.setPage(g)}setRecords(e,t){let s=this.getTotalPages(),r=this.currentPage;this.records=e.map(e=>({...e})),this.records.forEach((e,t)=>{e[h]=t,e[c]=!1,e[d]=!1,e[u]=!1}),this.fields=t||p.extractFieldsFromRecords(this.records),this.requestUpdate(),this.dispatchEvent(new CustomEvent("recordsSet",{detail:{records:e},bubbles:!0}));const i=this.getTotalPages();i!==s&&this.dispatchEvent(new CustomEvent("pageCountChanged",{detail:{totalPages:this.getTotalPages()},bubbles:!0})),r>i&&this.setPage(i)}setupFetchRecords(e,t){const s=this.records.length,r=this.getTotalPages();if(s<e){this.records.length=e,this.records.fill(null,s),this.requestUpdate();const t=this.getTotalPages();t!==r&&setTimeout(()=>{this.dispatchEvent(new CustomEvent("pageCountChanged",{detail:{totalPages:t},bubbles:!0}))},0)}this.addEventListener("fetchRecords",async e=>{if(this.fetchPending)return;this.fetchPending=!0;const{start:s,count:r}=e.detail,i=await t(s,r);i.forEach((e,t)=>{e[h]=s+t,void 0===e[c]&&(e[c]=!1),void 0===e[d]&&(e[d]=!1),void 0===e[u]&&(e[u]=!1)}),this.records.splice(s,i.length,...i),this.fetchPending=!1,this.requestUpdate()})}addRecord(e){e[c]=!1,e[d]=!1,e[h]=this.records.length,this.records.push(e),this.requestUpdate(),this.dispatchEvent(new CustomEvent("recordAdded",{detail:{record:e},bubbles:!0}))}updateRecord(e,t){let s=!1,r=this.records.find(t=>t===e);if(r||void 0===e[h]||(r=this.records[e[h]]),Object.keys(t).forEach(e=>{r.hasOwnProperty(e)&&(r[e]=t[e],s=!0)}),s){const e=(this.currentPage-1)*this.pageSize,t=e+this.pageSize;(!this.enablePages||r[h]>=e&&r[h]<t)&&this.requestUpdate()}}deleteRecord(e){let t=this.records.find(t=>t===e);const s=this.getTotalPages();if(t||void 0===e[h]||(t=this.records[e[h]]),!t)return;const r=()=>{const e=this.records.indexOf(t);this.records.splice(e,1),this.records.forEach((e,t)=>{e[h]=t}),this.requestUpdate(),this.dispatchEvent(new CustomEvent("selectionChange",{bubbles:!0})),this.dispatchEvent(new CustomEvent("recordDeleted",{detail:{index:e},bubbles:!0}));const r=this.getTotalPages();this.currentPage>r&&this.setPage(r),r!==s&&this.dispatchEvent(new CustomEvent("pageCountChanged",{detail:{totalPages:r},bubbles:!0}))};if(this.requestDelete){const e=this.shadowRoot.querySelector(`.record[data-index="${t[h]}"]`);e?.classList.add("pending");const s=()=>{e?.classList.remove("pending"),r()},i=()=>{e?.classList.remove("pending")};this.dispatchEvent(new CustomEvent("requestDelete",{detail:{records:[t],approve:s,reject:i},bubbles:!0}))}else r()}deleteSelected(){const e=this.getTotalPages(),t=this.getSelectedRecords().map(e=>this.records.find(t=>t===e)??(void 0!==e[h]?this.records[e[h]]:null)).filter(Boolean);if(!t.length)return;const s=()=>{t.forEach(e=>{const t=this.records.indexOf(e);-1!==t&&this.records.splice(t,1)}),this.records.forEach((e,t)=>{e[h]=t}),this.requestUpdate();const s=this.getTotalPages();this.currentPage>s&&this.setPage(s),s!==e&&this.dispatchEvent(new CustomEvent("pageCountChanged",{detail:{totalPages:s},bubbles:!0})),this.dispatchEvent(new CustomEvent("selectionChange",{bubbles:!0}))};if(this.requestDelete){const e=t.map(e=>this.shadowRoot.querySelector(`.record[data-index="${e[h]}"]`)).filter(Boolean);e.forEach(e=>e.classList.add("pending"));const r=()=>{e.forEach(e=>e.classList.remove("pending")),s()},i=()=>{e.forEach(e=>e.classList.remove("pending"))};this.dispatchEvent(new CustomEvent("requestDelete",{detail:{records:t,approve:r,reject:i},bubbles:!0}))}else s()}getSelectedRecords(){return this.records.filter(e=>e[c])}selectAllOnPage(){const e=(this.currentPage-1)*this.pageSize,t=Math.min(e+this.pageSize,this.records.length);for(let s=e;s<t;s++)this.records[s][c]=!0;this.requestUpdate(),setTimeout(()=>{this.dispatchEvent(new CustomEvent("selectionChange",{bubbles:!0}))},0)}deselectAllOnPage(){const e=(this.currentPage-1)*this.pageSize,t=Math.min(e+this.pageSize,this.records.length);for(let s=e;s<t;s++)this.records[s][c]=!1;this.requestUpdate(),setTimeout(()=>{this.dispatchEvent(new CustomEvent("selectionChange",{bubbles:!0}))},0)}allOnPageSelected(){const e=(this.currentPage-1)*this.pageSize,t=Math.min(e+this.pageSize,this.records.length);for(let s=e;s<t;s++)if(!this.records[s][c])return!1;return!0}sortBy(e,t=!0){this.sort=this.sort.filter(t=>t.name!==e),this.sort.push({name:e,asc:t}),this.requestUpdate()}hideRecord(e){let t=this.records.find(t=>t===e);t||void 0===e[h]||(t=this.records[e[h]]),t&&(t[d]=!0,this.requestUpdate(),this.dispatchEvent(new CustomEvent("recordHidden",{bubbles:!0})))}showRecord(e){let t=this.records.find(t=>t===e);t||void 0===e[h]||(t=this.records[e[h]]),t&&(t[d]=!1,this.requestUpdate(),this.dispatchEvent(new CustomEvent("recordShown",{bubbles:!0})))}showAllRecords(){this.records.forEach(e=>{e[d]=!1}),this.filters.length&&(this.filters=[],this.dispatchEvent(new CustomEvent("filterRemoved",{bubbles:!0})),this.dispatchEvent(new CustomEvent("filterChange",{bubbles:!0}))),this.requestUpdate(),this.dispatchEvent(new CustomEvent("recordShown",{bubbles:!0})),this.dispatchEvent(new CustomEvent("allRecordsShown",{bubbles:!0}))}addFilter(e,t,s){this.filters.push({field:e,condition:t,value:s}),this.dispatchEvent(new CustomEvent("filterAdded",{bubbles:!0})),this.dispatchEvent(new CustomEvent("filterChange",{bubbles:!0})),this.requestUpdate()}removeFilter(e,t,s,r=!0){const i=this.filters.findIndex(r=>r.field===e&&r.condition===t&&r.value===s);-1!==i&&(this.records.forEach(r=>{this.testFilter(r,e,t,s)||(r[d]=!1)}),this.filters.splice(i,1),this.dispatchEvent(new CustomEvent("filterRemoved",{bubbles:!0})),this.dispatchEvent(new CustomEvent("filterChange",{bubbles:!0})),r&&this.requestUpdate())}testFilter(e,t,s,r){let i=e[t],o=r;switch(this.caseSensitiveFilters||"string"!=typeof i||"string"!=typeof r||(i=i.toLowerCase(),o=r.toLowerCase()),s){case"equals":return i===o;case"not-equals":return i!==o;case"contains":return i.includes(o);case"not-contains":return!i.includes(o);case"greater-than":return i>o;case"less-than":return i<o;case"greater-than-or-equal":return i>=o;case"less-than-or-equal":return i<=o;default:return!0}}removeAllFilters(){this.filters.length&&([...this.filters].forEach(({field:e,condition:t,value:s})=>{this.removeFilter(e,t,s,!1)}),this.requestUpdate())}search(e){const t=e.trim().toLowerCase();let s=!1;this.records.forEach(e=>{if(e[d])return;let r=!1;this.fields.forEach(({name:s})=>{(e[s]?.toString().toLowerCase()||"").includes(t)&&(r=!0)}),e[d]!==!r&&(e[d]=!r,s=!0)}),s&&(this.dispatchEvent(new CustomEvent("recordHidden",{bubbles:!0})),this.requestUpdate()),this.dispatchEvent(new CustomEvent("search",{detail:{term:e},bubbles:!0}))}getDisplayedRecords(){this.filters.forEach(({field:e,condition:t,value:s})=>{this.records.forEach(r=>{null!==r&&(this.testFilter(r,e,t,s)||(r[d]=!0))})});let e=this.records.filter(e=>null===e||!e[d]);return this.sort.forEach(({name:t,asc:s})=>{e.sort((e,r)=>null===e||null===r?0:e[t]<r[t]?s?-1:1:e[t]>r[t]?s?1:-1:0)}),e}getHiddenRecords(){return this.records.filter(e=>e[d])}calculateColumnSizes(){const e=Array.from(this.querySelectorAll('[slot="before"]')),t=Array.from(this.querySelectorAll('[slot="after"]')),s={beforeControls:e.reduce((e,t)=>e+(t.maxWidth||40),0),afterControls:t.reduce((e,t)=>e+(t.maxWidth||40),0)+(t.length?0:40*(this.preset.after?.length??0))},r=[...e,...t].some(e=>void 0===e.maxWidth);return JSON.stringify(this.columnSizes)!==JSON.stringify(s)&&(this.columnSizes=s),r&&setTimeout(()=>this.calculateColumnSizes(),0),this.columnSizes}setFieldHiddenState(e,t){const s=this.fields.find(t=>t.name===e);s&&(s.hidden=t,this.calculateColumnSizes(),this.requestUpdate(),this.dispatchEvent(new CustomEvent("fieldVisibilityChanged",{detail:{field:s},bubbles:!0})),this.dispatchEvent(new CustomEvent(t?"fieldHidden":"fieldShown",{detail:{field:s},bubbles:!0})))}hideField(e){this.setFieldHiddenState(e,!0)}showField(e){this.setFieldHiddenState(e,!1)}reorderFields(e){const t=[];e.forEach(e=>{const s=this.fields.find(t=>t.name===e);s&&t.push(s)}),this.fields=t,this.requestUpdate()}render(){return this.records&&this.fields?(this.calculateColumnSizes(),this.hasTopControls()?this.setAttribute("top-controls","true"):this.removeAttribute("top-controls"),this.hasBottomControls()?this.setAttribute("bottom-controls","true"):this.removeAttribute("bottom-controls"),e`
      <div id="wrapper">
        <div id="top"><slot name="top">${this.preset.top?.(this)}</slot></div>
        <div id="table-container">
          <table>
            <colgroup>
              ${this.renderColgroupTemplate()}
            </colgroup>
            <thead>
              <tr>
                ${this.renderFieldsTemplate()}
              </tr>
            </thead>
            <tbody>
              ${this.renderRecordsTemplate()}
            </tbody>
          </table>
        </div>
        <div id="bottom"><slot>${this.preset.bottom?.(this)}</slot></div>
      </div>
      <div style="display: none">
        <slot name="before"></slot>
        <slot name="after"></slot>
      </div>
    `):e`
        <div id="wrapper">
          <div id="top"><slot name="top">${this.preset.top?.(this)}</slot></div>
          <div id="table-container">
            <table><thead><tr></tr></thead><tbody></tbody></table>
          </div>
          <div id="bottom"><slot>${this.preset.bottom?.(this)}</slot></div>
        </div>
        <div style="display: none">
          <slot name="before"></slot>
          <slot name="after"></slot>
        </div>
      `}static styles=t`
    :host {
      display: block;
      margin-bottom: var(--spacer);
    }
    #wrapper {
      border: 1px solid var(--c_border);
      border-radius: var(--radius);
      overflow: hidden;
    }
    #table-container {
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    thead tr {
      background-color: var(--c_bg__alt);
    }
    th, td {
      padding: calc(0.5 * var(--spacer)) var(--spacer);
      vertical-align: middle;
    }
    th:not(:last-child),
    td:not(:last-child) {
      border-right: 1px solid var(--c_border);
    }
    th:first-child,
    td:first-child {
      border-left: none;
    }
    th:last-child,
    td:last-child {
      border-right: none;
    }
    thead tr th {
      border-top: none;
      border-bottom: 1px solid var(--c_border);
    }
    tbody tr:not(:last-child) td {
      border-bottom: 1px solid var(--c_border);
    }
    tbody tr:last-child td {
      border-bottom: none;
    }
    tr.editing td.cell[data-field]:has(input),
    tr.editing td.cell[data-field]:has(select) {
      padding: 0;
    }
    tr.editing td.cell[data-field] input,
    tr.editing td.cell[data-field] select {
      width: 100%;
      height: 100%;
      box-sizing: border-box;
    }
    tr.pending {
      pointer-events: none;
    }
    tr.pending td {
      position: relative;
      overflow: hidden;
    }
    tr.pending td::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(128, 128, 128, 0.15), transparent);
      transform: translateX(-100%);
      animation: row-pending 1.2s ease-in-out infinite;
    }
    tr.linked {
      cursor: pointer;
    }
    tr.linked:hover td {
      background: oklch(from var(--c_bg__inv) l c h / 0.05);
    }
    @keyframes row-pending {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    th.controls,
    td.controls {
      padding: 0;
    }
    td.controls-after > div,
    td.controls-before > div {
      display: flex;
      align-items: center;
    }
    .field-select,
    .selection {
      width: 40px;
      text-align: center;
    }
    .field-select input,
    .selection input {
      width: 1.25rem;
      height: 1.25rem;
    }
    .icon-sort {
      float: right;
      opacity: 0.5;
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
    }
    #bottom slot {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      width: 100%;
      border-top: 1px solid var(--c_border);
    }
    :host(:not([top-controls])) #top,
    :host(:not([bottom-controls])) #bottom {
      display: none;
    }
    tr.placeholder td {
      text-align: center;
      color: var(--c_text__muted);
      font-style: italic;
      padding: var(--spacer);
    }
  `;static extractFieldsFromRecords(e,t=100){const s=new Set;return e.slice(0,t).forEach(e=>{Object.keys(e).forEach(e=>s.add(e))}),s.delete("_url"),[...s].map(e=>({name:e,label:o(e)}))}static format(e){return(Array.isArray(e)?p.formatters.array:p.formatters[typeof e])(e)}static formatters={string:e=>e,number:e=>`${e}`,date:e=>e.toLocaleDateString(),boolean:e=>e?"True":"False",array:e=>e.map(e=>p.format(e)).join(", "),undefined:e=>"",null:e=>"<code>null</code>"};static editors={string:e=>{const t=document.createElement("input");return t.value=e,t},number:e=>{const t=document.createElement("input");return t.type="number",t.value=e,t},date:e=>{const t=document.createElement("input");return t.type="date",t.value=e,t},boolean:e=>{const t=document.createElement("select");return t.innerHTML=`\n        <option value="true" ${e?"selected":""}>True</option>\n        <option value="false" ${e?"":"selected"}>False</option>\n      `,t.value=e,t},calculated:e=>{const t=document.createElement("input");return t.disabled=!0,t.value=e,t}};static controlSets={"":{},none:{},minimal:{top:()=>e`
        <k-control-bar>
          <kc-tc-search priority="2"></kc-tc-search>
          <kc-tc-filters slot="right"></kc-tc-filters>
          <kc-tc-field-sort-hide slot="right"></kc-tc-field-sort-hide>
        </k-control-bar>
      `},normal:{top:()=>e`
        <k-control-bar>
          <kc-tc-search priority="2"></kc-tc-search>
          <kc-tc-filters></kc-tc-filters>
          <kc-tc-field-sort-hide></kc-tc-field-sort-hide>
          <kc-tc-export-csv slot="right"></kc-tc-export-csv>
        </k-control-bar>
      `,bottom:()=>e`
        <k-control-bar>
          <kc-tc-prev-page></kc-tc-prev-page>
          <kc-tc-next-page></kc-tc-next-page>
          <kc-tc-page-size slot="right" priority="1"></kc-tc-page-size>
        </k-control-bar>
      `},full:{top:()=>e`
        <k-control-bar>
          <kc-tc-search priority="2"></kc-tc-search>
          <kc-tc-filters></kc-tc-filters>
          <kc-tc-field-sort-hide></kc-tc-field-sort-hide>
          <kc-tc-export-csv slot="center"></kc-tc-export-csv>
          <kc-tc-export-json slot="center"></kc-tc-export-json>
          <kc-tc-hidden-count slot="right"></kc-tc-hidden-count>
          <kc-tc-show-all slot="right"></kc-tc-show-all>
        </k-control-bar>
      `,after:["kc-tc-hide"],bottom:()=>e`
        <k-control-bar>
          <kc-tc-first-page></kc-tc-first-page>
          <kc-tc-prev-page></kc-tc-prev-page>
          <kc-tc-next-page></kc-tc-next-page>
          <kc-tc-last-page></kc-tc-last-page>
          <kc-tc-page-select slot="center" priority="1"></kc-tc-page-select>
          <kc-tc-page-size slot="right" priority="1"></kc-tc-page-size>
        </k-control-bar>
      `}}}window.customElements.define("k-table",p);