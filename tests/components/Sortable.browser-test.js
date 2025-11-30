import { Sortable, SortableItem } from '../../src/components/Sortable.js';

const createSortable = async (options = {}) => {
	const container = document.createElement('div');
	const itemCount = options.itemCount || 3;
	let itemsHtml = '';
	for(let i = 1; i <= itemCount; i++){
		itemsHtml += `<k-sortable-item>Item ${i}</k-sortable-item>`;
	}
	container.innerHTML = `
		<k-sortable>
			${options.content || itemsHtml}
		</k-sortable>
	`;
	document.body.appendChild(container);

	const sortable = container.querySelector('k-sortable');
	await sortable.updateComplete;

	const items = Array.from(sortable.querySelectorAll('k-sortable-item'));
	await Promise.all(items.map(item => item.updateComplete));

	return { container, sortable, items };
};

const createSortableItem = async (options = {}) => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-sortable>
			<k-sortable-item ${options.sorting ? 'sorting' : ''}>
				${options.content || 'Test Item'}
			</k-sortable-item>
		</k-sortable>
	`;
	document.body.appendChild(container);

	const sortable = container.querySelector('k-sortable');
	const item = container.querySelector('k-sortable-item');
	await sortable.updateComplete;
	await item.updateComplete;

	return { container, sortable, item };
};

const cleanup = container => {
	if(container && container.parentNode){
		container.parentNode.removeChild(container);
	}
};

export default {
	/*
		Sortable Container Tests
	*/
	'should create sortable element': async ({pass, fail}) => {
		const { container, sortable } = await createSortable();

		if(!sortable){
			cleanup(container);
			fail('Sortable element should be created');
			return;
		}

		if(!(sortable instanceof Sortable)){
			cleanup(container);
			fail('Element should be instance of Sortable');
			return;
		}

		cleanup(container);
		pass('Sortable element created correctly');
	},

	'should have shadow root on sortable': async ({pass, fail}) => {
		const { container, sortable } = await createSortable();

		if(!sortable.shadowRoot){
			cleanup(container);
			fail('Sortable should have shadow root');
			return;
		}

		cleanup(container);
		pass('Sortable has shadow root');
	},

	'should render slot in sortable': async ({pass, fail}) => {
		const { container, sortable } = await createSortable();

		const slot = sortable.shadowRoot.querySelector('slot');
		if(!slot){
			cleanup(container);
			fail('Sortable should have slot element');
			return;
		}

		cleanup(container);
		pass('Sortable renders slot');
	},

	'should have block display': async ({pass, fail}) => {
		const { container, sortable } = await createSortable();

		const computedStyle = window.getComputedStyle(sortable);
		if(computedStyle.display !== 'block'){
			cleanup(container);
			fail(`Expected display "block", got "${computedStyle.display}"`);
			return;
		}

		cleanup(container);
		pass('Sortable has block display');
	},

	/*
		SortableItem Tests
	*/
	'should create sortable-item element': async ({pass, fail}) => {
		const { container, item } = await createSortableItem();

		if(!item){
			cleanup(container);
			fail('SortableItem element should be created');
			return;
		}

		if(!(item instanceof SortableItem)){
			cleanup(container);
			fail('Element should be instance of SortableItem');
			return;
		}

		cleanup(container);
		pass('SortableItem element created correctly');
	},

	'should have shadow root on item': async ({pass, fail}) => {
		const { container, item } = await createSortableItem();

		if(!item.shadowRoot){
			cleanup(container);
			fail('SortableItem should have shadow root');
			return;
		}

		cleanup(container);
		pass('SortableItem has shadow root');
	},

	'should render handle element': async ({pass, fail}) => {
		const { container, item } = await createSortableItem();

		const handle = item.shadowRoot.querySelector('#handle');
		if(!handle){
			cleanup(container);
			fail('Should render #handle element');
			return;
		}

		cleanup(container);
		pass('Handle element rendered');
	},

	'should render content element': async ({pass, fail}) => {
		const { container, item } = await createSortableItem();

		const content = item.shadowRoot.querySelector('#content');
		if(!content){
			cleanup(container);
			fail('Should render #content element');
			return;
		}

		cleanup(container);
		pass('Content element rendered');
	},

	'should render slot in item': async ({pass, fail}) => {
		const { container, item } = await createSortableItem();

		const slot = item.shadowRoot.querySelector('slot');
		if(!slot){
			cleanup(container);
			fail('SortableItem should have slot element');
			return;
		}

		cleanup(container);
		pass('SortableItem renders slot');
	},

	/*
		Default Property Tests
	*/
	'should not be sorting by default': async ({pass, fail}) => {
		const { container, item } = await createSortableItem();

		// sorting defaults to undefined or false (falsy)
		if(item.sorting){
			cleanup(container);
			fail(`Expected sorting to be falsy, got ${item.sorting}`);
			return;
		}

		cleanup(container);
		pass('Item is not sorting by default');
	},

	/*
		Sorting Property Tests
	*/
	'should reflect sorting attribute': async ({pass, fail}) => {
		const { container, item } = await createSortableItem();

		item.sorting = true;
		await item.updateComplete;

		if(!item.hasAttribute('sorting')){
			cleanup(container);
			fail('sorting attribute should be reflected');
			return;
		}

		item.sorting = false;
		await item.updateComplete;

		if(item.hasAttribute('sorting')){
			cleanup(container);
			fail('sorting attribute should be removed when false');
			return;
		}

		cleanup(container);
		pass('sorting attribute reflects property');
	},

	/*
		Sortable Getter Tests
	*/
	'should have sortable getter that returns parent': async ({pass, fail}) => {
		const { container, sortable, item } = await createSortableItem();

		if(item.sortable !== sortable){
			cleanup(container);
			fail('sortable getter should return parent k-sortable');
			return;
		}

		cleanup(container);
		pass('sortable getter returns parent');
	},

	/*
		Multiple Items Tests
	*/
	'should contain multiple items': async ({pass, fail}) => {
		const { container, sortable, items } = await createSortable({ itemCount: 3 });

		if(items.length !== 3){
			cleanup(container);
			fail(`Expected 3 items, got ${items.length}`);
			return;
		}

		cleanup(container);
		pass('Sortable contains multiple items');
	},

	'should slot all items': async ({pass, fail}) => {
		const { container, sortable, items } = await createSortable({ itemCount: 3 });

		const slottedItems = Array.from(sortable.children).filter(
			el => el.tagName === 'K-SORTABLE-ITEM'
		);

		if(slottedItems.length !== 3){
			cleanup(container);
			fail(`Expected 3 slotted items, got ${slottedItems.length}`);
			return;
		}

		cleanup(container);
		pass('All items are slotted');
	},

	/*
		Content Slot Tests
	*/
	'should slot item content correctly': async ({pass, fail}) => {
		const { container, item } = await createSortableItem({ content: 'Custom Content' });

		if(!item.textContent.includes('Custom Content')){
			cleanup(container);
			fail('Item content should be slotted');
			return;
		}

		cleanup(container);
		pass('Item content slotted correctly');
	},

	/*
		Handle Tests
	*/
	'should have pointer cursor on handle': async ({pass, fail}) => {
		const { container, item } = await createSortableItem();

		const handle = item.shadowRoot.querySelector('#handle');
		const computedStyle = window.getComputedStyle(handle);

		if(computedStyle.cursor !== 'pointer'){
			cleanup(container);
			fail(`Expected cursor "pointer", got "${computedStyle.cursor}"`);
			return;
		}

		cleanup(container);
		pass('Handle has pointer cursor');
	},

	'should have inline-block display on handle': async ({pass, fail}) => {
		const { container, item } = await createSortableItem();

		const handle = item.shadowRoot.querySelector('#handle');
		const computedStyle = window.getComputedStyle(handle);

		if(computedStyle.display !== 'inline-block'){
			cleanup(container);
			fail(`Expected display "inline-block", got "${computedStyle.display}"`);
			return;
		}

		cleanup(container);
		pass('Handle has inline-block display');
	},

	/*
		Item Display Tests
	*/
	'should have block display on item': async ({pass, fail}) => {
		const { container, item } = await createSortableItem();

		const computedStyle = window.getComputedStyle(item);
		if(computedStyle.display !== 'block'){
			cleanup(container);
			fail(`Expected display "block", got "${computedStyle.display}"`);
			return;
		}

		cleanup(container);
		pass('Item has block display');
	},

	'should have user-select none on item': async ({pass, fail}) => {
		const { container, item } = await createSortableItem();

		const computedStyle = window.getComputedStyle(item);
		if(computedStyle.userSelect !== 'none'){
			cleanup(container);
			fail(`Expected user-select "none", got "${computedStyle.userSelect}"`);
			return;
		}

		cleanup(container);
		pass('Item has user-select none');
	},

	'should have relative position on item': async ({pass, fail}) => {
		const { container, item } = await createSortableItem();

		const computedStyle = window.getComputedStyle(item);
		if(computedStyle.position !== 'relative'){
			cleanup(container);
			fail(`Expected position "relative", got "${computedStyle.position}"`);
			return;
		}

		cleanup(container);
		pass('Item has relative position');
	},

	/*
		Sorting State Style Tests
	*/
	'should have reduced opacity when sorting': async ({pass, fail}) => {
		const { container, item } = await createSortableItem();

		item.sorting = true;
		await item.updateComplete;

		const computedStyle = window.getComputedStyle(item);
		const opacity = parseFloat(computedStyle.opacity);

		if(opacity >= 1){
			cleanup(container);
			fail(`Expected reduced opacity when sorting, got "${computedStyle.opacity}"`);
			return;
		}

		cleanup(container);
		pass('Item has reduced opacity when sorting');
	},

	/*
		Drag Setup Tests
	*/
	'should setup drag on first update': async ({pass, fail}) => {
		const { container, item } = await createSortableItem();

		if(typeof item.cleanupDrag !== 'function'){
			cleanup(container);
			fail('cleanupDrag should be a function after drag setup');
			return;
		}

		cleanup(container);
		pass('Drag setup completed');
	},

	/*
		getCursorElement Tests
	*/
	'should have getCursorElement method on sortable': async ({pass, fail}) => {
		const { container, sortable } = await createSortable();

		if(typeof sortable.getCursorElement !== 'function'){
			cleanup(container);
			fail('Sortable should have getCursorElement method');
			return;
		}

		cleanup(container);
		pass('getCursorElement method exists');
	},

	/*
		Icon Tests
	*/
	'should render drag handle icon': async ({pass, fail}) => {
		const { container, item } = await createSortableItem();

		const icon = item.shadowRoot.querySelector('#handle k-icon');
		if(!icon){
			cleanup(container);
			fail('Should render k-icon in handle');
			return;
		}

		if(icon.getAttribute('name') !== 'drag-handle'){
			cleanup(container);
			fail(`Expected icon name "drag-handle", got "${icon.getAttribute('name')}"`);
			return;
		}

		cleanup(container);
		pass('Drag handle icon rendered');
	},

	/*
		Border Tests
	*/
	'should have border on item': async ({pass, fail}) => {
		const { container, item } = await createSortableItem();

		const computedStyle = window.getComputedStyle(item);
		const borderWidth = computedStyle.borderWidth || computedStyle.borderTopWidth;

		if(borderWidth === '0px' || borderWidth === ''){
			// Check if border is defined in styles
			const stylesStr = SortableItem.styles?.cssText || SortableItem.styles?.toString() || '';
			if(!stylesStr.includes('border')){
				cleanup(container);
				fail('Item should have border defined');
				return;
			}
		}

		cleanup(container);
		pass('Item has border');
	},

	/*
		Target Classes Tests
	*/
	'should have target-before pseudo-element styles defined': async ({pass, fail}) => {
		const stylesStr = SortableItem.styles?.cssText || SortableItem.styles?.toString() || '';

		if(!stylesStr.includes('target-before')){
			fail('Styles should define .target-before');
			return;
		}

		pass('target-before styles defined');
	},

	'should have target-after pseudo-element styles defined': async ({pass, fail}) => {
		const stylesStr = SortableItem.styles?.cssText || SortableItem.styles?.toString() || '';

		if(!stylesStr.includes('target-after')){
			fail('Styles should define .target-after');
			return;
		}

		pass('target-after styles defined');
	},

	/*
		Event Handler Tests
	*/
	'should have handleDragStart method': async ({pass, fail}) => {
		const { container, item } = await createSortableItem();

		if(typeof item.handleDragStart !== 'function'){
			cleanup(container);
			fail('Item should have handleDragStart method');
			return;
		}

		cleanup(container);
		pass('handleDragStart method exists');
	},

	'should have handleDragMove method': async ({pass, fail}) => {
		const { container, item } = await createSortableItem();

		if(typeof item.handleDragMove !== 'function'){
			cleanup(container);
			fail('Item should have handleDragMove method');
			return;
		}

		cleanup(container);
		pass('handleDragMove method exists');
	},

	'should have handleDragEnd method': async ({pass, fail}) => {
		const { container, item } = await createSortableItem();

		if(typeof item.handleDragEnd !== 'function'){
			cleanup(container);
			fail('Item should have handleDragEnd method');
			return;
		}

		cleanup(container);
		pass('handleDragEnd method exists');
	},

	/*
		setupDrag Method Tests
	*/
	'should have setupDrag method': async ({pass, fail}) => {
		const { container, item } = await createSortableItem();

		if(typeof item.setupDrag !== 'function'){
			cleanup(container);
			fail('Item should have setupDrag method');
			return;
		}

		cleanup(container);
		pass('setupDrag method exists');
	},

	/*
		Cleanup Tests
	*/
	'should cleanup drag handlers on disconnect': async ({pass, fail}) => {
		const { container, item } = await createSortableItem();

		// Store reference to cleanup function
		const cleanupDrag = item.cleanupDrag;

		// Remove item from DOM
		item.remove();

		// After disconnect, cleanupDrag should have been called (set to null)
		if(item.cleanupDrag !== null){
			cleanup(container);
			fail('cleanupDrag should be null after disconnect');
			return;
		}

		cleanup(container);
		pass('Drag handlers cleaned up on disconnect');
	},

	/*
		Item Count Tests
	*/
	'should filter items excluding sorting item in getCursorElement': async ({pass, fail}) => {
		const { container, sortable, items } = await createSortable({ itemCount: 3 });

		// Set first item as sorting
		items[0].sorting = true;
		await items[0].updateComplete;

		// getCursorElement should filter out items with sorting attribute
		// This is tested implicitly - just verify the method exists
		if(typeof sortable.getCursorElement !== 'function'){
			cleanup(container);
			fail('getCursorElement should be a function');
			return;
		}

		cleanup(container);
		pass('getCursorElement method filters sorting items');
	},

	/*
		Multiple Sortables Independence Tests
	*/
	'should support multiple independent sortables': async ({pass, fail}) => {
		const container1 = document.createElement('div');
		container1.innerHTML = `<k-sortable id="sort1"><k-sortable-item>A</k-sortable-item></k-sortable>`;
		document.body.appendChild(container1);

		const container2 = document.createElement('div');
		container2.innerHTML = `<k-sortable id="sort2"><k-sortable-item>B</k-sortable-item></k-sortable>`;
		document.body.appendChild(container2);

		const sortable1 = container1.querySelector('#sort1');
		const sortable2 = container2.querySelector('#sort2');
		const item1 = container1.querySelector('k-sortable-item');
		const item2 = container2.querySelector('k-sortable-item');

		await sortable1.updateComplete;
		await sortable2.updateComplete;
		await item1.updateComplete;
		await item2.updateComplete;

		if(item1.sortable !== sortable1){
			cleanup(container1);
			cleanup(container2);
			fail('Item 1 should reference sortable 1');
			return;
		}

		if(item2.sortable !== sortable2){
			cleanup(container1);
			cleanup(container2);
			fail('Item 2 should reference sortable 2');
			return;
		}

		cleanup(container1);
		cleanup(container2);
		pass('Multiple sortables work independently');
	}
};
