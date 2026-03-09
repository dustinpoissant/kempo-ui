import FilterList from '../../src/components/FilterList.js';
import '../../src/components/FilterItem.js';

const createFilterList = async (items = []) => {
	const container = document.createElement('div');
	container.innerHTML = `<k-filter-list>${items.map(kw => `<k-filter-item filter-keywords="${kw}">${kw}</k-filter-item>`).join('')}</k-filter-list>`;
	document.body.appendChild(container);
	const el = container.querySelector('k-filter-list');
	await el.updateComplete;
	return { container, el };
};

const cleanup = (container) => {
	if(container && container.parentNode){
		container.parentNode.removeChild(container);
	}
};

export default {
	/*
		Element Creation
	*/
	'should create filter-list element': async ({pass, fail}) => {
		const { container, el } = await createFilterList();
		if(!el){
			cleanup(container);
			return fail('k-filter-list element should be created');
		}
		if(!(el instanceof FilterList)){
			cleanup(container);
			return fail('Element should be instance of FilterList');
		}
		cleanup(container);
		pass('FilterList element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, el } = await createFilterList();
		if(!el.shadowRoot){
			cleanup(container);
			return fail('FilterList should have shadow root');
		}
		cleanup(container);
		pass('FilterList has shadow root');
	},

	/*
		filter() — empty term
	*/
	'filter("") should show all items': async ({pass, fail}) => {
		const { container, el } = await createFilterList(['apple', 'banana', 'cherry']);
		el.filter('');
		const items = [...el.querySelectorAll('k-filter-item')];
		const hidden = items.filter(i => i.hidden);
		if(hidden.length !== 0){
			cleanup(container);
			return fail(`Expected 0 hidden items, got ${hidden.length}`);
		}
		cleanup(container);
		pass('All items visible when term is empty');
	},

	/*
		filter() — single word
	*/
	'filter("apple") should hide non-matching items': async ({pass, fail}) => {
		const { container, el } = await createFilterList(['apple', 'banana', 'cherry']);
		el.filter('apple');
		const banana = el.querySelector('[filter-keywords="banana"]');
		const cherry = el.querySelector('[filter-keywords="cherry"]');
		if(!banana.hidden || !cherry.hidden){
			cleanup(container);
			return fail('Non-matching items should be hidden');
		}
		cleanup(container);
		pass('Non-matching items are hidden');
	},

	'filter("apple") should show matching item': async ({pass, fail}) => {
		const { container, el } = await createFilterList(['apple', 'banana', 'cherry']);
		el.filter('apple');
		const apple = el.querySelector('[filter-keywords="apple"]');
		if(apple.hidden){
			cleanup(container);
			return fail('Matching item should not be hidden');
		}
		cleanup(container);
		pass('Matching item is visible');
	},

	/*
		filter() — multi-word (AND logic)
	*/
	'filter("apple pie") should require all words to match': async ({pass, fail}) => {
		const { container, el } = await createFilterList(['apple pie', 'apple', 'pie']);
		el.filter('apple pie');
		const applePie = el.querySelector('[filter-keywords="apple pie"]');
		const appleOnly = el.querySelector('[filter-keywords="apple"]');
		const pieOnly = el.querySelector('[filter-keywords="pie"]');
		if(applePie.hidden){
			cleanup(container);
			return fail('Item matching all words should be visible');
		}
		if(!appleOnly.hidden || !pieOnly.hidden){
			cleanup(container);
			return fail('Items matching only one word should be hidden');
		}
		cleanup(container);
		pass('Multi-word filter requires all words to match');
	},

	/*
		filter() — case insensitivity
	*/
	'filter() should be case-insensitive': async ({pass, fail}) => {
		const { container, el } = await createFilterList(['Apple', 'banana']);
		el.filter('APPLE');
		const apple = el.querySelector('[filter-keywords="Apple"]');
		if(apple.hidden){
			cleanup(container);
			return fail('Matching should be case-insensitive');
		}
		cleanup(container);
		pass('filter() is case-insensitive');
	},

	/*
		filter() — no keywords attribute
	*/
	'items with no filter-keywords should be hidden when term is provided': async ({pass, fail}) => {
		const container = document.createElement('div');
		container.innerHTML = `<k-filter-list><k-filter-item>no keywords</k-filter-item></k-filter-list>`;
		document.body.appendChild(container);
		const el = container.querySelector('k-filter-list');
		await el.updateComplete;
		el.filter('something');
		const item = el.querySelector('k-filter-item');
		if(!item.hidden){
			cleanup(container);
			return fail('Item with no keywords should be hidden when term is given');
		}
		cleanup(container);
		pass('Item with no keywords is hidden when term is provided');
	},

	/*
		filter() — restore all after filtering
	*/
	'filter("") after filtering should restore all items': async ({pass, fail}) => {
		const { container, el } = await createFilterList(['apple', 'banana']);
		el.filter('apple');
		el.filter('');
		const items = [...el.querySelectorAll('k-filter-item')];
		const hidden = items.filter(i => i.hidden);
		if(hidden.length !== 0){
			cleanup(container);
			return fail(`Expected all items visible after clearing filter, got ${hidden.length} hidden`);
		}
		cleanup(container);
		pass('All items restored after clearing filter');
	},
};
