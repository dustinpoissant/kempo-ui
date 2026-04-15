import CodeEditorControl from './CodeEditorControl.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';

export default class WordWrap extends CodeEditorControl {
	static properties = {
		active: { type: Boolean, state: true }
	};

	constructor() {
		super();
		this.active = true;
	}

	connectedCallback() {
		super.connectedCallback();
		const editor = this.editor;
		if(!editor) return;
		this.active = editor.wordWrap;
		this.wordWrapHandler = e => { this.active = e.detail.wordWrap; };
		editor.addEventListener('word-wrap-changed', this.wordWrapHandler);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.editor?.removeEventListener('word-wrap-changed', this.wordWrapHandler);
		this.wordWrapHandler = null;
	}

	/*
		Event Handlers
	*/
	handleClick = () => {
		this.editor?.toggleWordWrap();
	};

	/*
		Styles
	*/
	static styles = [
		CodeEditorControl.styles,
		css`
			:host { display: inline-flex; }
			button.active { background: var(--primary-bg, rgba(0,120,212,0.15)); }
		`
	];

	/*
		Rendering
	*/
	render() {
		return html`
			<button class="${this.buttonClasses} ${this.active ? 'active' : ''}" @click="${this.handleClick}" title="Word Wrap">
				<k-icon name="wrap_text"></k-icon>
			</button>
		`;
	}
}

customElements.define('k-cec-word-wrap', WordWrap);
