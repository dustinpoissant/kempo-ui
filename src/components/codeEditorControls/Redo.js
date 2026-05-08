import CodeEditorButtonControl from './CodeEditorButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class Redo extends CodeEditorButtonControl {
	/*
		Lifecycle Callbacks
	*/
	connectedCallback() {
		super.connectedCallback();
		if(!this.hasAttribute('title')) this.title = 'Redo';
	}

	/*
		Public Methods
	*/
	handleAction() {
		this.editor?.redo();
	}

	/*
		Rendering
	*/
	render() {
		return html`<k-icon name="redo"></k-icon>`;
	}
}

customElements.define('k-cec-redo', Redo);
