import CodeEditorButtonControl from './CodeEditorButtonControl.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';

export default class WordWrap extends CodeEditorButtonControl {
	static properties = {
		active: { type: Boolean, state: true }
	};

	constructor() {
		super();
		this.active = true;
	}

	connectedCallback() {
		super.connectedCallback();
		if(!this.hasAttribute('title')) this.title = 'Word Wrap';
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
		Public Methods
	*/
	handleAction() {
		this.editor?.toggleWordWrap();
	}

	/*
		Styles
	*/
	static styles = [
		CodeEditorButtonControl.styles,
		css`
			:host(.active) { background: var(--primary-bg, rgba(0,120,212,0.15)); }
		`
	];

	updated(changed) {
		super.updated(changed);
		if(changed.has('active')){
			this.classList.toggle('active', this.active);
		}
	}

	/*
		Rendering
	*/
	render() {
		return html`<k-icon name="wrap_text"></k-icon>`;
	}
}

customElements.define('k-cec-word-wrap', WordWrap);
