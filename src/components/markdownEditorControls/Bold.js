import MarkdownEditorControl from './MarkdownEditorControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class MarkdownBold extends MarkdownEditorControl {
  constructor() {
    super();
    this.label = 'Bold (Cmd/Ctrl+B)';
  }

  command() {
    this.wrapSelection('**', '**', 'bold text');
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
        <k-icon name="format_bold"></k-icon>
      </button>
    `;
  }
}

customElements.define('k-md-bold', MarkdownBold);
