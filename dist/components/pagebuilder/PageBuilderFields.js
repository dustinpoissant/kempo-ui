import e from"../ShadowComponent.js";import{html as t,css as i}from"../../lit-all.min.js";import{attributeDefault as a}from"../../utils/pageTree.js";import"../Toggle.js";import"../ColorPicker.js";import l from"../IconSelector.js";["facebook","x","instagram","youtube","linkedin","tiktok","github-mark"].forEach(e=>l.add(e));const s=["json"],n=["html","code","markdown"],r=({id:e,value:i,change:a})=>t`<input id="${e}" type="text" class="full" .value="${i}" @input="${e=>a(e.target.value,!0)}">`;export default class d extends e{static properties={node:{attribute:!1},widget:{attribute:!1},host:{attribute:!1},version:{type:Number},exclude:{attribute:!1}};static pickers={image:r,video:r,audio:r,icon:({id:e,value:i,change:a})=>t`<k-icon-selector id="${e}" class="full" placeholder="No icon" allow-clear .value="${i}" @change="${e=>a(e.detail.value)}"></k-icon-selector>`};constructor(){super(),this.exclude=[]}set(e,t,i=!0){this.host.setWidgetAttribute(this.node.id,e,t,i)}valueNamed(e){const t=this.widget.attributes.find(t=>t.name===e)||{};return this.node.attrs?.[e]??a(t)}renderField(e){const i=`pb-field-${e.name}`,a=this.valueNamed(e.name),l=t`${e.label||e.name}${e.hint?t`<small class="d-b tc-muted">${e.hint}</small>`:""}`;if("boolean"===e.type)return t`
        <k-toggle id="${i}" .value="${!!a}" @change="${t=>t.detail.value!==!!a&&this.set(e.name,t.detail.value,!1)}">${l}</k-toggle>`;if("select"===e.type)return t`
        <div class="mb">
          <label class="d-b mbq" for="${i}">${l}</label>
          <select id="${i}" class="full" @change="${t=>this.set(e.name,t.target.value,!1)}">
            ${(e.options||[]).map(e=>t`<option value="${e.value}" ?selected="${String(e.value)===String(a)}">${e.label}</option>`)}
          </select>
        </div>`;if("text"===e.type)return t`
        <div class="mb">
          <label class="d-b mbq" for="${i}">${l}</label>
          <textarea id="${i}" class="full" rows="4" .value="${String(a??"")}" @input="${t=>this.set(e.name,t.target.value)}"></textarea>
        </div>`;if("number"===e.type){const s=this.widget.attributes.find(t=>t.beside===e.name),n=t`<input id="${i}" type="number" class="full" min="${e.min??""}" max="${e.max??""}" .value="${String(a??"")}" @input="${t=>this.set(e.name,""===t.target.value?"":Number(t.target.value))}">`;return t`
        <div class="mb">
          <label class="d-b mbq" for="${i}">${l}</label>
          ${s?t`<div class="with-unit">${n}<select aria-label="${s.label||s.name}" @change="${e=>this.set(s.name,e.target.value,!1)}">${(s.options||[]).map(e=>t`<option value="${e.value}" ?selected="${String(e.value)===String(this.valueNamed(s.name))}">${e.label}</option>`)}</select></div>`:n}
        </div>`}return Object.hasOwn(d.pickers,e.type)?t`
        <div class="mb">
          <label class="d-b mbq" for="${i}">${l}</label>
          ${d.pickers[e.type]({id:i,value:String(a??""),change:(t,i=!1)=>this.set(e.name,t,i)})}
        </div>`:"color"===e.type?t`
        <div class="mb">
          <label class="d-b mbq" for="${i}">${l}</label>
          <div class="d-f">
            <k-color-picker id="${i}" format="hex" class="flex" .value="${String(a||"#000000")}" @change="${t=>this.set(e.name,t.target.value,!1)}"></k-color-picker>
            <button class="mlq" ?disabled="${!a}" @click="${()=>this.set(e.name,"",!1)}">Reset</button>
          </div>
        </div>`:t`
      <div class="mb">
        <label class="d-b mbq" for="${i}">${l}</label>
        <input id="${i}" type="text" class="full" .value="${String(a??"")}" @input="${t=>this.set(e.name,t.target.value)}">
      </div>`}static styles=i`
    .with-unit {
      display: flex;
      gap: 0.5rem;
    }
    .with-unit input {
      flex: 1;
      min-width: 0;
    }
    .with-unit select {
      width: auto;
    }
  `;render(){if(!this.node||!this.widget)return"";const e=this.widget.attributes.filter(e=>!this.exclude.includes(e.name)&&!s.includes(e.type)&&!e.beside&&!n.includes(e.name)&&Object.entries(e.when||{}).every(([e,t])=>String(this.valueNamed(e))===t));return t`${e.map(e=>this.renderField(e))}`}}customElements.define("k-page-builder-fields",d);