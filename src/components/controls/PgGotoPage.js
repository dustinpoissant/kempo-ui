import Control from './Control.js';
import { html, css } from '../../lit-all.min.js';

export default class PgGotoPage extends Control {
  static hostEvents = ['page-change'];

  handleChange = (e) => {
    const host = this.host;
    if(!host) return;
    const page = parseInt(e.target.value, 10);
    if(!isNaN(page)) host.page = Math.min(Math.max(page, 1), host.totalPages);
    e.target.value = String(host.page);
  };

  render() {
    const host = this.host;
    return html`
      <div class="field">
        <input
          type="number"
          min="1"
          max=${host?.totalPages ?? 1}
          .value=${String(host?.page ?? 1)}
          title="Go to page"
          aria-label="Go to page"
          @change=${this.handleChange}
        />
      </div>
      <slot name="menu-text">Go to page</slot>
    `;
  }

  static styles = [
    Control.styles,
    css`
      .field { display: flex; flex: 0 0 auto; width: 5rem; align-self: stretch; }
      input { padding: 0 var(--spacer_h, 0.5rem); }
      :host([in-menu]) { gap: var(--spacer_h, 0.5rem); }
      :host([in-menu]) .field { width: 4.5rem; align-self: center; }
      :host([in-menu]) slot[name="menu-text"] { white-space: nowrap; }
    `
  ];
}

customElements.define('kc-pg-goto-page', PgGotoPage);
