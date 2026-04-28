import{html as e,css as t}from"../lit-all.min.js";import n from"./ShadowComponent.js";import"./Icon.js";export default class s extends n{static properties={text:{type:String,reflect:!0},voice:{type:String,reflect:!0},language:{type:String,reflect:!0},rate:{type:Number,reflect:!0},pitch:{type:Number,reflect:!0},volume:{type:Number,reflect:!0},disabled:{type:Boolean,reflect:!0},speaking:{type:Boolean,reflect:!0}};#e=!1;#t=null;constructor(){super(),this.text="",this.voice="",this.language="",this.rate=1,this.pitch=1,this.volume=1,this.disabled=!1,this.speaking=!1}connectedCallback(){super.connectedCallback(),"undefined"!=typeof window&&window.speechSynthesis&&"function"==typeof window.SpeechSynthesisUtterance||(this.#e=!0)}disconnectedCallback(){super.disconnectedCallback(),this.stop()}get effectiveText(){return this.text?this.text:this.textContent.trim()}resolveVoice=()=>{if(!this.voice||this.#e)return null;return window.speechSynthesis.getVoices().find(e=>e.name===this.voice)||null};speak=e=>{if(this.disabled||this.#e)return;const t=(void 0!==e?String(e):this.effectiveText).trim();if(!t)return;window.speechSynthesis.cancel();const n=new window.SpeechSynthesisUtterance(t);n.rate=this.rate,n.pitch=this.pitch,n.volume=this.volume,this.language&&(n.lang=this.language);const s=this.resolveVoice();s&&(n.voice=s),n.onstart=this.handleStart,n.onend=this.handleEnd,n.onerror=this.handleError,this.#t=n,window.speechSynthesis.speak(n)};stop=()=>{this.#e||window.speechSynthesis.cancel()};toggle=()=>{this.speaking?this.stop():this.speak()};handleStart=()=>{this.speaking=!0,this.dispatchEvent(new CustomEvent("start",{bubbles:!0}))};handleEnd=()=>{this.speaking=!1,this.#t=null,this.dispatchEvent(new CustomEvent("end",{bubbles:!0}))};handleError=e=>{this.speaking=!1,this.#t=null,this.dispatchEvent(new CustomEvent("error",{detail:{error:e.error||"unknown"},bubbles:!0}))};handleClick=()=>{this.disabled||this.toggle()};render(){const t=!this.#e,n=t?this.speaking?"Stop speaking":"Speak":"Text-to-speech not supported in this browser";return e`
      <button
        type="button"
        class="no-btn btn"
        ?disabled=${this.disabled||!t}
        @click=${this.handleClick}
        aria-label=${n}
        title=${n}
      >
        <k-icon name=${this.speaking?"stop":"record_voice_over"}></k-icon>
      </button>
      <slot style="display:none"></slot>
    `}static styles=t`
    :host {
      --btn_size: 2.5rem;
      --btn_bg: var(--c_bg);
      --btn_bg__speaking: var(--c_primary);
      --btn_tc__speaking: white;
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
      color: var(--tc);
      cursor: pointer;
      transition: background var(--animation_ms), color var(--animation_ms), border-color var(--animation_ms);
    }
    .btn:hover:not(:disabled) {
      background: var(--c_bg__alt);
    }
    .btn:focus-visible {
      outline: none;
      box-shadow: var(--focus_shadow);
    }
    :host([speaking]) .btn,
    :host([speaking]) .btn:hover,
    :host([speaking]) .btn:focus-visible {
      background: var(--btn_bg__speaking);
      color: var(--btn_tc__speaking);
      border-color: transparent;
    }
    .btn:disabled {
      cursor: not-allowed;
    }
  `}customElements.define("k-text-to-speech",s);