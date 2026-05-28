import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class TcShowAll extends ButtonControl {
  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Show All Records';
  }

  handleShowAll() { this.handleAction(); }

  handleAction() { this.host?.showAllRecords(); }

  render() { return html`<slot><k-icon name="show"></k-icon></slot>`; }
}

customElements.define('kc-tc-show-all', TcShowAll);
