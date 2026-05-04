import { html, css, nothing } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';
import renderMarkdown from '../utils/renderMarkdown.js';
import sanitizeHtml, { STRIP_COMPLETELY } from '../utils/sanitizeHtml.js';
import debounce from '../utils/debounce.js';
import './Resize.js';
import './Tabs.js';

const defaultValue = Symbol();
const debouncedChange = Symbol();
const controlsLoaded = Symbol();
const resolvedAllowedTags = Symbol();
const updateValidity = Symbol();

/*
  Textarea that writes markdown, with a live "Preview" tab. Designed to mimic
  GitHub's comment editor — write tab + preview tab + control slots above and
  below the textarea. Markdown is parsed by snarkdown, which intentionally
  does NOT support inline HTML so user input can't smuggle in <script> or
  similar. Form-associated; the submitted value is the raw markdown.

  Controls go in the `controls-top` and `controls-bottom` slots; subclass
  MarkdownEditorControl (./MarkdownEditorControl.js) to write your own.
*/
export default class MarkdownEditor extends ShadowComponent {
  static formAssociated = true;

  /*
    Reactive Properties / Attributes
  */
  static properties = {
    value: { type: String },
    name: { type: String, reflect: true },
    placeholder: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    readonly: { type: Boolean, reflect: true },
    mode: { type: String, reflect: true }, // 'write' | 'preview'
    /*
      Comma-separated allowlist for the rendered preview. Tags not in the
      list are unwrapped (their text survives, the wrapper is dropped). Pass
      `*` to allow every tag. Mutually exclusive with `disallowed-tags` —
      setting both warns and `allowed-tags` wins. Empty / unset = use
      sanitizeHtml's DEFAULT_TAGS.
    */
    allowedTags: { type: String, reflect: true, attribute: 'allowed-tags' },
    /*
      Comma-separated denylist for the rendered preview — allows everything
      except the listed tags. Useful when you want to ban a couple of tags
      rather than enumerate the whole allowed set. Mutually exclusive with
      `allowed-tags`.
    */
    disallowedTags: { type: String, reflect: true, attribute: 'disallowed-tags' },
    /*
      Opt-in: when this attribute is present, `<script>` tags are kept
      through sanitization (provided they also pass the allow/deny tag
      check). When absent (the default), `<script>` is always stripped
      entirely — including its content — to prevent XSS regardless of any
      other configuration.
    */
    scriptsEnabled: { type: Boolean, reflect: true, attribute: 'scripts-enabled' },
    /*
      Pre-built control set. One of `'minimal'`, `'normal'`, `'full'`, or
      empty/`'none'` (default — toolbar empty until consumers slot their own
      controls in). When set, the matching set of buttons is rendered as
      slot fallback content for `controls-top` / `controls-bottom`, and the
      relevant control modules are dynamically imported.
    */
    controls: { type: String, reflect: true }
  };

  /*
    Constructor
  */
  constructor() {
    super();
    this.internals = this.attachInternals();
    this.value = '';
    this.name = '';
    this.placeholder = '';
    this.disabled = false;
    this.required = false;
    this.readonly = false;
    this.mode = 'write';
    this.allowedTags = '';
    this.disallowedTags = '';
    this.scriptsEnabled = false;
    this.controls = '';
    this[defaultValue] = '';
    this[controlsLoaded] = false;
    this[debouncedChange] = debounce(() => this.handleChange(), 300);
  }

