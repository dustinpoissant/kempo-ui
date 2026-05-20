import Control from './Control.js';
import { html, css } from '../../lit-all.min.js';

export default class PgItemsPerPage extends Control {
  static hostEvents = ['page-change'];

  handleChange = (e) => {
    const host = this.host;
    if(host) host.itemsPerPage = parseInt(e.target.value, 10);
  };

  render() {
    const host = this.host;
    const current = host?.itemsPerPage ?? 10;
    const options = host?.pageSizes ?? [5, 10, 25, 50, 100];
    return html`
      <label>
        <slot>Items per page:</slot>
        <select @change=${this.handleChange}>
          ${options.map(n => html`<option value=${n} ?selected=${n === current}>${n}</option>`)}
        </select>
      </label>
    `;
  }

  static styles = [
    Control.styles,
    css`
      :host { align-items: center; }
      label { display: inline-flex; align-items: center; gap: var(--spacer_q, 0.25rem); padding: 0; white-space: nowrap; }
      select { min-height: 2.5rem; box-sizing: border-box; }
    `
  ];
}

customElements.define('kc-pg-items-per-page', PgItemsPerPage);
