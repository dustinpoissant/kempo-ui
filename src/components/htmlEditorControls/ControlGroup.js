import ShadowComponent from '../ShadowComponent.js';
import { html, css } from '../../lit-all.min.js';

export default class ControlGroup extends ShadowComponent {
	static properties = {
		editorMode: {type: String, state: true},
		hidden: {type: Boolean, reflect: true}
	};

	/*
		Constructor
	*/
	constructor() {
		super();
	}

	/*
		Lifecycle Callbacks
	*/
	connectedCallback() {
		super.connectedCallback();
		if(!this.hasAttribute('class')){
			this.setAttribute('class', 'b r mq');
		}
		this.updateEditorMode();
		this.editor?.addEventListener('mode-changed', () => this.updateEditorMode());
	}

	/*
		Getters for Editor Integration
	*/
	get editor() {
		return this.closest('k-html-editor');
	}

	/*
		Utility Functions
	*/
	updateEditorMode(){
		if(!this.editor) return;
		this.editorMode = this.editor.mode;
		this.requestUpdate();
	}

	hasVisibleChildren(){
		const children = Array.from(this.children).filter(
			child => child.tagName.startsWith('K-HEC-') && child.tagName !== 'K-HEC-SPACER'
		);
		
		// Check if any child is visible (not hidden)
		// Also check computed style as fallback for elements that may not have hidden set yet
		return children.some(child => {
			if(child.hidden === false || child.hidden === undefined){
				const style = window.getComputedStyle(child);
				return style.display !== 'none';
			}
			return false;
		});
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
		
		::slotted(*) {
			margin-top: -1px;
			margin-bottom: -1px;
		}
	`;

	/*
		Rendering
	*/
	render() {
		return html`<slot></slot>`;
	}

	updated(){
		super.updated();
		// Check after children have rendered - use requestAnimationFrame to ensure children are fully updated
		requestAnimationFrame(() => {
			this.hidden = !this.hasVisibleChildren();
		});
	}
}

customElements.define('k-hec-group', ControlGroup);
