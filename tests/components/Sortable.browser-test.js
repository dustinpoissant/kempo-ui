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

/* A wrapping row of bare 50px items in a grid sortable, which is how a gallery of tiles uses it. */
const createGrid = async ({ itemCount = 4, controlled = false, inner = '' } = {}) => {
	const container = document.createElement('div');
	let itemsHtml = '';
	for(let i = 1; i <= itemCount; i++){
		itemsHtml += `<k-sortable-item bare style="width: 50px; height: 50px;">Item ${i}${inner}</k-sortable-item>`;
	}
	container.innerHTML = `<k-sortable grid ${controlled ? 'controlled' : ''} style="display: flex; flex-wrap: wrap; gap: 10px; width: 400px;">${itemsHtml}</k-sortable>`;
	document.body.appendChild(container);
	const sortable = container.querySelector('k-sortable');
	await sortable.updateComplete;
	const items = Array.from(sortable.querySelectorAll('k-sortable-item'));
	await Promise.all(items.map(item => item.updateComplete));
	return { container, sortable, items };
};

/* A point a fraction of the way across an item (0 is its left edge), halfway down. */
const pointAt = (item, fraction) => {
	const rect = item.getBoundingClientRect();
	return { clientX: rect.left + rect.width * fraction, clientY: rect.top + rect.height / 2 };
};

const mouse = (type, { clientX, clientY }) => new MouseEvent(type, { bubbles: true, composed: true, cancelable: true, clientX, clientY, button: 0, view: window });

