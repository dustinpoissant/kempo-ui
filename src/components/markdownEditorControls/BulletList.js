import MarkdownEditorControl from './MarkdownEditorControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class MarkdownBulletList extends MarkdownEditorControl {
  constructor() {
    super();
    this.label = 'Bulleted list';
  }

  command() {
    this.insertLinePrefix('- ');
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
        <k-icon name="format_list_bulleted"></k-icon>
      </button>
    `;
  }
}

customElements.define('k-md-bullet-list', MarkdownBulletList);
