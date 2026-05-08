import ShadowComponent from '../ShadowComponent.js';
import { html, css } from '../../lit-all.min.js';

export default class HtmlEditorControl extends ShadowComponent {
	/* Properties */
	static properties = {
		hidden: { type: Boolean, reflect: true }
	};

	/*
		Constructor
	*/
	constructor() {
		super();
		this.hidesInCodeMode = true;
	}

	/*
		Lifecycle Callbacks
	*/
	connectedCallback() {
		super.connectedCallback();
		const editor = this.editor;
		if(!editor) return;
		this.modeEditor = editor;
		this.modeHandler = () => {
			const shouldHide = this.hidesInCodeMode && this.modeEditor.mode === 'code';
			if(this.hidden !== shouldHide){
				this.hidden = shouldHide;
				this.dispatchEvent(new CustomEvent('control_visibility_change', { bubbles: true }));
			}
		};
		editor.addEventListener('mode-changed', this.modeHandler);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.modeEditor?.removeEventListener('mode-changed', this.modeHandler);
		this.modeEditor = null;
		this.modeHandler = null;
	}

	updated(changed) {
		super.updated(changed);
		if(changed.has('hidden')){
			this.dispatchEvent(new CustomEvent('control_visibility_change', { bubbles: true }));
		}
	}

	/*
		Getters
	*/
	get buttonClasses() {
		return 'no-btn icon-btn';
	}

	get editor() {
		const isEditor = el => el?.tagName?.startsWith('K-HTML-EDITOR');
		let current = this.getRootNode();

		while(current instanceof ShadowRoot){
			const host = current.host;
			if(isEditor(host)) return host;
			current = host.getRootNode();
		}

		let el = this.parentElement;
		while(el){
			if(isEditor(el)) return el;
			el = el.parentElement;
		}
		return null;
	}

	/*
		Styles
	*/
	static styles = css`
		:host {
			display: inline-flex;
			border: 1px solid var(--c_border);
			border-radius: var(--radius);
			margin: 0 0.25rem;
		}
		
		:host([hidden]) {
			display: none !important;
		}
		
		.icon-btn {
			display: inline-flex !important;
			align-items: center;
			justify-content: center;
			width: 40px;
			height: 40px;
			gap: 0.5rem;
		}
		.icon-btn:disabled {
			opacity: 0.6;
		}
		
		.icon-btn:has(slot:not([name])) {
			width: auto;
			padding-left: 0.75rem;
			padding-right: 0.75rem;
		}
	`;
}

customElements.define('k-html-editor-control', HtmlEditorControl);
