import t from"./MarkdownEditorControl.js";import{html as e,css as s}from"../../lit-all.min.js";import"../Icon.js";const a={h1:"Heading 1",h2:"Heading 2",h3:"Heading 3",h4:"Heading 4",h5:"Heading 5",h6:"Heading 6"},i={h1:"format_h1",h2:"format_h2",h3:"format_h3",h4:"format_h4",h5:"format_h5",h6:"format_h6"};export default class o extends t{static properties={...t.properties,tag:{type:String,reflect:!0}};constructor(){super(),this.tag="h2",this.label=""}command(){const t=(this.tag||"h2").toLowerCase();if(/^h[1-6]$/.test(t)){const e=parseInt(t.slice(1),10);this.insertLinePrefix("#".repeat(e)+" ",/^#{1,6} /)}}get#t(){return this.label?this.label:a[(this.tag||"h2").toLowerCase()]||this.tag}get#e(){return i[(this.tag||"h2").toLowerCase()]||"format_h2"}render(){return e`
      <button
        type="button"
        class=${this.btnClass}
        title=${this.#t}
        aria-label=${this.#t}
        @click=${this.handleClick}
      >
        <k-icon name=${this.#e}></k-icon>
        <span class="fb-label">${this.#t}</span>
      </button>
    `}static styles=[t.styles,s`
      :host {
        display: inline-flex;
      }
      .ctrl {
        gap: 0.5rem;
        justify-content: flex-start;
        white-space: nowrap;
      }
      /* When this is slotted into something that stretches it (a menu),
         the button fills the row instead of staying compact. */
      :host([slot]) .ctrl,
      :host(*) .ctrl {
        width: 100%;
      }
      .fb-label {
        font-size: 0.875rem;
      }
    `]}customElements.define("k-md-format-block",o);