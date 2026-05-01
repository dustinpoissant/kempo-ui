import e from"../ShadowComponent.js";import{html as t,css as i}from"../../lit-all.min.js";export default class n extends e{static properties={btnClass:{type:String,attribute:"btn-class"},label:{type:String,reflect:!0},hidden:{type:Boolean,reflect:!0}};constructor(){super(),this.btnClass="no-btn ctrl",this.label="",this.hidesInPreviewMode=!0}connectedCallback(){super.connectedCallback();const e=this.editor;e&&(this.boundEditor=e,this.modeHandler=()=>{const e=this.hidesInPreviewMode&&"preview"===this.boundEditor.mode;this.hidden!==e&&(this.hidden=e)},this.modeHandler(),e.addEventListener("mode-change",this.modeHandler))}disconnectedCallback(){super.disconnectedCallback(),this.boundEditor&&this.modeHandler&&this.boundEditor.removeEventListener("mode-change",this.modeHandler),this.boundEditor=null,this.modeHandler=null}get editor(){const e=this.closest("k-markdown-editor");if(e)return e;const t=this.getRootNode();return t instanceof ShadowRoot&&"K-MARKDOWN-EDITOR"===t.host?.tagName?t.host:null}wrapSelection(e,t,i){this.editor?.wrapSelection(e,t,i)}insertAtCursor(e){this.editor?.insertAtCursor(e)}insertLinePrefix(e,t){this.editor?.insertLinePrefix(e,t)}replaceInSelectedLines(e,t){this.editor?.replaceInSelectedLines(e,t)}replaceSelection(e,t){this.editor?.replaceSelection(e,t)}getSelection(){return this.editor?.getSelection()||{start:0,end:0,text:""}}command(){}handleClick=e=>{e.preventDefault(),this.hidden||this.command()};render(){return t`
      <button
        type="button"
        class=${this.btnClass}
        title=${this.label}
        aria-label=${this.label}
        @click=${this.handleClick}
      >
        <slot>${this.label}</slot>
      </button>
    `}static styles=i`
    :host {
      display: inline-flex;
    }
    :host([hidden]) {
      display: none;
    }
    .ctrl {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: var(--spacer_h);
      border: 1px solid transparent;
      border-radius: var(--radius);
      background: transparent;
      color: var(--tc_muted);
      cursor: pointer;
      font: inherit;
      transition: background var(--animation_ms), color var(--animation_ms);
    }
    .ctrl:hover {
      background: var(--c_bg__alt);
      color: var(--tc);
    }
    .ctrl:focus-visible {
      outline: none;
      box-shadow: var(--focus_shadow);
    }
  `}customElements.define("k-md-control",n);