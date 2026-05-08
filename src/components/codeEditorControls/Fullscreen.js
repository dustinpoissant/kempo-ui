import CodeEditorButtonControl from './CodeEditorButtonControl.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';

export default class Fullscreen extends CodeEditorButtonControl {
	static properties = {
		fullscreen: { type: Boolean, state: true }
	};

	constructor() {
		super();
		this.fullscreen = false;
	}

	/*
		Lifecycle Callbacks
	*/
	connectedCallback() {
		super.connectedCallback();
		if(!this.hasAttribute('title')) this.title = 'Fullscreen';
		const editor = this.editor;
		if(!editor) return;
		this.fullscreen = editor.fullscreen;
		this.fullscreenHandler = () => { this.fullscreen = editor.fullscreen; };
		editor.addEventListener('fullscreen-changed', this.fullscreenHandler);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.editor?.removeEventListener('fullscreen-changed', this.fullscreenHandler);
		this.fullscreenHandler = null;
	}

	/*
		Mode Visibility — visible in both visual and code modes
	*/
	updateModeVisibility() {}

	/*
		Public Methods
	*/
	handleAction() {
		this.editor?.toggleFullscreen();
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
		if(changed.has('fullscreen')){
			this.classList.toggle('active', this.fullscreen);
		}
	}

	/*
		Rendering
	*/
	render() {
		return html`<k-icon name="${this.fullscreen ? 'fullscreen_exit' : 'fullscreen'}"></k-icon>`;
	}
}

customElements.define('k-cec-fullscreen', Fullscreen);
