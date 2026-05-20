import ButtonControl from './Button.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class Fullscreen extends ButtonControl {
  static requires = ['toggleFullscreen'];
  static hostEvents = ['fullscreen-changed'];

  static properties = {
    ...ButtonControl.properties,
    fullscreen: { type: Boolean, state: true }
  };

  constructor() {
    super();
    this.fullscreen = false;
  }

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Fullscreen';
    if(this.host) this.fullscreen = !!this.host.fullscreen;
  }

  willUpdate(changed) {
    super.willUpdate?.(changed);
    if(this.host) this.fullscreen = !!this.host.fullscreen;
  }

  updated(changed) {
    super.updated(changed);
    if(changed.has('fullscreen')) this.toggleAttribute('active', this.fullscreen);
  }

  handleAction() { this.invokeHost('toggleFullscreen'); }

  render() {
    return html`<slot><k-icon name="${this.fullscreen ? 'fullscreen_exit' : 'fullscreen'}"></k-icon></slot>`;
  }
}

customElements.define('kc-fullscreen', Fullscreen);
