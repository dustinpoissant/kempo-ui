import MarkdownEditorControl from './MarkdownEditorControl.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';
import '../Dropdown.js';

/*
  Table control. Opens a small dropdown with two number inputs (cols × rows)
  and a Create button, then inserts a GFM markdown table with that many
  empty cells at the cursor.
*/
export default class MarkdownTable extends MarkdownEditorControl {
  constructor() {
    super();
    this.label = 'Table';
  }

  /*
    The trigger is wired to Dropdown's own click handling, so the
    base-class handleClick (which calls command()) would fire on top and
    create a feedback loop. command() is a no-op here; the Insert button
    inside the dropdown drives insertion.
  */
  command() {}

  handleDropdownOpened = () => {
    requestAnimationFrame(() => {
      const cols = this.shadowRoot?.querySelector('.tbl-cols');
      if(cols){ cols.value = '3'; cols.select(); }
      const rows = this.shadowRoot?.querySelector('.tbl-rows');
      if(rows) rows.value = '2';
    });
  };

  handleFormKeydown = (e) => {
    if(e.key === 'Enter'){
      e.preventDefault();
      this.#submit();
    } else if(e.key === 'Escape'){
      this.shadowRoot?.querySelector('k-dropdown')?.close();
    }
  };

  handleInsertClick = () => this.#submit();

  #submit() {
    const cols = this.#clamp(this.shadowRoot?.querySelector('.tbl-cols')?.value, 1, 20);
    const rows = this.#clamp(this.shadowRoot?.querySelector('.tbl-rows')?.value, 1, 50);
    if(!cols || !rows) return;
    const editor = this.editor;
    if(!editor) return;
    editor.replaceSelection(this.#buildTable(cols, rows), { selectInserted: false });
    this.shadowRoot?.querySelector('k-dropdown')?.close();
  }

  #clamp(raw, min, max) {
    const n = parseInt(raw, 10);
    if(!Number.isFinite(n)) return 0;
    return Math.max(min, Math.min(max, n));
  }

  #buildTable(cols, rows) {
    const headerCells = Array.from({ length: cols }, (_, i) => ` Header ${i + 1} `).join('|');
    const separatorCells = Array.from({ length: cols }, () => ' --- ').join('|');
    const bodyCells = Array.from({ length: cols }, () => '   ').join('|');
    const lines = [
      `|${headerCells}|`,
      `|${separatorCells}|`,
      ...Array.from({ length: rows }, () => `|${bodyCells}|`)
    ];
    // Surround with newlines so the table starts on its own line and the
    // user's cursor lands on a fresh line below it.
    return `\n${lines.join('\n')}\n`;
  }

  render() {
    return html`
      <k-dropdown @opened=${this.handleDropdownOpened}>
        <button
          slot="trigger"
          type="button"
          class=${this.btnClass}
          title=${this.label}
          aria-label=${this.label}
        >
          <k-icon name="table"></k-icon>
        </button>
        <div class="tbl-form" @keydown=${this.handleFormKeydown}>
          <input
            class="tbl-cols"
            type="number"
            min="1"
            max="20"
            inputmode="numeric"
            aria-label="Columns"
            value="3"
          />
          <span class="tbl-x" aria-hidden="true">×</span>
          <input
            class="tbl-rows"
            type="number"
            min="1"
            max="50"
            inputmode="numeric"
            aria-label="Rows"
            value="2"
          />
          <button type="button" class="primary" @click=${this.handleInsertClick}>Insert</button>
        </div>
      </k-dropdown>
    `;
  }

  static styles = [
    MarkdownEditorControl.styles,
    css`
      .tbl-form {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.5rem;
      }
      .tbl-form input {
        width: 2.5rem;
        padding: 0.35rem 0.4rem;
        border: 1px solid var(--c_border);
        border-radius: var(--radius);
        font: inherit;
        background: var(--c_bg);
        color: var(--tc);
        text-align: center;
        /* Hide the up/down spinner buttons that take up extra width. */
        -moz-appearance: textfield;
      }
      .tbl-form input::-webkit-inner-spin-button,
      .tbl-form input::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      .tbl-form input:focus-visible {
        outline: none;
        box-shadow: var(--focus_shadow);
      }
      .tbl-x {
        color: var(--tc_muted);
        font-weight: bold;
      }
      .tbl-form button.primary {
        padding: 0.4rem 0.8rem;
        border: 1px solid var(--c_primary);
        border-radius: var(--radius);
        background: var(--c_primary);
        color: white;
        cursor: pointer;
        font: inherit;
      }
      .tbl-form button.primary:focus-visible {
        outline: none;
        box-shadow: var(--focus_shadow);
      }
    `
  ];
}

customElements.define('k-md-table', MarkdownTable);
