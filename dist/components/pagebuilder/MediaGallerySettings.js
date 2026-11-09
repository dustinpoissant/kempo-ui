import e from"./WidgetSettings.js";import t from"./PageBuilderFields.js";import i from"../Toast.js";import{html as s,nothing as o}from"../../lit-all.min.js";import{resolveType as a}from"../MediaGallery.js";import"../Accordion.js";import"../Icon.js";const r=[{value:"",label:"Automatic (from the file)"},{value:"image",label:"Image"},{value:"video",label:"Video"},{value:"audio",label:"Audio"}];export default class l extends e{get items(){return Array.isArray(this.node.attrs?.items)?this.node.attrs.items:[]}editItems(e,t=!1){this.edit(t=>{const i=Array.isArray(t.attrs.items)?structuredClone(t.attrs.items):[];return t.attrs.items=e(i),!0},t)}addItem(){this.editItems(e=>[...e,{src:""}])}chooseItems=async()=>{const e=await(window.kempo?.openAssetPicker?.({kind:"",multiple:!0}));if(!e?.length)return;const t=await Promise.all(e.map(async({url:e,alt:t,kind:i,thumbnail:s})=>({src:e,...["image","video","audio"].includes(i)?{type:i}:{},...t?{alt:t}:{},..."audio"===i&&s?{thumb:s}:{},..."video"===i?await this.frameOf(e):{}})));this.editItems(e=>[...e,...t])};moveItem(e,t){this.editItems(i=>{const s=e+t;return s>=0&&s<i.length&&([i[e],i[s]]=[i[s],i[e]]),i})}removeItem(e){this.editItems(t=>t.filter((t,i)=>i!==e))}async frameOf(e){const t=await(window.kempo?.coverFor?.(e,"md"));return t?{poster:t}:{}}async useFrame(e,t){const s=await(window.kempo?.coverFor?.(t,"md"));s?this.setItem(e,"poster",s):i.error("This video has no frame yet")}async useCover(e,t){const s=await(window.kempo?.coverFor?.(t));s?this.setItem(e,"thumb",s):i.error("This sound has no album cover")}setItem(e,t,i){this.editItems(s=>(s[e]={...s[e],[t]:i},i||delete s[e][t],s),!0)}renderPicker(e,i,o,a,r,l,d){return s`
      <div class="mb">
        <label class="d-b mbq" for="${e}">${i}<small class="d-b tc-muted">${o}</small></label>
        ${t.pickers[a]({id:e,value:r[d]??"",change:e=>this.setItem(l,d,e)})}
      </div>
    `}renderItem(e,t){const i=`pb-gallery-item-${t}`,l=a(e.src??"",e.type),d=decodeURIComponent((e.src??"").split(/[?#]/)[0].split("/").pop()??"");return s`
      <k-accordion-header for-panel="${i}">${e.alt||d||`Item ${t+1}`}</k-accordion-header>
      <k-accordion-panel name="${i}">
        <div class="p">
          ${this.renderPicker(`${i}-src`,"Address","The address of the picture, video or sound.",["video","audio"].includes(l)?l:"image",e,t,"src")}
          <div class="mb">
            <label class="d-b mbq" for="${i}-type">Type<small class="d-b tc-muted">Automatic goes by the end of the address, and a picture when it is not recognised.</small></label>
            <select id="${i}-type" class="full" .value="${e.type??""}" @change="${e=>this.setItem(t,"type",e.target.value)}">
              ${r.map(t=>s`<option value="${t.value}" ?selected="${t.value===(e.type??"")}">${t.label}</option>`)}
            </select>
          </div>
          ${"video"===l||"audio"===l?this.renderPicker(`${i}-poster`,"video"===l?"Poster":"Cover art","video"===l?"The picture shown before the video plays.":"The picture shown above the player. Without one the visualizer fills the space.","image",e,t,"poster"):o}
          ${this.renderPicker(`${i}-thumb`,"Thumbnail","The small picture in the strip. Leave it empty to use the picture or poster.","image",e,t,"thumb")}
          ${"audio"===l&&window.kempo?.coverFor?s`
            <div class="mb">
              <button class="full" @click="${()=>this.useCover(t,e.src)}"><k-icon name="image"></k-icon> Use album cover</button>
            </div>`:o}
          ${"video"===l&&window.kempo?.coverFor?s`
            <div class="mb">
              <button class="full" @click="${()=>this.useFrame(t,e.src)}"><k-icon name="image"></k-icon> Use a frame of the video</button>
            </div>`:o}
          <div class="mb">
            <label class="d-b mbq" for="${i}-alt">Alternative text<small class="d-b tc-muted">Describes the item for people who cannot see it.</small></label>
            <input id="${i}-alt" type="text" class="full" .value="${e.alt??""}" @input="${e=>this.setItem(t,"alt",e.target.value)}">
          </div>
          <div class="btn-grp">
            <button title="Move up" aria-label="Move up" ?disabled="${0===t}" @click="${()=>this.moveItem(t,-1)}"><k-icon name="arrow" direction="up"></k-icon></button>
            <button title="Move down" aria-label="Move down" ?disabled="${t===this.items.length-1}" @click="${()=>this.moveItem(t,1)}"><k-icon name="arrow" direction="down"></k-icon></button>
            <button class="danger" title="Remove" aria-label="Remove" @click="${()=>this.removeItem(t)}"><k-icon name="delete"></k-icon></button>
          </div>
        </div>
      </k-accordion-panel>
    `}render(){return this.node?s`
      ${this.renderFields()}
      <div class="mb">
        ${window.kempo?.openAssetPicker?s`<button class="primary full" @click="${this.chooseItems}"><k-icon name="image"></k-icon> Add media</button>`:s`<button class="primary full" @click="${this.addItem}">Add item</button>`}
      </div>
      <k-accordion>
        ${this.items.map((e,t)=>this.renderItem(e,t))}
      </k-accordion>
    `:""}}customElements.define("k-page-builder-media-gallery-settings",l);