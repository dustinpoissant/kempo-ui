import Control from './Control.js';
import { html, css } from '../../lit-all.min.js';

export default class CharacterCount extends Control {
  static hostEvents = ['change', 'ready'];

  static properties = {
    ...Control.properties,
    count: { type: Number, state: true }
  };

  constructor() {
    super();
    this.count = 0;
  }

  connectedCallback() {
    super.connectedCallback();
    setTimeout(() => this.updateCount(), 0);
  }

  willUpdate(changed) {
    super.willUpdate?.(changed);
    this.updateCount();
  }

  updateCount() {
    const host = this.host;
    if(!host || typeof host.getValue !== 'function') return;
    const val = host.getValue() || '';
    const text = val.includes('<') ? (new DOMParser().parseFromString(val, 'text/html').body.innerText || '') : val;
    this.count = text.length;
  }

  render() {
    return html`<span class="character-count"><slot name="label">Characters:</slot> ${this.count}</span>`;
  }

  static styles = [
    Control.styles,
    css`
      :host { align-items: center; padding: 0 0.5rem; font-size: 0.875rem; color: var(--tc_muted, #666); }
      .character-count { display: flex; align-items: center; gap: 0.25rem; }
    `
  ];
}

customElements.define('kc-character-count', CharacterCount);
