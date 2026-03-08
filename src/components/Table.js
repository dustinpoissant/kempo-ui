import { html, css, unsafeStatic, literal } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';
import { toTitleCase } from '../utils/string.js';
import { boolExists } from '../utils/propConverters.js';

const selected = Symbol('selected');
const hidden = Symbol('hidden');
const index = Symbol('index');
const editing = Symbol('editing');

export default class Table extends ShadowComponent {
  static properties = {
    enablePages: { type: Boolean, reflect: true, converter: boolExists, attribute: 'enable-pages' },
    pageSize: { type: Number, reflect: true, attribute: 'page-size' },
    currentPage: { type: Number, reflect: true, attribute: 'current-page' },
    pageSizeOptions: { type: Array, attribute: 'page-size-options' },
    enableSelection: { type: Boolean, reflect: true, converter: boolExists, attribute: 'enable-selection' },
    enableSorting: { type: Boolean, reflect: true, converter: boolExists, attribute: 'enable-sorting' },
    caseSensitiveFilters: { type: Boolean, reflect: true, converter: boolExists, attribute: 'case-sensitive-filters' },
    fields: { type: Array },
    records: { type: Array },
    filters: { type: Array },
    sort: { type: Array },
    columnSizes: { type: Object },
    fetchPending: { type: Boolean }
  };

  constructor(options = {}) {
    super();
    
    // Set defaults for reactive properties (must be after super())
    if(this.pageSize === undefined) this.pageSize = 50;
    if(this.currentPage === undefined) this.currentPage = 1;
    if(this.pageSizeOptions === undefined) this.pageSizeOptions = [10, 25, 50, 100, 500];
    if(this.records === undefined) this.records = options.records || [];
    if(this.fields === undefined) this.fields = options.fields || [];
    if(this.filters === undefined) this.filters = options.filters || [];
    if(this.sort === undefined) this.sort = [];
    if(this.columnSizes === undefined) this.columnSizes = {};
    if(this.fetchPending === undefined) this.fetchPending = false;
  }

  /*
    Event Handlers
  */

  handleSelectAllChange = (e) => {
    if (e.target.checked) {
      this.selectAllOnPage();
    } else {
      this.deselectAllOnPage();
    }
  };

  handleFieldClick = (fieldName) => {
    const currentSort = this.sort.find(item => item.name === fieldName);
    const asc = currentSort ? !currentSort.asc : true;
    this.sortBy(fieldName, asc);
  };

  handleRecordSelectionChange = (record, e) => {
    record[selected] = !!e.target.checked;
    this.requestUpdate();
    this.dispatchEvent(new CustomEvent('selectionChange', { bubbles: true }));
  };

  /* Lifecycle Callbacks */

  firstUpdated() {
    this.setData({
      records: this.records,
      fields: this.fields,
      filters: this.filters
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
        selectAllCheckbox.checked = this.allOnPageSelected();
      }
    }
  }

  /*
    Rendering Functions
  */

  renderColgroupTemplate() {
    const cols = [];
    if(this.enableSelection) cols.push(html`<col style="width: 40px" />`);
    if(this.hasBeforeControls()) cols.push(html`<col style="width: ${this.columnSizes.beforeControls}px" />`);
    this.fields.forEach(({ size, hidden }) => {
      if(hidden) return;
      cols.push(size ? html`<col style="width: ${size}px" />` : html`<col />`);
    });
    if(this.hasAfterControls()) cols.push(html`<col style="width: ${this.columnSizes.afterControls}px" />`);
    return cols;
  }

  getColumnCount() {
    let count = 0;
    if(this.enableSelection) count++;
    if(this.hasBeforeControls()) count++;
    this.fields.forEach(({ hidden }) => { if(!hidden) count++; });
    if(this.hasAfterControls()) count++;
    return count;
  }

