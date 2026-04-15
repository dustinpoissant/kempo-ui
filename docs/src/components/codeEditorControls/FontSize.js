import e from"./CodeEditorControl.js";import{html as t,css as s}from"../../lit-all.min.js";import"../Icon.js";export default class n extends e{static styles=[e.styles,s`
			:host {
				display: inline-flex;
				gap: 0;
			}
		`];handleIncrease=()=>{this.editor?.increaseFontSize()};handleDecrease=()=>{this.editor?.decreaseFontSize()};render(){return t`
			<button class="${this.buttonClasses}" @click="${this.handleDecrease}" title="Decrease Font Size">
				<k-icon name="text_decrease"></k-icon>
			</button>
			<button class="${this.buttonClasses}" @click="${this.handleIncrease}" title="Increase Font Size">
				<k-icon name="text_increase"></k-icon>
			</button>
		`}}customElements.define("k-cec-font-size",n);