import WidgetSettings from './WidgetSettings.js';
import { html } from '../../lit-all.min.js';
import '../CodeEditor.js';
import Dialog from '../Dialog.js';

/*
  The base of the settings of a widget whose setting is code (HTML, JavaScript): an Open code editor button that opens the
  full code editor in a dialog that nearly fills the screen. The dialog is opened on the page (`Dialog.create`), not inside the
  panel, so it is above everything on it, such as a site's side navigation. Save stores the code exactly as written, as one step, so nothing
  is cleaned. A subclass says which setting it is (`codeSetting`), the language of the editor (`codeLanguage`) and the title
  of the dialog (`codeTitle`) and its Save button (`codeSaveText`), and puts `renderCode()` in its own `render()`.
*/
export default class CodeSettings extends WidgetSettings {
  /*
    Protected Members
  */
  get codeSetting() {
    return 'code';
  }

  get codeLanguage() {
    return 'plaintext';
  }

  get codeTitle() {
    return 'Edit code';
  }

  get codeSaveText() {
    return 'Save';
  }

  /*
    Event Handlers
  */
  handleOpen = () => {
    let draft = this.node.attrs?.[this.codeSetting] ?? '';
    Dialog.create(html`
      <div class="p">
        <k-code-editor language="${this.codeLanguage}" controls="full" style="height: calc(94vh - 10.5rem); min-height: 20rem;" .value="${draft}" @change="${event => { draft = event.target.value; }}"></k-code-editor>
      </div>
    `, {
      title: this.codeTitle,
      confirmText: this.codeSaveText,
      cancelText: 'Cancel',
      width: '96vw',
      height: '94vh',
      confirmAction: () => this.set(this.codeSetting, draft, false)
    });
  };

  /*
    Rendering
  */
  /* The button with a note under it. `disabled` turns the button off, with the note saying why. */
  renderCode({ note = '', disabled = false } = {}) {
    return html`
      <div class="mb">
        <button class="primary full" ?disabled="${disabled}" @click="${this.handleOpen}">Open code editor</button>
        ${note ? html`<small class="d-b tc-muted mt">${note}</small>` : ''}
      </div>
    `;
  }
}
