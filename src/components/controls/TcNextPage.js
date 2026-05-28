import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class TcNextPage extends ButtonControl {
  static hostEvents = ['pageChange'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Next Page';
  }

  willUpdate(changed) {
    super.willUpdate(changed);
    const host = this.host;
    this.disabled = !host || host.getCurrentPage() === host.getTotalPages();
  }

  handleAction() { this.host?.nextPage(); }

  render() { return html`<slot><k-icon name="chevron"></k-icon></slot>`; }
}

customElements.define('kc-tc-next-page', TcNextPage);
