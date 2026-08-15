import { html, css } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';
import './Card.js';
import { boolExists } from '../utils/propConverters.js';

const selected = Symbol('selected');
const hidden = Symbol('hidden');
const index = Symbol('index');

/*
  A generic version of Table for content that reads better as tiles than rows — thumbnails, media,
  anything where a grid of cards beats a grid of cells. Selection, pagination and basic record CRUD
  all match Table's own method names and event shapes on purpose, so the same Tc* controls (built
  against Table's contract) work against either one unmodified: both set `controlled` on themselves
  in connectedCallback so Control's closest('[controlled]') host lookup finds either, and both
  implement getSelectedRecords()/selectAllOnPage()/deselectAllOnPage()/deleteSelected()/etc.
  identically as far as a control can tell.

  What doesn't carry over: sorting, filtering, search and inline editing are all column-shaped
  concepts (Table's `fields`) that have no equivalent once there are no columns — a card is one
  opaque unit, not a row of independently addressable cells. cardTemplate(record, host) stands in
  for `fields`/`calculator`: one render function for the whole card instead of one per column.
*/
export default class CardGrid extends ShadowComponent {
  static properties = {
    enablePages: { type: Boolean, reflect: true, converter: boolExists, attribute: 'enable-pages' },
    pageSize: { type: Number, reflect: true, attribute: 'page-size' },
    currentPage: { type: Number, reflect: true, attribute: 'current-page' },
    pageSizeOptions: { type: Array, attribute: 'page-size-options' },
    enableSelection: { type: Boolean, reflect: true, converter: boolExists, attribute: 'enable-selection' },
    requestDelete: { type: Boolean, reflect: true, converter: boolExists, attribute: 'request-delete' },
    placeholder: { type: String, reflect: true },
    filteredPlaceholder: { type: String, reflect: true, attribute: 'filtered-placeholder' },
    minCardWidth: { type: String, reflect: true, attribute: 'min-card-width' },
    records: { type: Array },
    cardTemplate: { attribute: false }
  };

  constructor(options = {}) {
    super();

    if(this.pageSize === undefined) this.pageSize = 50;
    if(this.currentPage === undefined) this.currentPage = 1;
    if(this.pageSizeOptions === undefined) this.pageSizeOptions = [10, 25, 50, 100, 500];
    if(this.records === undefined) this.records = options.records || [];
    if(this.cardTemplate === undefined) this.cardTemplate = options.cardTemplate || null;
    if(this.requestDelete === undefined) this.requestDelete = false;
    if(this.placeholder === undefined) this.placeholder = 'No Records';
    if(this.filteredPlaceholder === undefined) this.filteredPlaceholder = '';
    if(this.minCardWidth === undefined) this.minCardWidth = '11rem';
  }

  /*
    Event Handlers
  */

  handleSelectAllChange = e => {
    if(e.target.checked) this.selectAllOnPage();
    else this.deselectAllOnPage();
  };

  handleRecordSelectionChange = (record, e) => {
    record[selected] = !!e.target.checked;
    this.requestUpdate();
    this.dispatchEvent(new CustomEvent('selectionChange', { bubbles: true }));
  };

