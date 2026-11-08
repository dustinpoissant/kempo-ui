import WidgetSettings from './WidgetSettings.js';
import { html } from '../../lit-all.min.js';

/*
  The settings of a Table: its own settings (the heading row), the rows and columns (added or removed), how many columns
  each cell spans, and each column's width (automatic, a percentage or pixels). The text of the cells is not here: it is
  typed on the page, in the cells.
*/
const WIDTH = /^(\d+(?:\.\d+)?)(%|px)$/;

const EMPTY = [['', ''], ['', '']];

export default class TableSettings extends WidgetSettings {
  /*
    Protected Members
  */
  get rows() {
    const rows = this.node.attrs?.rows;
    return Array.isArray(rows) && rows.length ? rows : EMPTY;
  }

  get columns() {
    return Math.max(1, ...this.rows.map(row => row.length));
  }

  get spans() {
    const spans = this.node.attrs?.spans;
    return spans && typeof spans === 'object' ? spans : {};
  }

  /*
    Public Methods
  */
  /*
    Changes the rows (a copy) with a function, then stores them. Spans of cells that are no longer in the grid are dropped,
    so they do not come back when a row or column is added again.
  */
  editRows(change) {
    this.edit(node => {
      const rows = change(Array.isArray(node.attrs.rows) && node.attrs.rows.length ? structuredClone(node.attrs.rows) : structuredClone(EMPTY));
      const columns = Math.max(1, ...rows.map(row => row.length));
      node.attrs.rows = rows;
      if(node.attrs.spans) node.attrs.spans = Object.fromEntries(Object.entries(node.attrs.spans).filter(([key]) => {
        const [row, column] = key.split('.').map(Number);
        return row < rows.length && column < columns;
      }));
      return true;
    });
  }

  addRow() {
    this.editRows(rows => [...rows, Array(this.columns).fill('')]);
  }

  removeRow() {
    this.editRows(rows => (rows.length > 1 ? rows.slice(0, -1) : rows));
  }

  addColumn() {
    this.editRows(rows => rows.map(row => [...row, '']));
  }

  removeColumn() {
    this.editRows(rows => (this.columns > 1 ? rows.map(row => row.slice(0, -1)) : rows));
  }

  /* How many columns the cell at a row and column covers; 1 is no span, and is not stored. */
  setSpan(row, column, value) {
    this.edit(node => {
      const spans = { ...(node.attrs.spans || {}) };
      const span = Math.min(this.columns - column, Math.max(1, Math.floor(Number(value)) || 1));
      if(span > 1) spans[`${row}.${column}`] = span;
      else delete spans[`${row}.${column}`];
      node.attrs.spans = spans;
      return true;
    }, true);
  }

  /* A column's width: unit '' (automatic), '%' or 'px', with the amount when it has a unit. */
  setWidth(index, unit, amount) {
    this.edit(node => {
      const widths = Array.isArray(node.attrs.widths) ? [...node.attrs.widths] : [];
      while(widths.length < this.columns) widths.push('');
      const value = Number(amount);
      widths[index] = unit && Number.isFinite(value) && amount !== '' ? `${Math.max(0, value)}${unit}` : '';
      node.attrs.widths = widths;
      return true;
    }, true);
  }

  /*
    Rendering
  */
  renderWidths() {
    const widths = Array.isArray(this.node.attrs?.widths) ? this.node.attrs.widths : [];
    return html`
      <div class="mb">
        <label class="d-b mbq">Column widths<small class="d-b tc-muted">Automatic fits a column to its text. A percentage is a share of the table, and pixels are a fixed width.</small></label>
        ${Array.from({ length: this.columns }, (_, index) => {
          const match = WIDTH.exec(widths[index] || '');
          const unit = match ? match[2] : '';
          return html`
            <div class="d-f mbq">
              <span class="mrq">Column ${index + 1}</span>
              <select aria-label="Width of column ${index + 1}" class="mrq" @change="${event => this.setWidth(index, event.target.value, match ? match[1] : '25')}">
                <option value="" ?selected="${!unit}">Automatic</option>
                <option value="%" ?selected="${unit === '%'}">Percentage</option>
                <option value="px" ?selected="${unit === 'px'}">Pixels</option>
              </select>
              <input type="number" min="0" class="flex" aria-label="Width of column ${index + 1} in ${unit === 'px' ? 'pixels' : 'percent'}" ?disabled="${!unit}" .value="${match ? match[1] : ''}" @input="${event => this.setWidth(index, unit, event.target.value)}">
            </div>`;
        })}
      </div>
    `;
  }

  renderStructure() {
    return html`
      <div class="mb">
        <label class="d-b mbq">Rows and columns<small class="d-b tc-muted">${this.rows.length} rows, ${this.columns} columns. Type in the cells on the page.</small></label>
        <div class="btn-grp mt">
          <button @click="${this.addRow}">Add row</button>
          <button ?disabled="${this.rows.length < 2}" @click="${this.removeRow}">Remove row</button>
        </div>
        <div class="btn-grp mt">
          <button @click="${this.addColumn}">Add column</button>
          <button ?disabled="${this.columns < 2}" @click="${this.removeColumn}">Remove column</button>
        </div>
      </div>
    `;
  }

  /* One small box for each cell that shows, as wide as the columns it covers, with the number of columns it spans. */
  renderSpans() {
    const spans = this.spans;
    return html`
      <div class="mb">
        <label class="d-b mbq">Columns a cell spans<small class="d-b tc-muted">A cell that spans more than one column covers the cells after it. Their text is kept, and comes back when the span is set back to 1.</small></label>
        ${this.rows.map((row, rowIndex) => {
          const cells = [];
          for(let column = 0; column < this.columns;){
            const span = Math.min(this.columns - column, Math.max(1, Math.floor(Number(spans[`${rowIndex}.${column}`])) || 1));
            const at = column;
            cells.push(html`
              <input type="number" min="1" max="${this.columns - at}" style="flex: ${span} 1 0; min-width: 0" class="mrq" aria-label="Row ${rowIndex + 1}, column ${at + 1}: columns spanned" .value="${String(span)}" @input="${event => this.setSpan(rowIndex, at, event.target.value)}">`);
            column += span;
          }
          return html`<div class="d-f mbq">${cells}</div>`;
        })}
      </div>
    `;
  }

  render() {
    if(!this.node) return '';
    return html`
      ${this.renderFields()}
      ${this.renderStructure()}
      ${this.renderSpans()}
      ${this.renderWidths()}
    `;
  }
}

customElements.define('k-page-builder-table-settings', TableSettings);
