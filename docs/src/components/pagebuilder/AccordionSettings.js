import t from"./WidgetSettings.js";import{html as e}from"../../lit-all.min.js";import{defaultNode as i,sectionOpen as o}from"../../utils/pageTree.js";import"../Accordion.js";import"../Icon.js";import"../Toggle.js";import"../IconSelector.js";export default class s extends t{get sections(){return this.node.slots?.default||[]}addSection(){this.edit(t=>(t.slots.default=t.slots.default||[],t.slots.default.push(i(this.registry,"accordion-item")),!0))}moveSection(t,e){this.edit(i=>{const o=i.slots.default,s=t+e;return s<0||s>=o.length?"That section cannot move there":([o[t],o[s]]=[o[s],o[t]],!0)})}removeSection(t){this.edit(e=>(e.slots.default.splice(t,1),!0))}setTitle(t,e){this.edit(i=>(i.slots.default[t].attrs.title=e,!0),!0)}setOpen(t,e){this.edit(i=>{const s=i.slots.default,l=s.map(t=>o(t,i));return l[t]=e,e&&!i.attrs?.multiple&&l.fill(!1).splice(t,1,!0),s.forEach((t,e)=>{t.attrs=t.attrs||{},t.attrs.open=l[e]}),!0})}setIcon(t,e){this.edit(i=>(i.slots.default[t].attrs.icon=e,!0))}renderSection(t,i){const s=`pb-section-${i}`;return e`
      <k-accordion-header for-panel="${s}">${t.attrs?.title||`Section ${i+1}`}</k-accordion-header>
      <k-accordion-panel name="${s}">
        <div class="p">
          <div class="mb">
            <label class="d-b mbq" for="${s}-title">Heading</label>
            <input id="${s}-title" type="text" class="full" .value="${t.attrs?.title??""}" @input="${t=>this.setTitle(i,t.target.value)}">
          </div>
          <div class="mb">
            <label class="d-b mbq" for="${s}-icon">Icon<small class="d-b tc-muted">Shown in front of the heading. Leave it empty for no icon.</small></label>
            <k-icon-selector id="${s}-icon" class="full" placeholder="No icon" allow-clear .value="${t.attrs?.icon??""}" @change="${t=>this.setIcon(i,t.detail.value)}"></k-icon-selector>
          </div>
          <div class="mb">
            <k-toggle id="${s}-open" .value="${o(t,this.node)}" @change="${e=>e.detail.value!==o(t,this.node)&&this.setOpen(i,e.detail.value)}">Open by default</k-toggle>
          </div>
          <div class="btn-grp">
            <button title="Move up" aria-label="Move up" ?disabled="${0===i}" @click="${()=>this.moveSection(i,-1)}"><k-icon name="arrow" direction="up"></k-icon></button>
            <button title="Move down" aria-label="Move down" ?disabled="${i===this.sections.length-1}" @click="${()=>this.moveSection(i,1)}"><k-icon name="arrow" direction="down"></k-icon></button>
            <button class="danger" title="Remove" aria-label="Remove" @click="${()=>this.removeSection(i)}"><k-icon name="delete"></k-icon></button>
          </div>
        </div>
      </k-accordion-panel>
    `}render(){return this.node?e`
      ${this.renderFields()}
      <div class="mb">
        <button class="primary full" @click="${this.addSection}">Add section</button>
      </div>
      <k-accordion>
        ${this.sections.map((t,e)=>this.renderSection(t,e))}
      </k-accordion>
    `:""}}customElements.define("k-page-builder-accordion-settings",s);