import { html, css } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';
import { boolTrueFalse } from '../utils/propConverters.js';

// Track all open dropdowns for mutual exclusion
const openDropdowns = new Set();

// Tracks the currently open submenu per "submenu parent" (see
// submenuParent getter), so only one submenu is open under a given menu
// at a time — keyed this way instead of a light-DOM :scope query so it
// also works when the submenu's k-dropdown lives inside another custom
// element's own shadow root (e.g. kc-vid-speed inside kc-vid-menu).
const openSubmenuByParent = new Map();

// Menus render as top-layer popovers, which flattens anchor-name
// resolution across the whole document instead of keeping it scoped to
// each dropdown's own shadow root — every instance needs its own
// anchor-name or an open dropdown can anchor to a different instance's
// trigger.
let anchorNameCounter = 0;

export default class Dropdown extends ShadowComponent {
	static properties = {
		opened: { type: Boolean, reflect: true },
		openDirection: { type: String, reflect: true, attribute: 'open-direction' },
		closeOnSelect: { type: Boolean, reflect: true, attribute: 'close-on-select', converter: boolTrueFalse },
		closeOnClickOutside: { type: Boolean, reflect: true, attribute: 'close-on-click-outside', converter: boolTrueFalse },
		submenu: { type: Boolean, reflect: true },
		hover: { type: Boolean, reflect: true }
	};

	constructor() {
		super();
		this.opened = false;
		this.openDirection = 'down left';
		this.closeOnSelect = true;
		this.closeOnClickOutside = true;
		this.submenu = false;
		this.hover = false;
		this.anchorName = `--dropdown-trigger-${anchorNameCounter++}`;
	}

	/*
		Lifecycle Callbacks
	*/
	connectedCallback() {
		super.connectedCallback();
		if(this.parentElement?.tagName === 'K-DROPDOWN' && !this.hasAttribute('slot')) {
			this.submenu = true;
			if(!this.hasAttribute('open-direction')) this.openDirection = 'right down';
		}
		if(this.submenu) {
			this.addEventListener('mouseenter', this.handleSubmenuEnter);
			this.addEventListener('mouseleave', this.handleSubmenuLeave);
		} else {
			document.addEventListener('click', this.handleDocumentClick);
			if(this.hover) {
				this.addEventListener('mouseenter', this.handleHoverEnter);
				this.addEventListener('mouseleave', this.handleHoverLeave);
			}
		}
		document.addEventListener('keydown', this.handleKeydown);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		if(this.submenu) {
			this.removeEventListener('mouseenter', this.handleSubmenuEnter);
			this.removeEventListener('mouseleave', this.handleSubmenuLeave);
		} else {
			document.removeEventListener('click', this.handleDocumentClick);
			this.removeEventListener('mouseenter', this.handleHoverEnter);
			this.removeEventListener('mouseleave', this.handleHoverLeave);
		}
		document.removeEventListener('keydown', this.handleKeydown);
		openDropdowns.delete(this);
		if(this.submenu) {
			const parent = this.submenuParent;
			if(parent && openSubmenuByParent.get(parent) === this) openSubmenuByParent.delete(parent);
		}
		openSubmenuByParent.delete(this);
	}

	updated(changedProperties) {
		super.updated(changedProperties);
		if(changedProperties.has('opened')) {
			if(!this.submenu) {
				if(this.opened) {
					openDropdowns.add(this);
				} else {
					openDropdowns.delete(this);
				}
			}
			this.syncPopoverState();
			this.dispatchEvent(new CustomEvent(this.opened ? 'opened' : 'closed', {
				bubbles: true
			}));
		}
	}

	/*
		The menu is a native popover (top layer) so it always renders above
		everything and is never clipped by an ancestor's overflow/stacking
		context — e.g. kc-video's host has overflow: hidden. `opened` stays
		the single source of truth; this just keeps the popover's own
		show/hide state in sync with it, however `opened` was set (open(),
		close(), or a direct property/attribute assignment).
	*/
	syncPopoverState() {
		const menu = this.menuEl;
		if(!menu) return;
		try {
			const isShowing = menu.matches(':popover-open');
			if(this.opened && !isShowing) menu.showPopover();
			else if(!this.opened && isShowing) menu.hidePopover();
		} catch {
			// Not connected yet, or already in the target state — a later
			// updated() pass will retry if needed.
		}
	}

	get menuEl() {
		return this.shadowRoot?.querySelector('#menu') ?? null;
	}

