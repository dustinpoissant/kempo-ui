import e from"./WidgetSettings.js";import t from"./PageBuilderFields.js";import{html as i,nothing as s}from"../../lit-all.min.js";import{resolveType as a}from"../MediaGallery.js";import"../Accordion.js";import"../Icon.js";const l=[{value:"",label:"Automatic (from the file)"},{value:"image",label:"Image"},{value:"video",label:"Video"},{value:"audio",label:"Audio"}];export default class r extends e{get items(){return Array.isArray(this.node.attrs?.items)?this.node.attrs.items:[]}editItems(e,t=!1){this.edit(t=>{const i=Array.isArray(t.attrs.items)?structuredClone(t.attrs.items):[];return t.attrs.items=e(i),!0},t)}addItem(){this.editItems(e=>[...e,{src:""}])}moveItem(e,t){this.editItems(i=>{const s=e+t;return s>=0&&s<i.length&&([i[e],i[s]]=[i[s],i[e]]),i})}removeItem(e){this.editItems(t=>t.filter((t,i)=>i!==e))}setItem(e,t,i){this.editItems(s=>(s[e]={...s[e],[t]:i},i||delete s[e][t],s),!0)}renderPicker(e,s,a,l,r,o,d){return i`
      <div class="mb">
        <label class="d-b mbq" for="${e}">${s}<small class="d-b tc-muted">${a}</small></label>
        ${t.pickers[l]({id:e,value:r[d]??"",change:e=>this.setItem(o,d,e)})}
      </div>
    `}renderItem(e,t){const r=`pb-gallery-item-${t}`,o=a(e.src??"",e.type),d=decodeURIComponent((e.src??"").split(/[?#]/)[0].split("/").pop()??"");return i`
      <k-accordion-header for-panel="${r}">${e.alt||d||`Item ${t+1}`}</k-accordion-header>
      <k-accordion-panel name="${r}">
        <div class="p">
          ${this.renderPicker(`${r}-src`,"Address","The address of the picture, video or sound.",["video","audio"].includes(o)?o:"image",e,t,"src")}
          <div class="mb">
            <label class="d-b mbq" for="${r}-type">Type<small class="d-b tc-muted">Automatic goes by the end of the address, and a picture when it is not recognised.</small></label>
            <select id="${r}-type" class="full" .value="${e.type??""}" @change="${e=>this.setItem(t,"type",e.target.value)}">
              ${l.map(t=>i`<option value="${t.value}" ?selected="${t.value===(e.type??"")}">${t.label}</option>`)}
            </select>
          </div>
          ${"video"===o||"audio"===o?this.renderPicker(`${r}-poster`,"video"===o?"Poster":"Cover art","video"===o?"The picture shown before the video plays.":"The picture shown above the player. Without one the visualizer fills the space.","image",e,t,"poster"):s}
          ${this.renderPicker(`${r}-thumb`,"Thumbnail","The small picture in the strip. Leave it empty to use the picture or poster.","image",e,t,"thumb")}
          <div class="mb">
            <label class="d-b mbq" for="${r}-alt">Alternative text<small class="d-b tc-muted">Describes the item for people who cannot see it.</small></label>
            <input id="${r}-alt" type="text" class="full" .value="${e.alt??""}" @input="${e=>this.setItem(t,"alt",e.target.value)}">
          </div>
          <div class="btn-grp">
            <button title="Move up" aria-label="Move up" ?disabled="${0===t}" @click="${()=>this.moveItem(t,-1)}"><k-icon name="arrow" direction="up"></k-icon></button>
            <button title="Move down" aria-label="Move down" ?disabled="${t===this.items.length-1}" @click="${()=>this.moveItem(t,1)}"><k-icon name="arrow" direction="down"></k-icon></button>
            <button class="danger" title="Remove" aria-label="Remove" @click="${()=>this.removeItem(t)}"><k-icon name="delete"></k-icon></button>
          </div>
        </div>
      </k-accordion-panel>
    `}render(){return this.node?i`
      ${this.renderFields()}
      <div class="mb">
        <button class="primary full" @click="${this.addItem}">Add item</button>
      </div>
      <k-accordion>
        ${this.items.map((e,t)=>this.renderItem(e,t))}
      </k-accordion>
    `:""}}customElements.define("k-page-builder-media-gallery-settings",r);