import { html, css } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';
import getOverlayRoot from '../utils/overlayRoot.js';
import './Icon.js';

export default class Toast extends ShadowComponent {
  static properties = {
    actionHtml: { type: String, reflect: true, attribute: 'action-html' },
    closeHtml: { type: String, reflect: true, attribute: 'close-html' },
    timeout: { type: Number, reflect: true },
    opened: { type: Boolean, reflect: true },
    hasAction: { type: Boolean, reflect: true, attribute: 'has-action' },
    hasClose: { type: Boolean, reflect: true, attribute: 'has-close' },
    hasIcon: { type: Boolean, reflect: true, attribute: 'has-icon' },
    position: { type: String, reflect: true },
    animating: { type: String, reflect: true }
  };

  static styles = css`
    @keyframes toast-show-bottom {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes toast-hide-bottom {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(20px); }
    }
    @keyframes toast-show-top {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes toast-hide-top {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(-20px); }
    }
    @keyframes toast-show-left {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes toast-hide-left {
      from { opacity: 1; transform: translateX(0); }
      to { opacity: 0; transform: translateX(-20px); }
    }
    @keyframes toast-show-right {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes toast-hide-right {
      from { opacity: 1; transform: translateX(0); }
      to { opacity: 0; transform: translateX(20px); }
    }

    :host {
      display: none;
      min-width: 16rem;
      max-width: calc(100% - (2 * var(--spacer, 1rem)));
      background-color: var(--c_bg, #ffffff);
      border-radius: var(--radius, 0.375rem);
    }

    :host([opened]) {
      display: flex;
    }

    :host([animating="in"][position*="bottom"]) {
      animation: toast-show-bottom var(--animation_ms, 300ms) ease forwards;
    }
    :host([animating="out"][position*="bottom"]) {
      animation: toast-hide-bottom var(--animation_ms, 300ms) ease forwards;
    }
    :host([animating="in"][position*="top"]) {
      animation: toast-show-top var(--animation_ms, 300ms) ease forwards;
    }
    :host([animating="out"][position*="top"]) {
      animation: toast-hide-top var(--animation_ms, 300ms) ease forwards;
    }
    :host([animating="in"][position*="left"]:not([position*="top"]):not([position*="bottom"])) {
      animation: toast-show-left var(--animation_ms, 300ms) ease forwards;
    }
    :host([animating="out"][position*="left"]:not([position*="top"]):not([position*="bottom"])) {
      animation: toast-hide-left var(--animation_ms, 300ms) ease forwards;
    }
    :host([animating="in"][position*="right"]:not([position*="top"]):not([position*="bottom"])) {
      animation: toast-show-right var(--animation_ms, 300ms) ease forwards;
    }
    :host([animating="out"][position*="right"]:not([position*="top"]):not([position*="bottom"])) {
      animation: toast-hide-right var(--animation_ms, 300ms) ease forwards;
    }

    #icon {
      padding: var(--spacer, 1rem);
      padding-right: 0;
    }

    #message {
      padding: var(--spacer, 1rem);
      flex: 1 1 auto;
    }

    :host(:not([has-close])) #close,
    :host(:not([has-action])) #action,
    :host(:not([has-icon])) #icon {
      display: none;
    }

    #action {
      background: transparent;
      border: none;
      color: var(--tc_primary, blue);
      cursor: pointer;
      padding: var(--spacer, 1rem);
    }

    #action:hover {
      color: var(--tc_primary__hover, lightblue);
    }

    #close {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: var(--spacer, 1rem);
      opacity: 0.7;
      transition: opacity var(--animation_ms, 300ms);
    }

    #close:hover {
      opacity: 1;
    }

    /* Theme classes */
    :host(.bg-success) {
      background-color: var(--c_success, #dcfce7);
      color: var(--tc_on_success, #166534);
    }

    :host(.bg-warning) {
      background-color: var(--c_warning, #fef3c7);
      color: var(--tc_on_warning, #92400e);
    }

    :host(.bg-danger) {
      background-color: var(--c_danger, #fee2e2);
      color: var(--tc_on_danger, #991b1b);
    }
  `;

  constructor() {
    super();
    this.actionHtml = '';
    this.closeHtml = '';
    this.timeout = 0;
    this.opened = false;
    this.hasAction = false;
    this.hasClose = false;
    this.hasIcon = false;
    this.position = 'bottom center';
    this.animating = '';
    this.actionCallback = () => {};
    this.closeCallback = () => {};
    this.timeoutId = null;
    this.closing = false;
  }

