import ButtonControl from './Button.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class TcHide extends ButtonControl {
  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Hide Record';
  }

  get record() {
    const $rec = this.closest('.record');
    if($rec){
      const idx = $rec.dataset.index;
      if(idx !== undefined) return this.host?.records?.[idx];
    }
    return null;
  }

  handleHide() { this.handleAction(); }

  handleAction() {
    const rec = this.record;
    if(rec) this.host?.hideRecord(rec);
  }

  render() { return html`<slot><k-icon name="hide"></k-icon></slot>`; }
}

customElements.define('kc-tc-hide', TcHide);
