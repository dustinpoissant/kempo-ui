import WidgetSettings from './WidgetSettings.js';
import { html } from '../../lit-all.min.js';
import { defaultNode } from '../../utils/pageTree.js';
import { COLUMN_WIDTH_OPTIONS, columnWidth } from '../../utils/pageWidgetDefaults.js';
import '../Accordion.js';
import '../Icon.js';

/*
  The settings of Columns: each column listed in an accordion with its width at each screen size (desktop, tablet and
  mobile), icon buttons to move it or remove it, and an Add column button. A removed column's widgets move into the
  column before it, so nothing is lost.
*/
const WIDTHS = [
  { name: 'desktop', label: 'Desktop width', hint: 'Screens 1024px and wider.' },
  { name: 'tablet', label: 'Tablet width', hint: 'Screens from 769px to 1023px.' },
  { name: 'mobile', label: 'Mobile width', hint: 'Screens 768px and narrower. A full width column stacks on its own.' }
];

export default class ColumnsSettings extends WidgetSettings {
  /*
    Protected Members
  */
  get columns() {
    return this.node.slots?.default || [];
  }

  /*
    Public Methods
  */
  addColumn() {
    this.edit(node => {
      node.slots.default.push(defaultNode(this.registry, 'column'));
      return true;
    });
  }

  moveColumn(index, step) {
    this.edit(node => {
      const columns = node.slots.default;
      const target = index + step;
      if(target < 0 || target >= columns.length) return 'That column cannot move there';
      [columns[index], columns[target]] = [columns[target], columns[index]];
      return true;
    });
  }

  removeColumn(index) {
    this.edit(node => {
      const columns = node.slots.default;
      if(columns.length < 2) return 'Columns need at least one column';
      const [removed] = columns.splice(index, 1);
      const keeper = columns[Math.max(0, index - 1)];
      keeper.slots.default.push(...(removed.slots.default || []));
      return true;
    });
  }

  /* '' is kept too: it means fill the space at that screen size, which differs from a width never set. */
  setWidth(index, name, value) {
    this.edit(node => {
      node.slots.default[index].attrs[name] = value;
      return true;
    });
  }

  /*
    Rendering
  */
  renderColumn(column, index) {
    const id = `pb-column-${index}`;
    const attrs = column.attrs || {};
    return html`
      <k-accordion-header for-panel="${id}">Column ${index + 1}</k-accordion-header>
      <k-accordion-panel name="${id}">
        <div class="p">
          ${WIDTHS.map(({ name, label, hint }) => html`
            <div class="mb">
              <label class="d-b mbq" for="${id}-${name}">${label}<small class="d-b tc-muted">${hint}</small></label>
              <select id="${id}-${name}" class="full" @change="${event => this.setWidth(index, name, event.target.value)}">
                ${COLUMN_WIDTH_OPTIONS.map(option => html`<option value="${option.value}" ?selected="${String(option.value) === String(columnWidth(attrs, name))}">${option.label}</option>`)}
              </select>
            </div>`)}
          <div class="btn-grp">
            <button title="Move left" aria-label="Move left" ?disabled="${index === 0}" @click="${() => this.moveColumn(index, -1)}"><k-icon name="arrow" direction="left"></k-icon></button>
            <button title="Move right" aria-label="Move right" ?disabled="${index === this.columns.length - 1}" @click="${() => this.moveColumn(index, 1)}"><k-icon name="arrow" direction="right"></k-icon></button>
            <button class="danger" title="Remove column" aria-label="Remove column" ?disabled="${this.columns.length < 2}" @click="${() => this.removeColumn(index)}"><k-icon name="delete"></k-icon></button>
          </div>
        </div>
      </k-accordion-panel>
    `;
  }

  render() {
    if(!this.node) return '';
    return html`
      <div class="mb">
        <button class="primary full" @click="${this.addColumn}">Add column</button>
      </div>
      <k-accordion>
        ${this.columns.map((column, index) => this.renderColumn(column, index))}
      </k-accordion>
    `;
  }
}

customElements.define('k-page-builder-columns-settings', ColumnsSettings);
