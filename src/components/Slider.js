import { html, css } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';
import { bound } from '../utils/number.js';

export default class Slider extends ShadowComponent {
  static formAssociated = true;

  static properties = {
    value: { type: String, reflect: true },
    name: { type: String, reflect: true },
    min: { type: Number, reflect: true },
    max: { type: Number, reflect: true },
    steps: { type: String, reflect: true },
    format: { type: String, reflect: true },
    tooltip: { type: Boolean, reflect: true },
    vertical: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true }
  };

  #activeThumb = null;

  /*
    Lifecycle Callbacks
  */
  constructor() {
    super();
    this.internals = this.attachInternals();
    this.value = '0';
    this.name = '';
    this.min = 0;
    this.max = 100;
    this.steps = null;
    this.format = null;
    this.tooltip = false;
    this.vertical = false;
    this.disabled = false;
    this.tabIndex = 0;
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this.handleKeyDown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this.handleKeyDown);
  }

  get isRange() {
    return String(this.value).includes(',');
  }

  get formattedValue() {
    if(!this.format) return this.value;
    if(this.isRange) return `${this.formatValue(this.lower)},${this.formatValue(this.upper)}`;
    return this.formatValue(this.lower);
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    this.internals.setFormValue(this.formattedValue);
  }

  /*
    Dispatched only from setValue/setUpper, i.e. genuine user-driven
    interaction (click, drag, keyboard). Programmatic `.value =`
    assignment (e.g. a host re-rendering the slider from its own state)
    must not re-trigger 'change', or a host that forwards 'change' back
    into its own state (like k-video's seek bar) would feed back into
    itself on every host-driven update.
  */
  dispatchChange = () => {
    this.dispatchEvent(new CustomEvent('change', {
      detail: { value: this.formattedValue },
      bubbles: true
    }));
  };

  /*
    Utility
  */
  get stepValues() {
    if(!this.steps) return null;
    return this.steps.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n)).sort((a, b) => a - b);
  }

  get lower() {
    const parts = String(this.value).split(',');
    return Number(parts[0]) || 0;
  }

  get upper() {
    const parts = String(this.value).split(',');
    return parts.length > 1 ? Number(parts[1]) : this.max;
  }

  get percentage() {
    return ((this.lower - this.min) / (this.max - this.min)) * 100;
  }

  get upperPercentage() {
    return ((this.upper - this.min) / (this.max - this.min)) * 100;
  }

  formatValue = (num) => {
    if(!this.format) return String(num);
    const pattern = this.format;
    const match = pattern.match(/0([^0]?)0+/);
    if(!match) return pattern.replace('0', String(Math.round(num)));
    const sep = match[0].indexOf(match[1]) > 0 ? match[1] : '';
    const decimals = sep ? match[0].split(sep)[1].length : 0;
    const fixed = num.toFixed(decimals);
    return pattern.replace(match[0], fixed);
  };

  snapToNearest = (val) => {
    const sv = this.stepValues;
    if(!sv || sv.length === 0) return bound(val, this.min, this.max);
    let closest = sv[0];
    let closestDist = Math.abs(val - closest);
    for(let i = 1; i < sv.length; i++) {
      const dist = Math.abs(val - sv[i]);
      if(dist < closestDist) {
        closest = sv[i];
        closestDist = dist;
      }
    }
    return closest;
  };

  ratioFromEvent = (e) => {
    const track = this.shadowRoot.querySelector('#track');
    const rect = track.getBoundingClientRect();
    if(this.vertical) {
      return bound(1 - (e.clientY - rect.top) / rect.height, 0, 1);
    }
    return bound((e.clientX - rect.left) / rect.width, 0, 1);
  };

  valueFromEvent = (e) => {
    const raw = this.min + this.ratioFromEvent(e) * (this.max - this.min);
    return this.snapToNearest(raw);
  };

  setValue = (newValue) => {
    if(this.disabled) return;
    const clamped = bound(newValue, this.min, this.max);
    const snapped = this.snapToNearest(clamped);
    if(this.isRange) {
      if(snapped > this.upper) return;
      if(snapped !== this.lower) {
        this.value = `${snapped},${this.upper}`;
        this.dispatchChange();
      }
    } else {
      if(snapped !== this.lower) {
        this.value = String(snapped);
        this.dispatchChange();
      }
    }
  };

  setUpper = (newValue) => {
    if(this.disabled || !this.isRange) return;
    const clamped = bound(newValue, this.min, this.max);
    const snapped = this.snapToNearest(clamped);
    if(snapped < this.lower) return;
    if(snapped !== this.upper) {
      this.value = `${this.lower},${snapped}`;
      this.dispatchChange();
    }
  };

  closestThumb = (val) => {
    if(!this.isRange) return 'lower';
    const distLower = Math.abs(val - this.lower);
    const distUpper = Math.abs(val - this.upper);
    return distLower <= distUpper ? 'lower' : 'upper';
  };

  stepIncrement = (current, direction) => {
    const sv = this.stepValues;
    if(sv && sv.length > 0) {
      const idx = sv.indexOf(current);
      if(direction > 0) {
        if(idx >= 0 && idx < sv.length - 1) return sv[idx + 1];
        if(idx === -1) return sv.find(v => v > current) ?? sv[sv.length - 1];
      } else {
        if(idx > 0) return sv[idx - 1];
        if(idx === -1) return [...sv].reverse().find(v => v < current) ?? sv[0];
      }
      return current;
    }
    return current + direction;
  };

  /*
    Event Handlers
  */
  handleTrackClick = (e) => {
    if(this.disabled) return;
    const val = this.valueFromEvent(e);
    if(this.isRange) {
      if(this.closestThumb(val) === 'upper') this.setUpper(val);
      else this.setValue(val);
    } else {
      this.setValue(val);
    }
  };

  handleThumbDown = (which, e) => {
    if(this.disabled) return;
    e.preventDefault();
    e.stopPropagation();
    this.#activeThumb = which;
    this.requestUpdate();
    const onMove = (ev) => {
      const clientEv = ev.touches ? ev.touches[0] : ev;
      const val = this.valueFromEvent(clientEv);
      if(this.#activeThumb === 'upper') this.setUpper(val);
      else this.setValue(val);
    };
    const onUp = () => {
      this.#activeThumb = null;
      this.requestUpdate();
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onUp);
  };

  handleKeyDown = (e) => {
    if(this.disabled) return;
    const sv = this.stepValues;
    const isIncrease = e.key === 'ArrowRight' || e.key === 'ArrowUp';
    const isDecrease = e.key === 'ArrowLeft' || e.key === 'ArrowDown';
    if(isIncrease || isDecrease) {
      e.preventDefault();
      const dir = isIncrease ? 1 : -1;
      if(this.isRange && this.#activeThumb === 'upper') {
        this.setUpper(this.stepIncrement(this.upper, dir));
      } else {
        this.setValue(this.stepIncrement(this.lower, dir));
      }
    } else if(e.key === 'Home') {
      e.preventDefault();
      this.setValue(sv ? sv[0] : this.min);
    } else if(e.key === 'End') {
      e.preventDefault();
      if(this.isRange) this.setUpper(sv ? sv[sv.length - 1] : this.max);
      else this.setValue(sv ? sv[sv.length - 1] : this.max);
    }
  };

  /*
    Rendering
  */
  renderHorizontal = () => {
    const pct = this.percentage;
    const sv = this.stepValues;
    if(this.isRange) {
      const upperPct = this.upperPercentage;
      return html`
        <div id="track" @click=${this.handleTrackClick}>
          <div id="fill" style="left:${pct}%;width:${upperPct - pct}%"></div>
          ${sv ? sv.map(step => {
            const stepPct = ((step - this.min) / (this.max - this.min)) * 100;
            return html`<div class="step-dot" style="left:${stepPct}%"></div>`;
          }) : ''}
          <div
            class="thumb${this.#activeThumb === 'lower' ? ' active' : ''}"
            style="left:${pct}%"
            @mousedown=${(e) => this.handleThumbDown('lower', e)}
            @touchstart=${(e) => this.handleThumbDown('lower', e)}
          >${this.tooltip && this.#activeThumb === 'lower' ? html`<div class="tooltip">${this.formatValue(this.lower)}</div>` : ''}</div>
          <div
            class="thumb${this.#activeThumb === 'upper' ? ' active' : ''}"
            style="left:${upperPct}%"
            @mousedown=${(e) => this.handleThumbDown('upper', e)}
            @touchstart=${(e) => this.handleThumbDown('upper', e)}
          >${this.tooltip && this.#activeThumb === 'upper' ? html`<div class="tooltip">${this.formatValue(this.upper)}</div>` : ''}</div>
        </div>
      `;
    }
    return html`
      <div id="track" @click=${this.handleTrackClick}>
        <div id="fill" style="width:${pct}%"></div>
        ${sv ? sv.map(step => {
          const stepPct = ((step - this.min) / (this.max - this.min)) * 100;
          return html`<div class="step-dot" style="left:${stepPct}%"></div>`;
        }) : ''}
        <div
          class="thumb${this.#activeThumb === 'lower' ? ' active' : ''}"
          style="left:${pct}%"
          @mousedown=${(e) => this.handleThumbDown('lower', e)}
          @touchstart=${(e) => this.handleThumbDown('lower', e)}
        >${this.tooltip && this.#activeThumb === 'lower' ? html`<div class="tooltip">${this.formatValue(this.lower)}</div>` : ''}</div>
      </div>
    `;
  };

  renderVertical = () => {
    const pct = this.percentage;
    const sv = this.stepValues;
    if(this.isRange) {
      const upperPct = this.upperPercentage;
      return html`
        <div id="track" @click=${this.handleTrackClick}>
          <div id="fill" style="bottom:${pct}%;height:${upperPct - pct}%"></div>
          ${sv ? sv.map(step => {
            const stepPct = ((step - this.min) / (this.max - this.min)) * 100;
            return html`<div class="step-dot" style="bottom:${stepPct}%"></div>`;
          }) : ''}
          <div
            class="thumb${this.#activeThumb === 'lower' ? ' active' : ''}"
            style="bottom:${pct}%"
            @mousedown=${(e) => this.handleThumbDown('lower', e)}
            @touchstart=${(e) => this.handleThumbDown('lower', e)}
          >${this.tooltip && this.#activeThumb === 'lower' ? html`<div class="tooltip">${this.formatValue(this.lower)}</div>` : ''}</div>
          <div
            class="thumb${this.#activeThumb === 'upper' ? ' active' : ''}"
            style="bottom:${upperPct}%"
            @mousedown=${(e) => this.handleThumbDown('upper', e)}
            @touchstart=${(e) => this.handleThumbDown('upper', e)}
          >${this.tooltip && this.#activeThumb === 'upper' ? html`<div class="tooltip">${this.formatValue(this.upper)}</div>` : ''}</div>
        </div>
      `;
    }
    return html`
      <div id="track" @click=${this.handleTrackClick}>
        <div id="fill" style="height:${pct}%"></div>
        ${sv ? sv.map(step => {
          const stepPct = ((step - this.min) / (this.max - this.min)) * 100;
          return html`<div class="step-dot" style="bottom:${stepPct}%"></div>`;
        }) : ''}
        <div
          class="thumb${this.#activeThumb === 'lower' ? ' active' : ''}"
          style="bottom:${pct}%"
          @mousedown=${(e) => this.handleThumbDown('lower', e)}
          @touchstart=${(e) => this.handleThumbDown('lower', e)}
        >${this.tooltip && this.#activeThumb === 'lower' ? html`<div class="tooltip">${this.formatValue(this.lower)}</div>` : ''}</div>
      </div>
    `;
  };

  render() {
    return html`
      ${this.vertical ? this.renderVertical() : this.renderHorizontal()}
      <div id="label"><slot></slot></div>
    `;
  }

  /*
    Styles
  */
  static styles = css`
    :host {
      --track_height: 6px;
      --track_background: var(--c_border);
      --track_radius: 99999px;
      --fill_background: var(--c_primary);
      --thumb_size: 20px;
      --thumb_background: var(--c_primary);
      --thumb_border: 2px solid white;
      --thumb_shadow: var(--focus_shadow);
      --step_dot_size: 8px;
      --step_dot_background: var(--c_bg__alt);
      --step_dot_border: 1px solid var(--c_border);
      --vertical_height: 10rem;

      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      user-select: none;
    }
    :host([disabled]) {
      opacity: 0.5;
      pointer-events: none;
    }
    :host([vertical]) {
      flex-direction: column;
      width: auto;
      display: inline-flex;
    }
    #track {
      flex: 1;
      height: var(--track_height);
      background: var(--track_background);
      border-radius: var(--track_radius);
      position: relative;
    }
    :host([vertical]) #track {
      height: auto;
      width: var(--track_height);
      min-height: var(--vertical_height);
    }
    #fill {
      background: var(--fill_background);
      border-radius: var(--track_radius);
      pointer-events: none;
    }
    :host(:not([vertical])) #fill {
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
    }
    :host([vertical]) #fill {
      width: 100%;
      position: absolute;
      bottom: 0;
      left: 0;
    }
    .thumb {
      width: var(--thumb_size);
      height: var(--thumb_size);
      background: var(--thumb_background);
      border: var(--thumb_border);
      border-radius: 50%;
      position: absolute;
      box-shadow: 0 0 0 transparent;
      cursor: grab;
      transition: box-shadow 0.15s;
      z-index: 1;
    }
    :host(:not([vertical])) .thumb {
      top: 50%;
      transform: translate(-50%, -50%);
    }
    :host([vertical]) .thumb {
      left: 50%;
      transform: translate(-50%, 50%);
    }
    .thumb:active,
    .thumb.active {
      cursor: grabbing;
      box-shadow: var(--focus_shadow);
    }
    .tooltip {
      position: absolute;
      background: var(--c_text);
      color: var(--c_bg);
      padding: 0.15rem 0.4rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      white-space: nowrap;
      pointer-events: none;
      line-height: 1.2;
    }
    :host(:not([vertical])) .tooltip {
      bottom: calc(100% + 6px);
      left: 50%;
      transform: translateX(-50%);
    }
    :host([vertical]) .tooltip {
      right: calc(100% + 6px);
      top: 50%;
      transform: translateY(-50%);
    }
    .step-dot {
      width: var(--step_dot_size);
      height: var(--step_dot_size);
      background: var(--step_dot_background);
      border: var(--step_dot_border);
      border-radius: 50%;
      position: absolute;
      pointer-events: none;
    }
    :host(:not([vertical])) .step-dot {
      top: 50%;
      transform: translate(-50%, -50%);
    }
    :host([vertical]) .step-dot {
      left: 50%;
      transform: translate(-50%, 50%);
    }
    #label {
      font-size: 0.875rem;
    }
    #label:empty {
      display: none;
    }
  `;
}

customElements.define('k-slider', Slider);
