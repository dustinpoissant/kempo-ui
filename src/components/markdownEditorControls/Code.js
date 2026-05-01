import MarkdownEditorControl from './MarkdownEditorControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

/*
  Toggle inline code (backticks) for the selection. If the selection spans
  multiple lines, a triple-backtick fenced block is inserted instead.
*/
export default class MarkdownCode extends MarkdownEditorControl {
  constructor() {
    super();
    this.label = 'Code';
  }

  command() {
    const sel = this.getSelection();
    if(sel.text.includes('\n')){
      this.wrapSelection('```\n', '\n```', 'code');
    } else {
      this.wrapSelection('`', '`', 'code');
    }
  }

  render() {
    return html`
      <button
        type="button"
        class=${this.btnClass}
        title=${this.label}
        aria-label=${this.label}
        @click=${this.handleClick}
      >
        <k-icon name="code"></k-icon>
      </button>
    `;
  }
}

customElements.define('k-md-code', MarkdownCode);
