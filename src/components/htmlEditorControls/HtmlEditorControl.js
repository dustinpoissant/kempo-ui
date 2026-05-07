import ShadowComponent from '../ShadowComponent.js';
import { html, css } from '../../lit-all.min.js';

export default class HtmlEditorControl extends ShadowComponent {
	/* Properties */
	static properties = {
		btnClass: { type: String, attribute: 'btn-class' },
		groupBtnClass: { type: String, attribute: 'group-btn-class' },
		groupLastBtnClass: { type: String, attribute: 'group-last-btn-class' },
		hidden: { type: Boolean, reflect: true }
	};

	/*
		Constructor
	*/
	constructor() {
		super();
		this.btnClass = 'b r mq ph';
		this.groupBtnClass = 'br ph';
		this.groupLastBtnClass = 'ph';
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
		Getters for Editor Integration
	*/
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
		Getters for Group Detection
	*/
	get isInGroup() {
		const parent = this.parentElement;
		return parent && parent.tagName === 'K-CONTROL-GROUP';
	}

	get isInDropdown() {
		const parent = this.parentElement;
		return parent && parent.tagName === 'K-HEC-DROPDOWN';
	}

	get isLastInGroup() {
		if(!this.isInGroup) return false;
		const parent = this.parentElement;
		const siblings = Array.from(parent.children).filter(
			child => child.tagName.startsWith('K-HEC-') && child.tagName !== 'K-HEC-SPACER'
		);
		return siblings[siblings.length - 1] === this;
	}

	/*
		Getters for Button Classes
	*/
	get buttonClasses() {
		const baseClass = 'no-btn icon-btn';
		let styleClass;
		if(this.isInDropdown){
			styleClass = 'dropdown-item';
		} else if(this.isInGroup){
			styleClass = this.isLastInGroup ? this.groupLastBtnClass : this.groupBtnClass;
		} else {
			styleClass = this.btnClass;
		}
		return `${baseClass} ${styleClass}`.trim();
	}

	/*
		Styles
	*/
	static styles = css`
		:host {
			display: inline-flex;
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
		
		/* Styles for controls in dropdown */
		.icon-btn.dropdown-item {
			display: flex !important;
			width: 100% !important;
			height: auto !important;
			justify-content: flex-start !important;
			padding: 0.5rem 0.75rem !important;
			margin: 0 !important;
			border: none !important;
			border-radius: 0 !important;
			border-bottom: 1px solid var(--c_border) !important;
		}
		
		:host(:last-child) .icon-btn.dropdown-item {
			border-bottom: none !important;
		}
	`;
}

customElements.define('k-html-editor-control', HtmlEditorControl);
