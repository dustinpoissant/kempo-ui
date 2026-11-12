import ShadowComponent from './ShadowComponent.js';
import { html, css } from '../lit-all.min.js';
import theme from '../utils/theme.js';

export default class ThemeSelect extends ShadowComponent {
	static formAssociated = true;

	static properties = {
		currentTheme: { type: String, reflect: true, attribute: 'current-theme' },
		name: { type: String, reflect: true },
		disabled: { type: Boolean, reflect: true },
		readonly: { type: Boolean, reflect: true }
	};

	constructor() {
		super();
		this.internals = this.attachInternals();
		this.currentTheme = theme.get();
		this.name = '';
		this.disabled = false;
		this.readonly = false;
		this.initialValue = '';
	}

	/*
		Form Callbacks
	*/
	formResetCallback() {
		theme.set(this.initialValue);
	}

	formStateRestoreCallback(state) {
		theme.set(state || this.initialValue);
	}

	formDisabledCallback(disabled) {
		this.disabled = disabled;
	}

	/*
		Event Handlers
	*/
	handleChange = e => {
		if(this.disabled || this.readonly) return;
		theme.set(e.target.value);
	}

	/*
		Lifecycle Callbacks
	*/
	connectedCallback() {
		super.connectedCallback();
		this.initialValue = theme.get();
		this.unsubscribe = theme.subscribe(t => {
			this.currentTheme = t;
		});
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		if(this.unsubscribe) this.unsubscribe();
	}

	updated(changedProperties) {
		super.updated(changedProperties);
		this.internals.setFormValue(this.currentTheme || null);
	}

	/*
		Rendering
	*/
	render() {
		const hasLabel = this.childNodes.length > 0;
		return html`
			${hasLabel ? html`<label><slot></slot></label>` : ''}
			<select
				@change=${this.handleChange}
				.value=${this.currentTheme}
				?disabled=${this.disabled || this.readonly}
				?readonly=${this.readonly}
			>
				<option value="light">Light</option>
				<option value="dark">Dark</option>
				<option value="auto">System Default</option>
			</select>
		`;
	}
	/*
		Styles
	*/
	static styles = css`
		:host {
			display: block;
		}
		:host([disabled]) {
			opacity: 0.5;
			pointer-events: none;
		}
	`;

	/*
		Static Methods
	*/
	static setTheme(t) {
		theme.set(t);
	}

	static getCurrentTheme() {
		return theme.get();
	}

	static getCalculatedCurrentTheme() {
		return theme.getCalculated();
	}
}

customElements.define('k-theme-select', ThemeSelect);
