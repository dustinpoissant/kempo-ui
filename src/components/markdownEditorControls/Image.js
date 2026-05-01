import MarkdownEditorControl from './MarkdownEditorControl.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';
import '../Dropdown.js';
import Dialog from '../Dialog.js';

/*
  Image control. Asks the user for a URL and alt text, then inserts a
  markdown image (`![alt](url)`) at the cursor.

  The popup type is configurable via the `popup` attribute:
    popup="dropdown" (default) — anchored popover next to the button
    popup="dialog"             — modal Dialog centered on the page

  If the user has text selected when they click the button, it's pre-filled
  into the alt text field.
*/
export default class MarkdownImage extends MarkdownEditorControl {
  static properties = {
    ...MarkdownEditorControl.properties,
    popup: { type: String, reflect: true }
  };

  constructor() {
    super();
    this.label = 'Image';
    this.popup = 'dropdown';
  }

  /*
    For dropdown mode the trigger button toggles the dropdown via Dropdown's
    own click handling — we don't want our base-class handleClick (which
    calls command()) to fire on top, or it would create a feedback loop.
    Override command() to do nothing in dropdown mode; the Insert button
    inside the dropdown drives insertion instead.
  */
  command() {
    if(this.popup === 'dialog') this.#openDialog();
  }

  #insert(url, alt) {
    if(!url) return false;
    this.editor?.replaceSelection(`![${alt}](${url})`, { selectInserted: false });
    return true;
  }

  /*
    Dropdown flow — inline popover form.
  */
  handleDropdownOpened = () => {
    requestAnimationFrame(() => {
      this.#urlInput?.focus();
      // Pre-fill alt text with the current selection (if any).
      const sel = this.getSelection();
      if(this.#altInput) this.#altInput.value = sel.text || '';
    });
  };

  handleDropdownClosed = () => {
    if(this.#urlInput) this.#urlInput.value = '';
    if(this.#altInput) this.#altInput.value = '';
  };

  handleFormKeydown = (e) => {
    if(e.key === 'Enter'){
      e.preventDefault();
      this.#submitFromDropdown();
    } else if(e.key === 'Escape'){
      this.shadowRoot?.querySelector('k-dropdown')?.close();
    }
  };

  handleInsertClick = () => this.#submitFromDropdown();

  handleCancelClick = () => {
    this.shadowRoot?.querySelector('k-dropdown')?.close();
  };

  #submitFromDropdown() {
    const url = this.#urlInput?.value.trim() || '';
    const alt = this.#altInput?.value.trim() || '';
    if(!url){
      this.#urlInput?.focus();
      return;
    }
    this.#insert(url, alt);
    this.shadowRoot?.querySelector('k-dropdown')?.close();
  }

  get #urlInput() { return this.shadowRoot?.querySelector('.image-url'); }
  get #altInput() { return this.shadowRoot?.querySelector('.image-alt'); }

  /*
    Dialog flow — modal version, kept for consumers who want it.
  */
  #openDialog() {
    const editor = this.editor;
    if(!editor) return;
    const sel = this.getSelection();

    const urlInput = document.createElement('input');
    urlInput.type = 'url';
    urlInput.placeholder = 'https://example.com/image.png';
    urlInput.required = true;
    urlInput.style.cssText = 'padding: 0.5rem; border: 1px solid var(--c_border); border-radius: var(--radius); font: inherit;';

    const altInput = document.createElement('input');
    altInput.type = 'text';
    altInput.placeholder = 'Description for screen readers';
    altInput.value = sel.text || '';
    altInput.style.cssText = 'padding: 0.5rem; border: 1px solid var(--c_border); border-radius: var(--radius); font: inherit;';

    const content = document.createElement('div');
    content.className = 'p';
    content.style.cssText = 'display: flex; flex-direction: column; gap: 1rem;';
    content.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 0.25rem;">
        <label style="font-weight: bold;">Image URL</label>
      </div>
      <div style="display: flex; flex-direction: column; gap: 0.25rem;">
        <label style="font-weight: bold;">Alt text</label>
      </div>
    `;
    content.children[0].appendChild(urlInput);
    content.children[1].appendChild(altInput);

    Dialog.create(content, {
      title: 'Insert Image',
      cancelText: 'Cancel',
      confirmText: 'Insert',
      confirmClasses: 'success ml',
      confirmAction: (event) => {
        const url = urlInput.value.trim();
        if(!url){
          event.keepDialogOpen = true;
          urlInput.focus();
          return;
        }
        this.#insert(url, altInput.value.trim());
      }
    });
    queueMicrotask(() => urlInput.focus());
  }

  render() {
    if(this.popup === 'dialog'){
      return html`
        <button
          type="button"
          class=${this.btnClass}
          title=${this.label}
          aria-label=${this.label}
          @click=${this.handleClick}
        >
          <k-icon name="image"></k-icon>
        </button>
      `;
    }
    return html`
      <k-dropdown
        @opened=${this.handleDropdownOpened}
        @closed=${this.handleDropdownClosed}
      >
        <button
          slot="trigger"
          type="button"
          class=${this.btnClass}
          title=${this.label}
          aria-label=${this.label}
        >
          <k-icon name="image"></k-icon>
        </button>
        <div class="image-form" @keydown=${this.handleFormKeydown}>
          <label>Image URL</label>
          <input
            class="image-url"
            type="url"
            required
            placeholder="https://example.com/image.png"
          />
          <label>Alt text</label>
          <input
            class="image-alt"
            type="text"
            placeholder="Description for screen readers"
          />
          <div class="image-actions">
            <button type="button" class="no-btn" @click=${this.handleCancelClick}>Cancel</button>
            <button type="button" class="no-btn primary" @click=${this.handleInsertClick}>Insert</button>
          </div>
        </div>
      </k-dropdown>
    `;
  }

  static styles = [
    MarkdownEditorControl.styles,
    css`
      .image-form {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 0.75rem;
        min-width: 16rem;
      }
      .image-form label {
        font-weight: bold;
        font-size: 0.875rem;
      }
      .image-form input {
        padding: 0.5rem;
        border: 1px solid var(--c_border);
        border-radius: var(--radius);
        font: inherit;
        background: var(--c_bg);
        color: var(--tc);
      }
      .image-form input:focus-visible {
        outline: none;
        box-shadow: var(--focus_shadow);
      }
      .image-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
        margin-top: 0.25rem;
      }
      .image-actions button {
        padding: 0.4rem 0.8rem;
        border: 1px solid var(--c_border);
        border-radius: var(--radius);
        background: var(--c_bg);
        color: var(--tc);
        cursor: pointer;
        font: inherit;
      }
      .image-actions button.primary {
        background: var(--c_primary);
        color: white;
        border-color: var(--c_primary);
      }
      .image-actions button:focus-visible {
        outline: none;
        box-shadow: var(--focus_shadow);
      }
    `
  ];
}

customElements.define('k-md-image', MarkdownImage);
