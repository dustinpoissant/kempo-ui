import Aside from '../../src/components/Aside.js';

const createAside = async (options = {}) => {
	const aside = document.createElement('k-aside');
	if(options.state) aside.state = options.state;
	if(options.side) aside.side = options.side;
	if(options.main) aside.main = options.main;
	if(options.overlayClose !== undefined) aside.overlayClose = options.overlayClose;
	if(options.escClose !== undefined) aside.escClose = options.escClose;
	document.body.appendChild(aside);
	await aside.updateComplete;
	return aside;
};

const cleanup = (...elements) => {
	elements.forEach(el => {
		if(el && el.parentNode) el.parentNode.removeChild(el);
	});
	document.body.classList.remove('no-scroll');
};

export default {
	/*
		Element Creation
	*/
	'should create aside element': async ({pass, fail}) => {
		const aside = await createAside();
		if(!(aside instanceof Aside)) {
			cleanup(aside);
			return fail('Element should be instance of Aside');
		}
		cleanup(aside);
		pass('Aside element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const aside = await createAside();
		if(!aside.shadowRoot) {
			cleanup(aside);
			return fail('Should have shadow root');
		}
		cleanup(aside);
		pass('Has shadow root');
	},

	/*
		Default Properties
	*/
	'should default state to expanded': async ({pass, fail}) => {
		const aside = await createAside();
		if(aside.state !== 'offscreen') {
			cleanup(aside);
			return fail(`Expected state "offscreen", got "${aside.state}"`);
		}
		cleanup(aside);
		pass('Default state is offscreen');
	},

	'should default side to left': async ({pass, fail}) => {
		const aside = await createAside();
		if(aside.side !== 'left') {
			cleanup(aside);
			return fail(`Expected side "left", got "${aside.side}"`);
		}
		cleanup(aside);
		pass('Default side is left');
	},

	'should default main to push': async ({pass, fail}) => {
		const aside = await createAside();
		if(aside.main !== 'overlay') {
			cleanup(aside);
			return fail(`Expected main "overlay", got "${aside.main}"`);
		}
		cleanup(aside);
		pass('Default main is overlay');
	},

	'should default overlayClose to true': async ({pass, fail}) => {
		const aside = await createAside();
		if(aside.overlayClose !== true) {
			cleanup(aside);
			return fail(`Expected overlayClose true, got ${aside.overlayClose}`);
		}
		cleanup(aside);
		pass('Default overlayClose is true');
	},

	'should default escClose to true': async ({pass, fail}) => {
		const aside = await createAside();
		if(aside.escClose !== true) {
			cleanup(aside);
			return fail(`Expected escClose true, got ${aside.escClose}`);
		}
		cleanup(aside);
		pass('Default escClose is true');
	},

	/*
		Attribute Reflection
	*/
	'should reflect state attribute': async ({pass, fail}) => {
		const aside = await createAside();
		if(aside.getAttribute('state') !== 'offscreen') {
			cleanup(aside);
			return fail('State attribute not reflected');
		}
		aside.state = 'expanded';
		await aside.updateComplete;
		if(aside.getAttribute('state') !== 'expanded') {
			cleanup(aside);
			return fail('State attribute not updated on change');
		}
		cleanup(aside);
		pass('State attribute reflected');
	},

	'should reflect side attribute': async ({pass, fail}) => {
		const aside = await createAside();
		if(aside.getAttribute('side') !== 'left') {
			cleanup(aside);
			return fail('Side attribute not reflected');
		}
		aside.side = 'right';
		await aside.updateComplete;
		if(aside.getAttribute('side') !== 'right') {
			cleanup(aside);
			return fail('Side attribute not updated on change');
		}
		cleanup(aside);
		pass('Side attribute reflected');
	},

	'should reflect main attribute': async ({pass, fail}) => {
		const aside = await createAside();
		if(aside.getAttribute('main') !== 'overlay') {
			cleanup(aside);
			return fail('Main attribute not reflected');
		}
		aside.main = 'push';
		await aside.updateComplete;
		if(aside.getAttribute('main') !== 'push') {
			cleanup(aside);
			return fail('Main attribute not updated on change');
		}
		cleanup(aside);
		pass('Main attribute reflected');
	},

	/*
		Methods
	*/
	'expand() should set state to expanded': async ({pass, fail}) => {
		const aside = await createAside({ state: 'offscreen' });
		aside.expand();
		await aside.updateComplete;
		if(aside.state !== 'expanded') {
			cleanup(aside);
			return fail(`Expected "expanded", got "${aside.state}"`);
		}
		cleanup(aside);
		pass('expand() sets state to expanded');
	},

	'collapse() should set state to collapsed': async ({pass, fail}) => {
		const aside = await createAside();
		aside.collapse();
		await aside.updateComplete;
		if(aside.state !== 'collapsed') {
			cleanup(aside);
			return fail(`Expected "collapsed", got "${aside.state}"`);
		}
		cleanup(aside);
		pass('collapse() sets state to collapsed');
	},

	'hide() should set state to offscreen': async ({pass, fail}) => {
		const aside = await createAside();
		aside.hide();
		await aside.updateComplete;
		if(aside.state !== 'offscreen') {
			cleanup(aside);
			return fail(`Expected "offscreen", got "${aside.state}"`);
		}
		cleanup(aside);
		pass('hide() sets state to offscreen');
	},

	'toggle() should switch between expanded and offscreen': async ({pass, fail}) => {
		const aside = await createAside({ state: 'offscreen' });
		aside.toggle();
		await aside.updateComplete;
		if(aside.state !== 'expanded') {
			cleanup(aside);
			return fail(`Expected "expanded" after first toggle, got "${aside.state}"`);
		}
		aside.toggle();
		await aside.updateComplete;
		if(aside.state !== 'offscreen') {
			cleanup(aside);
			return fail(`Expected "offscreen" after second toggle, got "${aside.state}"`);
		}
		cleanup(aside);
		pass('toggle() switches between expanded and offscreen');
	},

	/*
		Events
	*/
	'should dispatch aside_state_change on element': async ({pass, fail}) => {
		const aside = await createAside({ state: 'offscreen' });
		let received = null;
		aside.addEventListener('aside_state_change', e => { received = e.detail; });
		aside.expand();
		await aside.updateComplete;
		if(!received) {
			cleanup(aside);
			return fail('Event not dispatched on element');
		}
		if(received.state !== 'expanded' || received.aside !== aside) {
			cleanup(aside);
			return fail('Event detail incorrect');
		}
		cleanup(aside);
		pass('Dispatches aside_state_change on element');
	},

	'should dispatch aside_state_change on window': async ({pass, fail}) => {
		const aside = await createAside({ state: 'offscreen' });
		let received = null;
		const handler = e => { received = e.detail; };
		window.addEventListener('aside_state_change', handler);
		aside.expand();
		await aside.updateComplete;
		window.removeEventListener('aside_state_change', handler);
		if(!received) {
			cleanup(aside);
			return fail('Event not dispatched on window');
		}
		if(received.state !== 'expanded' || received.main !== 'overlay') {
			cleanup(aside);
			return fail('Window event detail incorrect');
		}
		cleanup(aside);
		pass('Dispatches aside_state_change on window');
	},

	'event detail should include aside, state, main': async ({pass, fail}) => {
		const aside = await createAside({ state: 'offscreen', main: 'overlay' });
		let received = null;
		aside.addEventListener('aside_state_change', e => { received = e.detail; });
		aside.expand();
		await aside.updateComplete;
		if(!received || received.aside !== aside || received.state !== 'expanded' || received.main !== 'overlay') {
			cleanup(aside);
			return fail('Event detail should have aside, state, and main');
		}
		cleanup(aside);
		pass('Event detail includes aside, state, main');
	},

	/*
		Push Mode Rendering
	*/
	'push mode should render aside element': async ({pass, fail}) => {
		const aside = await createAside({ main: 'push' });
		const el = aside.shadowRoot.querySelector('aside');
		if(!el) {
			cleanup(aside);
			return fail('Should render aside element in push mode');
		}
		cleanup(aside);
		pass('Push mode renders aside element');
	},

	'push mode should not render focus capture': async ({pass, fail}) => {
		const aside = await createAside({ main: 'push' });
		const fc = aside.shadowRoot.querySelector('k-focus-capture');
		if(fc) {
			cleanup(aside);
			return fail('Push mode should not have focus capture');
		}
		cleanup(aside);
		pass('Push mode does not render focus capture');
	},

	/*
		Overlay Mode Rendering
	*/
	'overlay mode should render focus capture': async ({pass, fail}) => {
		const aside = await createAside({ main: 'overlay', state: 'offscreen' });
		aside.expand();
		await aside.updateComplete;
		const fc = aside.shadowRoot.querySelector('k-focus-capture');
		if(!fc) {
			cleanup(aside);
			return fail('Overlay mode should have focus capture');
		}
		cleanup(aside);
		pass('Overlay mode renders focus capture');
	},

	'overlay mode should render overlay button': async ({pass, fail}) => {
		const aside = await createAside({ main: 'overlay', state: 'offscreen' });
		aside.expand();
		await aside.updateComplete;
		const btn = aside.shadowRoot.querySelector('#overlay-btn');
		if(!btn) {
			cleanup(aside);
			return fail('Overlay mode should have overlay button');
		}
		cleanup(aside);
		pass('Overlay mode renders overlay button');
	},

	'overlay mode should add no-scroll to body when expanded': async ({pass, fail}) => {
		const aside = await createAside({ main: 'overlay', state: 'offscreen' });
		aside.expand();
		await aside.updateComplete;
		if(!document.body.classList.contains('no-scroll')) {
			cleanup(aside);
			return fail('Should add no-scroll to body');
		}
		cleanup(aside);
		pass('Overlay mode adds no-scroll when expanded');
	},

	'overlay mode should remove no-scroll when hidden': async ({pass, fail}) => {
		const aside = await createAside({ main: 'overlay', state: 'offscreen' });
		aside.expand();
		await aside.updateComplete;
		aside.hide();
		await aside.updateComplete;
		if(document.body.classList.contains('no-scroll')) {
			cleanup(aside);
			return fail('Should remove no-scroll from body');
		}
		cleanup(aside);
		pass('Overlay mode removes no-scroll when hidden');
	},

	/*
		Overlay Close Behavior
	*/
	'clicking overlay should close when overlayClose is true': async ({pass, fail}) => {
		const aside = await createAside({ main: 'overlay', state: 'offscreen' });
		aside.expand();
		await aside.updateComplete;
		const btn = aside.shadowRoot.querySelector('#overlay-btn');
		btn.click();
		await aside.updateComplete;
		if(aside.state !== 'offscreen') {
			cleanup(aside);
			return fail('Should hide on overlay click');
		}
		cleanup(aside);
		pass('Clicking overlay closes when overlayClose is true');
	},

	'clicking overlay should not close when overlayClose is false': async ({pass, fail}) => {
		const aside = await createAside({ main: 'overlay', state: 'offscreen', overlayClose: false });
		aside.expand();
		await aside.updateComplete;
		const btn = aside.shadowRoot.querySelector('#overlay-btn');
		btn.click();
		await aside.updateComplete;
		if(aside.state !== 'expanded') {
			cleanup(aside);
			return fail('Should not hide on overlay click when overlayClose is false');
		}
		cleanup(aside);
		pass('Clicking overlay does not close when overlayClose is false');
	},

	/*
		ESC Key Close Behavior
	*/
	'ESC should close when escClose is true': async ({pass, fail}) => {
		const aside = await createAside({ main: 'overlay', state: 'offscreen' });
		aside.expand();
		await aside.updateComplete;
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
		await aside.updateComplete;
		if(aside.state !== 'offscreen') {
			cleanup(aside);
			return fail('Should hide on ESC');
		}
		cleanup(aside);
		pass('ESC closes when escClose is true');
	},

	'ESC should not close when escClose is false': async ({pass, fail}) => {
		const aside = await createAside({ main: 'overlay', state: 'offscreen', escClose: false });
		aside.expand();
		await aside.updateComplete;
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
		await aside.updateComplete;
		if(aside.state !== 'expanded') {
			cleanup(aside);
			return fail('Should not hide on ESC when escClose is false');
		}
		cleanup(aside);
		pass('ESC does not close when escClose is false');
	},

	'ESC on a pushed aside collapses instead of hiding it': async ({pass, fail}) => {
		const aside = await createAside({ main: 'push', state: 'expanded' });
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
		await aside.updateComplete;
		const state = aside.state;
		cleanup(aside);
		// Same lockout as an unguarded toggle(): the rail has to stay on screen, it carries the toggle
		if(state !== 'collapsed') return fail(`Expected "collapsed", got "${state}"`);
		pass('Pushed aside collapses on ESC rather than stranding the user');
	},

	/*
		Side Configuration
	*/
	'should support right side': async ({pass, fail}) => {
		const aside = await createAside({ side: 'right' });
		if(aside.getAttribute('side') !== 'right') {
			cleanup(aside);
			return fail('Side attribute not set to right');
		}
		const el = aside.shadowRoot.querySelector('aside');
		if(!el) {
			cleanup(aside);
			return fail('Should render aside element');
		}
		cleanup(aside);
		pass('Supports right side');
	},

	/*
		Cleanup on Disconnect
	*/
	'should remove no-scroll on disconnect': async ({pass, fail}) => {
		const aside = await createAside({ main: 'overlay', state: 'offscreen' });
		aside.expand();
		await aside.updateComplete;
		if(!document.body.classList.contains('no-scroll')) {
			cleanup(aside);
			return fail('Should have no-scroll before disconnect');
		}
		aside.parentNode.removeChild(aside);
		if(document.body.classList.contains('no-scroll')) {
			return fail('Should remove no-scroll on disconnect');
		}
		pass('Removes no-scroll on disconnect');
	},

	'should dispatch offscreen event on disconnect': async ({pass, fail}) => {
		const aside = await createAside();
		let received = null;
		const handler = e => { received = e.detail; };
		window.addEventListener('aside_state_change', handler);
		aside.parentNode.removeChild(aside);
		window.removeEventListener('aside_state_change', handler);
		if(!received || received.state !== 'offscreen') {
			return fail('Should dispatch offscreen event on disconnect');
		}
		pass('Dispatches offscreen event on disconnect');
	},

	/*
		Persistent ID
	*/
	'persistentId: should default to null': async ({pass, fail}) => {
		const aside = await createAside();
		if(aside.persistentId !== null) {
			cleanup(aside);
			return fail(`Expected persistentId null, got ${aside.persistentId}`);
		}
		cleanup(aside);
		pass('persistentId defaults to null');
	},

	'persistentId: should save state to localStorage on state change': async ({pass, fail}) => {
		const id = `test-aside-save-${Date.now()}`;
		const key = `aside-persistent-id-${id}`;
		localStorage.removeItem(key);
		const aside = await createAside({ main: 'push', state: 'offscreen' });
		aside.persistentId = id;
		await aside.updateComplete;
		aside.expand();
		await aside.updateComplete;
		const saved = localStorage.getItem(key);
		localStorage.removeItem(key);
		cleanup(aside);
		if(saved !== 'expanded') return fail(`Expected "expanded" in localStorage, got "${saved}"`);
		pass('persistentId saves state to localStorage');
	},

	'persistentId: should restore state from localStorage on connect': async ({pass, fail}) => {
		const id = `test-aside-restore-${Date.now()}`;
		const key = `aside-persistent-id-${id}`;
		localStorage.setItem(key, 'expanded');
		const aside = document.createElement('k-aside');
		aside.setAttribute('main', 'push');
		aside.setAttribute('state', 'offscreen');
		aside.setAttribute('persistent-id', id);
		document.body.appendChild(aside);
		await aside.updateComplete;
		// Wait for the property change to apply
		await new Promise(r => setTimeout(r, 50));
		const state = aside.state;
		localStorage.removeItem(key);
		cleanup(aside);
		if(state !== 'expanded') return fail(`Expected restored state "expanded", got "${state}"`);
		pass('persistentId restores state from localStorage');
	},

	'persistentId: should save collapsed state': async ({pass, fail}) => {
		const id = `test-aside-collapsed-${Date.now()}`;
		const key = `aside-persistent-id-${id}`;
		localStorage.removeItem(key);
		const aside = await createAside({ main: 'push', state: 'offscreen' });
		aside.persistentId = id;
		await aside.updateComplete;
		aside.collapse();
		await aside.updateComplete;
		const saved = localStorage.getItem(key);
		localStorage.removeItem(key);
		cleanup(aside);
		if(saved !== 'collapsed') return fail(`Expected "collapsed" in localStorage, got "${saved}"`);
		pass('persistentId saves collapsed state');
	},

	'persistentId: should not save state when not set': async ({pass, fail}) => {
		const aside = await createAside({ main: 'push', state: 'offscreen' });
		const keysBefore = Object.keys(localStorage).filter(k => k.startsWith('aside-persistent-id-'));
		aside.expand();
		await aside.updateComplete;
		const keysAfter = Object.keys(localStorage).filter(k => k.startsWith('aside-persistent-id-'));
		cleanup(aside);
		if(keysAfter.length > keysBefore.length) return fail('Should not save to localStorage when persistentId is null');
		pass('Does not save to localStorage without persistentId');
	},

	/*
		AsideItem
	*/
	'AsideItem: should create element': async ({pass, fail}) => {
		const aside = await createAside({ main: 'push' });
		const item = document.createElement('k-aside-item');
		item.icon = 'cards';
		item.href = '#test';
		item.textContent = 'Test';
		aside.appendChild(item);
		await item.updateComplete;
		if(!item.shadowRoot) {
			cleanup(aside);
			return fail('Should have shadow root');
		}
		cleanup(aside);
		pass('AsideItem created');
	},

	'AsideItem: should default collapsed to false': async ({pass, fail}) => {
		const aside = await createAside({ main: 'push' });
		const item = document.createElement('k-aside-item');
		aside.appendChild(item);
		await item.updateComplete;
		if(item.collapsed !== false) {
			cleanup(aside);
			return fail(`Expected collapsed false, got ${item.collapsed}`);
		}
		cleanup(aside);
		pass('AsideItem defaults collapsed to false');
	},

	'AsideItem: should sync collapsed when aside collapses': async ({pass, fail}) => {
		const aside = await createAside({ main: 'push' });
		const item = document.createElement('k-aside-item');
		aside.appendChild(item);
		await item.updateComplete;
		aside.collapse();
		await aside.updateComplete;
		await item.updateComplete;
		if(!item.collapsed) {
			cleanup(aside);
			return fail('Item should be collapsed');
		}
		cleanup(aside);
		pass('AsideItem syncs collapsed');
	},

	'AsideItem: should sync expanded when aside expands': async ({pass, fail}) => {
		const aside = await createAside({ main: 'push', state: 'collapsed' });
		const item = document.createElement('k-aside-item');
		aside.appendChild(item);
		await item.updateComplete;
		aside.expand();
		await aside.updateComplete;
		await item.updateComplete;
		if(item.collapsed) {
			cleanup(aside);
			return fail('Item should not be collapsed');
		}
		cleanup(aside);
		pass('AsideItem syncs expanded');
	},

	'AsideItem: should render link with icon': async ({pass, fail}) => {
		const aside = await createAside({ main: 'push' });
		const item = document.createElement('k-aside-item');
		item.icon = 'cards';
		item.href = '#test';
		item.textContent = 'Dashboard';
		aside.appendChild(item);
		await item.updateComplete;
		const link = item.shadowRoot.querySelector('a');
		const icon = item.shadowRoot.querySelector('k-icon');
		if(!link || link.getAttribute('href') !== '#test') {
			cleanup(aside);
			return fail('Should render link with href');
		}
		if(!icon || icon.getAttribute('name') !== 'cards') {
			cleanup(aside);
			return fail('Should render icon');
		}
		cleanup(aside);
		pass('AsideItem renders link with icon');
	},

	'AsideItem: should hide label when collapsed': async ({pass, fail}) => {
		const aside = await createAside({ main: 'push' });
		const item = document.createElement('k-aside-item');
		item.icon = 'cards';
		item.textContent = 'Dashboard';
		aside.appendChild(item);
		await item.updateComplete;
		aside.collapse();
		await aside.updateComplete;
		await item.updateComplete;
		const label = item.shadowRoot.querySelector('.label');
		if(label) {
			cleanup(aside);
			return fail('Label should not render when collapsed');
		}
		cleanup(aside);
		pass('AsideItem hides label when collapsed');
	},

	'AsideItem: clicking collapsed item should expand aside': async ({pass, fail}) => {
		const aside = await createAside({ main: 'push', state: 'collapsed' });
		const item = document.createElement('k-aside-item');
		item.icon = 'cards';
		aside.appendChild(item);
		await item.updateComplete;
		item.collapsed = true;
		await item.updateComplete;
		const link = item.shadowRoot.querySelector('a');
		link.click();
		await aside.updateComplete;
		if(aside.state !== 'expanded') {
			cleanup(aside);
			return fail('Aside should expand on collapsed item click');
		}
		cleanup(aside);
		pass('Clicking collapsed item expands aside');
	},

	'AsideItem: no-expand should prevent expand on click': async ({pass, fail}) => {
		const aside = await createAside({ main: 'push', state: 'collapsed' });
		const item = document.createElement('k-aside-item');
		item.icon = 'cards';
		item['no-expand'] = true;
		aside.appendChild(item);
		await item.updateComplete;
		item.collapsed = true;
		await item.updateComplete;
		const link = item.shadowRoot.querySelector('a');
		link.click();
		await aside.updateComplete;
		if(aside.state !== 'collapsed') {
			cleanup(aside);
			return fail('Aside should stay collapsed with no-expand');
		}
		cleanup(aside);
		pass('no-expand prevents expand');
	},

	'AsideItem: hide-when-collapsed should hide item': async ({pass, fail}) => {
		const aside = await createAside({ main: 'push' });
		const item = document.createElement('k-aside-item');
		item.setAttribute('hide-when-collapsed', '');
		item.icon = 'cards';
		aside.appendChild(item);
		await item.updateComplete;
		aside.collapse();
		await aside.updateComplete;
		await item.updateComplete;
		await new Promise(r => requestAnimationFrame(r));
		const display = getComputedStyle(item).display;
		if(display !== 'none') {
			cleanup(aside);
			return fail(`Expected display none, got ${display}`);
		}
		cleanup(aside);
		pass('hide-when-collapsed hides item');
	},

	/*
		AsideLabel
	*/
	'AsideLabel: should render text when expanded': async ({pass, fail}) => {
		const aside = await createAside({ main: 'push' });
		const label = document.createElement('k-aside-label');
		label.textContent = 'Projects';
		aside.appendChild(label);
		await label.updateComplete;
		const div = label.shadowRoot.querySelector('.label');
		if(!div) {
			cleanup(aside);
			return fail('Should render label div when expanded');
		}
		cleanup(aside);
		pass('AsideLabel renders text when expanded');
	},

	'AsideLabel: should render hr when collapsed': async ({pass, fail}) => {
		const aside = await createAside({ main: 'push' });
		const label = document.createElement('k-aside-label');
		label.textContent = 'Projects';
		aside.appendChild(label);
		await label.updateComplete;
		aside.collapse();
		await aside.updateComplete;
		await label.updateComplete;
		const hr = label.shadowRoot.querySelector('hr');
		const div = label.shadowRoot.querySelector('.label');
		if(!hr) {
			cleanup(aside);
			return fail('Should render hr when collapsed');
		}
		if(div) {
			cleanup(aside);
			return fail('Should not render label div when collapsed');
		}
		cleanup(aside);
		pass('AsideLabel renders hr when collapsed');
	},

	/*
		AsideMenu
	*/
	'AsideMenu: should create with properties': async ({pass, fail}) => {
		const aside = await createAside({ main: 'push' });
		const menu = document.createElement('k-aside-menu');
		menu.icon = 'folder';
		menu.label = 'Projects';
		aside.appendChild(menu);
		await menu.updateComplete;
		if(menu.icon !== 'folder' || menu.label !== 'Projects' || menu.open !== false) {
			cleanup(aside);
			return fail('Properties not set correctly');
		}
		cleanup(aside);
		pass('AsideMenu properties correct');
	},

	'AsideMenu: should toggle open on click': async ({pass, fail}) => {
		const aside = await createAside({ main: 'push' });
		const menu = document.createElement('k-aside-menu');
		menu.icon = 'folder';
		menu.label = 'Projects';
		aside.appendChild(menu);
		await menu.updateComplete;
		const btn = menu.shadowRoot.querySelector('button');
		btn.click();
		await menu.updateComplete;
		if(!menu.open) {
			cleanup(aside);
			return fail('Menu should be open after click');
		}
		btn.click();
		await menu.updateComplete;
		if(menu.open) {
			cleanup(aside);
			return fail('Menu should be closed after second click');
		}
		cleanup(aside);
		pass('AsideMenu toggles open');
	},

	'AsideMenu: should close and collapse when aside collapses': async ({pass, fail}) => {
		const aside = await createAside({ main: 'push' });
		const menu = document.createElement('k-aside-menu');
		menu.icon = 'folder';
		menu.label = 'Projects';
		aside.appendChild(menu);
		await menu.updateComplete;
		menu.open = true;
		await menu.updateComplete;
		aside.collapse();
		await aside.updateComplete;
		await menu.updateComplete;
		if(!menu.collapsed || menu.open) {
			cleanup(aside);
			return fail('Menu should be collapsed and closed');
		}
		cleanup(aside);
		pass('AsideMenu collapses and closes');
	},

	'AsideMenu: clicking collapsed menu should expand aside': async ({pass, fail}) => {
		const aside = await createAside({ main: 'push', state: 'collapsed' });
		const menu = document.createElement('k-aside-menu');
		menu.icon = 'folder';
		menu.label = 'Projects';
		aside.appendChild(menu);
		await menu.updateComplete;
		menu.collapsed = true;
		await menu.updateComplete;
		const btn = menu.shadowRoot.querySelector('button');
		btn.click();
		await aside.updateComplete;
		if(aside.state !== 'expanded') {
			cleanup(aside);
			return fail('Aside should expand on collapsed menu click');
		}
		cleanup(aside);
		pass('Clicking collapsed menu expands aside');
	},

	'AsideMenu: clicking collapsed menu should also set open to true': async ({pass, fail}) => {
		const aside = await createAside({ main: 'push', state: 'collapsed' });
		const menu = document.createElement('k-aside-menu');
		menu.icon = 'folder';
		menu.label = 'Projects';
		aside.appendChild(menu);
		await menu.updateComplete;
		const btn = menu.shadowRoot.querySelector('button');
		btn.click();
		await menu.updateComplete;
		if(!menu.open) {
			cleanup(aside);
			return fail('Menu open should be true after clicking collapsed trigger');
		}
		cleanup(aside);
		pass('Clicking collapsed trigger sets menu open to true');
	},

	'AsideMenu: collapsed state should render k-dropdown': async ({pass, fail}) => {
		const aside = await createAside({ main: 'push', state: 'collapsed' });
		const menu = document.createElement('k-aside-menu');
		menu.icon = 'folder';
		menu.label = 'Projects';
		aside.appendChild(menu);
		await menu.updateComplete;
		const dropdown = menu.shadowRoot.querySelector('k-dropdown');
		if(!dropdown) {
			cleanup(aside);
			return fail('Collapsed menu should render k-dropdown');
		}
		cleanup(aside);
		pass('Collapsed menu renders k-dropdown');
	},

	'AsideMenu: collapsed k-dropdown should have hover attribute': async ({pass, fail}) => {
		const aside = await createAside({ main: 'push', state: 'collapsed' });
		const menu = document.createElement('k-aside-menu');
		menu.icon = 'folder';
		menu.label = 'Projects';
		aside.appendChild(menu);
		await menu.updateComplete;
		const dropdown = menu.shadowRoot.querySelector('k-dropdown');
		if(!dropdown || !dropdown.hasAttribute('hover')) {
			cleanup(aside);
			return fail('Collapsed k-dropdown should have hover attribute');
		}
		cleanup(aside);
		pass('Collapsed k-dropdown has hover attribute');
	},

	'AsideMenu: collapsed k-dropdown open-direction should be right down for left aside': async ({pass, fail}) => {
		const aside = await createAside({ main: 'push', state: 'collapsed', side: 'left' });
		const menu = document.createElement('k-aside-menu');
		menu.icon = 'folder';
		aside.appendChild(menu);
		await menu.updateComplete;
		const dropdown = menu.shadowRoot.querySelector('k-dropdown');
		if(!dropdown || dropdown.getAttribute('open-direction') !== 'right down') {
			cleanup(aside);
			return fail(`Expected open-direction "right down", got "${dropdown?.getAttribute('open-direction')}"`);
		}
		cleanup(aside);
		pass('Left aside collapsed menu opens right down');
	},

	'AsideMenu: collapsed k-dropdown open-direction should be left down for right aside': async ({pass, fail}) => {
		const aside = await createAside({ main: 'push', state: 'collapsed', side: 'right' });
		const menu = document.createElement('k-aside-menu');
		menu.icon = 'folder';
		aside.appendChild(menu);
		await menu.updateComplete;
		const dropdown = menu.shadowRoot.querySelector('k-dropdown');
		if(!dropdown || dropdown.getAttribute('open-direction') !== 'left down') {
			cleanup(aside);
			return fail(`Expected open-direction "left down", got "${dropdown?.getAttribute('open-direction')}"`);
		}
		cleanup(aside);
		pass('Right aside collapsed menu opens left down');
	},

	'AsideMenu: should not render k-dropdown when expanded': async ({pass, fail}) => {
		const aside = await createAside({ main: 'push', state: 'expanded' });
		const menu = document.createElement('k-aside-menu');
		menu.icon = 'folder';
		menu.label = 'Projects';
		aside.appendChild(menu);
		await menu.updateComplete;
		const dropdown = menu.shadowRoot.querySelector('k-dropdown');
		if(dropdown) {
			cleanup(aside);
			return fail('Expanded menu should not render k-dropdown');
		}
		cleanup(aside);
		pass('Expanded menu does not render k-dropdown');
	},

	'AsideItem: inside AsideMenu should not sync collapsed state from aside': async ({pass, fail}) => {
		const aside = await createAside({ main: 'push', state: 'expanded' });
		const menu = document.createElement('k-aside-menu');
		menu.icon = 'folder';
		menu.label = 'Projects';
		const item = document.createElement('k-aside-item');
		item.icon = 'cards';
		item.textContent = 'Dashboard';
		menu.appendChild(item);
		aside.appendChild(menu);
		await item.updateComplete;
		aside.collapse();
		await aside.updateComplete;
		await item.updateComplete;
		if(item.collapsed) {
			cleanup(aside);
			return fail('AsideItem inside AsideMenu should not become collapsed');
		}
		cleanup(aside);
		pass('AsideItem inside AsideMenu ignores aside collapsed state');
	},

	'AsideItem: inside AsideMenu should render label (not dot) when aside is collapsed': async ({pass, fail}) => {
		const aside = await createAside({ main: 'push', state: 'expanded' });
		const menu = document.createElement('k-aside-menu');
		menu.icon = 'folder';
		menu.label = 'Projects';
		const item = document.createElement('k-aside-item');
		item.icon = 'cards';
		item.textContent = 'Dashboard';
		menu.appendChild(item);
		aside.appendChild(menu);
		await item.updateComplete;
		aside.collapse();
		await aside.updateComplete;
		await item.updateComplete;
		const label = item.shadowRoot.querySelector('.label');
		if(!label) {
			cleanup(aside);
			return fail('AsideItem inside AsideMenu should still render label when aside is collapsed');
		}
		cleanup(aside);
		pass('AsideItem inside AsideMenu renders label regardless of aside state');
	},

	/*
		AsideSpacer
	*/
	'AsideSpacer: should render with flex 1': async ({pass, fail}) => {
		const aside = await createAside({ main: 'push' });
		const spacer = document.createElement('k-aside-spacer');
		aside.appendChild(spacer);
		await spacer.updateComplete;
		const flex = getComputedStyle(spacer).flexGrow;
		if(flex !== '1') {
			cleanup(aside);
			return fail(`Expected flex-grow 1, got ${flex}`);
		}
		cleanup(aside);
		pass('AsideSpacer has flex-grow 1');
	},

	'AsideSpacer: aside should be a flex column so spacer pushes items down': async ({pass, fail}) => {
		const aside = await createAside({ main: 'push', state: 'expanded' });
		const item1 = document.createElement('k-aside-item');
		item1.icon = 'cards';
		item1.textContent = 'Top';
		const spacer = document.createElement('k-aside-spacer');
		const item2 = document.createElement('k-aside-item');
		item2.icon = 'settings';
		item2.textContent = 'Bottom';
		aside.appendChild(item1);
		aside.appendChild(spacer);
		aside.appendChild(item2);
		await item1.updateComplete;
		await spacer.updateComplete;
		await item2.updateComplete;
		await new Promise(r => requestAnimationFrame(r));
		const asideEl = aside.shadowRoot.querySelector('aside');
		const asideStyle = getComputedStyle(asideEl);
		if(asideStyle.display !== 'flex') {
			cleanup(aside);
			return fail(`Expected aside display flex, got ${asideStyle.display}`);
		}
		if(asideStyle.flexDirection !== 'column') {
			cleanup(aside);
			return fail(`Expected aside flex-direction column, got ${asideStyle.flexDirection}`);
		}
		const spacerRect = spacer.getBoundingClientRect();
		if(spacerRect.height < 1) {
			cleanup(aside);
			return fail(`Spacer should have height > 0 to push items, got ${spacerRect.height}`);
		}
		cleanup(aside);
		pass('Aside is a flex column and spacer pushes items down');
	},

	/*
		Cleanup
	*/
	'AsideItem: should remove listener on disconnect': async ({pass, fail}) => {
		const aside = await createAside({ main: 'push' });
		const item = document.createElement('k-aside-item');
		item.icon = 'cards';
		aside.appendChild(item);
		await item.updateComplete;
		aside.removeChild(item);
		aside.collapse();
		await aside.updateComplete;
		if(item.collapsed) {
			cleanup(aside);
			return fail('Disconnected item should not react to aside changes');
		}
		cleanup(aside);
		pass('AsideItem removes listener on disconnect');
	},

	/*
		Offscreen lockout

		k-aside-toggle lives inside the aside, so for a pushed aside "offscreen" hides the only
		control that reopens it. With persistent-id set, that state used to be saved too, so a
		reload restored the lockout and the only way out was clearing localStorage by hand.
	*/
	'toggle() on a pushed aside collapses instead of hiding it': async ({pass, fail}) => {
		const aside = await createAside({ main: 'push', state: 'expanded' });
		aside.toggle();
		await aside.updateComplete;
		const state = aside.state;
		cleanup(aside);
		// The rail has to stay on screen — it carries the toggle
		if(state !== 'collapsed') return fail(`Expected "collapsed", got "${state}"`);
		pass('Pushed aside collapses rather than stranding the user');
	},

	'persistentId: should not save an offscreen state': async ({pass, fail}) => {
		const id = `test-aside-no-offscreen-${Date.now()}`;
		const key = `aside-persistent-id-${id}`;
		localStorage.removeItem(key);
		const aside = await createAside({ main: 'overlay', state: 'expanded' });
		aside.persistentId = id;
		await aside.updateComplete;
		aside.hide();
		await aside.updateComplete;
		const saved = localStorage.getItem(key);
		localStorage.removeItem(key);
		cleanup(aside);
		if(saved === 'offscreen') return fail('A dismissal must not be persisted — that is the lockout');
		pass('Offscreen is not persisted');
	},

	'persistentId: should discard a stored offscreen state rather than restore it': async ({pass, fail}) => {
		const id = `test-aside-heal-${Date.now()}`;
		const key = `aside-persistent-id-${id}`;
		// Exactly the state users got stuck in, as written by an older version
		localStorage.setItem(key, 'offscreen');
		const aside = document.createElement('k-aside');
		aside.setAttribute('main', 'push');
		aside.setAttribute('state', 'expanded');
		aside.setAttribute('persistent-id', id);
		document.body.appendChild(aside);
		await aside.updateComplete;
		await new Promise(r => setTimeout(r, 50));
		const state = aside.state;
		const stillStored = localStorage.getItem(key);
		localStorage.removeItem(key);
		cleanup(aside);
		if(state === 'offscreen') return fail('Stuck: the bad stored state was restored');
		if(stillStored === 'offscreen') return fail('The bad stored state should have been cleared');
		pass('Recovers from a stored offscreen state');
	}
};
