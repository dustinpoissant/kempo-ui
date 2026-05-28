import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class FoldAll extends ButtonControl {
  static requires = ['foldAll', 'unfoldAll'];
  static hostMode = 'code';

  static properties = {
    ...ButtonControl.properties,
    folded: { type: Boolean, state: true }
  };

  constructor() {
    super();
    this.folded = false;
  }

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Fold All';
  }

  handleAction() {
    this.folded = !this.folded;
    if(this.folded) this.host?.foldAll?.();
    else this.host?.unfoldAll?.();
  }

  render() {
    return html`<slot><k-icon name="${this.folded ? 'unfold_more' : 'unfold_less'}"></k-icon></slot>`;
  }
}

customElements.define('kc-fold-all', FoldAll);
