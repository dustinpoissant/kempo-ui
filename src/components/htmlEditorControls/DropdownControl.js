import HtmlEditorControl from './HtmlEditorControl.js';
import {html, css} from '../../lit-all.min.js';
import '../Dropdown.js';
import '../Icon.js';

/*
  Dropdown Control - Base control for dropdown menus
*/
export default class DropdownControl extends HtmlEditorControl {

  static properties = {
    opened: {type: Boolean, reflect: true},
    editorMode: {type: String, state: true}
  };

  constructor(){
    super();
    this.opened = false;
  }
  
  /*
    Lifecycle Callbacks
  */
  connectedCallback(){
    super.connectedCallback();
    this.updateEditorMode();
    this.editor?.addEventListener('mode-changed', () => this.updateEditorMode());
  }

  updated(changedProperties){
    super.updated(changedProperties);
    
    if(changedProperties.has('editorMode')){
      requestAnimationFrame(() => {
        this.hidden = this.editorMode === 'code' && !this.hasVisibleChildren();
      });
    }
  }
  
  /*
    Utility Functions
  */
  updateEditorMode(){
    if(!this.editor) return;
    this.editorMode = this.editor.mode;
  }
  
  hasVisibleChildren(){
    const children = Array.from(this.children).filter(
      child => !child.hasAttribute('slot')
    );
    
    return children.some(child => {
      if(child.hidden === false || child.hidden === undefined){
        const style = window.getComputedStyle(child);
        return style.display !== 'none';
      }
      return false;
    });
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
      
      k-dropdown {
        display: inline-flex;
      }
      
      /* Override fixed sizing for dropdown trigger */
      button[slot="trigger"] {
        width: auto !important;
        height: auto !important;
        min-width: 40px;
        min-height: 40px;
      }
      
      /* Style slotted items (not icon or label) */
      ::slotted(:not([slot="icon"]):not([slot="label"])) {
        display: block !important;
      }
      
      ::slotted(:not([slot="icon"]):not([slot="label"])) .icon-btn,
      ::slotted(:not([slot="icon"]):not([slot="label"])) button {
        display: flex !important;
        width: 100% !important;
        height: auto !important;
        justify-content: flex-start !important;
        padding: 0.5rem 0.75rem !important;
        margin: 0 !important;
        border: none !important;
        border-radius: 0 !important;
        border-bottom: 1px solid var(--c_border) !important;
      }
      
      ::slotted(:not([slot="icon"]):not([slot="label"]):last-of-type) .icon-btn,
      ::slotted(:not([slot="icon"]):not([slot="label"]):last-of-type) button {
        border-bottom: none !important;
      }
    `
  ];

  /*
    Event Handlers
  */
  handleToggle = () => {
    this.opened = !this.opened;
  };

  handleOpened = () => {
    this.opened = true;
  };

  handleClosed = () => {
    this.opened = false;
  };

  /*
    Rendering
  */
  render(){
    return html`
      <k-dropdown 
        ?opened=${this.opened}
        @opened=${this.handleOpened}
        @closed=${this.handleClosed}
      >
        <button 
          slot="trigger" 
          class="${this.buttonClasses}"
        >
          <slot name="icon">
            <k-icon src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/arrow_drop_down/default/24px.svg"></k-icon>
          </slot>
          <slot name="label"></slot>
        </button>
        <slot></slot>
      </k-dropdown>
    `;
  }
}

customElements.define('k-hec-dropdown', DropdownControl);
