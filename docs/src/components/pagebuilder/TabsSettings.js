import t from"./WidgetSettings.js";import{html as e}from"../../lit-all.min.js";import{defaultNode as a}from"../../utils/pageTree.js";import"../Accordion.js";import"../Icon.js";import"../IconSelector.js";export default class s extends t{get tabs(){return this.node.slots?.default||[]}get defaultTab(){const t=this.tabs.filter(t=>"tab-item"===t.type);return t.find(t=>t.id===this.node.attrs?.active)||t[0]}addTab(){this.edit(t=>(t.slots.default=t.slots.default||[],t.slots.default.push(a(this.registry,"tab-item")),!0))}addSpacer(){this.edit(t=>(t.slots.default=t.slots.default||[],t.slots.default.push(a(this.registry,"tab-spacer")),!0))}moveTab(t,e){this.edit(a=>{const s=a.slots.default,l=t+e;return l<0||l>=s.length?"That tab cannot move there":([s[t],s[l]]=[s[l],s[t]],!0)})}removeTab(t){this.edit(e=>(e.slots.default.splice(t,1),!0))}setLabel(t,e){this.edit(a=>(a.slots.default[t].attrs.label=e,!0),!0)}setName(t,e){this.edit(a=>(a.slots.default[t].attrs.name=e,!0),!0)}setDefault(t){this.edit(e=>(e.attrs.active=t,!0))}setIcon(t,e){this.edit(a=>(a.slots.default[t].attrs.icon=e,!0))}renderMoveButtons(t){return e`
      <div class="btn-grp">
        <button title="Move left" aria-label="Move left" ?disabled="${0===t}" @click="${()=>this.moveTab(t,-1)}"><k-icon name="arrow" direction="left"></k-icon></button>
        <button title="Move right" aria-label="Move right" ?disabled="${t===this.tabs.length-1}" @click="${()=>this.moveTab(t,1)}"><k-icon name="arrow" direction="right"></k-icon></button>
        <button class="danger" title="Remove" aria-label="Remove" @click="${()=>this.removeTab(t)}"><k-icon name="delete"></k-icon></button>
      </div>
    `}renderSpacer(t){return e`
      <div class="d-f ai-c jc-sb p b mbq">
        <span>Tab spacer<small class="d-b tc-muted">Pushes the tabs after it to the right.</small></span>
        ${this.renderMoveButtons(t)}
      </div>
    `}renderTab(t,a){const s=`pb-tab-${a}`;return e`
      <k-accordion-header for-panel="${s}">${t.attrs?.label||`Tab ${a+1}`}</k-accordion-header>
      <k-accordion-panel name="${s}">
        <div class="p">
          <div class="mb">
            <label class="d-b mbq" for="${s}-label">Title</label>
            <input id="${s}-label" type="text" class="full" .value="${t.attrs?.label??""}" @input="${t=>this.setLabel(a,t.target.value)}">
          </div>
          <div class="mb">
            <label class="d-b mbq" for="${s}-name">Name<small class="d-b tc-muted">The tab's name, used by Hash routing and Persistent ID. Letters, numbers and dashes. One is made for you when it is empty.</small></label>
            <input id="${s}-name" type="text" class="full" .value="${t.attrs?.name??""}" @input="${t=>this.setName(a,t.target.value)}">
          </div>
          <div class="mb">
            <label class="d-b mbq" for="${s}-icon">Icon<small class="d-b tc-muted">Shown in front of the title. Leave it empty for no icon.</small></label>
            <k-icon-selector id="${s}-icon" class="full" placeholder="No icon" allow-clear .value="${t.attrs?.icon??""}" @change="${t=>this.setIcon(a,t.detail.value)}"></k-icon-selector>
          </div>
          ${this.renderMoveButtons(a)}
        </div>
      </k-accordion-panel>
    `}render(){return this.node?e`
      ${this.renderFields()}
      <div class="btn-grp full mb">
        <button class="primary" @click="${this.addTab}">Add tab</button>
        <button @click="${this.addSpacer}">Add spacer</button>
      </div>
      ${this.tabs.some(t=>"tab-item"===t.type)?e`
        <div class="mb">
          <label class="d-b mbq" for="pb-tabs-default">Default open tab<small class="d-b tc-muted">The first tab is open unless you pick another.</small></label>
          <select id="pb-tabs-default" class="full" @change="${t=>this.setDefault(t.target.value)}">
            ${this.tabs.map((t,a)=>"tab-item"===t.type?e`<option value="${t.id}" ?selected="${t.id===this.defaultTab.id}">${t.attrs?.label||`Tab ${a+1}`}</option>`:"")}
          </select>
        </div>`:""}
      <k-accordion>
        ${this.tabs.map((t,e)=>"tab-spacer"===t.type?this.renderSpacer(e):this.renderTab(t,e))}
      </k-accordion>
    `:""}}customElements.define("k-page-builder-tabs-settings",s);