import { html, css, nothing } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';
import sanitizeHtml from '../utils/sanitizeHtml.js';
import renderMarkdown from '../utils/renderMarkdown.js';
import { isSupported, createSession } from '../utils/promptApi.js';
import { saveConversation, getConversation, listConversations, deleteConversation, renameConversation, titleOf, formatConversation } from '../utils/conversations.js';
import debounce from '../utils/debounce.js';
import './Spinner.js';
import './Resize.js';
import './Icon.js';

const newId = () => {
  if(typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'){
    return crypto.randomUUID();
  }
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const STATUSES = new Set(['sending', 'delivered', 'read', 'failed']);

const INPUTS = new Set(['markdown-editor', 'html-editor', 'markdown', 'text']);

const escapeHtml = text => Object.assign(document.createElement('div'), { textContent: text }).innerHTML;

const htmlToText = html => {
  const div = document.createElement('div');
  div.innerHTML = html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|li|h[1-6]|blockquote)>/gi, '\n');
  return div.textContent.trim();
};

export default class Chat extends ShadowComponent {
  static properties = {
    // What the user types in: "markdown-editor" (default: tabs, preview and a toolbar),
    // "html-editor" (rich text), "markdown" (a plain box whose text is markdown) or
    // "text" (a plain box, sent as it is).
    input: { type: String, reflect: true },
    // Turns off the drag handle that makes the "markdown-editor" input taller.
    // No drag handle by default. markdown-resize adds the handle under the "markdown-editor" input,
    // and resize adds one under the whole chat (the message window grows, the input stays).
    markdownResize: { type: Boolean, reflect: true, attribute: 'markdown-resize' },
    resize: { type: Boolean, reflect: true },
    enterNewline: { type: Boolean, reflect: true, attribute: 'enter-newline' },
    // show-status is a string attr: absent = off, "" or "text" = text labels,
    // "icons" = icon-only badges. <k-chat show-status> defaults to text mode.
    showStatus: { type: String, reflect: true, attribute: 'show-status' },
    placeholder: { type: String, reflect: true },
    // Records every step of the conversation with the model (kept with the conversation, so it
    // can be exported). debug="console" also prints it to the console.
    debug: { type: String, reflect: true },
    // Shown in the message area while there are no messages.
    emptyMessage: { type: String, reflect: true, attribute: 'empty-message' },
    disabled: { type: Boolean, reflect: true },
    // VERY EXPERIMENTAL, NOT USEFUL YET: prompt-api, promptTools and debug use the browser's tiny
    // built-in AI, which could not answer a single question correctly in testing.
    // prompt-api is a string attr: absent = off, "" = on with no system prompt,
    // any other value = URL of the file holding the system prompt, or several
    // URLs separated by whitespace (read in order and joined).
    promptApi: { type: String, reflect: true, attribute: 'prompt-api' },
    // Functions the model can call: [{ name, description, inputSchema, execute(args) }].
    promptTools: { attribute: false },
    // The messages are saved (IndexedDB) and come back after a reload. The value
    // names a group of conversations; the most recent one in the group is loaded.
    persistentId: { type: String, reflect: true, attribute: 'persistent-id' },
    conversationId: { attribute: false },
    slotted: { state: true },
    inputReady: { state: true },
    restored: { state: true },
    messages: { state: true }
  };

  #session = null;
  #generation = 0;
  #queue = Promise.resolve();
  #restoring = Promise.resolve();
  #loading = Promise.resolve();
  #debugLines = [];
  #customTitle = null;

  /*
    Lifecycle Callbacks
  */
  constructor() {
    super();
    this.input = 'markdown';
    this.inputReady = false;
    this.markdownResize = false;
    this.resize = false;
    // Default matches Slack/Discord/Messages: Enter sends, Shift+Enter newline.
    // Add the `enter-newline` attribute to invert (Enter inserts a newline,
    // Shift+Enter or the Send button submits).
    this.enterNewline = false;
    this.showStatus = null;
    this.placeholder = 'Type a message...';
    this.debug = null;
    this.emptyMessage = '';
    this.disabled = false;
    this.promptApi = null;
    this.promptTools = [];
    this.persistentId = null;
    this.conversationId = null;
    this.slotted = {};
    this.restored = false;
    this.messages = [];
  }

