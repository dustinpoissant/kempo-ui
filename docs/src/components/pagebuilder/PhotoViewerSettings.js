import t from"./WidgetSettings.js";import e from"./PageBuilderFields.js";import{html as o}from"../../lit-all.min.js";import"../Accordion.js";import"../Icon.js";import s from"../../utils/imageSize.js";export default class i extends t{get photos(){return Array.isArray(this.node.attrs?.images)?this.node.attrs.images:[]}editPhotos(t,e=!1){this.edit(e=>{const o=Array.isArray(e.attrs.images)?structuredClone(e.attrs.images):[];return e.attrs.images=t(o),!0},e)}addPhoto(){this.editPhotos(t=>[...t,{src:"",alt:""}])}choosePhotos=async()=>{const t=await(window.kempo?.openAssetPicker?.({multiple:!0}));if(!t?.length)return;const e=this.photos.length;this.editPhotos(e=>[...e,...t.map(({url:t,alt:e})=>({src:t,alt:e}))]),t.forEach(({url:t},o)=>this.measurePhoto(e+o,t))};movePhoto(t,e){this.editPhotos(o=>{const s=t+e;return s>=0&&s<o.length&&([o[t],o[s]]=[o[s],o[t]]),o})}removePhoto(t){this.editPhotos(e=>e.filter((e,o)=>o!==t))}setPhoto(t,e,o){this.editPhotos(s=>(s[t]={...s[t],[e]:o},"src"===e&&(delete s[t].width,delete s[t].height),s),!0),"src"===e&&this.measurePhoto(t,o)}async measurePhoto(t,e){const o=this.node.id,i=await s(e);i&&this.host.editWidget(o,o=>{if(o.attrs.images?.[t]?.src!==e)return!1;const s=structuredClone(o.attrs.images);return s[t]={...s[t],width:i.width,height:i.height},o.attrs.images=s,!0},!0)}renderPhoto(t,s){const i=`pb-photo-${s}`;return o`
      <k-accordion-header for-panel="${i}">${t.alt||t.src||`Photo ${s+1}`}</k-accordion-header>
      <k-accordion-panel name="${i}">
        <div class="p">
          <div class="mb">
            <label class="d-b mbq" for="${i}-src">Address<small class="d-b tc-muted">The address of the picture.</small></label>
            ${e.pickers.image({id:`${i}-src`,value:t.src??"",change:t=>this.setPhoto(s,"src",t)})}
          </div>
          <div class="mb">
            <label class="d-b mbq" for="${i}-alt">Alternative text<small class="d-b tc-muted">Describes the picture for people who cannot see it.</small></label>
            <input id="${i}-alt" type="text" class="full" .value="${t.alt??""}" @input="${t=>this.setPhoto(s,"alt",t.target.value)}">
          </div>
          <div class="mb">
            <label class="d-b mbq" for="${i}-caption">Caption<small class="d-b tc-muted">Shown under the picture. Leave it empty for no caption.</small></label>
            <input id="${i}-caption" type="text" class="full" .value="${t.caption??""}" @input="${t=>this.setPhoto(s,"caption",t.target.value)}">
          </div>
          <div class="btn-grp">
            <button title="Move up" aria-label="Move up" ?disabled="${0===s}" @click="${()=>this.movePhoto(s,-1)}"><k-icon name="arrow" direction="up"></k-icon></button>
            <button title="Move down" aria-label="Move down" ?disabled="${s===this.photos.length-1}" @click="${()=>this.movePhoto(s,1)}"><k-icon name="arrow" direction="down"></k-icon></button>
            <button class="danger" title="Remove" aria-label="Remove" @click="${()=>this.removePhoto(s)}"><k-icon name="delete"></k-icon></button>
          </div>
        </div>
      </k-accordion-panel>
    `}render(){return this.node?o`
      ${this.renderFields()}
      <div class="mb">
        ${window.kempo?.openAssetPicker?o`<button class="primary full" @click="${this.choosePhotos}"><k-icon name="image"></k-icon> Add photos</button>`:o`<button class="primary full" @click="${this.addPhoto}">Add photo</button>`}
      </div>
      <k-accordion>
        ${this.photos.map((t,e)=>this.renderPhoto(t,e))}
      </k-accordion>
    `:""}}customElements.define("k-page-builder-photo-viewer-settings",i);