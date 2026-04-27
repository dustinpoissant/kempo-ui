import { html, css } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';

export default class Time extends ShadowComponent {
  static formAssociated = true;

  static properties = {
    value: { type: String, reflect: true },
    name: { type: String, reflect: true },
    increment: { type: Number, reflect: true },
    military: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true }
  };

  /*
    Lifecycle Callbacks
  */
  constructor() {
    super();
    this.internals = this.attachInternals();
    this.value = '';
    this.name = '';
    this.increment = 1;
    this.military = false;
    this.disabled = false;
    this.required = false;
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    this.internals.setFormValue(this.value);
    if(this.required && !this.value){
      this.internals.setValidity(
        { valueMissing: true },
        'Please enter a time.',
        this.shadowRoot?.querySelector('input')
      );
    } else {
      this.internals.setValidity({});
    }
    if(changedProperties.has('value') && changedProperties.get('value') !== undefined){
      this.dispatchEvent(new CustomEvent('change', {
        detail: { value: this.value },
        bubbles: true
      }));
    }
  }

  /*
    Utility
  */
  get stepSeconds() {
    return Math.max(1, Math.floor(this.increment || 1)) * 60;
  }

  roundToIncrement = (raw) => {
    if(!raw) return '';
    const [hStr, mStr] = raw.split(':');
    let hour = Number(hStr);
    let minute = Number(mStr);
    if(isNaN(hour) || isNaN(minute)) return raw;
    const inc = Math.max(1, Math.floor(this.increment || 1));
    minute = Math.round(minute / inc) * inc;
    if(minute >= 60){
      minute -= 60;
      hour = (hour + 1) % 24;
    }
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  };

  /*
    Event Handlers
  */
  handleNativeChange = (e) => {
    if(this.disabled) return;
    this.value = e.target.value || '';
  };

  handleBlur = (e) => {
    if(this.disabled) return;
    const rounded = this.roundToIncrement(e.target.value);
    if(rounded !== this.value){
      this.value = rounded;
    }
  };

  /*
    Rendering
  */
  render() {
    return html`
      <input
        type="time"
        .value=${this.value || ''}
        step=${this.stepSeconds}
        lang=${this.military ? 'en-GB' : 'en-US'}
        ?disabled=${this.disabled}
        ?required=${this.required}
        @change=${this.handleNativeChange}
        @blur=${this.handleBlur}
      />
    `;
  }

  /*
    Styles
  */
  static styles = css`
    :host {
      display: inline-block;
    }
    :host([disabled]) {
      opacity: 0.5;
      pointer-events: none;
    }
    input {
      padding: var(--spacer_h) var(--spacer);
      border: 1px solid var(--c_border);
      border-radius: var(--radius);
      background: var(--c_bg);
      color: var(--tc);
      font: inherit;
      outline: none;
      box-sizing: border-box;
      transition: border-color var(--animation_ms);
    }
    input:focus {
      border-color: var(--c_primary);
    }
    input::-webkit-calendar-picker-indicator {
      display: none;
    }
  `;
}

customElements.define('k-time', Time);
