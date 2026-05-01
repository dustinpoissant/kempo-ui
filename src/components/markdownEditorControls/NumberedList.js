import MarkdownEditorControl from './MarkdownEditorControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

/*
  Numbered list control. Prefixes each non-empty selected line with `N. `
  using sequential numbers. Markdown renderers accept all-1. as well, but
  numbering them properly keeps the source readable.
*/
export default class MarkdownNumberedList extends MarkdownEditorControl {
  constructor() {
    super();
    this.label = 'Numbered list';
  }

  command() {
    const editor = this.editor;
    if(!editor) return;
    const ta = editor.textarea;
    if(!ta) return;
    if(editor.mode !== 'write') editor.mode = 'write';
    editor.updateComplete.then(() => {
      ta.focus();
      const { selectionStart: start, selectionEnd: end, value } = ta;
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const lineEndIdx = value.indexOf('\n', end);
      const lineEnd = lineEndIdx === -1 ? value.length : lineEndIdx;
      const block = value.substring(lineStart, lineEnd);
      const lines = block.split('\n');
      const numbered = /^\d+\. /;
      const nonEmpty = lines.filter(l => l.length > 0);
      const allNumbered = nonEmpty.length > 0 && nonEmpty.every(l => numbered.test(l));
      let processed;
      if(allNumbered){
        processed = lines.map(l => l.replace(numbered, ''));
      } else {
        let n = 1;
        processed = lines.map(l => {
          if(!l) return l;
          const stripped = l.replace(numbered, '');
          return `${n++}. ${stripped}`;
        });
      }
      const nextBlock = processed.join('\n');
      const next = value.substring(0, lineStart) + nextBlock + value.substring(lineEnd);
      ta.value = next;
      ta.selectionStart = lineStart;
      ta.selectionEnd = lineStart + nextBlock.length;
      editor.value = next;
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    });
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
        <k-icon name="format_list_numbered"></k-icon>
      </button>
    `;
  }
}

customElements.define('k-md-numbered-list', MarkdownNumberedList);