  /* Lifecycle Callbacks */

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('controlled')) this.setAttribute('controlled', '');
  }

  firstUpdated() {
    this.setData({
      records: this.records,
      cardTemplate: this.cardTemplate
    });
  }

  childrenUpdated() {
    this.requestUpdate();
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if(this.enableSelection) {
      const selectAllCheckbox = this.shadowRoot.getElementById('select-all');
      if(selectAllCheckbox) {
        selectAllCheckbox.checked = this.getDisplayedRecords().length > 0 && this.allOnPageSelected();
      }
    }
  }

  /*
    Rendering Functions
  */

  renderCardsTemplate() {
    let displayedRecords = this.getDisplayedRecords();
    let start = 0;
    let end = this.pageSize;

    if(this.enablePages) {
      start = (this.currentPage - 1) * this.pageSize;
      end = start + this.pageSize;
      displayedRecords = displayedRecords.slice(start, end);
    }

    if(displayedRecords.length === 0) {
      const hasRecords = this.records.length > 0;
      const message = hasRecords ? this.filteredPlaceholder : this.placeholder;
      return message ? html`<p class="placeholder">${message}</p>` : html``;
    }

    return displayedRecords.map(record => this.renderCardTemplate(record));
  }

  renderCardTemplate(record) {
    const before = this.hasBeforeControls() ? this.getClonedControls('before') : [];
    const after = this.hasAfterControls() ? this.getClonedControls('after') : [];
    const showBefore = this.enableSelection || before.length;

    return html`
      <k-card class="tile" data-index=${record[index]}>
        ${showBefore ? html`
          <div class="tile-controls tile-controls-before">
            ${this.enableSelection ? html`
              <input
                type="checkbox"
                class="card-select"
                .checked=${record[selected]}
                @click=${e => e.stopPropagation()}
                @change=${e => this.handleRecordSelectionChange(record, e)}
              />
            ` : ''}
            ${before}
          </div>
        ` : ''}
        ${this.cardTemplate ? this.cardTemplate(record, this) : ''}
        ${after.length ? html`<div class="tile-controls tile-controls-after">${after}</div>` : ''}
      </k-card>
    `;
  }

  /*
    Per-card controls — one instance per card, cloned fresh from a template registered once in light
    DOM (slot="before"/slot="after"), the same mechanism Table uses for its own before/after row
    controls. Native slotting can't place the same element into every card at once, so this clones a
    new element per card instead (tag + attributes only, same limitation Table's version has — a
    property can't survive a clone, only attributes). A control reads its own record by walking up to
    its own .tile's data-index and looking it up on the host, the same pattern kempo core's own
    AdminTableControl.record uses for Table's before/after controls.

    The selection checkbox is built-in, not a slot="before" registration — but it renders inside the
    exact same .tile-controls-before strip, as the first item, rather than as a separate overlay.
    From the card's perspective it IS the first before-control, just one CardGrid provides itself.
  */
  getClonedControls(slotName) {
    const controls = [];
    this.querySelectorAll(`[slot="${slotName}"]`).forEach(control => {
      const tagName = control.tagName.toLowerCase();
      const newControl = document.createElement(tagName);
      Array.from(control.attributes).forEach(attr => {
        if(attr.name !== 'slot') newControl.setAttribute(attr.name, attr.value);
      });
      if(control.innerHTML) newControl.innerHTML = control.innerHTML;
      controls.push(newControl);
    });
    return controls;
  }

  /*
    Utility Functions
  */

  hasTopControls() {
    return !!this.querySelector('[slot="top"]');
  }

  hasBottomControls() {
    return !!this.querySelector(':scope > :not([slot])');
  }

  hasBeforeControls() {
    return !!this.querySelector('[slot="before"]');
  }

  hasAfterControls() {
    return !!this.querySelector('[slot="after"]');
  }

  /*
    Public Methods
  */

  getCurrentPage() {
    return this.currentPage;
  }

  getTotalPages() {
    return Math.max(1, Math.ceil(this.getDisplayedRecords().length / this.pageSize));
  }

  setPage(page) {
    if(page < 1 || page > this.getTotalPages()) return;
    this.currentPage = page;
    this.requestUpdate();
    this.dispatchEvent(new CustomEvent('pageChange', { bubbles: true }));
  }

  firstPage() {
    if(this.currentPage !== 1) this.setPage(1);
  }

  nextPage() {
    if(this.currentPage < this.getTotalPages()) this.setPage(this.currentPage + 1);
  }

  prevPage() {
    if(this.currentPage > 1) this.setPage(this.currentPage - 1);
  }

  lastPage() {
    if(this.currentPage !== this.getTotalPages()) this.setPage(this.getTotalPages());
  }

  setPageSize(pageSize) {
    this.pageSize = pageSize;
    this.currentPage = 1;
    this.requestUpdate();
    this.dispatchEvent(new CustomEvent('pageSizeChange', { bubbles: true }));
  }

  getPageSize() {
    return this.pageSize;
  }

  getPageSizeOptions() {
    return this.pageSizeOptions;
  }

  setPageSizeOptions(options) {
    this.pageSizeOptions = options;
    this.requestUpdate();
  }

  setData({ records = false, cardTemplate = false, pageSize = false, pageSizeOptions = false, currentPage = false, enableSelection } = {}) {
    let rerender = false;
    const pageCountBefore = this.getTotalPages();
    const pageBefore = this.currentPage;

    if(records) {
      this.records = records.map(r => ({ ...r }));
      this.records.forEach((record, idx) => {
        record[index] = idx;
        record[selected] = false;
        record[hidden] = false;
      });
      rerender = true;
    }

    if(cardTemplate) {
      this.cardTemplate = cardTemplate;
      rerender = true;
    }

    if(pageSize) {
      this.pageSize = pageSize;
      rerender = true;
    }

    if(pageSizeOptions) this.pageSizeOptions = pageSizeOptions;

    if(currentPage) {
      this.currentPage = currentPage;
      rerender = true;
    }

    if(enableSelection !== undefined) {
      this.enableSelection = enableSelection;
      rerender = true;
    }

    if(rerender) this.requestUpdate();

    const newPageCount = this.getTotalPages();
    if(newPageCount !== pageCountBefore) {
      this.dispatchEvent(new CustomEvent('pageCountChanged', { detail: { totalPages: newPageCount }, bubbles: true }));
    }

    if(pageBefore > newPageCount) this.setPage(newPageCount);
  }

  setRecords(records, cardTemplate) {
    const pageCountBefore = this.getTotalPages();
    const pageBefore = this.currentPage;

    this.records = records.map(r => ({ ...r }));
    this.records.forEach((record, idx) => {
      record[index] = idx;
      record[selected] = false;
      record[hidden] = false;
    });
    if(cardTemplate) this.cardTemplate = cardTemplate;
    this.requestUpdate();
    this.dispatchEvent(new CustomEvent('recordsSet', { detail: { records }, bubbles: true }));

    const newPageCount = this.getTotalPages();
    if(newPageCount !== pageCountBefore) {
      this.dispatchEvent(new CustomEvent('pageCountChanged', { detail: { totalPages: newPageCount }, bubbles: true }));
    }

    if(pageBefore > newPageCount) this.setPage(newPageCount);
  }

  addRecord(record) {
    record[selected] = false;
    record[hidden] = false;
    record[index] = this.records.length;
    this.records.push(record);
    this.requestUpdate();
    this.dispatchEvent(new CustomEvent('recordAdded', { detail: { record }, bubbles: true }));
  }

  updateRecord(record, newData) {
    let updated = false;
    let originalRecord = this.records.find(r => r === record);
    if(!originalRecord && record[index] !== undefined) originalRecord = this.records[record[index]];
    Object.keys(newData).forEach(key => {
      if(originalRecord.hasOwnProperty(key)) {
        originalRecord[key] = newData[key];
        updated = true;
      }
    });
    if(updated) this.requestUpdate();
  }

  deleteRecord(record) {
    let originalRecord = this.records.find(r => r === record);
    const totalPagesBefore = this.getTotalPages();
    if(!originalRecord && record[index] !== undefined) originalRecord = this.records[record[index]];
    if(!originalRecord) return;
    const commit = () => {
      const recordIndex = this.records.indexOf(originalRecord);
      this.records.splice(recordIndex, 1);
      this.records.forEach((rec, idx) => { rec[index] = idx; });
      this.requestUpdate();
      this.dispatchEvent(new CustomEvent('selectionChange', { bubbles: true }));
      this.dispatchEvent(new CustomEvent('recordDeleted', { detail: { index: recordIndex }, bubbles: true }));
      const totalPages = this.getTotalPages();
      if(this.currentPage > totalPages) this.setPage(totalPages);
      if(totalPages !== totalPagesBefore) {
        this.dispatchEvent(new CustomEvent('pageCountChanged', { detail: { totalPages }, bubbles: true }));
      }
    };
    if(this.requestDelete) {
      const cardEl = this.shadowRoot.querySelector(`.tile[data-index="${originalRecord[index]}"]`);
      cardEl?.classList.add('pending');
      const wrappedCommit = () => { cardEl?.classList.remove('pending'); commit(); };
      const reject = () => { cardEl?.classList.remove('pending'); };
      this.dispatchEvent(new CustomEvent('requestDelete', { detail: { records: [originalRecord], approve: wrappedCommit, reject }, bubbles: true }));
    } else {
      commit();
    }
  }

  deleteSelected() {
    const totalPagesBefore = this.getTotalPages();
    const originalRecords = this.getSelectedRecords()
      .map(record => this.records.find(r => r === record) ?? (record[index] !== undefined ? this.records[record[index]] : null))
      .filter(Boolean);
    if(!originalRecords.length) return;
    const commit = () => {
      originalRecords.forEach(record => {
        const i = this.records.indexOf(record);
        if(i !== -1) this.records.splice(i, 1);
      });
      this.records.forEach((rec, idx) => { rec[index] = idx; });
      this.requestUpdate();
      const totalPages = this.getTotalPages();
      if(this.currentPage > totalPages) this.setPage(totalPages);
      if(totalPages !== totalPagesBefore) {
        this.dispatchEvent(new CustomEvent('pageCountChanged', { detail: { totalPages }, bubbles: true }));
      }
      this.dispatchEvent(new CustomEvent('selectionChange', { bubbles: true }));
    };
    if(this.requestDelete) {
      const cardEls = originalRecords.map(r => this.shadowRoot.querySelector(`.tile[data-index="${r[index]}"]`)).filter(Boolean);
      cardEls.forEach(el => el.classList.add('pending'));
      const wrappedCommit = () => { cardEls.forEach(el => el.classList.remove('pending')); commit(); };
      const reject = () => { cardEls.forEach(el => el.classList.remove('pending')); };
      this.dispatchEvent(new CustomEvent('requestDelete', { detail: { records: originalRecords, approve: wrappedCommit, reject }, bubbles: true }));
    } else {
      commit();
    }
  }

  getSelectedRecords() {
    return this.records.filter(record => record[selected]);
  }

  selectAllOnPage() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = Math.min(start + this.pageSize, this.records.length);
    for(let i = start; i < end; i++) this.records[i][selected] = true;
    this.requestUpdate();
    setTimeout(() => this.dispatchEvent(new CustomEvent('selectionChange', { bubbles: true })), 0);
  }

  deselectAllOnPage() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = Math.min(start + this.pageSize, this.records.length);
    for(let i = start; i < end; i++) this.records[i][selected] = false;
    this.requestUpdate();
    setTimeout(() => this.dispatchEvent(new CustomEvent('selectionChange', { bubbles: true })), 0);
  }

  allOnPageSelected() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = Math.min(start + this.pageSize, this.records.length);
    for(let i = start; i < end; i++) {
      if(!this.records[i][selected]) return false;
    }
    return true;
  }

  hideRecord(record) {
    let originalRecord = this.records.find(r => r === record);
    if(!originalRecord && record[index] !== undefined) originalRecord = this.records[record[index]];
    if(originalRecord) {
      originalRecord[hidden] = true;
      this.requestUpdate();
      this.dispatchEvent(new CustomEvent('recordHidden', { bubbles: true }));
    }
  }

  showRecord(record) {
    let originalRecord = this.records.find(r => r === record);
    if(!originalRecord && record[index] !== undefined) originalRecord = this.records[record[index]];
    if(originalRecord) {
      originalRecord[hidden] = false;
      this.requestUpdate();
      this.dispatchEvent(new CustomEvent('recordShown', { bubbles: true }));
    }
  }

  showAllRecords() {
    this.records.forEach(record => { record[hidden] = false; });
    this.requestUpdate();
    this.dispatchEvent(new CustomEvent('recordShown', { bubbles: true }));
    this.dispatchEvent(new CustomEvent('allRecordsShown', { bubbles: true }));
  }

  getDisplayedRecords() {
    return this.records.filter(record => !record[hidden]);
  }

  getHiddenRecords() {
    return this.records.filter(record => record[hidden]);
  }

  /* Rendering */

  render() {
    if(!this.records) {
      return html`
        <div id="wrapper">
          <div id="top"><slot name="top"></slot></div>
          <div id="grid-container"></div>
          <div id="bottom"><slot></slot></div>
        </div>
      `;
    }

    this.hasTopControls() ? this.setAttribute('top-controls', 'true') : this.removeAttribute('top-controls');
    this.hasBottomControls() ? this.setAttribute('bottom-controls', 'true') : this.removeAttribute('bottom-controls');

    return html`
      <div id="wrapper">
        <div id="top"><slot name="top"></slot></div>
        ${this.enableSelection ? html`
          <div id="select-all-bar">
            <input type="checkbox" id="select-all" @change=${this.handleSelectAllChange} />
            <span class="small tc-muted">Select all</span>
          </div>
        ` : ''}
        <div id="grid-container">
          <div id="grid" style="grid-template-columns: repeat(auto-fill, minmax(${this.minCardWidth}, 1fr))">
            ${this.renderCardsTemplate()}
          </div>
        </div>
        <div id="bottom"><slot></slot></div>
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
      margin-bottom: var(--spacer);
    }
    #grid {
      display: grid;
      gap: var(--spacer_h);
    }
    .tile {
      position: relative;
      --card_padding: 0;
      --card_margin: 0;
    }
    /* .tile prefix, not just .card-select: kempo-css's own input[type="checkbox"] rule is a
       type+attribute selector (specificity 0,1,1), which beats a single class (0,1,0) even with no
       !important on either side. Sizing only now — position comes from being the first flex item in
       .tile-controls-before, not from an absolute overlay. */
    .tile .card-select {
      width: 1.25rem;
      height: 1.25rem;
      flex: 0 0 auto;
    }
    .tile-controls {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--spacer_q);
      padding: var(--spacer_q);
    }
    /* getClonedControls() clones every registered before/after control into every tile regardless of
       record type — a control that hides itself for this particular record (e.g. a files-only action
       on a folder tile) still leaves an empty child behind. Without this rule the strip's own padding
       renders anyway, showing as dead space even though nothing inside it is visible. */
    .tile-controls:not(:has(> :not([hidden]))) {
      display: none;
    }
    .tile-controls-before {
      justify-content: flex-end;
    }
    .tile.pending {
      pointer-events: none;
      position: relative;
      overflow: hidden;
    }
    .tile.pending::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(128, 128, 128, 0.15), transparent);
      transform: translateX(-100%);
      animation: card-pending 1.2s ease-in-out infinite;
      z-index: 2;
    }
    @keyframes card-pending {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    #select-all-bar {
      display: flex;
      align-items: center;
      gap: var(--spacer_q);
      margin-bottom: var(--spacer_h);
    }
    #select-all-bar input {
      width: 1.25rem;
      height: 1.25rem;
    }
    .placeholder {
      text-align: center;
      color: var(--c_text__muted);
      font-style: italic;
      padding: var(--spacer);
    }
    #top, #bottom {
      display: flex;
      width: 100%;
    }
    /* flex, not block: slotted controls need to be real flex items — e.g. a plain flex-spacer div
       among them, to push a later control to the far edge — not just wrapping inline content inside
       a block box. */
    #top slot {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      width: 100%;
      border-bottom: 1px solid var(--c_border);
      margin-bottom: var(--spacer);
    }
    #bottom slot {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      width: 100%;
      border-top: 1px solid var(--c_border);
      margin-top: var(--spacer);
    }
    :host(:not([top-controls])) #top,
    :host(:not([bottom-controls])) #bottom {
      display: none;
    }
  `;
}

window.customElements.define('k-card-grid', CardGrid);
