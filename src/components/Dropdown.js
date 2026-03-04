import { html, css } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';
import { boolTrueFalse } from '../utils/propConverters.js';

// Track all open dropdowns for mutual exclusion
const openDropdowns = new Set();

export default class Dropdown extends ShadowComponent {
	static properties = {
		opened: { type: Boolean, reflect: true },
		openDirection: { type: String, reflect: true, attribute: 'open-direction' },
		closeOnSelect: { type: Boolean, reflect: true, attribute: 'close-on-select', converter: boolTrueFalse },
		closeOnClickOutside: { type: Boolean, reflect: true, attribute: 'close-on-click-outside', converter: boolTrueFalse }
	};

	anchorId = `dropdown-anchor-${Math.random().toString(36).slice(2, 11)}`;

	constructor() {
		super();
		this.opened = false;
		this.openDirection = 'down left';
		this.closeOnSelect = true;
		this.closeOnClickOutside = true;
	}

	/*
		Lifecycle Callbacks
	*/
	connectedCallback() {
		super.connectedCallback();
		document.addEventListener('click', this.handleDocumentClick);
		document.addEventListener('keydown', this.handleKeydown);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		document.removeEventListener('click', this.handleDocumentClick);
		document.removeEventListener('keydown', this.handleKeydown);
		openDropdowns.delete(this);
	}

	updated(changedProperties) {
		super.updated(changedProperties);
		if(changedProperties.has('opened')) {
			if(this.opened) {
				openDropdowns.add(this);
			} else {
				openDropdowns.delete(this);
			}
			this.dispatchEvent(new CustomEvent(this.opened ? 'opened' : 'closed', {
				bubbles: true
			}));
		}
	}

	/*
		Event Handlers
	*/
	handleDocumentClick = e => {
		const clickedDropdown = e.target.closest('k-dropdown');
		const isTrigger = e.target.closest('[slot="trigger"]');

		// If clicking another dropdown's trigger, close this one
		if(clickedDropdown && clickedDropdown !== this && isTrigger) {
			if(this.opened) this.close();
			return;
		}

		if(!this.opened) return;

		// Click is outside this dropdown entirely
		if(clickedDropdown !== this) {
			if(this.closeOnClickOutside) this.close();
			return;
		}

		// Click is on this dropdown's trigger - let handleTriggerClick handle it
		if(isTrigger) return;

		// Click is inside the menu on an interactive element
		const isInteractive = e.target.closest('a, button');
		if(isInteractive && this.closeOnSelect) this.close();
	};

	handleTriggerClick = e => {
		e.stopPropagation();
		// Close all other dropdowns before opening this one
		if(!this.opened) {
			openDropdowns.forEach(dropdown => {
				if(dropdown !== this) dropdown.close();
			});
		}
		this.toggle();
	};

	handleMenuClick = e => {
		const item = e.target.closest('a, button');
		if(item && !item.hasAttribute('disabled')) {
			const value = item.dataset?.value || item.textContent.trim();
			this.dispatchEvent(new CustomEvent('select', {
				detail: { value, item },
				bubbles: true
			}));
		}
	};

	handleKeydown = e => {
		if(!this.opened) return;
		if(e.key === 'Escape') {
			e.preventDefault();
			this.close();
			this.focusTrigger();
		} else if(e.key === 'ArrowDown') {
			e.preventDefault();
			this.focusNextItem();
		} else if(e.key === 'ArrowUp') {
			e.preventDefault();
			this.focusPreviousItem();
		} else if(e.key === 'Enter' || e.key === ' ') {
			const focused = this.querySelector('a:focus, button:focus');
			if(focused) {
				e.preventDefault();
				focused.click();
			}
		}
	};

	/*
		Public Methods
	*/
	open() {
		// Close all other dropdowns first
		openDropdowns.forEach(dropdown => {
			if(dropdown !== this) dropdown.close();
		});
		this.opened = true;
		requestAnimationFrame(() => this.focusFirstItem());
		return this;
	}

	close() {
		this.opened = false;
		return this;
	}

	toggle() {
		return this.opened ? this.close() : this.open();
	}

	/*
		Private Methods
	*/
	focusTrigger() {
		const trigger = this.querySelector('[slot="trigger"]');
		if(trigger) trigger.focus();
	}

	getMenuItems() {
		return [...this.querySelectorAll('a, button')].filter(
			el => !el.hasAttribute('disabled') && !el.closest('[slot="trigger"]')
		);
	}

	focusFirstItem() {
		const items = this.getMenuItems();
		if(items.length > 0) items[0].focus();
	}

	focusNextItem() {
		const items = this.getMenuItems();
		const current = document.activeElement;
		const index = items.indexOf(current);
		const next = items[index + 1] || items[0];
		if(next) next.focus();
	}

	focusPreviousItem() {
		const items = this.getMenuItems();
		const current = document.activeElement;
		const index = items.indexOf(current);
		const prev = items[index - 1] || items[items.length - 1];
		if(prev) prev.focus();
	}

