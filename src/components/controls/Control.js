import ShadowComponent from '../ShadowComponent.js';
import { css } from '../../lit-all.min.js';

/*
  Base class for all controls (kc-*). A control finds its host via
  closest('[controlled]') and disables itself if the host does not
  implement the methods declared in static requires.

  Subclasses can declare:
    static requires = ['methodName', ...]  // host methods that must exist;
                                           // missing → disabled
    static hostMode = 'mode-name'          // optional: only visible when
                                           // host.mode === this value. If
                                           // host has no `mode` property,
                                           // always visible.
    static hostEvents = ['evt', ...]       // host events that trigger
                                           // requestUpdate() on this control

  Subclasses should call this.invokeHost('methodName', ...args) to call
  a host method safely (no-op if missing).
*/
export default class Control extends ShadowComponent {
  static properties = {
    hidden: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true }
  };

  static requires = [];
  static hostEvents = [];

  constructor() {
    super();
    this.hidden = false;
    this.disabled = false;
  }

  /*
    Lifecycle Callbacks
  */
  connectedCallback() {
    super.connectedCallback();
    const host = this.host;
    this.boundHost = host;
    this.updateHostSupport();
    if(host){
      this.modeHandler = () => {
        this.updateModeVisibility();
        this.requestUpdate();
      };
      host.addEventListener('mode-changed', this.modeHandler);
      this.hostEventHandler = () => this.requestUpdate();
      for(const evt of this.constructor.hostEvents || []){
        host.addEventListener(evt, this.hostEventHandler);
      }
      this.updateModeVisibility();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if(this.boundHost){
      if(this.modeHandler) this.boundHost.removeEventListener('mode-changed', this.modeHandler);
      if(this.hostEventHandler){
        for(const evt of this.constructor.hostEvents || []){
          this.boundHost.removeEventListener(evt, this.hostEventHandler);
        }
      }
    }
    this.modeHandler = null;
    this.hostEventHandler = null;
    this.boundHost = null;
  }

  updated(changed) {
    super.updated(changed);
    if(changed.has('hidden')){
      this.dispatchEvent(new CustomEvent('control_visibility_change', { bubbles: true }));
    }
  }

  /*
    Host Discovery & Support
  */
  get host() {
    if(this.boundHost) return this.boundHost;
    let current = this.getRootNode();
    while(current instanceof ShadowRoot){
      const h = current.host;
      const found = h?.closest?.('[controlled]') || (h?.hasAttribute?.('controlled') ? h : null);
      if(found) return found;
      current = h.getRootNode();
    }
    return this.closest('[controlled]');
  }

  updateHostSupport() {
    const host = this.host;
    const required = this.constructor.requires || [];
    const supported = host && required.every(m => typeof host[m] === 'function');
    const shouldDisable = !supported;
    if(this.disabled !== shouldDisable) this.disabled = shouldDisable;
  }

  updateModeVisibility() {
    const required = this.constructor.hostMode;
    if(!required) return;
    const host = this.host;
    if(!host) return;
    /* If the host doesn't track modes (no `mode` property), the control
       is always visible — mode-restricted controls only filter on hosts
       that actually have modes. */
    if(!('mode' in host)) return;
    const allowed = Array.isArray(required) ? required : [required];
    const shouldHide = !allowed.includes(host.mode);
    if(this.hidden !== shouldHide) this.hidden = shouldHide;
  }

  invokeHost(method, ...args) {
    const host = this.host;
    if(host && typeof host[method] === 'function') return host[method](...args);
    return undefined;
  }

  /*
    Styles
  */
  static styles = css`
    :host {
      display: inline-flex;
    }
    :host([hidden]) {
      display: none !important;
    }
    :host([disabled]) {
      opacity: 0.5;
      pointer-events: none;
    }
  `;
}

customElements.define('kc-control', Control);
