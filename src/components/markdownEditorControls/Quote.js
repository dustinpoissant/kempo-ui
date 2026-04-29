import MarkdownEditorControl from './MarkdownEditorControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class MarkdownQuote extends MarkdownEditorControl {
  constructor() {
    super();
    this.label = 'Quote';
  }

  command() {
    this.insertLinePrefix('> ');
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
        <k-icon name="format_quote"></k-icon>
      </button>
    `;
  }
}

customElements.define('k-md-quote', MarkdownQuote);
