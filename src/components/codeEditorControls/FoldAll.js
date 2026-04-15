import CodeEditorControl from './CodeEditorControl.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';

export default class FoldAll extends CodeEditorControl {
	static properties = {
		folded: { type: Boolean, state: true }
	};

	constructor() {
		super();
		this.folded = false;
	}

	/*
		Event Handlers
	*/
	handleClick = () => {
		this.folded = !this.folded;
		if(this.folded){
			this.editor?.foldAll();
		} else {
			this.editor?.unfoldAll();
		}
	};

	/*
		Styles
	*/
	static styles = [
		CodeEditorControl.styles,
		css`
			:host { display: inline-flex; }
		`
	];

	/*
		Rendering
	*/
	render() {
		return html`
			<button class="${this.buttonClasses}" @click="${this.handleClick}" title="${this.folded ? 'Unfold All' : 'Fold All'}">
				<k-icon name="${this.folded ? 'unfold_more' : 'unfold_less'}"></k-icon>
			</button>
		`;
	}
}

customElements.define('k-cec-fold-all', FoldAll);
