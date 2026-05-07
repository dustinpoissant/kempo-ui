import CodeEditorButtonControl from './CodeEditorButtonControl.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';

export default class CopyCode extends CodeEditorButtonControl {
	/*
		Styles
	*/
	static styles = [
		CodeEditorButtonControl.styles,
		css`
			:host {
				display: inline-flex;
			}
		`
	];

	/*
		Lifecycle Callbacks
	*/
	connectedCallback() {
		super.connectedCallback();
		if(!this.hasAttribute('title')) this.title = 'Copy Code';
	}

	/*
		Public Methods
	*/
	handleAction() {
		this.editor?.copyToClipboard();
	}

	/*
		Rendering
	*/
	render() {
		return html`<k-icon name="content_copy"></k-icon>`;
	}
}

customElements.define('k-cec-copy-code', CopyCode);
