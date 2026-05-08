import CodeEditorButtonControl from './CodeEditorButtonControl.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';

export default class Minimap extends CodeEditorButtonControl {
	static properties = {
		active: { type: Boolean, state: true }
	};

	constructor() {
		super();
		this.active = false;
	}

	connectedCallback() {
		super.connectedCallback();
		if(!this.hasAttribute('title')) this.title = 'Toggle Minimap';
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
		Public Methods
	*/
	handleAction() {
		this.editor?.toggleMinimap();
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
		return html`<k-icon name="map"></k-icon>`;
	}
}

customElements.define('k-cec-minimap', Minimap);
