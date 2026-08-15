import CardGrid from '../../src/components/CardGrid.js';

const sampleRecords = [
	{ id: 1, name: 'Alice', age: 30, city: 'New York' },
	{ id: 2, name: 'Bob', age: 25, city: 'Los Angeles' },
	{ id: 3, name: 'Charlie', age: 35, city: 'Chicago' },
	{ id: 4, name: 'Diana', age: 28, city: 'Houston' },
	{ id: 5, name: 'Eve', age: 32, city: 'Phoenix' }
];

const sampleCardTemplate = record => `${record.name} (${record.age})`;

const createCardGrid = async (config = {}) => {
	const grid = document.createElement('k-card-grid');
	Object.assign(grid, config);
	document.body.appendChild(grid);
	await grid.updateComplete;
	return grid;
};

const cleanup = (grid) => {
	if(grid && grid.parentNode){
		grid.parentNode.removeChild(grid);
	}
};

/*
	Initialization Tests
*/
export default {
	'should create card-grid element': async ({pass, fail}) => {
		const grid = await createCardGrid();

		if(!(grid instanceof CardGrid)){
			cleanup(grid);
			fail('Element should be instance of CardGrid');
			return;
		}

		cleanup(grid);
		pass('CardGrid element created successfully');
	},

	'should set controlled attribute on connect': async ({pass, fail}) => {
		const grid = await createCardGrid();

		if(!grid.hasAttribute('controlled')){
			cleanup(grid);
			fail('CardGrid should set the controlled attribute on connect, same as Table');
			return;
		}

		cleanup(grid);
		pass('controlled attribute set on connect');
	},

	'should have default properties': async ({pass, fail}) => {
		const grid = await createCardGrid();

		if(grid.pageSize !== 50){
			cleanup(grid);
			fail('pageSize should default to 50');
			return;
		}

		if(grid.currentPage !== 1){
			cleanup(grid);
			fail('currentPage should default to 1');
			return;
		}

		if(!Array.isArray(grid.pageSizeOptions)){
			cleanup(grid);
			fail('pageSizeOptions should be an array');
			return;
		}

		if(grid.minCardWidth !== '11rem'){
			cleanup(grid);
			fail(`minCardWidth should default to '11rem', got '${grid.minCardWidth}'`);
			return;
		}

		cleanup(grid);
		pass('CardGrid has correct default properties');
	},

	/*
		Data Management Tests
	*/
	'should set data with cardTemplate and records': async ({pass, fail}) => {
		const grid = await createCardGrid();

		grid.setData({
			cardTemplate: sampleCardTemplate,
			records: [...sampleRecords]
		});
		await grid.updateComplete;

		if(typeof grid.cardTemplate !== 'function'){
			cleanup(grid);
			fail('cardTemplate should be set as a function');
			return;
		}

		if(grid.records.length !== 5){
			cleanup(grid);
			fail(`Expected 5 records, got ${grid.records.length}`);
			return;
		}

		cleanup(grid);
		pass('setData correctly sets cardTemplate and records');
	},

	'should set records with setRecords': async ({pass, fail}) => {
		const grid = await createCardGrid();

		grid.setRecords([...sampleRecords]);
		await grid.updateComplete;

		if(grid.records.length !== 5){
			cleanup(grid);
			fail(`Expected 5 records, got ${grid.records.length}`);
			return;
		}

		cleanup(grid);
		pass('setRecords correctly sets records');
	},

	'should add record': async ({pass, fail}) => {
		const grid = await createCardGrid();
		grid.setRecords([...sampleRecords]);

		const newRecord = { id: 6, name: 'Frank', age: 40, city: 'Seattle' };
		grid.addRecord(newRecord);
		await grid.updateComplete;

		if(grid.records.length !== 6){
			cleanup(grid);
			fail(`Expected 6 records after adding, got ${grid.records.length}`);
			return;
		}

		const lastRecord = grid.records[grid.records.length - 1];
		if(lastRecord.name !== 'Frank'){
			cleanup(grid);
			fail('New record should be added at the end');
			return;
		}

		cleanup(grid);
		pass('addRecord correctly adds new record');
	},

	'should update record': async ({pass, fail}) => {
		const grid = await createCardGrid();
		grid.setRecords([...sampleRecords]);

		grid.updateRecord(grid.records[0], { name: 'Alice Updated' });
		await grid.updateComplete;

		if(grid.records[0].name !== 'Alice Updated'){
			cleanup(grid);
			fail('Record should be updated');
			return;
		}

		cleanup(grid);
		pass('updateRecord correctly updates record');
	},

	'should delete record': async ({pass, fail}) => {
		const grid = await createCardGrid();
		grid.setRecords([...sampleRecords]);

		const recordToDelete = grid.records[0];
		grid.deleteRecord(recordToDelete);
		await grid.updateComplete;

		if(grid.records.length !== 4){
			cleanup(grid);
			fail(`Expected 4 records after deletion, got ${grid.records.length}`);
			return;
		}

		if(grid.records.find(r => r.id === 1)){
			cleanup(grid);
			fail('Deleted record should not exist');
			return;
		}

		cleanup(grid);
		pass('deleteRecord correctly removes record');
	},

	/*
		Pagination Tests
	*/
	'should get current page': async ({pass, fail}) => {
		const grid = await createCardGrid();
		grid.setRecords([...sampleRecords]);

		if(grid.getCurrentPage() !== 1){
			cleanup(grid);
			fail('Initial page should be 1');
			return;
		}

		cleanup(grid);
		pass('getCurrentPage returns correct value');
	},

	'should set page': async ({pass, fail}) => {
		const grid = await createCardGrid();
		grid.setRecords([...sampleRecords]);
		grid.pageSize = 2;
		await grid.updateComplete;

		grid.setPage(2);
		await grid.updateComplete;

		if(grid.getCurrentPage() !== 2){
			cleanup(grid);
			fail('Page should be 2 after setPage(2)');
			return;
		}

		cleanup(grid);
		pass('setPage correctly changes page');
	},

	'should navigate with nextPage': async ({pass, fail}) => {
		const grid = await createCardGrid();
		grid.setRecords([...sampleRecords]);
		grid.pageSize = 2;
		await grid.updateComplete;

		grid.nextPage();
		await grid.updateComplete;

		if(grid.getCurrentPage() !== 2){
			cleanup(grid);
			fail('nextPage should go to page 2');
			return;
		}

		cleanup(grid);
		pass('nextPage correctly advances page');
	},

	'should navigate with prevPage': async ({pass, fail}) => {
		const grid = await createCardGrid();
		grid.setRecords([...sampleRecords]);
		grid.pageSize = 2;
		grid.currentPage = 3;
		await grid.updateComplete;

		grid.prevPage();
		await grid.updateComplete;

		if(grid.getCurrentPage() !== 2){
			cleanup(grid);
			fail('prevPage should go to page 2');
			return;
		}

		cleanup(grid);
		pass('prevPage correctly goes back');
	},

	'should navigate with firstPage': async ({pass, fail}) => {
		const grid = await createCardGrid();
		grid.setRecords([...sampleRecords]);
		grid.pageSize = 2;
		grid.currentPage = 3;
		await grid.updateComplete;

		grid.firstPage();
		await grid.updateComplete;

		if(grid.getCurrentPage() !== 1){
			cleanup(grid);
			fail('firstPage should go to page 1');
			return;
		}

		cleanup(grid);
		pass('firstPage correctly goes to first page');
	},

	'should navigate with lastPage': async ({pass, fail}) => {
		const grid = await createCardGrid();
		grid.setRecords([...sampleRecords]);
		grid.pageSize = 2;
		await grid.updateComplete;

		grid.lastPage();
		await grid.updateComplete;

		if(grid.getCurrentPage() !== 3){
			cleanup(grid);
			fail('lastPage should go to page 3');
			return;
		}

		cleanup(grid);
		pass('lastPage correctly goes to last page');
	},

	'should calculate total pages': async ({pass, fail}) => {
		const grid = await createCardGrid();
		grid.setRecords([...sampleRecords]);
		grid.pageSize = 2;
		await grid.updateComplete;

		if(grid.getTotalPages() !== 3){
			cleanup(grid);
			fail(`Expected 3 total pages, got ${grid.getTotalPages()}`);
			return;
		}

		cleanup(grid);
		pass('getTotalPages returns correct count');
	},

	'should get page size': async ({pass, fail}) => {
		const grid = await createCardGrid();
		grid.pageSize = 25;
		await grid.updateComplete;

		if(grid.getPageSize() !== 25){
			cleanup(grid);
			fail('getPageSize should return 25');
			return;
		}

		cleanup(grid);
		pass('getPageSize returns correct value');
	},

	'should set page size': async ({pass, fail}) => {
		const grid = await createCardGrid();
		grid.setRecords([...sampleRecords]);

		grid.setPageSize(2);
		await grid.updateComplete;

		if(grid.pageSize !== 2){
			cleanup(grid);
			fail('pageSize should be 2 after setPageSize');
			return;
		}

		cleanup(grid);
		pass('setPageSize correctly changes page size');
	},

	/*
		Selection Tests — the part that has to match Table exactly, since this is what makes a
		Table-authored control (Tc*) work against a CardGrid host unmodified.
	*/
	'should select all on page': async ({pass, fail}) => {
		const grid = await createCardGrid();
		grid.enableSelection = true;
		grid.setRecords([...sampleRecords]);
		grid.pageSize = 2;
		await grid.updateComplete;

		grid.selectAllOnPage();
		await grid.updateComplete;

		const selected = grid.getSelectedRecords();

		if(selected.length !== 2){
			cleanup(grid);
			fail(`Expected 2 selected records on page, got ${selected.length}`);
			return;
		}

		cleanup(grid);
		pass('selectAllOnPage correctly selects page records');
	},

	'should deselect all on page': async ({pass, fail}) => {
		const grid = await createCardGrid();
		grid.enableSelection = true;
		grid.setRecords([...sampleRecords]);
		grid.pageSize = 2;
		grid.selectAllOnPage();
		await grid.updateComplete;

		grid.deselectAllOnPage();
		await grid.updateComplete;

		const selected = grid.getSelectedRecords();

		if(selected.length !== 0){
			cleanup(grid);
			fail('All records on page should be deselected');
			return;
		}

		cleanup(grid);
		pass('deselectAllOnPage correctly deselects page records');
	},

	'should report allOnPageSelected': async ({pass, fail}) => {
		const grid = await createCardGrid();
		grid.enableSelection = true;
		grid.setRecords([...sampleRecords]);
		grid.pageSize = 2;
		await grid.updateComplete;

		if(grid.allOnPageSelected()){
			cleanup(grid);
			fail('allOnPageSelected should be false before selecting anything');
			return;
		}

		grid.selectAllOnPage();
		await grid.updateComplete;

		if(!grid.allOnPageSelected()){
			cleanup(grid);
			fail('allOnPageSelected should be true after selectAllOnPage');
			return;
		}

		cleanup(grid);
		pass('allOnPageSelected reflects current selection state');
	},

	'should get selected records': async ({pass, fail}) => {
		const grid = await createCardGrid();
		grid.enableSelection = true;
		grid.pageSize = 2;
		grid.setRecords([...sampleRecords]);
		grid.selectAllOnPage();
		await grid.updateComplete;

		const selected = grid.getSelectedRecords();

		if(selected.length !== 2){
			cleanup(grid);
			fail(`Expected 2 selected records, got ${selected.length}`);
			return;
		}

		cleanup(grid);
		pass('getSelectedRecords returns correct records');
	},

	'should delete selected records': async ({pass, fail}) => {
		const grid = await createCardGrid();
		grid.enableSelection = true;
		grid.pageSize = 2;
		grid.setRecords([...sampleRecords]);
		grid.selectAllOnPage();
		await grid.updateComplete;

		grid.deleteSelected();
		await grid.updateComplete;

		if(grid.records.length !== 3){
			cleanup(grid);
			fail(`Expected 3 records after deletion, got ${grid.records.length}`);
			return;
		}

		cleanup(grid);
		pass('deleteSelected correctly removes selected records');
	},

	'should toggle selection via the rendered checkbox': async ({pass, fail}) => {
		const grid = await createCardGrid();
		grid.enableSelection = true;
		grid.setData({ records: [...sampleRecords], cardTemplate: sampleCardTemplate });
		await grid.updateComplete;

		const checkbox = grid.shadowRoot.querySelector('.tile .card-select');
		if(!checkbox){
			cleanup(grid);
			fail('Expected a .card-select checkbox inside the first tile when enableSelection is true');
			return;
		}

		checkbox.checked = true;
		checkbox.dispatchEvent(new Event('change'));
		await grid.updateComplete;

		if(grid.getSelectedRecords().length !== 1){
			cleanup(grid);
			fail('Checking the rendered checkbox should select its record');
			return;
		}

		cleanup(grid);
		pass('Rendered checkbox toggles record selection');
	},

	'should not render checkboxes when enableSelection is false': async ({pass, fail}) => {
		const grid = await createCardGrid();
		grid.setData({ records: [...sampleRecords], cardTemplate: sampleCardTemplate });
		await grid.updateComplete;

		const checkbox = grid.shadowRoot.querySelector('.card-select');
		if(checkbox){
			cleanup(grid);
			fail('No checkbox should render when enableSelection is false');
			return;
		}

		cleanup(grid);
		pass('No selection checkboxes rendered without enableSelection');
	},

	/*
		Record Visibility Tests
	*/
	'should hide record': async ({pass, fail}) => {
		const grid = await createCardGrid();
		grid.setRecords([...sampleRecords]);
		await grid.updateComplete;

		grid.hideRecord(grid.records[0]);
		await grid.updateComplete;

		const hiddenRecords = grid.getHiddenRecords();

		if(hiddenRecords.length !== 1){
			cleanup(grid);
			fail(`Expected 1 hidden record, got ${hiddenRecords.length}`);
			return;
		}

		cleanup(grid);
		pass('hideRecord correctly hides record');
	},

	'should show record': async ({pass, fail}) => {
		const grid = await createCardGrid();
		grid.setRecords([...sampleRecords]);
		grid.hideRecord(grid.records[0]);
		await grid.updateComplete;

		grid.showRecord(grid.records[0]);
		await grid.updateComplete;

		const hiddenRecords = grid.getHiddenRecords();

		if(hiddenRecords.length !== 0){
			cleanup(grid);
			fail('No records should be hidden');
			return;
		}

		cleanup(grid);
		pass('showRecord correctly shows record');
	},

	'should show all records': async ({pass, fail}) => {
		const grid = await createCardGrid();
		grid.setRecords([...sampleRecords]);
		grid.hideRecord(grid.records[0]);
		grid.hideRecord(grid.records[1]);
		await grid.updateComplete;

		grid.showAllRecords();
		await grid.updateComplete;

		const hiddenRecords = grid.getHiddenRecords();

		if(hiddenRecords.length !== 0){
			cleanup(grid);
			fail('No records should be hidden after showAllRecords');
			return;
		}

		cleanup(grid);
		pass('showAllRecords correctly shows all records');
	},

	'should get displayed records': async ({pass, fail}) => {
		const grid = await createCardGrid();
		grid.setRecords([...sampleRecords]);
		grid.hideRecord(grid.records[0]);
		await grid.updateComplete;

		const visibleRecords = grid.getDisplayedRecords();

		if(visibleRecords.length !== 4){
			cleanup(grid);
			fail(`Expected 4 visible records, got ${visibleRecords.length}`);
			return;
		}

		cleanup(grid);
		pass('getDisplayedRecords returns correct records');
	},

	/*
		Rendering Tests
	*/
	'should render one tile per record using cardTemplate': async ({pass, fail}) => {
		const grid = await createCardGrid();
		grid.setData({ records: [...sampleRecords], cardTemplate: sampleCardTemplate });
		await grid.updateComplete;

		const tiles = grid.shadowRoot.querySelectorAll('.tile');
		if(tiles.length !== 5){
			cleanup(grid);
			fail(`Expected 5 tiles, got ${tiles.length}`);
			return;
		}

		if(!tiles[0].textContent.includes('Alice (30)')){
			cleanup(grid);
			fail(`Expected first tile to render cardTemplate output, got '${tiles[0].textContent}'`);
			return;
		}

		cleanup(grid);
		pass('cardTemplate renders inside each tile');
	},

	'should clone a slot="before" control into every tile': async ({pass, fail}) => {
		const grid = await createCardGrid();
		const template = document.createElement('button');
		template.setAttribute('slot', 'before');
		template.setAttribute('data-kind', 'edit');
		grid.appendChild(template);
		grid.setData({ records: [...sampleRecords], cardTemplate: sampleCardTemplate });
		await grid.updateComplete;

		const clones = grid.shadowRoot.querySelectorAll('.tile-controls-before button[data-kind="edit"]');
		if(clones.length !== 5){
			cleanup(grid);
			fail(`Expected 5 cloned before-controls (one per tile), got ${clones.length}`);
			return;
		}

		cleanup(grid);
		pass('slot="before" control cloned into every tile');
	},

	'should clone a slot="after" control into every tile': async ({pass, fail}) => {
		const grid = await createCardGrid();
		const template = document.createElement('button');
		template.setAttribute('slot', 'after');
		template.setAttribute('data-kind', 'delete');
		grid.appendChild(template);
		grid.setData({ records: [...sampleRecords], cardTemplate: sampleCardTemplate });
		await grid.updateComplete;

		const clones = grid.shadowRoot.querySelectorAll('.tile-controls-after button[data-kind="delete"]');
		if(clones.length !== 5){
			cleanup(grid);
			fail(`Expected 5 cloned after-controls (one per tile), got ${clones.length}`);
			return;
		}

		cleanup(grid);
		pass('slot="after" control cloned into every tile');
	},

	'should not render before/after wrappers when no matching slotted control exists': async ({pass, fail}) => {
		const grid = await createCardGrid();
		grid.setData({ records: [...sampleRecords], cardTemplate: sampleCardTemplate });
		await grid.updateComplete;

		if(grid.shadowRoot.querySelector('.tile-controls-before') || grid.shadowRoot.querySelector('.tile-controls-after')){
			cleanup(grid);
			fail('No tile-controls wrapper should render without a slot="before"/"after" child');
			return;
		}

		cleanup(grid);
		pass('No before/after wrapper rendered without slotted controls');
	},

	/*
		Event Tests
	*/
	'should dispatch pageChange event': async ({pass, fail}) => {
		const grid = await createCardGrid();
		grid.setRecords([...sampleRecords]);
		grid.pageSize = 2;
		await grid.updateComplete;

		let eventFired = false;
		grid.addEventListener('pageChange', () => { eventFired = true; });

		grid.nextPage();
		await grid.updateComplete;

		if(!eventFired){
			cleanup(grid);
			fail('pageChange event should be dispatched');
			return;
		}

		cleanup(grid);
		pass('pageChange event dispatched correctly');
	},

	'should dispatch pageSizeChange event': async ({pass, fail}) => {
		const grid = await createCardGrid();
		grid.setRecords([...sampleRecords]);
		await grid.updateComplete;

		let eventFired = false;
		grid.addEventListener('pageSizeChange', () => { eventFired = true; });

		grid.setPageSize(25);
		await grid.updateComplete;

		if(!eventFired){
			cleanup(grid);
			fail('pageSizeChange event should be dispatched');
			return;
		}

		cleanup(grid);
		pass('pageSizeChange event dispatched correctly');
	},

	'should dispatch selectionChange event': async ({pass, fail}) => {
		const grid = await createCardGrid();
		grid.enableSelection = true;
		grid.setRecords([...sampleRecords]);
		await grid.updateComplete;

		let eventFired = false;
		grid.addEventListener('selectionChange', () => { eventFired = true; });

		grid.selectAllOnPage();
		await grid.updateComplete;

		// selectionChange is dispatched asynchronously from selectAllOnPage/deselectAllOnPage
		await new Promise(resolve => setTimeout(resolve, 50));

		if(!eventFired){
			cleanup(grid);
			fail('selectionChange event should be dispatched');
			return;
		}

		cleanup(grid);
		pass('selectionChange event dispatched correctly');
	},

	'should dispatch recordDeleted event': async ({pass, fail}) => {
		const grid = await createCardGrid();
		grid.setRecords([...sampleRecords]);
		await grid.updateComplete;

		let eventFired = false;
		let eventDetail = null;
		grid.addEventListener('recordDeleted', (e) => {
			eventFired = true;
			eventDetail = e.detail;
		});

		const recordToDelete = grid.records[0];
		grid.deleteRecord(recordToDelete);
		await grid.updateComplete;

		if(!eventFired){
			cleanup(grid);
			fail('recordDeleted event should be dispatched');
			return;
		}

		if(eventDetail === null || eventDetail.index !== 0){
			cleanup(grid);
			fail(`recordDeleted event should include index in detail, got ${JSON.stringify(eventDetail)}`);
			return;
		}

		cleanup(grid);
		pass('recordDeleted event dispatched correctly');
	},

	'should dispatch recordAdded event': async ({pass, fail}) => {
		const grid = await createCardGrid();
		grid.setRecords([...sampleRecords]);
		await grid.updateComplete;

		let eventFired = false;
		grid.addEventListener('recordAdded', () => { eventFired = true; });

		grid.addRecord({ id: 6, name: 'Frank', age: 40, city: 'Seattle' });
		await grid.updateComplete;

		if(!eventFired){
			cleanup(grid);
			fail('recordAdded event should be dispatched');
			return;
		}

		cleanup(grid);
		pass('recordAdded event dispatched correctly');
	},

	'should dispatch requestDelete instead of deleting immediately when request-delete is set': async ({pass, fail}) => {
		const grid = await createCardGrid();
		grid.requestDelete = true;
		grid.setRecords([...sampleRecords]);
		await grid.updateComplete;

		let approve = null;
		grid.addEventListener('requestDelete', (e) => { approve = e.detail.approve; });

		grid.deleteRecord(grid.records[0]);
		await grid.updateComplete;

		if(grid.records.length !== 5){
			cleanup(grid);
			fail('Record should not be deleted until requestDelete is approved');
			return;
		}

		if(typeof approve !== 'function'){
			cleanup(grid);
			fail('requestDelete event should include an approve callback');
			return;
		}

		approve();
		await grid.updateComplete;

		if(grid.records.length !== 4){
			cleanup(grid);
			fail('Record should be deleted after approve() is called');
			return;
		}

		cleanup(grid);
		pass('requestDelete gates deletion behind approve/reject');
	},

	/*
		Placeholder Tests
	*/
	'should default placeholder to "No Records"': async ({pass, fail}) => {
		const grid = await createCardGrid();
		if(grid.placeholder !== 'No Records'){
			cleanup(grid);
			fail(`placeholder should default to 'No Records', got '${grid.placeholder}'`);
			return;
		}
		cleanup(grid);
		pass('placeholder defaults to "No Records"');
	},

	'should default filteredPlaceholder to empty string': async ({pass, fail}) => {
		const grid = await createCardGrid();
		if(grid.filteredPlaceholder !== ''){
			cleanup(grid);
			fail(`filteredPlaceholder should default to empty string, got '${grid.filteredPlaceholder}'`);
			return;
		}
		cleanup(grid);
		pass('filteredPlaceholder defaults to empty string');
	},

	'should show placeholder when records are empty': async ({pass, fail}) => {
		const grid = await createCardGrid();
		grid.setData({ records: [], cardTemplate: sampleCardTemplate });
		await grid.updateComplete;

		const placeholder = grid.shadowRoot.querySelector('.placeholder');
		if(!placeholder){
			cleanup(grid);
			fail('Placeholder should exist in shadow DOM when records are empty');
			return;
		}

		if(!placeholder.textContent.includes('No Records')){
			cleanup(grid);
			fail(`Placeholder should contain default placeholder text, got '${placeholder.textContent}'`);
			return;
		}

		cleanup(grid);
		pass('Placeholder shown with default text when records are empty');
	},

	'should not show placeholder when records exist': async ({pass, fail}) => {
		const grid = await createCardGrid();
		grid.setData({ records: [...sampleRecords], cardTemplate: sampleCardTemplate });
		await grid.updateComplete;

		const placeholder = grid.shadowRoot.querySelector('.placeholder');
		if(placeholder){
			cleanup(grid);
			fail('Placeholder should not exist when records are present');
			return;
		}

		cleanup(grid);
		pass('Placeholder not shown when records exist');
	},

	'should show filteredPlaceholder after all records are hidden': async ({pass, fail}) => {
		const grid = await createCardGrid();
		grid.filteredPlaceholder = 'No results match your filter.';
		grid.setData({ records: [...sampleRecords], cardTemplate: sampleCardTemplate });
		await grid.updateComplete;

		grid.records.forEach(record => grid.hideRecord(record));
		await grid.updateComplete;

		const placeholder = grid.shadowRoot.querySelector('.placeholder');
		if(!placeholder){
			cleanup(grid);
			fail('Placeholder should appear after all records are hidden');
			return;
		}

		if(!placeholder.textContent.includes('No results match your filter.')){
			cleanup(grid);
			fail(`Placeholder should show filteredPlaceholder text, got '${placeholder.textContent}'`);
			return;
		}

		cleanup(grid);
		pass('filteredPlaceholder shown after all records hidden');
	}
};
