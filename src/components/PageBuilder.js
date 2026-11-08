import ShadowComponent from './ShadowComponent.js';
import { html, css, render } from '../lit-all.min.js';
import Dialog from './Dialog.js';
import Toast from './Toast.js';
import './ControlBar.js';
import './ControlGroup.js';
import './Icon.js';
import './controls/Menu.js';
import './controls/Undo.js';
import './controls/Redo.js';
import './controls/PbTree.js';
import './controls/PbAdd.js';
import './controls/PbDelete.js';
import './controls/PbDuplicate.js';
import './controls/PbMoveUp.js';
import './controls/PbMoveDown.js';
import './controls/PbMoveIn.js';
import './controls/PbMoveOut.js';
import './controls/PbDevice.js';
import './controls/PbView.js';
import './controls/PbSave.js';
import './controls/PbSettings.js';
import './controls/PbTemplateSave.js';
import './controls/PbTemplateInsert.js';
import './controls/PbShortcuts.js';
import './controls/PbReset.js';
import './pagebuilder/PageBuilderTree.js';
import './pagebuilder/PageBuilderSettings.js';
import './pagebuilder/PageBuilderInserter.js';
import * as tree from '../utils/pageTree.js';
import { widgets, addWidget as registerWidget, registryOf } from '../utils/pageWidgets.js';
import PageHistory from '../utils/pageHistory.js';
import PageFrame from '../utils/pageFrame.js';

const SETTINGS_KEY = 'kempo-ui:page-builder';
const DEVICES = [['phone', 'Phone'], ['tablet', 'Tablet'], ['desktop', 'Desktop']];
const VIEWS = ['tree', 'page', 'settings'];
const QUIET = /^Already /;
const COALESCE_MS = 1000;

const readSettings = () => {
  try {
    return { confirmDeletion: false, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') };
  } catch {
    return { confirmDeletion: false };
  }
};

const writeSettings = settings => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* The setting just does not persist. */
  }
};

const emptyPage = () => ({ attrs: {}, slots: { default: [] } });

/*
  Private members, as symbol keys.
*/
const treeKey = Symbol('tree');
const savedKey = Symbol('saved');
const frameKey = Symbol('frame');
const coalesceKey = Symbol('coalesce');
const coalesceTimeKey = Symbol('coalesceTime');
const resizeKey = Symbol('resize');
const extrasKey = Symbol('extras');

/*
  The page builder: a control bar, the widget tree on the left, the page in the middle and the selected widget's settings
  on the right. It is controlled. `value` is the page (the JSON it emits: { attrs, slots: { default: [widgets] } }) and
  `templates` is the list of saved templates; the builder never stores either itself. Every change emits `change` with
  the page as `detail.value`, and the person's save emits `save` with it. Put what it emits where it belongs (a database, or
  localStorage on a test page), and give the result back as `value`.

  Widgets come from PageBuilder.widgets, and PageBuilder.addWidget adds one (see docs).

  On a narrow screen (the builder's own width at or below `mobile-width`, 768px by default) the tree, the page and the
  settings do not fit side by side, so one is shown at a time and a three button group (`view`) switches between them.
*/
export default class PageBuilder extends ShadowComponent {
  /*
    Static Members
  */
  static widgets = widgets;

  static addWidget = registerWidget;

  static properties = {
    mobile: { type: Boolean, reflect: true },
    mobileWidth: { type: Number, attribute: 'mobile-width' },
    view: { state: true },
    treeOpen: { state: true },
    settingsOpen: { state: true },
    device: { state: true },
    selection: { state: true },
    version: { state: true },
    ready: { state: true }
  };

