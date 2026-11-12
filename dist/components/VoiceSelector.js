import{html as e,css as t}from"../lit-all.min.js";import s from"./ShadowComponent.js";import{getVoice as i,setVoice as n,subscribeToVoice as a,subscribeToAvailableVoices as l}from"../utils/voice.js";const r=e=>(e||"").split("-")[0].toLowerCase();let o=null;try{if("undefined"!=typeof Intl&&Intl.DisplayNames){const e="undefined"!=typeof navigator&&navigator.language||"en";o=new Intl.DisplayNames([e],{type:"language"})}}catch(e){}const c=new Map,u=e=>{let t=e;if(o)try{t=o.of(e)||e}catch(e){}const s=(e=>{if(c.has(e))return c.get(e);let t="";try{"undefined"!=typeof Intl&&Intl.DisplayNames&&(t=new Intl.DisplayNames([e],{type:"language"}).of(e)||"")}catch(e){}return t&&(t=t.charAt(0).toUpperCase()+t.slice(1)),c.set(e,t),t})(e);return s&&s.toLowerCase()!==t.toLowerCase()?`${t} (${s})`:t};export default class d extends s{static formAssociated=!0;static properties={language:{type:String,reflect:!0},placeholder:{type:String,reflect:!0},name:{type:String,reflect:!0},disabled:{type:Boolean,reflect:!0},readonly:{type:Boolean,reflect:!0},required:{type:Boolean,reflect:!0},voices:{state:!0},selected:{state:!0},currentLang:{state:!0}};#e=null;#t=null;#s=!1;#i=!1;constructor(){super(),this.internals=this.attachInternals(),this.language="",this.placeholder="Browser default",this.name="",this.disabled=!1,this.readonly=!1,this.required=!1,this.initialValue="",this.voices=[],this.selected="",this.currentLang=""}connectedCallback(){super.connectedCallback(),this.initialValue=i()||"","undefined"!=typeof window&&window.speechSynthesis?(this.#e=l(e=>{this.voices=e,this.#n()}),this.#t=a(e=>{if(this.selected=e||"",e){const t=this.voices.find(t=>t.name===e);t&&t.lang&&(this.currentLang=r(t.lang))}})):this.#s=!0}disconnectedCallback(){super.disconnectedCallback(),this.#e&&this.#e(),this.#t&&this.#t(),this.#e=null,this.#t=null}#n=()=>{if(this.#i||0===this.voices.length)return;this.#i=!0;const e=this.selected?this.voices.find(e=>e.name===this.selected):null;if(e&&e.lang)return void(this.currentLang=r(e.lang));if(this.language)return void(this.currentLang=r(this.language));const t="undefined"==typeof navigator?"en":r(navigator.language||"en")||"en",s=this.availableLanguages;s.includes(t)?this.currentLang=t:s.length>0&&(this.currentLang=s[0])};get availableLanguages(){const e=new Set;for(const t of this.voices)t.lang&&e.add(r(t.lang));return[...e].sort()}get voicesForCurrentLanguage(){return this.currentLang?this.voices.filter(e=>r(e.lang)===this.currentLang):this.voices}updated(e){super.updated(e),this.internals.setFormValue(this.selected||null),this.internals.setValidity(this.required&&!this.selected?{valueMissing:!0}:{},"Please choose a voice.",this.renderRoot.querySelector(".voice"))}formResetCallback(){n(this.initialValue)}formStateRestoreCallback(e){n(e||"")}formDisabledCallback(e){this.disabled=e}handleLanguageChange=e=>{if(this.disabled||this.readonly)return;this.currentLang=e.target.value;this.voicesForCurrentLanguage.some(e=>e.name===this.selected)||n("")};handleVoiceChange=e=>{if(this.disabled||this.readonly)return;const t=e.target.value;n(t),this.dispatchEvent(new CustomEvent("change",{detail:{voice:t,language:this.currentLang},bubbles:!0}))};refresh=()=>{this.#s||(this.voices=window.speechSynthesis.getVoices(),this.#n())};render(){if(this.#s)return e`
        <select disabled aria-label="Voice selector (unsupported)">
          <option>Speech synthesis not supported</option>
        </select>
      `;const t=this.availableLanguages,s=this.voicesForCurrentLanguage;return e`
      <div class="row">
        <div class="col" style="min-width: 10rem; flex: 0 0 auto">
          <select
            class="lang"
            aria-label="Language"
            ?disabled=${this.disabled||this.readonly||0===t.length}
            ?readonly=${this.readonly}
            .value=${this.currentLang}
            @change=${this.handleLanguageChange}
          >
            ${t.map(t=>e`
              <option value=${t} ?selected=${t===this.currentLang}>${u(t)}</option>
            `)}
          </select>
        </div>
        <div class="col">
          <select
            class="voice"
            aria-label="Voice"
            ?disabled=${this.disabled||this.readonly}
            ?readonly=${this.readonly}
            .value=${this.selected}
            @change=${this.handleVoiceChange}
          >
            <option value="">${this.placeholder}</option>
            ${s.map(t=>{return e`
              <option
                value=${t.name}
                ?selected=${t.name===this.selected}
              >${s=t.name,s.split("(")[0].trim()||s}</option>
            `;var s})}
          </select>
        </div>
      </div>
    `}static styles=t`
    :host {
      display: block;
    }
    :host([disabled]) {
      opacity: 0.5;
      pointer-events: none;
    }
    select {
      width: 100%;
    }
  `}customElements.define("k-voice-selector",d);