  renderFieldsTemplate() {
    const headers = [];
    if(this.enableSelection) {
      headers.push(html`
        <th class="controls field-select">
          <input type="checkbox" id="select-all" @change=${this.handleSelectAllChange} />
        </th>
      `);
    }
    if(this.hasBeforeControls()) {
      headers.push(html`<th class="controls field-before-controls"></th>`);
    }
    this.fields.forEach(({ name, label, hidden }) => {
      if(hidden) return;
      const sortItem = this.sort.find(item => item.name === name);
      const isCurrentSort = this.sort.length > 0 && this.sort[this.sort.length - 1].name === name;
      const sortClass = sortItem ? (sortItem.asc ? 'sort-asc' : 'sort-desc') : '';
      headers.push(html`
        <th
          class="${sortClass}"
          style="${this.enableSorting ? 'cursor: pointer;' : ''}"
          @click=${this.enableSorting ? () => this.handleFieldClick(name) : null}
        >
          ${label}
          ${isCurrentSort ? html`<k-icon name="arrow" direction="${sortItem.asc ? 'down' : 'up'}" class="icon-sort"></k-icon>` : ''}
        </th>
      `);
    });
    if(this.hasAfterControls()) {
      headers.push(html`<th class="controls field-after-controls"></th>`);
    }
    return headers;
  }

  renderRecordsTemplate() {
    let displayedRecords = this.getDisplayedRecords();
    let start = 0;
    let end = this.pageSize;

    if (this.enablePages) {
      start = (this.currentPage - 1) * this.pageSize;
      end = start + this.pageSize;
      displayedRecords = displayedRecords.slice(start, end);
    }
    
    let fetchStart = null;
    let fetchCount = 0;
    
    const recordTemplates = displayedRecords.map((record, idx) => {
      if (record !== null) {
        return this.renderRecordTemplate(record);
      } else {
        if (fetchStart === null) fetchStart = start + idx;
        fetchCount++;
        return html`<tr class="record fetching"><td class="cell" colspan="${this.getColumnCount()}">Loading...</td></tr>`;
      }
    });

    if (fetchStart !== null && !this.fetchPending) {
      setTimeout(() => {
        if (!this.fetchPending) {
          this.dispatchEvent(new CustomEvent('fetchRecords', {
            detail: { start: fetchStart, count: fetchCount },
            bubbles: true
          }));
        }
      }, 0);
    }

    return recordTemplates;
  }

  renderRecordTemplate(record) {
    const recordCells = [];

    if(this.enableSelection) {
      recordCells.push(html`
        <td class="cell selection controls">
          <input
            type="checkbox"
            .checked=${record[selected]}
            @change=${(e) => this.handleRecordSelectionChange(record, e)}
          />
        </td>
      `);
    }

    if(this.hasBeforeControls()) {
      recordCells.push(this.renderBeforeControlsTemplate());
    }

    this.fields.forEach(({ name, formatter, calculator, type, editor, hidden }) => {
      if(hidden) return;
      let value = record[name] || '';
      recordCells.push(html`
        <td class="cell" data-field=${name}>
          ${record[editing] ? this.renderEditingCell(record, name, value, calculator, editor, type) : this.renderDisplayCell(record, name, value, calculator, formatter)}
        </td>
      `);
    });

    if(this.hasAfterControls()) {
      recordCells.push(this.renderAfterControlsTemplate());
    }

    return html`
      <tr class="record ${record[editing] ? 'editing' : ''}" data-index=${record[index]}>
        ${recordCells}
      </tr>
    `;
  }

  renderEditingCell(record, name, value, calculator, editor, type) {
    if (calculator) {
      return html`<input disabled .value=${calculator(record, this)} />`;
    } else if (editor) {
      // Custom editors return DOM elements, need to handle differently
      const editorElement = editor(value);
      return html`${editorElement}`;
    } else {
      const editorType = type || typeof value;
      switch (editorType) {
        case 'number':
          return html`<input type="number" .value=${value} />`;
        case 'date':
          return html`<input type="date" .value=${value} />`;
        case 'boolean':
          return html`
            <select .value=${value}>
              <option value="true" ?selected=${value}>True</option>
              <option value="false" ?selected=${!value}>False</option>
            </select>
          `;
        default:
          return html`<input type="text" .value=${value} />`;
      }
    }
  }

  renderDisplayCell(record, name, value, calculator, formatter) {
    if (calculator) {
      return calculator(record, this);
    } else if (formatter) {
      return formatter(value);
    } else {
      return value;
    }
  }

