import FilterItem from '../../src/components/FilterItem.js';

const createFilterItem = async (content = 'item') => {
	const container = document.createElement('div');
	container.innerHTML = `<k-filter-item>${content}</k-filter-item>`;
	document.body.appendChild(container);
	const el = container.querySelector('k-filter-item');
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
	'should create filter-item element': async ({pass, fail}) => {
		const { container, el } = await createFilterItem();
		if(!el){
			cleanup(container);
			return fail('k-filter-item element should be created');
		}
		if(!(el instanceof FilterItem)){
			cleanup(container);
			return fail('Element should be instance of FilterItem');
		}
		cleanup(container);
		pass('FilterItem element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, el } = await createFilterItem();
		if(!el.shadowRoot){
			cleanup(container);
			return fail('FilterItem should have shadow root');
		}
		cleanup(container);
		pass('FilterItem has shadow root');
	},

	/*
		Visibility
	*/
	'should be visible by default': async ({pass, fail}) => {
		const { container, el } = await createFilterItem();
		if(el.hidden){
			cleanup(container);
			return fail('FilterItem should be visible by default');
		}
		cleanup(container);
		pass('FilterItem is visible by default');
	},

	'setting hidden should hide the element': async ({pass, fail}) => {
		const { container, el } = await createFilterItem();
		el.hidden = true;
		await el.updateComplete;
		const style = getComputedStyle(el);
		if(style.display !== 'none'){
			cleanup(container);
			return fail(`Expected display:none when hidden, got ${style.display}`);
		}
		cleanup(container);
		pass('FilterItem is hidden when hidden attribute is set');
	},

	'removing hidden should show the element': async ({pass, fail}) => {
		const { container, el } = await createFilterItem();
		el.hidden = true;
		await el.updateComplete;
		el.hidden = false;
		await el.updateComplete;
		const style = getComputedStyle(el);
		if(style.display === 'none'){
			cleanup(container);
			return fail('FilterItem should be visible after removing hidden');
		}
		cleanup(container);
		pass('FilterItem is visible after removing hidden');
	},

	/*
		filter-keywords attribute
	*/
	'should accept filter-keywords attribute': async ({pass, fail}) => {
		const container = document.createElement('div');
		container.innerHTML = `<k-filter-item filter-keywords="foo bar">content</k-filter-item>`;
		document.body.appendChild(container);
		const el = container.querySelector('k-filter-item');
		await el.updateComplete;
		const kw = el.getAttribute('filter-keywords');
		if(kw !== 'foo bar'){
			cleanup(container);
			return fail(`Expected filter-keywords "foo bar", got "${kw}"`);
		}
		cleanup(container);
		pass('filter-keywords attribute set correctly');
	},
};
