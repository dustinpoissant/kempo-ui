import ShadowComponent from './ShadowComponent.js';
import { html, css } from '../lit-all.min.js';
import theme from '../utils/theme.js';

export default class ThemeSelect extends ShadowComponent {
	static properties = {
		currentTheme: { type: String, reflect: true, attribute: 'current-theme' }
	};

	constructor() {
		super();
		this.currentTheme = theme.get();
	}

	/*
		Event Handlers
	*/
	handleChange = e => {
		theme.set(e.target.value);
	}

	/*
		Lifecycle Callbacks
	*/
	connectedCallback() {
		super.connectedCallback();
		this.unsubscribe = theme.subscribe(t => {
			this.currentTheme = t;
		});
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		if(this.unsubscribe) this.unsubscribe();
	}

	/*
		Rendering
	*/
	render() {
		const hasLabel = this.childNodes.length > 0;
		return html`
			${hasLabel ? html`<label><slot></slot></label>` : ''}
			<select @change=${this.handleChange} .value=${this.currentTheme}>
				<option value="light">Light</option>
				<option value="dark">Dark</option>
				<option value="auto">System Default</option>
			</select>
		`;
	}

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
