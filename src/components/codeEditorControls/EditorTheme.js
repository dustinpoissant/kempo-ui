import CodeEditorControl from './CodeEditorControl.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';

export default class EditorTheme extends CodeEditorControl {
	static properties = {
		value: { type: String, state: true }
	};

	/*
		Lifecycle Callbacks
	*/
	constructor() {
		super();
		this.value = 'auto';
	}

	connectedCallback() {
		super.connectedCallback();
		const editor = this.editor;
		if(!editor) return;
		this.value = editor.editorTheme || 'auto';
		this.themeHandler = e => { this.value = e.detail.editorTheme; };
		editor.addEventListener('editor-theme-changed', this.themeHandler);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.editor?.removeEventListener('editor-theme-changed', this.themeHandler);
		this.themeHandler = null;
	}

	/*
		Event Handlers
	*/
	handleChange = e => {
		this.editor?.setEditorTheme(e.target.value);
	};

	/*
		Styles
	*/
	static styles = [
		CodeEditorControl.styles,
		css`
			:host {
				background-color: var(--input_bg);
				color: var(--input_tc);
				border: var(--input_border_width) solid var(--c_input_border);
				border-radius: var(--radius);
				transition: box-shadow var(--animation_ms);
				position: relative;
			}
			k-icon {
				pointer-events: none;
				position: absolute;
				left: 0.5rem;
			}
			select {
				padding-left: 2rem;
				border: 0;
			}
		`
	];

	/*
		Rendering
	*/
	render() {
		return html`
			<k-icon name="contrast" style="font-size: 1.125rem; opacity: 0.7;"></k-icon>
			<select .value=${this.value} @change=${this.handleChange} title="Editor Theme">
				<option value="auto">Auto</option>
				<option value="light">Light</option>
				<option value="dark">Dark</option>
			</select>
		`;
	}
}

customElements.define('k-cec-editor-theme', EditorTheme);
