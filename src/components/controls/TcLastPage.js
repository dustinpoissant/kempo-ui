import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class TcLastPage extends ButtonControl {
  static hostEvents = ['pageChange'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Last Page';
  }

  willUpdate(changed) {
    super.willUpdate(changed);
    const host = this.host;
    this.disabled = !host || host.getCurrentPage() === host.getTotalPages();
  }

  handleAction() { this.host?.lastPage(); }

  render() { return html`<slot><k-icon name="chevron-line"></k-icon></slot>`; }
}

customElements.define('kc-tc-last-page', TcLastPage);
