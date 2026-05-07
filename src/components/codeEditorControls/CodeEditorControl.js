import ShadowComponent from '../ShadowComponent.js';
import { css } from '../../lit-all.min.js';

export default class CodeEditorControl extends ShadowComponent {
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
		Getters for Editor Integration
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
		Getters for Group Detection
	*/
	get isInGroup() {
		const parent = this.parentElement;
		return parent && parent.tagName === 'K-CONTROL-GROUP';
	}

	get isLastInGroup() {
		if(!this.isInGroup) return false;
		const siblings = Array.from(this.parentElement.children).filter(
			child => child.tagName.startsWith('K-CEC-') && child.tagName !== 'K-CEC-SPACER'
		);
		return siblings[siblings.length - 1] === this;
	}

	/*
		Getters for Button Classes
	*/
	get buttonClasses() {
		const baseClass = 'no-btn icon-btn';
		let styleClass;
		if(this.isInGroup){
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
			align-items: center;
		}
		:host([hidden]) {
			display: none !important;
		}
		button {
			cursor: pointer;
			display: inline-flex;
			align-items: center;
			justify-content: center;
			min-width: 2rem;
			min-height: 2rem;
		}
	`;
}
