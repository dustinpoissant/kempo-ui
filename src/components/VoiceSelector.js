import { html, css } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';
import {
  getVoice,
  setVoice,
  subscribeToVoice,
  subscribeToAvailableVoices
} from '../utils/voice.js';

const primaryLang = (tag) => (tag || '').split('-')[0].toLowerCase();

const browserLanguage = () => {
  if(typeof navigator === 'undefined') return 'en';
  return primaryLang(navigator.language || 'en') || 'en';
};

let displayNames = null;
try {
  if(typeof Intl !== 'undefined' && Intl.DisplayNames){
    const locale = (typeof navigator !== 'undefined' && navigator.language) || 'en';
    displayNames = new Intl.DisplayNames([locale], { type: 'language' });
  }
} catch(e) {}

// Cache for native-name lookups (Intl.DisplayNames in the language's own locale)
// so we don't construct a new instance per option per render.
const nativeNameCache = new Map();
const getNativeName = (code) => {
  if(nativeNameCache.has(code)) return nativeNameCache.get(code);
  let native = '';
  try {
    if(typeof Intl !== 'undefined' && Intl.DisplayNames){
      const dn = new Intl.DisplayNames([code], { type: 'language' });
      native = dn.of(code) || '';
    }
  } catch(e) {}
  // Capitalize the first character so dropdown labels look consistent —
  // Intl.DisplayNames returns "español"/"français" lowercase, which looks
  // off next to the capitalized localized name.
  if(native){
    native = native.charAt(0).toUpperCase() + native.slice(1);
  }
  nativeNameCache.set(code, native);
  return native;
};

// Render a language code as "Localized (Native)" — e.g. "Spanish (Español)",
// "Japanese (日本語)". The native name is a deliberate accessibility escape
// hatch: if the user accidentally has the page in a language they can't read,
// they can still recognize their own language by its native name. When the
// localized and native names match (user already in that language) we skip
// the duplicate.
const formatLanguage = (code) => {
  let localized = code;
  if(displayNames){
    try {
      localized = displayNames.of(code) || code;
    } catch(e) {}
  }
  const native = getNativeName(code);
  if(native && native.toLowerCase() !== localized.toLowerCase()){
    return `${localized} (${native})`;
  }
  return localized;
};

// Strip the parenthetical "(language (region))" that OS-level voices often
// append to their name (e.g. "Eddy (German (Germany))" → "Eddy"). The actual
// `value` we submit to SpeechSynthesis still uses the full name.
const displayVoiceName = (name) => {
  const cleaned = name.split('(')[0].trim();
  return cleaned || name;
};

export default class VoiceSelector extends ShadowComponent {
  static properties = {
    language: { type: String, reflect: true },
    placeholder: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    voices: { state: true },
    selected: { state: true },
    currentLang: { state: true }
  };

  #unsubVoices = null;
  #unsubSelected = null;
  #unsupported = false;
  #langInitialized = false;

  /*
    Lifecycle Callbacks
  */
  constructor() {
    super();
    this.language = '';
    this.placeholder = 'Browser default';
    this.disabled = false;
    this.voices = [];
    this.selected = '';
    this.currentLang = '';
  }

  connectedCallback() {
    super.connectedCallback();
    if(typeof window === 'undefined' || !window.speechSynthesis){
      this.#unsupported = true;
      return;
    }
    this.#unsubVoices = subscribeToAvailableVoices(list => {
      this.voices = list;
      this.#initLanguageOnce();
    });
    this.#unsubSelected = subscribeToVoice(name => {
      this.selected = name || '';
      // Keep the language dropdown in sync with externally-set voices
      if(name){
        const match = this.voices.find(v => v.name === name);
        if(match && match.lang){
          this.currentLang = primaryLang(match.lang);
        }
      }
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if(this.#unsubVoices) this.#unsubVoices();
    if(this.#unsubSelected) this.#unsubSelected();
    this.#unsubVoices = null;
    this.#unsubSelected = null;
  }

  /*
    Utility
  */
  #initLanguageOnce = () => {
    if(this.#langInitialized || this.voices.length === 0) return;
    this.#langInitialized = true;
    // Priority: existing voice's language > attribute > navigator > first available
    const fromVoice = this.selected
      ? this.voices.find(v => v.name === this.selected)
      : null;
    if(fromVoice && fromVoice.lang){
      this.currentLang = primaryLang(fromVoice.lang);
      return;
    }
    if(this.language){
      this.currentLang = primaryLang(this.language);
      return;
    }
    const navLang = browserLanguage();
    const langs = this.availableLanguages;
    if(langs.includes(navLang)){
      this.currentLang = navLang;
    } else if(langs.length > 0){
      this.currentLang = langs[0];
    }
  };

  get availableLanguages() {
    const langs = new Set();
    for(const v of this.voices){
      if(v.lang) langs.add(primaryLang(v.lang));
    }
    return [...langs].sort();
  }

  get voicesForCurrentLanguage() {
    if(!this.currentLang) return this.voices;
    return this.voices.filter(v => primaryLang(v.lang) === this.currentLang);
  }

  /*
    Event Handlers
  */
  handleLanguageChange = (e) => {
    if(this.disabled) return;
    this.currentLang = e.target.value;
    // If the saved voice no longer exists in this language, clear it
    const stillValid = this.voicesForCurrentLanguage.some(v => v.name === this.selected);
    if(!stillValid){
      setVoice('');
    }
  };

  handleVoiceChange = (e) => {
    if(this.disabled) return;
    const value = e.target.value;
    setVoice(value);
    this.dispatchEvent(new CustomEvent('change', {
      detail: { voice: value, language: this.currentLang },
      bubbles: true
    }));
  };

  /*
    Public Methods
  */
  refresh = () => {
    if(this.#unsupported) return;
    this.voices = window.speechSynthesis.getVoices();
    this.#initLanguageOnce();
  };

  /*
    Rendering
  */
  render() {
    if(this.#unsupported){
      return html`
        <select disabled aria-label="Voice selector (unsupported)">
          <option>Speech synthesis not supported</option>
        </select>
      `;
    }
    const langs = this.availableLanguages;
    const voicesInLang = this.voicesForCurrentLanguage;
    return html`
      <div class="row">
        <div class="col" style="min-width: 10rem; flex: 0 0 auto">
          <select
            class="lang"
            aria-label="Language"
            ?disabled=${this.disabled || langs.length === 0}
            .value=${this.currentLang}
            @change=${this.handleLanguageChange}
          >
            ${langs.map(code => html`
              <option value=${code} ?selected=${code === this.currentLang}>${formatLanguage(code)}</option>
            `)}
          </select>
        </div>
        <div class="col">
          <select
            class="voice"
            aria-label="Voice"
            ?disabled=${this.disabled}
            .value=${this.selected}
            @change=${this.handleVoiceChange}
          >
            <option value="">${this.placeholder}</option>
            ${voicesInLang.map(v => html`
              <option
                value=${v.name}
                ?selected=${v.name === this.selected}
              >${displayVoiceName(v.name)}</option>
            `)}
          </select>
        </div>
      </div>
    `;
  }

  /*
    Styles
  */
  static styles = css`
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
  `;
}

customElements.define('k-voice-selector', VoiceSelector);
