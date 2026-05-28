import ButtonControl from './ButtonControl.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';

export default class TcExportJson extends ButtonControl {
  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Export JSON';
  }

  get record() {
    const $rec = this.closest('.record');
    if($rec){
      const idx = $rec.dataset.index;
      if(idx !== undefined) return this.host?.records?.[idx];
    }
    return null;
  }

  export() { this.handleAction(); }

  handleAction() {
    const rec = this.record;
    const data = rec ? JSON.stringify(rec) : JSON.stringify(this.host?.records || []);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  render() {
    return html`<slot><k-icon name="export-file"></k-icon> Export JSON</slot>`;
  }

  static styles = [
    ButtonControl.styles,
    css`
      :host { gap: 0.25rem; padding: 0 var(--spacer_h, 0.5rem); }
    `
  ];
}

customElements.define('kc-tc-export-json', TcExportJson);