  /*
    Lifecycle
  */
  async loadControls() {
    if(this[controlsLoaded]) return;
    this[controlsLoaded] = true;
    const base = new URL('./markdownEditorControls/', import.meta.url).href;
    await Promise.all([
      import(/* @vite-ignore */ `${base}Bold.js`),
      import(/* @vite-ignore */ `${base}Italic.js`),
      import(/* @vite-ignore */ `${base}Strikethrough.js`),
      import(/* @vite-ignore */ `${base}Heading.js`),
      import(/* @vite-ignore */ `${base}Code.js`),
      import(/* @vite-ignore */ `${base}Link.js`),
      import(/* @vite-ignore */ `${base}Image.js`),
      import(/* @vite-ignore */ `${base}Table.js`),
      import(/* @vite-ignore */ `${base}BulletList.js`),
      import(/* @vite-ignore */ `${base}NumberedList.js`),
      import(/* @vite-ignore */ `${base}Quote.js`),
      import(/* @vite-ignore */ `${base}Menu.js`),
      import(/* @vite-ignore */ `${base}FormatBlock.js`),
      import(/* @vite-ignore */ `${base}SpeechToText.js`)
    ]);
    this.requestUpdate();
  }

  connectedCallback() {
    super.connectedCallback();
    if(this.hasAttribute('value')){
      this[defaultValue] = this.getAttribute('value');
    }
    if(!this.value && this[defaultValue]){
      this.value = this[defaultValue];
    }
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if(changedProperties.has('value')){
      this.internals.setFormValue(this.value);
    }
    if(changedProperties.has('controls') && this.controls && this.controls !== 'none'){
      this.loadControls();
    }
    this[updateValidity]();
  }

  formResetCallback() {
    this.value = this[defaultValue];
    this.mode = 'write';
  }

  formStateRestoreCallback(state) {
    if(typeof state === 'string') this.value = state;
  }

  formDisabledCallback(disabled) {
    this.disabled = disabled;
  }

  /*
    Public Methods
  */
  focus() {
    if(this.mode !== 'write') this.mode = 'write';
    this.updateComplete.then(() => {
      this.shadowRoot?.querySelector('textarea')?.focus();
    });
  }

  blur() {
    this.shadowRoot?.querySelector('textarea')?.blur();
  }

  clear() {
    this.value = '';
  }

  setMode(mode) {
    if(mode === 'write' || mode === 'preview') this.mode = mode;
  }

  togglePreview() {
    this.mode = this.mode === 'write' ? 'preview' : 'write';
  }

  get textarea() {
    return this.shadowRoot?.querySelector('textarea') || null;
  }

  getSelection() {
    const ta = this.textarea;
    if(!ta) return { start: 0, end: 0, text: '' };
    return {
      start: ta.selectionStart,
      end: ta.selectionEnd,
      text: ta.value.substring(ta.selectionStart, ta.selectionEnd)
    };
  }

