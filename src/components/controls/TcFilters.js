import ButtonControl from './ButtonControl.js';
import { html, render } from '../../lit-all.min.js';
import '../Icon.js';
import Dialog from '../Dialog.js';

const conditionOptions = {
  'equals': 'equals',
  'not-equals': 'does not equal',
  'contains': 'contains',
  'not-contains': 'does not contain',
  'greater-than': 'is greater than',
  'greater-than-or-equal': 'is greater than or equal to',
  'less-than': 'is less than',
  'less-than-or-equal': 'is less than or equal to'
};

export default class TcFilters extends ButtonControl {
  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Filters';
  }

  handleFilter() { this.handleAction(); }

  handleAction() { this.openDialog(); }

  openDialog = () => {
    const host = this.host;
    if(!host) return;

    const dialogContent = document.createElement('div');
    render(html`
      <div class="p">
        ${host.filters.length === 0 ? html`<p>No Current Filters.</p>` : html`
          <h5>Current Filters</h5>
          <ul id="currentFilters">
            ${host.filters.map(({field, condition, value}) => html`
              <li data-field="${field}" data-condition="${condition}" data-value="${value}">
                ${host.getFieldLabel(field)} ${conditionOptions[condition]} "${value}"
                <button class="remove-filter no-btn pq" @click=${() => {
                  host.removeFilter(field, condition, value);
                  dialog.close();
                  this.openDialog();
                }}>
                  <k-icon name="close"></k-icon>
                </button>
              </li>
            `)}
          </ul>
        `}
        <hr />
        <h5>Add A Filter</h5>
        <form id="addFilter" @submit=${(e) => {
          e.preventDefault();
          const form = e.target;
          host.addFilter(form.filterField.value, form.filterCondition.value, form.filterValue.value);
          dialog.close();
          this.openDialog();
        }}>
          <select id="filterField" class="mb">
            ${host.fields.map(({name, label}) => html`<option value="${name}">${label}</option>`)}
          </select>
          <select id="filterCondition" class="mb">
            ${Object.entries(conditionOptions).map(([key, val]) => html`
              <option value="${key}" ?selected="${key === 'contains'}">${val}</option>
            `)}
          </select>
          <input id="filterValue" type="text" class="mb" />
          <button type="submit" class="btn primary mb mr">Add Filter</button>
          ${host.filters.length === 0 ? '' : html`
            <button type="button" class="btn danger mb mr" @click=${() => {
              host.removeAllFilters();
              dialog.close();
            }}>Clear All Filters</button>
          `}
        </form>
      </div>
    `, dialogContent);

    const dialog = Dialog.create(dialogContent, { width: '600px', title: 'Filters' });
  };

  render() { return html`<slot><k-icon name="filter"></k-icon></slot>`; }
}

customElements.define('kc-tc-filters', TcFilters);
