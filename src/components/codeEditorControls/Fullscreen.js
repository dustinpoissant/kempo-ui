import CodeEditorControl from './CodeEditorControl.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';

export default class Fullscreen extends CodeEditorControl {
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
		Event Handlers
	*/
	handleClick = () => {
		this.editor?.toggleFullscreen();
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
			<button
				class="${this.buttonClasses} ${this.fullscreen ? 'active' : ''}"
				@click="${this.handleClick}"
				title="${this.fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}"
			>
				<k-icon name="${this.fullscreen ? 'fullscreen_exit' : 'fullscreen'}"></k-icon>
			</button>
		`;
	}
}

customElements.define('k-cec-fullscreen', Fullscreen);
