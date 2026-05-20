import Control from './Control.js';
import { html, css } from '../../lit-all.min.js';

export default class TcPageSelect extends Control {
  static hostEvents = ['pageChange', 'pageSizeChange', 'pageCountChanged', 'recordsSet'];

  handleSelectChange = (e) => {
    this.host?.setPage(parseInt(e.target.value));
  };

  render() {
    const host = this.host;
    const current = host?.getCurrentPage?.() ?? 1;
    const total = host?.getTotalPages?.() ?? 1;
    const options = [];
    for(let i = 1; i <= total; i++){
      options.push(html`<option value="${i}" ?selected="${i === current}">Page ${i}</option>`);
    }
    return html`
      <div class="page-select">
        <select @change=${this.handleSelectChange} ?disabled=${total <= 1}>${options}</select>
        <label> out of ${total}</label>
      </div>
    `;
  }

  static styles = [
    Control.styles,
    css`
      .page-select { display: flex; align-items: center; gap: 0.25rem; white-space: nowrap; }
      label { padding: 0; margin: 0; }
    `
  ];
}

customElements.define('kc-tc-page-select', TcPageSelect);
