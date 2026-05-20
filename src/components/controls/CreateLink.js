import ButtonControl from './Button.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';
import Dialog from '../Dialog.js';

export default class CreateLink extends ButtonControl {
  static requires = ['createLink'];
  static hostMode = 'visual';

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Insert Link';
  }

  handleAction() {
    const host = this.host;
    if(!host) return;
    const selectedText = host.getSelectedText?.() || '';

    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.placeholder = 'https://example.com';
    urlInput.style.cssText = 'padding: 0.5rem; border: 1px solid var(--c_border); border-radius: var(--radius); font: inherit;';

    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.placeholder = 'Enter link text';
    textInput.value = selectedText;
    textInput.style.cssText = 'padding: 0.5rem; border: 1px solid var(--c_border); border-radius: var(--radius); font: inherit;';

    const content = document.createElement('div');
    content.className = 'p';
    content.style.cssText = 'display: flex; flex-direction: column; gap: 1rem;';
    content.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <label style="font-weight: bold;">URL</label>
      </div>
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <label style="font-weight: bold;">Link Text</label>
      </div>
    `;
    content.children[0].appendChild(urlInput);
    content.children[1].appendChild(textInput);

    Dialog.create(content, {
      title: 'Create Link',
      cancelText: 'Cancel',
      confirmText: 'Insert Link',
      confirmClasses: 'success ml',
      confirmAction: (event) => {
        const url = urlInput.value.trim();
        const text = textInput.value.trim();
        if(!url){ event.keepDialogOpen = true; return; }
        if(host.selection && (!text || text === selectedText)) host.createLink(url);
        else host.createLinkWithText?.(url, text || url);
      }
    });
  }

  render() { return html`<slot><k-icon name="link"></k-icon></slot>`; }
}

customElements.define('kc-create-link', CreateLink);
