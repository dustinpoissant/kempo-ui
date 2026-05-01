import MarkdownEditorControl from './MarkdownEditorControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

/*
  Link control. Wraps the selection in `[text](url)`. If the user has selected
  text it becomes the link text and the URL placeholder is selected for them
  to overtype. If nothing is selected, a `link text` placeholder is used and
  the user can tab through to the URL.
*/
export default class MarkdownLink extends MarkdownEditorControl {
  constructor() {
    super();
    this.label = 'Link';
  }

  command() {
    const sel = this.getSelection();
    const editor = this.editor;
    if(!editor) return;
    const ta = editor.textarea;
    if(!ta) return;

    const fireInput = (next, selStart, selEnd) => {
      ta.value = next;
      ta.selectionStart = selStart;
      ta.selectionEnd = selEnd;
      ta.focus();
      editor.value = next;
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    };

    // Toggle: if the selection (or just the cursor) sits anywhere inside an
    // existing `[label](url)`, unwrap that whole link to just its label. This
    // works whether the user has the label, the URL, or nothing selected —
    // they just have to be somewhere inside the link.
    const re = /\[([^\]]*)\]\([^)]*\)/g;
    let m;
    while((m = re.exec(ta.value)) !== null){
      const matchStart = m.index;
      const matchEnd = matchStart + m[0].length;
      if(sel.start >= matchStart && sel.end <= matchEnd){
        const label = m[1];
        const next = ta.value.substring(0, matchStart) + label + ta.value.substring(matchEnd);
        fireInput(next, matchStart, matchStart + label.length);
        return;
      }
    }

    // Otherwise insert a new link with the URL portion pre-selected so the
    // user can immediately overtype it.
    const text = sel.text || 'link text';
    const inserted = `[${text}](url)`;
    const next = ta.value.substring(0, sel.start) + inserted + ta.value.substring(sel.end);
    const urlStart = sel.start + 1 + text.length + 2; // past `[text](`
    fireInput(next, urlStart, urlStart + 'url'.length);
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
        <k-icon name="link"></k-icon>
      </button>
    `;
  }
}

customElements.define('k-md-link', MarkdownLink);
