import ButtonControl from './ButtonControl.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';

export default class TcExportCsv extends ButtonControl {
  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Export CSV';
  }

  get record() {
    const $rec = this.closest('.record');
    if($rec){
      const idx = $rec.dataset.index;
      if(idx !== undefined) return this.host?.records?.[idx];
    }
    return null;
  }

  getCSV() {
    const host = this.host;
    if(!host) return '';
    const fields = [];
    host.fields.forEach(({ name, calculator }) => { if(!calculator) fields.push(name); });
    let csv = fields.join(',') + '\n';
    const rec = this.record;
    if(rec){
      csv += fields.map(f => rec[f] || '').join(',') + '\n';
    } else {
      host.records.forEach(r => { csv += fields.map(f => r[f] || '').join(',') + '\n'; });
    }
    return csv;
  }

  export() { this.handleAction(); }

  handleAction() {
    const data = this.getCSV();
    const blob = new Blob([data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  render() {
    return html`<slot><k-icon name="export-file"></k-icon> Export CSV</slot>`;
  }

  static styles = [
    ButtonControl.styles,
    css`
      :host { gap: 0.25rem; padding: 0 var(--spacer_h, 0.5rem); }
    `
  ];
}

customElements.define('kc-tc-export-csv', TcExportCsv);
