import e from"../ShadowComponent.js";import{html as t,css as r}from"../../lit-all.min.js";import{firstSlotOf as i}from"../../utils/pageTree.js";import{widgetIcon as s,titleOf as o,hintOf as d,sectionLabelOf as a}from"../../utils/pageLabels.js";import"../Icon.js";export default class n extends e{static properties={nodes:{attribute:!1},registry:{attribute:!1},selection:{attribute:!1},host:{attribute:!1},collapsed:{state:!0},dropAt:{state:!0}};constructor(){super(),this.nodes=[],this.selection=[],this.collapsed=new Set,this.dropAt=null,this.dragId=null}static styles=r`
    :host { display: block; }
    ul { list-style: none; margin: 0; padding: 0; }
    ul ul { padding-left: 1rem; }
    .row { display: flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.375rem; border-radius: 0.25rem; cursor: pointer; border: 1px solid transparent; }
    .row:hover { background: var(--c_bg__alt, #8881); }
    .row.selected { background: var(--c_primary, #36f); color: #fff; }
    .row.before { box-shadow: inset 0 2px 0 0 var(--c_primary, #36f); }
    .row.after { box-shadow: inset 0 -2px 0 0 var(--c_primary, #36f); }
    .row.inside { box-shadow: inset 0 0 0 2px var(--c_primary, #36f); background: color-mix(in srgb, var(--c_primary, #36f) 20%, transparent); }
    .hint { opacity: 0.65; font-size: 0.85em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .slot { font-size: 0.8em; opacity: 0.6; padding: 0.25rem 0.375rem 0; }
    .twisty { width: 1rem; flex: none; background: none; border: 0; padding: 0; color: inherit; cursor: pointer; }
    .empty { padding: 0.75rem; opacity: 0.6; }
    .section-label { font-size: 0.8em; font-weight: bold; opacity: 0.75; padding: 0.25rem 0.375rem; border-radius: var(--radius); cursor: pointer; }
    .section-label.selected { opacity: 1; background: var(--c_bg__alt, #8882); }
    .section-label.inside { outline: 1px dashed var(--c_primary); }
  `;updated(e){e.has("selection")&&this.selection?.length&&this.renderRoot.querySelector(".row.selected")?.scrollIntoView({block:"nearest"})}handleDragStart=(e,t)=>{this.dragId=t,e.dataTransfer.setData("text/plain",t),e.dataTransfer.effectAllowed="move"};handleDragOver=(e,t)=>{if(!this.dragId||t===this.dragId)return;e.preventDefault();const r=this.zoneOf(e,e.currentTarget,t);this.dropAt?.id===t&&this.dropAt.zone===r||this.host.showDropTarget?.(t,r),this.dropAt={id:t,zone:r}};handleDrop=(e,t)=>{e.preventDefault();const r=this.dropAt?.zone||"after",i=this.dragId;this.clearDrag(),i&&i!==t&&this.host.dropOn(i,t,r)};clearDrag=()=>{this.dragId=null,this.dropAt=null,this.host.showDropTarget?.(null)};handleSectionDragOver(e,t){this.dragId&&t!==this.dragId&&(e.preventDefault(),this.dropAt?.id!==t&&this.host.showDropTarget?.(t,"inside"),this.dropAt={id:t,zone:"inside"})}toggle(e){const t=new Set(this.collapsed);t.has(e)?t.delete(e):t.add(e),this.collapsed=t}zoneOf(e,t,r){const s=t.getBoundingClientRect(),o=(e.clientY-s.top)/s.height,d=this.host.find(r);return d&&null!==i(this.registry,d.node)?o<.25?"before":o>.75?"after":"inside":o<.5?"before":"after"}renderRow(e){const r=this.registry.get(e.type),i=r?.slots||[],a=i.some(t=>e.slots?.[t.name]?.length),n=this.selection.includes(e.id),l=this.dropAt?.id===e.id?this.dropAt.zone:"",h=d(e);return t`
      <li>
        <div class="row ${n?"selected":""} ${l}" draggable="true" data-id="${e.id}"
          @click="${t=>this.host.select(e.id,{additive:t.ctrlKey||t.metaKey||t.shiftKey})}"
          @dragstart="${t=>this.handleDragStart(t,e.id)}"
          @dragover="${t=>this.handleDragOver(t,e.id)}"
          @drop="${t=>this.handleDrop(t,e.id)}"
          @dragend="${this.clearDrag}">
          ${a?t`<button class="twisty no-btn" aria-label="Show or hide what is inside" @click="${t=>{t.stopPropagation(),this.toggle(e.id)}}"><k-icon name="chevron" direction="${this.collapsed.has(e.id)?"right":"down"}"></k-icon></button>`:t`<span class="twisty"></span>`}
          ${s(r)}
          <span>${o(this.registry,e)}</span>
          ${h?t`<span class="hint">${h}</span>`:""}
        </div>
        ${a&&!this.collapsed.has(e.id)?t`
          ${i.map(r=>e.slots?.[r.name]?.length?t`
            ${i.length>1?t`<div class="slot">${r.label||r.name}</div>`:""}
            <ul>${this.renderChildren(e.slots[r.name])}</ul>
          `:"")}
        `:""}
      </li>
    `}renderChildren(e){return e.map((e,t)=>this.registry.get(e.type)?.section?this.renderSection(e,t):this.renderRow(e))}renderSection(e,r){const i=this.selection.includes(e.id),s=this.dropAt?.id===e.id?"inside":"",o=e.slots?.default??[];return t`
      <li class="section">
        <div class="section-label ${i?"selected":""} ${s}" data-id="${e.id}"
          @click="${t=>this.host.select(e.id,{additive:t.ctrlKey||t.metaKey||t.shiftKey})}"
          @dragover="${t=>this.handleSectionDragOver(t,e.id)}"
          @drop="${t=>this.handleDrop(t,e.id)}">${a(e,r)}</div>
        ${o.length?t`<ul>${this.renderChildren(o)}</ul>`:""}
      </li>
    `}render(){return this.nodes?.length?t`<ul role="tree">${this.renderChildren(this.nodes)}</ul>`:t`<div class="empty">No widgets yet.</div>`}}customElements.define("k-page-builder-tree",n);