import t from"./WidgetSettings.js";import{html as e}from"../../lit-all.min.js";import{defaultNode as l}from"../../utils/pageTree.js";import{COLUMN_WIDTH_OPTIONS as o,columnWidth as n}from"../../utils/pageWidgetDefaults.js";import"../Accordion.js";import"../Icon.js";const s=[{name:"desktop",label:"Desktop width",hint:"Screens 1024px and wider."},{name:"tablet",label:"Tablet width",hint:"Screens from 769px to 1023px."},{name:"mobile",label:"Mobile width",hint:"Screens 768px and narrower. A full width column stacks on its own."}];export default class i extends t{get columns(){return this.node.slots?.default||[]}addColumn(){this.edit(t=>(t.slots.default.push(l(this.registry,"column")),!0))}moveColumn(t,e){this.edit(l=>{const o=l.slots.default,n=t+e;return n<0||n>=o.length?"That column cannot move there":([o[t],o[n]]=[o[n],o[t]],!0)})}removeColumn(t){this.edit(e=>{const l=e.slots.default;if(l.length<2)return"Columns need at least one column";const[o]=l.splice(t,1);return l[Math.max(0,t-1)].slots.default.push(...o.slots.default||[]),!0})}setWidth(t,e,l){this.edit(o=>(o.slots.default[t].attrs[e]=l,!0))}renderColumn(t,l){const i=`pb-column-${l}`,a=t.attrs||{};return e`
      <k-accordion-header for-panel="${i}">Column ${l+1}</k-accordion-header>
      <k-accordion-panel name="${i}">
        <div class="p">
          ${s.map(({name:t,label:s,hint:r})=>e`
            <div class="mb">
              <label class="d-b mbq" for="${i}-${t}">${s}<small class="d-b tc-muted">${r}</small></label>
              <select id="${i}-${t}" class="full" @change="${e=>this.setWidth(l,t,e.target.value)}">
                ${o.map(l=>e`<option value="${l.value}" ?selected="${String(l.value)===String(n(a,t))}">${l.label}</option>`)}
              </select>
            </div>`)}
          <div class="btn-grp">
            <button title="Move left" aria-label="Move left" ?disabled="${0===l}" @click="${()=>this.moveColumn(l,-1)}"><k-icon name="arrow" direction="left"></k-icon></button>
            <button title="Move right" aria-label="Move right" ?disabled="${l===this.columns.length-1}" @click="${()=>this.moveColumn(l,1)}"><k-icon name="arrow" direction="right"></k-icon></button>
            <button class="danger" title="Remove column" aria-label="Remove column" ?disabled="${this.columns.length<2}" @click="${()=>this.removeColumn(l)}"><k-icon name="delete"></k-icon></button>
          </div>
        </div>
      </k-accordion-panel>
    `}render(){return this.node?e`
      <div class="mb">
        <button class="primary full" @click="${this.addColumn}">Add column</button>
      </div>
      <k-accordion>
        ${this.columns.map((t,e)=>this.renderColumn(t,e))}
      </k-accordion>
    `:""}}customElements.define("k-page-builder-columns-settings",i);