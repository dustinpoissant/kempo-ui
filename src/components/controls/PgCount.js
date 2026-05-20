import Control from './Control.js';
import { html } from '../../lit-all.min.js';

export default class PgPageCount extends Control {
  static hostEvents = ['page-change'];

  render() {
    return html`<span>${this.host?.totalPages ?? 1}</span>`;
  }
}

customElements.define('kc-pg-count', PgPageCount);
