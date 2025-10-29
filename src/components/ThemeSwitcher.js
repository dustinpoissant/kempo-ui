import ShadowComponent from './ShadowComponent.js';
import { html, css } from '../lit-all.min.js';
import './Icon.js';

export default class ThemeSwitcher extends ShadowComponent {
	/* Properties */
	static properties = {
		currentTheme: { type: String, reflect: true, attribute: 'current-theme' }
	};

	constructor() {
		super();
		this.currentTheme = ThemeSwitcher.getCurrentTheme();
	}

	/*
		Event Handlers
	*/
	handleClick = () => {
		const current = ThemeSwitcher.getCurrentTheme();
		if(current === 'auto') ThemeSwitcher.setTheme('light');
		if(current === 'light') ThemeSwitcher.setTheme('dark');
		if(current === 'dark') ThemeSwitcher.setTheme('auto');
	}

	handleStorageChange = (event) => {
		if (event.key === 'theme') {
			this.currentTheme = event.newValue || 'auto';
			document.documentElement.setAttribute('theme', this.currentTheme);
		}
	}

	/*
		Lifecycle Callbacks
	*/
	connectedCallback() {
		super.connectedCallback();
		window.addEventListener('storage', this.handleStorageChange);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		window.removeEventListener('storage', this.handleStorageChange);
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
	static setTheme(theme) {
		localStorage.setItem('theme', theme);
		document.documentElement.setAttribute('theme', theme);
		window.dispatchEvent(new StorageEvent('storage', { key: 'theme', newValue: theme }));
	}

	static getCurrentTheme() {
		let theme = document.documentElement.getAttribute('theme');
		if(!theme) theme = localStorage.getItem('theme');
		return theme || 'auto';
	}
}

/*
	Auto Theme Detection
*/
const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
const colorSchemeChangeHandler = event => document.documentElement.setAttribute('auto-theme', event.matches ? 'dark' : 'light');
colorSchemeQuery.addEventListener('change', colorSchemeChangeHandler);
colorSchemeChangeHandler(colorSchemeQuery);

ThemeSwitcher.setTheme(ThemeSwitcher.getCurrentTheme());
customElements.define('k-theme-switcher', ThemeSwitcher);