import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class TcDeleteRecord extends ButtonControl {
  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Delete Record';
  }

  get record() {
    const $rec = this.closest('.record');
    if($rec){
      const idx = $rec.dataset.index;
      if(idx !== undefined) return this.host?.records?.[idx];
    }
    return null;
  }

  delete() { this.handleAction(); }

  handleAction() {
    const rec = this.record;
    if(rec) this.host?.deleteRecord(rec);
  }

  render() { return html`<slot><k-icon name="delete"></k-icon></slot>`; }
}

customElements.define('kc-tc-delete-record', TcDeleteRecord);
