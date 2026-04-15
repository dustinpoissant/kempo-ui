import t from"./CodeEditorControl.js";import{html as o,css as e}from"../../lit-all.min.js";import"../Icon.js";export default class s extends t{static styles=[t.styles,e`
			:host {
				display: inline-flex;
			}
		`];handleClick=()=>{this.editor?.copyToClipboard()};render(){return o`
			<button class="${this.buttonClasses}" @click="${this.handleClick}" title="Copy Code">
				<k-icon name="content_copy"></k-icon>
			</button>
		`}}customElements.define("k-cec-copy-code",s);