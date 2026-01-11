import '../../src/components/Main.js';
import '../../src/components/SidePanel.js';

const createMain = async () => {
	const main = document.createElement('k-main');
	document.body.appendChild(main);
	await main.updateComplete;
	return main;
};

const createPanel = async (options = {}) => {
	const panel = document.createElement('k-side-panel');
	if(options.collapsed !== undefined) panel.collapsed = options.collapsed;
	if(options.side) panel.side = options.side;
	document.body.appendChild(panel);
	await panel.updateComplete;
	return panel;
};

const cleanup = (...elements) => {
	elements.forEach(el => {
		if(el && el.parentNode) {
			el.parentNode.removeChild(el);
		}
	});
};

export default {
	/*
		Main - Properties
	*/
	'should have default leftPanelWidth as 0px': async ({pass, fail}) => {
		const main = await createMain();
		if(main.leftPanelWidth !== '0px') {
			cleanup(main);
			return fail(`Expected leftPanelWidth to be "0px", got "${main.leftPanelWidth}"`);
		}
		cleanup(main);
		pass('Default leftPanelWidth is 0px');
	},

	'should have default rightPanelWidth as 0px': async ({pass, fail}) => {
		const main = await createMain();
		if(main.rightPanelWidth !== '0px') {
			cleanup(main);
			return fail(`Expected rightPanelWidth to be "0px", got "${main.rightPanelWidth}"`);
		}
		cleanup(main);
		pass('Default rightPanelWidth is 0px');
	},

	'should not reflect state properties to attributes': async ({pass, fail}) => {
		const main = await createMain();
		main.leftPanelWidth = '16rem';
		await main.updateComplete;
		if(main.hasAttribute('leftPanelWidth')) {
			cleanup(main);
			return fail('leftPanelWidth should not reflect to attribute (it is a state property)');
		}
		cleanup(main);
		pass('State properties do not reflect to attributes');
	},

	/*
		Main - Window Event Handling
	*/
	'should listen for side-panel-change event for left panel': async ({pass, fail}) => {
		const main = await createMain();
		window.dispatchEvent(new CustomEvent('side-panel-change', {
			detail: {
				collapsed: false,
				width: '16rem',
				side: 'left'
			}
		}));
		await main.updateComplete;
		if(main.leftPanelWidth !== '16rem') {
			cleanup(main);
			return fail(`Expected leftPanelWidth "16rem", got "${main.leftPanelWidth}"`);
		}
		cleanup(main);
		pass('Listens for side-panel-change event for left panel');
	},

	'should listen for side-panel-change event for right panel': async ({pass, fail}) => {
		const main = await createMain();
		window.dispatchEvent(new CustomEvent('side-panel-change', {
			detail: {
				collapsed: false,
				width: '16rem',
				side: 'right'
			}
		}));
		await main.updateComplete;
		if(main.rightPanelWidth !== '16rem') {
			cleanup(main);
			return fail(`Expected rightPanelWidth "16rem", got "${main.rightPanelWidth}"`);
		}
		cleanup(main);
		pass('Listens for side-panel-change event for right panel');
	},

	'should update leftPanelWidth from event detail': async ({pass, fail}) => {
		const main = await createMain();
		window.dispatchEvent(new CustomEvent('side-panel-change', {
			detail: {
				collapsed: true,
				width: '3.5rem',
				side: 'left'
			}
		}));
		await main.updateComplete;
		if(main.leftPanelWidth !== '3.5rem') {
			cleanup(main);
			return fail(`Expected leftPanelWidth "3.5rem", got "${main.leftPanelWidth}"`);
		}
		cleanup(main);
		pass('Updates leftPanelWidth from event');
	},

	'should update rightPanelWidth from event detail': async ({pass, fail}) => {
		const main = await createMain();
		window.dispatchEvent(new CustomEvent('side-panel-change', {
			detail: {
				collapsed: false,
				width: '16rem',
				side: 'right'
			}
		}));
		await main.updateComplete;
		if(main.rightPanelWidth !== '16rem') {
			cleanup(main);
			return fail(`Expected rightPanelWidth "16rem", got "${main.rightPanelWidth}"`);
		}
		cleanup(main);
		pass('Updates rightPanelWidth from event');
	},

	'should handle multiple panel change events for same side': async ({pass, fail}) => {
		const main = await createMain();
		window.dispatchEvent(new CustomEvent('side-panel-change', {
			detail: { collapsed: false, width: '16rem', side: 'left' }
		}));
		await main.updateComplete;
		if(main.leftPanelWidth !== '16rem') {
			cleanup(main);
			return fail('Should update on first event');
		}
		window.dispatchEvent(new CustomEvent('side-panel-change', {
			detail: { collapsed: true, width: '3.5rem', side: 'left' }
		}));
		await main.updateComplete;
		if(main.leftPanelWidth !== '3.5rem') {
			cleanup(main);
			return fail('Should update on second event');
		}
		cleanup(main);
		pass('Handles multiple panel change events for same side');
	},

	'should handle events for both left and right panels independently': async ({pass, fail}) => {
		const main = await createMain();
		window.dispatchEvent(new CustomEvent('side-panel-change', {
			detail: { collapsed: false, width: '16rem', side: 'left' }
		}));
		await main.updateComplete;
		window.dispatchEvent(new CustomEvent('side-panel-change', {
			detail: { collapsed: true, width: '3.5rem', side: 'right' }
		}));
		await main.updateComplete;
		if(main.leftPanelWidth !== '16rem' || main.rightPanelWidth !== '3.5rem') {
			cleanup(main);
			return fail(`Expected leftPanelWidth "16rem" and rightPanelWidth "3.5rem", got "${main.leftPanelWidth}" and "${main.rightPanelWidth}"`);
		}
		cleanup(main);
		pass('Handles events for both panels independently');
	},

	/*
		Main - Existing Panel Detection
	*/
	'should detect existing collapsed left panel on connection': async ({pass, fail}) => {
		const panel = await createPanel({ collapsed: true, side: 'left' });
		const main = await createMain();
		if(main.leftPanelWidth !== '3.5rem') {
			cleanup(main, panel);
			return fail(`Expected leftPanelWidth "3.5rem", got "${main.leftPanelWidth}"`);
		}
		cleanup(main, panel);
		pass('Detects existing collapsed left panel');
	},

	'should detect existing expanded left panel on connection': async ({pass, fail}) => {
		const panel = await createPanel({ collapsed: false, side: 'left' });
		const main = await createMain();
		if(main.leftPanelWidth !== '16rem') {
			cleanup(main, panel);
			return fail(`Expected leftPanelWidth "16rem", got "${main.leftPanelWidth}"`);
		}
		cleanup(main, panel);
		pass('Detects existing expanded left panel');
	},

	'should detect existing right panel on connection': async ({pass, fail}) => {
		const panel = await createPanel({ collapsed: false, side: 'right' });
		const main = await createMain();
		if(main.rightPanelWidth !== '16rem') {
			cleanup(main, panel);
			return fail(`Expected rightPanelWidth "16rem", got "${main.rightPanelWidth}"`);
		}
		cleanup(main, panel);
		pass('Detects existing right panel');
	},

	'should detect both left and right panels on connection': async ({pass, fail}) => {
		const leftPanel = await createPanel({ collapsed: false, side: 'left' });
		const rightPanel = await createPanel({ collapsed: true, side: 'right' });
		const main = await createMain();
		if(main.leftPanelWidth !== '16rem' || main.rightPanelWidth !== '3.5rem') {
			cleanup(main, leftPanel, rightPanel);
			return fail(`Expected leftPanelWidth "16rem" and rightPanelWidth "3.5rem", got "${main.leftPanelWidth}" and "${main.rightPanelWidth}"`);
		}
		cleanup(main, leftPanel, rightPanel);
		pass('Detects both left and right panels');
	},

	'should not error when no panel exists': async ({pass, fail}) => {
		const main = await createMain();
		if(main.leftPanelWidth !== '0px' || main.rightPanelWidth !== '0px') {
			cleanup(main);
			return fail('Should have default values when no panel exists');
		}
		cleanup(main);
		pass('Does not error when no panel exists');
	},

	/*
		Main - CSS Variable Updates
	*/
	'should set --left-panel-width CSS variable': async ({pass, fail}) => {
		const main = await createMain();
		main.leftPanelWidth = '16rem';
		await main.updateComplete;
		const computedStyle = getComputedStyle(main);
		const panelWidth = computedStyle.getPropertyValue('--left-panel-width').trim();
		if(panelWidth !== '16rem') {
			cleanup(main);
			return fail(`Expected --left-panel-width "16rem", got "${panelWidth}"`);
		}
		cleanup(main);
		pass('Sets --left-panel-width CSS variable');
	},

	'should set --right-panel-width CSS variable': async ({pass, fail}) => {
		const main = await createMain();
		main.rightPanelWidth = '16rem';
		await main.updateComplete;
		const computedStyle = getComputedStyle(main);
		const panelWidth = computedStyle.getPropertyValue('--right-panel-width').trim();
		if(panelWidth !== '16rem') {
			cleanup(main);
			return fail(`Expected --right-panel-width "16rem", got "${panelWidth}"`);
		}
		cleanup(main);
		pass('Sets --right-panel-width CSS variable');
	},

	'should update --left-panel-width when leftPanelWidth changes': async ({pass, fail}) => {
		const main = await createMain();
		main.leftPanelWidth = '16rem';
		await main.updateComplete;
		let computedStyle = getComputedStyle(main);
		let panelWidth = computedStyle.getPropertyValue('--left-panel-width').trim();
		if(panelWidth !== '16rem') {
			cleanup(main);
			return fail('Should set initial --left-panel-width');
		}
		main.leftPanelWidth = '3.5rem';
		await main.updateComplete;
		computedStyle = getComputedStyle(main);
		panelWidth = computedStyle.getPropertyValue('--left-panel-width').trim();
		if(panelWidth !== '3.5rem') {
			cleanup(main);
			return fail(`Expected updated --left-panel-width "3.5rem", got "${panelWidth}"`);
		}
		cleanup(main);
		pass('Updates --left-panel-width when leftPanelWidth changes');
	},

	'should maintain both panel widths independently': async ({pass, fail}) => {
		const main = await createMain();
		main.leftPanelWidth = '16rem';
		main.rightPanelWidth = '3.5rem';
		await main.updateComplete;
		const computedStyle = getComputedStyle(main);
		const leftWidth = computedStyle.getPropertyValue('--left-panel-width').trim();
		const rightWidth = computedStyle.getPropertyValue('--right-panel-width').trim();
		if(leftWidth !== '16rem' || rightWidth !== '3.5rem') {
			cleanup(main);
			return fail(`Expected left "16rem" and right "3.5rem", got "${leftWidth}" and "${rightWidth}"`);
		}
		cleanup(main);
		pass('Maintains both panel widths independently');
	},

	/*
		Main - Rendering
	*/
	'should render main element in shadow DOM': async ({pass, fail}) => {
		const main = await createMain();
		const mainElement = main.shadowRoot.querySelector('main');
		if(!mainElement) {
			cleanup(main);
			return fail('Should render main element in shadow DOM');
		}
		cleanup(main);
		pass('Renders main element in shadow DOM');
	},

	'should render default slot': async ({pass, fail}) => {
		const main = await createMain();
		const content = document.createElement('div');
		content.textContent = 'Main content';
		main.appendChild(content);
		await main.updateComplete;
		const slot = main.shadowRoot.querySelector('slot');
		const slottedElements = slot.assignedElements();
		if(slottedElements.length !== 1 || slottedElements[0].textContent !== 'Main content') {
			cleanup(main);
			return fail('Should render slotted content');
		}
		cleanup(main);
		pass('Renders default slot');
	},

	/*
		Main - Integration with SidePanel
	*/
	'should update when left panel toggles': async ({pass, fail}) => {
		const panel = await createPanel({ collapsed: false, side: 'left' });
		const main = await createMain();
		if(main.leftPanelWidth !== '16rem') {
			cleanup(main, panel);
			return fail('Should detect initial expanded state');
		}
		panel.collapse();
		await panel.updateComplete;
		await main.updateComplete;
		if(main.leftPanelWidth !== '3.5rem') {
			cleanup(main, panel);
			return fail(`Expected leftPanelWidth "3.5rem" after collapse, got "${main.leftPanelWidth}"`);
		}
		cleanup(main, panel);
		pass('Updates when left panel toggles');
	},

	'should update when right panel toggles': async ({pass, fail}) => {
		const panel = await createPanel({ collapsed: false, side: 'right' });
		const main = await createMain();
		if(main.rightPanelWidth !== '16rem') {
			cleanup(main, panel);
			return fail('Should detect initial expanded state');
		}
		panel.collapse();
		await panel.updateComplete;
		await main.updateComplete;
		if(main.rightPanelWidth !== '3.5rem') {
			cleanup(main, panel);
			return fail(`Expected rightPanelWidth "3.5rem" after collapse, got "${main.rightPanelWidth}"`);
		}
		cleanup(main, panel);
		pass('Updates when right panel toggles');
	},

	'should handle dual panels toggling independently': async ({pass, fail}) => {
		const leftPanel = await createPanel({ collapsed: false, side: 'left' });
		const rightPanel = await createPanel({ collapsed: false, side: 'right' });
		const main = await createMain();
		
		if(main.leftPanelWidth !== '16rem' || main.rightPanelWidth !== '16rem') {
			cleanup(main, leftPanel, rightPanel);
			return fail('Should detect both expanded panels');
		}
		
		leftPanel.collapse();
		await leftPanel.updateComplete;
		await main.updateComplete;
		
		if(main.leftPanelWidth !== '3.5rem' || main.rightPanelWidth !== '16rem') {
			cleanup(main, leftPanel, rightPanel);
			return fail('Left panel should collapse while right stays expanded');
		}
		
		rightPanel.collapse();
		await rightPanel.updateComplete;
		await main.updateComplete;
		
		if(main.leftPanelWidth !== '3.5rem' || main.rightPanelWidth !== '3.5rem') {
			cleanup(main, leftPanel, rightPanel);
			return fail('Both panels should be collapsed');
		}
		
		cleanup(main, leftPanel, rightPanel);
		pass('Handles dual panels toggling independently');
	}
};
