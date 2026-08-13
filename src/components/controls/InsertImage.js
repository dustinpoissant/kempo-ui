import Control from './Control.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';
import '../Dropdown.js';

/*
  Inserts an image into HtmlEditor. The counterpart to kc-md-image, which does the same job for
  MarkdownEditor, and it deliberately behaves the same way so an author meets one interface
  whichever editor they are in.

  Typing a URL is the baseline and needs nothing from the host. A host that has somewhere to browse
  — a media library, an asset manager, a desktop app's own file store — can additionally set
  window.kempo.openAssetPicker, and a Browse button appears. That hook is the only extension point
  and it is host-agnostic: this control knows nothing about where images come from, only how to ask.
*/
export default class InsertImage extends Control {
  static properties = {
    ...Control.properties,
    hasPicker: { type: Boolean, state: true }
  };

  static requires = ['insertImage'];

  constructor() {
    super();
    this.hasPicker = false;
  }

  handleDropdownOpened = () => {
    /*
      Resolved on open rather than at first render, so a host can install the picker at any point
      before the control is used — the same lazy contract as window.kempo.overlayRoot.
    */
    this.hasPicker = typeof window.kempo?.openAssetPicker === 'function';
    requestAnimationFrame(() => this.shadowRoot.querySelector('.image-url')?.focus());
  };

  handleDropdownClosed = () => {
    const url = this.shadowRoot.querySelector('.image-url');
    const alt = this.shadowRoot.querySelector('.image-alt');
    if(url) url.value = '';
    if(alt) alt.value = '';
  };

  handleFormKeydown = (e) => {
    if(e.key === 'Enter'){ e.preventDefault(); this.submit(); }
    else if(e.key === 'Escape') this.shadowRoot.querySelector('k-dropdown')?.close();
  };

  submit() {
    const url = this.shadowRoot.querySelector('.image-url').value.trim();
    const alt = this.shadowRoot.querySelector('.image-alt').value.trim();
    if(!url){ this.shadowRoot.querySelector('.image-url').focus(); return; }
    this.host?.insertImage?.(url, { alt });
    this.shadowRoot.querySelector('k-dropdown')?.close();
  }

  browseLibrary = async () => {
    const picker = window.kempo?.openAssetPicker;
    if(typeof picker !== 'function') return;

    const alt = this.shadowRoot.querySelector('.image-alt')?.value.trim() || '';
    // Closed first so the picker's own overlay is not fighting the dropdown's click-outside handler
    this.shadowRoot.querySelector('k-dropdown')?.close();

    let result;
    try {
      result = await picker({ alt });
    } catch(e) {
      // A picker that throws should not take the editor down with it
      console.error('[kc-insert-image] openAssetPicker failed:', e);
      return;
    }
    // null, undefined, or no url all mean "cancelled" — insert nothing
    if(!result?.url) return;

    this.host?.insertImage?.(result.url, { alt: result.alt ?? alt });
  };

  render() {
    return html`
      <k-dropdown @opened=${this.handleDropdownOpened} @closed=${this.handleDropdownClosed}>
        <button slot="trigger" type="button" class="trigger" title="Image"><k-icon name="image"></k-icon></button>
        <div class="image-form" @keydown=${this.handleFormKeydown}>
          <label>Image URL</label>
          <input class="image-url" type="url" required placeholder="https://example.com/image.png" />
          <label>Alt text</label>
          <input class="image-alt" type="text" placeholder="Description for screen readers" />
          <div class="image-actions">
            ${this.hasPicker ? html`
              <button type="button" class="browse" @click=${this.browseLibrary}>Browse…</button>
            ` : ''}
            <button type="button" @click=${() => this.shadowRoot.querySelector('k-dropdown').close()}>Cancel</button>
            <button type="button" class="primary" @click=${() => this.submit()}>Insert</button>
          </div>
        </div>
      </k-dropdown>
    `;
  }

  static styles = [
    Control.styles,
    css`
      .trigger { min-width: 2.5rem; min-height: 2.5rem; background: transparent; border: none; cursor: pointer; }
      .image-form { display: flex; flex-direction: column; gap: 0.5rem; padding: 0.75rem; min-width: 16rem; }
      .image-form label { font-weight: bold; font-size: 0.875rem; }
      .image-form input { padding: 0.5rem; border: 1px solid var(--c_border); border-radius: var(--radius); font: inherit; }
      .image-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.25rem; }
      .image-actions button { padding: 0.4rem 0.8rem; border: 1px solid var(--c_border); border-radius: var(--radius); cursor: pointer; font: inherit; }
      .image-actions button.primary { background: var(--c_primary); color: white; border-color: var(--c_primary); }
      /* Pushed left so it reads as an alternative to typing a URL, not a third confirm */
      .image-actions button.browse { margin-right: auto; }
    `
  ];
}

customElements.define('kc-insert-image', InsertImage);