  connectedCallback() {
    super.connectedCallback();
    this.#loading = this.#loadInput();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#resetSession();
  }

  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    if(changedProperties.has('input') && this.hasUpdated) this.#loading = this.#loadInput();
  }

  // `await chat.updateComplete` also waits for the code of the chosen input.
  async getUpdateComplete() {
    await this.#loading;
    return super.getUpdateComplete();
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if(changedProperties.has('messages')){
      this.#scrollToBottom();
      this.#saveSoon();
    }
    if(changedProperties.has('persistentId') && this.persistentId){
      this.restored = false;
      this.#restoring = this.#restore();
    }
    if(changedProperties.has('promptApi') || changedProperties.has('promptTools')){
      this.#resetSession();
    }
    if(changedProperties.has('promptApi') && this.#promptApiEnabled && !isSupported()){
      this.addMessage({ type: 'incoming', html: 'The Prompt API is not available in this browser.', transient: true });
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
      // The source text, which is what the model is given as the conversation so far.
      markdown: msg.markdown || '',
      // A message that is not saved (a notice, or a reply still being written).
      transient: !!msg.transient,
      timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date()
    };
    this.messages = [...this.messages, message];
    this.dispatchEvent(new CustomEvent('message-add', { detail: { message }, bubbles: true }));
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
      if(updates.markdown !== undefined) next.markdown = updates.markdown;
      if(updates.transient !== undefined) next.transient = !!updates.transient;
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
    const id = this.conversationId;
    this.newConversation();
    if(this.persistentId && id) deleteConversation(id).catch(() => {});
  }

  // Starts an empty conversation. The one that was open stays saved.
  newConversation() {
    this.messages = [];
    this.conversationId = null;
    this.#customTitle = null;
    this.#debugLines = [];
    this.#setBlank(true);
    this.#resetSession();
    this.#announceConversation();
  }

  async loadConversation(id) {
    const record = await getConversation(id);
    if(!record) return false;
    this.#setBlank(false);
    this.#resetSession();
    this.conversationId = record.id;
    this.#customTitle = record.titleCustom ? record.title : null;
    this.#debugLines = [...(record.debug || [])];
    this.messages = this.#fromRecord(record);
    this.#announceConversation();
    // Saved at once (not after the usual short delay), so it is the one that opens on the next page.
    this.#save();
    return true;
  }

  // The saved conversations in this chat's group, newest first: [{ id, title, createdAt, updatedAt }]
  listConversations() {
    return listConversations(this.persistentId);
  }

  // Gives a saved conversation a title of your choice (empty: the automatic one again).
  async renameConversation(id, title) {
    const renamed = await renameConversation(id, title);
    if(renamed && id === this.conversationId) this.#customTitle = String(title).trim() || null;
    return renamed;
  }

  // A conversation (the open one as it is right now) with the record of what happened with the
  // model, as one text to save to a file. Resolves with null if there is no such conversation.
  async exportConversation(id = this.conversationId) {
    const record = id === this.conversationId
      ? {
        id: id || '(not saved yet)',
        group: this.persistentId || '',
        title: this.#customTitle ?? titleOf(this.messages),
        titleCustom: !!this.#customTitle,
        debug: this.#debugLines,
        messages: this.messages,
        createdAt: this.messages[0]?.timestamp,
        updatedAt: new Date()
      }
      : await getConversation(id);
    return record ? formatConversation(record, { page: location.href, browser: navigator.userAgent }) : null;
  }

  async deleteConversation(id) {
    await deleteConversation(id);
    if(id === this.conversationId) this.newConversation();
  }

  // Everything recorded so far for this conversation with `debug`, as one text.
  get debugLog() {
    return this.#debugLines.join('\n');
  }

  focus(options) {
    this.updateComplete.then(() => this.#inputElement?.focus(options));
  }

  // With `text`, sends that instead of what is in the input (which is left alone).
  send(text) {
    if(this.disabled) return null;
    const { markdown, html: safe } = this.#readInput(text);
    if(!markdown) return null;
    const id = this.addMessage({
      type: 'outgoing',
      html: safe,
      markdown,
      status: this.#statusEnabled ? 'sending' : 'delivered'
    });
    if(text === undefined) this.#clearInput();
    this.dispatchEvent(new CustomEvent('send', {
      detail: { id, html: safe, markdown },
      bubbles: true
    }));
    if(this.#promptApiEnabled){
      this.#queue = this.#queue.then(() => this.#respond(id, markdown));
    }
    return id;
  }

  /*
    Event Handlers
  */
  handleSendClick = () => this.send();

  // The rows for the controls slots only show while something is in them.
  handleSlotChange = e => {
    const slot = e.currentTarget;
    const has = slot.assignedNodes({ flatten: true }).some(node => node.nodeType === 1 || node.textContent.trim());
    if(!!this.slotted[slot.name] !== has) this.slotted = { ...this.slotted, [slot.name]: has };
  };

  handleTextareaInput = e => {
    e.currentTarget.style.height = 'auto';
    e.currentTarget.style.height = `${e.currentTarget.scrollHeight + e.currentTarget.offsetHeight - e.currentTarget.clientHeight}px`;
  };

  handleEditorKeydown = (e) => {
    if(this.disabled || e.isComposing) return;
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
  get #inputType() {
    return INPUTS.has(this.input) ? this.input : 'markdown';
  }

  get #inputElement() {
    return this.shadowRoot?.querySelector('.input');
  }

  // The editors are only loaded when they are the chosen input.
  #loadInput = async () => {
    this.inputReady = false;
    try {
      if(this.#inputType === 'html-editor') await import('./HtmlEditor.js');
      if(this.#inputType === 'markdown-editor') await Promise.all([
        import('./MarkdownEditor.js'),
        import('./controls/Bold.js'),
        import('./controls/Italic.js'),
        import('./controls/InlineCode.js'),
        import('./controls/MdLink.js'),
        import('./controls/BulletList.js'),
        import('./controls/NumberList.js'),
        import('./controls/Quote.js')
      ]);
    } catch(error){
      console.error(error);
    } finally {
      this.inputReady = true;
    }
  };

  // What was typed, as { markdown, html }. For "html-editor", `markdown` is the text without the formatting.
  #readInput = value => {
    value ??= this.#inputElement?.value ?? '';
    if(this.#inputType === 'html-editor'){
      const html = sanitizeHtml(value);
      return { markdown: htmlToText(html), html };
    }
    const markdown = value.trim();
    if(this.#inputType === 'text') return { markdown, html: `<p>${escapeHtml(markdown).replace(/\n/g, '<br>')}</p>` };
    // breaks:true makes single newlines render as <br>, matching Slack /
    // iMessage convention where each typed Enter is a visible break.
    return { markdown, html: sanitizeHtml(renderMarkdown(markdown, { breaks: true })) };
  };

  #clearInput = () => {
    const input = this.#inputElement;
    if(typeof input.clear === 'function') return input.clear();
    input.value = '';
    input.style.height = '';
  };

  get #promptApiEnabled() {
    return this.promptApi != null && this.promptApi !== 'false';
  }

  // Ending the session also makes any reply still streaming stop quietly.
  // "New conversation" stays the open one when the page changes (until a message is sent, or another
  // conversation is opened), for as long as the tab lives. Storage can be blocked, then it is forgotten.
  get #blankKey() {
    return `k-chat-blank:${this.persistentId}`;
  }

  get #isBlank() {
    try {
      return sessionStorage.getItem(this.#blankKey) === '1';
    } catch(error){
      return false;
    }
  }

  #setBlank = on => {
    if(!this.persistentId) return;
    try {
      if(on) sessionStorage.setItem(this.#blankKey, '1');
      else sessionStorage.removeItem(this.#blankKey);
    } catch(error){}
  };

  get #debugOn() {
    return this.debug != null && this.debug !== 'false';
  }

  #log = text => {
    if(!this.#debugOn) return;
    const line = `[k-chat ${new Date().toISOString().slice(11, 23)}] ${text}`;
    this.#debugLines.push(line);
    if(this.debug === 'console') console.log(line);
  };

  #resetSession = () => {
    this.#generation++;
    if(this.#session) this.#log('SESSION ENDED: the model forgets the conversation so far.');
    this.#session?.destroy();
    this.#session = null;
  };

  // Never rejects: failures are shown in the chat and fired as `error`.
  #respond = async (id, markdown) => {
    const generation = this.#generation;
    const started = performance.now();
    this.#log(`USER MESSAGE (${this.#inputType} input, conversation ${this.conversationId || 'not saved yet'}):\n${markdown}`);
    if(this.#session) this.#log('Using the existing model session, which remembers the conversation so far.');
    const replyId = this.addMessage({ type: 'incoming', sender: 'Assistant', html: '<em>Thinking&hellip;</em>', transient: true });
    try {
      this.#session ??= await createSession({
        onLog: this.#debugOn ? this.#log : undefined,
        history: this.messages
          .slice(0, this.messages.findIndex(m => m.id === id))
          .filter(m => m.markdown && m.status !== 'failed')
          .map(m => ({ role: m.type === 'outgoing' ? 'user' : 'assistant', content: m.markdown })),
        path: (this.promptApi || '').split(/\s+/).filter(Boolean),
        tools: this.promptTools.map(tool => ({
          ...tool,
          execute: async args => {
            const result = await tool.execute(args);
            this.dispatchEvent(new CustomEvent('tool-call', {
              detail: { name: tool.name, arguments: args, result },
              bubbles: true
            }));
            return result;
          }
        })),
        onDownloadProgress: loaded => this.updateMessage(replyId, {
          html: `<em>Downloading the model&hellip; ${Math.round(loaded * 100)}%</em>`
        })
      });
      if(generation !== this.#generation) return;
      this.updateMessage(id, { status: 'delivered' });
      let text = '';
      for await(const chunk of this.#session.promptStreaming(markdown)){
        if(generation !== this.#generation) return;
        text += chunk;
        this.updateMessage(replyId, { html: renderMarkdown(text, { breaks: true }) });
      }
      this.updateMessage(id, { status: 'read' });
      this.updateMessage(replyId, { markdown: text, transient: false });
      this.#log(`ANSWER SHOWN IN THE CHAT (took ${((performance.now() - started) / 1000).toFixed(1)}s):\n${text}`);
      this.dispatchEvent(new CustomEvent('response', {
        detail: { id: replyId, markdown: text, html: this.messages.find(m => m.id === replyId)?.html },
        bubbles: true
      }));
    } catch(error){
      if(generation !== this.#generation) return;
      this.#log(`ERROR: ${error.stack || error.message}`);
      this.updateMessage(id, { status: 'failed' });
      this.updateMessage(replyId, { html: `<em>${sanitizeHtml(error.message)}</em>` });
      this.dispatchEvent(new CustomEvent('error', { detail: { error }, bubbles: true }));
    }
  };

  #announceConversation = () => this.dispatchEvent(new CustomEvent('conversation-change', {
    detail: { id: this.conversationId },
    bubbles: true
  }));

  // Storage can be missing or blocked (private windows); the chat then works without saving.
  #save = async () => {
    await this.#restoring;
    const messages = this.messages.filter(m => !m.transient);
    if(!this.persistentId || !messages.length) return;
    this.conversationId ??= newId();
    try {
      await saveConversation({
        id: this.conversationId,
        group: this.persistentId,
        title: this.#customTitle ?? titleOf(messages),
        titleCustom: !!this.#customTitle,
        debug: [...this.#debugLines],
        messages
      });
      this.#setBlank(false);
      this.dispatchEvent(new CustomEvent('conversation-save', {
        detail: { id: this.conversationId },
        bubbles: true
      }));
    } catch(error){}
  };

  // A message still sending when the page went away will never be delivered.
  #fromRecord = record => record.messages.map(m => ({
    ...m,
    html: sanitizeHtml(m.html),
    status: m.status === 'sending' ? 'failed' : m.status
  }));

  #saveSoon = debounce(() => this.#save(), 300);

  #restore = async () => {
    try {
      if(this.#isBlank) return;
      const [latest] = await listConversations(this.persistentId);
      const record = latest && await getConversation(latest.id);
      if(!record || this.conversationId) return;
      this.conversationId = record.id;
      this.#customTitle = record.titleCustom ? record.title : null;
      this.#debugLines = [...(record.debug || []), ...this.#debugLines];
      this.messages = [...this.#fromRecord(record), ...this.messages];
      this.#announceConversation();
    } catch(error){} finally {
      this.restored = true;
    }
  };

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

  #renderSendButton = () => html`
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
  `;

  #renderSlot = (name, className) => html`
    <div class=${className} ?hidden=${!this.slotted[name]}>
      <slot name=${name} @slotchange=${this.handleSlotChange}></slot>
    </div>
  `;

  #renderInput() {
    // The editor's toolbar controls check, once, that their editor has the methods they need. So the
    // editor is only rendered after its modules are loaded, or the controls would stay disabled.
    if(this.#inputType === 'markdown-editor' && !this.inputReady) return nothing;
    if(this.#inputType === 'html-editor') return html`
      ${this.#renderSlot('controls-top', 'slot-row top')}
      <k-html-editor
        class="input editor"
        controls="minimal"
        ?disabled=${this.disabled}
        @keydown=${this.handleEditorKeydown}
      ></k-html-editor>
      <div class="footer">
        <slot name="controls-bottom"></slot>
        ${this.#renderSendButton()}
      </div>
    `;
    if(this.#inputType !== 'markdown-editor') return html`
      ${this.#renderSlot('controls-top', 'slot-row top')}
      <div class="simple">
        <textarea
          class="input"
          rows="2"
          placeholder=${this.placeholder}
          aria-label=${this.placeholder}
          ?disabled=${this.disabled}
          @keydown=${this.handleEditorKeydown}
          @input=${this.handleTextareaInput}
        ></textarea>
        <div class="side">
          ${this.#renderSlot('controls-side', 'slot-col')}
          ${this.#renderSendButton()}
        </div>
      </div>
      ${this.#renderSlot('controls-bottom', 'slot-row bottom')}
    `;
    return html`
        <k-markdown-editor
          class="input editor"
          placeholder=${this.placeholder}
          ?disabled=${this.disabled}
          ?no-resize=${!this.markdownResize}
          @keydown=${this.handleEditorKeydown}
        >
          <div slot="controls-top" class="controls-top">
            <slot name="controls-top">
              <kc-bold></kc-bold>
              <kc-italic></kc-italic>
              <kc-inline-code></kc-inline-code>
              <kc-md-link></kc-md-link>
              <kc-bullet-list></kc-bullet-list>
              <kc-number-list></kc-number-list>
              <kc-quote></kc-quote>
            </slot>
          </div>
          <div slot="controls-bottom" class="controls-bottom">
            <slot name="controls-bottom"></slot>
            ${this.#renderSendButton()}
          </div>
        </k-markdown-editor>
    `;
  }

  #renderBody = () => {
    const lastOutgoingId = this.#lastOutgoingId;
    return html`
      ${this.#promptApiEnabled ? html`<div class="disclaimer" role="note">Very experimental: this uses the tiny AI built into the browser, and its answers are often wrong.</div>` : nothing}
      <div class="window" role="log" aria-live="polite">
        ${!this.messages.length && this.emptyMessage && (!this.persistentId || this.restored) ? html`<div class="empty">${this.emptyMessage}</div>` : nothing}
        ${this.messages.map(m => this.#renderMessage(m, lastOutgoingId))}
      </div>
      <div class="input-area">
        ${this.#renderInput()}
      </div>
    `;
  };

  render() {
    if(!this.resize) return this.#renderBody();
    return html`<k-resize dimension="height"><div class="resizable">${this.#renderBody()}</div></k-resize>`;
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
      --input_max_height: 10rem;
      --code_bg: color-mix(in srgb, var(--tc) 12%, transparent);
      --code_bg__outgoing: rgba(0, 0, 0, 0.25);

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
    .disclaimer {
      padding: 0.25rem 0.5rem;
      border-top-left-radius: var(--radius);
      border-top-right-radius: var(--radius);
      background: var(--c_danger);
      color: var(--tc_on_danger, white);
      font-size: 0.75rem;
      text-align: center;
    }
    /* resize: the whole chat has a handle under it, and the message window takes the space */
    k-resize {
      width: 100%;
      height: var(--chat_height, 24rem);
      min-height: 12rem;
    }
    .resizable {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
    }
    .resizable .window {
      flex: 1 1 0;
      min-height: 0;
      max-height: none;
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
    .empty {
      margin: auto;
      padding: 1rem;
      text-align: center;
      color: var(--tc_muted);
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
    /* The bubble already has the alt background, so code gets its own tint and a border to stand out from it. */
    .content code {
      background: var(--code_bg);
      border: 1px solid var(--c_border);
    }
    .content pre {
      margin: 0.5rem 0;
    }
    .content pre:first-child { margin-top: 0; }
    .content pre:last-child { margin-bottom: 0; }
    .message.outgoing .content code {
      background: var(--code_bg__outgoing);
      border-color: rgba(255, 255, 255, 0.35);
      color: inherit;
    }
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
    [hidden] {
      display: none !important;
    }
    .slot-row,
    .slot-col,
    .side {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .slot-row {
      flex-wrap: wrap;
      padding: 0.5rem 0.5rem 0;
    }
    .slot-row.bottom {
      padding: 0 0.5rem 0.5rem;
    }
    .slot-col,
    .side {
      flex-direction: column;
    }
    .slot-col slot::slotted(*) {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 2rem;
      min-height: 2rem;
      padding: 0 0.25rem;
      border: 0;
      border-radius: var(--radius);
      background: transparent;
      color: inherit;
      font: inherit;
      text-decoration: none;
      cursor: pointer;
    }
    .slot-col slot::slotted(*:hover) {
      background: var(--c_border);
    }
    .simple,
    .footer {
      display: flex;
      align-items: flex-end;
      gap: 0.5rem;
      padding: 0.5rem;
    }
    .footer {
      align-items: center;
      padding-top: 0.25rem;
    }
    textarea.input {
      flex: 1 1 auto;
      box-sizing: border-box;
      min-width: 0;
      height: auto;
      min-height: 0;
      max-height: var(--input_max_height);
      margin: 0;
      resize: none;
      overflow-y: auto;
      line-height: 1.4;
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
      padding: var(--spacer_q);
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