	/*
		Event Handlers
	*/
	handleDocumentClick = e => {
		const path = e.composedPath();
		const isTrigger = path.find(el => el.matches?.('[slot="trigger"]'));

		if(isTrigger) {
			const triggerDropdown = isTrigger.closest('k-dropdown');
			if(triggerDropdown === this) return;
			// Child submenu trigger — don't close. Crosses shadow-DOM
			// boundaries so a dropdown rendered inside another custom
			// element's own shadow root (e.g. a control nested inside
			// kc-vid-menu) is still recognized as nested.
			if(this.containsAcrossShadow(triggerDropdown)) return;
			if(this.opened) this.close();
			return;
		}

		if(!this.opened) return;

		// Click is outside this dropdown entirely
		if(!path.includes(this)) {
			if(this.closeOnClickOutside) this.close();
			return;
		}

		// Click is inside the menu on an interactive element (including submenu items)
		const isInteractive = path.find(el => el.matches?.('a, button'));
		if(isInteractive && !isInteractive.closest('[slot="trigger"]') && this.closeOnSelect) this.close();
	};

	handleTriggerClick = e => {
		// Submenus (like hover mode) open purely on mouseenter/mouseleave.
		// On touch devices, a single tap synthesizes mouseenter *and* click
		// in quick succession — toggling here too would immediately close
		// what mouseenter just opened, requiring a second tap.
		if(this.hover || this.submenu) return;
		e.stopPropagation();
		// Close all other dropdowns before opening this one — but not an
		// ancestor dropdown this one is nested within, even across
		// shadow-DOM boundaries introduced by intermediate custom elements.
		if(!this.opened) {
			openDropdowns.forEach(dropdown => {
				if(dropdown === this) return;
				if(dropdown.containsAcrossShadow(this)) return;
				dropdown.close();
			});
		}
		this.toggle();
	};

	handleMenuClick = e => {
		const item = e.target.closest('a, button');
		if(!item || item.hasAttribute('disabled')) return;
		// Don't fire select for items inside child submenus
		if(item.closest('k-dropdown') !== this) return;
		const value = item.dataset?.value || item.textContent.trim();
		this.dispatchEvent(new CustomEvent('select', {
			detail: { value, item },
			bubbles: true
		}));
	};

	handleKeydown = e => {
		if(!this.opened) return;
		const focused = document.activeElement;
		// Only handle if focus is within our direct scope
		if(!this.contains(focused)) return;
		const openChild = this.querySelector(':scope > k-dropdown[opened]');
		if(openChild?.contains(focused)) return;

		if(e.key === 'Escape' || (this.submenu && e.key === 'ArrowLeft')) {
			e.preventDefault();
			this.close();
			this.focusTrigger();
		} else if(e.key === 'ArrowDown') {
			e.preventDefault();
			this.focusNextItem();
		} else if(e.key === 'ArrowUp') {
			e.preventDefault();
			this.focusPreviousItem();
		} else if(e.key === 'ArrowRight') {
			const submenu = focused?.closest('k-dropdown[submenu]');
			if(submenu?.submenuParent === this) {
				e.preventDefault();
				submenu.open();
				submenu.focusFirstItem();
			}
		} else if(e.key === 'Enter' || e.key === ' ') {
			const submenu = focused?.closest('k-dropdown[submenu]');
			if(submenu?.submenuParent === this) {
				e.preventDefault();
				submenu.open();
				submenu.focusFirstItem();
			} else if(focused && !focused.closest('[slot="trigger"]')) {
				e.preventDefault();
				focused.click();
			}
		}
	};

	/*
		Public Methods
	*/
	open() {
		if(this.submenu) {
			const parent = this.submenuParent;
			if(parent) {
				const currentlyOpen = openSubmenuByParent.get(parent);
				if(currentlyOpen && currentlyOpen !== this) currentlyOpen.close();
				openSubmenuByParent.set(parent, this);
			}
		} else {
			openDropdowns.forEach(dropdown => {
				if(dropdown === this) return;
				// Don't close an ancestor dropdown that this one is nested
				// within — including nesting introduced by intermediate
				// custom elements with their own shadow roots (e.g. a
				// control that renders its own k-dropdown, slotted inside
				// another control that also renders one).
				if(dropdown.containsAcrossShadow(this)) return;
				dropdown.close();
			});
		}
		this.opened = true;
		if(!this.submenu) requestAnimationFrame(() => this.focusFirstItem());
		return this;
	}

	/*
		Like Node.contains(), but keeps walking past shadow-DOM boundaries
		introduced by intermediate custom elements. Used to recognize a
		dropdown as "nested" inside this one even when a control in between
		(e.g. kc-vid-speed inside kc-vid-menu) renders its own shadow root.
	*/
	containsAcrossShadow(node) {
		const thisRoot = this.getRootNode();
		let current = node;
		while(current) {
			if(current === this) return true;
			if(current instanceof ShadowRoot) {
				current = current.host;
				continue;
			}
			if(current.shadowRoot === thisRoot) return true;
			current = current.parentNode;
		}
		return false;
	}

