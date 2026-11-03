import{html as t,css as i,nothing as e}from"../lit-all.min.js";import n from"./ShadowComponent.js";import"./Icon.js";export default class s extends n{static properties={language:{type:String,reflect:!0},continuous:{type:Boolean,reflect:!0},interim:{type:Boolean,reflect:!0},minConfidence:{type:Number,reflect:!0,attribute:"min-confidence"},timeout:{type:Number,reflect:!0},disabled:{type:Boolean,reflect:!0},listening:{type:Boolean,reflect:!0},showLabel:{type:Boolean,reflect:!0,attribute:"show-label"}};#t=null;#i="";#e="";#n=!1;#s=null;constructor(){super(),this.language="en-US",this.continuous=!1,this.interim=!1,this.minConfidence=0,this.timeout=0,this.disabled=!1,this.listening=!1,this.showLabel=!1}connectedCallback(){super.connectedCallback();const t=window.SpeechRecognition||window.webkitSpeechRecognition;t?(this.#t=new t,this.#t.lang=this.language,this.#t.continuous=this.continuous,this.#t.interimResults=!0,this.#t.onstart=this.handleStart,this.#t.onend=this.handleEnd,this.#t.onresult=this.handleResult,this.#t.onerror=this.handleError):this.#n=!0}disconnectedCallback(){if(super.disconnectedCallback(),this.#o(),this.#t){try{this.#t.stop()}catch(t){}this.#t.onstart=null,this.#t.onend=null,this.#t.onresult=null,this.#t.onerror=null,this.#t=null}}updated(t){super.updated(t),this.#t&&(t.has("language")&&(this.#t.lang=this.language),t.has("continuous")&&(this.#t.continuous=this.continuous))}handleStart=()=>{this.#i="",this.#e="",this.listening=!0,this.#r(),this.dispatchEvent(new CustomEvent("start",{bubbles:!0}))};handleResult=t=>{let i="",e="";for(let n=t.resultIndex;n<t.results.length;n++){const s=t.results[n],o=s[0];("number"==typeof o.confidence?o.confidence:0)<this.minConfidence||(s.isFinal?i+=o.transcript:e+=o.transcript)}i&&(this.#i+=i),(i||e)&&(this.#e=e),(i||this.interim)&&this.dispatchEvent(new CustomEvent("result",{detail:{text:(this.#i+(e||this.#e)).trim(),isFinal:!!i&&!e},bubbles:!0}))};handleEnd=()=>{this.listening=!1,this.#o();const t=(this.#i+this.#e).trim();this.dispatchEvent(new CustomEvent("end",{detail:{text:t},bubbles:!0}))};handleError=t=>{this.listening=!1,this.#o(),this.dispatchEvent(new CustomEvent("error",{detail:{error:t.error,message:t.message},bubbles:!0}))};#r=()=>{this.#o(),this.timeout>0&&(this.#s=setTimeout(()=>this.stop(),1e3*this.timeout))};#o=()=>{this.#s&&(clearTimeout(this.#s),this.#s=null)};handleClick=()=>{this.disabled||(this.listening?this.stop():this.start())};start=()=>{if(!this.disabled&&this.#t&&!this.listening)try{this.#t.start()}catch(t){}};stop=()=>{if(this.#t&&this.listening)try{this.#t.stop()}catch(t){}};toggle=()=>{this.handleClick()};render(){const i=!this.#n,n=i?this.listening?"Stop listening":"Start listening":"Speech recognition not supported in this browser";return t`
      <button
        type="button"
        class="no-btn btn ${this.listening?"listening":""}"
        ?disabled=${this.disabled||!i}
        @click=${this.handleClick}
        aria-label=${n}
        title=${n}
      >
        <k-icon name=${this.listening?"stop":"mic"}></k-icon>
        ${this.showLabel?t`<span class="label">${n}</span>`:e}
      </button>
    `}static styles=i`
    :host {
      --btn_size: 2.5rem;
      --btn_bg: var(--c_bg);
      --btn_bg__listening: var(--c_danger, #d32f2f);
      --btn_tc__listening: white;
      display: inline-block;
    }
    :host([disabled]) {
      opacity: 0.5;
      pointer-events: none;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--btn_size);
      height: var(--btn_size);
      padding: 0;
      border: 1px solid var(--c_border);
      border-radius: 50%;
      background: var(--btn_bg);
      color: inherit;
      /* kempo-css colours .btn:hover from these variables with a selector that beats ours, and the
         light-dark() it uses for text resolves light inside a button (black text on dark themes). */
      --btn_tc: currentColor;
      --btn_bg__hover: var(--c_bg__alt);
      --btn_box_shadow__hover: none;
      cursor: pointer;
      transition: background var(--animation_ms), color var(--animation_ms), border-color var(--animation_ms);
    }
    :host([show-label]) {
      display: block;
    }
    :host([show-label]) .btn {
      display: flex;
      justify-content: flex-start;
      gap: var(--spacer_h);
      width: 100%;
      height: auto;
      min-height: 2rem;
      padding: var(--spacer_h) var(--spacer);
      border: 0;
      border-radius: 0;
      background: transparent;
      text-align: left;
      white-space: nowrap;
      --btn_bg__hover: oklch(from var(--c_bg__inv) l c h / 0.15);
    }
    .btn:focus-visible {
      outline: none;
      box-shadow: var(--focus_shadow);
    }
    :host([listening]) .btn,
    :host([listening]) .btn:hover,
    :host([listening]) .btn:focus-visible {
      background: var(--btn_bg__listening);
      color: var(--btn_tc__listening);
      border-color: transparent;
      animation: pulse 1.4s infinite;
    }
    :host([show-label][listening]) .btn {
      animation: none;
    }
    .btn:disabled {
      cursor: not-allowed;
    }
    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(211, 47, 47, 0.5); }
      50% { box-shadow: 0 0 0 10px rgba(211, 47, 47, 0); }
    }
  `}customElements.define("k-speech-to-text",s);