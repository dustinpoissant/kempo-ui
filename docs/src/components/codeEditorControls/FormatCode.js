import t from"./CodeEditorControl.js";import{html as e,css as o}from"../../lit-all.min.js";import"../Icon.js";export default class s extends t{static styles=[t.styles,o`
			:host {
				display: inline-flex;
			}
		`];handleClick=()=>{this.editor?.formatCode()};render(){return e`
			<button class="${this.buttonClasses}" @click="${this.handleClick}" title="Format Code">
				<k-icon name="frame_source"></k-icon>
			</button>
		`}}customElements.define("k-cec-format-code",s);