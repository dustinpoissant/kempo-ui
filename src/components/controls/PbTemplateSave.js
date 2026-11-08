import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class PbTemplateSave extends ButtonControl {
  static requires = ['saveTemplate'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Save the selection as a template';
  }

  handleAction() { this.host?.saveTemplate?.(); }

  render() { return html`<slot><k-icon name="bookmark_add"></k-icon></slot><slot name="menu-text">Save as a template</slot>`; }
}

customElements.define('kc-pb-template-save', PbTemplateSave);