	getPositionArea() {
		const dir = this.openDirection.toLowerCase().trim();
		const parts = dir.split(/\s+/);
		// Map friendly names to position-area values
		const mapping = {
			'down': 'bottom',
			'up': 'top',
			'left': 'left',
			'right': 'right',
			'center': 'center'
		};
		const mapped = parts.map(p => mapping[p] || p);
		// position-area expects: row column (e.g., "bottom left")
		// "down left" -> "bottom left", "up right" -> "top right"
		return mapped.join(' ');
	}

	getFallbacks() {
		const primary = this.getPositionArea();
		const parts = primary.split(' ');
		// Generate sensible fallbacks
		const fallbacks = [];
		// flip-block flips vertical, flip-inline flips horizontal
		fallbacks.push('flip-block');
		fallbacks.push('flip-inline');
		fallbacks.push('flip-block flip-inline');
		return fallbacks.join(', ');
	}

	/*
		Styles
	*/
	static styles = css`
		:host {
			display: inline-block;
			position: relative;
		}
		#trigger {
			cursor: pointer;
			anchor-name: --dropdown-trigger;
		}
		#menu {
			display: none;
			position: fixed;
			position-anchor: --dropdown-trigger;
			z-index: 1000;
			min-width: anchor-size(width);
			background: var(--c_bg);
			border: 1px solid var(--c_border);
			border-radius: var(--radius);
			box-shadow: var(--drop_shadow);
			margin: 0.25rem;
			overflow: hidden;
		}
		:host([opened]) #menu {
			display: block;
		}
		/* Default: down left */
		#menu {
			position-area: bottom span-right;
			position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
		}
		/* down right */
		:host([open-direction="down right"]) #menu {
			position-area: bottom span-left;
		}
		/* down center */
		:host([open-direction="down center"]) #menu,
		:host([open-direction="down"]) #menu {
			position-area: bottom center;
		}
		/* up left */
		:host([open-direction="up left"]) #menu {
			position-area: top span-right;
		}
		/* up right */
		:host([open-direction="up right"]) #menu {
			position-area: top span-left;
		}
		/* up center */
		:host([open-direction="up center"]) #menu,
		:host([open-direction="up"]) #menu {
			position-area: top center;
		}
		/* left up */
		:host([open-direction="left up"]) #menu {
			position-area: left span-top;
		}
		/* left down */
		:host([open-direction="left down"]) #menu {
			position-area: left span-bottom;
		}
		/* left center */
		:host([open-direction="left center"]) #menu,
		:host([open-direction="left"]) #menu {
			position-area: left center;
		}
		/* right up */
		:host([open-direction="right up"]) #menu {
			position-area: right span-top;
		}
		/* right down */
		:host([open-direction="right down"]) #menu {
			position-area: right span-bottom;
		}
		/* right center */
		:host([open-direction="right center"]) #menu,
		:host([open-direction="right"]) #menu {
			position-area: right center;
		}
		/* Slotted menu item styles (not trigger) */
		::slotted(a:not([slot="trigger"])),
		::slotted(button:not([slot="trigger"])) {
			all: unset !important;
			display: block !important;
			box-sizing: border-box !important;
			width: 100% !important;
			padding: var(--spacer_h) var(--spacer) !important;
			color: var(--tc) !important;
			background: transparent !important;
			border: none !important;
			border-top: 1px solid var(--c_border) !important;
			border-radius: 0 !important;
			font: inherit !important;
			text-align: left !important;
			cursor: pointer !important;
			white-space: nowrap !important;
			transition: background var(--animation_ms) !important;
		}
		::slotted(a.k-dropdown-first),
		::slotted(button.k-dropdown-first) {
			border-top: none !important;
		}
		::slotted(a:not([slot="trigger"]):hover),
		::slotted(a:not([slot="trigger"]):focus-visible),
		::slotted(button:not([slot="trigger"]):hover),
		::slotted(button:not([slot="trigger"]):focus-visible) {
			background: var(--c_bg__alt) !important;
			outline: none !important;
		}
		::slotted(a:not([slot="trigger"])[disabled]),
		::slotted(button:not([slot="trigger"])[disabled]) {
			opacity: 0.5 !important;
			cursor: not-allowed !important;
			pointer-events: none !important;
		}
		::slotted(hr) {
			display: none !important;
		}
	`;

	/*
		Slot Change Handler
	*/
	handleSlotChange = e => {
		const slot = e.target;
		const items = slot.assignedElements().filter(el => el.matches('a, button'));
		items.forEach((item, i) => item.classList.toggle('k-dropdown-first', i === 0));
	};

	/*
		Rendering
	*/
	render() {
		return html`
			<div id="trigger" @click=${this.handleTriggerClick}>
				<slot name="trigger"></slot>
			</div>
			<div id="menu" role="menu" @click=${this.handleMenuClick}>
				<slot @slotchange=${this.handleSlotChange}></slot>
			</div>
		`;
	}
}

customElements.define('k-dropdown', Dropdown);