  /*
    Lifecycle Methods
  */
  updated(changedProperties) {
    super.updated(changedProperties);
    
    if (changedProperties.has('opened') && this.opened) {
      this.hasAction = !!this.querySelector('[slot="action"]');
      this.hasClose = !!this.querySelector('[slot="close"]');
      this.hasIcon = !!this.querySelector('[slot="icon"]');
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('animationend', this.handleAnimationEnd);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('animationend', this.handleAnimationEnd);
    clearTimeout(this.timeoutId);
  }

  /*
    Event Handlers
  */
  handleActionClick = () => {
    if (this.actionCallback() !== false) {
      this.close();
    }
  };

  handleCloseClick = () => {
    this.close();
  };

  handleAnimationEnd = (e) => {
    if (e.animationName.includes('toast-hide')) {
      this.animating = '';
      this.opened = false;
      this.dispatchEvent(new CustomEvent('close'));
      this.dispatchEvent(new CustomEvent('openchange'));
      this.closeCallback();
      this.closing = false;
    } else if (e.animationName.includes('toast-show')) {
      this.animating = '';
    }
  };

  /*
    Public Methods
  */
  open() {
    this.closing = false;
    this.animating = 'in';
    this.opened = true;
    
    if (this.timeout) {
      clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout(() => {
        this.close();
      }, this.timeout);
    }
    
    this.dispatchEvent(new CustomEvent('open'));
    this.dispatchEvent(new CustomEvent('openchange'));
  }

  close() {
    clearTimeout(this.timeoutId);
    if (this.opened && !this.closing) {
      this.closing = true;
      this.animating = 'out';
      // opened will be set to false in the animation end handler
    }
  }

  /*
    Rendering Logic
  */
  render() {
    return html`
      <div id="icon">
        <slot name="icon"></slot>
      </div>
      <div id="message">
        <slot></slot>
      </div>
      <button id="action" class="no-style" @click="${this.handleActionClick}">
        <slot name="action"></slot>
      </button>
      <button id="close" class="no-style" @click="${this.handleCloseClick}">
        <slot name="close"></slot>
      </button>
    `;
  }

  /*
    Static Methods
  */
  static create(message, options = {}) {
    let {
      position = 'auto',
      removeOnClose = true,
      closeCallback = () => {},
      action = false,
      close = false,
      icon = false,
      timeout = 5000
    } = options;

    if (position === 'auto') {
      position = window.innerWidth <= 768 ? 'bottom center' : 'top right';
    }

    const container = ToastContainer.getContainer(position);

    const toast = new Toast();
    toast.position = position;
    toast.timeout = timeout;
    toast.innerHTML = message;

    // Set callbacks
    toast.actionCallback = options.actionCallback || (() => {});
    const originalCloseCallback = closeCallback;
    toast.closeCallback = (...args) => {
      if (removeOnClose) {
        toast.remove();
        if (container.children.length === 0) {
          container.remove();
        }
      }
      originalCloseCallback(...args);
    };

    // Add icon
    if (icon) {
      const iconElement = document.createElement('span');
      iconElement.slot = 'icon';
      if (icon instanceof HTMLElement) {
        iconElement.appendChild(icon);
      } else {
        iconElement.innerHTML = icon;
      }
      toast.appendChild(iconElement);
    }

    // Add action
    if (action) {
      const actionElement = document.createElement('span');
      actionElement.slot = 'action';
      if (action instanceof HTMLElement) {
        actionElement.appendChild(action);
      } else {
        actionElement.innerHTML = action;
      }
      toast.appendChild(actionElement);
    }

    // Add close
    if (close) {
      const closeElement = document.createElement('span');
      closeElement.slot = 'close';
      if (close instanceof HTMLElement) {
        closeElement.appendChild(close);
      } else {
        closeElement.innerHTML = close;
      }
      toast.appendChild(closeElement);
    }

    container.appendChild(toast);
    toast.open();
    return toast;
  }

  static success(message, options = {}) {
    const toast = Toast.create(message, {
      icon: '<k-icon name="check"></k-icon>',
      ...options
    });
    toast.classList.add('bg-success');
    return toast;
  }

  static warning(message, options = {}) {
    const toast = Toast.create(message, {
      icon: '<k-icon name="warning"></k-icon>',
      ...options
    });
    toast.classList.add('bg-warning');
    return toast;
  }

  static error(message, options = {}) {
    const toast = Toast.create(message, {
      icon: '<k-icon name="error"></k-icon>',
      ...options
    });
    toast.classList.add('bg-danger');
    return toast;
  }
}

class ToastContainer extends HTMLElement {
  constructor(position = 'bottom center') {
    super();
    this.position = position.toLowerCase();
    this.setAttribute('position', this.position);
    this.applyStyles();
  }

  applyStyles() {
    this.style.cssText = `
      position: fixed;
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 90;
      pointer-events: auto;
      padding: 32px;
      box-sizing: border-box;
      max-width: 100%;
      max-height: 100%;
      overflow: visible;
    `;
    
    const observer = new MutationObserver(() => {
      Array.from(this.children).forEach(toast => {
        if (toast.tagName === 'K-TOAST') {
          toast.style.filter = 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.1)) drop-shadow(0 4px 6px rgba(0, 0, 0, 0.05))';
        }
      });
    });
    
    observer.observe(this, { childList: true });
    
    // Apply to existing children
    Array.from(this.children).forEach(toast => {
      if (toast.tagName === 'K-TOAST') {
        toast.style.filter = 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.1)) drop-shadow(0 4px 6px rgba(0, 0, 0, 0.05))';
      }
    });

    const [vertical, horizontal] = this.position.split(' ');

    // Vertical positioning
    if (vertical === 'top') {
      this.style.top = '0';
    } else {
      this.style.bottom = '0';
    }

    // Horizontal positioning
    if (horizontal === 'left') {
      this.style.left = '0';
      this.style.alignItems = 'flex-start';
    } else if (horizontal === 'right') {
      this.style.right = '0';
      this.style.alignItems = 'flex-end';
    } else if (horizontal === 'center') {
      if (vertical === 'top' || vertical === 'bottom') {
        this.style.left = '50%';
        this.style.transform = 'translateX(-50%)';
        this.style.alignItems = 'center';
      } else {
        this.style.top = '50%';
        this.style.left = '50%';
        this.style.transform = 'translate(-50%, -50%)';
      }
    }
  }

  static getContainer(position) {
    let container = document.querySelector(`k-toast-container[position="${position}"]`);
    if (!container) {
      container = new ToastContainer(position);
      getOverlayRoot().appendChild(container);
    }
    return container;
  }
}

// Register custom elements
window.customElements.define('k-toast', Toast);
window.customElements.define('k-toast-container', ToastContainer);
