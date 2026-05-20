import ButtonControl from './Button.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

/*
  Mode toggle (visual <-> code) — visible in all modes where the host
  exposes toggleMode.
*/
export default class Mode extends ButtonControl {
  static requires = ['toggleMode'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Toggle Code View';
  }

  updated(changed) {
    super.updated(changed);
    const host = this.host;
    if(host) this.toggleAttribute('active', host.mode === 'code');
  }

  get mode() { return this.host?.mode; }

  handleAction() { this.invokeHost('toggleMode'); }

  render() { return html`<slot><k-icon name="code"></k-icon></slot>`; }
}

customElements.define('kc-mode', Mode);
