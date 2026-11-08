import CodeSettings from './CodeSettings.js';
import { html } from '../../lit-all.min.js';

/*
  The settings of a Script: a script file and how it loads (the declared settings), or, when there is no file, the
  JavaScript written here, edited in the code editor dialog (see CodeSettings). The script runs in the page where the widget
  is placed, so the scripts location is the place for shared code.
*/
export default class ScriptSettings extends CodeSettings {
  /*
    Protected Members
  */
  get codeSetting() {
    return 'code';
  }

  get codeLanguage() {
    return 'javascript';
  }

  get codeTitle() {
    return 'Edit JavaScript';
  }

  get codeSaveText() {
    return 'Save JavaScript';
  }

  /*
    Rendering
  */
  render() {
    if(!this.node) return '';
    const file = !!this.node.attrs?.src;
    return html`
      ${this.renderFields(['code'])}
      ${this.renderCode({ disabled: file, note: file ? 'There is a script file, so the JavaScript written here is not used. Clear the file to write it.' : 'Used when there is no script file. Its code runs on the page.' })}
    `;
  }
}

customElements.define('k-page-builder-script-settings', ScriptSettings);
