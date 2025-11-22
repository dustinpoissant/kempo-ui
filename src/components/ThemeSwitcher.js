import ShadowComponent from './ShadowComponent.js';
import { html, css } from '../lit-all.min.js';
import theme from '../utils/theme.js';
import './Icon.js';

export default class ThemeSwitcher extends ShadowComponent {
	/* Properties */
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
	handleClick = () => {
		const current = theme.get();
		if(current === 'auto') theme.set('light');
		if(current === 'light') theme.set('dark');
		if(current === 'dark') theme.set('auto');
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
		Styles
	*/
	static styles = css`
		:host {
			--padding: var(--spacer);
			display: flex;
		}
		button {
			padding: var(--padding);
		}
	`;

	/*
		Rendering
	*/
	render() {
		const iconName = this.currentTheme === 'auto' ? 'mode-auto' :
						this.currentTheme === 'light' ? 'mode-light' : 'mode-dark';

		return html`
			<button
				class="no-btn"
				@click=${this.handleClick}
			>
				<k-icon name=${iconName}></k-icon>
			</button>
		`;
	}
	static styles = css`
		:host {
			--padding: var(--spacer, 1rem);
		}
		button.no-btn {
			padding: var(--padding);
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

customElements.define('k-theme-switcher', ThemeSwitcher);