  renderBeforeControlsTemplate() {
    const controls = [];
    this.querySelectorAll('[slot="before"]').forEach(control => {
      const tagName = control.tagName.toLowerCase();
      const newControl = document.createElement(tagName);
      Array.from(control.attributes).forEach(attr => {
        if(attr.name !== 'slot') newControl.setAttribute(attr.name, attr.value);
      });
      if(control.innerHTML) newControl.innerHTML = control.innerHTML;
      controls.push(newControl);
    });
    return html`
      <td class="cell controls controls-before">
        ${controls}
      </td>
    `;
  }

  renderAfterControlsTemplate() {
    const controls = [];
    this.querySelectorAll('[slot="after"]').forEach(control => {
      const tagName = control.tagName.toLowerCase();
      const newControl = document.createElement(tagName);
      Array.from(control.attributes).forEach(attr => {
        if(attr.name !== 'slot') newControl.setAttribute(attr.name, attr.value);
      });
      if(control.innerHTML) newControl.innerHTML = control.innerHTML;
      controls.push(newControl);
    });
    return html`
      <td class="cell controls controls-after">
        ${controls}
      </td>
    `;
  }

  /*
    Utility Functions
  */

  hasBeforeControls() {
    return !!this.querySelector('[slot="before"]');
  }

  hasAfterControls() {
    return !!this.querySelector('[slot="after"]');
  }

  hasTopControls() {
    return !!this.querySelector('[slot="top"]');
  }

  hasBottomControls() {
    return !!this.querySelector(':scope > :not([slot])');
  }

  /*
    Public Methods
  */

  editRecord(record) {
    record[editing] = true;
    const recordEl = this.shadowRoot.querySelector(`.record[data-index="${record[index]}"]`);
    if(recordEl){
      recordEl.classList.add('editing');
      recordEl.setAttribute('editing', 'true');
      recordEl.querySelectorAll('.cell[data-field]').forEach($cell => {
        const field = $cell.dataset.field;
        const fieldDef = this.fields.find(f => f.name === field);
        if(fieldDef){
          const value = record[field] || '';
          $cell.innerHTML = '';
          if(fieldDef.calculator){
            const input = document.createElement('input');
            input.disabled = true;
            input.value = fieldDef.calculator(record, this);
            $cell.appendChild(input);
          } else if(fieldDef.editor){
            $cell.appendChild(fieldDef.editor(value));
          } else {
            const type = fieldDef.type || typeof value;
            const editorGen = Table.editors[type] || Table.editors.string;
            $cell.appendChild(editorGen(value));
          }
        }
      });
    }
    this.dispatchEvent(new CustomEvent('editingChange', { 
      detail: { record, editing: true },
      bubbles: true 
    }));
  }
  
  saveEditedRecord(record) {
    const recordEl = this.shadowRoot.querySelector(`.record[data-index="${record[index]}"]`);
    if(recordEl){
      recordEl.querySelectorAll('.cell[data-field]').forEach($cell => {
        const field = $cell.dataset.field;
        const fieldDef = this.fields.find(f => f.name === field);
        if(fieldDef && !fieldDef.calculator){
          const $input = $cell.querySelector('input, select');
          if($input){
            record[field] = $input.value;
          }
        }
      });
      record[editing] = false;
      recordEl.classList.remove('editing');
      recordEl.removeAttribute('editing');
      recordEl.querySelectorAll('.cell[data-field]').forEach($cell => {
        const field = $cell.dataset.field;
        const fieldDef = this.fields.find(f => f.name === field);
        if(fieldDef){
          const value = record[field] || '';
          if(fieldDef.calculator){
            $cell.textContent = fieldDef.calculator(record, this);
          } else if(fieldDef.formatter){
            $cell.innerHTML = fieldDef.formatter(value);
          } else {
            $cell.textContent = value;
          }
        }
      });
    }
    this.dispatchEvent(new CustomEvent('editingChange', { 
      detail: { record, editing: false },
      bubbles: true 
    }));
  }

