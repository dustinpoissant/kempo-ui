import ButtonControl from './Button.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';
import Dialog from '../Dialog.js';

export default class InsertTable extends ButtonControl {
  static requires = ['insertTable'];
  static hostMode = 'visual';

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Insert Table';
  }

  handleAction() {
    const host = this.host;
    if(!host) return;
    const existing = host.getTableAtSelection?.();
    const isEditing = !!existing;
    const defRows = existing?.rows ?? 3;
    const defCols = existing?.cols ?? 3;
    const defHeaders = existing?.hasHeaders ?? true;
    const cellData = existing?.cellData ?? null;

    const rowsInput = document.createElement('input');
    rowsInput.type = 'number'; rowsInput.min = '1'; rowsInput.max = '20'; rowsInput.value = String(defRows);
    rowsInput.style.cssText = 'padding: 0.5rem; border: 1px solid var(--c_border); border-radius: var(--radius); font: inherit;';

    const colsInput = document.createElement('input');
    colsInput.type = 'number'; colsInput.min = '1'; colsInput.max = '10'; colsInput.value = String(defCols);
    colsInput.style.cssText = 'padding: 0.5rem; border: 1px solid var(--c_border); border-radius: var(--radius); font: inherit;';

    const headersCheckbox = document.createElement('input');
    headersCheckbox.type = 'checkbox'; headersCheckbox.checked = defHeaders;
    headersCheckbox.id = 'kc-table-headers';

    const content = document.createElement('div');
    content.className = 'p';
    content.style.cssText = 'display: flex; flex-direction: column; gap: 1rem;';
    content.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 0.5rem;"><label style="font-weight: bold;">Rows</label></div>
      <div style="display: flex; flex-direction: column; gap: 0.5rem;"><label style="font-weight: bold;">Columns</label></div>
      <div style="display: flex; align-items: center; gap: 0.5rem;"><label for="kc-table-headers" style="font-weight: bold;">Include Headers</label></div>
    `;
    content.children[0].appendChild(rowsInput);
    content.children[1].appendChild(colsInput);
    content.children[2].insertBefore(headersCheckbox, content.children[2].firstChild);

    Dialog.create(content, {
      title: isEditing ? 'Edit Table' : 'Insert Table',
      cancelText: 'Cancel',
      confirmText: isEditing ? 'Update Table' : 'Insert Table',
      confirmClasses: 'success',
      confirmAction: () => {
        const rows = parseInt(rowsInput.value) || 3;
        const cols = parseInt(colsInput.value) || 3;
        const includeHeaders = headersCheckbox.checked;
        if(isEditing) host.removeTableByKey?.(existing.key);
        host.insertTable(rows, cols, includeHeaders, cellData);
      }
    });
  }

  render() { return html`<slot><k-icon name="table"></k-icon></slot>`; }
}

customElements.define('kc-insert-table', InsertTable);
