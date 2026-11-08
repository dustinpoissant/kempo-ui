import{html as e,css as t,nothing as i,keyed as r,render as o}from"../lit-all.min.js";import s from"./ShadowComponent.js";import{boolExists as n,boolTrueFalse as l}from"../utils/propConverters.js";import"./Icon.js";const a=new Map,c=new Map,h=new Set,d=new WeakMap,u=new WeakMap,m=["type","thumb","class","style"];export const resolveType=(e,t)=>a.has(t)?t:c.get(e.split(/[?#]/)[0].split(".").pop().toLowerCase())??"image";const g=Symbol(),b=Symbol(),p=Symbol();export class MediaGalleryItem extends HTMLElement{connectedCallback(){this.style.display="none"}get src(){return this.getAttribute("src")??""}get alt(){return this.getAttribute("alt")??""}get poster(){return this.getAttribute("poster")??""}get type(){return e=this.src,t=this.getAttribute("type"),a.has(t)?t:c.get(e.split(/[?#]/)[0].split(".").pop().toLowerCase())??"image";var e,t}get definition(){return a.get(this.type)}get thumb(){return this.getAttribute("thumb")||this.definition.thumb?.(this)||""}}customElements.define("k-media-gallery-item",MediaGalleryItem);export default class f extends s{static properties={index:{type:Number,reflect:!0},thumbsPosition:{type:String,reflect:!0,attribute:"thumbs-position"},ratio:{type:String,reflect:!0},controls:{type:String,reflect:!0},visualizer:{type:String,reflect:!0},fullscreen:{type:Boolean,reflect:!0,converter:n},noFullscreen:{type:Boolean,reflect:!0,attribute:"no-fullscreen",converter:n},keyboardControls:{type:Boolean,reflect:!0,attribute:"keyboard-controls",converter:l}};constructor(){super(),this[g]=null,this[b]=null,this[p]=new MutationObserver(e=>{e.some(e=>e.target!==this)&&this.requestUpdate()}),this.index=0,this.thumbsPosition="left",this.ratio="1/1",this.controls="minimal",this.visualizer="bars",this.fullscreen=!1,this.noFullscreen=!1,this.keyboardControls=!0}connectedCallback(){super.connectedCallback(),h.add(this),this[p].observe(this,{attributes:!0,subtree:!0})}disconnectedCallback(){super.disconnectedCallback(),h.delete(this),this[p].disconnect(),document.removeEventListener("keydown",this.handleDocumentKeydown),this.fullscreen&&document.body.classList.remove("no-scroll")}willUpdate(){this.items.length&&(this.index=Math.min(Math.max(this.index,0),this.items.length-1))}updated(e){if(super.updated(e),e.has("index")||e.has("fullscreen")){const e=this.items;this.shadowRoot.querySelectorAll(".slide").forEach((t,i)=>{if(!t.firstElementChild||!this.fullscreen&&i===this.index)return;const{pause:r=e=>e.pause?.()}=e[i].definition;r(t.firstElementChild)})}if(void 0!==e.get("index")&&this.dispatchEvent(new CustomEvent("change",{detail:{index:this.index}})),(e.has("index")||e.has("fullscreen")||e.has("thumbsPosition"))&&this.shadowRoot.querySelectorAll(".thumbs").forEach(e=>{const t=e.children[this.index];t&&e.scrollTo({left:t.offsetLeft-(e.clientWidth-t.offsetWidth)/2,top:t.offsetTop-(e.clientHeight-t.offsetHeight)/2,behavior:"smooth"})}),e.has("fullscreen")){this.dispatchEvent(new CustomEvent("fullscreenchange",{detail:{fullscreen:this.fullscreen}})),document.body.classList.toggle("no-scroll",this.fullscreen);const e=window.kempo?.overlayRoot?this.closest(window.kempo.overlayRoot):null;e?.classList.toggle("no-scroll",this.fullscreen),this.fullscreen?document.addEventListener("keydown",this.handleDocumentKeydown):document.removeEventListener("keydown",this.handleDocumentKeydown)}}get items(){return Array.from(this.children).filter(e=>"K-MEDIA-GALLERY-ITEM"===e.tagName)}static register(e,t={}){if(!t.tag&&!t.render)throw new Error(`MediaGallery.register('${e}') needs a "tag" or a "render" function`);const i=(t.extensions??[e]).map(e=>e.toLowerCase().replace(/^\./,""));var r,o;return a.set(e,{label:e,...t,extensions:i,render:t.render??(r=t.tag,o=t.shared,(e,{fullscreen:t})=>{const i=d.get(e)??{};d.set(e,i);const s=t&&!o?"fullscreen":"inline";i[s]?.node.localName!==r&&(i[s]={node:document.createElement(r),copied:new Set});const{node:n,copied:l}=i[s];n.classList.add("media"),n.toggleAttribute("fullscreen",t);const a=e.getAttributeNames().filter(e=>!m.includes(e));return l.forEach(e=>!a.includes(e)&&n.removeAttribute(e)),l.clear(),a.forEach(t=>{l.add(t),n.getAttribute(t)!==e.getAttribute(t)&&n.setAttribute(t,e.getAttribute(t))}),n})}),i.forEach(t=>c.set(t,e)),h.forEach(e=>e.requestUpdate()),this}static unregister(e){return a.delete(e),c.forEach((t,i)=>t===e&&c.delete(i)),h.forEach(e=>e.requestUpdate()),this}addItem(e={},t=this.items.length){const i=document.createElement("k-media-gallery-item");return Object.entries(e).forEach(([e,t])=>i.setAttribute(e,t)),this.insertBefore(i,this.items[t]??null),i}removeItem(e){return this.items[e]?.remove(),this}goTo(e){const t=this.items.length;return t&&(this.index=(e%t+t)%t),this}next(){return this.goTo(this.index+1)}previous(){return this.goTo(this.index-1)}open(){return this.noFullscreen||(this.fullscreen=!0),this}close(){return this.fullscreen=!1,this}toggle(){return this.fullscreen=!this.fullscreen,this}handleKeydown=e=>{!this.keyboardControls||this.fullscreen||e.target.closest?.("k-video")||("ArrowLeft"===e.key?this.previous():"ArrowRight"===e.key&&this.next())};handleDocumentKeydown=e=>{this.keyboardControls&&("Escape"===e.key?this.close():"ArrowLeft"===e.key?this.previous():"ArrowRight"===e.key&&this.next())};handleBackdropClick=e=>{e.target===e.currentTarget&&this.close()};handleThumbsWheel=e=>{const t=e.currentTarget,i=e.deltaY<0?t.scrollLeft<=0:t.scrollLeft>=t.scrollWidth-t.clientWidth-1;t.scrollWidth<=t.clientWidth||Math.abs(e.deltaY)<Math.abs(e.deltaX)||i||(t.scrollLeft+=e.deltaY,e.preventDefault())};handleThumbsPointerDown=e=>{if("mouse"!==e.pointerType||0!==e.button)return;const t=e.currentTarget;this[b]={x:e.clientX,y:e.clientY,left:t.scrollLeft,top:t.scrollTop,active:!1}};handleThumbsPointerMove=e=>{const t=this[b];if(!t)return;const i=e.currentTarget,r=e.clientX-t.x,o=e.clientY-t.y;if(!t.active){if(Math.hypot(r,o)<5)return;t.active=!0,i.setPointerCapture(e.pointerId),i.classList.add("dragging")}i.scrollLeft=t.left-r,i.scrollTop=t.top-o};handleThumbsPointerEnd=e=>{this[b]=null,e.currentTarget.classList.remove("dragging")};handlePointerDown=e=>{"mouse"===e.pointerType||this.items.length<2||(this[g]={x:e.clientX,dx:0})};handlePointerMove=e=>{const t=this[g];if(!t)return;t.dx=e.clientX-t.x;const i=this.shadowRoot.querySelector(".track");i.classList.add("dragging"),i.style.setProperty("--drag",`${t.dx}px`)};handlePointerEnd=e=>{const t=this[g];if(!t)return;this[g]=null;const i=this.shadowRoot.querySelector(".track");i.classList.remove("dragging"),i.style.removeProperty("--drag"),"pointerup"!==e.type||Math.abs(t.dx)<50||(t.dx<0?this.next():this.previous())};renderThumbs(t,r=""){return e`
      <div
        class="thumbs ${r}"
        part="thumbs"
        @wheel=${this.handleThumbsWheel}
        @pointerdown=${this.handleThumbsPointerDown}
        @pointermove=${this.handleThumbsPointerMove}
        @pointerup=${this.handleThumbsPointerEnd}
        @pointercancel=${this.handleThumbsPointerEnd}
      >
        ${t.map((t,r)=>e`
          <button
            class="thumb no-btn"
            ?selected=${r===this.index}
            aria-label="Show ${t.definition.label} ${r+1}"
            aria-current=${r===this.index?"true":"false"}
            @click=${()=>this.goTo(r)}
          >
            ${t.thumb?e`<img src=${t.thumb} alt="" loading="lazy" draggable="false" />`:i}
            ${t.definition.icon?e`<span class="badge"><k-icon name=${t.definition.icon}></k-icon></span>`:i}
          </button>
        `)}
      </div>
    `}renderSlide(t,r){const{load:o,render:s,shared:n}=t.definition;return o?.(),e`
      <div class="slide" ?inert=${r!==this.index}>
        ${this.fullscreen&&n&&r===this.index?i:s(t,{gallery:this,fullscreen:!1,active:r===this.index})}
      </div>
    `}renderLightbox(t){const o=t[this.index];return e`
      <div id="lightbox" role="dialog" aria-modal="true" aria-label="Media gallery" @click=${this.handleBackdropClick}>
        ${t.length>1?e`<span id="counter">${this.index+1} / ${t.length}</span>`:i}
        <button id="close" class="lightbox-btn no-btn" aria-label="Close" @click=${this.close}>
          <k-icon name="close"></k-icon>
        </button>
        ${t.length>1?e`
          <button id="lightbox-prev" class="lightbox-btn lightbox-arrow no-btn" aria-label="Previous" @click=${this.previous}>
            <k-icon name="chevron" direction="left"></k-icon>
          </button>
          <button id="lightbox-next" class="lightbox-btn lightbox-arrow no-btn" aria-label="Next" @click=${this.next}>
            <k-icon name="chevron"></k-icon>
          </button>
        `:i}
        <div id="lightbox-stage" @click=${this.handleBackdropClick}>
          ${r(this.index,o.definition.render(o,{gallery:this,fullscreen:!0,active:!0}))}
        </div>
        ${t.length>1?this.renderThumbs(t,"lightbox-thumbs"):i}
      </div>
    `}render(){const t=this.items,r=t.length>1;return e`
      <div id="gallery" part="gallery" style="--ratio: ${this.ratio||"1/1"}" @keydown=${this.handleKeydown}>
        ${r?this.renderThumbs(t):i}
        <div
          class="stage"
          part="stage"
          @pointerdown=${this.handlePointerDown}
          @pointermove=${this.handlePointerMove}
          @pointerup=${this.handlePointerEnd}
          @pointercancel=${this.handlePointerEnd}
        >
          <div class="track" style="--index: ${this.index}">
            ${t.map((e,t)=>this.renderSlide(e,t))}
          </div>
          ${r?e`
            <button class="arrow prev no-btn" aria-label="Previous" @click=${this.previous}>
              <k-icon name="chevron" direction="left"></k-icon>
            </button>
            <button class="arrow next no-btn" aria-label="Next" @click=${this.next}>
              <k-icon name="chevron"></k-icon>
            </button>
          `:i}
        </div>
      </div>
      ${this.fullscreen&&t.length?this.renderLightbox(t):i}
    `}static styles=t`
    :host {
      display: block;
      --thumb_size: 4rem;
      --thumb_gap: 0.5rem;
    }
    #gallery {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: var(--thumb_gap);
    }
    :host([thumbs-position="bottom"]) #gallery {
      flex-direction: column-reverse;
    }
    :host([thumbs-position="left"]) #gallery {
      padding-left: calc(var(--thumb_size) + 4px + var(--thumb_gap));
    }
    :host([thumbs-position="right"]) #gallery {
      padding-right: calc(var(--thumb_size) + 4px + var(--thumb_gap));
    }
    .thumbs {
      position: relative;
      box-sizing: border-box;
      display: flex;
      gap: var(--thumb_gap);
      padding: 2px;
      overflow-x: auto;
      overflow-y: hidden;
      scrollbar-width: none;
      flex: none;
    }
    .thumbs::-webkit-scrollbar {
      display: none;
    }
    .thumbs.dragging, .thumbs.dragging .thumb {
      cursor: grabbing;
      user-select: none;
    }
    :host([thumbs-position="left"]) #gallery > .thumbs,
    :host([thumbs-position="right"]) #gallery > .thumbs {
      position: absolute;
      top: 0;
      bottom: 0;
      width: calc(var(--thumb_size) + 4px);
      flex-direction: column;
      overflow-x: hidden;
      overflow-y: auto;
    }
    :host([thumbs-position="left"]) #gallery > .thumbs {
      left: 0;
    }
    :host([thumbs-position="right"]) #gallery > .thumbs {
      right: 0;
    }
    .thumb {
      position: relative;
      flex: none;
      box-sizing: border-box;
      width: var(--thumb_size);
      height: var(--thumb_size);
      padding: 0;
      overflow: hidden;
      border: 2px solid transparent;
      border-radius: var(--radius);
      background: var(--c_bg__alt);
      cursor: pointer;
    }
    .thumb[selected] {
      border-color: var(--c_primary);
    }
    .thumb:focus-visible {
      box-shadow: var(--focus_shadow);
      outline: none;
    }
    .thumb img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .badge {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1.75rem;
      height: 1.75rem;
      border-radius: 50%;
      background: var(--c_bg);
      color: var(--tc);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
    }
    .stage {
      position: relative;
      overflow: hidden;
      aspect-ratio: var(--ratio);
      border-radius: var(--radius);
      background: var(--c_bg__alt);
      touch-action: pan-y;
    }
    .track {
      display: flex;
      height: 100%;
      transform: translateX(calc(var(--index) * -100% + var(--drag, 0px)));
      transition: transform var(--animation_ms) ease;
    }
    .track.dragging {
      transition: none;
    }
    .slide {
      flex: 0 0 100%;
      min-width: 0;
      height: 100%;
    }
    .slide > img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
      cursor: zoom-in;
      outline: none;
      user-select: none;
      -webkit-user-drag: none;
    }
    .slide > img:focus-visible {
      outline: 2px solid var(--c_primary);
      outline-offset: -2px;
    }
    .slide > k-video, .slide > .media {
      display: block;
      width: 100%;
      height: 100%;
      border-radius: 0;
    }
    .audio-slide {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .cover {
      flex: 1;
      min-height: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--tc);
      font-size: 6rem;
      cursor: zoom-in;
    }
    .cover k-icon {
      opacity: 0.4;
    }
    .audio-slide k-audio {
      --visualizer_height: 5rem;
    }
    .audio-slide.fill k-audio {
      flex: 1;
      min-height: 0;
    }
    .audio-slide kc-audio-visualizer {
      cursor: zoom-in;
    }
    :host([no-fullscreen]) .slide > img, :host([no-fullscreen]) .cover, :host([no-fullscreen]) .audio-slide kc-audio-visualizer {
      cursor: default;
    }
    .cover img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .arrow {
      position: absolute;
      z-index: 2;
      top: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      padding: 0;
      border-radius: 50%;
      background: var(--c_bg);
      color: var(--tc);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
      cursor: pointer;
      opacity: 0.5;
      transform: translateY(-50%);
      transition: opacity var(--animation_ms) ease;
    }
    .arrow:hover, .arrow:focus-visible {
      opacity: 1;
    }
    .arrow:hover {
      background: var(--c_bg__alt);
    }
    .arrow:focus-visible {
      box-shadow: var(--focus_shadow);
      outline: none;
    }
    .arrow.prev {
      left: 0.5rem;
    }
    .arrow.next {
      right: 0.5rem;
    }
    #lightbox {
      position: fixed;
      inset: 0;
      z-index: 80;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 3.5rem 1rem 1rem;
      background: rgba(0, 0, 0, 0.9);
      --thumb_size: 3.5rem;
    }
    #lightbox-stage {
      flex: 1;
      min-height: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #lightbox-stage > img {
      display: block;
      max-width: 100%;
      max-height: calc(100vh - 11rem);
      object-fit: contain;
    }
    #lightbox-stage > k-video {
      width: min(100%, 70rem);
      --max-height: calc(100vh - 11rem);
    }
    #lightbox-stage > .media {
      display: block;
      width: min(100%, 70rem);
      height: calc(100vh - 11rem);
    }
    #lightbox-stage .audio-slide {
      width: min(90vmin, calc(100vh - 11rem));
      height: min(90vmin, calc(100vh - 11rem));
      overflow: hidden;
      border-radius: var(--radius);
      background: #000;
      color: #fff;
    }
    #lightbox-stage .audio-slide kc-audio-visualizer {
      cursor: default;
    }
    #lightbox-stage .cover {
      cursor: default;
      color: #fff;
    }
    #counter {
      position: absolute;
      top: 1rem;
      left: 1rem;
      color: #fff;
    }
    .lightbox-btn {
      position: absolute;
      z-index: 1;
      padding: 0.5rem;
      color: #fff;
      cursor: pointer;
      opacity: 0.8;
    }
    .lightbox-btn:hover {
      opacity: 1;
    }
    .lightbox-btn k-icon {
      filter: drop-shadow(0 0 2px #000) drop-shadow(0 0 2px #000);
    }
    #close {
      top: 0.5rem;
      right: 0.5rem;
      font-size: 1.5rem;
    }
    .lightbox-arrow {
      top: 50%;
      transform: translateY(-50%);
      font-size: 3rem;
    }
    #lightbox-prev {
      left: 0.5rem;
    }
    #lightbox-next {
      right: 0.5rem;
    }
    .lightbox-thumbs {
      justify-content: safe center;
    }
  `}customElements.define("k-media-gallery",f),f.register("image",{extensions:["jpg","jpeg","png","gif","webp","avif","svg","bmp"],thumb:e=>e.src,render:(t,{gallery:i,fullscreen:r,active:o})=>r?e`
    <img src=${t.src} alt=${t.alt} />
  `:e`
    <img
      src=${t.src}
      alt=${t.alt}
      loading=${o?"eager":"lazy"}
      tabindex="0"
      @click=${()=>i.open()}
      @keydown=${e=>"Enter"===e.key&&i.open()}
    />
  `}),f.register("video",{extensions:["mp4","webm","ogv","mov","m4v"],icon:"play",thumb:e=>e.poster,load:()=>import("./Video.js"),render:(t,{gallery:i,fullscreen:r})=>e`
    <k-video .src=${t.src} .poster=${t.poster} controls=${r?"normal":i.controls}></k-video>
  `}),f.register("audio",{extensions:["mp3","wav","flac","aac","m4a","oga","ogg","opus"],icon:"queue_music",thumb:e=>e.poster,shared:!0,load:()=>import("./Audio.js").then(()=>import("./controls/AudioVisualizer.js")),pause:e=>e.querySelector("k-audio")?.pause?.(),render:(t,{gallery:r,fullscreen:s})=>{const n="none"!==r.visualizer,l=()=>!r.fullscreen&&r.open();u.has(t)||u.set(t,document.createElement("div"));const a=u.get(t);return a.className="audio-slide "+(!t.poster&&n?"fill":""),o(e`
      ${t.poster||!n?e`
        <div class="cover" @click=${l}>
          ${t.poster?e`<img src=${t.poster} alt=${t.alt} />`:e`<k-icon name="queue_music"></k-icon>`}
        </div>
      `:i}
      <k-audio .src=${t.src} controls=${s?"normal":r.controls}>
        ${n?e`<kc-audio-visualizer slot="visualizer" type=${r.visualizer} @click=${l}></kc-audio-visualizer>`:i}
      </k-audio>
    `,a),a}});