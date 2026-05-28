import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class FindReplace extends ButtonControl {
  static requires = ['openFind'];
  static hostMode = 'code';

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Find & Replace';
  }

  handleAction() { this.host?.openFind?.(); }

  render() { return html`<slot><k-icon name="search"></k-icon></slot>`; }
}

customElements.define('kc-find-replace', FindReplace);
