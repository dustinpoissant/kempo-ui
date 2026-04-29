import MarkdownEditorControl from './MarkdownEditorControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

/*
  GFM strikethrough — wraps the selection in `~~...~~`. marked renders this
  to `<del>` (allowed by sanitizeHtml's default tag set), so it survives
  the sanitize pass.
*/
export default class MarkdownStrikethrough extends MarkdownEditorControl {
  constructor() {
    super();
    this.label = 'Strikethrough';
  }

  command() {
    this.wrapSelection('~~', '~~', 'strikethrough');
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
        <k-icon name="format_strikethrough"></k-icon>
      </button>
    `;
  }
}

customElements.define('k-md-strikethrough', MarkdownStrikethrough);
