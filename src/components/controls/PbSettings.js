import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class PbSettings extends ButtonControl {
  static requires = ['toggleSettings'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Show or hide the settings';
  }

  handleAction() { this.host?.toggleSettings?.(); }

  render() { return html`<slot><k-icon name="settings"></k-icon></slot><slot name="menu-text">Settings panel</slot>`; }
}

customElements.define('kc-pb-settings', PbSettings);
