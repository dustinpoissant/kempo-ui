import t from"./MarkdownEditorControl.js";import{html as e,css as o}from"../../lit-all.min.js";import"../SpeechToText.js";export default class s extends t{static properties={...t.properties,language:{type:String,reflect:!0},continuous:{type:Boolean,reflect:!0}};constructor(){super(),this.label="Speech to text",this.language="en-US",this.continuous=!1}command(){}handleEnd=t=>{const e=(t.detail?.text||"").trim();e&&this.editor?.replaceSelection(e+" ",{selectInserted:!1})};render(){return e`
      <k-speech-to-text
        language=${this.language}
        ?continuous=${this.continuous}
        @end=${this.handleEnd}
      ></k-speech-to-text>
    `}static styles=[t.styles,o`
    :host {
      margin: var(--spacer_q);
    }
      k-speech-to-text {
        /* Shrink the default 2.5rem circular mic button so it sits
           comfortably alongside other toolbar controls. */
        --btn_size: 2rem;
      }
    `]}customElements.define("k-md-speech-to-text",s);