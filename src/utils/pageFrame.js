import { renderPage, collectModules, escapeAttribute } from './renderPage.js';
import sanitizeHtml from './sanitizeHtml.js';

/*
  The page as the builder shows it: an iframe holding the site's own stylesheets, with the page rendered into it in
  editor mode (every widget's element carries data-pb-id). This class owns that iframe. The builder hands it the tree
  and the ids to mark as selected, and it reports what the person did through the handlers:

    onSelect(id, { additive })        a widget was clicked
    onBlank()                         the page itself was clicked
    onChange(id, changes)             a widget's editor changed its settings (a pb-change event from the widget)
    onDrop(id, place)                 a widget was dropped: { parentId, slot, index }
    canDrop(id, parentId, slot)       whether the dragged widget may go in that list
    restricted(id)                    whether the widget is moved from its parent's settings, not on the page (a section)
    onKeyDown(event)                  a key was pressed inside the page
    locate(id)                        where a widget is: { parentId, slot, index } or null
    nameOf(id)                        what a widget is called in a drop label

  The iframe is on the same origin, so the builder reads and writes its document directly. Its modules are loaded by the
  iframe's own window (a script tag inside it), so the elements are defined there and upgrade.
*/

const EDITOR_CSS = `
  body { margin: 0; overflow-x: hidden; }
  :root { --pb-accent: var(--c_success, #2c2); }
  #pb-root { min-height: 100vh; padding: var(--spacer, 1rem); padding-top: calc(var(--spacer, 1rem) + 1rem); box-sizing: border-box; }
  #pb-root:empty::before { content: 'This page has no widgets yet. Use Add in the toolbar.'; display: block; padding: 3rem 1rem; text-align: center; opacity: 0.6; }
  [data-pb-id] { cursor: default; }
  [data-pb-id][contenteditable] { cursor: text; }
  [data-pb-id]:empty { display: block; min-height: 3rem; box-sizing: border-box; outline: 1px dashed var(--c_border, #888); outline-offset: -1px; position: relative; }
  [data-pb-slot]:empty::before { content: attr(data-pb-title) ' is empty. Drag a widget here, or use Add in the toolbar.'; display: block; padding: 0.75rem; text-align: center; font-style: italic; opacity: 0.55; }
  k-accordion-panel:not([active]):empty, k-tab-content:not([active]):empty { display: none; }
  [data-pb-id][contenteditable]:empty::before { content: 'Click here to type text'; font-style: italic; opacity: 0.55; }
  [data-pb-edit] { cursor: text; }
  td[data-pb-edit], th[data-pb-edit] { min-width: 3rem; }
  [data-pb-edit]:empty::before { content: '\\200b'; }
  [data-pb-edit]:hover { outline: 1px dashed var(--c_border, #888); outline-offset: -1px; }
  [data-pb-edit]:focus { outline: 2px solid var(--c_primary, #36f); outline-offset: -2px; }
  [data-pb-id].pb-selected { outline: 2px solid var(--pb-accent); outline-offset: 2px; }
  [data-pb-id].pb-drop-inside { outline: 3px dashed var(--c_primary, #36f); outline-offset: 2px; background: color-mix(in srgb, var(--c_primary, #36f) 12%, transparent); }
  [data-pb-id].pb-drop-before { box-shadow: 0 -4px 0 0 var(--c_primary, #36f); }
  [data-pb-id].pb-drop-after { box-shadow: 0 4px 0 0 var(--c_primary, #36f); }
  #pb-handle { position: absolute; z-index: 10; display: none; align-items: center; justify-content: center; width: 2.5rem; height: 1.75rem; background: var(--pb-accent); color: #fff; border-radius: 0.3rem; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.45); cursor: grab; touch-action: none; }
  #pb-handle k-icon { width: 1.5rem; height: 1.5rem; }
  .pb-dragging, .pb-dragging * { cursor: grabbing !important; user-select: none; }
  .pb-zone { min-height: 2.5rem; margin: 0.25rem 0; border: 2px dashed var(--pb-accent); border-radius: 0.25rem; box-sizing: border-box; }
  .row > .pb-zone { flex: 0 0 2.5rem; margin: 0 -1.25rem; position: relative; z-index: 5; }
  .pb-zone-empty { outline: 2px dashed var(--pb-accent); outline-offset: -2px; }
  .pb-zone-active { background: color-mix(in srgb, var(--pb-accent) 45%, transparent); border-color: transparent; }
  .pb-zone::before { content: attr(data-label); display: block; padding: 0.25rem; font-size: 0.8em; font-weight: bold; text-align: center; opacity: 0.85; }
  .row > .pb-zone::before { content: none; }
  [data-pb-slot].pb-zone-empty[data-drop-label]::before { content: attr(data-drop-label); display: block; padding: 0.25rem; font-size: 0.8em; font-weight: bold; text-align: center; opacity: 0.85; }
`;

