import '../../../src/components/tableControls/Search.js';
import '../../../src/components/Table.js';

const sampleRecords = [
	{ id: 1, name: 'Alice Johnson', email: 'alice@example.com' },
	{ id: 2, name: 'Bob Smith', email: 'bob@example.com' },
	{ id: 3, name: 'Charlie Brown', email: 'charlie@example.com' },
	{ id: 4, name: 'Diana Prince', email: 'diana@example.com' },
	{ id: 5, name: 'Alice Cooper', email: 'cooper@example.com' }
];

const createTableWithSearch = async () => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-table>
			<div slot="controls">
				<k-tc-search></k-tc-search>
			</div>
		</k-table>
	`;
	document.body.appendChild(container);
	
	const table = container.querySelector('k-table');
	table.enablePages = false;
	table.setRecords([...sampleRecords]);
	await table.updateComplete;
	
	const search = container.querySelector('k-tc-search');
	await search.updateComplete;
	
	return { container, table, search };
};

const cleanup = (container) => {
	if(container && container.parentNode){
		container.parentNode.removeChild(container);
	}
};

export default {
	/*
		Rendering Tests
	*/
	'should render search input': async ({pass, fail}) => {
		const { container, search } = await createTableWithSearch();
		
		const input = search.shadowRoot.querySelector('input[type="search"]');
		if(!input){
			cleanup(container);
			fail('Search should render input element');
			return;
		}
		
		cleanup(container);
		pass('Search renders input correctly');
	},

	'should have placeholder text': async ({pass, fail}) => {
		const { container, search } = await createTableWithSearch();
		
		const input = search.shadowRoot.querySelector('input');
		if(input.placeholder !== 'Search'){
			cleanup(container);
			fail(`Expected placeholder "Search", got "${input.placeholder}"`);
			return;
		}
		
		cleanup(container);
		pass('Search has correct placeholder');
	},

	/*
		Default Values Tests
	*/
	'should have default maxWidth of 200': async ({pass, fail}) => {
		const { container, search } = await createTableWithSearch();
		
		if(search.maxWidth !== 200){
			cleanup(container);
			fail(`Expected maxWidth 200, got ${search.maxWidth}`);
			return;
		}
		
		cleanup(container);
		pass('Search has default maxWidth of 200');
	},

	/*
		Search Behavior Tests
	*/
	'should not search with less than 3 characters': async ({pass, fail}) => {
		const { container, table, search } = await createTableWithSearch();
		
		const input = search.shadowRoot.querySelector('input');
		input.value = 'Al';
		input.dispatchEvent(new Event('input'));
		
		// Wait for debounce
		await new Promise(resolve => setTimeout(resolve, 250));
		await table.updateComplete;
		
		const displayedRecords = table.getDisplayedRecords();
		if(displayedRecords.length !== 5){
			cleanup(container);
			fail('All records should be visible with < 3 chars');
			return;
		}
		
		cleanup(container);
		pass('Search does not filter with < 3 characters');
	},

	'should search with 3 or more characters': async ({pass, fail}) => {
		const { container, table, search } = await createTableWithSearch();
		
		const input = search.shadowRoot.querySelector('input');
		input.value = 'Alice';
		input.dispatchEvent(new Event('input'));
		
		// Wait for debounce
		await new Promise(resolve => setTimeout(resolve, 250));
		await table.updateComplete;
		
		const displayedRecords = table.getDisplayedRecords();
		if(displayedRecords.length !== 2){
			cleanup(container);
			fail(`Expected 2 visible records for "Alice", got ${displayedRecords.length}`);
			return;
		}
		
		cleanup(container);
		pass('Search filters with 3+ characters');
	},

	'should debounce search': async ({pass, fail}) => {
		const { container, table, search } = await createTableWithSearch();
		
		let searchCount = 0;
		const originalSearch = table.search.bind(table);
		table.search = (term) => {
			searchCount++;
			return originalSearch(term);
		};
		
		const input = search.shadowRoot.querySelector('input');
		
		// Rapid input changes
		input.value = 'Ali';
		input.dispatchEvent(new Event('input'));
		input.value = 'Alic';
		input.dispatchEvent(new Event('input'));
		input.value = 'Alice';
		input.dispatchEvent(new Event('input'));
		
		// Wait for debounce
		await new Promise(resolve => setTimeout(resolve, 250));
		
		if(searchCount !== 1){
			cleanup(container);
			fail(`Expected 1 search call (debounced), got ${searchCount}`);
			return;
		}
		
		cleanup(container);
		pass('Search is debounced');
	},

	'should show all records when search is cleared': async ({pass, fail}) => {
		const { container, table, search } = await createTableWithSearch();
		
		const input = search.shadowRoot.querySelector('input');
		
		// First search
		input.value = 'Alice';
		input.dispatchEvent(new Event('input'));
		await new Promise(resolve => setTimeout(resolve, 250));
		await table.updateComplete;
		
		// Clear search
		input.value = '';
		input.dispatchEvent(new Event('input'));
		await new Promise(resolve => setTimeout(resolve, 250));
		await table.updateComplete;
		
		const displayedRecords = table.getDisplayedRecords();
		if(displayedRecords.length !== 5){
			cleanup(container);
			fail(`Expected 5 visible records after clear, got ${displayedRecords.length}`);
			return;
		}
		
		cleanup(container);
		pass('Search clears results when emptied');
	},

	'should show all records when search term is too short': async ({pass, fail}) => {
		const { container, table, search } = await createTableWithSearch();
		
		const input = search.shadowRoot.querySelector('input');
		
		// First search with valid term
		input.value = 'Alice';
		input.dispatchEvent(new Event('input'));
		await new Promise(resolve => setTimeout(resolve, 250));
		await table.updateComplete;
		
		// Shorten to invalid length
		input.value = 'Al';
		input.dispatchEvent(new Event('input'));
		await new Promise(resolve => setTimeout(resolve, 250));
		await table.updateComplete;
		
		const displayedRecords = table.getDisplayedRecords();
		if(displayedRecords.length !== 5){
			cleanup(container);
			fail(`Expected 5 visible records with short term, got ${displayedRecords.length}`);
			return;
		}
		
		cleanup(container);
		pass('Search shows all when term too short');
	},

	/*
		Property Tests
	*/
	'should track searchTerm property': async ({pass, fail}) => {
		const { container, search } = await createTableWithSearch();
		
		const input = search.shadowRoot.querySelector('input');
		input.value = 'test';
		input.dispatchEvent(new Event('input'));
		
		if(search.searchTerm !== 'test'){
			cleanup(container);
			fail(`Expected searchTerm "test", got "${search.searchTerm}"`);
			return;
		}
		
		cleanup(container);
		pass('searchTerm property is updated on input');
	},

	'should reflect value in input': async ({pass, fail}) => {
		const { container, search } = await createTableWithSearch();
		
		const input = search.shadowRoot.querySelector('input');
		search.searchTerm = 'hello';
		await search.updateComplete;
		
		if(input.value !== 'hello'){
			cleanup(container);
			fail(`Expected input value "hello", got "${input.value}"`);
			return;
		}
		
		cleanup(container);
		pass('Input reflects searchTerm property');
	},

	/*
		No Table Tests
	*/
	'should handle missing table gracefully': async ({pass, fail}) => {
		const search = document.createElement('k-tc-search');
		document.body.appendChild(search);
		await search.updateComplete;
		
		const input = search.shadowRoot.querySelector('input');
		
		try {
			input.value = 'test';
			input.dispatchEvent(new Event('input'));
			await new Promise(resolve => setTimeout(resolve, 250));
			
			document.body.removeChild(search);
			pass('Search handles missing table gracefully');
		} catch(e) {
			document.body.removeChild(search);
			fail(`Should not throw error: ${e.message}`);
		}
	}
};
