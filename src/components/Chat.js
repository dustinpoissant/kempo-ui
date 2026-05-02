import { html, css, nothing } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';
import sanitizeHtml from '../utils/sanitizeHtml.js';
import renderMarkdown from '../utils/renderMarkdown.js';
import './MarkdownEditor.js';
import './markdownEditorControls/Bold.js';
import './markdownEditorControls/Italic.js';
import './markdownEditorControls/Code.js';
import './markdownEditorControls/Link.js';
import './markdownEditorControls/BulletList.js';
import './markdownEditorControls/NumberedList.js';
import './markdownEditorControls/Quote.js';
import './Spinner.js';
import './Icon.js';

const newId = () => {
  if(typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'){
    return crypto.randomUUID();
  }
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const STATUSES = new Set(['sending', 'delivered', 'read', 'failed']);

export default class Chat extends ShadowComponent {
  static properties = {
    enterNewline: { type: Boolean, reflect: true, attribute: 'enter-newline' },
    // show-status is a string attr: absent = off, "" or "text" = text labels,
    // "icons" = icon-only badges. <k-chat show-status> defaults to text mode.
    showStatus: { type: String, reflect: true, attribute: 'show-status' },
    placeholder: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    messages: { state: true }
  };

  /*
    Lifecycle Callbacks
  */
  constructor() {
    super();
    // Default matches Slack/Discord/Messages: Enter sends, Shift+Enter newline.
    // Add the `enter-newline` attribute to invert (Enter inserts a newline,
    // Shift+Enter or the Send button submits).
    this.enterNewline = false;
    this.showStatus = null;
    this.placeholder = 'Type a message...';
    this.disabled = false;
    this.messages = [];
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if(changedProperties.has('messages')){
      this.#scrollToBottom();
    }
  }

  /*
    Public Methods
  */
  addMessage(msg = {}) {
    const type = msg.type === 'outgoing' ? 'outgoing' : 'incoming';
    const id = msg.id || newId();
    const html = sanitizeHtml(msg.html || '');
    const status = STATUSES.has(msg.status)
      ? msg.status
      : (type === 'outgoing' ? 'delivered' : 'read');
    const message = {
      id,
      type,
      html,
      status,
      sender: msg.sender || '',
      timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date()
    };
    this.messages = [...this.messages, message];
    return id;
  }

  updateMessage(id, updates = {}) {
    let changed = false;
    this.messages = this.messages.map(m => {
      if(m.id !== id) return m;
      changed = true;
      const next = { ...m };
      if(updates.html !== undefined) next.html = sanitizeHtml(updates.html);
      if(updates.status !== undefined && STATUSES.has(updates.status)) next.status = updates.status;
      if(updates.sender !== undefined) next.sender = updates.sender;
      if(updates.timestamp instanceof Date) next.timestamp = updates.timestamp;
      return next;
    });
    return changed;
  }

  removeMessage(id) {
    const before = this.messages.length;
    this.messages = this.messages.filter(m => m.id !== id);
    return this.messages.length !== before;
  }

  clear() {
    this.messages = [];
  }

  send() {
    if(this.disabled) return null;
    const editor = this.shadowRoot?.querySelector('k-markdown-editor');
    if(!editor) return null;
    const markdown = (editor.value || '').trim();
    if(!markdown) return null;
    // breaks:true makes single newlines render as <br>, matching Slack /
    // iMessage convention where each typed Enter is a visible break.
    const safe = sanitizeHtml(renderMarkdown(markdown, { breaks: true }));
    const id = this.addMessage({
      type: 'outgoing',
      html: safe,
      status: this.#statusEnabled ? 'sending' : 'delivered'
    });
    editor.clear();
    this.dispatchEvent(new CustomEvent('send', {
      detail: { id, html: safe, markdown },
      bubbles: true
    }));
    return id;
  }

  /*
    Event Handlers
  */
  handleSendClick = () => this.send();

  handleEditorKeydown = (e) => {
    if(this.disabled) return;
    if(e.key !== 'Enter' || e.ctrlKey || e.metaKey || e.altKey) return;
    // Default (no enter-newline attr): Enter sends, Shift+Enter inserts a newline.
    // With enter-newline attr: Enter inserts a newline, Shift+Enter sends.
    const shouldSend = this.enterNewline ? e.shiftKey : !e.shiftKey;
    if(!shouldSend) return;
    e.preventDefault();
    this.send();
  };

  /*
    Utility
  */
  #scrollToBottom = () => {
    this.updateComplete.then(() => {
      const window = this.shadowRoot?.querySelector('.window');
      if(window) window.scrollTop = window.scrollHeight;
    });
  };

  /*
    Rendering
  */
  get #lastOutgoingId() {
    for(let i = this.messages.length - 1; i >= 0; i--){
      if(this.messages[i].type === 'outgoing') return this.messages[i].id;
    }
    return null;
  }

  get #statusEnabled() {
    return this.showStatus != null && this.showStatus !== 'false';
  }

  get #statusMode() {
    return this.showStatus === 'icons' ? 'icons' : 'text';
  }

  // iMessage convention: per-message status only appears on the most recent
  // outgoing message — older delivered/read messages don't carry an
  // indicator. Sending or failed always show, regardless of position, so
  // the user knows about in-flight or failed messages immediately.
  #shouldShowStatus(message, lastOutgoingId) {
    if(!this.#statusEnabled) return false;
    if(message.type !== 'outgoing') return false;
    if(message.status === 'sending' || message.status === 'failed') return true;
    return message.id === lastOutgoingId;
  }

  #renderStatus(status) {
    if(this.#statusMode === 'icons') return this.#renderStatusIcon(status);
    return this.#renderStatusText(status);
  }

  #renderStatusText(status) {
    if(status === 'sending'){
      return html`<span class="status sending"><k-spinner size="xs"></k-spinner> Sending&hellip;</span>`;
    }
    if(status === 'delivered'){
      return html`<span class="status">Delivered</span>`;
    }
    if(status === 'read'){
      return html`<span class="status">Read</span>`;
    }
    if(status === 'failed'){
      return html`<span class="status failed"><k-icon name="error"></k-icon> Not Delivered</span>`;
    }
    return nothing;
  }

  #renderStatusIcon(status) {
    if(status === 'sending'){
      return html`<span class="status status-icon-only"><k-spinner size="xs" title="Sending"></k-spinner></span>`;
    }
    if(status === 'delivered'){
      return html`<span class="status status-icon-only"><k-icon name="check" title="Delivered"></k-icon></span>`;
    }
    if(status === 'read'){
      return html`<span class="status status-icon-only"><k-icon name="done_all" title="Read"></k-icon></span>`;
    }
    if(status === 'failed'){
      return html`<span class="status status-icon-only failed"><k-icon name="error" title="Not Delivered"></k-icon></span>`;
    }
    return nothing;
  }

  #renderMessage(message, lastOutgoingId) {
    const showStatus = this.#shouldShowStatus(message, lastOutgoingId);
    return html`
      <div
        class="message ${message.type} ${message.status}"
        data-id=${message.id}
      >
        ${message.sender ? html`<div class="sender">${message.sender}</div>` : nothing}
        <div class="bubble">
          <div class="content" .innerHTML=${message.html}></div>
        </div>
        ${showStatus ? this.#renderStatus(message.status) : nothing}
      </div>
    `;
  }

  render() {
    const lastOutgoingId = this.#lastOutgoingId;
    return html`
      <div class="window" role="log" aria-live="polite">
        ${this.messages.map(m => this.#renderMessage(m, lastOutgoingId))}
      </div>
      <div class="input-area">
        <k-markdown-editor
          class="editor"
          placeholder=${this.placeholder}
          ?disabled=${this.disabled}
          @keydown=${this.handleEditorKeydown}
        >
          <div slot="controls-top" class="controls-top">
            <slot name="controls-top">
              <k-md-bold></k-md-bold>
              <k-md-italic></k-md-italic>
              <k-md-code></k-md-code>
              <k-md-link></k-md-link>
              <k-md-bullet-list></k-md-bullet-list>
              <k-md-numbered-list></k-md-numbered-list>
              <k-md-quote></k-md-quote>
            </slot>
          </div>
          <div slot="controls-bottom" class="controls-bottom">
            <slot name="controls-bottom"></slot>
            <button
              type="button"
              class="send-btn primary"
              ?disabled=${this.disabled}
              @click=${this.handleSendClick}
              aria-label="Send message"
              title="Send message"
            >
              <k-icon name="send"></k-icon>
            </button>
          </div>
        </k-markdown-editor>
      </div>
    `;
  }

  /*
    Styles
  */
  static styles = css`
    :host {
      --window_min_height: 16rem;
      --window_max_height: 32rem;
      --chat_padding: 0.5rem;
      --chat_gap: 0.5rem;
      --message_radius: 1rem;
      --message_max_width: 75%;
      --bubble_padding: 0.5rem 0.75rem;
      --bubble_bg__incoming: var(--c_bg__alt);
      --bubble_bg__outgoing: var(--c_primary);
      --bubble_tc__outgoing: white;
      --send_btn_bg: var(--c_primary);
      --send_btn_tc: white;

      display: flex;
      flex-direction: column;
      border: 1px solid var(--c_border);
      border-radius: var(--radius);
      background: var(--c_bg);
      /* Note: NO overflow:hidden on the host — that would clip the input
         area's focus shadow. Each child clips its own content against the
         shared rounded corners instead. */
    }
    :host([disabled]) {
      opacity: 0.6;
    }
    .window {
      flex: 1 1 auto;
      min-height: var(--window_min_height);
      max-height: var(--window_max_height);
      overflow-y: auto;
      padding: var(--chat_padding);
      display: flex;
      flex-direction: column;
      gap: var(--chat_gap);
      scroll-behavior: smooth;
      /* Match the chat's outer rounded corners on the top edge so messages
         don't render past them. */
      border-top-left-radius: var(--radius);
      border-top-right-radius: var(--radius);
    }
    .message {
      display: flex;
      flex-direction: column;
      max-width: var(--message_max_width);
      gap: 0.125rem;
    }
    .message.outgoing {
      align-self: flex-end;
      align-items: flex-end;
    }
    .message.incoming {
      align-self: flex-start;
      align-items: flex-start;
    }
    .sender {
      font-size: 0.75rem;
      color: var(--tc_muted);
    }
    .bubble {
      padding: var(--bubble_padding);
      border-radius: var(--message_radius);
      background: var(--bubble_bg__incoming);
      color: var(--tc);
      word-wrap: break-word;
      overflow-wrap: anywhere;
    }
    .message.outgoing .bubble {
      background: var(--bubble_bg__outgoing);
      color: var(--bubble_tc__outgoing);
    }
    .message.outgoing.sending .bubble {
      opacity: 0.7;
    }
    .message.outgoing.failed .bubble {
      background: var(--c_danger, #d32f2f);
    }
    .content {
      line-height: 1.4;
    }
    .content p:first-child { margin-top: 0; }
    .content p:last-child { margin-bottom: 0; }
    /* iMessage-style small grey label below the message bubble. */
    .status {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.7rem;
      color: var(--tc_muted);
      margin-top: 0.125rem;
    }
    .status.failed {
      color: var(--c_danger, #d32f2f);
    }
    .status k-spinner,
    .status k-icon {
      font-size: 0.8rem;
    }
    .status-icon-only {
      font-size: 0.95rem;
    }
    .input-area {
      position: relative;
      border-top: 1px solid var(--c_border);
      border-bottom-left-radius: var(--radius);
      border-bottom-right-radius: var(--radius);
    }
    .editor {
      /* Markdown editor fills the bottom of the chat. CSS custom properties
         pierce shadow boundaries -- '--height' sets the initial size of the
         editor's internal Resize wrapper. */
      --height: 13rem;
      display: block;
      width: 100%;
    }
    .controls-top,
    .controls-bottom {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.125rem;
    }
    .controls-bottom {
      width: 100%;
    }
    .send-btn {
      margin-left: auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 2rem;
      min-height: 2rem;
      padding: 0.25rem;
      border: 1px solid transparent;
      border-radius: 50%;
      background: var(--c_primary);
      color: white;
      cursor: pointer;
      transition: opacity var(--animation_ms);
    }
    .send-btn:hover:not(:disabled) {
      opacity: 0.9;
    }
    .send-btn:focus-visible {
      outline: none;
      box-shadow: var(--focus_shadow);
    }
    .send-btn:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  `;
}

customElements.define('k-chat', Chat);
