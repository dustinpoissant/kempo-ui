import CodeEditorButtonControl from './CodeEditorButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class FindReplace extends CodeEditorButtonControl {
	/*
		Lifecycle Callbacks
	*/
	connectedCallback() {
		super.connectedCallback();
		if(!this.hasAttribute('title')) this.title = 'Find & Replace';
	}

	/*
		Public Methods
	*/
	handleAction() {
		this.editor?.openFind();
	}

	/*
		Rendering
	*/
	render() {
		return html`<k-icon name="search"></k-icon>`;
	}
}

customElements.define('k-cec-find-replace', FindReplace);
