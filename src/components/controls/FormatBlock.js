import ButtonControl from './Button.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';

const TAG_LABELS = {
  p: 'Paragraph',
  h1: 'Heading 1', h2: 'Heading 2', h3: 'Heading 3',
  h4: 'Heading 4', h5: 'Heading 5', h6: 'Heading 6',
  blockquote: 'Blockquote',
  pre: 'Code Block'
};

const TAG_ICONS = {
  p: 'format_paragraph',
  h1: 'format_h1', h2: 'format_h2', h3: 'format_h3',
  h4: 'format_h4', h5: 'format_h5', h6: 'format_h6',
  blockquote: 'format_quote',
  pre: 'code_blocks'
};

export default class FormatBlock extends ButtonControl {
  static requires = ['formatBlock'];
  static hostMode = ['visual', 'write'];

  static properties = {
    ...ButtonControl.properties,
    tag: { type: String, reflect: true }
  };

  constructor() {
    super();
    this.tag = 'p';
  }

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = TAG_LABELS[this.tag] || this.tag;
  }

  getDefaultLabel(tag) { return TAG_LABELS[tag || this.tag] || (tag || this.tag).toUpperCase(); }
  getDefaultIcon(tag) { return TAG_ICONS[tag || this.tag] || 'format_paragraph'; }

  handleAction() { this.invokeHost('formatBlock', this.tag); }

  render() {
    const label = TAG_LABELS[this.tag] || this.tag.toUpperCase();
    const icon = TAG_ICONS[this.tag] || 'format_paragraph';
    return html`
      <slot name="icon"><k-icon name=${icon}></k-icon></slot>
      <slot>${label}</slot>
    `;
  }

  static styles = [
    ButtonControl.styles,
    css`
      :host {
        gap: 0.5rem;
      }
    `
  ];
}

customElements.define('kc-format-block', FormatBlock);
