import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

/*
  Toggles between paragraph and <pre> code block in visual mode.
  Calls host.formatBlock('pre') or 'p' based on isSelectionInCodeBlock.
*/
export default class CodeBlock extends ButtonControl {
  static requires = ['formatBlock'];
  static hostMode = 'visual';

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Code Block';
  }

  handleAction() {
    const host = this.host;
    const inCode = host?.isSelectionInCodeBlock?.();
    this.invokeHost('formatBlock', inCode ? 'p' : 'pre');
  }

  render() { return html`<slot><k-icon name="code_blocks"></k-icon></slot>`; }
}

customElements.define('kc-code-block', CodeBlock);