  replaceSelection(replacement, { selectInserted = true } = {}) {
    const ta = this.textarea;
    if(!ta) return;
    if(this.mode !== 'write') this.mode = 'write';
    this.updateComplete.then(() => {
      ta.focus();
      const { selectionStart: start, selectionEnd: end } = ta;
      const before = ta.value.substring(0, start);
      const after = ta.value.substring(end);
      const next = before + replacement + after;
      ta.value = next;
      const cursorEnd = start + replacement.length;
      ta.selectionStart = selectInserted ? start : cursorEnd;
      ta.selectionEnd = cursorEnd;
      this.value = next;
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }

  wrapSelection(prefix, suffix = prefix, placeholder = '') {
    const ta = this.textarea;
    if(!ta){
      this.replaceSelection(prefix + placeholder + suffix);
      return;
    }
    if(this.mode !== 'write') this.mode = 'write';
    this.updateComplete.then(() => {
      ta.focus();
      const { selectionStart: start, selectionEnd: end, value } = ta;
      const selected = value.substring(start, end);

      // Case 1: selection itself contains the wrap → strip it.
      if(selected.length >= prefix.length + suffix.length
         && selected.startsWith(prefix)
         && selected.endsWith(suffix)){
        const inner = selected.slice(prefix.length, selected.length - suffix.length);
        const next = value.substring(0, start) + inner + value.substring(end);
        ta.value = next;
        ta.selectionStart = start;
        ta.selectionEnd = start + inner.length;
        this.value = next;
        ta.dispatchEvent(new Event('input', { bubbles: true }));
        return;
      }

      // Case 2: characters around the selection are the wrap → extend & strip.
      const before = value.substring(Math.max(0, start - prefix.length), start);
      const after = value.substring(end, Math.min(value.length, end + suffix.length));
      if(before === prefix && after === suffix){
        const next = value.substring(0, start - prefix.length)
          + selected
          + value.substring(end + suffix.length);
        ta.value = next;
        ta.selectionStart = start - prefix.length;
        ta.selectionEnd = ta.selectionStart + selected.length;
        this.value = next;
        ta.dispatchEvent(new Event('input', { bubbles: true }));
        return;
      }

      // Otherwise wrap as usual.
      const inner = selected || placeholder;
      const next = value.substring(0, start) + prefix + inner + suffix + value.substring(end);
      ta.value = next;
      const innerStart = start + prefix.length;
      ta.selectionStart = innerStart;
      ta.selectionEnd = innerStart + inner.length;
      this.value = next;
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }

  insertAtCursor(text) {
    this.replaceSelection(text, { selectInserted: false });
  }

  replaceInSelectedLines(pattern, replacement = '') {
    const ta = this.textarea;
    if(!ta) return;
    if(this.mode !== 'write') this.mode = 'write';
    this.updateComplete.then(() => {
      ta.focus();
      const { selectionStart: start, selectionEnd: end, value } = ta;
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const lineEndIdx = value.indexOf('\n', end);
      const lineEnd = lineEndIdx === -1 ? value.length : lineEndIdx;
      const block = value.substring(lineStart, lineEnd);
      const next_block = block.split('\n').map(l => l.replace(pattern, replacement)).join('\n');
      if(next_block === block) return;
      const next = value.substring(0, lineStart) + next_block + value.substring(lineEnd);
      ta.value = next;
      ta.selectionStart = lineStart;
      ta.selectionEnd = lineStart + next_block.length;
      this.value = next;
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }

  insertLinePrefix(prefix, replacePattern = null) {
    const ta = this.textarea;
    if(!ta) return;
    if(this.mode !== 'write') this.mode = 'write';
    this.updateComplete.then(() => {
      ta.focus();
      const { selectionStart: start, selectionEnd: end, value } = ta;
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const lineEndIdx = value.indexOf('\n', end);
      const lineEnd = lineEndIdx === -1 ? value.length : lineEndIdx;
      const block = value.substring(lineStart, lineEnd);
      const lines = block.split('\n');
      const nonEmpty = lines.filter(l => l.length > 0);
      const allHavePrefix = nonEmpty.length > 0 && nonEmpty.every(l => l.startsWith(prefix));
      const processed = lines.map(line => {
        if(line.length === 0) return line;
        if(allHavePrefix) return line.startsWith(prefix) ? line.slice(prefix.length) : line;
        if(line.startsWith(prefix)) return line;
        if(replacePattern && replacePattern.test(line)) return line.replace(replacePattern, prefix);
        return prefix + line;
      });
      const next_block = processed.join('\n');
      const next = value.substring(0, lineStart) + next_block + value.substring(lineEnd);
      ta.value = next;
      ta.selectionStart = lineStart;
      ta.selectionEnd = lineStart + next_block.length;
      this.value = next;
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }

  /*
    Protected Members
  */
  get isEmpty() {
    return !(this.value || '').trim();
  }

  get renderedHtml() {
    const opts = {};
    const resolved = this[resolvedAllowedTags];
    if(resolved) opts.allowedTags = resolved;
    if(this.scriptsEnabled){
      const stripCompletely = new Set(STRIP_COMPLETELY);
      stripCompletely.delete('SCRIPT');
      opts.stripCompletely = stripCompletely;
    }
    return sanitizeHtml(renderMarkdown(this.value || ''), opts);
  }

  get [resolvedAllowedTags]() {
    const allow = (this.allowedTags || '').trim();
    const deny = (this.disallowedTags || '').trim();
    if(allow && deny){
      console.warn('[k-markdown-editor] `allowed-tags` and `disallowed-tags` are mutually exclusive; using `allowed-tags`.');
    }
    if(allow){
      if(allow === '*') return { has: () => true };
      return new Set(allow.split(',').map(t => t.trim().toUpperCase()).filter(Boolean));
    }
    if(deny){
      const denySet = new Set(deny.split(',').map(t => t.trim().toUpperCase()).filter(Boolean));
      return { has: (tag) => !denySet.has(tag) };
    }
    return null;
  }

  [updateValidity] = () => {
    const ta = this.shadowRoot?.querySelector('textarea');
    if(this.required && this.isEmpty){
      this.internals.setValidity(
        { valueMissing: true },
        'Please fill out this field.',
        ta
      );
    } else {
      this.internals.setValidity({});
    }
  };

  /*
    Event Handlers
  */
  handleInput = (e) => {
    this.value = e.target.value;
    this.dispatchEvent(new CustomEvent('input', {
      detail: { value: this.value },
      bubbles: true
    }));
    this[debouncedChange]();
  };

  handleChange = () => {
    this.dispatchEvent(new CustomEvent('change', {
      detail: { value: this.value },
      bubbles: true
    }));
  };

  handleTabChange = (e) => {
    const newMode = e.detail?.tab;
    if(!newMode || newMode === this.mode) return;
    this.mode = newMode;
    this.dispatchEvent(new CustomEvent('mode-change', {
      detail: { mode: newMode },
      bubbles: true
    }));
  };

  /*
    Rendering
  */
  render() {
    const set = this.constructor.controlSets[this.controls] ?? this.constructor.controlSets[''];
    return html`
      <k-resize dimension="height" ?disabled=${this.disabled}>
        <div class="frame">
          <k-tabs fixed-height active=${this.mode} @tab=${this.handleTabChange}>
            <k-tab slot="tabs" for="write">Write</k-tab>
            <k-tab slot="tabs" for="preview">Preview</k-tab>
            <k-tab-spacer slot="tabs"></k-tab-spacer>
            <div slot="tabs" class="controls-top">
              <slot name="controls-top">${set.top ?? nothing}</slot>
            </div>
            <k-tab-content name="write">
              <textarea
                class="editor"
                .value=${this.value}
                placeholder=${this.placeholder}
                ?disabled=${this.disabled}
                ?readonly=${this.readonly}
                aria-label=${this.name || this.placeholder}
                @input=${this.handleInput}
                @blur=${this.handleChange}
                @change=${this.handleChange}
              ></textarea>
            </k-tab-content>
            <k-tab-content name="preview">
              <div
                class="preview"
                role="article"
                .innerHTML=${this.isEmpty ? '<p class="preview-empty">Nothing to preview</p>' : this.renderedHtml}
              ></div>
            </k-tab-content>
          </k-tabs>
          <div class="footer">
            <slot name="controls-bottom">${set.bottom ?? nothing}</slot>
          </div>
        </div>
      </k-resize>
    `;
  }

  static styles = css`
    :host {
      --padding: 0.5rem 0.75rem;
      display: block;
    }
    :host([disabled]) {
      opacity: 0.6;
    }
    :host([disabled]) k-tabs {
      pointer-events: none;
    }
    /* readonly: textarea is read-only via the native attribute, but the
       toolbar buttons mutate value programmatically, bypassing it. Mute
       the controls-top wrapper and the footer so their buttons can't
       fire. The Write/Preview tabs themselves stay interactive. */
    :host([readonly]) .controls-top,
    :host([readonly]) .footer {
      pointer-events: none;
      opacity: 0.5;
    }
    .controls-top {
      display: inline-flex;
      align-items: center;
      flex-wrap: wrap;
    }
    k-resize {
      width: 100%;
      height: var(--height, 14rem);
      min-height: var(--min-height);
      max-height: var(--max-height);
      background: var(--c_bg);
    }
    .frame {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      min-height: 0;
      box-sizing: border-box;
    }
    k-tabs {
      flex: 1 1 auto;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }
    k-tab-content[active] {
      display: flex;
      flex-direction: column;
      padding: var(--spacer_q);
    }
    k-tab-content:not([active]) {
      display: none;
    }
    .editor,
    .preview {
      box-sizing: border-box;
      flex: 1 1 0;
      min-height: 0;
      width: 100%;
      padding: var(--padding);
      background: transparent;
      color: var(--tc);
      font: inherit;
      line-height: 1.5;
      overflow-y: auto;
      scrollbar-width: thin;
      resize: none;
      max-height: none !important;
    }
    .preview-empty {
      color: var(--tc_muted);
      font-style: italic;
    }
    .footer {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.5rem;
      flex: 0 0 auto;
      border-top: 1px solid var(--c_border);
      box-sizing: border-box;
    }
    .footer:not(:has(::slotted(*))) {
      display: none;
    }
  `;

  /*
    Pre-built sets used as slot fallback content when the `controls`
    attribute is set. Tags reference custom elements that are loaded by
    `loadControls()` — listing them here doesn't require those modules to
    be imported eagerly. Lit creates the elements as plain HTMLElements
    until their definitions arrive, then the browser upgrades them in place.
  */
  static controlSets = {
    '': { top: null, bottom: null },
    none: { top: null, bottom: null },
    minimal: {
      top: html`
        <k-md-menu label="Heading">
          <k-icon slot="trigger" name="text_fields"></k-icon>
          <k-md-format-block tag="h1"></k-md-format-block>
          <k-md-format-block tag="h3"></k-md-format-block>
          <k-md-format-block tag="h5"></k-md-format-block>
        </k-md-menu>
        <k-md-bold></k-md-bold>
        <k-md-italic></k-md-italic>
        <k-md-bullet-list></k-md-bullet-list>
        <k-md-numbered-list></k-md-numbered-list>
      `,
      bottom: null
    },
    normal: {
      top: html`
        <k-md-menu label="Heading">
          <k-icon slot="trigger" name="text_fields"></k-icon>
          <k-md-format-block tag="h1"></k-md-format-block>
          <k-md-format-block tag="h2"></k-md-format-block>
          <k-md-format-block tag="h3"></k-md-format-block>
          <k-md-format-block tag="h4"></k-md-format-block>
          <k-md-format-block tag="h5"></k-md-format-block>
          <k-md-format-block tag="h6"></k-md-format-block>
        </k-md-menu>
        <k-md-bold></k-md-bold>
        <k-md-italic></k-md-italic>
        <k-md-quote></k-md-quote>
        <k-md-code></k-md-code>
        <k-md-link></k-md-link>
        <k-md-bullet-list></k-md-bullet-list>
        <k-md-numbered-list></k-md-numbered-list>
      `,
      bottom: null
    },
    full: {
      top: html`
        <k-md-menu label="Heading">
          <k-icon slot="trigger" name="text_fields"></k-icon>
          <k-md-format-block tag="h1"></k-md-format-block>
          <k-md-format-block tag="h2"></k-md-format-block>
          <k-md-format-block tag="h3"></k-md-format-block>
          <k-md-format-block tag="h4"></k-md-format-block>
          <k-md-format-block tag="h5"></k-md-format-block>
          <k-md-format-block tag="h6"></k-md-format-block>
        </k-md-menu>
        <k-md-bold></k-md-bold>
        <k-md-italic></k-md-italic>
        <k-md-strikethrough></k-md-strikethrough>
        <k-md-quote></k-md-quote>
        <k-md-code></k-md-code>
        <k-md-link></k-md-link>
        <k-md-image></k-md-image>
        <k-md-table></k-md-table>
        <k-md-bullet-list></k-md-bullet-list>
        <k-md-numbered-list></k-md-numbered-list>
        <k-md-speech-to-text></k-md-speech-to-text>
      `,
      bottom: null
    }
  };
}

customElements.define('k-markdown-editor', MarkdownEditor);
