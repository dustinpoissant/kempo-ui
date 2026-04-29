import MarkdownEditorControl from './MarkdownEditorControl.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';

/*
  Heading-block picker designed to go inside a `<k-md-menu>` (or any
  container that wants menu-item-styled controls). The `tag` attribute
  selects which heading level to switch the current line(s) to:

    tag="h1" .. "h6" — Heading 1-6 (sets the `#` prefix, swapping any
                       existing heading level for the new one)

  Renders as a full-width button with an icon and a text label so it reads
  cleanly as a menu item.
*/
const TAG_LABELS = {
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  h4: 'Heading 4',
  h5: 'Heading 5',
  h6: 'Heading 6'
};

const TAG_ICONS = {
  h1: 'format_h1',
  h2: 'format_h2',
  h3: 'format_h3',
  h4: 'format_h4',
  h5: 'format_h5',
  h6: 'format_h6'
};

export default class MarkdownFormatBlock extends MarkdownEditorControl {
  static properties = {
    ...MarkdownEditorControl.properties,
    tag: { type: String, reflect: true }
  };

  constructor() {
    super();
    this.tag = 'h2';
    this.label = '';
  }

  command() {
    const tag = (this.tag || 'h2').toLowerCase();
    if(/^h[1-6]$/.test(tag)){
      const lvl = parseInt(tag.slice(1), 10);
      this.insertLinePrefix('#'.repeat(lvl) + ' ', /^#{1,6} /);
    }
  }

  get #displayLabel() {
    if(this.label) return this.label;
    return TAG_LABELS[(this.tag || 'h2').toLowerCase()] || this.tag;
  }

  get #iconName() {
    return TAG_ICONS[(this.tag || 'h2').toLowerCase()] || 'format_h2';
  }

  render() {
    return html`
      <button
        type="button"
        class=${this.btnClass}
        title=${this.#displayLabel}
        aria-label=${this.#displayLabel}
        @click=${this.handleClick}
      >
        <k-icon name=${this.#iconName}></k-icon>
        <span class="fb-label">${this.#displayLabel}</span>
      </button>
    `;
  }

  static styles = [
    MarkdownEditorControl.styles,
    css`
      :host {
        display: inline-flex;
      }
      .ctrl {
        gap: 0.5rem;
        justify-content: flex-start;
        white-space: nowrap;
      }
      /* When this is slotted into something that stretches it (a menu),
         the button fills the row instead of staying compact. */
      :host([slot]) .ctrl,
      :host(*) .ctrl {
        width: 100%;
      }
      .fb-label {
        font-size: 0.875rem;
      }
    `
  ];
}

customElements.define('k-md-format-block', MarkdownFormatBlock);
