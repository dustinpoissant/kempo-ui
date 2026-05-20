import Control from './Control.js';
import { html, css } from '../../lit-all.min.js';
import '../Combobox.js';

export default class PgGotoPage extends Control {
  static hostEvents = ['page-change'];

  handleInput = (e) => {
    const host = this.host;
    if(host && e.target.value){
      const page = parseInt(e.target.value, 10);
      if(!isNaN(page) && page > 0) host.page = page;
    }
  };

  handleBlur = (e) => {
    const host = this.host;
    if(host) e.target.value = String(host.page);
  };

  render() {
    const host = this.host;
    const current = host?.page ?? 1;
    const total = host?.totalPages ?? 1;
    return html`
      <k-combobox
        .value=${String(current)}
        @input=${this.handleInput}
        @blur=${this.handleBlur}
        placeholder="page"
        no-results-message="Invalid Page"
      >
        ${Array.from({ length: total }, (_, i) => html`
          <k-option value=${i + 1}>${i + 1}</k-option>
        `)}
      </k-combobox>
    `;
  }

  static styles = [
    Control.styles,
    css`
      k-combobox { width: 5rem; }
    `
  ];
}

customElements.define('kc-pg-goto-page', PgGotoPage);