  cancelEditedRecord(record) {
    record[editing] = false;
    const recordEl = this.shadowRoot.querySelector(`.record[data-index="${record[index]}"]`);
    if(recordEl){
      recordEl.classList.remove('editing');
      recordEl.removeAttribute('editing');
      recordEl.querySelectorAll('.cell[data-field]').forEach($cell => {
        const field = $cell.dataset.field;
        const fieldDef = this.fields.find(f => f.name === field);
        if(fieldDef){
          const value = record[field] || '';
          if(fieldDef.calculator){
            $cell.textContent = fieldDef.calculator(record, this);
          } else if(fieldDef.formatter){
            $cell.innerHTML = fieldDef.formatter(value);
          } else {
            $cell.textContent = value;
          }
        }
      });
    }
    this.dispatchEvent(new CustomEvent('editingChange', { 
      detail: { record, editing: false },
      bubbles: true 
    }));
  }

  recordIsEditing(record) {
    return record[editing];
  }

  getCurrentPage() {
    return this.currentPage;
  }

  getTotalPages() {
    return Math.ceil(this.getDisplayedRecords().length / this.pageSize);
  }

  setPage(page) {
    if (page < 1 || page > this.getTotalPages()) return;
    this.currentPage = page;
    this.requestUpdate();
    this.dispatchEvent(new CustomEvent('pageChange', { bubbles: true }));
  }

  firstPage() {
    if (this.currentPage !== 1) {
      this.setPage(1);
    }
  }

  nextPage() {
    if (this.currentPage < this.getTotalPages()) {
      this.setPage(this.currentPage + 1);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.setPage(this.currentPage - 1);
    }
  }

