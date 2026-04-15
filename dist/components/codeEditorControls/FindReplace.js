import e from"./CodeEditorControl.js";import{html as t,css as i}from"../../lit-all.min.js";import"../Icon.js";export default class s extends e{static styles=[e.styles,i`
			:host { display: inline-flex; }
		`];handleClick=()=>{this.editor?.openFind()};render(){return t`
			<button class="${this.buttonClasses}" @click="${this.handleClick}" title="Find & Replace">
				<k-icon name="search"></k-icon>
			</button>
		`}}customElements.define("k-cec-find-replace",s);