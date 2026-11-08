import { html, css, nothing, keyed, render as renderInto } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';
import { boolExists, boolTrueFalse } from '../utils/propConverters.js';
import './Icon.js';

/*
  Utility Functions
*/
const types = new Map();
const extensionOwners = new Map();
const galleries = new Set();
const nodes = new WeakMap();
const audioRoots = new WeakMap();
const ignoredAttributes = ['type', 'thumb', 'class', 'style'];

export const resolveType = (src, explicitType) => {
  if(types.has(explicitType)) return explicitType;
  return extensionOwners.get(src.split(/[?#]/)[0].split('.').pop().toLowerCase()) ?? 'image';
};

/*
  Builds the render function for a registered `tag`. The element is created once per item (and once more
  for the fullscreen viewer, unless the type is `shared`, then the one element is moved) so it keeps its
  state across renders, and every attribute of the item is copied onto it.
*/
const renderTag = (tag, shared) => (item, { fullscreen }) => {
  const cache = nodes.get(item) ?? {};
  nodes.set(item, cache);
  const key = fullscreen && !shared ? 'fullscreen' : 'inline';
  if(cache[key]?.node.localName !== tag) cache[key] = { node: document.createElement(tag), copied: new Set() };
  const { node, copied } = cache[key];
  node.classList.add('media');
  node.toggleAttribute('fullscreen', fullscreen);
  const names = item.getAttributeNames().filter(name => !ignoredAttributes.includes(name));
  copied.forEach(name => !names.includes(name) && node.removeAttribute(name));
  copied.clear();
  names.forEach(name => {
    copied.add(name);
    if(node.getAttribute(name) !== item.getAttribute(name)) node.setAttribute(name, item.getAttribute(name));
  });
  return node;
};

/*
  Symbols
*/
const dragState = Symbol();
const thumbDrag = Symbol();
const attributeObserver = Symbol();

/*
  A single piece of media in a <k-media-gallery>. It renders nothing itself, the gallery reads it.
  Every attribute is available to the renderer of its type.
*/
export class MediaGalleryItem extends HTMLElement {
  /*
    Lifecycle Callbacks
  */
  connectedCallback() {
    this.style.display = 'none';
  }

  /*
    Protected Members
  */
  get src() {
    return this.getAttribute('src') ?? '';
  }

  get alt() {
    return this.getAttribute('alt') ?? '';
  }

  get poster() {
    return this.getAttribute('poster') ?? '';
  }

  get type() {
    return resolveType(this.src, this.getAttribute('type'));
  }

  get definition() {
    return types.get(this.type);
  }

  get thumb() {
    return this.getAttribute('thumb') || this.definition.thumb?.(this) || '';
  }
}

customElements.define('k-media-gallery-item', MediaGalleryItem);

export default class MediaGallery extends ShadowComponent {
  /*
    Reactive Properties / Attributes
  */
  static properties = {
    index: { type: Number, reflect: true },
    thumbsPosition: { type: String, reflect: true, attribute: 'thumbs-position' },
    ratio: { type: String, reflect: true },
    controls: { type: String, reflect: true },
    visualizer: { type: String, reflect: true },
    fullscreen: { type: Boolean, reflect: true, converter: boolExists },
    noFullscreen: { type: Boolean, reflect: true, attribute: 'no-fullscreen', converter: boolExists },
    keyboardControls: { type: Boolean, reflect: true, attribute: 'keyboard-controls', converter: boolTrueFalse }
  };

  /*
    Constructor
  */
  constructor() {
    super();
    this[dragState] = null;
    this[thumbDrag] = null;
    this[attributeObserver] = new MutationObserver(mutations => {
      if(mutations.some(mutation => mutation.target !== this)) this.requestUpdate();
    });
    this.index = 0;
    this.thumbsPosition = 'left';
    this.ratio = '1/1';
    this.controls = 'minimal';
    this.visualizer = 'bars';
    this.fullscreen = false;
    this.noFullscreen = false;
    this.keyboardControls = true;
  }

  /*
    Lifecycle Callbacks
  */
  connectedCallback() {
    super.connectedCallback();
    galleries.add(this);
    this[attributeObserver].observe(this, { attributes: true, subtree: true });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    galleries.delete(this);
    this[attributeObserver].disconnect();
    document.removeEventListener('keydown', this.handleDocumentKeydown);
    if(this.fullscreen) document.body.classList.remove('no-scroll');
  }

  willUpdate() {
    if(this.items.length) this.index = Math.min(Math.max(this.index, 0), this.items.length - 1);
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if(changedProperties.has('index') || changedProperties.has('fullscreen')) {
      const items = this.items;
      this.shadowRoot.querySelectorAll('.slide').forEach((slide, i) => {
        if(!slide.firstElementChild || (!this.fullscreen && i === this.index)) return;
        const { pause = element => element.pause?.() } = items[i].definition;
        pause(slide.firstElementChild);
      });
    }

    if(changedProperties.get('index') !== undefined) {
      this.dispatchEvent(new CustomEvent('change', { detail: { index: this.index } }));
    }

    if(changedProperties.has('index') || changedProperties.has('fullscreen') || changedProperties.has('thumbsPosition')) {
      this.shadowRoot.querySelectorAll('.thumbs').forEach(strip => {
        const thumb = strip.children[this.index];
        if(!thumb) return;
        strip.scrollTo({
          left: thumb.offsetLeft - (strip.clientWidth - thumb.offsetWidth) / 2,
          top: thumb.offsetTop - (strip.clientHeight - thumb.offsetHeight) / 2,
          behavior: 'smooth'
        });
      });
    }

    if(changedProperties.has('fullscreen')) {
      this.dispatchEvent(new CustomEvent('fullscreenchange', { detail: { fullscreen: this.fullscreen } }));
      document.body.classList.toggle('no-scroll', this.fullscreen);
      const overlayRoot = window.kempo?.overlayRoot ? this.closest(window.kempo.overlayRoot) : null;
      overlayRoot?.classList.toggle('no-scroll', this.fullscreen);
      if(this.fullscreen) document.addEventListener('keydown', this.handleDocumentKeydown);
      else document.removeEventListener('keydown', this.handleDocumentKeydown);
    }
  }

  /*
    Protected Members
  */
  get items() {
    return Array.from(this.children).filter(child => child.tagName === 'K-MEDIA-GALLERY-ITEM');
  }

  /*
    Static Methods
  */
  static register(name, definition = {}) {
    if(!definition.tag && !definition.render) throw new Error(`MediaGallery.register('${name}') needs a "tag" or a "render" function`);
    const extensions = (definition.extensions ?? [name]).map(extension => extension.toLowerCase().replace(/^\./, ''));
    types.set(name, { label: name, ...definition, extensions, render: definition.render ?? renderTag(definition.tag, definition.shared) });
    extensions.forEach(extension => extensionOwners.set(extension, name));
    galleries.forEach(gallery => gallery.requestUpdate());
    return this;
  }

  static unregister(name) {
    types.delete(name);
    extensionOwners.forEach((owner, extension) => owner === name && extensionOwners.delete(extension));
    galleries.forEach(gallery => gallery.requestUpdate());
    return this;
  }

  /*
    Public Methods
  */
  addItem(attributes = {}, index = this.items.length) {
    const item = document.createElement('k-media-gallery-item');
    Object.entries(attributes).forEach(([name, value]) => item.setAttribute(name, value));
    this.insertBefore(item, this.items[index] ?? null);
    return item;
  }

  removeItem(index) {
    this.items[index]?.remove();
    return this;
  }

  goTo(index) {
    const count = this.items.length;
    if(count) this.index = ((index % count) + count) % count;
    return this;
  }

  next() {
    return this.goTo(this.index + 1);
  }

  previous() {
    return this.goTo(this.index - 1);
  }

  open() {
    if(!this.noFullscreen) this.fullscreen = true;
    return this;
  }

  close() {
    this.fullscreen = false;
    return this;
  }

  toggle() {
    this.fullscreen = !this.fullscreen;
    return this;
  }

  /*
    Event Handlers
  */
  handleKeydown = event => {
    if(!this.keyboardControls || this.fullscreen || event.target.closest?.('k-video')) return;
    if(event.key === 'ArrowLeft') this.previous();
    else if(event.key === 'ArrowRight') this.next();
  };

  handleDocumentKeydown = event => {
    if(!this.keyboardControls) return;
    if(event.key === 'Escape') this.close();
    else if(event.key === 'ArrowLeft') this.previous();
    else if(event.key === 'ArrowRight') this.next();
  };

  handleBackdropClick = event => {
    if(event.target === event.currentTarget) this.close();
  };

  handleThumbsWheel = event => {
    const strip = event.currentTarget;
    const atEnd = event.deltaY < 0 ? strip.scrollLeft <= 0 : strip.scrollLeft >= strip.scrollWidth - strip.clientWidth - 1;
    if(strip.scrollWidth <= strip.clientWidth || Math.abs(event.deltaY) < Math.abs(event.deltaX) || atEnd) return;
    strip.scrollLeft += event.deltaY;
    event.preventDefault();
  };

  handleThumbsPointerDown = event => {
    if(event.pointerType !== 'mouse' || event.button !== 0) return;
    const strip = event.currentTarget;
    this[thumbDrag] = { x: event.clientX, y: event.clientY, left: strip.scrollLeft, top: strip.scrollTop, active: false };
  };

  handleThumbsPointerMove = event => {
    const drag = this[thumbDrag];
    if(!drag) return;
    const strip = event.currentTarget;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if(!drag.active) {
      if(Math.hypot(dx, dy) < 5) return;
      drag.active = true;
      strip.setPointerCapture(event.pointerId);
      strip.classList.add('dragging');
    }
    strip.scrollLeft = drag.left - dx;
    strip.scrollTop = drag.top - dy;
  };

  handleThumbsPointerEnd = event => {
    this[thumbDrag] = null;
    event.currentTarget.classList.remove('dragging');
  };

  handlePointerDown = event => {
    if(event.pointerType === 'mouse' || this.items.length < 2) return;
    this[dragState] = { x: event.clientX, dx: 0 };
  };

  handlePointerMove = event => {
    const drag = this[dragState];
    if(!drag) return;
    drag.dx = event.clientX - drag.x;
    const track = this.shadowRoot.querySelector('.track');
    track.classList.add('dragging');
    track.style.setProperty('--drag', `${drag.dx}px`);
  };

  handlePointerEnd = event => {
    const drag = this[dragState];
    if(!drag) return;
    this[dragState] = null;
    const track = this.shadowRoot.querySelector('.track');
    track.classList.remove('dragging');
    track.style.removeProperty('--drag');
    if(event.type !== 'pointerup' || Math.abs(drag.dx) < 50) return;
    if(drag.dx < 0) this.next();
    else this.previous();
  };

  /*
    Rendering
  */
  renderThumbs(items, className = '') {
    return html`
      <div
        class="thumbs ${className}"
        part="thumbs"
        @wheel=${this.handleThumbsWheel}
        @pointerdown=${this.handleThumbsPointerDown}
        @pointermove=${this.handleThumbsPointerMove}
        @pointerup=${this.handleThumbsPointerEnd}
        @pointercancel=${this.handleThumbsPointerEnd}
      >
        ${items.map((item, i) => html`
          <button
            class="thumb no-btn"
            ?selected=${i === this.index}
            aria-label="Show ${item.definition.label} ${i + 1}"
            aria-current=${i === this.index ? 'true' : 'false'}
            @click=${() => this.goTo(i)}
          >
            ${item.thumb ? html`<img src=${item.thumb} alt="" loading="lazy" draggable="false" />` : nothing}
            ${item.definition.icon ? html`<span class="badge"><k-icon name=${item.definition.icon}></k-icon></span>` : nothing}
          </button>
        `)}
      </div>
    `;
  }

  renderSlide(item, i) {
    const { load, render, shared } = item.definition;
    load?.();
    return html`
      <div class="slide" ?inert=${i !== this.index}>
        ${this.fullscreen && shared && i === this.index ? nothing : render(item, { gallery: this, fullscreen: false, active: i === this.index })}
      </div>
    `;
  }

  renderLightbox(items) {
    const item = items[this.index];
    return html`
      <div id="lightbox" role="dialog" aria-modal="true" aria-label="Media gallery" @click=${this.handleBackdropClick}>
        ${items.length > 1 ? html`<span id="counter">${this.index + 1} / ${items.length}</span>` : nothing}
        <button id="close" class="lightbox-btn no-btn" aria-label="Close" @click=${this.close}>
          <k-icon name="close"></k-icon>
        </button>
        ${items.length > 1 ? html`
          <button id="lightbox-prev" class="lightbox-btn lightbox-arrow no-btn" aria-label="Previous" @click=${this.previous}>
            <k-icon name="chevron" direction="left"></k-icon>
          </button>
          <button id="lightbox-next" class="lightbox-btn lightbox-arrow no-btn" aria-label="Next" @click=${this.next}>
            <k-icon name="chevron"></k-icon>
          </button>
        ` : nothing}
        <div id="lightbox-stage" @click=${this.handleBackdropClick}>
          ${keyed(this.index, item.definition.render(item, { gallery: this, fullscreen: true, active: true }))}
        </div>
        ${items.length > 1 ? this.renderThumbs(items, 'lightbox-thumbs') : nothing}
      </div>
    `;
  }

  render() {
    const items = this.items;
    const multiple = items.length > 1;
    return html`
      <div id="gallery" part="gallery" style="--ratio: ${this.ratio || '1/1'}" @keydown=${this.handleKeydown}>
        ${multiple ? this.renderThumbs(items) : nothing}
        <div
          class="stage"
          part="stage"
          @pointerdown=${this.handlePointerDown}
          @pointermove=${this.handlePointerMove}
          @pointerup=${this.handlePointerEnd}
          @pointercancel=${this.handlePointerEnd}
        >
          <div class="track" style="--index: ${this.index}">
            ${items.map((item, i) => this.renderSlide(item, i))}
          </div>
          ${multiple ? html`
            <button class="arrow prev no-btn" aria-label="Previous" @click=${this.previous}>
              <k-icon name="chevron" direction="left"></k-icon>
            </button>
            <button class="arrow next no-btn" aria-label="Next" @click=${this.next}>
              <k-icon name="chevron"></k-icon>
            </button>
          ` : nothing}
        </div>
      </div>
      ${this.fullscreen && items.length ? this.renderLightbox(items) : nothing}
    `;
  }

  static styles = css`
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
  `;
}

customElements.define('k-media-gallery', MediaGallery);

/*
  Built-in Types
*/
MediaGallery.register('image', {
  extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg', 'bmp'],
  thumb: item => item.src,
  render: (item, { gallery, fullscreen, active }) => fullscreen ? html`
    <img src=${item.src} alt=${item.alt} />
  ` : html`
    <img
      src=${item.src}
      alt=${item.alt}
      loading=${active ? 'eager' : 'lazy'}
      tabindex="0"
      @click=${() => gallery.open()}
      @keydown=${event => event.key === 'Enter' && gallery.open()}
    />
  `
});

MediaGallery.register('video', {
  extensions: ['mp4', 'webm', 'ogv', 'mov', 'm4v'],
  icon: 'play',
  thumb: item => item.poster,
  load: () => import('./Video.js'),
  render: (item, { gallery, fullscreen }) => html`
    <k-video .src=${item.src} .poster=${item.poster} controls=${fullscreen ? 'normal' : gallery.controls}></k-video>
  `
});

MediaGallery.register('audio', {
  extensions: ['mp3', 'wav', 'flac', 'aac', 'm4a', 'oga', 'ogg', 'opus'],
  icon: 'queue_music',
  thumb: item => item.poster,
  shared: true,
  load: () => import('./Audio.js').then(() => import('./controls/AudioVisualizer.js')),
  pause: element => element.querySelector('k-audio')?.pause?.(),
  render: (item, { gallery, fullscreen }) => {
    const visualize = gallery.visualizer !== 'none';
    const open = () => !gallery.fullscreen && gallery.open();
    if(!audioRoots.has(item)) audioRoots.set(item, document.createElement('div'));
    const root = audioRoots.get(item);
    root.className = `audio-slide ${!item.poster && visualize ? 'fill' : ''}`;
    renderInto(html`
      ${item.poster || !visualize ? html`
        <div class="cover" @click=${open}>
          ${item.poster ? html`<img src=${item.poster} alt=${item.alt} />` : html`<k-icon name="queue_music"></k-icon>`}
        </div>
      ` : nothing}
      <k-audio .src=${item.src} controls=${fullscreen ? 'normal' : gallery.controls}>
        ${visualize ? html`<kc-audio-visualizer slot="visualizer" type=${gallery.visualizer} @click=${open}></kc-audio-visualizer>` : nothing}
      </k-audio>
    `, root);
    return root;
  }
});
