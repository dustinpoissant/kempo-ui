import CodeEditorButtonControl from './CodeEditorButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class FormatCode extends CodeEditorButtonControl {
	/*
		Lifecycle Callbacks
	*/
	connectedCallback() {
		super.connectedCallback();
		if(!this.hasAttribute('title')) this.title = 'Format Code';
	}

	/*
		Public Methods
	*/
	handleAction() {
		this.editor?.formatCode();
	}

	/*
		Rendering
	*/
	render() {
		return html`<k-icon name="frame_source"></k-icon>`;
	}
}

customElements.define('k-cec-format-code', FormatCode);
