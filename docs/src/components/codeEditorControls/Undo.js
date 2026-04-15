import t from"./CodeEditorControl.js";import{html as e,css as o}from"../../lit-all.min.js";import"../Icon.js";export default class s extends t{static styles=[t.styles,o`
			:host { display: inline-flex; }
		`];handleClick=()=>{this.editor?.undo()};render(){return e`
			<button class="${this.buttonClasses}" @click="${this.handleClick}" title="Undo">
				<k-icon name="undo"></k-icon>
			</button>
		`}}customElements.define("k-cec-undo",s);