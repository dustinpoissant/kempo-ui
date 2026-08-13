import Control from './Control.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';
import '../Dropdown.js';
import { bound } from '../../utils/number.js';

export default class MdTable extends Control {
  static requires = ['replaceSelection'];
  static hostMode = 'write';

  handleDropdownOpened = () => {
    requestAnimationFrame(() => {
      const cols = this.shadowRoot.querySelector('.tbl-cols');
      if(cols){ cols.value = '3'; cols.select(); }
      const rows = this.shadowRoot.querySelector('.tbl-rows');
      if(rows) rows.value = '2';
    });
  };

  handleFormKeydown = (e) => {
    if(e.key === 'Enter'){ e.preventDefault(); this.submit(); }
    else if(e.key === 'Escape') this.shadowRoot.querySelector('k-dropdown')?.close();
  };

  submit() {
    const cols = this.clamp(this.shadowRoot.querySelector('.tbl-cols').value, 1, 20);
    const rows = this.clamp(this.shadowRoot.querySelector('.tbl-rows').value, 1, 50);
    if(!cols || !rows) return;
    this.host?.replaceSelection?.(this.buildTable(cols, rows), { selectInserted: false });
    this.shadowRoot.querySelector('k-dropdown')?.close();
  }

  clamp(raw, min, max) {
    const n = parseInt(raw, 10);
    if(!Number.isFinite(n)) return 0;
    return bound(n, min, max);
  }

  buildTable(cols, rows) {
    const headerCells = Array.from({ length: cols }, (_, i) => ` Header ${i + 1} `).join('|');
    const separatorCells = Array.from({ length: cols }, () => ' --- ').join('|');
    const bodyCells = Array.from({ length: cols }, () => '   ').join('|');
    const lines = [
      `|${headerCells}|`,
      `|${separatorCells}|`,
      ...Array.from({ length: rows }, () => `|${bodyCells}|`)
    ];
    return `\n${lines.join('\n')}\n`;
  }

  render() {
    return html`
      <k-dropdown @opened=${this.handleDropdownOpened}>
        <button slot="trigger" type="button" class="no-btn trigger" title="Table"><k-icon name="table"></k-icon></button>
        <div class="tbl-form" @keydown=${this.handleFormKeydown}>
          <input class="tbl-cols" type="number" min="1" max="20" inputmode="numeric" aria-label="Columns" value="3" />
          <span class="tbl-x" aria-hidden="true">×</span>
          <input class="tbl-rows" type="number" min="1" max="50" inputmode="numeric" aria-label="Rows" value="2" />
          <button type="button" class="primary" @click=${() => this.submit()}>Insert</button>
        </div>
      </k-dropdown>
    `;
  }

  static styles = [
    Control.styles,
    css`
      :host { border: 1px solid var(--c_border); border-radius: var(--radius); margin: var(--spacer_q); }
      .trigger { display: inline-flex; align-items: center; justify-content: center; min-width: 2.5rem; min-height: 2.5rem; background: transparent; border: none; border-radius: var(--radius); cursor: pointer; }
      .trigger:hover { background: oklch(from var(--c_bg__inv) l c h / 0.15); }
      .tbl-form { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem; }
      .tbl-form input { width: 2.5rem; padding: 0.35rem 0.4rem; border: 1px solid var(--c_border); border-radius: var(--radius); font: inherit; text-align: center; -moz-appearance: textfield; }
      .tbl-form input::-webkit-inner-spin-button,
      .tbl-form input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      .tbl-x { color: var(--tc_muted); font-weight: bold; }
      .tbl-form button.primary { padding: 0.4rem 0.8rem; border: 1px solid var(--c_primary); border-radius: var(--radius); background: var(--c_primary); color: white; cursor: pointer; font: inherit; }
    `
  ];
}

customElements.define('kc-md-table', MdTable);