/* The modules the frame always needs: the handle's icon. */
const FRAME_MODULES = [new URL('../components/Icon.js', import.meta.url).href];

/* The theme utility runs in the frame too: it reads the theme the site stores and follows it when it changes. */
const THEME_MODULE = new URL('./theme.js', import.meta.url).href;

export default class PageFrame {
  constructor(iframe, handlers){
    this.iframe = iframe;
    this.handlers = handlers;
    this.loaded = new Set();
    this.selection = [];
    this.dragging = null;
    this.pointer = null;
    this.registry = null;
    this.nodes = [];
    this.ready = new Promise(resolve => {
      iframe.addEventListener('load', () => {
        this.attach();
        resolve();
      }, { once: true });
      iframe.srcdoc = this.documentHtml();
    });
  }

  get document(){
    return this.iframe.contentDocument;
  }

  get window(){
    return this.iframe.contentWindow;
  }

  get root(){
    return this.document?.getElementById('pb-root');
  }

  /*
    The frame's document: the page's own stylesheets (so the site's theme shows), the editor's marks, and the root.
  */
  documentHtml(){
    const links = [...document.querySelectorAll('link[rel="stylesheet"]')].map(link => `<link rel="stylesheet" href="${escapeAttribute(link.href)}">`).join('\n');
    const theme = `<script type="module">import theme from "${escapeAttribute(THEME_MODULE)}"; theme.init();</script>`;
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Page content</title>${links}${theme}<style>${EDITOR_CSS}</style></head>`
      + '<body><main id="pb-root"></main><div id="pb-handle" title="Drag to move"></div></body></html>';
  }

  /*
    Events
  */

  attach(){
    const doc = this.document;
    if(window.kempo) this.window.kempo = window.kempo;
    doc.getElementById('pb-handle').innerHTML = '<k-icon name="drag-handle"></k-icon>';
    doc.addEventListener('mousedown', this.handleMouseDown, true);
    doc.addEventListener('click', this.handleClick, true);
    doc.addEventListener('keydown', this.handleKeyDown, true);
    doc.addEventListener('focusout', this.handleFocusOut);
    doc.addEventListener('pb-change', this.handleChange);
    doc.getElementById('pb-handle').addEventListener('pointerdown', this.startDrag);
    this.window.addEventListener('resize', this.placeHandle);
    this.window.addEventListener('scroll', this.placeHandle);
    this.window.addEventListener('scroll', () => this.dragging && this.highlight());
  }

  widgetOf = target => target?.closest?.('[data-pb-id]') || null;

  handleMouseDown = event => {
    if(event.target.closest?.('#pb-handle')){
      event.preventDefault();
      return;
    }
    const sliderButton = event.composedPath().some(element => element.localName === 'button' && ['prev', 'next'].includes(element.id) && element.getRootNode().host?.localName === 'k-content-slider');
    if(sliderButton || event.target.closest?.('k-accordion-header, k-tab')){
      /* The header (or the slider's arrow) still does its job (the click is not cancelled), and the accordion, tabs or slider it belongs to is selected. */
      const owner = this.chainOf(event.target).pop();
      if(owner && !(this.selection.length === 1 && this.selection[0] === owner.dataset.pbId)) this.handlers.onSelect(owner.dataset.pbId, { additive: false });
      return;
    }
    const chain = this.chainOf(event.target);
    if(!chain.length){
      /* Cancelled like a press on a widget: letting the browser place a caret at the nearest text after this deselects, and removes the open editor from the page, has crashed it. */
      event.preventDefault();
      this.handlers.onBlank();
      return;
    }
    const additive = event.ctrlKey || event.metaKey || event.shiftKey;
    const target = this.pick(chain, additive);
    const id = target.dataset.pbId;
    if(additive || !(this.selection.length === 1 && this.selection[0] === id)){
      event.preventDefault();
      event.stopPropagation();
      this.handlers.onSelect(id, { additive });
    }
  };

  /* The widgets around a point in the page, outermost first. Sections are not in the chain: the widget they are part of is. */
  chainOf = target => {
    const chain = [];
    for(let element = this.widgetOf(target); element; element = this.widgetOf(element.parentElement)){
      if(!this.handlers.restricted(element.dataset.pbId)) chain.unshift(element);
    }
    return chain;
  };

  /*
    Which widget a click selects. The first click selects the outermost widget under it; a click inside the selected
    widget selects the next one down towards what was clicked, so each click goes one level deeper. With Ctrl or Shift
    it is the widget beside the selected ones (the same parent).
  */
  pick(chain, additive){
    if(additive){
      const last = this.selection[this.selection.length - 1];
      const parentId = last ? this.handlers.locate(last)?.parentId ?? null : null;
      return chain.find(element => (this.handlers.locate(element.dataset.pbId)?.parentId ?? null) === parentId) || chain[chain.length - 1];
    }
    const selected = this.selection.length === 1 ? this.document.querySelector(`[data-pb-id="${CSS.escape(this.selection[0])}"]`) : null;
    const depth = selected ? chain.findLastIndex(element => element.dataset.pbId === this.selection[0] || element.contains(selected)) : -1;
    return chain[depth === -1 ? 0 : Math.min(depth + 1, chain.length - 1)];
  }

  /* A link or a button in the page must not take the builder somewhere else. */
  handleClick = event => {
    const link = event.target.closest?.('a[href], form');
    if(link) event.preventDefault();
  };

  handleChange = event => {
    const { id, changes } = event.detail || {};
    if(id && changes) this.handlers.onChange(id, changes);
  };

  /*
    A text widget, or a part of a widget that names what it edits (data-pb-edit="rows.1.0", a table cell), is edited on the
    page. When it loses focus, its HTML is sent to the builder, which keeps it only if it changed.
  */
  handleFocusOut = event => {
    const element = event.target;
    if(!element?.isContentEditable) return;
    if(element.dataset?.pbId) return this.handlers.onChange(element.dataset.pbId, { html: sanitizeHtml(element.innerHTML) });
    const path = element.dataset?.pbEdit;
    const owner = element.closest?.('[data-pb-id]');
    if(path && owner) this.handlers.onChange(owner.dataset.pbId, { [path]: this.htmlOf(element) });
  };

  /* What is typed in an editable part of a widget. An emptied one leaves a <br> behind, which is not content. */
  htmlOf(element){
    const html = sanitizeHtml(element.innerHTML);
    return html === '<br>' ? '' : html;
  }

  /* Puts the caret at the end of an editable part of a widget (data-pb-edit="path") once the page has been drawn again. */
  focusAfterRender(id, path){
    this.pendingFocus = { id, path };
  }

  handleKeyDown = event => {
    if(this.dragging && event.key === 'Escape'){
      this.clearDrag();
      return;
    }
    this.handlers.onKeyDown(event);
  };

  /*
    Showing the page
  */

  /* The modules a page's widgets need are loaded once, by a script tag in the frame's own window. */
  loadModules(urls){
    const doc = this.document;
    const fresh = [...new Set([...FRAME_MODULES, ...urls])].filter(url => !this.loaded.has(url));
    return Promise.all(fresh.map(url => new Promise(resolve => {
      this.loaded.add(url);
      const script = doc.createElement('script');
      script.type = 'module';
      script.src = url;
      script.addEventListener('load', resolve);
      script.addEventListener('error', resolve);
      doc.head.appendChild(script);
    })));
  }

  /* Draws the nodes (the page's list of widgets) with the registry they use, and marks the selection. */
  async render(nodes, registry, selection){
    await this.ready;
    this.nodes = nodes;
    this.registry = registry;
    const scroll = this.window.scrollY;
    await this.loadModules(collectModules(nodes, registry, { editor: true }));
    const state = this.interactiveState();
    this.root.innerHTML = renderPage(nodes, registry, { editor: true, sanitize: sanitizeHtml });
    this.restoreInteractiveState(state);
    this.setSelection(selection);
    this.window.scrollTo(0, scroll);
    if(this.pendingFocus){
      const { id, path } = this.pendingFocus;
      this.pendingFocus = null;
      const part = this.document.querySelector(`[data-pb-id="${CSS.escape(id)}"] [data-pb-edit="${CSS.escape(path)}"]`);
      if(part){
        part.focus({ preventScroll: true });
        const range = this.document.createRange();
        range.selectNodeContents(part);
        range.collapse(false);
        const selected = this.window.getSelection();
        selected.removeAllRanges();
        selected.addRange(range);
        this.reveal(part);
      }
    }
  }

  /* The open sections of each accordion and the active tab of each tabs widget, so a redraw (every change draws the page again) does not close them. Their names are made from the widget's id, so they survive. */
  interactiveState(){
    const root = this.root;
    return {
      accordions: new Map([...root.querySelectorAll('k-accordion[data-pb-id]')].map(accordion => [accordion.dataset.pbId, { defaults: accordion.pbDefaults, open: [...accordion.querySelectorAll('k-accordion-panel[active]')].map(panel => panel.getAttribute('name')) }])),
      tabs: new Map([...root.querySelectorAll('k-tabs[data-pb-id]')].map(tabs => [tabs.dataset.pbId, { defaults: tabs.pbDefault, open: tabs.querySelector(`k-tab-content[name="${CSS.escape(tabs.getAttribute('active') || '')}"]`)?.dataset.pbId }])),
      sliders: new Map([...root.querySelectorAll('k-content-slider[data-pb-id]')].map(slider => [slider.dataset.pbId, { defaults: slider.pbDefault, open: slider.content?.[slider.index]?.dataset.pbId }]))
    };
  }

  /* An accordion that was on the page starts as it was left, unless the sections it starts with changed (a section's "open by default"), then it starts with those. */
  restoreInteractiveState({ accordions, tabs, sliders }){
    const root = this.root;
    for(const accordion of root.querySelectorAll('k-accordion[data-pb-id]')){
      const defaults = [...accordion.querySelectorAll('k-accordion-panel[active]')].map(panel => panel.getAttribute('name')).join();
      const before = accordions.get(accordion.dataset.pbId);
      accordion.pbDefaults = defaults;
      if(before?.defaults !== defaults) continue;
      for(const element of accordion.querySelectorAll('k-accordion-panel[active], k-accordion-header[active]')) element.removeAttribute('active');
      for(const name of before.open){
        accordion.querySelector(`k-accordion-panel[name="${CSS.escape(name)}"]`)?.setAttribute('active', '');
        accordion.querySelector(`k-accordion-header[for-panel="${CSS.escape(name)}"]`)?.setAttribute('active', '');
      }
    }
    for(const element of root.querySelectorAll('k-tabs[data-pb-id]')){
      const defaults = element.getAttribute('active') || '';
      const before = tabs.get(element.dataset.pbId);
      element.pbDefault = defaults;
      /* The tab is found by its widget, not its name, so renaming the open tab keeps it open. */
      const open = before?.defaults === defaults && before.open && element.querySelector(`k-tab-content[data-pb-id="${CSS.escape(before.open)}"]`);
      if(open) element.setAttribute('active', open.getAttribute('name'));
    }
    /* A slider keeps the slides it is not showing out of the page, so the slide is found in the slider's own list, by its widget. */
    for(const slider of root.querySelectorAll('k-content-slider[data-pb-id]')){
      const defaults = slider.getAttribute('index') || '';
      const before = sliders.get(slider.dataset.pbId);
      slider.pbDefault = defaults;
      const position = before?.defaults === defaults && before.open ? slider.content?.findIndex(slide => slide.dataset.pbId === before.open) : -1;
      if(position > -1) slider.index = position;
    }
  }

  /*
    Selection
  */

  setSelection(ids){
    this.selection = ids;
    const doc = this.document;
    if(!doc) return;
    const active = doc.activeElement;
    if(active && active !== doc.body && !ids.includes(active.closest('[data-pb-id]')?.dataset.pbId)) this.blurFocus();
    for(const element of doc.querySelectorAll('.pb-selected')){
      element.classList.remove('pb-selected');
      element.dispatchEvent(new CustomEvent('pb-selected', { detail: { selected: false } }));
    }
    for(const id of ids){
      for(const element of doc.querySelectorAll(`[data-pb-id="${CSS.escape(id)}"]`)){
        element.classList.add('pb-selected');
        element.dispatchEvent(new CustomEvent('pb-selected', { detail: { selected: ids.length === 1 } }));
      }
    }
    this.placeHandle();
    requestAnimationFrame(() => this.placeHandle());
  }

  showDropTarget(id, zone){
    const doc = this.document;
    for(const element of doc.querySelectorAll('.pb-drop-before, .pb-drop-after, .pb-drop-inside')) element.classList.remove('pb-drop-before', 'pb-drop-after', 'pb-drop-inside');
    if(id) doc.querySelector(`[data-pb-id="${CSS.escape(id)}"]`)?.classList.add(`pb-drop-${zone}`);
  }

  blurFocus(){
    let active = this.document?.activeElement;
    while(active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
    if(active && active !== this.document.body) active.blur();
  }

  /* Only the page's own window, and only up or down: scrollIntoView also scrolls the pane around the frame sideways, which pushes the left of the page out of view. */
  scrollTo(id){
    this.reveal(this.document.querySelector(`[data-pb-id="${CSS.escape(id)}"]`));
  }

  reveal(element){
    const rect = element?.getBoundingClientRect();
    if(!rect) return;
    let top = 0;
    if(rect.top < 0) top = rect.top;
    else if(rect.bottom > this.window.innerHeight) top = Math.min(rect.top, rect.bottom - this.window.innerHeight);
    if(top) this.window.scrollBy({ top, behavior: 'smooth' });
  }

  /*
    Dragging: the handle sits on the first selected widget
  */

  placeHandle = () => {
    const doc = this.document;
    const handle = doc?.getElementById('pb-handle');
    if(!handle) return;
    const element = this.selection.length ? doc.querySelector(`[data-pb-id="${CSS.escape(this.selection[0])}"]`) : null;
    if(!element || this.handlers.restricted(this.selection[0])){
      handle.style.display = 'none';
      return;
    }
    const rect = element.getBoundingClientRect();
    handle.style.display = 'flex';
    handle.style.left = `${Math.max(0, rect.left + this.window.scrollX)}px`;
    handle.style.top = `${Math.max(0, rect.top + this.window.scrollY - handle.offsetHeight)}px`;
  };

  /* Pointer events, not the browser's drag and drop: the browser does not scroll a page with the wheel during that. */
  startDrag = event => {
    const handle = this.document.getElementById('pb-handle');
    if(event.button !== 0 || !this.selection.length || this.handlers.restricted(this.selection[0])) return;
    this.dragging = this.selection[0];
    this.pointer = event;
    handle.setPointerCapture(event.pointerId);
    handle.addEventListener('pointermove', this.moveDrag);
    handle.addEventListener('pointerup', this.endDrag);
    handle.addEventListener('pointercancel', this.clearDrag);
    this.document.body.classList.add('pb-dragging');
    this.holdPosition(() => this.showZones());
  };

  /* Showing or hiding the zones pushes the page, so the first widget that starts inside the view is the anchor that stays put. */
  holdPosition(change){
    const anchor = [...this.root.querySelectorAll('[data-pb-id]')].find(element => element.getBoundingClientRect().top >= 0);
    const before = anchor?.getBoundingClientRect().top;
    change();
    if(anchor) this.window.scrollBy(0, anchor.getBoundingClientRect().top - before);
  }

  moveDrag = event => {
    this.pointer = event;
    this.autoScroll();
    this.highlight();
  };

  endDrag = event => {
    this.pointer = event;
    const zone = this.dropZone(event);
    const id = this.dragging;
    const place = zone && this.placeOf(zone);
    this.clearDrag();
    if(place && id) this.handlers.onDrop(id, place);
  };

  /*
    While a widget is dragged, every place it may go is an outlined box on the page: a zone between the widgets of each
    list (the page and every container), and each empty container. The box under the pointer fills in.
  */
  showZones(){
    if(!this.dragging) return;
    const doc = this.document;
    const dragged = CSS.escape(this.dragging);
    const lists = [
      { element: this.root, parentId: null, slot: 'default' },
      ...[...doc.querySelectorAll('[data-pb-slot]')].map(element => ({ element, parentId: element.dataset.pbId, slot: element.dataset.pbSlot }))
    ].filter(list => !list.element.closest(`[data-pb-id="${dragged}"]`) && this.handlers.canDrop(this.dragging, list.parentId, list.slot));
    for(const list of lists){
      const items = [...list.element.children].filter(child => child.dataset.pbId && !child.hasAttribute('slot'));
      if(!items.length){
        if(list.element !== this.root){
          list.element.classList.add('pb-zone-empty');
          list.element.dataset.dropLabel = `Inside ${this.handlers.nameOf(list.parentId)}`;
        }
        continue;
      }
      if(items.some(item => this.handlers.restricted(item.dataset.pbId))) continue;
      const from = items.findIndex(item => item.dataset.pbId === this.dragging);
      items.forEach((item, index) => {
        if(from === -1 || (index !== from && index !== from + 1)) item.before(this.zone(list, index, items));
      });
      if(from !== items.length - 1) items[items.length - 1].after(this.zone(list, items.length, items));
    }
  }

  zone(list, index, items){
    const zone = this.document.createElement('div');
    zone.className = 'pb-zone';
    zone.place = { parentId: list.parentId, slot: list.slot, index };
    zone.dataset.label = this.zoneLabel(list, index, items);
    return zone;
  }

  zoneLabel(list, index, items){
    if(list.element === this.root){
      if(index === 0) return 'Page top';
      if(index === items.length) return 'Page bottom';
    }
    const before = items[index - 1]?.dataset.pbTitle;
    const after = items[index]?.dataset.pbTitle;
    if(before && after) return `Between ${before} and ${after}`;
    return before ? `After ${before}` : `Before ${after}`;
  }

  /* The zone the pointer is over, or null: letting go anywhere else cancels the drop. */
  dropZone(event){
    if(!this.dragging) return null;
    const over = zone => {
      const rect = zone.getBoundingClientRect();
      return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
    };
    const doc = this.document;
    return [...doc.querySelectorAll('.pb-zone')].find(over) || [...doc.querySelectorAll('.pb-zone-empty')].find(over) || null;
  }

  placeOf = zone => zone.place || { parentId: zone.dataset.pbId, slot: zone.dataset.pbSlot, index: Infinity };

  /* The zone under the pointer fills in. */
  highlight(){
    for(const element of this.document.querySelectorAll('.pb-zone-active')) element.classList.remove('pb-zone-active');
    this.dropZone(this.pointer)?.classList.add('pb-zone-active');
  }

  /* Holding the pointer near the top or bottom edge scrolls the page, faster the closer it is. */
  autoScroll(){
    const edge = 100;
    const y = this.pointer.clientY;
    const height = this.window.innerHeight;
    this.scrollSpeed = y < edge ? -Math.ceil(Math.min(2, 1 - y / edge) * 30) : y > height - edge ? Math.ceil(Math.min(2, 1 - (height - y) / edge) * 30) : 0;
    if(!this.scrollSpeed || this.scrolling) return;
    this.scrolling = true;
    const step = () => {
      if(!this.dragging || !this.scrollSpeed){
        this.scrolling = false;
        return;
      }
      this.window.scrollBy(0, this.scrollSpeed);
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  clearDrag = () => {
    this.dragging = null;
    this.scrollSpeed = 0;
    const doc = this.document;
    if(!doc) return;
    const handle = doc.getElementById('pb-handle');
    handle?.removeEventListener('pointermove', this.moveDrag);
    handle?.removeEventListener('pointerup', this.endDrag);
    handle?.removeEventListener('pointercancel', this.clearDrag);
    doc.body.classList.remove('pb-dragging');
    this.holdPosition(() => {
      for(const zone of doc.querySelectorAll('.pb-zone')) zone.remove();
      for(const element of doc.querySelectorAll('.pb-zone-empty, .pb-zone-active')){
        element.classList.remove('pb-zone-empty', 'pb-zone-active');
        element.removeAttribute('data-drop-label');
      }
    });
  };
}
