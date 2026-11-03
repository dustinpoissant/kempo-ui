import ButtonControl from './ButtonControl.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';

export default class MediaRepeat extends ButtonControl {
  static requires = ['toggleLoop'];
  static hostEvents = ['loop-changed'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Repeat';
  }

  updated(changed) {
    super.updated(changed);
    this.toggleAttribute('active', !!this.host?.loop);
  }

  handleAction() { this.host?.toggleLoop?.(); }

  render() { return html`<slot><k-icon name="repeat_one"></k-icon></slot><slot name="menu-text">Repeat</slot>`; }

  static styles = [
    ...ButtonControl.styles,
    css`
      :host([active]) {
        color: var(--tc_primary);
      }
    `
  ];
}

customElements.define('kc-media-repeat', MediaRepeat);
