import Split from '../../src/components/Split.js';

const createSplit = async (options = {}) => {
	const container = document.createElement('div');
	container.style.width = '800px';
	container.style.height = '400px';
	container.innerHTML = `
		<k-split ${options.stacked ? 'stacked' : ''} ${options.stackWidth ? `stack-width="${options.stackWidth}"` : ''} ${options.direction ? `direction="${options.direction}"` : ''}>
			<div id="left-content">Left Pane Content</div>
			<div slot="right" id="right-content">Right Pane Content</div>
		</k-split>
	`;
	document.body.appendChild(container);

	const split = container.querySelector('k-split');
	await split.updateComplete;

	return { container, split };
};

const cleanup = (container) => {
	if(container && container.parentNode){
		container.parentNode.removeChild(container);
	}
};

export default {
	/*
		Split Component Tests
	*/
	'should create split element': async ({pass, fail}) => {
		const { container, split } = await createSplit();

		if(!split){
			cleanup(container);
			fail('Split element should be created');
			return;
		}

		if(!(split instanceof Split)){
			cleanup(container);
			fail('Element should be instance of Split');
			return;
		}

		cleanup(container);
		pass('Split element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, split } = await createSplit();

		if(!split.shadowRoot){
			cleanup(container);
			fail('Split should have shadow root');
			return;
		}

		cleanup(container);
		pass('Split has shadow root');
	},

	'should have default resizing as false': async ({pass, fail}) => {
		const { container, split } = await createSplit();

		if(split.resizing !== false){
			cleanup(container);
			fail(`Expected resizing to be false, got ${split.resizing}`);
			return;
		}

		cleanup(container);
		pass('Default resizing is false');
	},

	'should have default stacked as false': async ({pass, fail}) => {
		const { container, split } = await createSplit();

		if(split.stacked !== false){
			cleanup(container);
			fail(`Expected stacked to be false, got ${split.stacked}`);
			return;
		}

		cleanup(container);
		pass('Default stacked is false');
	},

	'should have default stackWidth as 0': async ({pass, fail}) => {
		const { container, split } = await createSplit();

		if(split.stackWidth !== 0){
			cleanup(container);
			fail(`Expected stackWidth to be 0, got ${split.stackWidth}`);
			return;
		}

		cleanup(container);
		pass('Default stackWidth is 0');
	},

	'should render left pane': async ({pass, fail}) => {
		const { container, split } = await createSplit();

		const pane1 = split.shadowRoot.getElementById('pane-1');
		if(!pane1){
			cleanup(container);
			fail('Split should render pane-1');
			return;
		}

		if(!pane1.classList.contains('pane')){
			cleanup(container);
			fail('pane-1 should have pane class');
			return;
		}

		cleanup(container);
		pass('Split renders pane-1');
	},

	'should render right pane': async ({pass, fail}) => {
		const { container, split } = await createSplit();

		const pane2 = split.shadowRoot.getElementById('pane-2');
		if(!pane2){
			cleanup(container);
			fail('Split should render pane-2');
			return;
		}

		if(!pane2.classList.contains('pane')){
			cleanup(container);
			fail('pane-2 should have pane class');
			return;
		}

		cleanup(container);
		pass('Split renders pane-2');
	},

	'should render divider handle': async ({pass, fail}) => {
		const { container, split } = await createSplit();

		const handle = split.shadowRoot.getElementById('divider-handle');
		if(!handle){
			cleanup(container);
			fail('Split should render divider handle');
			return;
		}

		cleanup(container);
		pass('Split renders divider handle');
	},

	'should render divider border': async ({pass, fail}) => {
		const { container, split } = await createSplit();

		const border = split.shadowRoot.getElementById('divider-border');
		if(!border){
			cleanup(container);
			fail('Split should render divider border');
			return;
		}

		cleanup(container);
		pass('Split renders divider border');
	},

	'should render default slot for left content': async ({pass, fail}) => {
		const { container, split } = await createSplit();

		const pane1 = split.shadowRoot.getElementById('pane-1');
		const slot = pane1.querySelector('slot:not([name])');
		if(!slot){
			cleanup(container);
			fail('pane-1 should have default slot');
			return;
		}

		cleanup(container);
		pass('Split renders default slot for pane-1 content');
	},

	'should render named slot for right content': async ({pass, fail}) => {
		const { container, split } = await createSplit();

		const pane2 = split.shadowRoot.getElementById('pane-2');
		const slot = pane2.querySelector('slot[name="right"]');
		if(!slot){
			cleanup(container);
			fail('pane-2 should have named right slot');
			return;
		}

		cleanup(container);
		pass('Split renders named slot for pane-2 content');
	},

	'should slot left content correctly': async ({pass, fail}) => {
		const { container, split } = await createSplit();

		const leftContent = split.querySelector('#left-content');
		if(!leftContent){
			cleanup(container);
			fail('Left content should be slotted');
			return;
		}

		if(leftContent.textContent !== 'Left Pane Content'){
			cleanup(container);
			fail('Left content text should match');
			return;
		}

		cleanup(container);
		pass('Left content slotted correctly');
	},

	'should slot right content correctly': async ({pass, fail}) => {
		const { container, split } = await createSplit();

		const rightContent = split.querySelector('#right-content');
		if(!rightContent){
			cleanup(container);
			fail('Right content should be slotted');
			return;
		}

		if(rightContent.textContent !== 'Right Pane Content'){
			cleanup(container);
			fail('Right content text should match');
			return;
		}

		cleanup(container);
		pass('Right content slotted correctly');
	},

	'should have setSize method': async ({pass, fail}) => {
		const { container, split } = await createSplit();

		if(typeof split.setSize !== 'function'){
			cleanup(container);
			fail('Split should have setSize method');
			return;
		}

		cleanup(container);
		pass('Split has setSize method');
	},

	'setSize should set --pane_1_size CSS property': async ({pass, fail}) => {
		const { container, split } = await createSplit();

		split.setSize('300px');
		const pane1Size = split.style.getPropertyValue('--pane_1_size');

		if(pane1Size !== '300px'){
			cleanup(container);
			fail(`Expected --pane_1_size to be 300px, got ${pane1Size}`);
			return;
		}

		cleanup(container);
		pass('setSize sets --pane_1_size property');
	},

	'should have ew-resize cursor on divider handle': async ({pass, fail}) => {
		const { container, split } = await createSplit();

		const handle = split.shadowRoot.getElementById('divider-handle');
		const cursor = getComputedStyle(handle).cursor;

		if(cursor !== 'ew-resize'){
			cleanup(container);
			fail(`Expected cursor ew-resize, got ${cursor}`);
			return;
		}

		cleanup(container);
		pass('Divider handle has ew-resize cursor');
	},

	'should have flex display': async ({pass, fail}) => {
		const { container, split } = await createSplit();

		const display = getComputedStyle(split).display;

		if(display !== 'flex'){
			cleanup(container);
			fail(`Expected display flex, got ${display}`);
			return;
		}

		cleanup(container);
		pass('Split has flex display');
	},

	'should reflect resizing attribute': async ({pass, fail}) => {
		const { container, split } = await createSplit();

		if(split.hasAttribute('resizing')){
			cleanup(container);
			fail('Should not have resizing attribute initially');
			return;
		}

		split.resizing = true;
		await split.updateComplete;

		if(!split.hasAttribute('resizing')){
			cleanup(container);
			fail('Should have resizing attribute when resizing');
			return;
		}

		cleanup(container);
		pass('Resizing attribute reflects correctly');
	},

	'should reflect stacked attribute': async ({pass, fail}) => {
		const { container, split } = await createSplit();

		if(split.hasAttribute('stacked')){
			cleanup(container);
			fail('Should not have stacked attribute initially');
			return;
		}

		split.stacked = true;
		await split.updateComplete;

		if(!split.hasAttribute('stacked')){
			cleanup(container);
			fail('Should have stacked attribute when stacked');
			return;
		}

		cleanup(container);
		pass('Stacked attribute reflects correctly');
	},

	'should hide divider when stacked': async ({pass, fail}) => {
		const { container, split } = await createSplit({ stacked: true });

		const handle = split.shadowRoot.getElementById('divider-handle');
		const display = getComputedStyle(handle).display;

		if(display !== 'none'){
			cleanup(container);
			fail(`Expected divider display none when stacked, got ${display}`);
			return;
		}

		cleanup(container);
		pass('Divider is hidden when stacked');
	},

	'should have block display when stacked': async ({pass, fail}) => {
		const { container, split } = await createSplit({ stacked: true });

		const display = getComputedStyle(split).display;

		if(display !== 'block'){
			cleanup(container);
			fail(`Expected display block when stacked, got ${display}`);
			return;
		}

		cleanup(container);
		pass('Split has block display when stacked');
	},

	'should have setupDragHandler method': async ({pass, fail}) => {
		const { container, split } = await createSplit();

		if(typeof split.setupDragHandler !== 'function'){
			cleanup(container);
			fail('Split should have setupDragHandler method');
			return;
		}

		cleanup(container);
		pass('Split has setupDragHandler method');
	},

	'should have setupResizeObserver method': async ({pass, fail}) => {
		const { container, split } = await createSplit();

		if(typeof split.setupResizeObserver !== 'function'){
			cleanup(container);
			fail('Split should have setupResizeObserver method');
			return;
		}

		cleanup(container);
		pass('Split has setupResizeObserver method');
	},

	'should dispatch resizestart event on drag start': async ({pass, fail}) => {
		const { container, split } = await createSplit();

		let eventFired = false;
		let eventDetail = null;
		split.addEventListener('resizestart', (e) => {
			eventFired = true;
			eventDetail = e.detail;
		});

		split.handleDragStart();

		if(!eventFired){
			cleanup(container);
			fail('resizestart event should be dispatched');
			return;
		}

		if(typeof eventDetail.startSize !== 'number'){
			cleanup(container);
			fail('resizestart event should have startSize in detail');
			return;
		}

		cleanup(container);
		pass('resizestart event dispatched with correct detail');
	},

	'should dispatch resize event on drag': async ({pass, fail}) => {
		const { container, split } = await createSplit();

		let eventFired = false;
		let eventDetail = null;
		split.addEventListener('resize', (e) => {
			eventFired = true;
			eventDetail = e.detail;
		});

		split.handleDragStart();
		split.handleDrag({ x: 50, y: 0 });

		if(!eventFired){
			cleanup(container);
			fail('resize event should be dispatched');
			return;
		}

		if(!eventDetail.size){
			cleanup(container);
			fail('resize event should have size in detail');
			return;
		}

		cleanup(container);
		pass('resize event dispatched with correct detail');
	},

	'should dispatch resizeend event on drag end': async ({pass, fail}) => {
		const { container, split } = await createSplit();

		let eventFired = false;
		let eventDetail = null;
		split.addEventListener('resizeend', (e) => {
			eventFired = true;
			eventDetail = e.detail;
		});

		split.handleDragStart();
		split.handleDragEnd({ x: 50, y: 0 });

		if(!eventFired){
			cleanup(container);
			fail('resizeend event should be dispatched');
			return;
		}

		if(!eventDetail.size){
			cleanup(container);
			fail('resizeend event should have size in detail');
			return;
		}

		cleanup(container);
		pass('resizeend event dispatched with correct detail');
	},

	'should set resizing to true during drag': async ({pass, fail}) => {
		const { container, split } = await createSplit();

		split.handleDragStart();

		if(split.resizing !== true){
			cleanup(container);
			fail('resizing should be true during drag');
			return;
		}

		cleanup(container);
		pass('resizing is true during drag');
	},

	'should set resizing to false after drag end': async ({pass, fail}) => {
		const { container, split } = await createSplit();

		split.handleDragStart();
		split.handleDragEnd({ x: 50, y: 0 });

		if(split.resizing !== false){
			cleanup(container);
			fail('resizing should be false after drag end');
			return;
		}

		cleanup(container);
		pass('resizing is false after drag end');
	},

	'panes should have pointer-events none when resizing': async ({pass, fail}) => {
		const { container, split } = await createSplit();

		split.resizing = true;
		await split.updateComplete;

		const pane1 = split.shadowRoot.getElementById('pane-1');
		const pointerEvents = getComputedStyle(pane1).pointerEvents;

		if(pointerEvents !== 'none'){
			cleanup(container);
			fail(`Expected pointer-events none, got ${pointerEvents}`);
			return;
		}

		cleanup(container);
		pass('Panes have pointer-events none when resizing');
	},

	'panes should have user-select none when resizing': async ({pass, fail}) => {
		const { container, split } = await createSplit();

		split.resizing = true;
		await split.updateComplete;

		const pane1 = split.shadowRoot.getElementById('pane-1');
		const userSelect = getComputedStyle(pane1).userSelect;

		if(userSelect !== 'none'){
			cleanup(container);
			fail(`Expected user-select none, got ${userSelect}`);
			return;
		}

		cleanup(container);
		pass('Panes have user-select none when resizing');
	},

	'should cleanup drag handler on disconnect': async ({pass, fail}) => {
		const { container, split } = await createSplit();

		let cleanupCalled = false;
		split.dragCleanup = () => {
			cleanupCalled = true;
		};

		split.disconnectedCallback();

		if(!cleanupCalled){
			cleanup(container);
			fail('dragCleanup should be called on disconnect');
			return;
		}

		cleanup(container);
		pass('Drag cleanup called on disconnect');
	},

	'should cleanup resize observer on disconnect': async ({pass, fail}) => {
		const { container, split } = await createSplit();

		if(!split.resizeObserver){
			cleanup(container);
			fail('resizeObserver should exist');
			return;
		}

		split.disconnectedCallback();

		if(split.resizeObserver !== null){
			cleanup(container);
			fail('resizeObserver should be null after disconnect');
			return;
		}

		cleanup(container);
		pass('Resize observer cleaned up on disconnect');
	},

	'should accept stack-width attribute': async ({pass, fail}) => {
		const { container, split } = await createSplit({ stackWidth: 600 });

		if(split.stackWidth !== 600){
			cleanup(container);
			fail(`Expected stackWidth 600, got ${split.stackWidth}`);
			return;
		}

		cleanup(container);
		pass('Stack-width attribute accepted');
	},

	'should update size during drag': async ({pass, fail}) => {
		const { container, split } = await createSplit();

		split.handleDragStart();
		const startSize = split.dragStartSize;
		split.handleDrag({ x: 100, y: 0 });

		const pane1Size = split.style.getPropertyValue('--pane_1_size');
		const expectedSize = `${startSize + 100}px`;

		if(pane1Size !== expectedSize){
			cleanup(container);
			fail(`Expected --pane_1_size ${expectedSize}, got ${pane1Size}`);
			return;
		}

		cleanup(container);
		pass('Size updates during drag');
	},

	'should have default direction as horizontal': async ({pass, fail}) => {
		const { container, split } = await createSplit();

		if(split.direction !== 'horizontal'){
			cleanup(container);
			fail(`Expected direction to be horizontal, got ${split.direction}`);
			return;
		}

		cleanup(container);
		pass('Default direction is horizontal');
	},

	'should accept direction="vertical" attribute': async ({pass, fail}) => {
		const { container, split } = await createSplit({ direction: 'vertical' });

		if(split.direction !== 'vertical'){
			cleanup(container);
			fail(`Expected direction to be vertical, got ${split.direction}`);
			return;
		}

		if(!split.hasAttribute('direction') || split.getAttribute('direction') !== 'vertical'){
			cleanup(container);
			fail('direction attribute should be reflected as vertical');
			return;
		}

		cleanup(container);
		pass('direction="vertical" attribute accepted and reflected');
	},

	'should have ns-resize cursor on divider handle when vertical': async ({pass, fail}) => {
		const { container, split } = await createSplit({ direction: 'vertical' });

		const handle = split.shadowRoot.getElementById('divider-handle');
		const cursor = getComputedStyle(handle).cursor;

		if(cursor !== 'ns-resize'){
			cleanup(container);
			fail(`Expected cursor ns-resize for vertical split, got ${cursor}`);
			return;
		}

		cleanup(container);
		pass('Divider handle has ns-resize cursor in vertical mode');
	},

	'setSize should set --pane_1_size CSS property in vertical mode': async ({pass, fail}) => {
		const { container, split } = await createSplit({ direction: 'vertical' });

		split.setSize('200px');
		const pane1Size = split.style.getPropertyValue('--pane_1_size');

		if(pane1Size !== '200px'){
			cleanup(container);
			fail(`Expected --pane_1_size to be 200px, got ${pane1Size}`);
			return;
		}

		cleanup(container);
		pass('setSize sets --pane_1_size property in vertical mode');
	},

	'should update size during vertical drag': async ({pass, fail}) => {
		const { container, split } = await createSplit({ direction: 'vertical' });

		split.handleDragStart();
		const startSize = split.dragStartSize;
		split.handleDrag({ x: 0, y: 80 });

		const pane1Size = split.style.getPropertyValue('--pane_1_size');
		const expectedSize = `${startSize + 80}px`;

		if(pane1Size !== expectedSize){
			cleanup(container);
			fail(`Expected --pane_1_size ${expectedSize}, got ${pane1Size}`);
			return;
		}

		cleanup(container);
		pass('Size updates during vertical drag');
	}
};
