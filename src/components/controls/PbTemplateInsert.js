import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class PbTemplateInsert extends ButtonControl {
  static requires = ['insertTemplate'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Insert a template';
  }

  handleAction() { this.host?.insertTemplate?.(); }

  render() { return html`<slot><k-icon name="library_add"></k-icon></slot><slot name="menu-text">Insert a template</slot>`; }
}

customElements.define('kc-pb-template-insert', PbTemplateInsert);
