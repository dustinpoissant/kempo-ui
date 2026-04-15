import CodeEditorControl from './CodeEditorControl.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';

export default class Minimap extends CodeEditorControl {
	static properties = {
		active: { type: Boolean, state: true }
	};

	constructor() {
		super();
		this.active = false;
	}

	connectedCallback() {
		super.connectedCallback();
		const editor = this.editor;
		if(!editor) return;
		this.active = editor.minimapEnabled;
		this.minimapHandler = e => { this.active = e.detail.minimapEnabled; };
		editor.addEventListener('minimap-changed', this.minimapHandler);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.editor?.removeEventListener('minimap-changed', this.minimapHandler);
		this.minimapHandler = null;
	}

	/*
		Event Handlers
	*/
	handleClick = () => {
		this.editor?.toggleMinimap();
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
			<button class="${this.buttonClasses} ${this.active ? 'active' : ''}" @click="${this.handleClick}" title="Toggle Minimap">
				<k-icon name="map"></k-icon>
			</button>
		`;
	}
}

customElements.define('k-cec-minimap', Minimap);
