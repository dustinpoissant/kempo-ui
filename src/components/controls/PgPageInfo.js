import Control from './Control.js';
import { html, css } from '../../lit-all.min.js';

export default class PgPageInfo extends Control {
  static hostEvents = ['page-change'];

  render() {
    const host = this.host;
    const current = host?.page ?? 1;
    const total = host?.totalPages ?? 1;
    return html`<span class="info">Page ${current} of ${total}</span>`;
  }

  static styles = [
    Control.styles,
    css`
      .info { padding: 0 var(--spacer_q, 0.25rem); white-space: nowrap; }
    `
  ];
}

customElements.define('kc-pg-page-info', PgPageInfo);
