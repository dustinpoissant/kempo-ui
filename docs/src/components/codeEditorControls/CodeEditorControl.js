import ShadowComponent from '../ShadowComponent.js';
import { css } from '../../lit-all.min.js';

export default class CodeEditorControl extends ShadowComponent {
	static properties = {
		hidden: { type: Boolean, reflect: true }
	};

	/*
		Constructor
	*/
	constructor() {
		super();
		this.hidden = false;
	}

	/*
		Lifecycle Callbacks
	*/
	connectedCallback() {
		super.connectedCallback();
		this.updateModeVisibility();
		const editor = this.editor;
		if(editor?.tagName === 'K-HTML-EDITOR'){
			this.modeHandler = () => this.updateModeVisibility();
			editor.addEventListener('mode-changed', this.modeHandler);
		}
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		if(this.modeHandler){
			this.editor?.removeEventListener('mode-changed', this.modeHandler);
			this.modeHandler = null;
		}
	}

	updated(changed) {
		super.updated(changed);
		if(changed.has('hidden')){
			this.dispatchEvent(new CustomEvent('control_visibility_change', { bubbles: true }));
		}
	}

	/*
		Mode Visibility
	*/
	updateModeVisibility() {
		const editor = this.editor;
		if(editor?.tagName === 'K-HTML-EDITOR'){
			const shouldHide = editor.mode !== 'code';
			if(this.hidden !== shouldHide){
				this.hidden = shouldHide;
				this.dispatchEvent(new CustomEvent('control_visibility_change', { bubbles: true }));
			}
		}
	}

	/*
		Getters
	*/
	get editor() {
		const isEditor = el => el?.tagName === 'K-CODE-EDITOR' || el?.tagName === 'K-HTML-EDITOR';
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
			align-items: center;
		}
		:host([hidden]) {
			display: none !important;
		}
	`;
}
