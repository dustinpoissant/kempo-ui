import MarkdownEditorControl from './MarkdownEditorControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';
import { bound } from '../../utils/number.js';

/*
  Heading control. Defaults to H2 (the typical "section title" level inside
  a comment / chat / form). Override the level with the `level` attribute
  (1–6) — e.g. <k-md-heading level="3"></k-md-heading>.
*/
export default class MarkdownHeading extends MarkdownEditorControl {
  static properties = {
    ...MarkdownEditorControl.properties,
    level: { type: Number, reflect: true }
  };

  constructor() {
    super();
    this.level = 2;
    this.label = 'Heading';
  }

  command() {
    const lvl = bound(Number(this.level) || 2, 1, 6);
    // Pass a replacePattern so clicking a different heading level swaps the
    // existing one out instead of stacking another `#` group on top.
    this.insertLinePrefix('#'.repeat(lvl) + ' ', /^#{1,6} /);
  }

  render() {
    const iconLevel = bound(Number(this.level) || 2, 1, 6);
    return html`
      <button
        type="button"
        class=${this.btnClass}
        title="${this.label} ${iconLevel}"
        aria-label="${this.label} ${iconLevel}"
        @click=${this.handleClick}
      >
        <k-icon name="format_h${iconLevel}"></k-icon>
      </button>
    `;
  }
}

customElements.define('k-md-heading', MarkdownHeading);
