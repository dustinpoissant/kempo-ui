import Control from './Control.js';
import { html, css } from '../../lit-all.min.js';

export default class TcPageSize extends Control {
  static hostEvents = ['pageChange', 'pageSizeChange'];

  handleChange = (e) => {
    this.host?.setPageSize(parseInt(e.target.value));
  };

  render() {
    const host = this.host;
    const current = host?.getPageSize?.() ?? 10;
    const options = host?.pageSizeOptions ?? [10, 25, 50, 100, 500];
    return html`
      <select @change=${this.handleChange}>
        ${options.map(size => html`<option value="${size}" ?selected="${size === current}">${size} per page</option>`)}
      </select>
    `;
  }

  static styles = [
    Control.styles,
    css`:host { margin: var(--spacer_q); }`
  ];
}

customElements.define('kc-tc-page-size', TcPageSize);
