import Button from '../Button.js';
import { css } from '../../lit-all.min.js';

export default class CodeEditorButtonControl extends Button {
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
		this.addEventListener('click', this.handleActionClick);
		this.updateModeVisibility();
		const editor = this.editor;
		if(editor?.tagName === 'K-HTML-EDITOR'){
			this.modeHandler = () => this.updateModeVisibility();
			editor.addEventListener('mode-changed', this.modeHandler);
		}
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.removeEventListener('click', this.handleActionClick);
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
		Editor Integration
	*/
	get editor() {
		const isEditor = el => el?.tagName === 'K-CODE-EDITOR' || el?.tagName === 'K-HTML-EDITOR';
		let current = this.getRootNode();
		while(current instanceof ShadowRoot){
			const host = current.host;
			if(isEditor(host)) return host;
			let el = host.parentElement;
			while(el){
				if(isEditor(el)) return el;
				el = el.parentElement;
			}
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
		Public Methods
	*/
	handleAction() {}

	/*
		Event Handlers
	*/
	handleActionClick = () => this.handleAction();

	/*
		Styles
	*/
	static styles = css`
		:host {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			min-width: 2rem;
			min-height: 2rem;
			background: transparent;
			border: 1px solid var(--c_border);
			border-radius: var(--radius);
			margin: var(--spacer_q);
			padding: var(--spacer_h);
			color: inherit;
			box-shadow: none;
			cursor: pointer;
			outline: none;
			font-size: inherit;
			user-select: none;
			transition: background-color var(--animation_ms), box-shadow var(--animation_ms);
		}

		:host(:not([disabled]):hover) {
			background: oklch(from var(--c_bg__inv) l c h / 0.15);
			color: inherit;
			box-shadow: none;
		}
		:host(:not([disabled]):focus),
		:host(:not([disabled]):focus-visible) {
			box-shadow: var(--focus_shadow);
			z-index: 1;
		}
		:host([disabled]) {
			opacity: 0.6;
			cursor: default;
		}
		:host([hidden]) {
			display: none !important;
		}
	`;
}