  lastPage() {
    if (this.currentPage !== this.getTotalPages()) {
      this.setPage(this.getTotalPages());
    }
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

  getFieldLabel(field) {
    const fieldDef = this.fields.find(f => f.name === field);
    return fieldDef ? fieldDef.label : toTitleCase(field);
  }

  setPageSizeOptions(options) {
    this.pageSizeOptions = options;
    this.requestUpdate();
  }

  setData({ records = false, fields = false, pageSize = false, pageSizeOptions = false, currentPage = false, enableSelection } = {}) {
    let rerender = false;
    let pageCountBefore = this.getTotalPages();
    let pageBefore = this.currentPage;
    
    if (records) {
      this.records = records.map(r => ({ ...r }));
      this.records.forEach((record, idx) => {
        record[index] = idx;
        record[selected] = false;
        record[hidden] = false;
        record[editing] = false;
      });
      this.fields = fields || Table.extractFieldsFromRecords(this.records);
      rerender = true;
    }
    
    if (pageSize) {
      this.pageSize = pageSize;
      rerender = true;
    }
    
    if (pageSizeOptions) {
      this.pageSizeOptions = pageSizeOptions;
    }
    
    if (currentPage) {
      this.currentPage = currentPage;
      rerender = true;
    }
    
    if (enableSelection !== undefined) {
      this.enableSelection = enableSelection;
      rerender = true;
    }
    
    if (rerender) {
      this.requestUpdate();
    }
    
    const newPageCount = this.getTotalPages();
    if (newPageCount !== pageCountBefore) {
      this.dispatchEvent(new CustomEvent('pageCountChanged', { 
        detail: { totalPages: this.getTotalPages() },
        bubbles: true 
      }));
    }
    
    if (pageBefore > newPageCount) {
      this.setPage(newPageCount); 
    }
  }

  setRecords(records, fields) {
    let pageCountBefore = this.getTotalPages();
    let pageBefore = this.currentPage;

    this.records = records.map(r => ({ ...r }));
    this.records.forEach((record, idx) => {
      record[index] = idx;
      record[selected] = false;
      record[hidden] = false;
      record[editing] = false;
    });
    this.fields = fields || Table.extractFieldsFromRecords(this.records);
    this.requestUpdate();
    this.dispatchEvent(new CustomEvent('recordsSet', { 
      detail: { records },
      bubbles: true 
    }));
    
    const newPageCount = this.getTotalPages();
    if (newPageCount !== pageCountBefore) {
      this.dispatchEvent(new CustomEvent('pageCountChanged', { 
        detail: { totalPages: this.getTotalPages() },
        bubbles: true 
      }));
    }
    
    if (pageBefore > newPageCount) {
      this.setPage(newPageCount); 
    }
  }

  setupFetchRecords(totalRecords, callback) {
    const previousLength = this.records.length;
    const pageCountBefore = this.getTotalPages();
    
    if (previousLength < totalRecords) {
      this.records.length = totalRecords;
      this.records.fill(null, previousLength);
      
      // Trigger re-render and page count changed event
      this.requestUpdate();
      
      const newPageCount = this.getTotalPages();
      if (newPageCount !== pageCountBefore) {
        setTimeout(() => {
          this.dispatchEvent(new CustomEvent('pageCountChanged', { 
            detail: { totalPages: newPageCount },
            bubbles: true 
          }));
        }, 0);
      }
    }

    this.addEventListener('fetchRecords', async (event) => {
      if (this.fetchPending) return;
      this.fetchPending = true;
      const { start, count } = event.detail;
      const records = await callback(start, count);
      
      // Initialize symbol properties on fetched records
      records.forEach((record, idx) => {
        record[index] = start + idx;
        if(record[selected] === undefined) record[selected] = false;
        if(record[hidden] === undefined) record[hidden] = false;
        if(record[editing] === undefined) record[editing] = false;
      });
      
      this.records.splice(start, records.length, ...records);
      this.fetchPending = false;
      this.requestUpdate();
    });
  }

  addRecord(record) {
    record[selected] = false;
    record[hidden] = false;
    record[index] = this.records.length;
    this.records.push(record);
    this.requestUpdate();
    this.dispatchEvent(new CustomEvent('recordAdded', { 
      detail: { record },
      bubbles: true 
    }));
  }

  updateRecord(record, newData) {
    let updated = false;
    let originalRecord = this.records.find(r => r === record);
    if (!originalRecord && record[index] !== undefined) {
      originalRecord = this.records[record[index]];
    }
    Object.keys(newData).forEach(key => {
      if (originalRecord.hasOwnProperty(key)) {
        originalRecord[key] = newData[key];
        updated = true;
      }
    });
    if (updated) {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      if (!this.enablePages || (originalRecord[index] >= start && originalRecord[index] < end)) {
        this.requestUpdate();
      }
    }
  }

  deleteRecord(record) {
    let originalRecord = this.records.find(r => r === record);
    let totalPagesBefore = this.getTotalPages();
    
    if (!originalRecord && record[index] !== undefined) {
      originalRecord = this.records[record[index]];
    }
    
    if (originalRecord) {
      const recordIndex = this.records.indexOf(originalRecord);
      this.records.splice(recordIndex, 1);
      this.records.forEach((rec, idx) => {
        rec[index] = idx;
      });
      this.requestUpdate();
      this.dispatchEvent(new CustomEvent('selectionChange', { bubbles: true }));
      this.dispatchEvent(new CustomEvent('recordDeleted', { 
        detail: { index: recordIndex },
        bubbles: true 
      }));
      
      const totalPages = this.getTotalPages();
      if (this.currentPage > totalPages) {
        this.setPage(totalPages);
      }
      if (totalPages !== totalPagesBefore) {
        this.dispatchEvent(new CustomEvent('pageCountChanged', { 
          detail: { totalPages },
          bubbles: true 
        }));
      }
    }
  }

  deleteSelected() {
    let totalPagesBefore = this.getTotalPages();
    const selectedRecords = this.getSelectedRecords();
    
    selectedRecords.forEach(record => {
      let originalRecord = this.records.find(r => r === record);
      if (!originalRecord && record[index] !== undefined) {
        originalRecord = this.records[record[index]];
      }
      if (originalRecord) {
        const recordIndex = this.records.indexOf(originalRecord);
        this.records.splice(recordIndex, 1);
      }
    });
    
    this.records.forEach((rec, idx) => {
      rec[index] = idx;
    });
    this.requestUpdate();
    
    const totalPages = this.getTotalPages();
    if (this.currentPage > totalPages) {
      this.setPage(totalPages);
    }
    if (totalPages !== totalPagesBefore) {
      this.dispatchEvent(new CustomEvent('pageCountChanged', { 
        detail: { totalPages },
        bubbles: true 
      }));
    }
    this.dispatchEvent(new CustomEvent('selectionChange', { bubbles: true }));
  }

  getSelectedRecords() {
    return this.records.filter(record => record[selected]);
  }

  selectAllOnPage() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = Math.min(start + this.pageSize, this.records.length);
    for (let i = start; i < end; i++) {
      this.records[i][selected] = true;
    }
    this.requestUpdate();
    setTimeout(() => {
      this.dispatchEvent(new CustomEvent('selectionChange', { bubbles: true }));
    }, 0);
  }

