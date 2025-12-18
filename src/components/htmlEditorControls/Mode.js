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
    this.editor.mode = this.editor.mode === 'visual' ? 'code' : 'visual';
  };

  /*
    Utility Functions
  */
  updateMode(){
    if(!this.editor) return;
    this.mode = this.editor.mode;
  }

  /*
    Styles
  */
  static styles = [
    HtmlEditorControl.styles,
    css`
      :host {
        display: inline-flex;
      }
    `
  ];

  /*
    Rendering
  */
  render(){
    const isCodeMode = this.mode === 'code';
    const buttonClass = isCodeMode ? `${this.buttonClasses} bg-primary` : this.buttonClasses;
    
    return html`
      <button class="${buttonClass}" @click="${this.handleClick}">
        <k-icon src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/code/default/24px.svg"></k-icon>
      </button>
    `;
  }
}

customElements.define('k-hec-mode', Mode);
