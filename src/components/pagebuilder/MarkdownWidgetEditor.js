import WidgetEditor from './WidgetEditor.js';
import { html, css } from '../../lit-all.min.js';
import '../Markdown.js';

/*
  The element a Markdown widget is drawn with in the builder. Shown rendered, it is the markdown as the page shows it. A
  selected widget starts typing: it becomes a plain textarea with no border or background. Losing focus renders it again,
  and a changed text is sent to the builder as one change.
*/
export default class MarkdownWidgetEditor extends WidgetEditor {
  /*
    Reactive Properties / Attributes
  */
  static properties = {
    ...WidgetEditor.properties,
    editing: { state: true },
    draft: { state: true },
    saved: { state: true }
  };

  /*
    Constructor
  */
  constructor() {
    super();
    this.editing = false;
    this.draft = '';
    this.saved = null;
  }

  /*
    Lifecycle Callbacks
  */
  updated(changed) {
    super.updated(changed);
    if(changed.has('editing') && this.editing) this.renderRoot.querySelector('textarea')?.focus();
  }

  /*
    Protected Members
  */
  /* The markdown as it is now: the text last saved from the page, else the text the builder drew. */
  get source() {
    return this.saved ?? this.textContent;
  }

  startEditing = () => {
    this.draft = this.source;
    this.editing = true;
  };

  /*
    Event Handlers
  */
  /* Selecting the widget (a click, or when it is added) starts typing in it. Being drawn again while selected does not. */
  handleSelected = event => {
    this.selected = event.detail.selected;
    if(this.selected) this.startEditing();
  };

  handleClick = () => {
    this.startEditing();
  };

  handleInput = event => {
    this.draft = event.target.value;
  };

  commit = () => {
    if(!this.editing) return;
    const value = this.draft;
    const changed = value !== this.source;
    this.editing = false;
    this.saved = value;
    if(changed) this.emitChange({ markdown: value });
  };

  /*
    Rendering
  */
  render() {
    if(this.editing) return html`<textarea class="draft" .value="${this.draft}" @input="${this.handleInput}" @blur="${this.commit}"></textarea>`;
    const source = this.source;
    if(!source.trim()) return html`<div class="placeholder" @click="${this.handleClick}">Click here to edit using Markdown</div>`;
    return html`<div class="rendered" @click="${this.handleClick}"><k-markdown .value="${source}"></k-markdown></div>`;
  }

  static styles = css`
    :host {
      display: block;
    }
    textarea.draft {
      display: block;
      box-sizing: border-box;
      width: 100%;
      min-height: 6rem;
      margin: 0;
      padding: 0;
      border: 0;
      outline: none;
      background: transparent;
      color: inherit;
      font: inherit;
      line-height: inherit;
      field-sizing: content;
      height: auto;
      max-height: none;
      overflow: hidden;
      resize: none;
    }
    .rendered {
      cursor: text;
    }
    .placeholder {
      cursor: text;
      font-style: italic;
      opacity: 0.55;
    }
  `;
}

customElements.define('k-page-builder-markdown-editor', MarkdownWidgetEditor);
