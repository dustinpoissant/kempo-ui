import Control from './Control.js';
import { css, html } from '../../lit-all.min.js';

/*
  Base class for clickable controls. The host element IS the button —
  no internal <button> is rendered. Subclasses override handleAction()
  with the click behavior. Disabled state (from Control.updateHostSupport
  or external) blocks click propagation.

  Subclasses typically:
    static requires = ['methodName']
    handleAction() { this.host?.methodName?.(); }
    render() { return html`<k-icon name="..."></k-icon>`; }
*/
export default class ButtonControl extends Control {
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

  updated(changed) {
    super.updated(changed);
    if(changed.has('disabled')){
      this.tabIndex = this.disabled ? -1 : 0;
      this.setAttribute('aria-disabled', String(this.disabled));
    }
  }

  /*
    Public Methods (override in subclasses)
  */
  handleAction() {}

  /*
    Event Handlers
  */
  handleClick = e => {
    if(this.disabled){
      e.stopImmediatePropagation();
      return;
    }
    this.handleAction();
  };

  handleKeyDown = e => {
    if(this.disabled) return;
    if(e.key === 'Enter' || e.key === ' '){
      e.preventDefault();
      this.click();
    }
  };

  /*
    Rendering — subclasses override
  */
  render() {
    return html`<slot></slot>`;
  }

  /*
    Styles
  */
  static styles = [
    Control.styles,
    css`
      :host {
        align-items: center;
        justify-content: center;
        min-width: 2rem;
        min-height: 2rem;
        background: transparent;
        border: 1px solid var(--c_border);
        border-radius: var(--radius);
        margin: var(--spacer_q);
        padding: var(--spacer_h);
        color: inherit;
        cursor: pointer;
        outline: none;
        font-size: inherit;
        user-select: none;
        transition: background-color var(--animation_ms), box-shadow var(--animation_ms);
      }
      :host(:not([disabled]):hover) {
        background: oklch(from var(--c_bg__inv) l c h / 0.15);
      }
      :host(:not([disabled]):focus),
      :host(:not([disabled]):focus-visible) {
        box-shadow: var(--focus_shadow);
        z-index: 1;
      }
      :host([disabled]) {
        cursor: default;
      }
      :host([active]) {
        background: oklch(from var(--c_primary) l c h / 0.18);
      }
    `
  ];
}

customElements.define('kc-button', ButtonControl);
