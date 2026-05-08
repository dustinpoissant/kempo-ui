import CodeEditorButtonControl from './CodeEditorButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class Undo extends CodeEditorButtonControl {
	/*
		Lifecycle Callbacks
	*/
	connectedCallback() {
		super.connectedCallback();
		if(!this.hasAttribute('title')) this.title = 'Undo';
	}

	/*
		Public Methods
	*/
	handleAction() {
		this.editor?.undo();
	}

	/*
		Rendering
	*/
	render() {
		return html`<k-icon name="undo"></k-icon>`;
	}
}

customElements.define('k-cec-undo', Undo);
