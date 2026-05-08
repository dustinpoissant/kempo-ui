import HtmlEditorControl from './HtmlEditorControl.js';
import {html, css} from '../../lit-all.min.js';
import '../Icon.js';

/*
  Mode Control
*/
export default class Mode extends HtmlEditorControl {

  static properties = {
    mode: {type: String, reflect: true}
  };

  hidesInCodeMode = false;

  /*
    Lifecycle Callbacks
  */
  connectedCallback(){
    super.connectedCallback();
    this.updateMode();
    this.editor?.addEventListener('mode-changed', () => this.updateMode());
  }

  /*
    Event Handlers
  */
  handleClick = () => {
    if(!this.editor) return;
    this.editor.toggleMode();
  };

  /*
    Utility Functions
  */
  updateMode(){
    if(!this.editor) return;
    this.mode = this.editor.mode;
  }


  /*
    Rendering
  */
  render(){
    const isCodeMode = this.mode === 'code';
    const buttonClass = isCodeMode ? `${this.buttonClasses} bg-primary` : this.buttonClasses;
    
    return html`
      <button class="${buttonClass}" @click="${this.handleClick}">
        <k-icon name="code"></k-icon>
      </button>
    `;
  }
}

customElements.define('k-hec-mode', Mode);
