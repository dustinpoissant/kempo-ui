import{html as t,css as e,nothing as n}from"../lit-all.min.js";import i from"./ShadowComponent.js";import"./Chat.js";import"./Icon.js";const o=["send","response","error","tool-call","message-add","conversation-change","conversation-save"];export default class a extends i{static properties={position:{type:String,reflect:!0},open:{type:Boolean,reflect:!0},allowFullscreen:{type:Boolean,reflect:!0,attribute:"allow-fullscreen"},fullscreen:{type:Boolean,reflect:!0},unread:{type:Boolean,reflect:!0},heading:{type:String},input:{type:String},promptApi:{type:String,attribute:"prompt-api"},promptTools:{attribute:!1},persistentId:{type:String,attribute:"persistent-id"},placeholder:{type:String},debug:{type:String},emptyMessage:{type:String,attribute:"empty-message"},showStatus:{type:String,attribute:"show-status"},enterNewline:{type:Boolean,attribute:"enter-newline"},disabled:{type:Boolean},hasTopControls:{state:!0},view:{state:!0},conversations:{state:!0},renamingId:{state:!0}};#t=!1;#e=!1;#n=!1;constructor(){super(),this.position="bottom right",this.open=!1,this.allowFullscreen=!1,this.fullscreen=!1,this.unread=!1,this.heading="",this.input="markdown",this.promptApi=null,this.promptTools=[],this.persistentId=null,this.placeholder="Type a message...",this.debug=null,this.emptyMessage="",this.showStatus=null,this.enterNewline=!1,this.disabled=!1,this.hasTopControls=!1,this.view="chat",this.conversations=[],this.renamingId=null}firstUpdated(){o.forEach(t=>this.chat.addEventListener(t,this.handleChatEvent))}willUpdate(t){super.willUpdate(t),!this.#e&&this.persistentId&&(this.#e=!0,["1","full"].includes(this.#i)&&!this.open&&(this.#n=!0,this.open=!0,"full"===this.#i&&this.allowFullscreen&&(this.fullscreen=!0)))}updated(t){super.updated(t),this.open&&this.unread&&(this.unread=!1),!this.allowFullscreen&&this.fullscreen&&(this.fullscreen=!1),this.#e&&(t.has("open")||t.has("fullscreen"))&&this.#o(),void 0!==t.get("fullscreen")&&t.has("fullscreen")&&this.dispatchEvent(new CustomEvent("fullscreen-change",{detail:{fullscreen:this.fullscreen},bubbles:!0})),t.has("open")&&(this.open?this.#a():t.get("open")&&this.dispatchEvent(new CustomEvent("close")))}get chat(){return this.shadowRoot?.querySelector("k-chat")}show(){this.open=!0}hide(){this.open=!1}toggle(){this.open=!this.open}toggleFullscreen(){this.allowFullscreen&&(this.fullscreen=!this.fullscreen)}async downloadConversation(t){const e=await this.chat.exportConversation(t);if(null===e)return!1;const n=this.conversations.find(e=>e.id===t)?.title||this.chat.conversationId===t&&"chat"||"conversation",i=URL.createObjectURL(new Blob([e],{type:"text/plain"}));return Object.assign(document.createElement("a"),{href:i,download:`kempo-chat-${n.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40)||"conversation"}-${(new Date).toISOString().slice(0,19).replace(/\D/g,"")}.txt`}).click(),setTimeout(()=>URL.revokeObjectURL(i),1e3),!0}async showConversations(){this.conversations=await this.chat.listConversations().catch(()=>[]),this.view="conversations"}#s=async()=>{await this.updateComplete,this.chat?.focus()};get#i(){try{return sessionStorage.getItem(`k-chat-bubble:${this.persistentId}`)}catch(t){return null}}#o=()=>{if(this.persistentId)try{sessionStorage.setItem(`k-chat-bubble:${this.persistentId}`,this.open?this.fullscreen?"full":"1":"0")}catch(t){}};#a=async()=>(this.dispatchEvent(new CustomEvent("open")),this.#n?(this.#n=!1,void(this.#t=!0)):this.#t||!this.persistentId?this.#s():(this.#t=!0,await this.showConversations(),void(this.conversations.length||(this.view="chat",this.#s()))));handleChatEvent=t=>{this.dispatchEvent(new CustomEvent(t.type,{detail:t.detail,bubbles:!0}));("response"===t.type||"message-add"===t.type&&"incoming"===t.detail.message.type&&!t.detail.message.transient)&&!this.open&&(this.unread=!0)};handleTopSlotChange=t=>{this.hasTopControls=t.currentTarget.assignedNodes().some(t=>1===t.nodeType||t.textContent.trim())};handleFabClick=()=>this.toggle();handleFullscreenClick=()=>this.toggleFullscreen();handleKeydown=t=>{"Escape"===t.key&&(this.fullscreen?this.fullscreen=!1:(this.hide(),this.shadowRoot.querySelector(".fab").focus()))};handleShowConversations=()=>this.showConversations();handleBack=()=>{this.view="chat",this.#s()};handleNew=()=>{this.chat.newConversation(),this.view="chat",this.#s()};handleContinue=async t=>{await this.chat.loadConversation(t.currentTarget.dataset.id),this.view="chat",this.#s()};handleExport=t=>this.downloadConversation(t.currentTarget.dataset.id);handleRename=async t=>{this.renamingId=t.currentTarget.dataset.id,await this.updateComplete;const e=this.shadowRoot.querySelector(".rename-input");e?.focus(),e?.select()};handleRenameKeydown=t=>{"Escape"===t.key&&(t.stopPropagation(),this.renamingId=null),"Enter"===t.key&&t.currentTarget.blur()};handleRenameCommit=async t=>{const{id:e}=t.currentTarget.dataset,{value:n}=t.currentTarget;this.renamingId===e&&(this.renamingId=null,await this.chat.renameConversation(e,n),await this.showConversations())};handleDelete=async e=>{const{id:n}=e.currentTarget.dataset,i=this.conversations.find(t=>t.id===n)?.title||"Empty conversation",{default:o}=await(import("./Dialog.js"));o.confirm(t`<p class="p">Delete &ldquo;${i}&rdquo;? This cannot be undone.</p>`,async t=>{t&&(await this.chat.deleteConversation(n),await this.showConversations(),this.conversations.length||(this.view="chat"))},{title:"Delete conversation",confirmText:"Delete",confirmClasses:"danger ml",cancelText:"Cancel",cancelClasses:""})};render(){const e=this.unread&&!this.open,i=this.heading||this.persistentId||this.hasTopControls||this.allowFullscreen;return t`
      <button
        type="button"
        class="no-btn fab ${e?"unread":""}"
        aria-label="${this.open?"Minimize":"Open"} ${this.heading||"chat"}${e?" (unread message)":""}"
        aria-expanded=${this.open?"true":"false"}
        aria-controls="panel"
        @click=${this.handleFabClick}
      >
        ${this.open?t`<k-icon name="chevron" direction=${this.position.includes("top")?"up":"down"}></k-icon>`:e?t`<k-icon name="mark_chat_unread"></k-icon>`:t`<k-icon name="chat_bubble"></k-icon>`}
      </button>
      <div id="panel" class="panel" role="dialog" aria-label=${this.heading||"Chat"} @keydown=${this.handleKeydown}>
        <div class="header" ?hidden=${!i}>
          <span class="heading">${this.heading}</span>
          <slot name="controls-top" @slotchange=${this.handleTopSlotChange}></slot>
          ${this.persistentId?t`
            <button type="button" class="no-btn head-btn" title="Conversations" aria-label="Conversations" @click=${this.handleShowConversations}>
              <k-icon name="format_list_bulleted"></k-icon>
            </button>
            <button type="button" class="no-btn head-btn" title="New conversation" aria-label="New conversation" @click=${this.handleNew}>
              <k-icon name="add"></k-icon>
            </button>
          `:n}
          ${this.allowFullscreen?t`
            <button
              type="button"
              class="no-btn head-btn fullscreen-btn"
              title=${this.fullscreen?"Exit full screen":"Full screen"}
              aria-label=${this.fullscreen?"Exit full screen":"Full screen"}
              aria-pressed=${this.fullscreen?"true":"false"}
              @click=${this.handleFullscreenClick}
            >
              <k-icon name=${this.fullscreen?"fullscreen_exit":"fullscreen"}></k-icon>
            </button>
          `:n}
        </div>
        <div class="body">
          <k-chat
            class="chat"
            prompt-api=${this.promptApi??n}
            persistent-id=${this.persistentId??n}
            show-status=${this.showStatus??n}
            input=${this.input}
            placeholder=${this.placeholder}
            empty-message=${this.emptyMessage}
            ?enter-newline=${this.enterNewline}
            debug=${this.debug??n}
            ?disabled=${this.disabled}
            .promptTools=${this.promptTools}
          >
            ${"markdown-editor"===this.input?t`
              <kc-bold slot="controls-top"></kc-bold>
              <kc-italic slot="controls-top"></kc-italic>
              <kc-inline-code slot="controls-top"></kc-inline-code>
              <kc-md-link slot="controls-top"></kc-md-link>
            `:n}
            <slot name="controls-side" slot="controls-side"></slot>
            <slot name="controls-bottom" slot="controls-bottom"></slot>
          </k-chat>
          ${"conversations"===this.view?t`
            <div class="conversations">
              <button type="button" class="primary new-btn" @click=${this.handleNew}>
                <k-icon name="add"></k-icon> New conversation
              </button>
              <ul class="list">
                ${this.conversations.map(e=>t`
                  <li class="row ${e.id===this.chat?.conversationId?"current":""}">
                    ${this.renamingId===e.id?t`
                      <input
                        class="rename-input"
                        data-id=${e.id}
                        .value=${e.title}
                        placeholder="Conversation name"
                        aria-label="Conversation name"
                        @keydown=${this.handleRenameKeydown}
                        @blur=${this.handleRenameCommit}
                      >
                    `:t`
                      <button type="button" class="no-btn row-main" data-id=${e.id} @click=${this.handleContinue}>
                        <span class="row-title">${e.title||"Empty conversation"}</span>
                        <span class="row-date">${new Date(e.updatedAt).toLocaleString(void 0,{dateStyle:"medium",timeStyle:"short"})}</span>
                      </button>
                      <div class="row-actions">
                        <button type="button" class="no-btn row-action row-rename" data-id=${e.id} aria-label="Rename conversation" title="Rename conversation" @click=${this.handleRename}><k-icon name="edit"></k-icon></button>
                        <button type="button" class="no-btn row-action row-export" data-id=${e.id} aria-label="Export conversation" title="Export conversation (a text file with the messages and what happened with the model)" @click=${this.handleExport}><k-icon name="download"></k-icon></button>
                        <button type="button" class="no-btn row-action row-delete" data-id=${e.id} aria-label="Delete conversation" title="Delete conversation" @click=${this.handleDelete}><k-icon name="delete"></k-icon></button>
                      </div>
                    `}
                  </li>
                `)}
              </ul>
              <button type="button" class="no-btn back-btn" @click=${this.handleBack}>Back to the chat</button>
            </div>
          `:n}
        </div>
      </div>
    `}static styles=e`
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
  `}customElements.define("k-chat-bubble",a);