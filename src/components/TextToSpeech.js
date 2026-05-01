import { html, css } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';
import { getVoice as getPreferredVoice } from '../utils/voice.js';
import './Icon.js';

export default class TextToSpeech extends ShadowComponent {
  static properties = {
    text: { type: String, reflect: true },
    voice: { type: String, reflect: true },
    language: { type: String, reflect: true },
    rate: { type: Number, reflect: true },
    pitch: { type: Number, reflect: true },
    volume: { type: Number, reflect: true },
    disabled: { type: Boolean, reflect: true },
    speaking: { type: Boolean, reflect: true }
  };

  #unsupported = false;
  #utterance = null;

  /*
    Lifecycle Callbacks
  */
  constructor() {
    super();
    this.text = '';
    this.voice = '';
    this.language = '';
    this.rate = 1;
    this.pitch = 1;
    this.volume = 1;
    this.disabled = false;
    this.speaking = false;
  }

  connectedCallback() {
    super.connectedCallback();
    if(typeof window === 'undefined' || !window.speechSynthesis || typeof window.SpeechSynthesisUtterance !== 'function'){
      this.#unsupported = true;
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.stop();
  }

  /*
    Utility
  */
  get effectiveText() {
    if(this.text) return this.text;
    return this.textContent.trim();
  }

  resolveVoice = () => {
    if(this.#unsupported) return null;
    // Use the explicit `voice` attribute first; if none is set, fall back to
    // the user's saved preference from the voice utility (so a site-wide
    // VoiceSelector can drive every TextToSpeech that hasn't opted out).
    const source = this.voice || getPreferredVoice() || '';
    if(!source) return null;
    const voices = window.speechSynthesis.getVoices();
    const candidates = source.split(',').map(s => s.trim()).filter(Boolean);
    for(const name of candidates){
      const match = voices.find(v => v.name === name);
      if(match) return match;
    }
    return null;
  };

  /*
    Public Methods
  */
  speak = (override) => {
    if(this.disabled || this.#unsupported) return;
    const text = (override !== undefined ? String(override) : this.effectiveText).trim();
    if(!text) return;
    // Cancel any in-flight speech (ours or otherwise) before queuing this one
    window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;
    utterance.volume = this.volume;
    if(this.language) utterance.lang = this.language;
    const voice = this.resolveVoice();
    if(voice) utterance.voice = voice;
    utterance.onstart = this.handleStart;
    utterance.onend = this.handleEnd;
    utterance.onerror = this.handleError;
    this.#utterance = utterance;
    window.speechSynthesis.speak(utterance);
  };

  stop = () => {
    if(this.#unsupported) return;
    window.speechSynthesis.cancel();
  };

  toggle = () => {
    if(this.speaking) this.stop();
    else this.speak();
  };

  /*
    Event Handlers
  */
  handleStart = () => {
    this.speaking = true;
    this.dispatchEvent(new CustomEvent('start', { bubbles: true }));
  };

  handleEnd = () => {
    this.speaking = false;
    this.#utterance = null;
    this.dispatchEvent(new CustomEvent('end', { bubbles: true }));
  };

  handleError = (e) => {
    this.speaking = false;
    this.#utterance = null;
    this.dispatchEvent(new CustomEvent('error', {
      detail: { error: e.error || 'unknown' },
      bubbles: true
    }));
  };

  handleClick = () => {
    if(this.disabled) return;
    this.toggle();
  };

  /*
    Rendering
  */
  render() {
    const supported = !this.#unsupported;
    const label = !supported
      ? 'Text-to-speech not supported in this browser'
      : this.speaking ? 'Stop speaking' : 'Speak';
    return html`
      <button
        type="button"
        class="no-btn btn"
        ?disabled=${this.disabled || !supported}
        @click=${this.handleClick}
        aria-label=${label}
        title=${label}
      >
        <k-icon name=${this.speaking ? 'stop' : 'record_voice_over'}></k-icon>
      </button>
      <slot style="display:none"></slot>
    `;
  }

  /*
    Styles
  */
  static styles = css`
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
  `;
}

customElements.define('k-text-to-speech', TextToSpeech);
