import ButtonControl from './ButtonControl.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';

export default class AudioShuffle extends ButtonControl {
  static requires = ['toggleShuffle'];
  static hostEvents = ['shuffle-changed'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Shuffle';
  }

  updated(changed) {
    super.updated(changed);
    this.toggleAttribute('active', !!this.host?.shuffled);
    this.setAttribute('aria-pressed', String(!!this.host?.shuffled));
  }

  handleAction() { this.host?.toggleShuffle?.(); }

  render() { return html`<slot><k-icon name="shuffle"></k-icon></slot><slot name="menu-text">Shuffle</slot>`; }

  static styles = [
    ...ButtonControl.styles,
    css`
      :host([active]) {
        color: var(--tc_primary);
      }
    `
  ];
}

customElements.define('kc-audio-shuffle', AudioShuffle);
