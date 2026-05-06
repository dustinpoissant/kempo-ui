import ShadowComponent from './ShadowComponent.js';
import { html, css } from '../lit-all.min.js';

export default class Button extends ShadowComponent {
  /*
    Reactive Properties / Attributes
  */
  static properties = {
    disabled: { type: Boolean, reflect: true }
  };

  /*
    Lifecycle Callbacks
  */
  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('role')) this.setAttribute('role', 'button');
    if(!this.hasAttribute('tabindex')) this.tabIndex = this.disabled ? -1 : 0;
    this.setAttribute('aria-disabled', String(!!this.disabled));
    this.addEventListener('click', this.handleClick);
    this.addEventListener('keydown', this.handleKeyDown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this.handleClick);
    this.removeEventListener('keydown', this.handleKeyDown);
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if(changedProperties.has('disabled')) {
      this.tabIndex = this.disabled ? -1 : 0;
      this.setAttribute('aria-disabled', String(this.disabled));
    }
  }

  /*
    Event Handlers
  */
  handleClick = e => {
    if(this.disabled) e.stopImmediatePropagation();
  };

  handleKeyDown = e => {
    if(this.disabled) return;
    if(e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.click();
    }
  };

  /*
    Rendering
  */
  render() {
    return html`<slot></slot>`;
  }

  static styles = css`
    :host {
      display: inline-block;
      padding: var(--btn_padding);
      background-color: var(--btn_bg);
      border: 1px solid var(--btn_border);
      cursor: pointer;
      outline: none;
      border-radius: var(--radius);
      color: var(--btn_tc);
      transition: background-color var(--animation_ms), box-shadow var(--animation_ms);
      box-shadow: var(--btn_box_shadow);
      font-size: inherit;
      vertical-align: middle;
      user-select: none;
    }
    :host(:not([disabled]):hover) {
      background-color: var(--btn_bg__hover);
      color: var(--btn_tc);
      box-shadow: var(--btn_box_shadow__hover);
    }
    :host(:not([disabled]):focus),
    :host(:not([disabled]):focus-visible) {
      box-shadow: var(--focus_shadow);
      z-index: 1;
    }
    :host([disabled]) {
      opacity: 0.6;
    }
  `;
}

