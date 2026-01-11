import '../../src/components/SidePanel.js';

const createPanel = async (options = {}) => {
	const panel = document.createElement('k-side-panel');
	if(options.collapsed !== undefined) panel.collapsed = options.collapsed;
	if(options.side) panel.side = options.side;
	document.body.appendChild(panel);
	await panel.updateComplete;
	return panel;
};

const createPanelWithItem = async () => {
	const panel = document.createElement('k-side-panel');
	const item = document.createElement('k-side-panel-item');
	item.icon = 'home';
	item.label = 'Home';
	item.href = '/home';
	panel.appendChild(item);
	document.body.appendChild(panel);
	await panel.updateComplete;
	await item.updateComplete;
	return { panel, item };
};

const createPanelWithLabel = async () => {
	const panel = document.createElement('k-side-panel');
	const label = document.createElement('k-side-panel-label');
	label.textContent = 'Section';
	panel.appendChild(label);
	document.body.appendChild(panel);
	await panel.updateComplete;
	await label.updateComplete;
	return { panel, label };
};

const createPanelWithMenu = async () => {
	const panel = document.createElement('k-side-panel');
	const menu = document.createElement('k-side-panel-menu');
	menu.icon = 'folder';
	menu.label = 'Files';
	const item1 = document.createElement('k-side-panel-item');
	item1.label = 'File 1';
	const item2 = document.createElement('k-side-panel-item');
	item2.label = 'File 2';
	menu.appendChild(item1);
	menu.appendChild(item2);
	panel.appendChild(menu);
	document.body.appendChild(panel);
	await panel.updateComplete;
	await menu.updateComplete;
	return { panel, menu, item1, item2 };
};

const cleanup = (el) => {
	if(el && el.parentNode) {
		el.parentNode.removeChild(el);
	}
};

