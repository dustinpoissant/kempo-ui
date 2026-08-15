import ShadowComponent from './ShadowComponent.js';
import { html, css, nothing } from '../lit-all.min.js';
import { boolTrueFalse } from '../utils/propConverters.js';
import './Dropdown.js';
import './FocusCapture.js';
import './Icon.js';

export default class Aside extends ShadowComponent {
	static properties = {
		state: { type: String, reflect: true },
		side: { type: String, reflect: true },
		main: { type: String, reflect: true },
		overlayClose: { type: Boolean, reflect: true, attribute: 'overlay-close', converter: boolTrueFalse },
		escClose: { type: Boolean, reflect: true, attribute: 'esc-close', converter: boolTrueFalse },
		persistentId: { type: String, reflect: true, attribute: 'persistent-id' }
	};

	constructor() {
		super();
		this.state = 'offscreen';
		this.side = 'left';
		this.main = 'overlay';
		this.overlayClose = true;
		this.escClose = true;
		this.persistentId = null;
	}

	/*
		Event Handlers
	*/
	overlayClick = () => {
		if(this.overlayClose) this.hide();
	}

	handleKeyDown = (e) => {
		if(!this.escClose || e.key !== 'Escape') return;

		/*
			Same asymmetry as toggle() below, and for the same reason: hide() sends a pushed aside
			fully offscreen, taking <k-aside-toggle> — the only control that could reopen it — with
			it. That is recoverable for an overlay (the backdrop and trigger live outside the aside),
			but for a push-style nav it is a global keyboard shortcut that can strand the entire admin
			sidebar with no way back. Escape on a pushed aside collapses it instead, mirroring toggle().
		*/
		if(this.main === 'overlay') this.hide();
		else this.collapse();
	}

	/*
		Lifecycle Callbacks
	*/
	updated(changedProperties) {
		super.updated(changedProperties);

		if(changedProperties.has('persistentId') && this.persistentId && window?.localStorage) {
			const key = `aside-persistent-id-${this.persistentId}`;
			const saved = window.localStorage.getItem(key);

			/*
				'offscreen' is deliberately never restored. It means "dismissed right now", not a
				layout preference — and for a pushed aside it is a trap: the toggle that reopens it
				lives inside the aside, so restoring offscreen leaves no way back, survives reloads,
				and can only be undone from devtools.

				Reading it here also heals anyone already stuck in that state from an earlier version.
			*/
			if(saved === 'offscreen') window.localStorage.removeItem(key);
			else if(saved) this.state = saved;
		}

		if(changedProperties.has('state')) {
			const prev = changedProperties.get('state');

			if(this.state !== 'offscreen' && (prev === 'offscreen' || prev === undefined)) {
				document.addEventListener('keydown', this.handleKeyDown);
			} else if(this.state === 'offscreen' && prev !== undefined && prev !== 'offscreen') {
				document.removeEventListener('keydown', this.handleKeyDown);
			}

			if(this.main === 'overlay') {
				if(this.state === 'expanded') {
					document.body.classList.add('no-scroll');
				} else {
					document.body.classList.remove('no-scroll');
				}
			}

			const targetWidth = this.state === 'offscreen' ? 0 : this.getTargetWidth(this.state);
			const detail = { aside: this, state: this.state, main: this.main, width: targetWidth };
			this.dispatchEvent(new CustomEvent('aside_state_change', { detail }));
			window.dispatchEvent(new CustomEvent('aside_state_change', { detail }));
			this.inert = this.state === 'offscreen';

			if(this.persistentId && window?.localStorage) {
				const key = `aside-persistent-id-${this.persistentId}`;
				// Storing a dismissal would restore it on the next load — see the note above.
				if(this.state === 'offscreen') window.localStorage.removeItem(key);
				else window.localStorage.setItem(key, this.state);
			}
		}
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		document.removeEventListener('keydown', this.handleKeyDown);
		document.body.classList.remove('no-scroll');
		const detail = { aside: this, state: 'offscreen', main: this.main, width: 0 };
		this.dispatchEvent(new CustomEvent('aside_state_change', { detail }));
		window.dispatchEvent(new CustomEvent('aside_state_change', { detail }));
	}

