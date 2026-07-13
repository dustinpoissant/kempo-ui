import Dropdown from '../../src/components/Dropdown.js';

const createDropdown = async (options = {}) => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-dropdown
			${options.openDirection ? `open-direction="${options.openDirection}"` : ''}
			${options.opened ? 'opened' : ''}
			${options.closeOnSelect === false ? 'close-on-select="false"' : ''}
			${options.closeOnClickOutside === false ? 'close-on-click-outside="false"' : ''}
			${options.hover ? 'hover' : ''}
		>
			<button slot="trigger">Trigger</button>
			<button data-value="item1">Item 1</button>
			<button data-value="item2">Item 2</button>
			<button data-value="item3">Item 3</button>
			${options.withDisabled ? '<button data-value="disabled" disabled>Disabled</button>' : ''}
			${options.withDivider ? '<hr /><button data-value="item4">Item 4</button>' : ''}
			${options.withLinks ? '<a href="#link1">Link 1</a><a href="#link2">Link 2</a>' : ''}
		</k-dropdown>
	`;
	document.body.appendChild(container);
	const dropdown = container.querySelector('k-dropdown');
	await dropdown.updateComplete;
	return { container, dropdown };
};

const cleanup = (container) => {
	if(container && container.parentNode) {
		container.parentNode.removeChild(container);
	}
};

export default {
	/*
		Element Creation
	*/
	'should create dropdown element': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown();
		if(!dropdown) {
			cleanup(container);
			return fail('Dropdown element should be created');
		}
		if(!(dropdown instanceof Dropdown)) {
			cleanup(container);
			return fail('Element should be instance of Dropdown');
		}
		cleanup(container);
		pass('Dropdown element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown();
		if(!dropdown.shadowRoot) {
			cleanup(container);
			return fail('Dropdown should have shadow root');
		}
		cleanup(container);
		pass('Dropdown has shadow root');
	},

	'should be closed by default': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown();
		if(dropdown.opened !== false) {
			cleanup(container);
			return fail(`Expected opened to be false, got ${dropdown.opened}`);
		}
		cleanup(container);
		pass('Dropdown is closed by default');
	},

	'should have default openDirection of down left': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown();
		if(dropdown.openDirection !== 'down left') {
			cleanup(container);
			return fail(`Expected openDirection to be 'down left', got ${dropdown.openDirection}`);
		}
		cleanup(container);
		pass('Default openDirection is down left');
	},

	/*
		Property Reflection
	*/
	'should reflect opened attribute': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown({ opened: true });
		if(!dropdown.hasAttribute('opened')) {
			cleanup(container);
			return fail('Dropdown should have opened attribute');
		}
		cleanup(container);
		pass('Opened attribute reflects correctly');
	},

	'should reflect open-direction attribute': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown({ openDirection: 'up right' });
		if(dropdown.getAttribute('open-direction') !== 'up right') {
			cleanup(container);
			return fail('open-direction attribute should be up right');
		}
		cleanup(container);
		pass('open-direction attribute reflects correctly');
	},

	/*
		Public Methods - open()
	*/
	'should have open method': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown();
		if(typeof dropdown.open !== 'function') {
			cleanup(container);
			return fail('Dropdown should have open method');
		}
		cleanup(container);
		pass('Dropdown has open method');
	},

	'open() should set opened to true': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown();
		dropdown.open();
		if(dropdown.opened !== true) {
			cleanup(container);
			return fail(`Expected opened to be true after open(), got ${dropdown.opened}`);
		}
		cleanup(container);
		pass('open() sets opened to true');
	},

	'open() should return this for chaining': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown();
		const result = dropdown.open();
		if(result !== dropdown) {
			cleanup(container);
			return fail('open() should return this');
		}
		cleanup(container);
		pass('open() returns this');
	},

	/*
		Public Methods - close()
	*/
	'should have close method': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown();
		if(typeof dropdown.close !== 'function') {
			cleanup(container);
			return fail('Dropdown should have close method');
		}
		cleanup(container);
		pass('Dropdown has close method');
	},

	'close() should set opened to false': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown({ opened: true });
		dropdown.close();
		if(dropdown.opened !== false) {
			cleanup(container);
			return fail(`Expected opened to be false after close(), got ${dropdown.opened}`);
		}
		cleanup(container);
		pass('close() sets opened to false');
	},

	'close() should return this for chaining': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown();
		const result = dropdown.close();
		if(result !== dropdown) {
			cleanup(container);
			return fail('close() should return this');
		}
		cleanup(container);
		pass('close() returns this');
	},

	/*
		Public Methods - toggle()
	*/
	'should have toggle method': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown();
		if(typeof dropdown.toggle !== 'function') {
			cleanup(container);
			return fail('Dropdown should have toggle method');
		}
		cleanup(container);
		pass('Dropdown has toggle method');
	},

	'toggle() should open when closed': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown();
		dropdown.toggle();
		if(dropdown.opened !== true) {
			cleanup(container);
			return fail(`Expected opened to be true after toggle(), got ${dropdown.opened}`);
		}
		cleanup(container);
		pass('toggle() opens when closed');
	},

	'toggle() should close when open': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown({ opened: true });
		dropdown.toggle();
		if(dropdown.opened !== false) {
			cleanup(container);
			return fail(`Expected opened to be false after toggle(), got ${dropdown.opened}`);
		}
		cleanup(container);
		pass('toggle() closes when open');
	},

	/*
		Events
	*/
	'should dispatch opened event when opening': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown();
		let eventFired = false;
		dropdown.addEventListener('opened', () => { eventFired = true; });
		dropdown.open();
		await dropdown.updateComplete;
		if(!eventFired) {
			cleanup(container);
			return fail('opened event should be fired');
		}
		cleanup(container);
		pass('opened event dispatched');
	},

	'should dispatch closed event when closing': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown({ opened: true });
		let eventFired = false;
		dropdown.addEventListener('closed', () => { eventFired = true; });
		dropdown.close();
		await dropdown.updateComplete;
		if(!eventFired) {
			cleanup(container);
			return fail('closed event should be fired');
		}
		cleanup(container);
		pass('closed event dispatched');
	},

	'should dispatch select event when button item clicked': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown({ opened: true });
		let eventFired = false;
		let eventDetail = null;
		dropdown.addEventListener('select', e => {
			eventFired = true;
			eventDetail = e.detail;
		});
		const item = dropdown.querySelector('button[data-value="item1"]');
		item.click();
		if(!eventFired) {
			cleanup(container);
			return fail('select event should be fired');
		}
		if(eventDetail.value !== 'item1') {
			cleanup(container);
			return fail(`Expected value to be 'item1', got ${eventDetail.value}`);
		}
		cleanup(container);
		pass('select event dispatched with correct value');
	},

	'select event should include item reference': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown({ opened: true });
		let eventDetail = null;
		dropdown.addEventListener('select', e => { eventDetail = e.detail; });
		const item = dropdown.querySelector('button[data-value="item2"]');
		item.click();
		if(eventDetail.item !== item) {
			cleanup(container);
			return fail('Event detail should include item reference');
		}
		cleanup(container);
		pass('select event includes item reference');
	},

	/*
		Close Behavior
	*/
	'should close on select by default': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown({ opened: true });
		const item = dropdown.querySelector('button[data-value="item1"]');
		item.click();
		if(dropdown.opened !== false) {
			cleanup(container);
			return fail('Dropdown should close after selection');
		}
		cleanup(container);
		pass('Dropdown closes on select');
	},

	'should not close on select when close-on-select is false': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown({ opened: true, closeOnSelect: false });
		const item = dropdown.querySelector('button[data-value="item1"]');
		item.click();
		if(dropdown.opened !== true) {
			cleanup(container);
			return fail('Dropdown should remain open when close-on-select is false');
		}
		cleanup(container);
		pass('Dropdown stays open when close-on-select is false');
	},

	'should close on Escape key': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown({ opened: true });
		dropdown.querySelector('button[data-value]').focus();
		const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
		document.dispatchEvent(event);
		if(dropdown.opened !== false) {
			cleanup(container);
			return fail('Dropdown should close on Escape');
		}
		cleanup(container);
		pass('Dropdown closes on Escape');
	},

	/*
		Trigger Click
	*/
	'should toggle on trigger click': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown();
		const trigger = dropdown.querySelector('[slot="trigger"]');
		trigger.click();
		if(dropdown.opened !== true) {
			cleanup(container);
			return fail('Dropdown should open on trigger click');
		}
		cleanup(container);
		pass('Dropdown opens on trigger click');
	},

	/*
		Slotted Content
	*/
	'should style slotted buttons': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown();
		const buttons = dropdown.querySelectorAll('button:not([slot])');
		if(buttons.length !== 3) {
			cleanup(container);
			return fail(`Expected 3 button items, got ${buttons.length}`);
		}
		cleanup(container);
		pass('Slotted buttons exist');
	},

	'should style slotted links': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown({ withLinks: true });
		const links = dropdown.querySelectorAll('a');
		if(links.length !== 2) {
			cleanup(container);
			return fail(`Expected 2 link items, got ${links.length}`);
		}
		cleanup(container);
		pass('Slotted links exist');
	},

	'should style slotted hr as divider': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown({ withDivider: true });
		const divider = dropdown.querySelector('hr');
		if(!divider) {
			cleanup(container);
			return fail('HR divider should exist');
		}
		cleanup(container);
		pass('HR divider exists');
	},

	/*
		Keyboard Navigation
	*/
	'ArrowDown should move focus to next item': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown({ opened: true });
		const items = dropdown.querySelectorAll('button:not([slot])');
		items[0].focus();
		const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
		document.dispatchEvent(event);
		if(document.activeElement !== items[1]) {
			cleanup(container);
			return fail('Focus should move to next item');
		}
		cleanup(container);
		pass('ArrowDown moves focus to next item');
	},

	'ArrowUp should move focus to previous item': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown({ opened: true });
		const items = dropdown.querySelectorAll('button:not([slot])');
		items[1].focus();
		const event = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true });
		document.dispatchEvent(event);
		if(document.activeElement !== items[0]) {
			cleanup(container);
			return fail('Focus should move to previous item');
		}
		cleanup(container);
		pass('ArrowUp moves focus to previous item');
	},

	'ArrowDown should wrap to first item': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown({ opened: true });
		const items = dropdown.querySelectorAll('button:not([slot])');
		items[2].focus();
		const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
		document.dispatchEvent(event);
		if(document.activeElement !== items[0]) {
			cleanup(container);
			return fail('Focus should wrap to first item');
		}
		cleanup(container);
		pass('ArrowDown wraps to first item');
	},

	'ArrowUp should wrap to last item': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown({ opened: true });
		const items = dropdown.querySelectorAll('button:not([slot])');
		items[0].focus();
		const event = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true });
		document.dispatchEvent(event);
		if(document.activeElement !== items[2]) {
			cleanup(container);
			return fail('Focus should wrap to last item');
		}
		cleanup(container);
		pass('ArrowUp wraps to last item');
	},

	/*
		Shadow DOM Structure
	*/
	'should render trigger slot': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown();
		const triggerSlot = dropdown.shadowRoot.querySelector('slot[name="trigger"]');
		if(!triggerSlot) {
			cleanup(container);
			return fail('Trigger slot should be rendered');
		}
		cleanup(container);
		pass('Trigger slot rendered');
	},

	'should render menu container': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown();
		const menu = dropdown.shadowRoot.querySelector('#menu');
		if(!menu) {
			cleanup(container);
			return fail('Menu container should be rendered');
		}
		cleanup(container);
		pass('Menu container rendered');
	},

	'menu should have role menu': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown();
		const menu = dropdown.shadowRoot.querySelector('#menu');
		if(menu.getAttribute('role') !== 'menu') {
			cleanup(container);
			return fail('Menu should have role menu');
		}
		cleanup(container);
		pass('Menu has correct role');
	},

	/*
		Method Chaining
	*/
	'should support method chaining': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown();
		dropdown.open().close().toggle();
		if(dropdown.opened !== true) {
			cleanup(container);
			return fail('Expected opened to be true after chain');
		}
		cleanup(container);
		pass('Method chaining works correctly');
	},

	/*
		Multiple Dropdowns
	*/
	'clicking another dropdown trigger should close this one': async ({pass, fail}) => {
		const container1 = document.createElement('div');
		container1.innerHTML = `
			<k-dropdown id="dd1">
				<button slot="trigger">Dropdown 1</button>
				<button data-value="1">Item 1</button>
			</k-dropdown>
		`;
		const container2 = document.createElement('div');
		container2.innerHTML = `
			<k-dropdown id="dd2">
				<button slot="trigger">Dropdown 2</button>
				<button data-value="2">Item 2</button>
			</k-dropdown>
		`;
		document.body.appendChild(container1);
		document.body.appendChild(container2);
		const dd1 = container1.querySelector('k-dropdown');
		const dd2 = container2.querySelector('k-dropdown');
		await dd1.updateComplete;
		await dd2.updateComplete;

		dd1.open();
		await dd1.updateComplete;

		if(!dd1.opened) {
			cleanup(container1);
			cleanup(container2);
			return fail('Dropdown 1 should be open');
		}

		const trigger2 = dd2.querySelector('[slot="trigger"]');
		trigger2.click();
		await dd2.updateComplete;

		if(dd1.opened) {
			cleanup(container1);
			cleanup(container2);
			return fail('Dropdown 1 should be closed after clicking dd2 trigger');
		}

		cleanup(container1);
		cleanup(container2);
		pass('Opening another dropdown closes the first');
	},

	/*
		Open Direction Attribute
	*/
	'should accept various open-direction values': async ({pass, fail}) => {
		const directions = ['down left', 'down right', 'up left', 'up right', 'left up', 'left down', 'right up', 'right down'];
		for(const dir of directions) {
			const { container, dropdown } = await createDropdown({ openDirection: dir });
			if(dropdown.openDirection !== dir) {
				cleanup(container);
				return fail(`Expected openDirection to be '${dir}', got ${dropdown.openDirection}`);
			}
			cleanup(container);
		}
		pass('All open-direction values accepted');
	},

	/*
		Styles
	*/
	'menu should have border-radius using --radius': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown();
		const menu = dropdown.shadowRoot.querySelector('#menu');
		if(!menu) {
			cleanup(container);
			return fail('Menu element should exist');
		}
		document.documentElement.style.setProperty('--radius', '8px');
		const styles = window.getComputedStyle(menu);
		const borderRadius = styles.borderRadius;
		document.documentElement.style.removeProperty('--radius');
		if(borderRadius !== '8px') {
			cleanup(container);
			return fail(`Expected menu border-radius to use --radius (8px), got ${borderRadius}`);
		}
		cleanup(container);
		pass('Menu has border-radius applied using --radius');
	},

	/*
		Disabled Items
	*/
	'disabled items should be skipped in keyboard navigation': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown({ opened: true, withDisabled: true });
		const items = dropdown.querySelectorAll('button:not([slot]):not([disabled])');
		items[2].focus(); // item3
		const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
		document.dispatchEvent(event);
		// Should skip disabled and wrap to first
		if(document.activeElement !== items[0]) {
			cleanup(container);
			return fail('Focus should skip disabled item and wrap');
		}
		cleanup(container);
		pass('Disabled items skipped in navigation');
	},

	/*
		Shadow DOM Compatibility (composedPath)
	*/
	'should close when clicking outside via composedPath': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown();
		dropdown.open();
		await dropdown.updateComplete;
		const outside = document.createElement('div');
		outside.textContent = 'outside';
		document.body.appendChild(outside);
		outside.click();
		await dropdown.updateComplete;
		if(dropdown.opened) {
			cleanup(container);
			outside.remove();
			return fail('Dropdown should close on outside click');
		}
		cleanup(container);
		outside.remove();
		pass('Dropdown closes on outside click via composedPath');
	},

	'should not close when clicking inside menu with close-on-select false': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown({ closeOnSelect: false });
		dropdown.open();
		await dropdown.updateComplete;
		const item = dropdown.querySelector('[data-value="item1"]');
		item.click();
		await dropdown.updateComplete;
		if(!dropdown.opened) {
			cleanup(container);
			return fail('Dropdown should stay open with close-on-select="false"');
		}
		cleanup(container);
		pass('Dropdown stays open with close-on-select="false"');
	},

	/*
		Host Styles
	*/
	'host should have white-space normal': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown();
		const style = getComputedStyle(dropdown);
		if(style.whiteSpace !== 'normal') {
			cleanup(container);
			return fail(`Expected white-space: normal, got ${style.whiteSpace}`);
		}
		cleanup(container);
		pass('Host has white-space: normal');
	},

	'trigger should have inline-flex display': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown();
		await dropdown.updateComplete;
		const trigger = dropdown.shadowRoot.querySelector('#trigger');
		const style = getComputedStyle(trigger);
		if(style.display !== 'inline-flex') {
			cleanup(container);
			return fail(`Expected trigger display: inline-flex, got ${style.display}`);
		}
		cleanup(container);
		pass('Trigger has inline-flex display');
	},

	'dropdown should not inflate height in pre-wrap context': async ({pass, fail}) => {
		const container = document.createElement('div');
		container.style.whiteSpace = 'pre-wrap';
		container.innerHTML = `
			<k-dropdown>
				<button slot="trigger">T</button>
				<button>Item</button>
			</k-dropdown>
		`;
		document.body.appendChild(container);
		const dropdown = container.querySelector('k-dropdown');
		await dropdown.updateComplete;
		const height = dropdown.getBoundingClientRect().height;
		if(height > 60) {
			cleanup(container);
			return fail(`Dropdown height should not inflate in pre-wrap context, got ${height}px`);
		}
		cleanup(container);
		pass('Dropdown does not inflate in pre-wrap context');
	},

	/*
		Hover Mode
	*/
	'hover should be false by default': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown();
		if(dropdown.hover !== false) {
			cleanup(container);
			return fail(`Expected hover to be false, got ${dropdown.hover}`);
		}
		cleanup(container);
		pass('hover is false by default');
	},

	'hover attribute should reflect': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown({ hover: true });
		if(!dropdown.hasAttribute('hover')) {
			cleanup(container);
			return fail('hover attribute should be reflected');
		}
		cleanup(container);
		pass('hover attribute reflects correctly');
	},

	'should open on mouseenter when hover is true': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown({ hover: true });
		dropdown.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
		await dropdown.updateComplete;
		if(!dropdown.opened) {
			cleanup(container);
			return fail('Dropdown should open on mouseenter in hover mode');
		}
		cleanup(container);
		pass('Dropdown opens on mouseenter in hover mode');
	},

	'should close on mouseleave when hover is true': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown({ hover: true, opened: true });
		dropdown.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
		await new Promise(r => setTimeout(r, 200));
		if(dropdown.opened) {
			cleanup(container);
			return fail('Dropdown should close after mouseleave in hover mode');
		}
		cleanup(container);
		pass('Dropdown closes on mouseleave in hover mode');
	},

	'trigger click should not toggle in hover mode': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown({ hover: true });
		const trigger = dropdown.querySelector('[slot="trigger"]');
		trigger.click();
		await dropdown.updateComplete;
		if(dropdown.opened) {
			cleanup(container);
			return fail('Trigger click should not open dropdown in hover mode');
		}
		cleanup(container);
		pass('Trigger click does not toggle in hover mode');
	},

	/*
		Popover Integration
	*/
	'menu should render as a manual popover': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown();
		const menu = dropdown.shadowRoot.querySelector('#menu');
		const popoverAttr = menu.getAttribute('popover');
		cleanup(container);
		if(popoverAttr !== 'manual') return fail(`Expected #menu popover attribute to be "manual", got "${popoverAttr}"`);
		pass('#menu renders as popover="manual"');
	},

	'opening the dropdown should show the menu as an open popover': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown();
		dropdown.open();
		await dropdown.updateComplete;
		const menu = dropdown.shadowRoot.querySelector('#menu');
		const isShowing = menu.matches(':popover-open');
		cleanup(container);
		if(!isShowing) return fail('#menu should match :popover-open after open()');
		pass('open() shows the menu as an open popover');
	},

	'closing the dropdown should hide the popover': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown({ opened: true });
		await dropdown.updateComplete;
		dropdown.close();
		await dropdown.updateComplete;
		const menu = dropdown.shadowRoot.querySelector('#menu');
		const isShowing = menu.matches(':popover-open');
		cleanup(container);
		if(isShowing) return fail('#menu should not match :popover-open after close()');
		pass('close() hides the popover');
	},

	'setting opened as a plain property (not via open()) should still sync the popover': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown();
		dropdown.opened = true;
		await dropdown.updateComplete;
		const menu = dropdown.shadowRoot.querySelector('#menu');
		const isShowing = menu.matches(':popover-open');
		cleanup(container);
		if(!isShowing) return fail('Setting the opened property directly should still show the popover');
		pass('Direct opened property assignment syncs the popover');
	},

	/*
		Unique Anchor Names
	*/
	'each dropdown instance should get its own anchorName': async ({pass, fail}) => {
		const { container: c1, dropdown: d1 } = await createDropdown();
		const { container: c2, dropdown: d2 } = await createDropdown();
		const a1 = d1.anchorName;
		const a2 = d2.anchorName;
		cleanup(c1);
		cleanup(c2);
		if(!a1 || !a2) return fail('Both dropdowns should have an anchorName');
		if(a1 === a2) return fail(`Expected distinct anchorName values, both were "${a1}"`);
		pass('Dropdown instances get distinct anchorName values');
	},

	'trigger and menu should share the same anchorName': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown();
		const trigger = dropdown.shadowRoot.querySelector('#trigger');
		const menu = dropdown.shadowRoot.querySelector('#menu');
		const anchorName = trigger.style.anchorName;
		const positionAnchor = menu.style.positionAnchor;
		cleanup(container);
		if(!anchorName) return fail('#trigger should have an anchor-name style');
		if(anchorName !== positionAnchor) return fail(`Expected #menu position-anchor ("${positionAnchor}") to match #trigger anchor-name ("${anchorName}")`);
		pass('#trigger anchor-name matches #menu position-anchor');
	},

	/*
		containsAcrossShadow
	*/
	'containsAcrossShadow should return true for the dropdown itself': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown();
		const result = dropdown.containsAcrossShadow(dropdown);
		cleanup(container);
		if(!result) return fail('containsAcrossShadow(this) should return true');
		pass('containsAcrossShadow returns true for the dropdown itself');
	},

	'containsAcrossShadow should return false for an unrelated dropdown': async ({pass, fail}) => {
		const { container: c1, dropdown: d1 } = await createDropdown();
		const { container: c2, dropdown: d2 } = await createDropdown();
		const result = d1.containsAcrossShadow(d2);
		cleanup(c1);
		cleanup(c2);
		if(result) return fail('containsAcrossShadow should return false for two independent dropdowns');
		pass('containsAcrossShadow returns false for unrelated dropdowns');
	},

	'containsAcrossShadow should return true for a light-DOM nested submenu': async ({pass, fail}) => {
		const container = document.createElement('div');
		container.innerHTML = `
			<k-dropdown>
				<button slot="trigger">Outer</button>
				<button data-value="1">Item 1</button>
				<k-dropdown>
					<button slot="trigger">Inner</button>
					<button data-value="a">A</button>
				</k-dropdown>
			</k-dropdown>
		`;
		document.body.appendChild(container);
		const outer = container.querySelector('k-dropdown');
		const inner = outer.querySelector('k-dropdown');
		await outer.updateComplete;
		await inner.updateComplete;
		const result = outer.containsAcrossShadow(inner);
		cleanup(container);
		if(!result) return fail('containsAcrossShadow should recognize a light-DOM nested k-dropdown as contained');
		pass('containsAcrossShadow returns true for a light-DOM nested submenu');
	},

	/*
		submenuParent
	*/
	'submenuParent should be null for a top-level dropdown': async ({pass, fail}) => {
		const { container, dropdown } = await createDropdown();
		const parent = dropdown.submenuParent;
		cleanup(container);
		if(parent !== null) return fail(`Expected submenuParent to be null, got ${parent}`);
		pass('submenuParent is null for a top-level dropdown');
	},

	'submenuParent should find the outer k-dropdown for a light-DOM nested submenu': async ({pass, fail}) => {
		const container = document.createElement('div');
		container.innerHTML = `
			<k-dropdown>
				<button slot="trigger">Outer</button>
				<button data-value="1">Item 1</button>
				<k-dropdown>
					<button slot="trigger">Inner</button>
					<button data-value="a">A</button>
				</k-dropdown>
			</k-dropdown>
		`;
		document.body.appendChild(container);
		const outer = container.querySelector('k-dropdown');
		const inner = outer.querySelector('k-dropdown');
		await outer.updateComplete;
		await inner.updateComplete;
		const isSubmenu = inner.submenu;
		const parent = inner.submenuParent;
		cleanup(container);
		if(!isSubmenu) return fail('Nested k-dropdown should be auto-detected as a submenu');
		if(parent !== outer) return fail('submenuParent should return the outer k-dropdown');
		pass('submenuParent finds the outer k-dropdown for a nested submenu');
	},

	/*
		Submenu Interaction
	*/
	'submenu should open via mouseenter': async ({pass, fail}) => {
		const container = document.createElement('div');
		container.innerHTML = `
			<k-dropdown opened>
				<button slot="trigger">Outer</button>
				<k-dropdown>
					<button slot="trigger">Inner</button>
					<button data-value="a">A</button>
				</k-dropdown>
			</k-dropdown>
		`;
		document.body.appendChild(container);
		const outer = container.querySelector('k-dropdown');
		const inner = outer.querySelector('k-dropdown');
		await outer.updateComplete;
		inner.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
		await inner.updateComplete;
		const opened = inner.opened;
		cleanup(container);
		if(!opened) return fail('Submenu should open on mouseenter');
		pass('Submenu opens via mouseenter');
	},

	'a click on an already-mouseenter-opened submenu trigger should not close it': async ({pass, fail}) => {
		// Regression test: on touch devices a single tap synthesizes
		// mouseenter followed immediately by click. Before the fix,
		// handleTriggerClick would toggle() and immediately re-close what
		// mouseenter had just opened, requiring a second tap.
		const container = document.createElement('div');
		container.innerHTML = `
			<k-dropdown opened>
				<button slot="trigger">Outer</button>
				<k-dropdown>
					<button slot="trigger">Inner</button>
					<button data-value="a">A</button>
				</k-dropdown>
			</k-dropdown>
		`;
		document.body.appendChild(container);
		const outer = container.querySelector('k-dropdown');
		const inner = outer.querySelector('k-dropdown');
		await outer.updateComplete;
		const trigger = inner.shadowRoot.querySelector('#trigger');
		// mouseenter/mouseleave don't bubble, so the listener (attached to
		// the host in connectedCallback) must be dispatched on the host
		// itself, not on the shadow-internal #trigger div.
		inner.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
		await inner.updateComplete;
		trigger.click();
		await inner.updateComplete;
		const opened = inner.opened;
		cleanup(container);
		if(!opened) return fail('Submenu should stay open after a click that follows mouseenter (same tap)');
		pass('Submenu trigger click does not undo a mouseenter-triggered open');
	},

	'opening a second submenu under the same parent should close the first': async ({pass, fail}) => {
		const container = document.createElement('div');
		container.innerHTML = `
			<k-dropdown opened>
				<button slot="trigger">Outer</button>
				<k-dropdown>
					<button slot="trigger">First</button>
					<button data-value="a">A</button>
				</k-dropdown>
				<k-dropdown>
					<button slot="trigger">Second</button>
					<button data-value="b">B</button>
				</k-dropdown>
			</k-dropdown>
		`;
		document.body.appendChild(container);
		const outer = container.querySelector('k-dropdown');
		const [first, second] = outer.querySelectorAll(':scope > k-dropdown');
		await outer.updateComplete;
		first.open();
		await first.updateComplete;
		const firstOpenedBefore = first.opened;
		second.open();
		await first.updateComplete;
		await second.updateComplete;
		const firstOpenedAfter = first.opened;
		const secondOpened = second.opened;
		cleanup(container);
		if(!firstOpenedBefore) return fail('First submenu should have opened');
		if(firstOpenedAfter) return fail('First submenu should close when a sibling submenu opens');
		if(!secondOpened) return fail('Second submenu should be open');
		pass('Opening a submenu closes a sibling submenu under the same parent');
	},

	'closing the outer dropdown should also close an open submenu': async ({pass, fail}) => {
		const container = document.createElement('div');
		container.innerHTML = `
			<k-dropdown opened>
				<button slot="trigger">Outer</button>
				<k-dropdown>
					<button slot="trigger">Inner</button>
					<button data-value="a">A</button>
				</k-dropdown>
			</k-dropdown>
		`;
		document.body.appendChild(container);
		const outer = container.querySelector('k-dropdown');
		const inner = outer.querySelector('k-dropdown');
		await outer.updateComplete;
		inner.open();
		await inner.updateComplete;
		outer.close();
		await outer.updateComplete;
		await inner.updateComplete;
		const outerOpened = outer.opened;
		const innerOpened = inner.opened;
		cleanup(container);
		if(outerOpened) return fail('Outer dropdown should be closed');
		if(innerOpened) return fail('Submenu should be closed when its parent closes');
		pass('Closing the outer dropdown cascades to close an open submenu');
	}
};
