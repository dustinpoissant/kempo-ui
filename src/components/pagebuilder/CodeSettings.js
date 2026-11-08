import WidgetSettings from './WidgetSettings.js';
import { html, css, ref, createRef } from '../../lit-all.min.js';
import '../CodeEditor.js';
import '../Dialog.js';

/*
  The base of the settings of a widget whose setting is code (HTML, JavaScript): an Open code editor button that opens the
  full code editor in a dialog that nearly fills the screen. Save stores the code exactly as written, as one step, so nothing
  is cleaned. A subclass says which setting it is (`codeSetting`), the language of the editor (`codeLanguage`) and the title
  of the dialog (`codeTitle`) and its Save button (`codeSaveText`), and puts `renderCode()` in its own `render()`.
*/
export default class CodeSettings extends WidgetSettings {
  /*
    Reactive Properties / Attributes
  */
  static properties = {
    ...WidgetSettings.properties,
    dialogOpen: { state: true },
    draft: { state: true }
  };

  /*
    Constructor
  */
  constructor() {
    super();
    this.dialogOpen = false;
    this.draft = '';
    this.dialogRef = createRef();
  }

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
  handleOpen = async () => {
    this.draft = this.node.attrs?.[this.codeSetting] ?? '';
    this.dialogOpen = true;
    await this.updateComplete;
    this.dialogRef.value.open();
  };

  handleChange = event => {
    this.draft = event.target.value;
  };

  handleSave = () => {
    this.set(this.codeSetting, this.draft, false);
  };

  handleClose = () => {
    this.dialogOpen = false;
  };

  /*
    Rendering
  */
  /* The button with a note under it, and the dialog. `disabled` turns the button off, with the note saying why. */
  renderCode({ note = '', disabled = false } = {}) {
    return html`
      <div class="mb">
        <button class="primary full" ?disabled="${disabled}" @click="${this.handleOpen}">Open code editor</button>
        ${note ? html`<small class="d-b tc-muted mt">${note}</small>` : ''}
      </div>
      <k-dialog ${ref(this.dialogRef)} confirm-text="${this.codeSaveText}" cancel-text="Cancel" .confirmAction="${this.handleSave}" @close="${this.handleClose}">
        <h5 slot="title" class="pyh px m0">${this.codeTitle}</h5>
        ${this.dialogOpen ? html`
          <div class="p">
            <k-code-editor language="${this.codeLanguage}" controls="full" .value="${this.draft}" @change="${this.handleChange}"></k-code-editor>
          </div>` : ''}
      </k-dialog>
    `;
  }

  static styles = css`
    k-dialog {
      --width: 96vw;
      --height: 94vh;
    }
    k-code-editor {
      height: calc(94vh - 10.5rem);
      min-height: 20rem;
    }
  `;
}
