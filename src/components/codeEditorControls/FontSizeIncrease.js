import CodeEditorButtonControl from './CodeEditorButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class FontSizeIncrease extends CodeEditorButtonControl {
	/*
		Lifecycle Callbacks
	*/
	connectedCallback() {
		super.connectedCallback();
		if(!this.hasAttribute('title')) this.title = 'Increase Font Size';
	}

	/*
		Public Methods
	*/
	handleAction() {
		this.editor?.increaseFontSize();
	}

	/*
		Rendering
	*/
	render() {
		return html`<k-icon name="text_increase"></k-icon>`;
	}
}

customElements.define('k-cec-font-size-increase', FontSizeIncrease);
