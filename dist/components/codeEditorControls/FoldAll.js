import l from"./CodeEditorControl.js";import{html as t,css as o}from"../../lit-all.min.js";import"../Icon.js";export default class e extends l{static properties={folded:{type:Boolean,state:!0}};constructor(){super(),this.folded=!1}handleClick=()=>{this.folded=!this.folded,this.folded?this.editor?.foldAll():this.editor?.unfoldAll()};static styles=[l.styles,o`
			:host { display: inline-flex; }
		`];render(){return t`
			<button class="${this.buttonClasses}" @click="${this.handleClick}" title="${this.folded?"Unfold All":"Fold All"}">
				<k-icon name="${this.folded?"unfold_more":"unfold_less"}"></k-icon>
			</button>
		`}}customElements.define("k-cec-fold-all",e);