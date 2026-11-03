import { html, css, nothing } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';
import './Chat.js';
import './Icon.js';

/*
  Utility Functions
*/
const forwardedEvents = ['send', 'response', 'error', 'tool-call', 'message-add', 'conversation-change', 'conversation-save'];

export default class ChatBubble extends ShadowComponent {
  /*
    Reactive Properties / Attributes
  */
  static properties = {
    position: { type: String, reflect: true },
    open: { type: Boolean, reflect: true },
    allowFullscreen: { type: Boolean, reflect: true, attribute: 'allow-fullscreen' },
    fullscreen: { type: Boolean, reflect: true },
    unread: { type: Boolean, reflect: true },
    heading: { type: String },
    input: { type: String },
    promptApi: { type: String, attribute: 'prompt-api' },
    promptTools: { attribute: false },
    persistentId: { type: String, attribute: 'persistent-id' },
    placeholder: { type: String },
    debug: { type: String },
    emptyMessage: { type: String, attribute: 'empty-message' },
    showStatus: { type: String, attribute: 'show-status' },
    enterNewline: { type: Boolean, attribute: 'enter-newline' },
    disabled: { type: Boolean },
    hasTopControls: { state: true },
    view: { state: true },
    conversations: { state: true },
    renamingId: { state: true }
  };

  #chose = false;
  #restoredOpen = false;
  #silent = false;

  /*
    Constructor
  */
  constructor() {
    super();
    this.position = 'bottom right';
    this.open = false;
    this.allowFullscreen = false;
    this.fullscreen = false;
    this.unread = false;
    this.heading = '';
    this.input = 'markdown';
    this.promptApi = null;
    this.promptTools = [];
    this.persistentId = null;
    this.placeholder = 'Type a message...';
    this.debug = null;
    this.emptyMessage = '';
    this.showStatus = null;
    this.enterNewline = false;
    this.disabled = false;
    this.hasTopControls = false;
    this.view = 'chat';
    this.conversations = [];
    this.renamingId = null;
  }

  /*
    Lifecycle Callbacks
  */
  firstUpdated() {
    forwardedEvents.forEach(type => this.chat.addEventListener(type, this.handleChatEvent));
  }

  // Setting `open` here is part of the same update, so reopening is one pass.
  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    if(!this.#restoredOpen && this.persistentId){
      this.#restoredOpen = true;
      if(['1', 'full'].includes(this.#storedOpen) && !this.open){
        this.#silent = true;
        this.open = true;
        if(this.#storedOpen === 'full' && this.allowFullscreen) this.fullscreen = true;
      }
    }
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if(this.open && this.unread) this.unread = false;
    if(!this.allowFullscreen && this.fullscreen) this.fullscreen = false;
    if(this.#restoredOpen && (changedProperties.has('open') || changedProperties.has('fullscreen'))) this.#storeOpen();
    if(changedProperties.get('fullscreen') !== undefined && changedProperties.has('fullscreen')){
      this.dispatchEvent(new CustomEvent('fullscreen-change', { detail: { fullscreen: this.fullscreen }, bubbles: true }));
    }
    if(changedProperties.has('open')){
      if(this.open) this.#handleOpen();
      else if(changedProperties.get('open')) this.dispatchEvent(new CustomEvent('close'));
    }
  }

  /*
    Protected Members
  */
  // The `<k-chat>` inside the popup: use it to add messages, listen to events, and so on.
  get chat() {
    return this.shadowRoot?.querySelector('k-chat');
  }

  /*
    Public Methods
  */
  show() {
    this.open = true;
  }

  hide() {
    this.open = false;
  }

  toggle() {
    this.open = !this.open;
  }

  toggleFullscreen() {
    if(this.allowFullscreen) this.fullscreen = !this.fullscreen;
  }

  // Saves a conversation (with the record of what happened with the model) as a text file.
  async downloadConversation(id) {
    const text = await this.chat.exportConversation(id);
    if(text === null) return false;
    const title = this.conversations.find(c => c.id === id)?.title || this.chat.conversationId === id && 'chat' || 'conversation';
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    const link = Object.assign(document.createElement('a'), {
      href: url,
      download: `kempo-chat-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'conversation'}-${new Date().toISOString().slice(0, 19).replace(/\D/g, '')}.txt`
    });
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  }

  async showConversations() {
    this.conversations = await this.chat.listConversations().catch(() => []);
    this.view = 'conversations';
  }

  /*
    Utility
  */
  #focusEditor = async () => {
    await this.updateComplete;
    this.chat?.focus();
  };

  // Whether the popup was open is kept for the tab, so it stays open when the page changes.
  // Storage can be blocked, then it simply starts closed.
  get #storedOpen() {
    try {
      return sessionStorage.getItem(`k-chat-bubble:${this.persistentId}`);
    } catch(error){
      return null;
    }
  }