export default {
	/*
		SidePanel - Properties
	*/
	'should have default collapsed property as false': async ({pass, fail}) => {
		const panel = await createPanel();
		if(panel.collapsed !== false) {
			cleanup(panel);
			return fail(`Expected collapsed to be false, got ${panel.collapsed}`);
		}
		cleanup(panel);
		pass('Default collapsed property is false');
	},

	'should have default side property as left': async ({pass, fail}) => {
		const panel = await createPanel();
		if(panel.side !== 'left') {
			cleanup(panel);
			return fail(`Expected side to be "left", got "${panel.side}"`);
		}
		cleanup(panel);
		pass('Default side property is left');
	},

	'should reflect collapsed property to attribute': async ({pass, fail}) => {
		const panel = await createPanel({ collapsed: true });
		if(!panel.hasAttribute('collapsed')) {
			cleanup(panel);
			return fail('collapsed attribute should be set');
		}
		cleanup(panel);
		pass('Collapsed property reflects to attribute');
	},

	'should reflect side property to attribute': async ({pass, fail}) => {
		const panel = await createPanel({ side: 'right' });
		if(panel.getAttribute('side') !== 'right') {
			cleanup(panel);
			return fail(`Expected side attribute "right", got "${panel.getAttribute('side')}"`);
		}
		cleanup(panel);
		pass('Side property reflects to attribute');
	},

	/*
		SidePanel - Methods
	*/
	'should expand panel': async ({pass, fail}) => {
		const panel = await createPanel({ collapsed: true });
		panel.expand();
		await panel.updateComplete;
		if(panel.collapsed !== false) {
			cleanup(panel);
			return fail('Panel should be expanded');
		}
		cleanup(panel);
		pass('Panel expands correctly');
	},

	'should collapse panel': async ({pass, fail}) => {
		const panel = await createPanel({ collapsed: false });
		panel.collapse();
		await panel.updateComplete;
		if(panel.collapsed !== true) {
			cleanup(panel);
			return fail('Panel should be collapsed');
		}
		cleanup(panel);
		pass('Panel collapses correctly');
	},

	'should toggle panel from collapsed to expanded': async ({pass, fail}) => {
		const panel = await createPanel({ collapsed: true });
		panel.toggle();
		await panel.updateComplete;
		if(panel.collapsed !== false) {
			cleanup(panel);
			return fail('Panel should toggle to expanded');
		}
		cleanup(panel);
		pass('Panel toggles from collapsed to expanded');
	},

	'should toggle panel from expanded to collapsed': async ({pass, fail}) => {
		const panel = await createPanel({ collapsed: false });
		panel.toggle();
		await panel.updateComplete;
		if(panel.collapsed !== true) {
			cleanup(panel);
			return fail('Panel should toggle to collapsed');
		}
		cleanup(panel);
		pass('Panel toggles from expanded to collapsed');
	},

	/*
		SidePanel - Events
	*/
	'should dispatch collapse event when collapsed': async ({pass, fail}) => {
		const panel = await createPanel();
		let eventFired = false;
		panel.addEventListener('collapse', () => {
			eventFired = true;
		});
		panel.collapse();
		await panel.updateComplete;
		if(!eventFired) {
			cleanup(panel);
			return fail('collapse event should be dispatched');
		}
		cleanup(panel);
		pass('Collapse event dispatched');
	},

	'should dispatch expand event when expanded': async ({pass, fail}) => {
		const panel = await createPanel({ collapsed: true });
		let eventFired = false;
		panel.addEventListener('expand', () => {
			eventFired = true;
		});
		panel.expand();
		await panel.updateComplete;
		if(!eventFired) {
			cleanup(panel);
			return fail('expand event should be dispatched');
		}
		cleanup(panel);
		pass('Expand event dispatched');
	},

	'should dispatch change event with detail on collapse': async ({pass, fail}) => {
		const panel = await createPanel();
		let changeDetail = null;
		panel.addEventListener('change', (e) => {
			changeDetail = e.detail;
		});
		panel.collapse();
		await panel.updateComplete;
		if(changeDetail !== 'collapse') {
			cleanup(panel);
			return fail(`Expected change detail "collapse", got "${changeDetail}"`);
		}
		cleanup(panel);
		pass('Change event dispatched with collapse detail');
	},

	'should dispatch window side-panel-change event on collapse': async ({pass, fail}) => {
		const panel = await createPanel();
		let eventDetail = null;
		const handler = (e) => {
			eventDetail = e.detail;
		};
		window.addEventListener('side-panel-change', handler);
		panel.collapse();
		await panel.updateComplete;
		window.removeEventListener('side-panel-change', handler);
		if(!eventDetail || eventDetail.collapsed !== true || eventDetail.width !== '3.5rem' || eventDetail.side !== 'left') {
			cleanup(panel);
			return fail('Window event should have correct detail on collapse');
		}
		cleanup(panel);
		pass('Window side-panel-change event dispatched on collapse');
	},

	/*
		SidePanel - Toggle Button
	*/
	'should toggle panel when toggle button clicked': async ({pass, fail}) => {
		const panel = await createPanel();
		const toggleButton = panel.shadowRoot.querySelector('#toggle');
		const initialState = panel.collapsed;
		toggleButton.click();
		await panel.updateComplete;
		if(panel.collapsed === initialState) {
			cleanup(panel);
			return fail('Panel should toggle when button clicked');
		}
		cleanup(panel);
		pass('Toggle button works correctly');
	},

	'should show right arrow icon when collapsed on left side': async ({pass, fail}) => {
		const panel = await createPanel({ collapsed: true, side: 'left' });
		const icon = panel.shadowRoot.querySelector('#toggle k-icon');
		if(icon.getAttribute('direction') !== 'right') {
			cleanup(panel);
			return fail(`Expected direction "right", got "${icon.getAttribute('direction')}"`);
		}
		cleanup(panel);
		pass('Right arrow shown when collapsed on left side');
	},

	'should show left arrow icon when expanded on left side': async ({pass, fail}) => {
		const panel = await createPanel({ collapsed: false, side: 'left' });
		const icon = panel.shadowRoot.querySelector('#toggle k-icon');
		if(icon.getAttribute('direction') !== 'left') {
			cleanup(panel);
			return fail(`Expected direction "left", got "${icon.getAttribute('direction')}"`);
		}
		cleanup(panel);
		pass('Left arrow shown when expanded on left side');
	},

	'should show left arrow icon when collapsed on right side': async ({pass, fail}) => {
		const panel = await createPanel({ collapsed: true, side: 'right' });
		const icon = panel.shadowRoot.querySelector('#toggle k-icon');
		if(icon.getAttribute('direction') !== 'left') {
			cleanup(panel);
			return fail(`Expected direction "left", got "${icon.getAttribute('direction')}"`);
		}
		cleanup(panel);
		pass('Left arrow shown when collapsed on right side');
	},

	'should show right arrow icon when expanded on right side': async ({pass, fail}) => {
		const panel = await createPanel({ collapsed: false, side: 'right' });
		const icon = panel.shadowRoot.querySelector('#toggle k-icon');
		if(icon.getAttribute('direction') !== 'right') {
			cleanup(panel);
			return fail(`Expected direction "right", got "${icon.getAttribute('direction')}"`);
		}
		cleanup(panel);
		pass('Right arrow shown when expanded on right side');
	},

	/*
		SidePanel - Right Side Positioning
	*/
	'should position on right side when side is right': async ({pass, fail}) => {
		const panel = await createPanel({ side: 'right' });
		const styles = window.getComputedStyle(panel);
		if(styles.right !== '0px') {
			cleanup(panel);
			return fail('Panel should be positioned on right side');
		}
		cleanup(panel);
		pass('Panel positioned on right side');
	},

	'should dispatch window event with correct side': async ({pass, fail}) => {
		const panel = await createPanel({ side: 'right' });
		let eventDetail = null;
		const handler = (e) => {
			eventDetail = e.detail;
		};
		window.addEventListener('side-panel-change', handler);
		panel.collapse();
		await panel.updateComplete;
		window.removeEventListener('side-panel-change', handler);
		if(eventDetail.side !== 'right') {
			cleanup(panel);
			return fail(`Expected side "right", got "${eventDetail.side}"`);
		}
		cleanup(panel);
		pass('Window event includes correct side');
	},

	/*
		SidePanelItem - Properties
	*/
	'should have icon property on item': async ({pass, fail}) => {
		const { panel, item } = await createPanelWithItem();
		if(item.icon !== 'home') {
			cleanup(panel);
			return fail(`Expected icon "home", got "${item.icon}"`);
		}
		cleanup(panel);
		pass('Item has icon property');
	},

	'should have label property on item': async ({pass, fail}) => {
		const { panel, item } = await createPanelWithItem();
		if(item.label !== 'Home') {
			cleanup(panel);
			return fail(`Expected label "Home", got "${item.label}"`);
		}
		cleanup(panel);
		pass('Item has label property');
	},

	'should have default active property as false on item': async ({pass, fail}) => {
		const { panel, item } = await createPanelWithItem();
		if(item.active !== false) {
			cleanup(panel);
			return fail(`Expected active to be false, got ${item.active}`);
		}
		cleanup(panel);
		pass('Item default active property is false');
	},

	/*
		SidePanelItem - Panel Collapse/Expand
	*/
	'should update item when panel collapses': async ({pass, fail}) => {
		const { panel, item } = await createPanelWithItem();
		panel.collapse();
		await panel.updateComplete;
		await item.updateComplete;
		if(item.collapsed !== true) {
			cleanup(panel);
			return fail('Item should update when panel collapses');
		}
		cleanup(panel);
		pass('Item updates when panel collapses');
	},

	'should hide item label when panel collapsed': async ({pass, fail}) => {
		const { panel, item } = await createPanelWithItem();
		panel.collapse();
		await panel.updateComplete;
		await item.updateComplete;
		const label = item.shadowRoot.querySelector('.label');
		if(label !== null) {
			cleanup(panel);
			return fail('Item label should not be rendered when panel collapsed');
		}
		cleanup(panel);
		pass('Item label hidden when panel collapsed');
	},

	/*
		SidePanelLabel - Panel Collapse/Expand
	*/
	'should update label when panel collapses': async ({pass, fail}) => {
		const { panel, label } = await createPanelWithLabel();
		panel.collapse();
		await panel.updateComplete;
		await label.updateComplete;
		if(label.collapsed !== true) {
			cleanup(panel);
			return fail('Label should update when panel collapses');
		}
		cleanup(panel);
		pass('Label updates when panel collapses');
	},

	'should render horizontal rule when label collapsed': async ({pass, fail}) => {
		const { panel, label } = await createPanelWithLabel();
		panel.collapse();
		await panel.updateComplete;
		await label.updateComplete;
		const hr = label.shadowRoot.querySelector('hr');
		if(!hr) {
			cleanup(panel);
			return fail('Should render horizontal rule when collapsed');
		}
		cleanup(panel);
		pass('Horizontal rule rendered when collapsed');
	},

	/*
		SidePanelMenu - Properties
	*/
	'should have icon property on menu': async ({pass, fail}) => {
		const { panel, menu } = await createPanelWithMenu();
		if(menu.icon !== 'folder') {
			cleanup(panel);
			return fail(`Expected icon "folder", got "${menu.icon}"`);
		}
		cleanup(panel);
		pass('Menu has icon property');
	},

	'should have default open property as false on menu': async ({pass, fail}) => {
		const { panel, menu } = await createPanelWithMenu();
		if(menu.open !== false) {
			cleanup(panel);
			return fail(`Expected open to be false, got ${menu.open}`);
		}
		cleanup(panel);
		pass('Menu default open property is false');
	},

	/*
		SidePanelMenu - Toggle
	*/
	'should toggle menu from closed to open': async ({pass, fail}) => {
		const { panel, menu } = await createPanelWithMenu();
		menu.toggleMenu();
		await menu.updateComplete;
		if(menu.open !== true) {
			cleanup(panel);
			return fail('Menu should toggle to open');
		}
		cleanup(panel);
		pass('Menu toggles to open');
	},

	'should toggle menu when header clicked': async ({pass, fail}) => {
		const { panel, menu } = await createPanelWithMenu();
		const header = menu.shadowRoot.querySelector('.menu-header');
		header.click();
		await menu.updateComplete;
		if(menu.open !== true) {
			cleanup(panel);
			return fail('Menu should toggle when header clicked');
		}
		cleanup(panel);
		pass('Menu toggles on header click');
	},

	'should not toggle menu when panel is collapsed': async ({pass, fail}) => {
		const { panel, menu } = await createPanelWithMenu();
		panel.collapse();
		await panel.updateComplete;
		await menu.updateComplete;
		menu.toggleMenu();
		await menu.updateComplete;
		if(menu.open !== false) {
			cleanup(panel);
			return fail('Menu should not toggle when panel collapsed');
		}
		cleanup(panel);
		pass('Menu does not toggle when panel collapsed');
	},

	/*
		SidePanelMenu - Chevron Icon
	*/
	'should show right-pointing chevron when menu closed': async ({pass, fail}) => {
		const { panel, menu } = await createPanelWithMenu();
		const chevron = menu.shadowRoot.querySelector('.chevron');
		if(chevron.getAttribute('direction') !== 'right') {
			cleanup(panel);
			return fail(`Expected direction "right", got "${chevron.getAttribute('direction')}"`);
		}
		cleanup(panel);
		pass('Right-pointing chevron when closed');
	},

	'should show down-pointing chevron when menu open': async ({pass, fail}) => {
		const { panel, menu } = await createPanelWithMenu();
		menu.open = true;
		await menu.updateComplete;
		const chevron = menu.shadowRoot.querySelector('.chevron');
		if(chevron.getAttribute('direction') !== 'down') {
			cleanup(panel);
			return fail(`Expected direction "down", got "${chevron.getAttribute('direction')}"`);
		}
		cleanup(panel);
		pass('Down-pointing chevron when open');
	},

	/*
		SidePanelSpacer
	*/
	'should render spacer': async ({pass, fail}) => {
		const panel = document.createElement('k-side-panel');
		const spacer = document.createElement('k-side-panel-spacer');
		panel.appendChild(spacer);
		document.body.appendChild(panel);
		await spacer.updateComplete;
		const spacerDiv = spacer.shadowRoot.querySelector('.spacer');
		if(!spacerDiv) {
			cleanup(panel);
			return fail('Spacer should render');
		}
		cleanup(panel);
		pass('Spacer renders correctly');
	}
};
