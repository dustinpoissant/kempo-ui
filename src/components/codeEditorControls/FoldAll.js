import CodeEditorButtonControl from './CodeEditorButtonControl.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';

export default class FoldAll extends CodeEditorButtonControl {
	static properties = {
		folded: { type: Boolean, state: true }
	};

	constructor() {
		super();
		this.folded = false;
	}

	/*
		Lifecycle Callbacks
	*/
	connectedCallback() {
		super.connectedCallback();
		if(!this.hasAttribute('title')) this.title = 'Fold All';
	}

	/*
		Public Methods
	*/
	handleAction() {
		this.folded = !this.folded;
		if(this.folded){
			this.editor?.foldAll();
		} else {
			this.editor?.unfoldAll();
		}
	}

	/*
		Styles
	*/
	static styles = [
		CodeEditorButtonControl.styles,
		css`
			:host { display: inline-flex; }
		`
	];

	/*
		Rendering
	*/
	render() {
		return html`<k-icon name="${this.folded ? 'unfold_more' : 'unfold_less'}"></k-icon>`;
	}
}

customElements.define('k-cec-fold-all', FoldAll);
