import { html, css } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';
import './Icon.js';

export default class SpeechToText extends ShadowComponent {
  static properties = {
    language: { type: String, reflect: true },
    continuous: { type: Boolean, reflect: true },
    interim: { type: Boolean, reflect: true },
    minConfidence: { type: Number, reflect: true, attribute: 'min-confidence' },
    timeout: { type: Number, reflect: true },
    disabled: { type: Boolean, reflect: true },
    listening: { type: Boolean, reflect: true }
  };

  #recognition = null;
  #buffer = '';
  #interim = '';
  #unsupported = false;
  #timeoutId = null;

  /*
    Lifecycle Callbacks
  */
  constructor() {
    super();
    this.language = 'en-US';
    this.continuous = false;
    this.interim = false;
    this.minConfidence = 0;
    this.timeout = 0;
    this.disabled = false;
    this.listening = false;
  }

  connectedCallback() {
    super.connectedCallback();
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SR){
      this.#unsupported = true;
      return;
    }
    this.#recognition = new SR();
    this.#recognition.lang = this.language;
    this.#recognition.continuous = this.continuous;
    // Always enable interim internally so the `end` event has a fallback
    // transcript when the engine doesn't finalize. The public `interim` attr
    // controls whether `result` events fire for unfinalized chunks.
    this.#recognition.interimResults = true;
    this.#recognition.onstart = this.handleStart;
    this.#recognition.onend = this.handleEnd;
    this.#recognition.onresult = this.handleResult;
    this.#recognition.onerror = this.handleError;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#clearTimeout();
    if(this.#recognition){
      try { this.#recognition.stop(); } catch(e) {}
      this.#recognition.onstart = null;
      this.#recognition.onend = null;
      this.#recognition.onresult = null;
      this.#recognition.onerror = null;
      this.#recognition = null;
    }
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if(this.#recognition){
      if(changedProperties.has('language')) this.#recognition.lang = this.language;
      if(changedProperties.has('continuous')) this.#recognition.continuous = this.continuous;
    }
  }

  /*
    Event Handlers
  */
  handleStart = () => {
    this.#buffer = '';
    this.#interim = '';
    this.listening = true;
    this.#armTimeout();
    this.dispatchEvent(new CustomEvent('start', { bubbles: true }));
  };

  handleResult = (e) => {
    let final = '';
    let interim = '';
    for(let i = e.resultIndex; i < e.results.length; i++){
      const res = e.results[i];
      const alt = res[0];
      const confidence = typeof alt.confidence === 'number' ? alt.confidence : 0;
      if(confidence < this.minConfidence) continue;
      if(res.isFinal) final += alt.transcript;
      else interim += alt.transcript;
    }
    if(final) this.#buffer += final;
    // Only overwrite the cached interim when this event actually carries text.
    // Chrome occasionally fires a "settling" result event where final/interim
    // are both empty — wiping #interim in that case loses the last transcript
    // and the `end` event ends up with nothing to report.
    if(final || interim){
      this.#interim = interim;
    }
    if(final || this.interim){
      this.dispatchEvent(new CustomEvent('result', {
        detail: {
          text: (this.#buffer + (interim || this.#interim)).trim(),
          isFinal: !!final && !interim
        },
        bubbles: true
      }));
    }
  };

  handleEnd = () => {
    this.listening = false;
    this.#clearTimeout();
    // Include any unfinalized interim text — Chrome occasionally fires `end`
    // without finalizing the last utterance.
    const text = (this.#buffer + this.#interim).trim();
    this.dispatchEvent(new CustomEvent('end', {
      detail: { text },
      bubbles: true
    }));
  };

  handleError = (e) => {
    this.listening = false;
    this.#clearTimeout();
    this.dispatchEvent(new CustomEvent('error', {
      detail: { error: e.error, message: e.message },
      bubbles: true
    }));
  };

  #armTimeout = () => {
    this.#clearTimeout();
    if(this.timeout > 0){
      this.#timeoutId = setTimeout(() => this.stop(), this.timeout * 1000);
    }
  };

  #clearTimeout = () => {
    if(this.#timeoutId){
      clearTimeout(this.#timeoutId);
      this.#timeoutId = null;
    }
  };

  handleClick = () => {
    if(this.disabled) return;
    if(this.listening) this.stop();
    else this.start();
  };

  /*
    Public Methods
  */
  start = () => {
    if(this.disabled || !this.#recognition || this.listening) return;
    try { this.#recognition.start(); } catch(e) {}
  };

  stop = () => {
    if(!this.#recognition || !this.listening) return;
    try { this.#recognition.stop(); } catch(e) {}
  };

  toggle = () => {
    this.handleClick();
  };

  /*
    Rendering
  */
  render() {
    const supported = !this.#unsupported;
    const label = !supported
      ? 'Speech recognition not supported in this browser'
      : this.listening ? 'Stop listening' : 'Start listening';
    return html`
      <button
        type="button"
        class="no-btn btn ${this.listening ? 'listening' : ''}"
        ?disabled=${this.disabled || !supported}
        @click=${this.handleClick}
        aria-label=${label}
        title=${label}
      >
        <k-icon name=${this.listening ? 'stop' : 'mic'}></k-icon>
      </button>
    `;
  }

  /*
    Styles
  */
  static styles = css`
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
    :host([listening]) .btn,
    :host([listening]) .btn:hover,
    :host([listening]) .btn:focus-visible {
      background: var(--btn_bg__listening);
      color: var(--btn_tc__listening);
      border-color: transparent;
      animation: pulse 1.4s infinite;
    }
    .btn:disabled {
      cursor: not-allowed;
    }
    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(211, 47, 47, 0.5); }
      50% { box-shadow: 0 0 0 10px rgba(211, 47, 47, 0); }
    }
  `;
}

customElements.define('k-speech-to-text', SpeechToText);
