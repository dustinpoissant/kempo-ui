import CodeEditorButtonControl from './CodeEditorButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class FontSizeDecrease extends CodeEditorButtonControl {
	/*
		Lifecycle Callbacks
	*/
	connectedCallback() {
		super.connectedCallback();
		if(!this.hasAttribute('title')) this.title = 'Decrease Font Size';
	}

	/*
		Public Methods
	*/
	handleAction() {
		this.editor?.decreaseFontSize();
	}

	/*
		Rendering
	*/
	render() {
		return html`<slot><k-icon name="text_decrease"></k-icon></slot>`;
	}
}

customElements.define('k-cec-font-size-decrease', FontSizeDecrease);
