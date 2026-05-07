import CodeEditorButtonControl from './CodeEditorButtonControl.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';

export default class FontSizeDecrease extends CodeEditorButtonControl {
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
		return html`<k-icon name="text_decrease"></k-icon>`;
	}
}

customElements.define('k-cec-font-size-decrease', FontSizeDecrease);
