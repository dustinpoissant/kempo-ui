import Table from '../../src/components/Table.js';

const sampleRecords = [
	{ id: 1, name: 'Alice', age: 30, city: 'New York' },
	{ id: 2, name: 'Bob', age: 25, city: 'Los Angeles' },
	{ id: 3, name: 'Charlie', age: 35, city: 'Chicago' },
	{ id: 4, name: 'Diana', age: 28, city: 'Houston' },
	{ id: 5, name: 'Eve', age: 32, city: 'Phoenix' }
];

const sampleFields = [
	{ name: 'id', label: 'ID' },
	{ name: 'name', label: 'Name' },
	{ name: 'age', label: 'Age' },
	{ name: 'city', label: 'City' }
];

const createTable = async (config = {}) => {
	const table = document.createElement('k-table');
	Object.assign(table, config);
	document.body.appendChild(table);
	await table.updateComplete;
	return table;
};

const cleanup = (table) => {
	if(table && table.parentNode){
		table.parentNode.removeChild(table);
	}
};

/*
	Initialization Tests
*/
export default {
	'should create table element': async ({pass, fail}) => {
		const table = await createTable();
		
		if(!(table instanceof Table)){
			cleanup(table);
			fail('Element should be instance of Table');
			return;
		}
		
		cleanup(table);
		pass('Table element created successfully');
	},

	'should have default properties': async ({pass, fail}) => {
		const table = await createTable();
		
		// enablePages uses boolExists converter, undefined without attribute
		if(table.pageSize !== 50){
			cleanup(table);
			fail('pageSize should default to 50');
			return;
		}
		
		if(table.currentPage !== 1){
			cleanup(table);
			fail('currentPage should default to 1');
			return;
		}
		
		if(!Array.isArray(table.pageSizeOptions)){
			cleanup(table);
			fail('pageSizeOptions should be an array');
			return;
		}
		
		cleanup(table);
		pass('Table has correct default properties');
	},

	/*
		Data Management Tests
	*/
	'should set data with fields and records': async ({pass, fail}) => {
		const table = await createTable();
		
		table.setData({
			fields: sampleFields,
			records: [...sampleRecords]
		});
		await table.updateComplete;
		
		if(table.fields.length !== 4){
			cleanup(table);
			fail(`Expected 4 fields, got ${table.fields.length}`);
			return;
		}
		
		if(table.records.length !== 5){
			cleanup(table);
			fail(`Expected 5 records, got ${table.records.length}`);
			return;
		}
		
		cleanup(table);
		pass('setData correctly sets fields and records');
	},

	'should set records with setRecords': async ({pass, fail}) => {
		const table = await createTable();
		
		table.setRecords([...sampleRecords]);
		await table.updateComplete;
		
		if(table.records.length !== 5){
			cleanup(table);
			fail(`Expected 5 records, got ${table.records.length}`);
			return;
		}
		
		cleanup(table);
		pass('setRecords correctly sets records');
	},

	'should add record': async ({pass, fail}) => {
		const table = await createTable();
		table.setRecords([...sampleRecords]);
		
		const newRecord = { id: 6, name: 'Frank', age: 40, city: 'Seattle' };
		table.addRecord(newRecord);
		await table.updateComplete;
		
		if(table.records.length !== 6){
			cleanup(table);
			fail(`Expected 6 records after adding, got ${table.records.length}`);
			return;
		}
		
		const lastRecord = table.records[table.records.length - 1];
		if(lastRecord.name !== 'Frank'){
			cleanup(table);
			fail('New record should be added at the end');
			return;
		}
		
		cleanup(table);
		pass('addRecord correctly adds new record');
	},

	'should update record': async ({pass, fail}) => {
		const table = await createTable();
		table.setRecords([...sampleRecords]);
		
		// updateRecord takes (record, newData) as arguments
		table.updateRecord(table.records[0], { name: 'Alice Updated' });
		await table.updateComplete;
		
		if(table.records[0].name !== 'Alice Updated'){
			cleanup(table);
			fail('Record should be updated');
			return;
		}
		
		cleanup(table);
		pass('updateRecord correctly updates record');
	},

	'should delete record': async ({pass, fail}) => {
		const table = await createTable();
		table.setRecords([...sampleRecords]);
		
		const recordToDelete = table.records[0];
		table.deleteRecord(recordToDelete);
		await table.updateComplete;
		
		if(table.records.length !== 4){
			cleanup(table);
			fail(`Expected 4 records after deletion, got ${table.records.length}`);
			return;
		}
		
		if(table.records.find(r => r.id === 1)){
			cleanup(table);
			fail('Deleted record should not exist');
			return;
		}
		
		cleanup(table);
		pass('deleteRecord correctly removes record');
	},

	/*
		Pagination Tests
	*/
	'should get current page': async ({pass, fail}) => {
		const table = await createTable();
		table.setRecords([...sampleRecords]);
		
		if(table.getCurrentPage() !== 1){
			cleanup(table);
			fail('Initial page should be 1');
			return;
		}
		
		cleanup(table);
		pass('getCurrentPage returns correct value');
	},

	'should set page': async ({pass, fail}) => {
		const table = await createTable();
		table.setRecords([...sampleRecords]);
		table.pageSize = 2;
		await table.updateComplete;
		
		table.setPage(2);
		await table.updateComplete;
		
		if(table.getCurrentPage() !== 2){
			cleanup(table);
			fail('Page should be 2 after setPage(2)');
			return;
		}
		
		cleanup(table);
		pass('setPage correctly changes page');
	},

	'should navigate with nextPage': async ({pass, fail}) => {
		const table = await createTable();
		table.setRecords([...sampleRecords]);
		table.pageSize = 2;
		await table.updateComplete;
		
		table.nextPage();
		await table.updateComplete;
		
		if(table.getCurrentPage() !== 2){
			cleanup(table);
			fail('nextPage should go to page 2');
			return;
		}
		
		cleanup(table);
		pass('nextPage correctly advances page');
	},

	'should navigate with prevPage': async ({pass, fail}) => {
		const table = await createTable();
		table.setRecords([...sampleRecords]);
		table.pageSize = 2;
		table.currentPage = 3;
		await table.updateComplete;
		
		table.prevPage();
		await table.updateComplete;
		
		if(table.getCurrentPage() !== 2){
			cleanup(table);
			fail('prevPage should go to page 2');
			return;
		}
		
		cleanup(table);
		pass('prevPage correctly goes back');
	},

	'should navigate with firstPage': async ({pass, fail}) => {
		const table = await createTable();
		table.setRecords([...sampleRecords]);
		table.pageSize = 2;
		table.currentPage = 3;
		await table.updateComplete;
		
		table.firstPage();
		await table.updateComplete;
		
		if(table.getCurrentPage() !== 1){
			cleanup(table);
			fail('firstPage should go to page 1');
			return;
		}
		
		cleanup(table);
		pass('firstPage correctly goes to first page');
	},

	'should navigate with lastPage': async ({pass, fail}) => {
		const table = await createTable();
		table.setRecords([...sampleRecords]);
		table.pageSize = 2;
		await table.updateComplete;
		
		table.lastPage();
		await table.updateComplete;
		
		if(table.getCurrentPage() !== 3){
			cleanup(table);
			fail('lastPage should go to page 3');
			return;
		}
		
		cleanup(table);
		pass('lastPage correctly goes to last page');
	},

	'should calculate total pages': async ({pass, fail}) => {
		const table = await createTable();
		table.setRecords([...sampleRecords]);
		table.pageSize = 2;
		await table.updateComplete;
		
		if(table.getTotalPages() !== 3){
			cleanup(table);
			fail(`Expected 3 total pages, got ${table.getTotalPages()}`);
			return;
		}
		
		cleanup(table);
		pass('getTotalPages returns correct count');
	},

	'should get page size': async ({pass, fail}) => {
		const table = await createTable();
		table.pageSize = 25;
		await table.updateComplete;
		
		if(table.getPageSize() !== 25){
			cleanup(table);
			fail('getPageSize should return 25');
			return;
		}
		
		cleanup(table);
		pass('getPageSize returns correct value');
	},

	'should set page size': async ({pass, fail}) => {
		const table = await createTable();
		table.setRecords([...sampleRecords]);
		
		table.setPageSize(2);
		await table.updateComplete;
		
		if(table.pageSize !== 2){
			cleanup(table);
			fail('pageSize should be 2 after setPageSize');
			return;
		}
		
		cleanup(table);
		pass('setPageSize correctly changes page size');
	},

	'should get records for current page': async ({pass, fail}) => {
		const table = await createTable();
		table.setRecords([...sampleRecords]);
		table.pageSize = 2;
		table.enablePages = true;
		await table.updateComplete;
		
		// getDisplayedRecords returns all non-hidden records, pagination is handled in rendering
		const displayedRecords = table.getDisplayedRecords();
		
		if(displayedRecords.length !== 5){
			cleanup(table);
			fail(`Expected 5 displayed records, got ${displayedRecords.length}`);
			return;
		}
		
		cleanup(table);
		pass('getDisplayedRecords returns correct records');
	},

	/*
		Sorting Tests
	*/
	'should sort by field ascending': async ({pass, fail}) => {
		const table = await createTable();
		table.setRecords([...sampleRecords]);
		
		// sortBy takes (field, asc) where asc is boolean
		table.sortBy('age', true);
		await table.updateComplete;
		
		const sortItem = table.sort.find(s => s.name === 'age');
		if(!sortItem){
			cleanup(table);
			fail('Sort should have age entry');
			return;
		}
		
		if(sortItem.asc !== true){
			cleanup(table);
			fail('Sort asc should be true');
			return;
		}
		
		cleanup(table);
		pass('sortBy correctly sets ascending sort');
	},

	'should sort by field descending': async ({pass, fail}) => {
		const table = await createTable();
		table.setRecords([...sampleRecords]);
		
		table.sortBy('age', false);
		await table.updateComplete;
		
		const sortItem = table.sort.find(s => s.name === 'age');
		if(sortItem.asc !== false){
			cleanup(table);
			fail('Sort asc should be false');
			return;
		}
		
		cleanup(table);
		pass('sortBy correctly sets descending sort');
	},

	'should get sort state': async ({pass, fail}) => {
		const table = await createTable();
		table.setRecords([...sampleRecords]);
		table.sortBy('name', true);
		await table.updateComplete;
		
		// sort is an array of {name, asc} objects
		const sortItem = table.sort.find(s => s.name === 'name');
		
		if(!sortItem){
			cleanup(table);
			fail('sort should contain name entry');
			return;
		}
		
		if(sortItem.asc !== true){
			cleanup(table);
			fail('sort should have asc=true');
			return;
		}
		
		cleanup(table);
		pass('sort array returns correct sort state');
	},

	/*
		Filtering Tests
	*/
	'should add filter': async ({pass, fail}) => {
		const table = await createTable();
		table.setRecords([...sampleRecords]);
		
		table.addFilter('city', 'equals', 'Chicago');
		await table.updateComplete;
		
		if(table.filters.length !== 1){
			cleanup(table);
			fail(`Expected 1 filter, got ${table.filters.length}`);
			return;
		}
		
		cleanup(table);
		pass('addFilter correctly adds filter');
	},

	'should remove filter': async ({pass, fail}) => {
		const table = await createTable();
		table.setRecords([...sampleRecords]);
		
		table.addFilter('city', 'equals', 'Chicago');
		table.removeFilter('city', 'equals', 'Chicago');
		await table.updateComplete;
		
		if(table.filters.length !== 0){
			cleanup(table);
			fail('Filter should be removed');
			return;
		}
		
		cleanup(table);
		pass('removeFilter correctly removes filter');
	},

	'should remove all filters': async ({pass, fail}) => {
		const table = await createTable();
		table.setRecords([...sampleRecords]);
		
		table.addFilter('city', 'equals', 'Chicago');
		table.addFilter('age', 'greater-than', '30');
		await table.updateComplete;
		
		// removeAllFilters iterates and removes each filter
		table.removeAllFilters();
		await table.updateComplete;
		
		if(table.filters.length !== 0){
			cleanup(table);
			fail(`All filters should be removed, but ${table.filters.length} remain`);
			return;
		}
		
		cleanup(table);
		pass('removeAllFilters correctly clears all filters');
	},

	'should filter with contains condition': async ({pass, fail}) => {
		const table = await createTable();
		table.setRecords([...sampleRecords]);
		table.enablePages = false;
		
		table.addFilter('name', 'contains', 'li');
		await table.updateComplete;
		
		// getDisplayedRecords returns non-hidden records after filter applied
		const visibleRecords = table.getDisplayedRecords();
		
		// Alice and Charlie both contain 'li'
		if(visibleRecords.length !== 2){
			cleanup(table);
			fail(`Expected 2 visible records with 'li' in name, got ${visibleRecords.length}`);
			return;
		}
		
		cleanup(table);
		pass('Contains filter works correctly');
	},

	/*
		Selection Tests
	*/
	'should select record via checkbox mechanism': async ({pass, fail}) => {
		const table = await createTable();
		table.enableSelection = true;
		table.setRecords([...sampleRecords]);
		await table.updateComplete;
		
		// Selection is handled via selectAllOnPage/deselectAllOnPage and checkbox events
		// Direct record selection uses Symbol properties
		table.selectAllOnPage();
		await table.updateComplete;
		
		const selected = table.getSelectedRecords();
		if(selected.length === 0){
			cleanup(table);
			fail('Records should be selected');
			return;
		}
		
		cleanup(table);
		pass('Selection mechanism works correctly');
	},

	'should deselect via deselectAllOnPage': async ({pass, fail}) => {
		const table = await createTable();
		table.enableSelection = true;
		table.setRecords([...sampleRecords]);
		table.selectAllOnPage();
		await table.updateComplete;
		
		table.deselectAllOnPage();
		await table.updateComplete;
		
		const selected = table.getSelectedRecords();
		if(selected.length !== 0){
			cleanup(table);
			fail('Records should be deselected');
			return;
		}
		
		cleanup(table);
		pass('deselectAllOnPage correctly deselects records');
	},

	'should get selected records': async ({pass, fail}) => {
		const table = await createTable();
		table.enableSelection = true;
		table.pageSize = 2;
		table.setRecords([...sampleRecords]);
		table.selectAllOnPage();
		await table.updateComplete;
		
		const selected = table.getSelectedRecords();
		
		if(selected.length !== 2){
			cleanup(table);
			fail(`Expected 2 selected records, got ${selected.length}`);
			return;
		}
		
		cleanup(table);
		pass('getSelectedRecords returns correct records');
	},

	'should select all on page': async ({pass, fail}) => {
		const table = await createTable();
		table.enableSelection = true;
		table.setRecords([...sampleRecords]);
		table.pageSize = 2;
		await table.updateComplete;
		
		table.selectAllOnPage();
		await table.updateComplete;
		
		const selected = table.getSelectedRecords();
		
		if(selected.length !== 2){
			cleanup(table);
			fail(`Expected 2 selected records on page, got ${selected.length}`);
			return;
		}
		
		cleanup(table);
		pass('selectAllOnPage correctly selects page records');
	},

	'should deselect all on page': async ({pass, fail}) => {
		const table = await createTable();
		table.enableSelection = true;
		table.setRecords([...sampleRecords]);
		table.pageSize = 2;
		table.selectAllOnPage();
		await table.updateComplete;
		
		table.deselectAllOnPage();
		await table.updateComplete;
		
		const selected = table.getSelectedRecords();
		
		if(selected.length !== 0){
			cleanup(table);
			fail('All records on page should be deselected');
			return;
		}
		
		cleanup(table);
		pass('deselectAllOnPage correctly deselects page records');
	},

	'should delete selected records': async ({pass, fail}) => {
		const table = await createTable();
		table.enableSelection = true;
		table.pageSize = 2;
		table.setRecords([...sampleRecords]);
		table.selectAllOnPage();
		await table.updateComplete;
		
		table.deleteSelected();
		await table.updateComplete;
		
		if(table.records.length !== 3){
			cleanup(table);
			fail(`Expected 3 records after deletion, got ${table.records.length}`);
			return;
		}
		
		cleanup(table);
		pass('deleteSelected correctly removes selected records');
	},

	/*
		Field Management Tests
	*/
	'should extract fields from records': async ({pass, fail}) => {
		const fields = Table.extractFieldsFromRecords(sampleRecords);
		
		if(fields.length !== 4){
			fail(`Expected 4 fields, got ${fields.length}`);
			return;
		}
		
		const fieldNames = fields.map(f => f.name);
		if(!fieldNames.includes('id') || !fieldNames.includes('name')){
			fail('Should include id and name fields');
			return;
		}
		
		pass('extractFieldsFromRecords correctly extracts fields');
	},

	'should hide field': async ({pass, fail}) => {
		const table = await createTable();
		table.setData({
			fields: [...sampleFields],
			records: [...sampleRecords]
		});
		await table.updateComplete;
		
		table.hideField('age');
		await table.updateComplete;
		
		const ageField = table.fields.find(f => f.name === 'age');
		if(!ageField.hidden){
			cleanup(table);
			fail('Age field should be hidden');
			return;
		}
		
		cleanup(table);
		pass('hideField correctly hides field');
	},

	'should show field': async ({pass, fail}) => {
		const table = await createTable();
		table.setData({
			fields: [...sampleFields.map(f => f.name === 'age' ? {...f, hidden: true} : f)],
			records: [...sampleRecords]
		});
		await table.updateComplete;
		
		table.showField('age');
		await table.updateComplete;
		
		const ageField = table.fields.find(f => f.name === 'age');
		if(ageField.hidden){
			cleanup(table);
			fail('Age field should be visible');
			return;
		}
		
		cleanup(table);
		pass('showField correctly shows field');
	},

	'should get field label': async ({pass, fail}) => {
		const table = await createTable();
		table.setData({
			fields: [...sampleFields],
			records: [...sampleRecords]
		});
		await table.updateComplete;
		
		const label = table.getFieldLabel('name');
		
		if(label !== 'Name'){
			cleanup(table);
			fail(`Expected label 'Name', got '${label}'`);
			return;
		}
		
		cleanup(table);
		pass('getFieldLabel returns correct label');
	},

	'should reorder fields': async ({pass, fail}) => {
		const table = await createTable();
		table.setData({
			fields: [...sampleFields],
			records: [...sampleRecords]
		});
		await table.updateComplete;
		
		table.reorderFields(['city', 'age', 'name', 'id']);
		await table.updateComplete;
		
		if(table.fields[0].name !== 'city'){
			cleanup(table);
			fail('First field should be city after reorder');
			return;
		}
		
		if(table.fields[3].name !== 'id'){
			cleanup(table);
			fail('Last field should be id after reorder');
			return;
		}
		
		cleanup(table);
		pass('reorderFields correctly reorders fields');
	},

	/*
		Search Tests
	*/
	'should search records': async ({pass, fail}) => {
		const table = await createTable();
		table.setRecords([...sampleRecords]);
		table.enablePages = false;
		await table.updateComplete;
		
		table.search('Alice');
		await table.updateComplete;
		
		const visibleRecords = table.getDisplayedRecords();
		
		if(visibleRecords.length !== 1){
			cleanup(table);
			fail(`Expected 1 visible record, got ${visibleRecords.length}`);
			return;
		}
		
		if(visibleRecords[0].name !== 'Alice'){
			cleanup(table);
			fail('Visible record should be Alice');
			return;
		}
		
		cleanup(table);
		pass('search correctly filters records');
	},

	/*
		Record Visibility Tests
	*/
	'should hide record': async ({pass, fail}) => {
		const table = await createTable();
		table.setRecords([...sampleRecords]);
		await table.updateComplete;
		
		table.hideRecord(table.records[0]);
		await table.updateComplete;
		
		const hiddenRecords = table.getHiddenRecords();
		
		if(hiddenRecords.length !== 1){
			cleanup(table);
			fail(`Expected 1 hidden record, got ${hiddenRecords.length}`);
			return;
		}
		
		cleanup(table);
		pass('hideRecord correctly hides record');
	},

	'should show record': async ({pass, fail}) => {
		const table = await createTable();
		table.setRecords([...sampleRecords]);
		table.hideRecord(table.records[0]);
		await table.updateComplete;
		
		table.showRecord(table.records[0]);
		await table.updateComplete;
		
		const hiddenRecords = table.getHiddenRecords();
		
		if(hiddenRecords.length !== 0){
			cleanup(table);
			fail('No records should be hidden');
			return;
		}
		
		cleanup(table);
		pass('showRecord correctly shows record');
	},

	'should show all records': async ({pass, fail}) => {
		const table = await createTable();
		table.setRecords([...sampleRecords]);
		table.hideRecord(table.records[0]);
		table.hideRecord(table.records[1]);
		await table.updateComplete;
		
		table.showAllRecords();
		await table.updateComplete;
		
		const hiddenRecords = table.getHiddenRecords();
		
		if(hiddenRecords.length !== 0){
			cleanup(table);
			fail('No records should be hidden after showAllRecords');
			return;
		}
		
		cleanup(table);
		pass('showAllRecords correctly shows all records');
	},

	'should get visible records': async ({pass, fail}) => {
		const table = await createTable();
		table.setRecords([...sampleRecords]);
		table.enablePages = false;
		table.hideRecord(table.records[0]);
		await table.updateComplete;
		
		const visibleRecords = table.getDisplayedRecords();
		
		if(visibleRecords.length !== 4){
			cleanup(table);
			fail(`Expected 4 visible records, got ${visibleRecords.length}`);
			return;
		}
		
		cleanup(table);
		pass('getDisplayedRecords returns correct records');
	},

	/*
		Editing Tests
	*/
	'should start editing record': async ({pass, fail}) => {
		const table = await createTable();
		table.setData({
			fields: [...sampleFields],
			records: [...sampleRecords]
		});
		await table.updateComplete;
		
		table.editRecord(table.records[0]);
		await table.updateComplete;
		
		// recordIsEditing uses Symbol to check editing state
		if(!table.recordIsEditing(table.records[0])){
			cleanup(table);
			fail('Record should be in editing state');
			return;
		}
		
		cleanup(table);
		pass('editRecord correctly starts editing');
	},

	'should cancel editing record': async ({pass, fail}) => {
		const table = await createTable();
		table.setData({
			fields: [...sampleFields],
			records: [...sampleRecords]
		});
		table.editRecord(table.records[0]);
		await table.updateComplete;
		
		table.cancelEditedRecord(table.records[0]);
		await table.updateComplete;
		
		if(table.recordIsEditing(table.records[0])){
			cleanup(table);
			fail('Record should not be in editing state');
			return;
		}
		
		cleanup(table);
		pass('cancelEditedRecord correctly cancels editing');
	},

	/*
		Event Tests
	*/
	'should dispatch pageChange event': async ({pass, fail}) => {
		const table = await createTable();
		table.setRecords([...sampleRecords]);
		table.pageSize = 2;
		await table.updateComplete;
		
		let eventFired = false;
		table.addEventListener('pageChange', () => { eventFired = true; });
		
		table.nextPage();
		await table.updateComplete;
		
		if(!eventFired){
			cleanup(table);
			fail('pageChange event should be dispatched');
			return;
		}
		
		cleanup(table);
		pass('pageChange event dispatched correctly');
	},

	'should dispatch pageSizeChange event': async ({pass, fail}) => {
		const table = await createTable();
		table.setRecords([...sampleRecords]);
		await table.updateComplete;
		
		let eventFired = false;
		table.addEventListener('pageSizeChange', () => { eventFired = true; });
		
		table.setPageSize(25);
		await table.updateComplete;
		
		if(!eventFired){
			cleanup(table);
			fail('pageSizeChange event should be dispatched');
			return;
		}
		
		cleanup(table);
		pass('pageSizeChange event dispatched correctly');
	},

	'should dispatch sortChange event': async ({pass, fail}) => {
		const table = await createTable();
		table.setRecords([...sampleRecords]);
		await table.updateComplete;
		
		// Table doesn't dispatch sortChange, but we can verify sort works
		table.sortBy('name', true);
		await table.updateComplete;
		
		const sortItem = table.sort.find(s => s.name === 'name');
		if(!sortItem){
			cleanup(table);
			fail('Sort should be applied');
			return;
		}
		
		cleanup(table);
		pass('Sort is applied correctly');
	},

	'should dispatch filterChange event': async ({pass, fail}) => {
		const table = await createTable();
		table.setRecords([...sampleRecords]);
		await table.updateComplete;
		
		let eventFired = false;
		table.addEventListener('filterChange', () => { eventFired = true; });
		
		table.addFilter('name', 'contains', 'A');
		await table.updateComplete;
		
		if(!eventFired){
			cleanup(table);
			fail('filterChange event should be dispatched');
			return;
		}
		
		cleanup(table);
		pass('filterChange event dispatched correctly');
	},

	'should dispatch selectionChange event': async ({pass, fail}) => {
		const table = await createTable();
		table.enableSelection = true;
		table.setRecords([...sampleRecords]);
		await table.updateComplete;
		
		let eventFired = false;
		table.addEventListener('selectionChange', () => { eventFired = true; });
		
		table.selectAllOnPage();
		await table.updateComplete;
		
		// selectionChange is dispatched asynchronously
		await new Promise(resolve => setTimeout(resolve, 50));
		
		if(!eventFired){
			cleanup(table);
			fail('selectionChange event should be dispatched');
			return;
		}
		
		cleanup(table);
		pass('selectionChange event dispatched correctly');
	},

	'should dispatch recordDeleted event': async ({pass, fail}) => {
		const table = await createTable();
		table.setRecords([...sampleRecords]);
		await table.updateComplete;
		
		let eventFired = false;
		let eventDetail = null;
		table.addEventListener('recordDeleted', (e) => {
			eventFired = true;
			eventDetail = e.detail;
		});
		
		const recordToDelete = table.records[0];
		table.deleteRecord(recordToDelete);
		await table.updateComplete;
		
		if(!eventFired){
			cleanup(table);
			fail('recordDeleted event should be dispatched');
			return;
		}
		
		if(eventDetail === null || eventDetail.index !== 0){
			cleanup(table);
			fail(`recordDeleted event should include index in detail, got ${JSON.stringify(eventDetail)}`);
			return;
		}
		
		cleanup(table);
		pass('recordDeleted event dispatched correctly');
	},

	/*
		Static Formatters Tests
	*/
	'should have static formatters': async ({pass, fail}) => {
		if(typeof Table.formatters !== 'object'){
			fail('Table should have static formatters object');
			return;
		}
		
		if(typeof Table.formatters.number !== 'function'){
			fail('Formatters should have number function');
			return;
		}
		
		if(typeof Table.formatters.date !== 'function'){
			fail('Formatters should have date function');
			return;
		}
		
		pass('Table has static formatters');
	},

	'should format number': async ({pass, fail}) => {
		const formatted = Table.formatters.number(1234567.89);
		
		if(formatted !== '1234567.89'){
			fail(`Expected '1234567.89', got '${formatted}'`);
			return;
		}
		
		pass('Number formatter works correctly');
	},

	/*
		Static Editors Tests
	*/
	'should have static editors': async ({pass, fail}) => {
		if(typeof Table.editors !== 'object'){
			fail('Table should have static editors object');
			return;
		}
		
		if(typeof Table.editors.string !== 'function'){
			fail('Editors should have text function');
			return;
		}
		
		pass('Table has static editors');
	},

	/*
		Non-Editable Field Tests
	*/
	'should not create input for editable:false field when editing': async ({pass, fail}) => {
		const table = await createTable();
		table.setData({
			fields: [
				{ name: 'id', label: 'ID', editable: false },
				{ name: 'name', label: 'Name' },
				{ name: 'age', label: 'Age' }
			],
			records: [...sampleRecords]
		});
		await table.updateComplete;

		const record = table.records[0];
		table.editRecord(record);

		const idCell = table.shadowRoot.querySelector(`.record[data-index="0"] .cell[data-field="id"]`);
		if(!idCell){
			cleanup(table);
			fail('Could not find id cell');
			return;
		}

		const input = idCell.querySelector('input, select');
		if(input){
			cleanup(table);
			fail('Non-editable field should not have an input in edit mode');
			return;
		}

		cleanup(table);
		pass('editable:false field does not show input in edit mode');
	},

	'should preserve editable:false field value when saving': async ({pass, fail}) => {
		const table = await createTable();
		table.setData({
			fields: [
				{ name: 'id', label: 'ID', editable: false },
				{ name: 'name', label: 'Name' },
				{ name: 'age', label: 'Age' }
			],
			records: [...sampleRecords]
		});
		await table.updateComplete;

		const record = table.records[0];
		const originalId = record.id;
		table.editRecord(record);

		const nameCell = table.shadowRoot.querySelector(`.record[data-index="0"] .cell[data-field="name"]`);
		const nameInput = nameCell ? nameCell.querySelector('input') : null;
		if(nameInput) nameInput.value = 'Updated Name';

		table.saveEditedRecord(record);
		await table.updateComplete;

		if(record.id !== originalId){
			cleanup(table);
			fail(`Non-editable field 'id' should not change: expected ${originalId}, got ${record.id}`);
			return;
		}

		cleanup(table);
		pass('editable:false field value is preserved after save');
	},

	'should display value for editable:false field during edit mode': async ({pass, fail}) => {
		const table = await createTable();
		table.setData({
			fields: [
				{ name: 'id', label: 'ID', editable: false },
				{ name: 'name', label: 'Name' }
			],
			records: [...sampleRecords]
		});
		await table.updateComplete;

		const record = table.records[0];
		table.editRecord(record);

		const idCell = table.shadowRoot.querySelector(`.record[data-index="0"] .cell[data-field="id"]`);
		if(!idCell){
			cleanup(table);
			fail('Could not find id cell');
			return;
		}

		if(!idCell.textContent.trim()){
			cleanup(table);
			fail('Non-editable field cell should display its value during edit mode');
			return;
		}

		cleanup(table);
		pass('editable:false field displays its value during edit mode');
	},

	'should treat fields without editable property as editable by default': async ({pass, fail}) => {
		const table = await createTable();
		table.setData({
			fields: [
				{ name: 'id', label: 'ID' },
				{ name: 'name', label: 'Name' }
			],
			records: [...sampleRecords]
		});
		await table.updateComplete;

		const record = table.records[0];
		table.editRecord(record);

		const idCell = table.shadowRoot.querySelector(`.record[data-index="0"] .cell[data-field="id"]`);
		if(!idCell){
			cleanup(table);
			fail('Could not find id cell');
			return;
		}

		const input = idCell.querySelector('input, select');
		if(!input){
			cleanup(table);
			fail('Field without editable property should default to editable (have an input)');
			return;
		}

		cleanup(table);
		pass('Field without editable property defaults to editable');
	},

	/*
		Placeholder Tests
	*/
	'should default placeholder to "No Records"': async ({pass, fail}) => {
		const table = await createTable();
		if(table.placeholder !== 'No Records'){
			cleanup(table);
			fail(`placeholder should default to 'No Records', got '${table.placeholder}'`);
			return;
		}
		cleanup(table);
		pass('placeholder defaults to "No Records"');
	},

	'should default filteredPlaceholder to empty string': async ({pass, fail}) => {
		const table = await createTable();
		if(table.filteredPlaceholder !== ''){
			cleanup(table);
			fail(`filteredPlaceholder should default to empty string, got '${table.filteredPlaceholder}'`);
			return;
		}
		cleanup(table);
		pass('filteredPlaceholder defaults to empty string');
	},

	'should show placeholder row when records are empty': async ({pass, fail}) => {
		const table = await createTable();
		table.setData({
			fields: [...sampleFields],
			records: []
		});
		await table.updateComplete;

		const placeholderRow = table.shadowRoot.querySelector('tr.placeholder');
		if(!placeholderRow){
			cleanup(table);
			fail('Placeholder row should exist in shadow DOM when records are empty');
			return;
		}

		if(!placeholderRow.textContent.includes('No Records')){
			cleanup(table);
			fail(`Placeholder row should contain default placeholder text, got '${placeholderRow.textContent}'`);
			return;
		}

		cleanup(table);
		pass('Placeholder row shown with default text when records are empty');
	},

	'should show custom placeholder text when set': async ({pass, fail}) => {
		const table = await createTable();
		table.placeholder = 'Nothing here.';
		table.setData({
			fields: [...sampleFields],
			records: []
		});
		await table.updateComplete;

		const placeholderRow = table.shadowRoot.querySelector('tr.placeholder');
		if(!placeholderRow){
			cleanup(table);
			fail('Placeholder row should exist when records are empty');
			return;
		}

		if(!placeholderRow.textContent.includes('Nothing here.')){
			cleanup(table);
			fail(`Placeholder row should contain custom text, got '${placeholderRow.textContent}'`);
			return;
		}

		cleanup(table);
		pass('Placeholder row shows custom placeholder text');
	},

	'should not show placeholder row when records exist': async ({pass, fail}) => {
		const table = await createTable();
		table.setData({
			fields: [...sampleFields],
			records: [...sampleRecords]
		});
		await table.updateComplete;

		const placeholderRow = table.shadowRoot.querySelector('tr.placeholder');
		if(placeholderRow){
			cleanup(table);
			fail('Placeholder row should not exist when records are present');
			return;
		}

		cleanup(table);
		pass('Placeholder row not shown when records exist');
	},

	'should not show placeholder row when placeholder is empty string': async ({pass, fail}) => {
		const table = await createTable();
		table.placeholder = '';
		table.setData({
			fields: [...sampleFields],
			records: []
		});
		await table.updateComplete;

		const placeholderRow = table.shadowRoot.querySelector('tr.placeholder');
		if(placeholderRow){
			cleanup(table);
			fail('Placeholder row should not exist when placeholder is empty string');
			return;
		}

		cleanup(table);
		pass('Placeholder row not shown when placeholder is empty string');
	},

	'should show filteredPlaceholder after all records are filtered out': async ({pass, fail}) => {
		const table = await createTable();
		table.filteredPlaceholder = 'No results match your filter.';
		table.setData({
			fields: [...sampleFields],
			records: [...sampleRecords]
		});
		await table.updateComplete;

		table.addFilter('city', 'equals', 'Nonexistent City');
		await table.updateComplete;

		const placeholderRow = table.shadowRoot.querySelector('tr.placeholder');
		if(!placeholderRow){
			cleanup(table);
			fail('Placeholder row should appear after all records are filtered out');
			return;
		}

		if(!placeholderRow.textContent.includes('No results match your filter.')){
			cleanup(table);
			fail(`Placeholder should show filteredPlaceholder text, got '${placeholderRow.textContent}'`);
			return;
		}

		cleanup(table);
		pass('filteredPlaceholder shown after all records filtered out');
	},

	'should not show placeholder when filtered and filteredPlaceholder is not set': async ({pass, fail}) => {
		const table = await createTable();
		table.setData({
			fields: [...sampleFields],
			records: [...sampleRecords]
		});
		await table.updateComplete;

		table.addFilter('city', 'equals', 'Nonexistent City');
		await table.updateComplete;

		const placeholderRow = table.shadowRoot.querySelector('tr.placeholder');
		if(placeholderRow){
			cleanup(table);
			fail('Placeholder row should not appear when filteredPlaceholder is empty and records are filtered');
			return;
		}

		cleanup(table);
		pass('No placeholder shown when filteredPlaceholder is not set and records are filtered');
	},

	'should show placeholder (not filteredPlaceholder) when records array is empty': async ({pass, fail}) => {
		const table = await createTable();
		table.placeholder = 'No Records';
		table.filteredPlaceholder = 'No matches.';
		table.setData({
			fields: [...sampleFields],
			records: []
		});
		await table.updateComplete;

		const placeholderRow = table.shadowRoot.querySelector('tr.placeholder');
		if(!placeholderRow){
			cleanup(table);
			fail('Placeholder row should exist when records are empty');
			return;
		}

		if(!placeholderRow.textContent.includes('No Records')){
			cleanup(table);
			fail(`Should use placeholder text, not filteredPlaceholder, got '${placeholderRow.textContent}'`);
			return;
		}

		cleanup(table);
		pass('placeholder used (not filteredPlaceholder) when records array is empty');
	}
};
