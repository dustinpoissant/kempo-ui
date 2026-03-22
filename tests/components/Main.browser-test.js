import '../../src/components/Main.js';
import '../../src/components/Aside.js';

const createMain = async () => {
	const main = document.createElement('k-main');
	document.body.appendChild(main);
	await main.updateComplete;
	return main;
};

const cleanup = (...elements) => {
	elements.forEach(el => {
		if(el && el.parentNode) {
			el.parentNode.removeChild(el);
		}
	});
};

const getCssVar = (el, name) => getComputedStyle(el).getPropertyValue(name).trim();

export default {
	/*
		Main - Default State
	*/
	'should have default left-panel-width as 0px': async ({pass, fail}) => {
		const main = await createMain();
		const val = getCssVar(main, '--left-panel-width');
		if(val !== '0px') {
			cleanup(main);
			return fail(`Expected --left-panel-width "0px", got "${val}"`);
		}
		cleanup(main);
		pass('Default --left-panel-width is 0px');
	},

	'should have default right-panel-width as 0px': async ({pass, fail}) => {
		const main = await createMain();
		const val = getCssVar(main, '--right-panel-width');
		if(val !== '0px') {
			cleanup(main);
			return fail(`Expected --right-panel-width "0px", got "${val}"`);
		}
		cleanup(main);
		pass('Default --right-panel-width is 0px');
	},

	/*
		Main - Window Event Handling
	*/
	'should respond to aside_state_change event for left aside': async ({pass, fail}) => {
		const main = await createMain();
		const aside = document.createElement('k-aside');
		aside.side = 'left';
		aside.main = 'push';
		window.dispatchEvent(new CustomEvent('aside_state_change', {
			detail: { aside, state: 'expanded', main: 'push', width: 256 }
		}));
		const val = getCssVar(main, '--left-panel-width');
		if(val !== '256px') {
			cleanup(main);
			return fail(`Expected --left-panel-width "256px", got "${val}"`);
		}
		cleanup(main);
		pass('Responds to aside_state_change for left aside');
	},

	'should respond to aside_state_change event for right aside': async ({pass, fail}) => {
		const main = await createMain();
		const aside = document.createElement('k-aside');
		aside.side = 'right';
		aside.main = 'push';
		window.dispatchEvent(new CustomEvent('aside_state_change', {
			detail: { aside, state: 'expanded', main: 'push', width: 256 }
		}));
		const val = getCssVar(main, '--right-panel-width');
		if(val !== '256px') {
			cleanup(main);
			return fail(`Expected --right-panel-width "256px", got "${val}"`);
		}
		cleanup(main);
		pass('Responds to aside_state_change for right aside');
	},

	'should handle multiple events for same side': async ({pass, fail}) => {
		const main = await createMain();
		const aside = document.createElement('k-aside');
		aside.side = 'left';
		aside.main = 'push';
		window.dispatchEvent(new CustomEvent('aside_state_change', {
			detail: { aside, state: 'expanded', main: 'push', width: 256 }
		}));
		if(getCssVar(main, '--left-panel-width') !== '256px') {
			cleanup(main);
			return fail('Should update on first event');
		}
		window.dispatchEvent(new CustomEvent('aside_state_change', {
			detail: { aside, state: 'collapsed', main: 'push', width: 56 }
		}));
		if(getCssVar(main, '--left-panel-width') !== '56px') {
			cleanup(main);
			return fail('Should update on second event');
		}
		cleanup(main);
		pass('Handles multiple events for same side');
	},

	'should handle events for both sides independently': async ({pass, fail}) => {
		const main = await createMain();
		const asideL = document.createElement('k-aside');
		asideL.side = 'left';
		asideL.main = 'push';
		const asideR = document.createElement('k-aside');
		asideR.side = 'right';
		asideR.main = 'push';
		window.dispatchEvent(new CustomEvent('aside_state_change', {
			detail: { aside: asideL, state: 'expanded', main: 'push', width: 256 }
		}));
		window.dispatchEvent(new CustomEvent('aside_state_change', {
			detail: { aside: asideR, state: 'expanded', main: 'push', width: 56 }
		}));
		const l = getCssVar(main, '--left-panel-width');
		const r = getCssVar(main, '--right-panel-width');
		if(l !== '256px' || r !== '56px') {
			cleanup(main);
			return fail(`Expected left "256px" and right "56px", got "${l}" and "${r}"`);
		}
		cleanup(main);
		pass('Handles events for both sides independently');
	},

	'should take max width from multiple sources on same side': async ({pass, fail}) => {
		const main = await createMain();
		const aside1 = document.createElement('k-aside');
		aside1.side = 'left';
		aside1.main = 'push';
		const aside2 = document.createElement('k-aside');
		aside2.side = 'left';
		aside2.main = 'push';
		window.dispatchEvent(new CustomEvent('aside_state_change', {
			detail: { aside: aside1, state: 'expanded', main: 'push', width: 100 }
		}));
		window.dispatchEvent(new CustomEvent('aside_state_change', {
			detail: { aside: aside2, state: 'expanded', main: 'push', width: 320 }
		}));
		const val = getCssVar(main, '--left-panel-width');
		if(val !== '320px') {
			cleanup(main);
			return fail(`Expected max width "320px", got "${val}"`);
		}
		cleanup(main);
		pass('Takes max width from multiple sources on same side');
	},

	'should remove source when aside goes offscreen': async ({pass, fail}) => {
		const main = await createMain();
		const aside1 = document.createElement('k-aside');
		aside1.side = 'left';
		aside1.main = 'push';
		const aside2 = document.createElement('k-aside');
		aside2.side = 'left';
		aside2.main = 'push';
		window.dispatchEvent(new CustomEvent('aside_state_change', {
			detail: { aside: aside1, state: 'expanded', main: 'push', width: 100 }
		}));
		window.dispatchEvent(new CustomEvent('aside_state_change', {
			detail: { aside: aside2, state: 'expanded', main: 'push', width: 320 }
		}));
		window.dispatchEvent(new CustomEvent('aside_state_change', {
			detail: { aside: aside2, state: 'offscreen', main: 'push' }
		}));
		const val = getCssVar(main, '--left-panel-width');
		if(val !== '100px') {
			cleanup(main);
			return fail(`Expected "100px" after removing larger source, got "${val}"`);
		}
		cleanup(main);
		pass('Removes source when aside goes offscreen');
	},

	'should ignore overlay asides': async ({pass, fail}) => {
		const main = await createMain();
		const aside = document.createElement('k-aside');
		aside.side = 'left';
		aside.main = 'overlay';
		window.dispatchEvent(new CustomEvent('aside_state_change', {
			detail: { aside, state: 'expanded', main: 'overlay', width: 256 }
		}));
		const val = getCssVar(main, '--left-panel-width');
		if(val !== '0px') {
			cleanup(main);
			return fail(`Expected "0px" for overlay aside, got "${val}"`);
		}
		cleanup(main);
		pass('Ignores overlay asides');
	},

	'should not error when no aside exists': async ({pass, fail}) => {
		const main = await createMain();
		const l = getCssVar(main, '--left-panel-width');
		const r = getCssVar(main, '--right-panel-width');
		if(l !== '0px' || r !== '0px') {
			cleanup(main);
			return fail('Should have default values when no aside exists');
		}
		cleanup(main);
		pass('Does not error when no aside exists');
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
	}
};
