import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

const VIEWS = {
  tree: { icon: 'account_tree', title: 'Show only the widget tree', label: 'Widget tree' },
  page: { icon: 'smartphone', title: 'Show only the page', label: 'Page' },
  settings: { icon: 'settings', title: 'Show only the settings', label: 'Settings' }
};

/*
  One of the three single views a builder shows on a narrow screen (`view="tree|page|settings"`): the widget tree, the
  page or the settings, one at a time. It is active while the builder shows that view.
*/
export default class PbView extends ButtonControl {
  static requires = ['setView'];

  get view() {
    return this.getAttribute('view') in VIEWS ? this.getAttribute('view') : 'page';
  }

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = VIEWS[this.view].title;
  }

  handleAction() { this.host?.setView?.(this.view); }

  render() {
    const { icon, label } = VIEWS[this.view];
    return html`<slot><k-icon name="${icon}"></k-icon></slot><slot name="menu-text">${label}</slot>`;
  }
}

customElements.define('kc-pb-view', PbView);