	/*
		Methods
	*/
	expand = () => this.state = 'expanded';
	collapse = () => this.state = 'collapsed';
	hide = () => this.state = 'offscreen';

	toggle = () => {
		if(this.state !== 'expanded'){
			this.state = 'expanded';
			return;
		}

		/*
			An overlay is dismissed outright — it sits above the page, and the backdrop or Escape
			is how it goes away, so there is always something left to reopen it.

			A pushed aside collapses to its rail instead, because <k-aside-toggle> lives inside the
			aside: sending it offscreen takes the only control that could reopen it along with it.
			Collapsing keeps that control on screen, which is the whole difference between a
			reversible action and a lockout that outlives the page.
		*/
		this.state = this.main === 'overlay' ? 'offscreen' : 'collapsed';
	}

	getTargetWidth(forState) {
		const rootFs = parseFloat(getComputedStyle(document.documentElement).fontSize);
		const varName = forState === 'collapsed' ? '--collapsed-width' : '--width';
		const raw = getComputedStyle(this).getPropertyValue(varName).trim();
		const rem = raw ? parseFloat(raw) : (forState === 'collapsed' ? 3.5 : 20);
		return rem * rootFs;
	}

	/*
		Rendering
	*/
	render() {
		const aside = html`<aside><slot></slot></aside>`;
		if(this.main === 'overlay') {
			return html`
				<k-focus-capture>
					<div id="container">
						<button id="overlay-btn" @click=${this.overlayClick}>
							<div id="overlay-x"><k-icon name="close"></k-icon></div>
						</button>
						${aside}
					</div>
				</k-focus-capture>
			`;
		}
		return aside;
	}

	/*
		Styles
	*/
	static styles = css`
		:host {
			--bg: var(--c_bg);
			--border: var(--c_border);
			--width: 20rem;
			--collapsed-width: 3.5rem;
			position: fixed;
			top: 0;
			height: 100vh;
			pointer-events: none;
		}
		:host([main="push"]) {
			left: 0;
			z-index: 30;
			transition: width var(--animation_ms, 256ms);
		}
		:host([main="push"][side="right"]) {
			left: auto;
			right: 0;
		}
		:host([main="push"][state="collapsed"]) {
			width: var(--collapsed-width);
			pointer-events: auto;
		}
		:host([main="push"][state="expanded"]) {
			width: var(--width);
			pointer-events: auto;
		}
		:host([main="overlay"]) {
			left: 0;
			width: 100vw;
			max-width: 100%;
			z-index: 60;
			overflow: hidden;
		}
		:host([main="overlay"][state="expanded"]) {
			pointer-events: auto;
		}
		k-focus-capture {
			width: 100%;
			height: 100%;
		}
		#container {
			position: relative;
			width: 100%;
			height: 100%;
		}
		#overlay-btn {
			position: absolute;
			width: 100%;
			height: 100%;
			left: 0;
			top: 0;
			background: var(--overlay, rgba(0, 0, 0, 0.5));
			border: none;
			padding: 0;
			cursor: pointer;
			z-index: 1;
			opacity: 0;
			transition: opacity var(--animation_ms, 256ms);
		}
		:host([state="expanded"]) #overlay-btn {
			opacity: 1;
		}
		#overlay-x {
			position: absolute;
			top: var(--spacer_h);
			right: var(--spacer_h);
			font-size: 1.75rem;
			cursor: pointer;
			color: var(--tc_light);
		}
		:host([overlay-close="false"]) #overlay-x {
			display: none;
		}
		:host([overlay-close="false"]) #overlay-btn {
			cursor: default;
		}
		:host([side="right"]) #overlay-x {
			right: auto;
			left: var(--spacer_h);
		}
		aside {
			display: flex;
			flex-direction: column;
			position: fixed;
			top: 0;
			left: 0;
			height: 100vh;
			overflow-y: auto;
			overflow-x: hidden;
			background: var(--bg);
			padding: var(--aside_padding, var(--spacer));
			z-index: 2;
			box-sizing: border-box;
			border-right: 1px solid var(--border);
			transition: width var(--animation_ms, 256ms), transform var(--animation_ms, 256ms);
		}
		:host([side="right"]) aside {
			left: auto;
			right: 0;
			border-right: none;
			border-left: 1px solid var(--border);
		}
		:host([main="push"]) aside {
			position: absolute;
			width: var(--width);
			transform: translateX(-100%);
		}
		:host([main="push"][side="right"]) aside {
			transform: translateX(100%);
		}
		:host([main="push"][state="collapsed"]) aside {
			width: var(--collapsed-width);
			transform: none;
		}
		:host([main="push"][state="expanded"]) aside {
			transform: none;
		}
		:host([main="overlay"]) aside {
			width: var(--width);
			max-width: calc(100vw - 6rem);
			border: none;
			transform: translateX(-100%);
		}
		:host([main="overlay"][state="expanded"]) aside {
			transform: none;
		}
		:host([main="overlay"][side="right"]) aside {
			transform: translateX(100%);
		}
		:host([main="overlay"][side="right"][state="expanded"]) aside {
			transform: none;
		}
	`;
}