  /*
    Lifecycle Callbacks
  */
  constructor() {
    super();
    this[treeKey] = emptyPage();
    this[savedKey] = JSON.stringify(this[treeKey]);
    this[frameKey] = null;
    this[coalesceKey] = null;
    this[coalesceTimeKey] = 0;
    this.history = new PageHistory();
    this.selection = [];
    this.mobile = false;
    this.mobileWidth = 768;
    this.view = 'page';
    this.treeOpen = true;
    this.settingsOpen = true;
    this.device = 'desktop';
    this.version = 0;
    this.ready = false;
    this.templates = [];
    this.settings = readSettings();
  }

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('controlled', '');
    document.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('beforeunload', this.handleBeforeUnload);
    this.updateMobile();
    this[resizeKey] = new ResizeObserver(this.updateMobile);
    this[resizeKey].observe(this);
    this[extrasKey] = new MutationObserver(() => this.requestUpdate());
    this[extrasKey].observe(this, { childList: true, attributes: true, attributeFilter: ['slot'] });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    this[resizeKey]?.disconnect();
    this[extrasKey]?.disconnect();
  }

  willUpdate(changed) {
    super.willUpdate(changed);
    if(changed.has('mobileWidth')) this.updateMobile();
  }

  /* The page's handle is placed from the page's size, so it is placed again when the page is shown again. */
  updated(changed) {
    super.updated(changed);
    if(changed.has('mobile') || changed.has('view')) requestAnimationFrame(() => this.frame()?.placeHandle());
  }

  firstUpdated() {
    this[frameKey] = new PageFrame(this.renderRoot.querySelector('iframe'), {
      onSelect: (id, options) => this.select(id, options),
      onBlank: () => this.setSelection([]),
      onChange: (id, changes) => {
        const found = this.find(id);
        if(!found || Object.entries(changes).every(([name, value]) => tree.valueAt(found.node.attrs, name) === value)) return;
        this.change(nodes => {
          const current = tree.findNode(nodes, id);
          if(!current) return 'That widget no longer exists';
          /* A name is a setting; a path (rows.1.0) is a place inside one, as from a table cell edited on the page. */
          for(const [name, value] of Object.entries(changes)) tree.setValueAt(current.node.attrs, name, value);
          return true;
        }, { coalesce: `${id}:widget`, render: false });
      },
      onDrop: (id, place) => this.moveTo(id, place, true),
      restricted: id => this.isSection(id),
      canDrop: (id, parentId, slot) => {
        const dragged = this.find(id);
        if(!dragged || this.registry.get(dragged.node.type)?.section || (parentId && (parentId === id || tree.isInside(this.nodes, id, parentId)))) return false;
        return tree.canContain(this.registry, parentId ? this.find(parentId)?.node : null, slot, dragged.node.type);
      },
      nameOf: id => this.nameOf(id),
      locate: id => this.locate(id),
      onKeyDown: event => this.handleKeyDown(event)
    });
    this.ready = true;
    this.refresh();
  }

  /*
    Protected Members
  */
  get registry() {
    return registryOf(this.constructor.widgets);
  }

  get nodes() {
    return this[treeKey].slots.default;
  }

  /* The page as it is now: what is emitted, and what the parent should store. */
  get value() {
    return this[treeKey];
  }

  set value(next) {
    const page = next ? structuredClone(next) : emptyPage();
    page.attrs = page.attrs || {};
    page.slots = page.slots || {};
    page.slots.default = page.slots.default || [];
    const json = JSON.stringify(page);
    if(json === JSON.stringify(this[treeKey])){
      this[savedKey] = json;
      this.requestUpdate();
      return;
    }
    this[treeKey] = page;
    this[savedKey] = json;
    this.history.clear();
    this.prune();
    this.refresh();
    this.settle();
  }

  get dirty() {
    return JSON.stringify(this[treeKey]) !== this[savedKey];
  }

  find = id => (id ? tree.findNode(this.nodes, id) : null);

  locate = id => {
    const found = this.find(id);
    return found ? { parentId: found.parent?.id ?? null, slot: found.slot, index: found.index } : null;
  };

  isSection = id => !!this.registry.get(this.find(id)?.node.type)?.section;

  nameOf(id) {
    if(!id) return 'the page';
    const header = this.frame()?.document.querySelector(`[data-pb-id="${CSS.escape(id)}"]`);
    const text = header?.matches('k-accordion-header, k-tab') ? header.textContent.trim() : '';
    if(text) return text.slice(0, 30);
    return this.registry.get(this.find(id)?.node.type)?.title || 'here';
  }

  frame() {
    return this[frameKey];
  }

  /* The place a widget added now goes: after the last selected widget (or at the end). */
  placement() {
    return { targetId: this.selection[this.selection.length - 1] ?? null };
  }

  /*
    The place a new widget goes: inside the selected widget when it can hold it, in the first part of it that is showing (the
    open section of an accordion, the active tab, the first column), otherwise after the selected widget as `placement` says.
  */
  addPlacement(type) {
    const id = this.selection[this.selection.length - 1];
    const selected = id && this.find(id)?.node;
    const definition = selected && this.registry.get(selected.type);
    if(definition?.slots?.length){
      const sections = this.registry.get(type)?.section ? [] : (selected.slots?.[tree.firstSlotOf(this.registry, selected)] || []).filter(child => this.registry.get(child.type)?.section && this.registry.get(child.type).slots?.length);
      const showing = element => element.getBoundingClientRect().height > 0;
      const shown = sections.find(section => [...(this.frame()?.document.querySelectorAll(`[data-pb-id="${CSS.escape(section.id)}"][data-pb-slot]`) || [])].some(showing)) || sections[0];
      const inside = shown ? { targetId: shown.id, inside: true } : { targetId: id, inside: true };
      if(!tree.addWidget(structuredClone(this.nodes), this.registry, type, inside).error) return inside;
    }
    return this.placement();
  }

  canAdd = type => !tree.addWidget(structuredClone(this.nodes), this.registry, type, this.addPlacement(type)).error;

  /*
    Public Methods
  */

  /* Changes the page: `mutate` gets the page's widgets and the page, and returns true, a string (why it could not) or
     { error, select }. A change that is refused leaves the page as it was. */
  change(mutate, { coalesce = null, render: show = true } = {}) {
    const before = structuredClone(this[treeKey]);
    const result = mutate(this.nodes, this[treeKey]);
    const reason = typeof result === 'string' ? result : result?.error;
    if(reason){
      this[treeKey] = before;
      if(!QUIET.test(reason)) Toast.error(reason);
      return false;
    }
    const now = Date.now();
    if(!(coalesce && this[coalesceKey] === coalesce && now - this[coalesceTimeKey] < COALESCE_MS)) this.history.push(before);
    this[coalesceKey] = coalesce;
    this[coalesceTimeKey] = now;
    if(result?.select) this.selection = result.select;
    this.prune();
    if(show) this.refresh();
    else this.version++;
    this.publish();
    return true;
  }

  /* Draws the page in the frame again, and the panels. */
  refresh() {
    this.version++;
    this.frame()?.render(this.nodes, this.registry, this.selection);
    this.requestUpdate();
  }

  publish() {
    this.dispatchEvent(new CustomEvent('change', { detail: { value: structuredClone(this[treeKey]) } }));
    this.requestUpdate();
  }

  /* A widget's prepare (see pageWidgets.js) fills in what it needs from outside the page, such as a picture's size, once the page is shown. */
  settle() {
    const jobs = [];
    tree.walk(this.nodes, node => {
      const prepare = this.registry.get(node.type)?.prepare;
      if(prepare) jobs.push(prepare(structuredClone(node)).then(apply => ({ id: node.id, apply })));
    });
    Promise.all(jobs).then(results => {
      const changed = results.map(({ id, apply }) => {
        const found = apply && tree.findNode(this.nodes, id);
        return found ? apply(found.node) : false;
      });
      if(!changed.some(Boolean)) return;
      this.prune();
      this.refresh();
      this.publish();
    });
  }

  prune() {
    this.selection = this.selection.filter(id => this.find(id));
  }

  /* Puts the page back to how it was last saved (or set). */
  reset = () => {
    if(!this.dirty) return;
    const before = structuredClone(this[treeKey]);
    this[treeKey] = JSON.parse(this[savedKey]);
    this.history.push(before);
    this[coalesceKey] = null;
    this.prune();
    this.refresh();
    this.publish();
  };

  /* Saves: the page is what the parent is given (the save event), and it counts as saved from now on. */
  save = () => {
    this[savedKey] = JSON.stringify(this[treeKey]);
    this.dispatchEvent(new CustomEvent('save', { detail: { value: structuredClone(this[treeKey]) } }));
    this.requestUpdate();
    Toast.success('Page saved');
  };

  undo = () => {
    const previous = this.history.undo(structuredClone(this[treeKey]));
    if(!previous) return;
    this[treeKey] = previous;
    this[coalesceKey] = null;
    this.prune();
    this.refresh();
    this.publish();
  };

  redo = () => {
    const next = this.history.redo(structuredClone(this[treeKey]));
    if(!next) return;
    this[treeKey] = next;
    this[coalesceKey] = null;
    this.prune();
    this.refresh();
    this.publish();
  };

  setDevice = device => {
    this.device = device;
    this.frame()?.placeHandle();
  };

  /* On a narrow screen: shows one of 'tree', 'page' or 'settings', and nothing else. */
  setView = view => {
    if(VIEWS.includes(view)) this.view = view;
  };

  /* Whether the builder is narrow enough to show one view at a time. */
  updateMobile = () => {
    this.mobile = this.clientWidth <= this.mobileWidth;
  };

  /* Shows or hides the tree beside the page; on a narrow screen it is the tree view, or the page again. */
  toggleTree = () => {
    if(this.mobile) this.setView(this.view === 'tree' ? 'page' : 'tree');
    else this.treeOpen = !this.treeOpen;
  };

  toggleSettings = () => {
    if(this.mobile) this.setView(this.view === 'settings' ? 'page' : 'settings');
    else this.settingsOpen = !this.settingsOpen;
  };

  setPageAttr(name, value) {
    this.change((nodes, page) => {
      page.attrs[name] = value;
      return true;
    }, { coalesce: `page:${name}`, render: false });
  }

  /* For a widget's settings element: changes one setting. */
  setWidgetAttribute(id, name, value, coalesce = false) {
    this.change(nodes => {
      const found = tree.findNode(nodes, id);
      if(!found) return 'That widget no longer exists';
      found.node.attrs[name] = value;
      return true;
    }, { coalesce: coalesce ? `${id}:${name}` : null });
  }

  /* For a widget's settings element: changes the page any way the function likes, as one step. */
  editWidget(id, mutate, coalesce = false) {
    this.change(nodes => {
      const found = tree.findNode(nodes, id);
      if(!found) return 'That widget no longer exists';
      return mutate(found.node, nodes);
    }, { coalesce: coalesce ? `${id}:edit` : null });
  }

  /* For a widget's settings element: adds a widget inside one, leaving the selection alone. */
  addChild(parentId, type, slot = 'default') {
    this.change(nodes => {
      const result = tree.addWidget(nodes, this.registry, type, { targetId: parentId, inside: true, slot });
      return result.error ? result : true;
    });
  }

  /*
    Selection
  */

  /* A section (a column, a tab, an accordion section) is not selected on its own: the widget it is part of is. */
  select = (id, { additive = false } = {}) => {
    let found = this.find(id);
    while(found?.parent && this.registry.get(found.node.type)?.section){
      id = found.parent.id;
      found = this.find(id);
    }
    let next = [id];
    if(additive){
      if(this.selection.includes(id)) next = this.selection.filter(other => other !== id);
      else if(tree.sharePlace(this.nodes, [...this.selection, id])) next = [...this.selection, id];
    }
    this.setSelection(next);
  };

  setSelection(ids) {
    this.selection = ids;
    this.frame()?.setSelection(ids);
    if(ids[0]) this.frame()?.scrollTo(ids[0]);
    this.version++;
  }

  selectParent = () => {
    const parent = this.selection.length === 1 ? this.find(this.selection[0])?.parent : null;
    this.setSelection(parent ? [parent.id] : []);
  };

  /*
    Adding
  */

  openInserter = () => {
    const inserter = document.createElement('k-page-builder-inserter');
    inserter.registry = this.registry;
    inserter.host = this;
    this.inserterDialog = Dialog.create(inserter, { title: 'Add a widget', cancelText: 'Close', width: 'min(60rem, 95vw)', height: '90vh' });
    this.inserterDialog.updateComplete?.then(() => requestAnimationFrame(() => inserter.focusSearch()));
  };

  insert = type => {
    this.inserterDialog?.close();
    this.change(nodes => {
      const result = tree.addWidget(nodes, this.registry, type, this.addPlacement(type));
      return result.error ? result : { select: [result.id] };
    });
  };

  /*
    Changing the page
  */

  removeSelection = () => {
    if(!this.selection.length) return;
    const ids = [...this.selection];
    const run = () => this.change(nodes => {
      const next = tree.neighbour(nodes, ids[0]);
      tree.removeWidgets(nodes, ids);
      return { select: next && !ids.includes(next) ? [next] : [] };
    });
    if(this.settings.confirmDeletion) Dialog.confirm(`Delete ${ids.length > 1 ? `these ${ids.length} widgets` : 'this widget'}?`, confirmed => confirmed && run(), { title: 'Delete' });
    else run();
  };

  moveUp = () => this.selection.length && this.change(nodes => tree.moveBy(nodes, this.registry, this.selection, -1));

  moveDown = () => this.selection.length && this.change(nodes => tree.moveBy(nodes, this.registry, this.selection, 1));

  moveOutOf = () => this.selection.length === 1 && this.change(nodes => tree.moveOut(nodes, this.registry, this.selection[0]));

  moveInto = () => this.selection.length === 1 && this.change(nodes => tree.moveIn(nodes, this.registry, this.selection[0]));

  duplicateSelection = () => {
    if(!this.selection.length) return;
    this.change(nodes => {
      const result = tree.duplicateWidgets(nodes, this.selection);
      return result.error ? result : { select: result.ids };
    });
  };

  moveTo(id, place, keepSelection = false) {
    this.change(nodes => {
      const result = tree.moveWidget(nodes, this.registry, id, place.parentId, place.slot, place.index);
      return result === true && !keepSelection ? { select: [id] } : result;
    });
  }

  /* From the tree: a row was dropped before, after or into another. */
  dropOn = (draggedId, targetId, zone) => {
    const target = this.find(targetId);
    if(!target || !this.find(draggedId)) return;
    if(zone === 'inside'){
      const slot = tree.firstSlotOf(this.registry, target.node);
      if(!slot) return;
      this.moveTo(draggedId, { parentId: targetId, slot, index: Infinity });
      return;
    }
    this.dropNear(draggedId, targetId, zone === 'before');
  };

  dropNear(draggedId, targetId, before) {
    const dragged = this.find(draggedId);
    if(!dragged || this.registry.get(dragged.node.type)?.section || draggedId === targetId || tree.isInside(this.nodes, draggedId, targetId)) return;
    const found = this.find(targetId);
    if(!found) return;
    this.moveTo(draggedId, { parentId: found.parent?.id ?? null, slot: found.slot, index: found.index + (before ? 0 : 1) });
  }

  showDropTarget = (id, zone) => this.frame()?.showDropTarget(id, zone);

  /*
    Templates: the builder asks the parent to keep them (template-save and template-remove events), and lists the
    `templates` it is given.
  */

  saveTemplate = () => {
    if(!this.selection.length){
      Toast.error('Select a widget to save as a template');
      return;
    }
    const nodes = this.selection.map(id => tree.cloneNode(this.find(id).node)).filter(Boolean);
    const dialog = Dialog.create(html`
      <div class="p">
        <label class="d-b mbq" for="pb-template-name">Template name<small class="d-b tc-muted">Inserting a template makes a copy, so changing it later does not change the pages that used it.</small></label>
        <input id="pb-template-name" type="text" class="full" maxlength="100">
      </div>
    `, {
      title: 'Save as a template',
      confirmText: 'Save template',
      cancelText: 'Cancel',
      confirmAction: event => {
        const name = dialog.querySelector('#pb-template-name').value.trim();
        if(!name){
          event.keepDialogOpen = true;
          Toast.error('Give the template a name');
          return;
        }
        this.dispatchEvent(new CustomEvent('template-save', { detail: { name, nodes: structuredClone(nodes) } }));
        Toast.success('Template saved');
      }
    });
  };

  insertTemplate = () => {
    if(!this.templates.length){
      Toast.error('There are no templates yet. Select a widget and use Save as a template.');
      return;
    }
    const container = document.createElement('div');
    render(html`
      <div class="p">
        ${this.templates.map((template, index) => html`
          <div class="d-f mb">
            <span class="flex">${template.name}</span>
            <button class="primary" @click="${() => { dialog.close(); this.insertTemplateNodes(template); }}">Insert</button>
            <button class="danger" @click="${() => { dialog.close(); this.dispatchEvent(new CustomEvent('template-remove', { detail: { index } })); }}">Delete</button>
          </div>
        `)}
      </div>
    `, container);
    const dialog = Dialog.create(container, { title: 'Insert a template', cancelText: 'Close' });
  };

  insertTemplateNodes(template) {
    this.change(nodes => {
      const copies = tree.freshCopies(structuredClone(template.nodes));
      const result = tree.insertNodes(nodes, this.registry, copies, this.placement());
      return result.error ? result : { select: result.ids };
    });
  }

  /*
    Editor settings and help
  */

  /* An editor setting is a preference of the person editing. It is kept in this browser, not in the page. */
  setEditorSetting(name, value) {
    this.settings = { ...this.settings, [name]: value };
    writeSettings(this.settings);
    this.requestUpdate();
  }

  openShortcuts = () => {
    const rows = [
      ['Click', 'Select the outermost widget under the pointer. Each click inside it selects the next widget down, and clicking the selected widget edits its text.'],
      ['Shift or Ctrl + click', 'Add the widget beside the selected one (same parent) to the selection.'],
      ['Drag the handle', 'Move the selected widget: drop it in a box that shows on the page. Letting go anywhere else cancels.'],
      ['Ctrl + K', 'Open the Add a widget list, with the search ready to type in. Enter adds the first widget it finds.'],
      ['Ctrl + S', 'Save the page.'],
      ['Ctrl + D', 'Duplicate the selected widgets.'],
      ['Ctrl + Z', 'Undo.'],
      ['Ctrl + Shift + Z, Ctrl + Shift + Y or Ctrl + Y', 'Redo.'],
      ['Delete or Backspace', 'Delete the selected widgets.'],
      ['Enter, in a table cell', 'Add a row below and move into the same column of it.'],
      ['Shift + Enter, in a table cell', 'A new line in the same cell.'],
      ['Ctrl + Enter, in a table cell', 'Add a column after the cell and move into it.'],
      ['Tab, in a table cell', 'Move to the next cell.'],
      ['Escape', 'Stop typing and keep the widget selected. Pressed again, select its parent, and at the top of the page select nothing, which shows the page settings.'],
      ['Alt + Shift + Up or Down', 'Move the selection up or down.'],
      ['Alt + Shift + Left', 'Move the selection out of its parent.'],
      ['Alt + Shift + Right', 'Move the selection into the widget before it.']
    ];
    Dialog.create(html`
      <div class="p">
        <p class="tc-muted">On a Mac, Ctrl means Cmd. Inside text the browser's own shortcuts work (Ctrl + B and the rest), and Ctrl + Z and Delete stay the text's own, so one key never does two things.</p>
        <table>
          <thead><tr><th>Keys</th><th>Does</th></tr></thead>
          <tbody>${rows.map(([keys, does]) => html`<tr><td><strong>${keys}</strong></td><td>${does}</td></tr>`)}</tbody>
        </table>
      </div>
    `, { title: 'Keyboard shortcuts', cancelText: 'Close', width: 'min(48rem, 95vw)' });
  };

  /*
    Keyboard
  */

  /* Whether a key is for the text under the cursor, not for the selected widget. */
  isTyping(event) {
    const path = event.composedPath();
    const widget = path.find(element => element.dataset?.pbId);
    if(widget && !this.selection.includes(widget.dataset.pbId)) return false;
    return path.some(element => element.matches?.('input, textarea, select, [contenteditable]') || element.tagName === 'K-HTML-EDITOR');
  }

  /*
    Event Handlers
  */
  /* A key pressed in an editable part of a widget (a table cell) can be one the widget gives a meaning to: see `keydown` in pageWidgets.js. */
  handleEditKeys(event) {
    if(event.isComposing) return false;
    const part = event.target?.closest?.('[data-pb-edit]');
    const id = part?.closest('[data-pb-id]')?.dataset.pbId;
    const found = id && this.find(id);
    const result = found && this.registry.get(found.node.type)?.keydown?.(event, { node: found.node, path: part.dataset.pbEdit, html: this.frame().htmlOf(part) });
    if(!result) return false;
    event.preventDefault();
    this.frame().focusAfterRender(id, result.focus);
    this.change(nodes => {
      const current = tree.findNode(nodes, id);
      if(!current) return 'That widget no longer exists';
      Object.assign(current.node.attrs, result.attrs);
      return true;
    });
    return true;
  }

  handleKeyDown = event => {
    if(!this.ready) return;
    if(this.handleEditKeys(event)) return;
    const mod = event.ctrlKey || event.metaKey;
    const key = event.key.toLowerCase();
    const typing = this.isTyping(event);

    if(mod && key === 's'){
      event.preventDefault();
      this.frame()?.blurFocus();
      this.save();
      return;
    }
    if(mod && !event.altKey && !event.shiftKey && key === 'k'){
      event.preventDefault();
      if(!document.querySelector('k-dialog[opened]')) this.openInserter();
      return;
    }
    if(mod && key === 'd' && this.selection.length){
      event.preventDefault();
      this.duplicateSelection();
      return;
    }
    if(mod && !event.altKey && (key === 'z' || key === 'y')){
      if(typing) return;
      event.preventDefault();
      if(key === 'y' || event.shiftKey) this.redo();
      else this.undo();
      return;
    }
    if(event.altKey && event.shiftKey && key.startsWith('arrow')){
      event.preventDefault();
      if(key === 'arrowup') this.moveUp();
      else if(key === 'arrowdown') this.moveDown();
      else if(key === 'arrowleft') this.moveOutOf();
      else this.moveInto();
      return;
    }
    if(key === 'escape'){
      if(typing){
        document.activeElement?.blur?.();
        this.frame()?.blurFocus();
        return;
      }
      this.selectParent();
      return;
    }
    if((key === 'delete' || key === 'backspace') && !typing && this.selection.length){
      event.preventDefault();
      this.removeSelection();
    }
  };

  handleBeforeUnload = event => {
    if(!this.dirty) return;
    event.preventDefault();
    event.returnValue = '';
  };

  /* A click in the tree that is not on a widget selects nothing, which shows the page's settings. */
  handleTreeClick = event => {
    if(event.composedPath().some(element => element.matches?.('.row, button'))) return;
    this.setSelection([]);
  };

  /*
    Protected Members
  */
  /* Whether the page builder's element has a control in one of its extra slots (`slot="left-end"` and so on). */
  hasExtra = name => !!this.querySelector(`:scope > [slot="${name}"]`);

  /*
    Rendering
  */
  renderBar() {
    const any = this.selection.length > 0;
    const single = this.selection.length === 1;
    return html`
      <k-control-bar>
        ${this.mobile
          ? html`
            <k-control-group no-collapse>
              ${VIEWS.map(view => html`<kc-pb-view view="${view}" ?active="${this.view === view}"></kc-pb-view>`)}
            </k-control-group>`
          : html`<kc-pb-tree no-collapse ?active="${this.treeOpen}"></kc-pb-tree>`}
        <k-control-group split>
          <kc-pb-add no-collapse></kc-pb-add>
          <kc-pb-delete priority="11" ?disabled="${!any}"></kc-pb-delete>
          <kc-pb-duplicate ?disabled="${!any}"></kc-pb-duplicate>
        </k-control-group>
        <k-control-group priority="5">
          <kc-undo ?disabled="${!this.history.canUndo}"></kc-undo>
          <kc-redo ?disabled="${!this.history.canRedo}"></kc-redo>
        </k-control-group>
        <k-control-group priority="1">
          <kc-pb-move-up ?disabled="${!any}"></kc-pb-move-up>
          <kc-pb-move-down ?disabled="${!any}"></kc-pb-move-down>
          <kc-pb-move-in ?disabled="${!single}"></kc-pb-move-in>
          <kc-pb-move-out ?disabled="${!single}"></kc-pb-move-out>
        </k-control-group>
        ${this.hasExtra('left-end') ? html`<k-control-group priority="2"><slot name="left-end"></slot></k-control-group>` : ''}
        ${this.hasExtra('center-start') ? html`<k-control-group slot="center" priority="2"><slot name="center-start"></slot></k-control-group>` : ''}
        ${this.mobile ? '' : html`
          <k-control-group slot="center" priority="10">
            ${DEVICES.map(([device]) => html`<kc-pb-device device="${device}" ?active="${this.device === device}"></kc-pb-device>`)}
          </k-control-group>`}
        ${this.hasExtra('center-end') ? html`<k-control-group slot="center" priority="2"><slot name="center-end"></slot></k-control-group>` : ''}
        ${this.hasExtra('right-start') ? html`<k-control-group slot="right" priority="2"><slot name="right-start"></slot></k-control-group>` : ''}
        <kc-menu slot="right" title="Templates" split>
          <k-icon slot="icon" name="dashboard_customize"></k-icon>
          <kc-pb-template-save ?disabled="${!any}"></kc-pb-template-save>
          <kc-pb-template-insert></kc-pb-template-insert>
        </kc-menu>
        <k-control-group slot="right" split>
          <kc-pb-save no-collapse ?dirty="${this.dirty}" title="${this.dirty ? 'Save the page (Ctrl+S). There are unsaved changes.' : 'Save the page (Ctrl+S)'}"></kc-pb-save>
          <kc-pb-reset ?disabled="${!this.dirty}"></kc-pb-reset>
        </k-control-group>
        <kc-pb-shortcuts slot="right"></kc-pb-shortcuts>
        ${this.mobile ? '' : html`<kc-pb-settings slot="right" no-collapse ?active="${this.settingsOpen}"></kc-pb-settings>`}
      </k-control-bar>
    `;
  }

  render() {
    const single = this.selection.length === 1 ? this.find(this.selection[0])?.node : null;
    const definition = single ? this.registry.get(single.type) : null;
    const showTree = this.mobile ? this.view === 'tree' : this.treeOpen;
    const showSettings = this.mobile ? this.view === 'settings' : this.settingsOpen;
    const showPage = !this.mobile || this.view === 'page';
    const full = this.mobile ? 'full' : '';
    return html`
      <div class="pb">
        <div class="bar">${this.renderBar()}</div>
        <div class="body">
          ${showTree ? html`
            <aside class="tree ${full}" @click="${this.handleTreeClick}">
              <k-page-builder-tree .nodes="${this.nodes}" .registry="${this.registry}" .selection="${this.selection}" .host="${this}"></k-page-builder-tree>
            </aside>` : ''}
          <div class="canvas ${this.mobile ? '' : this.device}" ?hidden="${!showPage}">
            <iframe title="Page content"></iframe>
          </div>
          ${showSettings ? html`
            <aside class="attrs ${full}">
              <k-page-builder-settings .node="${single}" .widget="${definition}" .count="${this.selection.length}" .page="${this[treeKey]}" .editorSettings="${this.settings}" .registry="${this.registry}" .host="${this}" .version="${this.version}"></k-page-builder-settings>
            </aside>` : ''}
        </div>
      </div>
    `;
  }

  /*
    Styles
  */
  static styles = css`
    :host {
      display: block;
      height: 80vh;
      min-height: 30rem;
    }
    .pb {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }
    .bar {
      padding: var(--spacer_h, 0.5rem);
      border-bottom: 1px solid var(--c_border, #8884);
    }
    .body {
      display: flex;
      flex: 1;
      min-height: 0;
    }
    aside {
      overflow: auto;
      flex: none;
    }
    aside.tree {
      width: 18rem;
      border-right: 1px solid var(--c_border, #8884);
    }
    aside.attrs {
      width: 22rem;
      border-left: 1px solid var(--c_border, #8884);
    }
    aside.full {
      flex: 1 1 auto;
      width: auto;
      min-width: 0;
      border: 0;
    }
    .canvas {
      flex: 1;
      min-width: 0;
      overflow: auto;
      background: var(--c_bg__alt, #8881);
    }
    iframe {
      display: block;
      width: 100%;
      height: 100%;
      border: 0;
      background: var(--c_bg, #fff);
      margin: 0 auto;
    }
    /* The page's breakpoints work on the frame's own width, so each preview is a width inside its own range (desktop from 1024px, tablet 769 to 1023px, phone 768px or less). */
    .desktop iframe {
      min-width: 1024px;
    }
    .tablet iframe {
      width: 900px;
    }
    .phone iframe {
      width: 390px;
      max-width: 100%;
    }
  `;
}

customElements.define('k-page-builder', PageBuilder);
