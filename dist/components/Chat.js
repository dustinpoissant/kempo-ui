import{html as t,css as e,nothing as s}from"../lit-all.min.js";import i from"./ShadowComponent.js";import n from"../utils/sanitizeHtml.js";import o from"../utils/renderMarkdown.js";import{isSupported as r,createSession as a}from"../utils/promptApi.js";import{saveConversation as d,getConversation as l,listConversations as h,deleteConversation as c,renameConversation as u,titleOf as m,formatConversation as p}from"../utils/conversations.js";import g from"../utils/debounce.js";import"./Spinner.js";import"./Resize.js";import"./Icon.js";const b=()=>"undefined"!=typeof crypto&&"function"==typeof crypto.randomUUID?crypto.randomUUID():`msg-${Date.now()}-${Math.random().toString(36).slice(2,10)}`,v=new Set(["sending","delivered","read","failed"]),w=new Set(["markdown-editor","html-editor","markdown","text"]),f=t=>{const e=document.createElement("div");return e.innerHTML=t.replace(/<br\s*\/?>/gi,"\n").replace(/<\/(p|div|li|h[1-6]|blockquote)>/gi,"\n"),e.textContent.trim()};export default class y extends i{static properties={input:{type:String,reflect:!0},markdownResize:{type:Boolean,reflect:!0,attribute:"markdown-resize"},resize:{type:Boolean,reflect:!0},enterNewline:{type:Boolean,reflect:!0,attribute:"enter-newline"},showStatus:{type:String,reflect:!0,attribute:"show-status"},placeholder:{type:String,reflect:!0},debug:{type:String,reflect:!0},emptyMessage:{type:String,reflect:!0,attribute:"empty-message"},disabled:{type:Boolean,reflect:!0},promptApi:{type:String,reflect:!0,attribute:"prompt-api"},promptTools:{attribute:!1},persistentId:{type:String,reflect:!0,attribute:"persistent-id"},conversationId:{attribute:!1},slotted:{state:!0},inputReady:{state:!0},restored:{state:!0},messages:{state:!0}};#t=null;#e=0;#s=Promise.resolve();#i=Promise.resolve();#n=Promise.resolve();#o=[];#r=null;constructor(){super(),this.input="markdown",this.inputReady=!1,this.markdownResize=!1,this.resize=!1,this.enterNewline=!1,this.showStatus=null,this.placeholder="Type a message...",this.debug=null,this.emptyMessage="",this.disabled=!1,this.promptApi=null,this.promptTools=[],this.persistentId=null,this.conversationId=null,this.slotted={},this.restored=!1,this.messages=[]}connectedCallback(){super.connectedCallback(),this.#n=this.#a()}disconnectedCallback(){super.disconnectedCallback(),this.#d()}willUpdate(t){super.willUpdate(t),t.has("input")&&this.hasUpdated&&(this.#n=this.#a())}async getUpdateComplete(){return await this.#n,super.getUpdateComplete()}updated(t){super.updated(t),t.has("messages")&&(this.#l(),this.#h()),t.has("persistentId")&&this.persistentId&&(this.restored=!1,this.#i=this.#c()),(t.has("promptApi")||t.has("promptTools"))&&this.#d(),t.has("promptApi")&&this.#u&&!r()&&this.addMessage({type:"incoming",html:"The Prompt API is not available in this browser.",transient:!0})}addMessage(t={}){const e="outgoing"===t.type?"outgoing":"incoming",s=t.id||b(),i={id:s,type:e,html:n(t.html||""),status:v.has(t.status)?t.status:"outgoing"===e?"delivered":"read",sender:t.sender||"",markdown:t.markdown||"",transient:!!t.transient,timestamp:t.timestamp instanceof Date?t.timestamp:new Date};return this.messages=[...this.messages,i],this.dispatchEvent(new CustomEvent("message-add",{detail:{message:i},bubbles:!0})),s}updateMessage(t,e={}){let s=!1;return this.messages=this.messages.map(i=>{if(i.id!==t)return i;s=!0;const o={...i};return void 0!==e.html&&(o.html=n(e.html)),void 0!==e.status&&v.has(e.status)&&(o.status=e.status),void 0!==e.sender&&(o.sender=e.sender),void 0!==e.markdown&&(o.markdown=e.markdown),void 0!==e.transient&&(o.transient=!!e.transient),e.timestamp instanceof Date&&(o.timestamp=e.timestamp),o}),s}removeMessage(t){const e=this.messages.length;return this.messages=this.messages.filter(e=>e.id!==t),this.messages.length!==e}clear(){const t=this.conversationId;this.newConversation(),this.persistentId&&t&&c(t).catch(()=>{})}newConversation(){this.messages=[],this.conversationId=null,this.#r=null,this.#o=[],this.#m(!0),this.#d(),this.#p()}async loadConversation(t){const e=await l(t);return!!e&&(this.#m(!1),this.#d(),this.conversationId=e.id,this.#r=e.titleCustom?e.title:null,this.#o=[...e.debug||[]],this.messages=this.#g(e),this.#p(),this.#b(),!0)}listConversations(){return h(this.persistentId)}async renameConversation(t,e){const s=await u(t,e);return s&&t===this.conversationId&&(this.#r=String(e).trim()||null),s}async exportConversation(t=this.conversationId){const e=t===this.conversationId?{id:t||"(not saved yet)",group:this.persistentId||"",title:this.#r??m(this.messages),titleCustom:!!this.#r,debug:this.#o,messages:this.messages,createdAt:this.messages[0]?.timestamp,updatedAt:new Date}:await l(t);return e?p(e,{page:location.href,browser:navigator.userAgent}):null}async deleteConversation(t){await c(t),t===this.conversationId&&this.newConversation()}get debugLog(){return this.#o.join("\n")}focus(t){this.updateComplete.then(()=>this.#v?.focus(t))}send(t){if(this.disabled)return null;const{markdown:e,html:s}=this.#w(t);if(!e)return null;const i=this.addMessage({type:"outgoing",html:s,markdown:e,status:this.#f?"sending":"delivered"});return void 0===t&&this.#y(),this.dispatchEvent(new CustomEvent("send",{detail:{id:i,html:s,markdown:e},bubbles:!0})),this.#u&&(this.#s=this.#s.then(()=>this.#k(i,e))),i}handleSendClick=()=>this.send();handleSlotChange=t=>{const e=t.currentTarget,s=e.assignedNodes({flatten:!0}).some(t=>1===t.nodeType||t.textContent.trim());!!this.slotted[e.name]!==s&&(this.slotted={...this.slotted,[e.name]:s})};handleTextareaInput=t=>{t.currentTarget.style.height="auto",t.currentTarget.style.height=t.currentTarget.scrollHeight+t.currentTarget.offsetHeight-t.currentTarget.clientHeight+"px"};handleEditorKeydown=t=>{if(this.disabled||t.isComposing)return;if("Enter"!==t.key||t.ctrlKey||t.metaKey||t.altKey)return;(this.enterNewline?t.shiftKey:!t.shiftKey)&&(t.preventDefault(),this.send())};get#_(){return w.has(this.input)?this.input:"markdown"}get#v(){return this.shadowRoot?.querySelector(".input")}#a=async()=>{this.inputReady=!1;try{"html-editor"===this.#_&&await(import("./HtmlEditor.js")),"markdown-editor"===this.#_&&await Promise.all([import("./MarkdownEditor.js"),import("./controls/Bold.js"),import("./controls/Italic.js"),import("./controls/InlineCode.js"),import("./controls/MdLink.js"),import("./controls/BulletList.js"),import("./controls/NumberList.js"),import("./controls/Quote.js")])}catch(t){console.error(t)}finally{this.inputReady=!0}};#w=t=>{if(t??=this.#v?.value??"","html-editor"===this.#_){const e=n(t);return{markdown:f(e),html:e}}const e=t.trim();return"text"===this.#_?{markdown:e,html:`<p>${(s=e,Object.assign(document.createElement("div"),{textContent:s}).innerHTML).replace(/\n/g,"<br>")}</p>`}:{markdown:e,html:n(o(e,{breaks:!0}))};var s};#y=()=>{const t=this.#v;if("function"==typeof t.clear)return t.clear();t.value="",t.style.height=""};get#u(){return null!=this.promptApi&&"false"!==this.promptApi}get#x(){return`k-chat-blank:${this.persistentId}`}get#S(){try{return"1"===sessionStorage.getItem(this.#x)}catch(t){return!1}}#m=t=>{if(this.persistentId)try{t?sessionStorage.setItem(this.#x,"1"):sessionStorage.removeItem(this.#x)}catch(t){}};get#I(){return null!=this.debug&&"false"!==this.debug}#$=t=>{if(!this.#I)return;const e=`[k-chat ${(new Date).toISOString().slice(11,23)}] ${t}`;this.#o.push(e),"console"===this.debug&&console.log(e)};#d=()=>{this.#e++,this.#t&&this.#$("SESSION ENDED: the model forgets the conversation so far."),this.#t?.destroy(),this.#t=null};#k=async(t,e)=>{const s=this.#e,i=performance.now();this.#$(`USER MESSAGE (${this.#_} input, conversation ${this.conversationId||"not saved yet"}):\n${e}`),this.#t&&this.#$("Using the existing model session, which remembers the conversation so far.");const r=this.addMessage({type:"incoming",sender:"Assistant",html:"<em>Thinking&hellip;</em>",transient:!0});try{if(this.#t??=await a({onLog:this.#I?this.#$:void 0,history:this.messages.slice(0,this.messages.findIndex(e=>e.id===t)).filter(t=>t.markdown&&"failed"!==t.status).map(t=>({role:"outgoing"===t.type?"user":"assistant",content:t.markdown})),path:(this.promptApi||"").split(/\s+/).filter(Boolean),tools:this.promptTools.map(t=>({...t,execute:async e=>{const s=await t.execute(e);return this.dispatchEvent(new CustomEvent("tool-call",{detail:{name:t.name,arguments:e,result:s},bubbles:!0})),s}})),onDownloadProgress:t=>this.updateMessage(r,{html:`<em>Downloading the model&hellip; ${Math.round(100*t)}%</em>`})}),s!==this.#e)return;this.updateMessage(t,{status:"delivered"});let n="";for await(const t of this.#t.promptStreaming(e)){if(s!==this.#e)return;n+=t,this.updateMessage(r,{html:o(n,{breaks:!0})})}this.updateMessage(t,{status:"read"}),this.updateMessage(r,{markdown:n,transient:!1}),this.#$(`ANSWER SHOWN IN THE CHAT (took ${((performance.now()-i)/1e3).toFixed(1)}s):\n${n}`),this.dispatchEvent(new CustomEvent("response",{detail:{id:r,markdown:n,html:this.messages.find(t=>t.id===r)?.html},bubbles:!0}))}catch(e){if(s!==this.#e)return;this.#$(`ERROR: ${e.stack||e.message}`),this.updateMessage(t,{status:"failed"}),this.updateMessage(r,{html:`<em>${n(e.message)}</em>`}),this.dispatchEvent(new CustomEvent("error",{detail:{error:e},bubbles:!0}))}};#p=()=>this.dispatchEvent(new CustomEvent("conversation-change",{detail:{id:this.conversationId},bubbles:!0}));#b=async()=>{await this.#i;const t=this.messages.filter(t=>!t.transient);if(this.persistentId&&t.length){this.conversationId??=b();try{await d({id:this.conversationId,group:this.persistentId,title:this.#r??m(t),titleCustom:!!this.#r,debug:[...this.#o],messages:t}),this.#m(!1),this.dispatchEvent(new CustomEvent("conversation-save",{detail:{id:this.conversationId},bubbles:!0}))}catch(t){}}};#g=t=>t.messages.map(t=>({...t,html:n(t.html),status:"sending"===t.status?"failed":t.status}));#h=g(()=>this.#b(),300);#c=async()=>{try{if(this.#S)return;const[t]=await h(this.persistentId),e=t&&await l(t.id);if(!e||this.conversationId)return;this.conversationId=e.id,this.#r=e.titleCustom?e.title:null,this.#o=[...e.debug||[],...this.#o],this.messages=[...this.#g(e),...this.messages],this.#p()}catch(t){}finally{this.restored=!0}};#l=()=>{this.updateComplete.then(()=>{const t=this.shadowRoot?.querySelector(".window");t&&(t.scrollTop=t.scrollHeight)})};get#E(){for(let t=this.messages.length-1;t>=0;t--)if("outgoing"===this.messages[t].type)return this.messages[t].id;return null}get#f(){return null!=this.showStatus&&"false"!==this.showStatus}get#T(){return"icons"===this.showStatus?"icons":"text"}#C(t,e){return!!this.#f&&("outgoing"===t.type&&("sending"===t.status||"failed"===t.status||t.id===e))}#M(t){return"icons"===this.#T?this.#z(t):this.#j(t)}#j(e){return"sending"===e?t`<span class="status sending"><k-spinner size="xs"></k-spinner> Sending&hellip;</span>`:"delivered"===e?t`<span class="status">Delivered</span>`:"read"===e?t`<span class="status">Read</span>`:"failed"===e?t`<span class="status failed"><k-icon name="error"></k-icon> Not Delivered</span>`:s}#z(e){return"sending"===e?t`<span class="status status-icon-only"><k-spinner size="xs" title="Sending"></k-spinner></span>`:"delivered"===e?t`<span class="status status-icon-only"><k-icon name="check" title="Delivered"></k-icon></span>`:"read"===e?t`<span class="status status-icon-only"><k-icon name="done_all" title="Read"></k-icon></span>`:"failed"===e?t`<span class="status status-icon-only failed"><k-icon name="error" title="Not Delivered"></k-icon></span>`:s}#B(e,i){const n=this.#C(e,i);return t`
      <div
        class="message ${e.type} ${e.status}"
        data-id=${e.id}
      >
        ${e.sender?t`<div class="sender">${e.sender}</div>`:s}
        <div class="bubble">
          <div class="content" .innerHTML=${e.html}></div>
        </div>
        ${n?this.#M(e.status):s}
      </div>
    `}#R=()=>t`
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
  `;#A=(e,s)=>t`
    <div class=${s} ?hidden=${!this.slotted[e]}>
      <slot name=${e} @slotchange=${this.handleSlotChange}></slot>
    </div>
  `;#D(){return"markdown-editor"!==this.#_||this.inputReady?"html-editor"===this.#_?t`
      ${this.#A("controls-top","slot-row top")}
      <k-html-editor
        class="input editor"
        controls="minimal"
        ?disabled=${this.disabled}
        @keydown=${this.handleEditorKeydown}
      ></k-html-editor>
      <div class="footer">
        <slot name="controls-bottom"></slot>
        ${this.#R()}
      </div>
    `:"markdown-editor"!==this.#_?t`
      ${this.#A("controls-top","slot-row top")}
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
          ${this.#A("controls-side","slot-col")}
          ${this.#R()}
        </div>
      </div>
      ${this.#A("controls-bottom","slot-row bottom")}
    `:t`
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
            ${this.#R()}
          </div>
        </k-markdown-editor>
    `:s}#L=()=>{const e=this.#E;return t`
      ${this.#u?t`<div class="disclaimer" role="note">Very experimental: this uses the tiny AI built into the browser, and its answers are often wrong.</div>`:s}
      <div class="window" role="log" aria-live="polite">
        ${this.messages.length||!this.emptyMessage||this.persistentId&&!this.restored?s:t`<div class="empty">${this.emptyMessage}</div>`}
        ${this.messages.map(t=>this.#B(t,e))}
      </div>
      <div class="input-area">
        ${this.#D()}
      </div>
    `};render(){return this.resize?t`<k-resize dimension="height"><div class="resizable">${this.#L()}</div></k-resize>`:this.#L()}static styles=e`
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
  `}customElements.define("k-chat",y);