  #storeOpen = () => {
    if(!this.persistentId) return;
    try {
      sessionStorage.setItem(`k-chat-bubble:${this.persistentId}`, this.open ? (this.fullscreen ? 'full' : '1') : '0');
    } catch(error){}
  };

  // The first time it opens, offer the saved conversations (if there are any) before the chat.
  #handleOpen = async () => {
    this.dispatchEvent(new CustomEvent('open'));
    // Reopened after a page change: back in the chat, without taking the focus.
    if(this.#silent){
      this.#silent = false;
      this.#chose = true;
      return;
    }
    if(this.#chose || !this.persistentId) return this.#focusEditor();
    this.#chose = true;
    await this.showConversations();
    if(this.conversations.length) return;
    this.view = 'chat';
    this.#focusEditor();
  };

  /*
    Event Handlers
  */
  handleChatEvent = e => {
    this.dispatchEvent(new CustomEvent(e.type, { detail: e.detail, bubbles: true }));
    const arrived = e.type === 'response' || (e.type === 'message-add' && e.detail.message.type === 'incoming' && !e.detail.message.transient);
    if(arrived && !this.open) this.unread = true;
  };

  handleTopSlotChange = e => {
    this.hasTopControls = e.currentTarget.assignedNodes().some(node => node.nodeType === 1 || node.textContent.trim());
  };

  handleFabClick = () => this.toggle();

  handleFullscreenClick = () => this.toggleFullscreen();

  // Escape leaves full screen first, then minimizes.
  handleKeydown = e => {
    if(e.key !== 'Escape') return;
    if(this.fullscreen) return void (this.fullscreen = false);
    this.hide();
    this.shadowRoot.querySelector('.fab').focus();
  };

  handleShowConversations = () => this.showConversations();

  handleBack = () => {
    this.view = 'chat';
    this.#focusEditor();
  };

  handleNew = () => {
    this.chat.newConversation();
    this.view = 'chat';
    this.#focusEditor();
  };

  handleContinue = async e => {
    await this.chat.loadConversation(e.currentTarget.dataset.id);
    this.view = 'chat';
    this.#focusEditor();
  };

  handleExport = e => this.downloadConversation(e.currentTarget.dataset.id);

  handleRename = async e => {
    this.renamingId = e.currentTarget.dataset.id;
    await this.updateComplete;
    const input = this.shadowRoot.querySelector('.rename-input');
    input?.focus();
    input?.select();
  };

  // Enter and leaving the box save the name, Escape does not (and does not minimize the chat).
  handleRenameKeydown = e => {
    if(e.key === 'Escape'){
      e.stopPropagation();
      this.renamingId = null;
    }
    if(e.key === 'Enter') e.currentTarget.blur();
  };

  handleRenameCommit = async e => {
    const { id } = e.currentTarget.dataset;
    const { value } = e.currentTarget;
    if(this.renamingId !== id) return;
    this.renamingId = null;
    await this.chat.renameConversation(id, value);
    await this.showConversations();
  };

  // The dialog is only loaded when something is deleted. A lit template, so the title is shown as text.
  handleDelete = async e => {
    const { id } = e.currentTarget.dataset;
    const title = this.conversations.find(c => c.id === id)?.title || 'Empty conversation';
    const { default: Dialog } = await import('./Dialog.js');
    Dialog.confirm(html`<p class="p">Delete &ldquo;${title}&rdquo;? This cannot be undone.</p>`, async confirmed => {
      if(!confirmed) return;
      await this.chat.deleteConversation(id);
      await this.showConversations();
      if(!this.conversations.length) this.view = 'chat';
    }, {
      title: 'Delete conversation',
      confirmText: 'Delete',
      confirmClasses: 'danger ml',
      cancelText: 'Cancel',
      cancelClasses: ''
    });
  };

  /*
    Rendering
  */
  render() {
    const unread = this.unread && !this.open;
    const showHeader = this.heading || this.persistentId || this.hasTopControls || this.allowFullscreen;
    return html`
      <button
        type="button"
        class="no-btn fab ${unread ? 'unread' : ''}"
        aria-label="${this.open ? 'Minimize' : 'Open'} ${this.heading || 'chat'}${unread ? ' (unread message)' : ''}"
        aria-expanded=${this.open ? 'true' : 'false'}
        aria-controls="panel"
        @click=${this.handleFabClick}
      >
        ${this.open
          ? html`<k-icon name="chevron" direction=${this.position.includes('top') ? 'up' : 'down'}></k-icon>`
          : unread
            ? html`<k-icon name="mark_chat_unread"></k-icon>`
            : html`<k-icon name="chat_bubble"></k-icon>`}
      </button>
      <div id="panel" class="panel" role="dialog" aria-label=${this.heading || 'Chat'} @keydown=${this.handleKeydown}>
        <div class="header" ?hidden=${!showHeader}>
          <span class="heading">${this.heading}</span>
          <slot name="controls-top" @slotchange=${this.handleTopSlotChange}></slot>
          ${this.persistentId ? html`
            <button type="button" class="no-btn head-btn" title="Conversations" aria-label="Conversations" @click=${this.handleShowConversations}>
              <k-icon name="format_list_bulleted"></k-icon>
            </button>
            <button type="button" class="no-btn head-btn" title="New conversation" aria-label="New conversation" @click=${this.handleNew}>
              <k-icon name="add"></k-icon>
            </button>
          ` : nothing}
          ${this.allowFullscreen ? html`
            <button
              type="button"
              class="no-btn head-btn fullscreen-btn"
              title=${this.fullscreen ? 'Exit full screen' : 'Full screen'}
              aria-label=${this.fullscreen ? 'Exit full screen' : 'Full screen'}
              aria-pressed=${this.fullscreen ? 'true' : 'false'}
              @click=${this.handleFullscreenClick}
            >
              <k-icon name=${this.fullscreen ? 'fullscreen_exit' : 'fullscreen'}></k-icon>
            </button>
          ` : nothing}
        </div>
        <div class="body">
          <k-chat
            class="chat"
            prompt-api=${this.promptApi ?? nothing}
            persistent-id=${this.persistentId ?? nothing}
            show-status=${this.showStatus ?? nothing}
            input=${this.input}
            placeholder=${this.placeholder}
            empty-message=${this.emptyMessage}
            ?enter-newline=${this.enterNewline}
            debug=${this.debug ?? nothing}
            ?disabled=${this.disabled}
            .promptTools=${this.promptTools}
          >
            ${this.input === 'markdown-editor' ? html`
              <kc-bold slot="controls-top"></kc-bold>
              <kc-italic slot="controls-top"></kc-italic>
              <kc-inline-code slot="controls-top"></kc-inline-code>
              <kc-md-link slot="controls-top"></kc-md-link>
            ` : nothing}
            <slot name="controls-side" slot="controls-side"></slot>
            <slot name="controls-bottom" slot="controls-bottom"></slot>
          </k-chat>
          ${this.view === 'conversations' ? html`
            <div class="conversations">
              <button type="button" class="primary new-btn" @click=${this.handleNew}>
                <k-icon name="add"></k-icon> New conversation
              </button>
              <ul class="list">
                ${this.conversations.map(c => html`
                  <li class="row ${c.id === this.chat?.conversationId ? 'current' : ''}">
                    ${this.renamingId === c.id ? html`
                      <input
                        class="rename-input"
                        data-id=${c.id}
                        .value=${c.title}
                        placeholder="Conversation name"
                        aria-label="Conversation name"
                        @keydown=${this.handleRenameKeydown}
                        @blur=${this.handleRenameCommit}
                      >
                    ` : html`
                      <button type="button" class="no-btn row-main" data-id=${c.id} @click=${this.handleContinue}>
                        <span class="row-title">${c.title || 'Empty conversation'}</span>
                        <span class="row-date">${new Date(c.updatedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </button>
                      <div class="row-actions">
                        <button type="button" class="no-btn row-action row-rename" data-id=${c.id} aria-label="Rename conversation" title="Rename conversation" @click=${this.handleRename}><k-icon name="edit"></k-icon></button>
                        <button type="button" class="no-btn row-action row-export" data-id=${c.id} aria-label="Export conversation" title="Export conversation (a text file with the messages and what happened with the model)" @click=${this.handleExport}><k-icon name="download"></k-icon></button>
                        <button type="button" class="no-btn row-action row-delete" data-id=${c.id} aria-label="Delete conversation" title="Delete conversation" @click=${this.handleDelete}><k-icon name="delete"></k-icon></button>
                      </div>
                    `}
                  </li>
                `)}
              </ul>
              <button type="button" class="no-btn back-btn" @click=${this.handleBack}>Back to the chat</button>
            </div>
          ` : nothing}
        </div>
      </div>
    `;
  }

  static styles = css`
    :host {
      --chat_bubble_size: 3.5rem;
      --chat_bubble_offset: 1.5rem;
      --chat_bubble_width: 24rem;
      --chat_bubble_height: 34rem;
      position: fixed;
      bottom: var(--chat_bubble_offset);
      right: var(--chat_bubble_offset);
      z-index: 70;
      display: block;
    }
    :host([position*="top"]) {
      top: var(--chat_bubble_offset);
      bottom: auto;
    }
    :host([position*="left"]) {
      right: auto;
      left: var(--chat_bubble_offset);
    }
    .fab {
      display: flex;
      align-items: center;
      justify-content: center;
      width: var(--chat_bubble_size);
      height: var(--chat_bubble_size);
      padding: 0;
      border: 0;
      border-radius: 50%;
      background-color: var(--c_primary);
      color: var(--tc_on_primary, white);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      cursor: pointer;
      transition: filter var(--animation_ms), box-shadow var(--animation_ms);
    }
    .fab:hover {
      filter: brightness(1.1);
    }
    .fab:focus-visible {
      outline: none;
      box-shadow: var(--focus_shadow), 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    .fab k-icon {
      font-size: calc(var(--chat_bubble_size) / 2);
      animation: icon-in calc(var(--animation_ms) / 2) ease-out;
    }
    .fab.unread {
      animation: attention-color 1.6s ease-in-out infinite, wiggle 1.6s ease-in-out infinite;
    }
    @keyframes icon-in {
      from { opacity: 0; transform: rotate(-90deg) scale(0.6); }
    }
    @keyframes attention-color {
      0%, 100% { background-color: var(--c_primary); }
      50% { background-color: var(--c_danger); }
    }
    @keyframes wiggle {
      0%, 45%, 100% { transform: rotate(0); }
      5% { transform: rotate(-16deg); }
      10% { transform: rotate(16deg); }
      15% { transform: rotate(-12deg); }
      20% { transform: rotate(12deg); }
      25% { transform: rotate(-8deg); }
      30% { transform: rotate(8deg); }
      35% { transform: rotate(-4deg); }
      40% { transform: rotate(4deg); }
    }
    @media (prefers-reduced-motion: reduce) {
      .fab.unread {
        animation: attention-color 2.4s ease-in-out infinite;
      }
      .fab k-icon {
        animation: none;
      }
    }
    .panel {
      position: absolute;
      bottom: calc(100% + 0.75rem);
      right: 0;
      display: flex;
      flex-direction: column;
      width: min(var(--chat_bubble_width), calc(100vw - 2 * var(--chat_bubble_offset)));
      height: min(var(--chat_bubble_height), calc(100vh - var(--chat_bubble_size) - 2.75rem - 2 * var(--chat_bubble_offset)));
      overflow: hidden;
      border: 1px solid var(--c_border);
      border-radius: calc(var(--radius) * 2);
      background: var(--c_bg);
      color: var(--tc);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      visibility: hidden;
      opacity: 0;
      transform: translateY(0.5rem) scale(0.98);
      transform-origin: bottom right;
      transition: opacity var(--animation_ms), transform var(--animation_ms), visibility 0s linear var(--animation_ms);
    }
    :host([position*="top"]) .panel {
      top: calc(100% + 0.75rem);
      bottom: auto;
      transform: translateY(-0.5rem) scale(0.98);
      transform-origin: top right;
    }
    :host([position*="left"]) .panel {
      right: auto;
      left: 0;
      transform-origin: bottom left;
    }
    :host([position*="top"][position*="left"]) .panel {
      transform-origin: top left;
    }
    :host([open]) .panel {
      visibility: visible;
      opacity: 1;
      transform: none;
      transition-delay: 0s;
    }
    /* Full screen: as big as the window allows, one spacer from its edges, and clear of the button. */
    :host([fullscreen]) .panel {
      position: fixed;
      top: var(--spacer, 1rem);
      right: var(--spacer, 1rem);
      bottom: calc(var(--chat_bubble_offset) + var(--chat_bubble_size) + 0.75rem);
      left: var(--spacer, 1rem);
      width: auto;
      height: auto;
    }
    :host([fullscreen][position*="top"]) .panel {
      top: calc(var(--chat_bubble_offset) + var(--chat_bubble_size) + 0.75rem);
      bottom: var(--spacer, 1rem);
    }
    [hidden] {
      display: none !important;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.5rem 0.25rem 0.75rem;
      border-bottom: 1px solid var(--c_border);
      background: var(--c_bg__alt);
    }
    .heading {
      flex: 1 1 auto;
      font-weight: bold;
    }
    .head-btn,
    .row-action {
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
      cursor: pointer;
    }
    .header slot::slotted(*) {
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
    .header slot::slotted(*:hover),
    .head-btn:hover,
    .row-action:hover,
    .row-main:hover {
      background: var(--c_border);
    }
    .head-btn:focus-visible,
    .row-action:focus-visible,
    .row-main:focus-visible,
    .back-btn:focus-visible {
      outline: none;
      box-shadow: var(--focus_shadow);
    }
    .body {
      position: relative;
      display: flex;
      flex: 1 1 auto;
      flex-direction: column;
      min-height: 0;
    }
    .chat {
      --window_min_height: 6rem;
      --window_max_height: none;
      --height: 7rem;
      --input_max_height: 7rem;
      flex: 1 1 0;
      min-height: 0;
      border: 0;
      border-radius: 0;
    }
    .conversations {
      position: absolute;
      inset: 0;
      z-index: 2;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      overflow-y: auto;
      padding: 0.75rem;
      background: var(--c_bg);
    }
    .new-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;
    }
    .list {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .row {
      display: flex;
      flex-wrap: nowrap;
      margin: 0;
      align-items: center;
      border: 1px solid var(--c_border);
      border-radius: var(--radius);
    }
    .row.current {
      border-color: var(--c_primary);
    }
    .row-main {
      display: flex;
      flex: 1 1 auto;
      flex-direction: column;
      align-items: flex-start;
      min-width: 0;
      padding: 0.5rem 0.75rem;
      border: 0;
      border-radius: var(--radius);
      background: transparent;
      color: inherit;
      text-align: left;
      cursor: pointer;
    }
    .row-title {
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .row-date {
      font-size: 0.75rem;
      color: var(--tc_muted);
    }
    .row-actions {
      display: flex;
      align-items: center;
      gap: 0.125rem;
      margin-right: 0.25rem;
    }
    .rename-input {
      flex: 1 1 auto;
      min-width: 0;
      margin: 0.25rem;
    }
    .back-btn {
      align-self: center;
      margin-top: auto;
      padding: 0.25rem 0.5rem;
      border: 0;
      border-radius: var(--radius);
      background: transparent;
      color: var(--tc_muted);
      cursor: pointer;
    }
  `;
}

customElements.define('k-chat-bubble', ChatBubble);