	/*
		Like this.parentElement, but for submenus: keeps walking past
		shadow-DOM boundaries introduced by an intermediate custom element
		(e.g. kc-vid-speed renders its own k-dropdown inside its own shadow
		root; its submenuParent is the outer k-dropdown it's slotted into,
		not null). Falls back to plain parentElement for vanilla light-DOM
		nesting, which is also a k-dropdown found this same way.
	*/
	get submenuParent() {
		let node = this.parentNode;
		while(node) {
			if(node instanceof ShadowRoot) {
				node = node.host;
				continue;
			}
			if(node.tagName === 'K-DROPDOWN') return node;
			if(node.shadowRoot) {
				const hostDropdown = node.shadowRoot.querySelector(':scope > k-dropdown');
				if(hostDropdown && hostDropdown !== this) return hostDropdown;
			}
			node = node.parentNode;
		}
		return null;
	}

	close() {
		const openChild = openSubmenuByParent.get(this);
		if(openChild) openChild.close();
		if(this.submenu) {
			const parent = this.submenuParent;
			if(parent && openSubmenuByParent.get(parent) === this) openSubmenuByParent.delete(parent);
		}
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
		return [...this.children].reduce((items, child) => {
			if(child.matches('[slot="trigger"]') || child.hasAttribute('disabled')) return items;
			if(child.tagName === 'K-DROPDOWN') {
				const trigger = child.querySelector('[slot="trigger"]');
				if(trigger) items.push(trigger);
			} else if(child.matches('a, button')) {
				items.push(child);
			}
			return items;
		}, []);
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

	/*
		Styles
	*/
	static styles = css`
		:host {
			display: inline-block;
			position: relative;
			white-space: normal;
		}
		#trigger {
			display: inline-flex;
			align-items: center;
			cursor: pointer;
		}
		#menu {
			position: fixed;
			min-width: anchor-size(width);
			background: var(--c_bg);
			border: 1px solid var(--c_border);
			border-radius: var(--radius);
			box-shadow: var(--drop_shadow);
			margin: 0.25rem;
			overflow: hidden;
		}
		:host([submenu]) #menu {
			margin: 0;
		}
		/* Default: down left */
		#menu {
			position-area: bottom span-right;
			position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
			padding: 0; 
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
		/* Slotted submenu dropdowns */
		::slotted(k-dropdown) {
			display: block !important;
			width: 100% !important;
			border-top: 1px solid var(--c_border) !important;
		}
		::slotted(k-dropdown.k-dropdown-first) {
			border-top: none !important;
		}
		/* Submenu host styles */
		:host([submenu]) {
			display: block;
			position: relative;
		}
		:host([submenu]) #trigger {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 1rem;
			padding: var(--spacer_h) var(--spacer);
			cursor: pointer;
			white-space: nowrap;
			transition: background var(--animation_ms);
		}
		:host([submenu]) #trigger:hover,
		:host([submenu]) #trigger:focus-within {
			background: var(--c_bg__alt);
		}
		:host([submenu]) #trigger ::slotted(button),
		:host([submenu]) #trigger ::slotted(a) {
			all: unset !important;
			cursor: pointer !important;
			font: inherit !important;
			color: var(--tc) !important;
		}
		:host([submenu]) #trigger k-icon {
			font-size: 0.75em;
			opacity: 0.6;
		}
	`;

	handleHoverEnter = () => {
		clearTimeout(this.closeTimer);
		if(!this.opened) this.open();
	};

	handleHoverLeave = () => {
		this.closeTimer = setTimeout(() => this.close(), 150);
	};

	/*
		Slot Change Handler
	*/
	handleSubmenuEnter = () => {
		clearTimeout(this.closeTimer);
		if(!this.opened) this.open();
	};

	handleSubmenuLeave = () => {
		this.closeTimer = setTimeout(() => this.close(), 150);
	};

	handleSlotChange = e => {
		const slot = e.target;
		const items = slot.assignedElements().filter(el => el.matches('a, button, k-dropdown'));
		items.forEach((item, i) => item.classList.toggle('k-dropdown-first', i === 0));
	};

	/*
		Rendering
	*/
	render() {
		return html`
			<div id="trigger" part="trigger" style="anchor-name: ${this.anchorName}" @click=${this.handleTriggerClick}>
				<slot name="trigger"></slot>
				${this.submenu ? html`<k-icon name="chevron"></k-icon>` : ''}
			</div>
			<div id="menu" part="menu" role="menu" popover="manual" style="position-anchor: ${this.anchorName}" @click=${this.handleMenuClick}>
				<slot @slotchange=${this.handleSlotChange}></slot>
			</div>
		`;
	}
}

customElements.define('k-dropdown', Dropdown);
