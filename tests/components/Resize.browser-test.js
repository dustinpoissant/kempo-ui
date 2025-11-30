import Resize from '../../src/components/Resize.js';

const createResize = async (options = {}) => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-resize
			${options.dimension ? `dimension="${options.dimension}"` : ''}
			style="${options.style || 'width: 200px; height: 200px;'}"
		>
			${options.content || '<p>Resizable content</p>'}
		</k-resize>
	`;
	document.body.appendChild(container);

	const resize = container.querySelector('k-resize');
	await resize.updateComplete;

	return { container, resize };
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
	'should create resize element': async ({pass, fail}) => {
		const { container, resize } = await createResize();

		if(!resize){
			cleanup(container);
			fail('Resize element should be created');
			return;
		}

		if(!(resize instanceof Resize)){
			cleanup(container);
			fail('Element should be instance of Resize');
			return;
		}

		cleanup(container);
		pass('Resize element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, resize } = await createResize();

		if(!resize.shadowRoot){
			cleanup(container);
			fail('Resize should have shadow root');
			return;
		}

		cleanup(container);
		pass('Resize has shadow root');
	},

	/*
		Default Property Tests
	*/
	'should have empty resizing property by default': async ({pass, fail}) => {
		const { container, resize } = await createResize();

		if(resize.resizing !== ''){
			cleanup(container);
			fail(`Expected resizing '', got "${resize.resizing}"`);
			return;
		}

		cleanup(container);
		pass('Default resizing property is empty');
	},

	/*
		Rendering Tests
	*/
	'should render main content area': async ({pass, fail}) => {
		const { container, resize } = await createResize();

		const main = resize.shadowRoot.querySelector('#main');
		if(!main){
			cleanup(container);
			fail('Should render #main content area');
			return;
		}

		cleanup(container);
		pass('Main content area rendered');
	},

	'should render side handle': async ({pass, fail}) => {
		const { container, resize } = await createResize();

		const sideHandle = resize.shadowRoot.querySelector('#side');
		if(!sideHandle){
			cleanup(container);
			fail('Should render #side handle');
			return;
		}

		cleanup(container);
		pass('Side handle rendered');
	},

	'should render bottom handle': async ({pass, fail}) => {
		const { container, resize } = await createResize();

		const bottomHandle = resize.shadowRoot.querySelector('#bottom');
		if(!bottomHandle){
			cleanup(container);
			fail('Should render #bottom handle');
			return;
		}

		cleanup(container);
		pass('Bottom handle rendered');
	},

	'should render corner handle': async ({pass, fail}) => {
		const { container, resize } = await createResize();

		const cornerHandle = resize.shadowRoot.querySelector('#corner');
		if(!cornerHandle){
			cleanup(container);
			fail('Should render #corner handle');
			return;
		}

		cleanup(container);
		pass('Corner handle rendered');
	},

	'should render default slot': async ({pass, fail}) => {
		const { container, resize } = await createResize();

		const slot = resize.shadowRoot.querySelector('slot');
		if(!slot){
			cleanup(container);
			fail('Should have default slot');
			return;
		}

		cleanup(container);
		pass('Default slot rendered');
	},

	/*
		Content Slot Tests
	*/
	'should slot content correctly': async ({pass, fail}) => {
		const { container, resize } = await createResize({ content: '<p id="test-content">Test</p>' });

		const content = resize.querySelector('#test-content');
		if(!content){
			cleanup(container);
			fail('Content should be slotted');
			return;
		}

		if(content.textContent !== 'Test'){
			cleanup(container);
			fail(`Expected content "Test", got "${content.textContent}"`);
			return;
		}

		cleanup(container);
		pass('Content slotted correctly');
	},

	/*
		Handle Cursor Tests
	*/
	'should have ew-resize cursor on side handle': async ({pass, fail}) => {
		const { container, resize } = await createResize();

		const sideHandle = resize.shadowRoot.querySelector('#side');
		const computedStyle = window.getComputedStyle(sideHandle);

		if(computedStyle.cursor !== 'ew-resize'){
			cleanup(container);
			fail(`Expected cursor "ew-resize", got "${computedStyle.cursor}"`);
			return;
		}

		cleanup(container);
		pass('Side handle has ew-resize cursor');
	},

	'should have ns-resize cursor on bottom handle': async ({pass, fail}) => {
		const { container, resize } = await createResize();

		const bottomHandle = resize.shadowRoot.querySelector('#bottom');
		const computedStyle = window.getComputedStyle(bottomHandle);

		if(computedStyle.cursor !== 'ns-resize'){
			cleanup(container);
			fail(`Expected cursor "ns-resize", got "${computedStyle.cursor}"`);
			return;
		}

		cleanup(container);
		pass('Bottom handle has ns-resize cursor');
	},

	'should have nwse-resize cursor on corner handle': async ({pass, fail}) => {
		const { container, resize } = await createResize();

		const cornerHandle = resize.shadowRoot.querySelector('#corner');
		const computedStyle = window.getComputedStyle(cornerHandle);

		if(computedStyle.cursor !== 'nwse-resize'){
			cleanup(container);
			fail(`Expected cursor "nwse-resize", got "${computedStyle.cursor}"`);
			return;
		}

		cleanup(container);
		pass('Corner handle has nwse-resize cursor');
	},

	/*
		Dimension Attribute Tests
	*/
	'should hide side and corner handles when dimension is height': async ({pass, fail}) => {
		const { container, resize } = await createResize({ dimension: 'height' });

		const sideHandle = resize.shadowRoot.querySelector('#side');
		const cornerHandle = resize.shadowRoot.querySelector('#corner');

		const sideStyle = window.getComputedStyle(sideHandle);
		const cornerStyle = window.getComputedStyle(cornerHandle);

		if(sideStyle.display !== 'none'){
			cleanup(container);
			fail('Side handle should be hidden when dimension is height');
			return;
		}

		if(cornerStyle.display !== 'none'){
			cleanup(container);
			fail('Corner handle should be hidden when dimension is height');
			return;
		}

		cleanup(container);
		pass('Side and corner handles hidden with dimension="height"');
	},

	'should hide bottom and corner handles when dimension is width': async ({pass, fail}) => {
		const { container, resize } = await createResize({ dimension: 'width' });

		const bottomHandle = resize.shadowRoot.querySelector('#bottom');
		const cornerHandle = resize.shadowRoot.querySelector('#corner');

		const bottomStyle = window.getComputedStyle(bottomHandle);
		const cornerStyle = window.getComputedStyle(cornerHandle);

		if(bottomStyle.display !== 'none'){
			cleanup(container);
			fail('Bottom handle should be hidden when dimension is width');
			return;
		}

		if(cornerStyle.display !== 'none'){
			cleanup(container);
			fail('Corner handle should be hidden when dimension is width');
			return;
		}

		cleanup(container);
		pass('Bottom and corner handles hidden with dimension="width"');
	},

	'should show all handles by default': async ({pass, fail}) => {
		const { container, resize } = await createResize();

		const sideHandle = resize.shadowRoot.querySelector('#side');
		const bottomHandle = resize.shadowRoot.querySelector('#bottom');
		const cornerHandle = resize.shadowRoot.querySelector('#corner');

		const sideStyle = window.getComputedStyle(sideHandle);
		const bottomStyle = window.getComputedStyle(bottomHandle);
		const cornerStyle = window.getComputedStyle(cornerHandle);

		if(sideStyle.display === 'none'){
			cleanup(container);
			fail('Side handle should be visible by default');
			return;
		}

		if(bottomStyle.display === 'none'){
			cleanup(container);
			fail('Bottom handle should be visible by default');
			return;
		}

		if(cornerStyle.display === 'none'){
			cleanup(container);
			fail('Corner handle should be visible by default');
			return;
		}

		cleanup(container);
		pass('All handles visible by default');
	},

	/*
		Layout Tests
	*/
	'should have grid display': async ({pass, fail}) => {
		const { container, resize } = await createResize();

		const computedStyle = window.getComputedStyle(resize);
		if(computedStyle.display !== 'grid'){
			cleanup(container);
			fail(`Expected display "grid", got "${computedStyle.display}"`);
			return;
		}

		cleanup(container);
		pass('Resize has grid display');
	},

	/*
		Attribute Reflection Tests
	*/
	'should reflect dimension attribute': async ({pass, fail}) => {
		const { container, resize } = await createResize({ dimension: 'height' });

		if(resize.getAttribute('dimension') !== 'height'){
			cleanup(container);
			fail('dimension attribute should reflect property');
			return;
		}

		cleanup(container);
		pass('dimension attribute reflects property');
	},

	'should reflect resizing attribute': async ({pass, fail}) => {
		const { container, resize } = await createResize();

		// Manually set resizing property to test reflection
		resize.resizing = 'side';
		await resize.updateComplete;

		if(resize.getAttribute('resizing') !== 'side'){
			cleanup(container);
			fail('resizing attribute should reflect property');
			return;
		}

		cleanup(container);
		pass('resizing attribute reflects property');
	},

	/*
		Initial Size Tests
	*/
	'should initialize startSize object': async ({pass, fail}) => {
		const { container, resize } = await createResize();

		if(typeof resize.startSize !== 'object'){
			cleanup(container);
			fail('startSize should be an object');
			return;
		}

		if(typeof resize.startSize.width !== 'number'){
			cleanup(container);
			fail('startSize.width should be a number');
			return;
		}

		if(typeof resize.startSize.height !== 'number'){
			cleanup(container);
			fail('startSize.height should be a number');
			return;
		}

		cleanup(container);
		pass('startSize object initialized correctly');
	},

	/*
		Cleanup Tests
	*/
	'should have cleanupFuncs array': async ({pass, fail}) => {
		const { container, resize } = await createResize();

		if(!Array.isArray(resize.cleanupFuncs)){
			cleanup(container);
			fail('cleanupFuncs should be an array');
			return;
		}

		cleanup(container);
		pass('cleanupFuncs array exists');
	},

	'should setup drag handlers after first update': async ({pass, fail}) => {
		const { container, resize } = await createResize();

		// After firstUpdated, cleanupFuncs should have entries for each handle
		if(resize.cleanupFuncs.length === 0){
			cleanup(container);
			fail('Drag handlers should be setup after firstUpdated');
			return;
		}

		cleanup(container);
		pass('Drag handlers setup after firstUpdated');
	},

	/*
		Style Tests
	*/
	'should have border defined in component styles': async ({pass, fail}) => {
		const { container, resize } = await createResize();

		// Check that the component's static styles include border definition
		const stylesStr = Resize.styles?.cssText || Resize.styles?.toString() || '';
		
		if(!stylesStr.includes('border')){
			cleanup(container);
			fail('Resize static styles should define border');
			return;
		}

		cleanup(container);
		pass('Resize has border defined in component styles');
	},

	/*
		Handle Visibility Tests
	*/
	'should have handle class on all handles': async ({pass, fail}) => {
		const { container, resize } = await createResize();

		const sideHandle = resize.shadowRoot.querySelector('#side');
		const bottomHandle = resize.shadowRoot.querySelector('#bottom');
		const cornerHandle = resize.shadowRoot.querySelector('#corner');

		if(!sideHandle.classList.contains('handle')){
			cleanup(container);
			fail('Side handle should have handle class');
			return;
		}

		if(!bottomHandle.classList.contains('handle')){
			cleanup(container);
			fail('Bottom handle should have handle class');
			return;
		}

		if(!cornerHandle.classList.contains('handle')){
			cleanup(container);
			fail('Corner handle should have handle class');
			return;
		}

		cleanup(container);
		pass('All handles have handle class');
	},

	/*
		SVG Icon Tests
	*/
	'should render SVG icons in handles': async ({pass, fail}) => {
		const { container, resize } = await createResize();

		const sideSvg = resize.shadowRoot.querySelector('#side svg');
		const bottomSvg = resize.shadowRoot.querySelector('#bottom svg');
		const cornerSvg = resize.shadowRoot.querySelector('#corner svg');

		if(!sideSvg){
			cleanup(container);
			fail('Side handle should have SVG icon');
			return;
		}

		if(!bottomSvg){
			cleanup(container);
			fail('Bottom handle should have SVG icon');
			return;
		}

		if(!cornerSvg){
			cleanup(container);
			fail('Corner handle should have SVG icon');
			return;
		}

		cleanup(container);
		pass('All handles have SVG icons');
	},

	/*
		Grid Template Tests
	*/
	'should use single column when dimension is height': async ({pass, fail}) => {
		const { container, resize } = await createResize({ dimension: 'height' });

		const computedStyle = window.getComputedStyle(resize);
		// When dimension="height", grid-template-columns should be "1fr" (only content column)

		if(!computedStyle.gridTemplateColumns || computedStyle.gridTemplateColumns.includes(' ')){
			// Check that it's effectively one column
			const columns = computedStyle.gridTemplateColumns.split(' ').filter(c => c);
			if(columns.length > 1){
				cleanup(container);
				fail('Should have single column when dimension is height');
				return;
			}
		}

		cleanup(container);
		pass('Single column layout with dimension="height"');
	},

	/*
		Dynamic Dimension Change Tests
	*/
	'should update dimension dynamically': async ({pass, fail}) => {
		const { container, resize } = await createResize();

		resize.setAttribute('dimension', 'width');
		await resize.updateComplete;

		if(resize.getAttribute('dimension') !== 'width'){
			cleanup(container);
			fail('dimension should update dynamically');
			return;
		}

		const bottomHandle = resize.shadowRoot.querySelector('#bottom');
		const bottomStyle = window.getComputedStyle(bottomHandle);

		if(bottomStyle.display !== 'none'){
			cleanup(container);
			fail('Bottom handle should be hidden after setting dimension="width"');
			return;
		}

		cleanup(container);
		pass('Dimension updates dynamically');
	}
};
