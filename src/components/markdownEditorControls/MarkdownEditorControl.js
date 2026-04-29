import ShadowComponent from '../ShadowComponent.js';
import { html, css } from '../../lit-all.min.js';

/*
  Base class for <k-markdown-editor> control buttons. Subclass and override
  `command()` (or `render()` for custom UI) to wire up a toolbar button to a
  text manipulation. The editor is found via closest('k-markdown-editor');
  helper methods on the editor (wrapSelection, insertLinePrefix,
  replaceSelection, insertAtCursor) handle the textarea selection math.

  Mirrors HtmlEditorControl in spirit, scoped to MarkdownEditor.
*/

export default class MarkdownEditorControl extends ShadowComponent {
  static properties = {
    btnClass: { type: String, attribute: 'btn-class' },
    label: { type: String, reflect: true },
    hidden: { type: Boolean, reflect: true }
  };

  constructor() {
    super();
    this.btnClass = 'no-btn ctrl';
    this.label = '';
    this.hidesInPreviewMode = true;
  }

  connectedCallback() {
    super.connectedCallback();
    const editor = this.editor;
    if(!editor) return;
    this.boundEditor = editor;
    this.modeHandler = () => {
      const shouldHide = this.hidesInPreviewMode && this.boundEditor.mode === 'preview';
      if(this.hidden !== shouldHide){
        this.hidden = shouldHide;
      }
    };
    // Reflect initial state
    this.modeHandler();
    editor.addEventListener('mode-change', this.modeHandler);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if(this.boundEditor && this.modeHandler){
      this.boundEditor.removeEventListener('mode-change', this.modeHandler);
    }
    this.boundEditor = null;
    this.modeHandler = null;
  }

  /*
    Editor lookup. `closest()` works when the control is slotted in light
    DOM (the most common case). When the control is rendered as slot
    fallback content it lives inside the editor's own shadow root, where
    `closest()` can't cross the shadow boundary — fall through to the
    shadow root's host in that case.
  */
  get editor() {
    const direct = this.closest('k-markdown-editor');
    if(direct) return direct;
    const root = this.getRootNode();
    if(root instanceof ShadowRoot && root.host?.tagName === 'K-MARKDOWN-EDITOR'){
      return root.host;
    }
    return null;
  }

  /*
    Convenience helpers — subclasses use these in `command()` to manipulate
    the editor's textarea. Each is a thin pass-through with a guard.
  */
  wrapSelection(prefix, suffix, placeholder) {
    this.editor?.wrapSelection(prefix, suffix, placeholder);
  }

  insertAtCursor(text) {
    this.editor?.insertAtCursor(text);
  }

  insertLinePrefix(prefix, replacePattern) {
    this.editor?.insertLinePrefix(prefix, replacePattern);
  }

  replaceInSelectedLines(pattern, replacement) {
    this.editor?.replaceInSelectedLines(pattern, replacement);
  }

  replaceSelection(text, options) {
    this.editor?.replaceSelection(text, options);
  }

  getSelection() {
    return this.editor?.getSelection() || { start: 0, end: 0, text: '' };
  }

  /*
    Override in subclasses to do the work. Default no-op.
  */
  command() {}

  handleClick = (e) => {
    e.preventDefault();
    if(this.hidden) return;
    this.command();
  };

  /*
    Default render: a button with the provided label (or whatever you slot
    in). Subclasses can override for custom UI (icon button, dropdown, etc.).
  */
  render() {
    return html`
      <button
        type="button"
        class=${this.btnClass}
        title=${this.label}
        aria-label=${this.label}
        @click=${this.handleClick}
      >
        <slot>${this.label}</slot>
      </button>
    `;
  }

  static styles = css`
    :host {
      display: inline-flex;
    }
    :host([hidden]) {
      display: none;
    }
    .ctrl {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: var(--spacer_h);
      border: 1px solid transparent;
      border-radius: var(--radius);
      background: transparent;
      color: var(--tc_muted);
      cursor: pointer;
      font: inherit;
      transition: background var(--animation_ms), color var(--animation_ms);
    }
    .ctrl:hover {
      background: var(--c_bg__alt);
      color: var(--tc);
    }
    .ctrl:focus-visible {
      outline: none;
      box-shadow: var(--focus_shadow);
    }
  `;
}

customElements.define('k-md-control', MarkdownEditorControl);