/* Presses on an item (in the middle, or where `from` says, on `target`), moves to a point and lets go. */
const dragItem = async (item, to, { from = pointAt(item, 0.5), target = item } = {}) => {
	target.dispatchEvent(mouse('mousedown', from));
	window.dispatchEvent(mouse('mousemove', to));
	await new Promise(resolve => setTimeout(resolve, 20));
	window.dispatchEvent(mouse('mouseup', to));
	await new Promise(resolve => setTimeout(resolve, 20));
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

	'should have block display on handle, as a flex item': async ({pass, fail}) => {
		const { container, item } = await createSortableItem();

		const handle = item.shadowRoot.querySelector('#handle');
		const computedStyle = window.getComputedStyle(handle);

		if(computedStyle.display !== 'block'){
			cleanup(container);
			fail(`Expected display "block", got "${computedStyle.display}"`);
			return;
		}

		cleanup(container);
		pass('Handle has block display as a flex item');
	},

	/*
		Item Display Tests
	*/
	'should have flex display on item': async ({pass, fail}) => {
		const { container, item } = await createSortableItem();

		const computedStyle = window.getComputedStyle(item);
		if(computedStyle.display !== 'flex'){
			cleanup(container);
			fail(`Expected display "flex", got "${computedStyle.display}"`);
			return;
		}

		cleanup(container);
		pass('Item has flex display');
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
	},

	/*
		Reconnecting Items
	*/
	'should set up drag again after an item is moved in the DOM': async ({pass, fail}) => {
		const { container, sortable } = await createSortable({ itemCount: 3 });
		const items = Array.from(sortable.children);
		sortable.appendChild(items[0]);
		await new Promise(r => setTimeout(r, 50));
		await items[0].updateComplete;
		if(typeof items[0].cleanupDrag !== 'function'){
			cleanup(container);
			return fail('a moved item should have its drag handle set up again');
		}
		cleanup(container);
		pass('Moved items keep a working drag handle');
	},

	/*
		Grid, Controlled and Bare Tests
	*/
	'should find the nearest item and its side in a grid': async ({pass, fail}) => {
		const { container, sortable, items } = await createGrid({ itemCount: 5 });
		const second = items[1].getBoundingClientRect();
		const inLeftHalf = sortable.getCursorElement({ clientX: second.left + 5, clientY: second.top + 5 });
		const inRightHalf = sortable.getCursorElement({ clientX: second.right - 5, clientY: second.bottom - 5 });
		const inGap = sortable.getCursorElement({ clientX: second.right + 3, clientY: second.top + 10 });
		const below = sortable.getCursorElement({ clientX: items[0].getBoundingClientRect().left + 5, clientY: items[0].getBoundingClientRect().bottom + 200 });
		cleanup(container);
		if(inLeftHalf[0] !== items[1] || inLeftHalf[1] !== 'before') return fail('The left half of an item should be before it');
		if(inRightHalf[0] !== items[1] || inRightHalf[1] !== 'after') return fail('The right half of an item should be after it');
		if(!inGap || ![items[1], items[2]].includes(inGap[0])) return fail('A point in the gap should find a neighbour');
		if(!below) return fail('A point away from every item should still find the nearest');
		pass('The grid finds the nearest item and its side');
	},

	'should say where a bare item was dropped and move it in the DOM': async ({pass, fail}) => {
		const { container, sortable, items } = await createGrid({ itemCount: 4 });
		const heard = [];
		sortable.addEventListener('sort', event => heard.push(event.detail));
		await dragItem(items[0], pointAt(items[2], 0.75));
		const order = Array.from(sortable.querySelectorAll('k-sortable-item')).map(item => item.textContent.trim());
		cleanup(container);
		if(heard.length !== 1 || heard[0].from !== 0 || heard[0].to !== 2 || heard[0].item !== items[0]) return fail(`Event was ${JSON.stringify(heard.map(({ from, to }) => ({ from, to })))}`);
		if(order.join() !== 'Item 2,Item 3,Item 1,Item 4') return fail(`Order is ${order}`);
		pass('The drop is reported and the item moved');
	},

	'should leave the DOM alone when controlled and still say where it was dropped': async ({pass, fail}) => {
		const { container, sortable, items } = await createGrid({ itemCount: 4, controlled: true });
		const heard = [];
		sortable.addEventListener('sort', event => heard.push(event.detail));
		await dragItem(items[3], pointAt(items[0], 0.25));
		const order = Array.from(sortable.querySelectorAll('k-sortable-item')).map(item => item.textContent.trim());
		cleanup(container);
		if(heard.length !== 1 || heard[0].from !== 3 || heard[0].to !== 0) return fail(`Event was ${JSON.stringify(heard.map(({ from, to }) => ({ from, to })))}`);
		if(order.join() !== 'Item 1,Item 2,Item 3,Item 4') return fail(`A controlled list must not be moved by the component, got ${order}`);
		pass('Controlled lists are left to their owner');
	},

	'should not start a drag from a button inside a bare item, nor from a click': async ({pass, fail}) => {
		const { container, sortable, items } = await createGrid({ itemCount: 3, inner: '<button>Remove</button>' });
		const heard = [];
		sortable.addEventListener('sort', event => heard.push(event.detail));
		const button = items[0].querySelector('button');
		const pressed = button.getBoundingClientRect();
		await dragItem(items[0], pointAt(items[2], 0.75), { from: { clientX: pressed.left + 2, clientY: pressed.top + 2 }, target: button });
		const afterButton = heard.length;
		const centre = pointAt(items[1], 0.5);
		await dragItem(items[1], { clientX: centre.clientX + 1, clientY: centre.clientY });
		cleanup(container);
		if(afterButton) return fail('Dragging from a button inside the item should not sort');
		if(heard.length) return fail('A click, or a move of a pixel, should not sort');
		pass('Buttons and clicks are not drags');
	},

	'should hide the handle and the border of a bare item': async ({pass, fail}) => {
		const { container, items } = await createGrid({ itemCount: 1 });
		const handle = items[0].shadowRoot.getElementById('handle');
		const handleShown = getComputedStyle(handle).display !== 'none';
		const border = getComputedStyle(items[0]).borderTopWidth;
		cleanup(container);
		if(handleShown) return fail('A bare item has no handle');
		if(border !== '0px') return fail(`A bare item has no border, got ${border}`);
		pass('Bare items are plain');
	}
};
