import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class PbReset extends ButtonControl {
  static requires = ['reset'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Discard the changes since the page was last saved';
  }

  handleAction() { this.host?.reset?.(); }

  render() { return html`<slot><k-icon name="restore_page"></k-icon></slot><slot name="menu-text">Reset Page</slot>`; }
}

customElements.define('kc-pb-reset', PbReset);
