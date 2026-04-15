import t from"./CodeEditorControl.js";import{html as e,css as o}from"../../lit-all.min.js";import"../Icon.js";export default class s extends t{static styles=[t.styles,o`
			:host { display: inline-flex; }
		`];handleClick=()=>{this.editor?.redo()};render(){return e`
			<button class="${this.buttonClasses}" @click="${this.handleClick}" title="Redo">
				<k-icon name="redo"></k-icon>
			</button>
		`}}customElements.define("k-cec-redo",s);