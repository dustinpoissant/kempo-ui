import SideMenu from '../../src/components/SideMenu.js';

const createSideMenu = async (options = {}) => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-side-menu
			${options.opened ? 'opened' : ''}
			${options.overlayClose === false ? 'overlay-close="false"' : ''}
			${options.side ? `side="${options.side}"` : ''}
		>
			${options.content || '<nav><a href="#">Link 1</a><a href="#">Link 2</a></nav>'}
		</k-side-menu>
	`;
	document.body.appendChild(container);

	const sideMenu = container.querySelector('k-side-menu');
	await sideMenu.updateComplete;

	return { container, sideMenu };
};

const cleanup = container => {
	if(container && container.parentNode){
		container.parentNode.removeChild(container);
	}
	document.body.classList.remove('no-scroll');
};

export default {
	/*
		Element Creation Tests
	*/
	'should create side-menu element': async ({pass, fail}) => {
		const { container, sideMenu } = await createSideMenu();

		if(!sideMenu){
			cleanup(container);
			fail('SideMenu element should be created');
			return;
		}

		if(!(sideMenu instanceof SideMenu)){
			cleanup(container);
			fail('Element should be instance of SideMenu');
			return;
		}

		cleanup(container);
		pass('SideMenu element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, sideMenu } = await createSideMenu();

		if(!sideMenu.shadowRoot){
			cleanup(container);
			fail('SideMenu should have shadow root');
			return;
		}

		cleanup(container);
		pass('SideMenu has shadow root');
	},

	/*
		Default Property Tests
	*/
	'should be closed by default': async ({pass, fail}) => {
		const { container, sideMenu } = await createSideMenu();

		if(sideMenu.opened !== false){
			cleanup(container);
			fail(`Expected opened false, got ${sideMenu.opened}`);
			return;
		}

		cleanup(container);
		pass('SideMenu is closed by default');
	},

	'should have overlayClose true by default': async ({pass, fail}) => {
		const { container, sideMenu } = await createSideMenu();

		if(sideMenu.overlayClose !== true){
			cleanup(container);
			fail(`Expected overlayClose true, got ${sideMenu.overlayClose}`);
			return;
		}

		cleanup(container);
		pass('overlayClose is true by default');
	},

	'should have side left by default': async ({pass, fail}) => {
		const { container, sideMenu } = await createSideMenu();

		if(sideMenu.side !== 'left'){
			cleanup(container);
			fail(`Expected side "left", got "${sideMenu.side}"`);
			return;
		}

		cleanup(container);
		pass('side is "left" by default');
	},

	/*
		Rendering Tests
	*/
	'should render focus-capture element': async ({pass, fail}) => {
		const { container, sideMenu } = await createSideMenu();

		const focusCapture = sideMenu.shadowRoot.querySelector('k-focus-capture');
		if(!focusCapture){
			cleanup(container);
			fail('Should render k-focus-capture element');
			return;
		}

		cleanup(container);
		pass('Focus capture element rendered');
	},

	'should render container element': async ({pass, fail}) => {
		const { container, sideMenu } = await createSideMenu();

		const containerEl = sideMenu.shadowRoot.querySelector('#container');
		if(!containerEl){
			cleanup(container);
			fail('Should render #container element');
			return;
		}

		cleanup(container);
		pass('Container element rendered');
	},

	'should render overlay element': async ({pass, fail}) => {
		const { container, sideMenu } = await createSideMenu();

		const overlay = sideMenu.shadowRoot.querySelector('#overlay');
		if(!overlay){
			cleanup(container);
			fail('Should render #overlay element');
			return;
		}

		cleanup(container);
		pass('Overlay element rendered');
	},

	'should render menu element': async ({pass, fail}) => {
		const { container, sideMenu } = await createSideMenu();

		const menu = sideMenu.shadowRoot.querySelector('#menu');
		if(!menu){
			cleanup(container);
			fail('Should render #menu element');
			return;
		}

		cleanup(container);
		pass('Menu element rendered');
	},

	'should render overlay close icon': async ({pass, fail}) => {
		const { container, sideMenu } = await createSideMenu();

		const overlayX = sideMenu.shadowRoot.querySelector('#overlay-x');
		if(!overlayX){
			cleanup(container);
			fail('Should render #overlay-x element');
			return;
		}

		cleanup(container);
		pass('Overlay close icon rendered');
	},

	'should render default slot': async ({pass, fail}) => {
		const { container, sideMenu } = await createSideMenu();

		const slot = sideMenu.shadowRoot.querySelector('slot');
		if(!slot){
			cleanup(container);
			fail('Should have default slot');
			return;
		}

		cleanup(container);
		pass('Default slot rendered');
	},

	/*
		Open/Close Method Tests
	*/
	'should open with open method': async ({pass, fail}) => {
		const { container, sideMenu } = await createSideMenu();

		sideMenu.open();
		await sideMenu.updateComplete;

		if(sideMenu.opened !== true){
			cleanup(container);
			fail(`Expected opened true, got ${sideMenu.opened}`);
			return;
		}

		cleanup(container);
		pass('open() opens menu');
	},

	'should close with close method': async ({pass, fail}) => {
		const { container, sideMenu } = await createSideMenu({ opened: true });

		sideMenu.close();
		await sideMenu.updateComplete;

		if(sideMenu.opened !== false){
			cleanup(container);
			fail(`Expected opened false, got ${sideMenu.opened}`);
			return;
		}

		cleanup(container);
		pass('close() closes menu');
	},

	'should toggle opened state': async ({pass, fail}) => {
		const { container, sideMenu } = await createSideMenu();

		sideMenu.toggle();
		await sideMenu.updateComplete;

		if(sideMenu.opened !== true){
			cleanup(container);
			fail(`Expected opened true after first toggle, got ${sideMenu.opened}`);
			return;
		}

		sideMenu.toggle();
		await sideMenu.updateComplete;

		if(sideMenu.opened !== false){
			cleanup(container);
			fail(`Expected opened false after second toggle, got ${sideMenu.opened}`);
			return;
		}

		cleanup(container);
		pass('toggle() switches opened state');
	},

	/*
		Overlay Close Tests
	*/
	'should close on overlay click when overlayClose is true': async ({pass, fail}) => {
		const { container, sideMenu } = await createSideMenu({ opened: true });

		const overlay = sideMenu.shadowRoot.querySelector('#overlay');
		overlay.click();
		await sideMenu.updateComplete;

		if(sideMenu.opened !== false){
			cleanup(container);
			fail('Clicking overlay should close menu');
			return;
		}

		cleanup(container);
		pass('Overlay click closes menu');
	},

	'should not close on overlay click when overlayClose is false': async ({pass, fail}) => {
		const { container, sideMenu } = await createSideMenu({ opened: true, overlayClose: false });

		const overlay = sideMenu.shadowRoot.querySelector('#overlay');
		overlay.click();
		await sideMenu.updateComplete;

		if(sideMenu.opened !== true){
			cleanup(container);
			fail('Clicking overlay should not close menu when overlayClose is false');
			return;
		}

		cleanup(container);
		pass('Overlay click does not close menu when overlayClose is false');
	},

	/*
		Event Tests
	*/
	'should dispatch open event': async ({pass, fail}) => {
		const { container, sideMenu } = await createSideMenu();

		let eventFired = false;
		sideMenu.addEventListener('open', () => {
			eventFired = true;
		});

		sideMenu.open();
		await sideMenu.updateComplete;

		if(!eventFired){
			cleanup(container);
			fail('open event should be dispatched');
			return;
		}

		cleanup(container);
		pass('open event dispatched');
	},

	'should dispatch close event': async ({pass, fail}) => {
		const { container, sideMenu } = await createSideMenu({ opened: true });

		let eventFired = false;
		sideMenu.addEventListener('close', () => {
			eventFired = true;
		});

		sideMenu.close();
		await sideMenu.updateComplete;

		if(!eventFired){
			cleanup(container);
			fail('close event should be dispatched');
			return;
		}

		cleanup(container);
		pass('close event dispatched');
	},

	'should dispatch change event on open': async ({pass, fail}) => {
		const { container, sideMenu } = await createSideMenu();

		let eventDetail = null;
		sideMenu.addEventListener('change', e => {
			eventDetail = e.detail;
		});

		sideMenu.open();
		await sideMenu.updateComplete;

		if(eventDetail !== 'open'){
			cleanup(container);
			fail(`Expected change event detail "open", got "${eventDetail}"`);
			return;
		}

		cleanup(container);
		pass('change event dispatched on open');
	},

	'should dispatch change event on close': async ({pass, fail}) => {
		const { container, sideMenu } = await createSideMenu({ opened: true });

		let eventDetail = null;
		sideMenu.addEventListener('change', e => {
			eventDetail = e.detail;
		});

		sideMenu.close();
		await sideMenu.updateComplete;

		if(eventDetail !== 'close'){
			cleanup(container);
			fail(`Expected change event detail "close", got "${eventDetail}"`);
			return;
		}

		cleanup(container);
		pass('change event dispatched on close');
	},

	'should dispatch toggle event': async ({pass, fail}) => {
		const { container, sideMenu } = await createSideMenu();

		let eventFired = false;
		sideMenu.addEventListener('toggle', () => {
			eventFired = true;
		});

		sideMenu.toggle();
		await sideMenu.updateComplete;

		if(!eventFired){
			cleanup(container);
			fail('toggle event should be dispatched');
			return;
		}

		cleanup(container);
		pass('toggle event dispatched');
	},

	/*
		Body Scroll Lock Tests
	*/
	'should add no-scroll class to body when opened': async ({pass, fail}) => {
		const { container, sideMenu } = await createSideMenu();

		sideMenu.open();
		await sideMenu.updateComplete;

		if(!document.body.classList.contains('no-scroll')){
			cleanup(container);
			fail('Body should have no-scroll class when menu is opened');
			return;
		}

		cleanup(container);
		pass('Body has no-scroll class when opened');
	},

	'should remove no-scroll class from body when closed': async ({pass, fail}) => {
		const { container, sideMenu } = await createSideMenu({ opened: true });
		
		// Ensure body has the class first
		document.body.classList.add('no-scroll');

		sideMenu.close();
		await sideMenu.updateComplete;

		if(document.body.classList.contains('no-scroll')){
			cleanup(container);
			fail('Body should not have no-scroll class when menu is closed');
			return;
		}

		cleanup(container);
		pass('Body no-scroll class removed when closed');
	},

	/*
		Side Attribute Tests
	*/
	'should reflect side attribute': async ({pass, fail}) => {
		const { container, sideMenu } = await createSideMenu({ side: 'right' });

		if(sideMenu.getAttribute('side') !== 'right'){
			cleanup(container);
			fail('side attribute should reflect property');
			return;
		}

		cleanup(container);
		pass('side attribute reflects property');
	},

	'should accept left side': async ({pass, fail}) => {
		const { container, sideMenu } = await createSideMenu({ side: 'left' });

		if(sideMenu.side !== 'left'){
			cleanup(container);
			fail(`Expected side "left", got "${sideMenu.side}"`);
			return;
		}

		cleanup(container);
		pass('left side accepted');
	},

	'should accept right side': async ({pass, fail}) => {
		const { container, sideMenu } = await createSideMenu({ side: 'right' });

		if(sideMenu.side !== 'right'){
			cleanup(container);
			fail(`Expected side "right", got "${sideMenu.side}"`);
			return;
		}

		cleanup(container);
		pass('right side accepted');
	},

	/*
		Attribute Reflection Tests
	*/
	'should reflect opened attribute': async ({pass, fail}) => {
		const { container, sideMenu } = await createSideMenu();

		sideMenu.open();
		await sideMenu.updateComplete;

		if(!sideMenu.hasAttribute('opened')){
			cleanup(container);
			fail('opened attribute should be reflected');
			return;
		}

		sideMenu.close();
		await sideMenu.updateComplete;

		if(sideMenu.hasAttribute('opened')){
			cleanup(container);
			fail('opened attribute should be removed when closed');
			return;
		}

		cleanup(container);
		pass('opened attribute reflects property');
	},

	'should reflect overlay-close attribute': async ({pass, fail}) => {
		const { container, sideMenu } = await createSideMenu({ overlayClose: false });

		if(sideMenu.getAttribute('overlay-close') !== 'false'){
			cleanup(container);
			fail('overlay-close attribute should reflect property');
			return;
		}

		cleanup(container);
		pass('overlay-close attribute reflects property');
	},

	/*
		Content Slot Tests
	*/
	'should slot content correctly': async ({pass, fail}) => {
		const { container, sideMenu } = await createSideMenu({ content: '<nav id="test-nav"><a href="#">Test Link</a></nav>' });

		const nav = sideMenu.querySelector('#test-nav');
		if(!nav){
			cleanup(container);
			fail('Content should be slotted');
			return;
		}

		cleanup(container);
		pass('Content slotted correctly');
	},

	/*
		Display Tests
	*/
	'should have fixed position': async ({pass, fail}) => {
		const { container, sideMenu } = await createSideMenu();

		const computedStyle = window.getComputedStyle(sideMenu);
		if(computedStyle.position !== 'fixed'){
			cleanup(container);
			fail(`Expected position "fixed", got "${computedStyle.position}"`);
			return;
		}

		cleanup(container);
		pass('SideMenu has fixed position');
	},

	'should have pointer-events none when closed': async ({pass, fail}) => {
		const { container, sideMenu } = await createSideMenu();

		const computedStyle = window.getComputedStyle(sideMenu);
		if(computedStyle.pointerEvents !== 'none'){
			cleanup(container);
			fail(`Expected pointer-events "none" when closed, got "${computedStyle.pointerEvents}"`);
			return;
		}

		cleanup(container);
		pass('Pointer-events none when closed');
	},

	'should have pointer-events auto when opened': async ({pass, fail}) => {
		const { container, sideMenu } = await createSideMenu({ opened: true });

		const computedStyle = window.getComputedStyle(sideMenu);
		if(computedStyle.pointerEvents !== 'auto'){
			cleanup(container);
			fail(`Expected pointer-events "auto" when opened, got "${computedStyle.pointerEvents}"`);
			return;
		}

		cleanup(container);
		pass('Pointer-events auto when opened');
	},

	'should have high z-index': async ({pass, fail}) => {
		const { container, sideMenu } = await createSideMenu();

		const computedStyle = window.getComputedStyle(sideMenu);
		const zIndex = parseInt(computedStyle.zIndex, 10);

		if(isNaN(zIndex) || zIndex < 100){
			cleanup(container);
			fail(`Expected high z-index, got "${computedStyle.zIndex}"`);
			return;
		}

		cleanup(container);
		pass('SideMenu has high z-index');
	},

	/*
		Overlay X Icon Visibility Tests
	*/
	'should hide overlay X when overlay-close is false': async ({pass, fail}) => {
		const { container, sideMenu } = await createSideMenu({ overlayClose: false });

		const overlayX = sideMenu.shadowRoot.querySelector('#overlay-x');
		const computedStyle = window.getComputedStyle(overlayX);

		if(computedStyle.display !== 'none'){
			cleanup(container);
			fail('Overlay X should be hidden when overlay-close is false');
			return;
		}

		cleanup(container);
		pass('Overlay X hidden when overlay-close is false');
	},

	/*
		Container Opacity Tests
	*/
	'should have container opacity 0 when closed': async ({pass, fail}) => {
		const { container, sideMenu } = await createSideMenu();

		const containerEl = sideMenu.shadowRoot.querySelector('#container');
		const computedStyle = window.getComputedStyle(containerEl);

		if(computedStyle.opacity !== '0'){
			cleanup(container);
			fail(`Expected opacity "0" when closed, got "${computedStyle.opacity}"`);
			return;
		}

		cleanup(container);
		pass('Container opacity is 0 when closed');
	},

	'should have container opacity 1 when opened': async ({pass, fail}) => {
		const { container, sideMenu } = await createSideMenu({ opened: true });

		const containerEl = sideMenu.shadowRoot.querySelector('#container');
		const computedStyle = window.getComputedStyle(containerEl);

		if(computedStyle.opacity !== '1'){
			cleanup(container);
			fail(`Expected opacity "1" when opened, got "${computedStyle.opacity}"`);
			return;
		}

		cleanup(container);
		pass('Container opacity is 1 when opened');
	},

	/*
		Initial State from Attribute Tests
	*/
	'should be opened when opened attribute is present': async ({pass, fail}) => {
		const { container, sideMenu } = await createSideMenu({ opened: true });

		if(sideMenu.opened !== true){
			cleanup(container);
			fail('Should be opened when opened attribute is present');
			return;
		}

		cleanup(container);
		pass('Opened attribute sets initial state');
	}
};