customElements.define('k-aside', Aside);

/*
	AsideItem
*/
class AsideItem extends ShadowComponent {
	static properties = {
		icon: { type: String },
		href: { type: String },
		active: { type: Boolean, reflect: true },
		collapsed: { type: Boolean, reflect: true },
		'no-expand': { type: Boolean, attribute: 'no-expand' },
		'hide-when-collapsed': { type: Boolean, attribute: 'hide-when-collapsed' }
	};

	constructor() {
		super();
		this.icon = '';
		this.href = '#';
		this.active = false;
		this.collapsed = false;
		this['no-expand'] = false;
		this['hide-when-collapsed'] = false;
	}

	/*
		Lifecycle Callbacks
	*/
	connectedCallback() {
		super.connectedCallback();
		this.aside = this.closest('k-aside');
		this.inMenu = !!this.closest('k-aside-menu');
		if(this.aside && !this.inMenu) {
			this.collapsed = this.aside.state === 'collapsed';
			this.aside.addEventListener('aside_state_change', this.handleStateChange);
		}
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		if(this.aside) {
			this.aside.removeEventListener('aside_state_change', this.handleStateChange);
		}
	}

	/*
		Event Handlers
	*/
	handleStateChange = (e) => {
		const { state } = e.detail;
		if(state === 'collapsed') this.collapsed = true;
		else if(state === 'expanded') this.collapsed = false;
	};

	handleClick = (e) => {
		if(this.collapsed && !this['no-expand'] && this.aside) {
			e.preventDefault();
			this.aside.expand();
		}
	};

	/*
		Rendering
	*/
	render() {
		return html`
			<a href="${this.href}" class="item ${this.active ? 'active bg-primary' : ''}" @click=${this.handleClick}>
				${this.icon ? html`<k-icon name="${this.icon}"></k-icon>` : this.collapsed ? html`<k-icon name="dot"></k-icon>` : nothing}
				${this.collapsed ? nothing : html`<span class="label"><slot></slot></span>`}
			</a>
		`;
	}

	/*
		Styles
	*/
	static styles = css`
		:host {
			display: block;
		}
		:host([collapsed][hide-when-collapsed]) {
			display: none;
		}
		.item {
			display: flex;
			align-items: center;
			gap: var(--spacer_h);
			padding: var(--spacer_h);
			color: var(--tc);
			text-decoration: none;
			border-radius: var(--radius);
			margin: 0 var(--spacer_h);
			transition: background var(--animation_ms), color var(--animation_ms);
			white-space: nowrap;
		}
		.item:hover {
			background: var(--c_bg_hover);
		}
		.item.active {
			color: var(--tc_on_primary);
		}
		.item.active:hover {
			background: var(--c_primary);
			filter: brightness(1.1);
		}
		k-icon {
			flex-shrink: 0;
		}
		.label {
			min-width: 0;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	`;
}

/*
	AsideLabel
*/
class AsideLabel extends ShadowComponent {
	static properties = {
		collapsed: { type: Boolean, reflect: true }
	};

	constructor() {
		super();
		this.collapsed = false;
	}

	/*
		Lifecycle Callbacks
	*/
	connectedCallback() {
		super.connectedCallback();
		this.aside = this.closest('k-aside');
		if(this.aside) {
			this.collapsed = this.aside.state === 'collapsed';
			this.aside.addEventListener('aside_state_change', this.handleStateChange);
		}
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		if(this.aside) {
			this.aside.removeEventListener('aside_state_change', this.handleStateChange);
		}
	}

