import Control from './Control.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';

export default class TcEdit extends Control {
  static hostEvents = ['editingChange'];

  static properties = {
    ...Control.properties,
    isEditing: { type: Boolean, state: true }
  };

  constructor() {
    super();
    this.isEditing = false;
  }

  get record() {
    const $rec = this.closest('.record');
    if($rec){
      const idx = $rec.dataset.index;
      if(idx !== undefined) return this.host?.records?.[idx];
    }
    return null;
  }

  connectedCallback() {
    super.connectedCallback();
    const host = this.host;
    if(host){
      host.addEventListener('editingChange', (e) => {
        if(e.detail.record === this.record) this.isEditing = e.detail.editing;
      });
    }
  }

  handleEdit = () => {
    const rec = this.record;
    if(rec) this.host?.editRecord(rec);
  };

  handleSave = () => {
    const rec = this.record;
    if(rec) this.host?.saveEditedRecord(rec);
  };

  handleCancel = () => {
    const rec = this.record;
    if(rec) this.host?.cancelEditedRecord(rec);
  };

  render() {
    return this.isEditing ? html`
      <button class="no-btn edit-btn save" @click=${this.handleSave}><k-icon name="check"></k-icon></button>
      <button class="no-btn edit-btn cancel" @click=${this.handleCancel}><k-icon name="close"></k-icon></button>
    ` : html`
      <button class="no-btn edit-btn" @click=${this.handleEdit}><k-icon name="edit"></k-icon></button>
    `;
  }

  static styles = [
    Control.styles,
    css`
      :host { align-items: baseline; gap: 0.25rem; margin: var(--spacer_q); }
      .edit-btn { background: transparent; border: 1px solid var(--c_border); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; min-width: 2rem; min-height: 2rem; padding: var(--spacer_h); border-radius: var(--radius); }
      .edit-btn:hover { background: oklch(from var(--c_bg__inv) l c h / 0.15); }
      .save { color: var(--c_success, green); }
      .cancel { color: var(--c_danger, red); }
    `
  ];
}

customElements.define('kc-tc-edit', TcEdit);
