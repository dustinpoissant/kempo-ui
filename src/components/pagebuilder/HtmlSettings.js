import CodeSettings from './CodeSettings.js';

/*
  The settings of an HTML widget: its markup, edited in the code editor dialog (see CodeSettings). It is shown on the page
  exactly as it is written.
*/
export default class HtmlSettings extends CodeSettings {
  /*
    Protected Members
  */
  get codeSetting() {
    return 'html';
  }

  get codeLanguage() {
    return 'html';
  }

  get codeTitle() {
    return 'Edit HTML';
  }

  get codeSaveText() {
    return 'Save HTML';
  }

  /*
    Rendering
  */
  render() {
    if(!this.node) return '';
    return this.renderCode({ note: 'Shown on the page exactly as it is written. Nothing is changed, so write only markup you trust.' });
  }
}

customElements.define('k-page-builder-html-settings', HtmlSettings);