	/*
		Event Handlers
	*/
	handleStateChange = (e) => {
		const { state } = e.detail;
		if(state === 'collapsed') this.collapsed = true;
		else if(state === 'expanded') this.collapsed = false;
	};

	/*
		Rendering
	*/
	render() {
		return this.collapsed ? html`<hr>` : html`<div class="label"><slot></slot></div>`;
	}

	/*
		Styles
	*/
	static styles = css`
		:host {
			display: block;
			margin: var(--spacer_h) 0;
		}
		:host([collapsed]) {
			margin: 0 var(--spacer_h);
			align-self: stretch;
		}
		.label {
			padding: 0 var(--spacer);
			font-size: 0.75rem;
			font-weight: 600;
			text-transform: uppercase;
			color: var(--c_text_muted);
			letter-spacing: 0.05em;
		}
		hr {
			border: none;
			border-top: 1px solid var(--c_border);
			margin: var(--spacer_h) var(--spacer);
		}
		:host([collapsed]) hr {
			margin: var(--spacer_h) 0;
		}
	`;
}

/*
	AsideMenu
*/
class AsideMenu extends ShadowComponent {
	static properties = {
		icon: { type: String },
		label: { type: String },
		open: { type: Boolean, reflect: true },
		collapsed: { type: Boolean, reflect: true },
		side: { type: String },
		'no-expand': { type: Boolean, attribute: 'no-expand' },
		'hide-when-collapsed': { type: Boolean, attribute: 'hide-when-collapsed' }
	};

	constructor() {
		super();
		this.icon = '';
		this.label = '';
		this.open = false;
		this.collapsed = false;
		this.side = 'left';
		this['no-expand'] = false;
		this['hide-when-collapsed'] = false;
	}

	/*
		Lifecycle Callbacks
	*/
	connectedCallback() {
		super.connectedCallback();
		this.aside = this.closest('k-aside');
		if(this.aside) {
			this.collapsed = this.aside.state === 'collapsed';
			this.side = this.aside.side || 'left';
			this.aside.addEventListener('aside_state_change', this.handleStateChange);
		}
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		if(this.aside) {
			this.aside.removeEventListener('aside_state_change', this.handleStateChange);
		}
	}

	/*
		Event Handlers
	*/
	handleStateChange = (e) => {
		const { state } = e.detail;
		if(state === 'collapsed') {
			this.collapsed = true;
			this.open = false;
		} else if(state === 'expanded') {
			this.collapsed = false;
		}
		this.side = this.aside?.side || 'left';
	};

	toggleMenu = () => {
		if(!this.collapsed) this.open = !this.open;
	};

	handleCollapsedClick = () => {
		this.open = true;
		this.aside?.expand();
	};

	/*
		Rendering
	*/
	render() {
		if(this.collapsed) {
			const openDirection = this.side === 'right' ? 'left down' : 'right down';
			return html`
				<k-dropdown open-direction=${openDirection} hover>
					<button slot="trigger" class="no-btn collapsed-trigger" @click=${this.handleCollapsedClick}>
						${this.icon ? html`<k-icon name="${this.icon}"></k-icon>` : html`<k-icon name="dot"></k-icon>`}
					</button>
					<slot></slot>
				</k-dropdown>
			`;
		}
		return html`
			<div class="menu-container">
				<button class="no-btn menu-header ${this.open ? 'open' : ''}" @click=${this.toggleMenu}>
					${this.icon ? html`<k-icon name="${this.icon}"></k-icon>` : nothing}
					<span class="label">${this.label}</span>
					<k-icon class="chevron" name="chevron" direction="${this.open ? 'down' : 'right'}"></k-icon>
				</button>
				<div class="menu-content ${this.open ? 'open' : ''}">
					<slot></slot>
				</div>
			</div>
		`;
	}

