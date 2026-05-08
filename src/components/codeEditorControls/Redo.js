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
		return html`<slot><k-icon name="redo"></k-icon></slot>`;
	}
}

customElements.define('k-cec-redo', Redo);
