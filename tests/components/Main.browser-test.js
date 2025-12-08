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
	'should have default panelWidth as 0px': async ({pass, fail}) => {
		const main = await createMain();
		if(main.panelWidth !== '0px') {
			cleanup(main);
			return fail(`Expected panelWidth to be "0px", got "${main.panelWidth}"`);
		}
		cleanup(main);
		pass('Default panelWidth is 0px');
	},

	'should have default panelSide as left': async ({pass, fail}) => {
		const main = await createMain();
		if(main.panelSide !== 'left') {
			cleanup(main);
			return fail(`Expected panelSide to be "left", got "${main.panelSide}"`);
		}
		cleanup(main);
		pass('Default panelSide is left');
	},

	'should not reflect state properties to attributes': async ({pass, fail}) => {
		const main = await createMain();
		main.panelWidth = '16rem';
		await main.updateComplete;
		if(main.hasAttribute('panelWidth')) {
			cleanup(main);
			return fail('panelWidth should not reflect to attribute (it is a state property)');
		}
		cleanup(main);
		pass('State properties do not reflect to attributes');
	},

	/*
		Main - Window Event Handling
	*/
	'should listen for side-panel-change event': async ({pass, fail}) => {
		const main = await createMain();
		window.dispatchEvent(new CustomEvent('side-panel-change', {
			detail: {
				collapsed: false,
				width: '16rem',
				side: 'left'
			}
		}));
		await main.updateComplete;
		if(main.panelWidth !== '16rem' || main.panelSide !== 'left') {
			cleanup(main);
			return fail('Should update from window event');
		}
		cleanup(main);
		pass('Listens for side-panel-change event');
	},

	'should update panelWidth from event detail': async ({pass, fail}) => {
		const main = await createMain();
		window.dispatchEvent(new CustomEvent('side-panel-change', {
			detail: {
				collapsed: true,
				width: '3.5rem',
				side: 'left'
			}
		}));
		await main.updateComplete;
		if(main.panelWidth !== '3.5rem') {
			cleanup(main);
			return fail(`Expected panelWidth "3.5rem", got "${main.panelWidth}"`);
		}
		cleanup(main);
		pass('Updates panelWidth from event');
	},

	'should update panelSide from event detail': async ({pass, fail}) => {
		const main = await createMain();
		window.dispatchEvent(new CustomEvent('side-panel-change', {
			detail: {
				collapsed: false,
				width: '16rem',
				side: 'right'
			}
		}));
		await main.updateComplete;
		if(main.panelSide !== 'right') {
			cleanup(main);
			return fail(`Expected panelSide "right", got "${main.panelSide}"`);
		}
		cleanup(main);
		pass('Updates panelSide from event');
	},

	'should handle multiple panel change events': async ({pass, fail}) => {
		const main = await createMain();
		window.dispatchEvent(new CustomEvent('side-panel-change', {
			detail: { collapsed: false, width: '16rem', side: 'left' }
		}));
		await main.updateComplete;
		if(main.panelWidth !== '16rem') {
			cleanup(main);
			return fail('Should update on first event');
		}
		window.dispatchEvent(new CustomEvent('side-panel-change', {
			detail: { collapsed: true, width: '3.5rem', side: 'left' }
		}));
		await main.updateComplete;
		if(main.panelWidth !== '3.5rem') {
			cleanup(main);
			return fail('Should update on second event');
		}
		cleanup(main);
		pass('Handles multiple panel change events');
	},

	/*
		Main - Existing Panel Detection
	*/
	'should detect existing collapsed panel on connection': async ({pass, fail}) => {
		const panel = await createPanel({ collapsed: true, side: 'left' });
		const main = await createMain();
		if(main.panelWidth !== '3.5rem' || main.panelSide !== 'left') {
			cleanup(main, panel);
			return fail('Should detect existing collapsed panel');
		}
		cleanup(main, panel);
		pass('Detects existing collapsed panel');
	},

	'should detect existing expanded panel on connection': async ({pass, fail}) => {
		const panel = await createPanel({ collapsed: false, side: 'left' });
		const main = await createMain();
		if(main.panelWidth !== '16rem' || main.panelSide !== 'left') {
			cleanup(main, panel);
			return fail('Should detect existing expanded panel');
		}
		cleanup(main, panel);
		pass('Detects existing expanded panel');
	},

	'should detect right-side panel': async ({pass, fail}) => {
		const panel = await createPanel({ collapsed: false, side: 'right' });
		const main = await createMain();
		if(main.panelSide !== 'right') {
			cleanup(main, panel);
			return fail(`Expected panelSide "right", got "${main.panelSide}"`);
		}
		cleanup(main, panel);
		pass('Detects right-side panel');
	},

	'should not error when no panel exists': async ({pass, fail}) => {
		const main = await createMain();
		if(main.panelWidth !== '0px' || main.panelSide !== 'left') {
			cleanup(main);
			return fail('Should have default values when no panel exists');
		}
		cleanup(main);
		pass('Does not error when no panel exists');
	},

	/*
		Main - CSS Variable Updates
	*/
	'should set --panel-width CSS variable': async ({pass, fail}) => {
		const main = await createMain();
		main.panelWidth = '16rem';
		await main.updateComplete;
		const computedStyle = getComputedStyle(main);
		const panelWidth = computedStyle.getPropertyValue('--panel-width').trim();
		if(panelWidth !== '16rem') {
			cleanup(main);
			return fail(`Expected --panel-width "16rem", got "${panelWidth}"`);
		}
		cleanup(main);
		pass('Sets --panel-width CSS variable');
	},

	'should update --panel-width when panelWidth changes': async ({pass, fail}) => {
		const main = await createMain();
		main.panelWidth = '16rem';
		await main.updateComplete;
		let computedStyle = getComputedStyle(main);
		let panelWidth = computedStyle.getPropertyValue('--panel-width').trim();
		if(panelWidth !== '16rem') {
			cleanup(main);
			return fail('Should set initial --panel-width');
		}
		main.panelWidth = '3.5rem';
		await main.updateComplete;
		computedStyle = getComputedStyle(main);
		panelWidth = computedStyle.getPropertyValue('--panel-width').trim();
		if(panelWidth !== '3.5rem') {
			cleanup(main);
			return fail(`Expected updated --panel-width "3.5rem", got "${panelWidth}"`);
		}
		cleanup(main);
		pass('Updates --panel-width when panelWidth changes');
	},

	/*
		Main - Panel Side Attribute
	*/
	'should remove panel-side attribute for left': async ({pass, fail}) => {
		const main = await createMain();
		main.panelSide = 'left';
		await main.updateComplete;
		if(main.hasAttribute('panel-side')) {
			cleanup(main);
			return fail('panel-side attribute should be removed for left side');
		}
		cleanup(main);
		pass('Removes panel-side attribute for left');
	},

	'should set panel-side attribute to right': async ({pass, fail}) => {
		const main = await createMain();
		main.panelSide = 'right';
		await main.updateComplete;
		if(main.getAttribute('panel-side') !== 'right') {
			cleanup(main);
			return fail(`Expected panel-side "right", got "${main.getAttribute('panel-side')}"`);
		}
		cleanup(main);
		pass('Sets panel-side attribute to right');
	},

	'should remove panel-side attribute when changing from right to left': async ({pass, fail}) => {
		const main = await createMain();
		main.panelSide = 'right';
		await main.updateComplete;
		if(!main.hasAttribute('panel-side')) {
			cleanup(main);
			return fail('Should have panel-side attribute for right');
		}
		main.panelSide = 'left';
		await main.updateComplete;
		if(main.hasAttribute('panel-side')) {
			cleanup(main);
			return fail('Should remove panel-side attribute when changed to left');
		}
		cleanup(main);
		pass('Removes panel-side attribute when changing to left');
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
	'should update when panel toggles': async ({pass, fail}) => {
		const panel = await createPanel({ collapsed: false });
		const main = await createMain();
		if(main.panelWidth !== '16rem') {
			cleanup(main, panel);
			return fail('Should detect initial expanded state');
		}
		panel.collapse();
		await panel.updateComplete;
		await main.updateComplete;
		if(main.panelWidth !== '3.5rem') {
			cleanup(main, panel);
			return fail(`Expected panelWidth "3.5rem" after collapse, got "${main.panelWidth}"`);
		}
		cleanup(main, panel);
		pass('Updates when panel toggles');
	},

	'should handle left-side panel margin': async ({pass, fail}) => {
		const panel = await createPanel({ collapsed: false, side: 'left' });
		const main = await createMain();
		if(main.panelSide !== 'left' || main.hasAttribute('panel-side')) {
			cleanup(main, panel);
			return fail('Should handle left-side panel without attribute');
		}
		cleanup(main, panel);
		pass('Handles left-side panel margin');
	},

	'should handle right-side panel margin': async ({pass, fail}) => {
		const panel = await createPanel({ collapsed: false, side: 'right' });
		const main = await createMain();
		if(main.panelSide !== 'right' || main.getAttribute('panel-side') !== 'right') {
			cleanup(main, panel);
			return fail('Should handle right-side panel');
		}
		cleanup(main, panel);
		pass('Handles right-side panel margin');
	}
};