	/*
		Styles
	*/
	static styles = css`
		:host {
			display: block;
		}
		:host([collapsed][hide-when-collapsed]) {
			display: none;
		}
		.menu-header {
			display: flex !important;
			align-items: center;
			gap: var(--spacer_h);
			padding: var(--spacer_h) !important;
			color: var(--tc);
			background: transparent;
			border: none;
			border-radius: var(--radius);
			margin: 0 var(--spacer_h);
			width: calc(100% - var(--spacer));
			cursor: pointer;
			text-align: left;
			white-space: nowrap;
			transition: background var(--animation_ms);
		}
		.menu-header:hover {
			background: var(--c_bg_hover);
		}
		.collapsed-trigger {
			display: flex;
			align-items: center;
			justify-content: center;
			padding: var(--spacer_h);
			color: var(--tc);
			background: transparent;
			border: none;
			appearance: none;
			border-radius: var(--radius);
			margin: 0 var(--spacer_h);
			cursor: pointer;
			transition: background var(--animation_ms);
		}
		.collapsed-trigger:hover {
			background: var(--c_bg_hover);
		}
		k-dropdown {
			display: block;
		}
		k-icon {
			flex-shrink: 0;
		}
		.label {
			flex: 1;
			min-width: 0;
			overflow: hidden;
			text-overflow: ellipsis;
		}
		.chevron {
			transition: transform var(--animation_ms);
		}
		.menu-content {
			max-height: 0;
			overflow: hidden;
			transition: max-height var(--animation_ms);
			padding-left: calc(var(--spacer_h) * 2);
		}
		.menu-content.open {
			max-height: 500px;
		}
		::slotted(*) {
			margin: 0.25rem 0;
		}
	`;
}

/*
	AsideSpacer
*/
class AsideSpacer extends ShadowComponent {
	render() {
		return html`<div></div>`;
	}

	static styles = css`
		:host {
			display: block;
			flex: 1;
		}
	`;
}

/*
	AsideToggle
*/
class AsideToggle extends ShadowComponent {
	static properties = {
		collapsed: { type: Boolean, reflect: true },
		direction: { type: String }
	};

	constructor() {
		super();
		this.collapsed = false;
		this.direction = 'left';
	}

	/*
		Lifecycle Callbacks
	*/
	connectedCallback() {
		super.connectedCallback();
		this.aside = this.closest('k-aside');
		if(this.aside) {
			this.collapsed = this.aside.state === 'collapsed';
			this.updateDirection();
			this.aside.addEventListener('aside_state_change', this.handleStateChange);
		}
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		if(this.aside) {
			this.aside.removeEventListener('aside_state_change', this.handleStateChange);
		}
	}

	/*
		Event Handlers
	*/
	handleStateChange = (e) => {
		const { state } = e.detail;
		if(state === 'collapsed') this.collapsed = true;
		else if(state === 'expanded') this.collapsed = false;
		this.updateDirection();
	};

	handleClick = () => {
		if(!this.aside) return;
		this.aside.state = this.aside.state === 'collapsed' ? 'expanded' : 'collapsed';
	};

	/*
		Methods
	*/
	updateDirection = () => {
		const rightSide = this.aside?.side === 'right';
		this.direction = (this.collapsed !== rightSide) ? 'right' : 'left';
	};

	/*
		Rendering
	*/
	render() {
		return html`
			<div id="header">
				<slot></slot>
				<button id="toggle" @click=${this.handleClick}>
					<k-icon name="arrow-line" direction=${this.direction}></k-icon>
				</button>
			</div>
		`;
	}

	/*
		Styles
	*/
	static styles = css`
		:host {
			display: block;
		}
		#header {
			display: flex;
			align-items: center;
			justify-content: flex-end;
			gap: var(--spacer_h);
			padding: var(--spacer_h);
			border-bottom: 1px solid var(--c_border);
			flex-shrink: 0;
		}
		::slotted(*) {
			margin-right: auto;
			flex: 1;
			min-width: 0;
		}
		:host([collapsed]) ::slotted(*) {
			display: none;
		}
		#toggle {
			flex-shrink: 0;
			width: 2rem;
			height: 2rem;
			border: none;
			appearance: none;
			background: transparent;
			color: var(--c_text);
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			border-radius: var(--radius);
			padding: 0;
		}
		#toggle:hover {
			background: var(--c_bg_hover);
		}
	`;
}

customElements.define('k-aside-item', AsideItem);
customElements.define('k-aside-label', AsideLabel);
customElements.define('k-aside-menu', AsideMenu);
customElements.define('k-aside-spacer', AsideSpacer);
customElements.define('k-aside-toggle', AsideToggle);