  deselectAllOnPage() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = Math.min(start + this.pageSize, this.records.length);
    for (let i = start; i < end; i++) {
      this.records[i][selected] = false;
    }
    this.requestUpdate();
    setTimeout(() => {
      this.dispatchEvent(new CustomEvent('selectionChange', { bubbles: true }));
    }, 0);
  }

  allOnPageSelected() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = Math.min(start + this.pageSize, this.records.length);
    for (let i = start; i < end; i++) {
      if (!this.records[i][selected]) {
        return false;
      }
    }
    return true;
  }

  sortBy(field, asc = true) {
    this.sort = this.sort.filter(item => item.name !== field);
    this.sort.push({ name: field, asc });
    this.requestUpdate();
  }

  hideRecord(record) {
    let originalRecord = this.records.find(r => r === record);
    if (!originalRecord && record[index] !== undefined) {
      originalRecord = this.records[record[index]];
    }
    if (originalRecord) {
      originalRecord[hidden] = true;
      this.requestUpdate();
      this.dispatchEvent(new CustomEvent('recordHidden', { bubbles: true }));
    }
  }

  showRecord(record) {
    let originalRecord = this.records.find(r => r === record);
    if (!originalRecord && record[index] !== undefined) {
      originalRecord = this.records[record[index]];
    }
    if (originalRecord) {
      originalRecord[hidden] = false;
      this.requestUpdate();
      this.dispatchEvent(new CustomEvent('recordShown', { bubbles: true }));
    }
  }

  showAllRecords() {
    this.records.forEach(record => {
      record[hidden] = false; 
    });
    if (this.filters.length) {
      this.filters = [];
      this.dispatchEvent(new CustomEvent('filterRemoved', { bubbles: true }));
      this.dispatchEvent(new CustomEvent('filterChange', { bubbles: true }));
    }
    this.requestUpdate();
    this.dispatchEvent(new CustomEvent('recordShown', { bubbles: true }));
    this.dispatchEvent(new CustomEvent('allRecordsShown', { bubbles: true }));
  }

  addFilter(field, condition, value) {
    this.filters.push({ field, condition, value });
    this.dispatchEvent(new CustomEvent('filterAdded', { bubbles: true }));
    this.dispatchEvent(new CustomEvent('filterChange', { bubbles: true }));
    this.requestUpdate();
  }
  
  removeFilter(field, condition, value, rerender = true) {
    const filterIndex = this.filters.findIndex(f => f.field === field && f.condition === condition && f.value === value);
    if (filterIndex !== -1) {
      this.records.forEach(record => {
        if (!this.testFilter(record, field, condition, value)) {
          record[hidden] = false;
        }
      });
      this.filters.splice(filterIndex, 1);
      this.dispatchEvent(new CustomEvent('filterRemoved', { bubbles: true }));
      this.dispatchEvent(new CustomEvent('filterChange', { bubbles: true }));
      if (rerender) this.requestUpdate();
    }
  }

  testFilter(record, field, condition, value) {
    let recordValue = record[field];
    let compareValue = value;

    if(!this.caseSensitiveFilters && typeof recordValue === 'string' && typeof value === 'string'){
      recordValue = recordValue.toLowerCase();
      compareValue = value.toLowerCase();
    }

    switch(condition){
      case 'equals':
        return recordValue === compareValue;
      case 'not-equals':
        return recordValue !== compareValue;
      case 'contains':
        return recordValue.includes(compareValue);
      case 'not-contains':
        return !recordValue.includes(compareValue);
      case 'greater-than':
        return recordValue > compareValue;
      case 'less-than':
        return recordValue < compareValue;
      case 'greater-than-or-equal':
        return recordValue >= compareValue;
      case 'less-than-or-equal':
        return recordValue <= compareValue;
      default:
        return true;
    }
  }

  removeAllFilters() {
    if (this.filters.length) {
      // Copy array to avoid mutation during iteration
      [...this.filters].forEach(({ field, condition, value }) => {
        this.removeFilter(field, condition, value, false);
      });
      this.requestUpdate();
    }
  }

  search(term) {
    const t = term.trim().toLowerCase();
    let changed = false;
    this.records.forEach(record => {
      if (record[hidden]) return;
      let match = false;
      this.fields.forEach(({ name }) => {
        const val = record[name]?.toString().toLowerCase() || '';
        if (val.includes(t)) {
          match = true;
        }
      });
      if (record[hidden] !== !match) {
        record[hidden] = !match;
        changed = true;
      }
    });
    if (changed) {
      this.dispatchEvent(new CustomEvent('recordHidden', { bubbles: true }));
      this.requestUpdate();
    }
    this.dispatchEvent(new CustomEvent('search', { 
      detail: { term },
      bubbles: true 
    }));
  }

  getDisplayedRecords() {
    this.filters.forEach(({ field, condition, value }) => {
      this.records.forEach(record => {
        if(record === null) return;
        if (!this.testFilter(record, field, condition, value)) {
          record[hidden] = true;
        }
      });
    });

    let displayedRecords = this.records.filter(record => record === null || !record[hidden]);

    this.sort.forEach(({ name, asc }) => {
      displayedRecords.sort((a, b) => {
        if(a === null || b === null) return 0;
        if (a[name] < b[name]) return asc ? -1 : 1;
        if (a[name] > b[name]) return asc ? 1 : -1;
        return 0;
      });
    });

    return displayedRecords;
  }

  getHiddenRecords() {
    return this.records.filter(record => record[hidden]);
  }

  calculateColumnSizes() {
    const beforeEls = Array.from(this.querySelectorAll('[slot="before"]'));
    const afterEls = Array.from(this.querySelectorAll('[slot="after"]'));
    const newSizes = {
      beforeControls: beforeEls.reduce((total, el) => total + (el.maxWidth || 40), 0),
      afterControls: afterEls.reduce((total, el) => total + (el.maxWidth || 40), 0)
    };
    const hasUndefinedMaxWidth = [...beforeEls, ...afterEls].some(el => el.maxWidth === undefined);
    if(JSON.stringify(this.columnSizes) !== JSON.stringify(newSizes)) {
      this.columnSizes = newSizes;
    }
    if(hasUndefinedMaxWidth) {
      setTimeout(() => this.calculateColumnSizes(), 0);
    }
    return this.columnSizes;
  }

  setFieldHiddenState(fieldName, hidden) {
    const field = this.fields.find(f => f.name === fieldName);
    if (field) {
      field.hidden = hidden;
      this.calculateColumnSizes();
      this.requestUpdate();
      this.dispatchEvent(new CustomEvent('fieldVisibilityChanged', { 
        detail: { field },
        bubbles: true 
      }));
      this.dispatchEvent(new CustomEvent(hidden ? 'fieldHidden' : 'fieldShown', { 
        detail: { field },
        bubbles: true 
      }));
    }
  }

  hideField(fieldName) {
    this.setFieldHiddenState(fieldName, true);
  }

  showField(fieldName) {
    this.setFieldHiddenState(fieldName, false);
  }

  reorderFields(newOrder) {
    const newFields = [];
    newOrder.forEach(fieldName => {
      const field = this.fields.find(f => f.name === fieldName);
      if (field) {
        newFields.push(field);
      }
    });
    this.fields = newFields;
    this.requestUpdate();
  }

  /* Rendering */

  render() {
    if(!this.records || !this.fields) {
      return html`
        <div id="wrapper">
          <div id="top"><slot name="top"></slot></div>
          <div id="table-container">
            <table><thead><tr></tr></thead><tbody></tbody></table>
          </div>
          <div id="bottom"><slot></slot></div>
        </div>
        <div style="display: none">
          <slot name="before"></slot>
          <slot name="after"></slot>
        </div>
      `;
    }

    this.calculateColumnSizes();
    this.hasTopControls() ? this.setAttribute('top-controls', 'true') : this.removeAttribute('top-controls');
    this.hasBottomControls() ? this.setAttribute('bottom-controls', 'true') : this.removeAttribute('bottom-controls');

    return html`
      <div id="wrapper">
        <div id="top"><slot name="top"></slot></div>
        <div id="table-container">
          <table>
            <colgroup>
              ${this.renderColgroupTemplate()}
            </colgroup>
            <thead>
              <tr>
                ${this.renderFieldsTemplate()}
              </tr>
            </thead>
            <tbody>
              ${this.renderRecordsTemplate()}
            </tbody>
          </table>
        </div>
        <div id="bottom"><slot></slot></div>
      </div>
      <div style="display: none">
        <slot name="before"></slot>
        <slot name="after"></slot>
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
      margin-bottom: var(--spacer);
    }
    #wrapper {
      border: 1px solid var(--c_border);
      border-radius: var(--radius);
      overflow: hidden;
    }
    #table-container {
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    thead tr {
      background-color: var(--c_bg__alt);
    }
    th, td {
      padding: calc(0.5 * var(--spacer)) var(--spacer);
      vertical-align: middle;
    }
    th:not(:last-child),
    td:not(:last-child) {
      border-right: 1px solid var(--c_border);
    }
    th:first-child,
    td:first-child {
      border-left: none;
    }
    th:last-child,
    td:last-child {
      border-right: none;
    }
    thead tr th {
      border-top: none;
      border-bottom: 1px solid var(--c_border);
    }
    tbody tr:not(:last-child) td {
      border-bottom: 1px solid var(--c_border);
    }
    tbody tr:last-child td {
      border-bottom: none;
    }
    th.controls,
    td.controls {
      padding: 0;
    }
    .field-select,
    .selection {
      width: 40px;
      text-align: center;
    }
    .field-select input,
    .selection input {
      width: 1.25rem;
      height: 1.25rem;
    }
    .icon-sort {
      float: right;
      opacity: 0.5;
    }
    #top, #bottom {
      display: flex;
      width: 100%;
    }
    #top slot {
      display: block;
      width: 100%;
      border-bottom: 1px solid var(--c_border);
    }
    #bottom slot {
      display: block;
      width: 100%;
      border-top: 1px solid var(--c_border);
    }
    :host(:not([top-controls])) #top,
    :host(:not([bottom-controls])) #bottom {
      display: none;
    }
  `;

  /*
    Static Methods
  */

  static extractFieldsFromRecords(records, recordLimit = 100) {
    const names = new Set();
    records.slice(0, recordLimit).forEach(record => {
      Object.keys(record).forEach(name => names.add(name));
    });
    return [...names].map(name => ({ name, label: toTitleCase(name) }));
  }

  static format(value) {
    const f = Array.isArray(value) ? Table.formatters.array : Table.formatters[typeof value];
    return f(value);
  }

  static formatters = {
    string: v => v,
    number: v => `${v}`,
    date: v => v.toLocaleDateString(),
    boolean: v => v ? 'True' : 'False',
    array: v => v.map(i => Table.format(i)).join(', '),
    'undefined': v => '',
    'null': v => '<code>null</code>'
  };

  static editors = {
    string: (value) => {
      const $i = document.createElement('input');
      $i.value = value;
      return $i;
    },
    number: (value) => {
      const $i = document.createElement('input');
      $i.type = 'number';
      $i.value = value;
      return $i;
    },
    date: (value) => {
      const $i = document.createElement('input');
      $i.type = 'date';
      $i.value = value;
      return $i;
    },
    boolean: (value) => {
      const $i = document.createElement('select');
      $i.innerHTML = `
        <option value="true" ${value ? 'selected' : ''}>True</option>
        <option value="false" ${!value ? 'selected' : ''}>False</option>
      `;
      $i.value = value;
      return $i;
    },
    calculated: (value) => {
      const $i = document.createElement('input');
      $i.disabled = true;
      $i.value = value;
      return $i;
    }
  };
}

// Register custom element
window.customElements.define('k-table', Table);
