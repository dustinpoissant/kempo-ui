import Control from './Control.js';
import { html, css } from '../../lit-all.min.js';

export default class TcHiddenCount extends Control {
  static hostEvents = ['recordHidden', 'recordShown'];

  static properties = {
    ...Control.properties,
    hiddenCount: { type: Number, state: true }
  };

  constructor() {
    super();
    this.hiddenCount = 0;
  }

  connectedCallback() {
    super.connectedCallback();
    this.updateCount();
  }

  willUpdate(changed) {
    super.willUpdate?.(changed);
    this.updateCount();
  }

  updateHiddenCount() { this.updateCount(); }
  handleHiddenChange() { this.updateCount(); }

  updateCount() {
    this.hiddenCount = this.host?.getHiddenRecords?.()?.length || 0;
  }

  render() {
    return html`<div><span>${this.hiddenCount}</span> Hidden Records</div>`;
  }

  static styles = [
    Control.styles,
    css`:host { margin: var(--spacer_q); }`
  ];
}

customElements.define('kc-tc-hidden-count', TcHiddenCount);
