import ShadowComponent from './ShadowComponent.js';
import { html, css, nothing } from '../lit-all.min.js';
import theme from '../utils/theme.js';
import './Icon.js';

const ICON_MAP = {
	auto: 'mode-auto',
	light: 'mode-light',
	dark: 'mode-dark'
};

const parseOptions = str => str.split(',').map(s => s.trim()).filter(Boolean);
const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);

export default class ThemeSwitcher extends ShadowComponent {

	/* Properties */
	static properties = {
		currentTheme: { type: String, reflect: true, attribute: 'current-theme' },
		mode: { type: String, reflect: true },
		options: { type: String, reflect: true },
		labels: { type: String, reflect: true },
		resolvedMode: { type: String, state: true },
		resolvedLabels: { type: Array, state: true }
	};

	constructor() {
		super();
		this.currentTheme = theme.get();
		this.mode = 'auto';
		this.options = 'light, auto, dark';
		this.labels = null;
		this.resolvedMode = 'segmented';
		this.resolvedLabels = null;
	}

	/*
		Aside Detection
	*/
	#aside = null;

	handleAsideStateChange = e => {
		if(this.mode === 'auto') {
			this.resolvedMode = e.detail.state === 'collapsed' ? 'toggle' : 'segmented';
		}
		this.resolveLabels();
	};

	resolveMode = () => {
		if(this.mode === 'toggle' || this.mode === 'segmented'){
			this.resolvedMode = this.mode;
			return;
		}
		if(this.#aside){
			this.resolvedMode = this.#aside.state === 'collapsed' ? 'toggle' : 'segmented';
		} else {
			this.resolvedMode = 'segmented';
		}
	};

	resolveLabels = () => {
		if(this.labels === null || this.labels === undefined || (this.#aside && this.#aside.state === 'collapsed')){
			this.resolvedLabels = null;
			return;
		}
		const opts = parseOptions(this.options);
		if(this.labels === ''){
			this.resolvedLabels = opts.map(capitalize);
		} else {
			const custom = parseOptions(this.labels);
			this.resolvedLabels = opts.map((opt, i) => custom[i] ?? capitalize(opt));
		}
	};

	/*
		Event Handlers
	*/
	handleClick = () => {
		const opts = parseOptions(this.options);
		if(opts.length === 0) return;
		const idx = opts.indexOf(theme.get());
		theme.set(opts[(idx + 1) % opts.length]);
	};

	handleSegmentClick = value => {
		theme.set(value);
	};

	/*
		Lifecycle Callbacks
	*/
	connectedCallback() {
		super.connectedCallback();
		this.unsubscribe = theme.subscribe(t => {
			this.currentTheme = t;
		});
		this.#aside = this.closest('k-aside');
		if(this.#aside){
			this.#aside.addEventListener('aside_state_change', this.handleAsideStateChange);
		}
		this.resolveMode();
		this.resolveLabels();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		if(this.unsubscribe) this.unsubscribe();
		if(this.#aside){
			this.#aside.removeEventListener('aside_state_change', this.handleAsideStateChange);
			this.#aside = null;
		}
	}

	updated(changed) {
		super.updated(changed);
		if(changed.has('mode')) this.resolveMode();
		if(changed.has('labels') || changed.has('options')) this.resolveLabels();
	}

	/*
		Styles
	*/
	static styles = css`
		:host {
			--padding: var(--spacer, 1rem);
			--c_inactive: transparent;
			--tc_inactive: inherit;
			--c_inactive__hover: var(--c_bg__alt);
			--tc_inactive__hover: inherit;
			--c_active: var(--c_primary);
			--tc_active: var(--tc_light);
			--c_active__hover: var(--c_active);
			--tc_active__hover: var(--tc_active);
			--border: 1px solid var(--c_border);
		}
		button.no-btn {
			padding: var(--padding);
			border-radius: var(--radius);
			display: flex;
			align-items: center;
			gap: calc(var(--spacer, 1rem) * 0.35);
			color: var(--tc_inactive);
		}
		button.no-btn:hover {
			color: var(--tc_inactive__hover);
		}
		.segmented {
			display: inline-flex;
		}
		.segmented button {
			padding: var(--padding);
			background: var(--c_inactive);
			cursor: pointer;
			color: var(--tc_inactive);
			display: flex;
			align-items: center;
			justify-content: center;
			gap: calc(var(--spacer, 1rem) * 0.35);
			border: var(--border);
			border-right: none;
		}
		.segmented button:first-child {
			border-radius: var(--radius) 0 0 var(--radius);
		}
		.segmented button:last-child {
			border-radius: 0 var(--radius) var(--radius) 0;
			border-right: var(--border);
		}
		.segmented button:not(:first-child):not(:last-child) {
			border-radius: 0;
		}
		.segmented button.active {
			background: var(--c_active);
			color: var(--tc_active);
			border-color: var(--c_active);
		}
		.segmented button.active + button {
			border-left-color: var(--c_active);
		}
		.segmented button:not(.active):hover {
			background: var(--c_inactive__hover);
			color: var(--tc_inactive__hover);
		}
		.segmented button.active:hover {
			background: var(--c_active__hover);
			color: var(--tc_active__hover);
		}
	`;

	/*
		Rendering
	*/
	renderToggle() {
		return html`
			<button
				class="no-btn"
				@click=${this.handleClick}
			>
				<k-icon name=${ICON_MAP[this.currentTheme] || 'mode-auto'}></k-icon>
				${this.resolvedLabels ? html`<span>${this.resolvedLabels[parseOptions(this.options).indexOf(this.currentTheme)] ?? capitalize(this.currentTheme)}</span>` : nothing}
			</button>
		`;
	}

	renderSegmented() {
		const opts = parseOptions(this.options);
		return html`
			<div class="segmented">
				${opts.map((opt, i) => html`
					<button
						class="no-style ${opt === this.currentTheme ? 'active' : ''}"
						@click=${() => this.handleSegmentClick(opt)}
						title=${opt}
					>
						<k-icon name=${ICON_MAP[opt] || 'mode-auto'}></k-icon>
					${this.resolvedLabels ? html`<span>${this.resolvedLabels[i]}</span>` : nothing}
					</button>
				`)}
			</div>
		`;
	}

	render() {
		if(this.resolvedMode === 'toggle') return this.renderToggle();
		return this.renderSegmented();
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

customElements.define('k-theme-switcher', ThemeSwitcher);
