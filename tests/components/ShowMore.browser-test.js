import ShowMore from '../../src/components/ShowMore.js';

const createShowMore = async (options = {}) => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-show-more ${options.opened ? 'opened' : ''}>
			${options.content || '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>'}
			${options.moreSlot ? `<span slot="more">${options.moreSlot}</span>` : ''}
			${options.lessSlot ? `<span slot="less">${options.lessSlot}</span>` : ''}
		</k-show-more>
	`;
	document.body.appendChild(container);

	const showMore = container.querySelector('k-show-more');
	await showMore.updateComplete;

	return { container, showMore };
};

const cleanup = container => {
	if(container && container.parentNode){
		container.parentNode.removeChild(container);
	}
};

export default {
	/*
		Element Creation Tests
	*/
	'should create show-more element': async ({pass, fail}) => {
		const { container, showMore } = await createShowMore();

		if(!showMore){
			cleanup(container);
			fail('ShowMore element should be created');
			return;
		}

		if(!(showMore instanceof ShowMore)){
			cleanup(container);
			fail('Element should be instance of ShowMore');
			return;
		}

		cleanup(container);
		pass('ShowMore element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, showMore } = await createShowMore();

		if(!showMore.shadowRoot){
			cleanup(container);
			fail('ShowMore should have shadow root');
			return;
		}

		cleanup(container);
		pass('ShowMore has shadow root');
	},

	/*
		Default Property Tests
	*/
	'should be closed by default': async ({pass, fail}) => {
		const { container, showMore } = await createShowMore();

		if(showMore.opened !== false){
			cleanup(container);
			fail(`Expected opened false, got ${showMore.opened}`);
			return;
		}

		cleanup(container);
		pass('ShowMore is closed by default');
	},

	/*
		Rendering Tests
	*/
	'should render wrapper element': async ({pass, fail}) => {
		const { container, showMore } = await createShowMore();

		const wrapper = showMore.shadowRoot.querySelector('#wrapper');
		if(!wrapper){
			cleanup(container);
			fail('Should render #wrapper element');
			return;
		}

		cleanup(container);
		pass('Wrapper element rendered');
	},

	'should render content element': async ({pass, fail}) => {
		const { container, showMore } = await createShowMore();

		const content = showMore.shadowRoot.querySelector('#content');
		if(!content){
			cleanup(container);
			fail('Should render #content element');
			return;
		}

		cleanup(container);
		pass('Content element rendered');
	},

	'should render toggle button': async ({pass, fail}) => {
		const { container, showMore } = await createShowMore();

		const toggle = showMore.shadowRoot.querySelector('#toggle');
		if(!toggle){
			cleanup(container);
			fail('Should render #toggle button');
			return;
		}

		cleanup(container);
		pass('Toggle button rendered');
	},

	'should render more span': async ({pass, fail}) => {
		const { container, showMore } = await createShowMore();

		const more = showMore.shadowRoot.querySelector('#more');
		if(!more){
			cleanup(container);
			fail('Should render #more span');
			return;
		}

		cleanup(container);
		pass('More span rendered');
	},

	'should render less span': async ({pass, fail}) => {
		const { container, showMore } = await createShowMore();

		const less = showMore.shadowRoot.querySelector('#less');
		if(!less){
			cleanup(container);
			fail('Should render #less span');
			return;
		}

		cleanup(container);
		pass('Less span rendered');
	},

	'should render default slot': async ({pass, fail}) => {
		const { container, showMore } = await createShowMore();

		const slot = showMore.shadowRoot.querySelector('slot:not([name])');
		if(!slot){
			cleanup(container);
			fail('Should have default slot');
			return;
		}

		cleanup(container);
		pass('Default slot rendered');
	},

	'should render more slot': async ({pass, fail}) => {
		const { container, showMore } = await createShowMore();

		const slot = showMore.shadowRoot.querySelector('slot[name="more"]');
		if(!slot){
			cleanup(container);
			fail('Should have more slot');
			return;
		}

		cleanup(container);
		pass('More slot rendered');
	},

	'should render less slot': async ({pass, fail}) => {
		const { container, showMore } = await createShowMore();

		const slot = showMore.shadowRoot.querySelector('slot[name="less"]');
		if(!slot){
			cleanup(container);
			fail('Should have less slot');
			return;
		}

		cleanup(container);
		pass('Less slot rendered');
	},

	/*
		Open/Close Method Tests
	*/
	'should open with more method': async ({pass, fail}) => {
		const { container, showMore } = await createShowMore();

		showMore.more();
		await showMore.updateComplete;

		if(showMore.opened !== true){
			cleanup(container);
			fail(`Expected opened true, got ${showMore.opened}`);
			return;
		}

		cleanup(container);
		pass('more() opens content');
	},

	'should close with less method': async ({pass, fail}) => {
		const { container, showMore } = await createShowMore({ opened: true });

		showMore.less();
		await showMore.updateComplete;

		if(showMore.opened !== false){
			cleanup(container);
			fail(`Expected opened false, got ${showMore.opened}`);
			return;
		}

		cleanup(container);
		pass('less() closes content');
	},

	'should toggle opened state': async ({pass, fail}) => {
		const { container, showMore } = await createShowMore();

		showMore.toggle();
		await showMore.updateComplete;

		if(showMore.opened !== true){
			cleanup(container);
			fail(`Expected opened true after first toggle, got ${showMore.opened}`);
			return;
		}

		showMore.toggle();
		await showMore.updateComplete;

		if(showMore.opened !== false){
			cleanup(container);
			fail(`Expected opened false after second toggle, got ${showMore.opened}`);
			return;
		}

		cleanup(container);
		pass('toggle() switches opened state');
	},

	/*
		Toggle Button Tests
	*/
	'should toggle on button click': async ({pass, fail}) => {
		const { container, showMore } = await createShowMore();

		const toggle = showMore.shadowRoot.querySelector('#toggle');
		toggle.click();
		await showMore.updateComplete;

		if(showMore.opened !== true){
			cleanup(container);
			fail('Clicking toggle should open content');
			return;
		}

		toggle.click();
		await showMore.updateComplete;

		if(showMore.opened !== false){
			cleanup(container);
			fail('Clicking toggle again should close content');
			return;
		}

		cleanup(container);
		pass('Toggle button works correctly');
	},

	/*
		Event Tests
	*/
	'should dispatch change event on open': async ({pass, fail}) => {
		const { container, showMore } = await createShowMore();

		let eventDetail = null;
		showMore.addEventListener('change', e => {
			eventDetail = e.detail;
		});

		showMore.more();
		await showMore.updateComplete;

		if(!eventDetail || eventDetail.opened !== true){
			cleanup(container);
			fail('change event should be dispatched with opened: true');
			return;
		}

		cleanup(container);
		pass('change event dispatched on open');
	},

	'should dispatch change event on close': async ({pass, fail}) => {
		const { container, showMore } = await createShowMore({ opened: true });

		let eventDetail = null;
		showMore.addEventListener('change', e => {
			eventDetail = e.detail;
		});

		showMore.less();
		await showMore.updateComplete;

		if(!eventDetail || eventDetail.opened !== false){
			cleanup(container);
			fail('change event should be dispatched with opened: false');
			return;
		}

		cleanup(container);
		pass('change event dispatched on close');
	},

	'should dispatch opened event': async ({pass, fail}) => {
		const { container, showMore } = await createShowMore();

		let eventFired = false;
		showMore.addEventListener('opened', () => {
			eventFired = true;
		});

		showMore.more();
		await showMore.updateComplete;

		if(!eventFired){
			cleanup(container);
			fail('opened event should be dispatched');
			return;
		}

		cleanup(container);
		pass('opened event dispatched');
	},

	'should dispatch closed event': async ({pass, fail}) => {
		const { container, showMore } = await createShowMore({ opened: true });

		let eventFired = false;
		showMore.addEventListener('closed', () => {
			eventFired = true;
		});

		showMore.less();
		await showMore.updateComplete;

		if(!eventFired){
			cleanup(container);
			fail('closed event should be dispatched');
			return;
		}

		cleanup(container);
		pass('closed event dispatched');
	},

	/*
		Attribute Reflection Tests
	*/
	'should reflect opened attribute': async ({pass, fail}) => {
		const { container, showMore } = await createShowMore();

		showMore.more();
		await showMore.updateComplete;

		if(!showMore.hasAttribute('opened')){
			cleanup(container);
			fail('opened attribute should be reflected');
			return;
		}

		showMore.less();
		await showMore.updateComplete;

		if(showMore.hasAttribute('opened')){
			cleanup(container);
			fail('opened attribute should be removed when closed');
			return;
		}

		cleanup(container);
		pass('opened attribute reflects property');
	},

	/*
		Content Visibility Tests
	*/
	'should show more span when closed': async ({pass, fail}) => {
		const { container, showMore } = await createShowMore();

		const more = showMore.shadowRoot.querySelector('#more');
		const computedStyle = window.getComputedStyle(more);

		if(computedStyle.display === 'none'){
			cleanup(container);
			fail('More span should be visible when closed');
			return;
		}

		cleanup(container);
		pass('More span visible when closed');
	},

	'should hide less span when closed': async ({pass, fail}) => {
		const { container, showMore } = await createShowMore();

		const less = showMore.shadowRoot.querySelector('#less');
		const computedStyle = window.getComputedStyle(less);

		if(computedStyle.display !== 'none'){
			cleanup(container);
			fail('Less span should be hidden when closed');
			return;
		}

		cleanup(container);
		pass('Less span hidden when closed');
	},

	'should hide more span when opened': async ({pass, fail}) => {
		const { container, showMore } = await createShowMore({ opened: true });

		const more = showMore.shadowRoot.querySelector('#more');
		const computedStyle = window.getComputedStyle(more);

		if(computedStyle.display !== 'none'){
			cleanup(container);
			fail('More span should be hidden when opened');
			return;
		}

		cleanup(container);
		pass('More span hidden when opened');
	},

	'should show less span when opened': async ({pass, fail}) => {
		const { container, showMore } = await createShowMore({ opened: true });

		const less = showMore.shadowRoot.querySelector('#less');
		const computedStyle = window.getComputedStyle(less);

		if(computedStyle.display === 'none'){
			cleanup(container);
			fail('Less span should be visible when opened');
			return;
		}

		cleanup(container);
		pass('Less span visible when opened');
	},

	/*
		Content Slot Tests
	*/
	'should slot content correctly': async ({pass, fail}) => {
		const { container, showMore } = await createShowMore({ content: '<p id="test-content">Test content</p>' });

		const content = showMore.querySelector('#test-content');
		if(!content){
			cleanup(container);
			fail('Content should be slotted');
			return;
		}

		if(content.textContent !== 'Test content'){
			cleanup(container);
			fail(`Expected "Test content", got "${content.textContent}"`);
			return;
		}

		cleanup(container);
		pass('Content slotted correctly');
	},

	'should slot custom more text': async ({pass, fail}) => {
		const { container, showMore } = await createShowMore({ moreSlot: 'Expand' });

		const moreSlotContent = showMore.querySelector('[slot="more"]');
		if(!moreSlotContent){
			cleanup(container);
			fail('Custom more text should be slotted');
			return;
		}

		if(moreSlotContent.textContent !== 'Expand'){
			cleanup(container);
			fail(`Expected "Expand", got "${moreSlotContent.textContent}"`);
			return;
		}

		cleanup(container);
		pass('Custom more text slotted correctly');
	},

	'should slot custom less text': async ({pass, fail}) => {
		const { container, showMore } = await createShowMore({ lessSlot: 'Collapse' });

		const lessSlotContent = showMore.querySelector('[slot="less"]');
		if(!lessSlotContent){
			cleanup(container);
			fail('Custom less text should be slotted');
			return;
		}

		if(lessSlotContent.textContent !== 'Collapse'){
			cleanup(container);
			fail(`Expected "Collapse", got "${lessSlotContent.textContent}"`);
			return;
		}

		cleanup(container);
		pass('Custom less text slotted correctly');
	},

	/*
		Display Tests
	*/
	'should have block display': async ({pass, fail}) => {
		const { container, showMore } = await createShowMore();

		const computedStyle = window.getComputedStyle(showMore);
		if(computedStyle.display !== 'block'){
			cleanup(container);
			fail(`Expected display "block", got "${computedStyle.display}"`);
			return;
		}

		cleanup(container);
		pass('ShowMore has block display');
	},

	/*
		Content Overflow Tests
	*/
	'should have overflow hidden when closed': async ({pass, fail}) => {
		const { container, showMore } = await createShowMore();

		const content = showMore.shadowRoot.querySelector('#content');
		const computedStyle = window.getComputedStyle(content);

		if(computedStyle.overflowY !== 'hidden'){
			cleanup(container);
			fail(`Expected overflow-y "hidden", got "${computedStyle.overflowY}"`);
			return;
		}

		cleanup(container);
		pass('Content has overflow hidden when closed');
	},

	/*
		Initial State from Attribute Tests
	*/
	'should be opened when opened attribute is present': async ({pass, fail}) => {
		const { container, showMore } = await createShowMore({ opened: true });

		if(showMore.opened !== true){
			cleanup(container);
			fail('Should be opened when opened attribute is present');
			return;
		}

		cleanup(container);
		pass('Opened attribute sets initial state');
	},

	/*
		Toggle Button Style Tests
	*/
	'should have full width toggle button': async ({pass, fail}) => {
		const { container, showMore } = await createShowMore();

		const toggle = showMore.shadowRoot.querySelector('#toggle');
		const computedStyle = window.getComputedStyle(toggle);

		if(computedStyle.width !== '100%' && !computedStyle.width.includes('100')){
			// Check via offsetWidth comparison
			const parentWidth = toggle.parentElement.offsetWidth;
			const toggleWidth = toggle.offsetWidth;
			if(toggleWidth < parentWidth * 0.9){
				cleanup(container);
				fail('Toggle button should be full width');
				return;
			}
		}

		cleanup(container);
		pass('Toggle button is full width');
	},

	'should have centered text in toggle button': async ({pass, fail}) => {
		const { container, showMore } = await createShowMore();

		const toggle = showMore.shadowRoot.querySelector('#toggle');
		const computedStyle = window.getComputedStyle(toggle);

		if(computedStyle.textAlign !== 'center'){
			cleanup(container);
			fail(`Expected text-align "center", got "${computedStyle.textAlign}"`);
			return;
		}

		cleanup(container);
		pass('Toggle button has centered text');
	}
};
