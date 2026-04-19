import Combobox from '../../src/components/Combobox.js';

const createCombobox = async (attrs = {}, children = '') => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-combobox
			${attrs.placeholder ? `placeholder="${attrs.placeholder}"` : ''}
			${attrs.value ? `value="${attrs.value}"` : ''}
			${attrs.searching ? 'searching' : ''}
			${attrs.required ? 'required' : ''}
			${attrs.requireMatch ? 'require-match' : ''}
			${attrs.disabled ? 'disabled' : ''}
			${attrs.name ? `name="${attrs.name}"` : ''}
			${attrs.debounceMs ? `debounce-ms="${attrs.debounceMs}"` : ''}
			${attrs.maxVisible ? `max-visible="${attrs.maxVisible}"` : ''}
		>${children}</k-combobox>
	`;
	document.body.appendChild(container);
	const el = container.querySelector('k-combobox');
	await el.updateComplete;
	return { container, el };
};

const fruitOptions = `
	<k-option value="apple">Apple</k-option>
	<k-option value="banana">Banana</k-option>
	<k-option value="cherry">Cherry</k-option>
	<k-option value="date">Date</k-option>
`;

const cleanup = container => {
	container?.parentNode?.removeChild(container);
};

export default {
	/*
		Element Creation
	*/
	'should create combobox element': async ({pass, fail}) => {
		const { container, el } = await createCombobox();
		if(!(el instanceof Combobox)) {
			cleanup(container);
			return fail('Element should be instance of Combobox');
		}
		cleanup(container);
		pass();
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, el } = await createCombobox();
		if(!el.shadowRoot) {
			cleanup(container);
			return fail('Combobox should have shadow root');
		}
		cleanup(container);
		pass();
	},

	/*
		Default Properties
	*/
	'should have empty value by default': async ({pass, fail}) => {
		const { container, el } = await createCombobox();
		if(el.value !== '') {
			cleanup(container);
			return fail(`Expected '', got '${el.value}'`);
		}
		cleanup(container);
		pass();
	},

	'should have empty placeholder by default': async ({pass, fail}) => {
		const { container, el } = await createCombobox();
		if(el.placeholder !== '') {
			cleanup(container);
			return fail(`Expected '', got '${el.placeholder}'`);
		}
		cleanup(container);
		pass();
	},

	'should be closed by default': async ({pass, fail}) => {
		const { container, el } = await createCombobox();
		if(el.opened !== false) {
			cleanup(container);
			return fail(`Expected false, got ${el.opened}`);
		}
		cleanup(container);
		pass();
	},

	'should not be searching by default': async ({pass, fail}) => {
		const { container, el } = await createCombobox();
		if(el.searching !== false) {
			cleanup(container);
			return fail(`Expected false, got ${el.searching}`);
		}
		cleanup(container);
		pass();
	},

	'should have default debounceMs of 300': async ({pass, fail}) => {
		const { container, el } = await createCombobox();
		if(el.debounceMs !== 300) {
			cleanup(container);
			return fail(`Expected 300, got ${el.debounceMs}`);
		}
		cleanup(container);
		pass();
	},

	'should have default maxVisible of 8': async ({pass, fail}) => {
		const { container, el } = await createCombobox();
		if(el.maxVisible !== 8) {
			cleanup(container);
			return fail(`Expected 8, got ${el.maxVisible}`);
		}
		cleanup(container);
		pass();
	},

	'should not be required by default': async ({pass, fail}) => {
		const { container, el } = await createCombobox();
		if(el.required !== false) {
			cleanup(container);
			return fail(`Expected false, got ${el.required}`);
		}
		cleanup(container);
		pass();
	},

	'should not require match by default': async ({pass, fail}) => {
		const { container, el } = await createCombobox();
		if(el.requireMatch !== false) {
			cleanup(container);
			return fail(`Expected false, got ${el.requireMatch}`);
		}
		cleanup(container);
		pass();
	},

	'should not be disabled by default': async ({pass, fail}) => {
		const { container, el } = await createCombobox();
		if(el.disabled !== false) {
			cleanup(container);
			return fail(`Expected false, got ${el.disabled}`);
		}
		cleanup(container);
		pass();
	},

	/*
		Attributes
	*/
	'should reflect placeholder attribute': async ({pass, fail}) => {
		const { container, el } = await createCombobox({ placeholder: 'Search...' });
		if(el.placeholder !== 'Search...') {
			cleanup(container);
			return fail(`Expected 'Search...', got '${el.placeholder}'`);
		}
		cleanup(container);
		pass();
	},

	'should reflect debounce-ms attribute': async ({pass, fail}) => {
		const { container, el } = await createCombobox({ debounceMs: 500 });
		if(el.debounceMs !== 500) {
			cleanup(container);
			return fail(`Expected 500, got ${el.debounceMs}`);
		}
		cleanup(container);
		pass();
	},

	'should reflect searching attribute': async ({pass, fail}) => {
		const { container, el } = await createCombobox({ searching: true });
		if(el.searching !== true) {
			cleanup(container);
			return fail(`Expected true, got ${el.searching}`);
		}
		cleanup(container);
		pass();
	},

	'should reflect required attribute': async ({pass, fail}) => {
		const { container, el } = await createCombobox({ required: true });
		if(el.required !== true) {
			cleanup(container);
			return fail(`Expected true, got ${el.required}`);
		}
		cleanup(container);
		pass();
	},

	'should reflect require-match attribute': async ({pass, fail}) => {
		const { container, el } = await createCombobox({ requireMatch: true });
		if(el.requireMatch !== true) {
			cleanup(container);
			return fail(`Expected true, got ${el.requireMatch}`);
		}
		cleanup(container);
		pass();
	},

	'should reflect disabled attribute': async ({pass, fail}) => {
		const { container, el } = await createCombobox({ disabled: true });
		if(el.disabled !== true) {
			cleanup(container);
			return fail(`Expected true, got ${el.disabled}`);
		}
		cleanup(container);
		pass();
	},

	'should reflect max-visible attribute': async ({pass, fail}) => {
		const { container, el } = await createCombobox({ maxVisible: 4 });
		if(el.maxVisible !== 4) {
			cleanup(container);
			return fail(`Expected 4, got ${el.maxVisible}`);
		}
		cleanup(container);
		pass();
	},

	/*
		Children (k-option)
	*/
	'should read k-option children': async ({pass, fail}) => {
		const { container, el } = await createCombobox({}, fruitOptions);
		el.opened = true;
		await el.updateComplete;
		const items = el.shadowRoot.querySelectorAll('.option');
		if(items.length !== 4) {
			cleanup(container);
			return fail(`Expected 4 options, got ${items.length}`);
		}
		cleanup(container);
		pass();
	},

	'should use k-option text as label': async ({pass, fail}) => {
		const { container, el } = await createCombobox({}, '<k-option value="a">Alpha</k-option>');
		el.opened = true;
		await el.updateComplete;
		const item = el.shadowRoot.querySelector('.option');
		if(!item || item.textContent.trim() !== 'Alpha') {
			cleanup(container);
			return fail(`Expected 'Alpha', got '${item?.textContent}'`);
		}
		cleanup(container);
		pass();
	},

	/*
		Rendering
	*/
	'should render an input element': async ({pass, fail}) => {
		const { container, el } = await createCombobox();
		if(!el.shadowRoot.querySelector('input')) {
			cleanup(container);
			return fail('Input element not found');
		}
		cleanup(container);
		pass();
	},

	'should not render menu when closed': async ({pass, fail}) => {
		const { container, el } = await createCombobox({}, fruitOptions);
		if(el.shadowRoot.querySelector('#menu')) {
			cleanup(container);
			return fail('Menu should not be rendered when closed');
		}
		cleanup(container);
		pass();
	},

	'should render menu when opened': async ({pass, fail}) => {
		const { container, el } = await createCombobox({}, fruitOptions);
		el.opened = true;
		await el.updateComplete;
		if(!el.shadowRoot.querySelector('#menu')) {
			cleanup(container);
			return fail('Menu should be rendered when opened');
		}
		cleanup(container);
		pass();
	},

	/*
		setOptions Method
	*/
	'should create k-option children via setOptions with strings': async ({pass, fail}) => {
		const { container, el } = await createCombobox();
		el.setOptions(['Apple', 'Banana', 'Cherry']);
		await el.updateComplete;
		const opts = el.querySelectorAll('k-option');
		if(opts.length !== 3) {
			cleanup(container);
			return fail(`Expected 3 k-option children, got ${opts.length}`);
		}
		if(opts[0].textContent.trim() !== 'Apple') {
			cleanup(container);
			return fail(`Expected 'Apple', got '${opts[0].textContent}'`);
		}
		cleanup(container);
		pass();
	},

	'should create k-option children via setOptions with objects': async ({pass, fail}) => {
		const { container, el } = await createCombobox();
		el.setOptions([{ label: 'Alice', value: 'a1' }, { label: 'Bob', value: 'b2' }]);
		await el.updateComplete;
		const opts = el.querySelectorAll('k-option');
		if(opts.length !== 2) {
			cleanup(container);
			return fail(`Expected 2, got ${opts.length}`);
		}
		if(opts[0].value !== 'a1') {
			cleanup(container);
			return fail(`Expected value 'a1', got '${opts[0].value}'`);
		}
		if(opts[0].textContent.trim() !== 'Alice') {
			cleanup(container);
			return fail(`Expected 'Alice', got '${opts[0].textContent}'`);
		}
		cleanup(container);
		pass();
	},

	'setOptions should replace existing children': async ({pass, fail}) => {
		const { container, el } = await createCombobox({}, fruitOptions);
		el.setOptions(['X', 'Y']);
		await el.updateComplete;
		const opts = el.querySelectorAll('k-option');
		if(opts.length !== 2) {
			cleanup(container);
			return fail(`Expected 2 after replacement, got ${opts.length}`);
		}
		cleanup(container);
		pass();
	},

	'setOptions should return this for chaining': async ({pass, fail}) => {
		const { container, el } = await createCombobox();
		if(el.setOptions(['A']) !== el) {
			cleanup(container);
			return fail('setOptions should return this');
		}
		cleanup(container);
		pass();
	},

	/*
		clear Method
	*/
	'should clear value and close': async ({pass, fail}) => {
		const { container, el } = await createCombobox({}, fruitOptions);
		el.value = 'test';
		el.opened = true;
		el.clear();
		if(el.value !== '' || el.opened !== false) {
			cleanup(container);
			return fail(`clear() did not reset: value='${el.value}', opened=${el.opened}`);
		}
		cleanup(container);
		pass();
	},

	'clear should return this for chaining': async ({pass, fail}) => {
		const { container, el } = await createCombobox();
		if(el.clear() !== el) {
			cleanup(container);
			return fail('clear should return this');
		}
		cleanup(container);
		pass();
	},

	/*
		Filtering
	*/
	'should filter options by input value': async ({pass, fail}) => {
		const { container, el } = await createCombobox({}, fruitOptions);
		el.value = 'an';
		el.opened = true;
		await el.updateComplete;
		const items = el.shadowRoot.querySelectorAll('.option');
		if(items.length !== 1) {
			cleanup(container);
			return fail(`Expected 1 filtered item (Banana), got ${items.length}`);
		}
		if(items[0].textContent.trim() !== 'Banana') {
			cleanup(container);
			return fail(`Expected 'Banana', got '${items[0].textContent}'`);
		}
		cleanup(container);
		pass();
	},

	'should filter object options set via setOptions': async ({pass, fail}) => {
		const { container, el } = await createCombobox();
		el.setOptions([
			{ label: 'alice@test.com', value: 'a1' },
			{ label: 'bob@test.com', value: 'b2' },
			{ label: 'alicia@test.com', value: 'a3' }
		]);
		el.value = 'ali';
		el.opened = true;
		await el.updateComplete;
		const items = el.shadowRoot.querySelectorAll('.option');
		if(items.length !== 2) {
			cleanup(container);
			return fail(`Expected 2 filtered items, got ${items.length}`);
		}
		cleanup(container);
		pass();
	},

	'should show all options when value is empty': async ({pass, fail}) => {
		const { container, el } = await createCombobox({}, fruitOptions);
		el.value = '';
		el.opened = true;
		await el.updateComplete;
		const items = el.shadowRoot.querySelectorAll('.option');
		if(items.length !== 4) {
			cleanup(container);
			return fail(`Expected 4, got ${items.length}`);
		}
		cleanup(container);
		pass();
	},

	'should show no-results when nothing matches': async ({pass, fail}) => {
		const { container, el } = await createCombobox({}, fruitOptions);
		el.value = 'zzz';
		el.opened = true;
		await el.updateComplete;
		if(!el.shadowRoot.querySelector('.no-results')) {
			cleanup(container);
			return fail('No-results message should be displayed');
		}
		cleanup(container);
		pass();
	},

	/*
		Max Visible
	*/
	'should limit visible options to maxVisible': async ({pass, fail}) => {
		const { container, el } = await createCombobox({ maxVisible: 2 }, fruitOptions);
		el.opened = true;
		await el.updateComplete;
		const items = el.shadowRoot.querySelectorAll('.option');
		if(items.length !== 2) {
			cleanup(container);
			return fail(`Expected 2 visible, got ${items.length}`);
		}
		cleanup(container);
		pass();
	},

	'should show more indicator when options exceed maxVisible': async ({pass, fail}) => {
		const { container, el } = await createCombobox({ maxVisible: 2 }, fruitOptions);
		el.opened = true;
		await el.updateComplete;
		const more = el.shadowRoot.querySelector('.more');
		if(!more) {
			cleanup(container);
			return fail('More indicator should be shown');
		}
		if(!more.textContent.includes('2 more')) {
			cleanup(container);
			return fail(`Expected '2 more...', got '${more.textContent}'`);
		}
		cleanup(container);
		pass();
	},

	/*
		Events
	*/
	'should fire select event when option is clicked': async ({pass, fail}) => {
		const { container, el } = await createCombobox({}, fruitOptions);
		el.opened = true;
		await el.updateComplete;
		let selected = null;
		el.addEventListener('select', e => { selected = e.detail; });
		el.shadowRoot.querySelector('.option').click();
		await el.updateComplete;
		if(!selected || selected.value !== 'apple') {
			cleanup(container);
			return fail(`Expected value 'apple', got ${JSON.stringify(selected)}`);
		}
		if(selected.label !== 'Apple') {
			cleanup(container);
			return fail(`Expected label 'Apple', got '${selected.label}'`);
		}
		cleanup(container);
		pass();
	},

	'should fire change event after selecting': async ({pass, fail}) => {
		const { container, el } = await createCombobox({}, fruitOptions);
		el.opened = true;
		await el.updateComplete;
		let changed = false;
		el.addEventListener('change', () => { changed = true; });
		el.shadowRoot.querySelector('.option').click();
		await el.updateComplete;
		if(!changed) {
			cleanup(container);
			return fail('change event should have fired');
		}
		cleanup(container);
		pass();
	},

	'should close dropdown after selecting an option': async ({pass, fail}) => {
		const { container, el } = await createCombobox({}, fruitOptions);
		el.opened = true;
		await el.updateComplete;
		el.shadowRoot.querySelector('.option').click();
		await el.updateComplete;
		if(el.opened) {
			cleanup(container);
			return fail('Dropdown should close after selection');
		}
		cleanup(container);
		pass();
	},

	'should set value to selected option label': async ({pass, fail}) => {
		const { container, el } = await createCombobox({}, '<k-option value="a1">Alpha</k-option>');
		el.opened = true;
		await el.updateComplete;
		el.shadowRoot.querySelector('.option').click();
		await el.updateComplete;
		if(el.value !== 'Alpha') {
			cleanup(container);
			return fail(`Expected 'Alpha', got '${el.value}'`);
		}
		cleanup(container);
		pass();
	},

	'should fire search event after debounce': async ({pass, fail}) => {
		const { container, el } = await createCombobox({ debounceMs: 50 });
		let searchValue = null;
		el.addEventListener('search', e => { searchValue = e.detail.value; });
		const input = el.shadowRoot.querySelector('input');
		input.value = 'test';
		input.dispatchEvent(new Event('input'));
		await new Promise(r => setTimeout(r, 100));
		if(searchValue !== 'test') {
			cleanup(container);
			return fail(`Expected 'test', got '${searchValue}'`);
		}
		cleanup(container);
		pass();
	},

	/*
		Keyboard Navigation
	*/
	'should open dropdown on ArrowDown': async ({pass, fail}) => {
		const { container, el } = await createCombobox({}, fruitOptions);
		const input = el.shadowRoot.querySelector('input');
		input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
		await el.updateComplete;
		if(!el.opened) {
			cleanup(container);
			return fail('Dropdown should open on ArrowDown');
		}
		cleanup(container);
		pass();
	},

	'should close dropdown on Escape': async ({pass, fail}) => {
		const { container, el } = await createCombobox({}, fruitOptions);
		el.opened = true;
		await el.updateComplete;
		const input = el.shadowRoot.querySelector('input');
		input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		await el.updateComplete;
		if(el.opened) {
			cleanup(container);
			return fail('Dropdown should close on Escape');
		}
		cleanup(container);
		pass();
	},

	'should select focused option on Enter': async ({pass, fail}) => {
		const { container, el } = await createCombobox({}, fruitOptions);
		el.opened = true;
		await el.updateComplete;
		const input = el.shadowRoot.querySelector('input');
		input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
		await el.updateComplete;
		let selected = null;
		el.addEventListener('select', e => { selected = e.detail; });
		input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
		await el.updateComplete;
		if(!selected || selected.value !== 'apple') {
			cleanup(container);
			return fail(`Expected 'apple', got ${JSON.stringify(selected)}`);
		}
		cleanup(container);
		pass();
	},

	/*
		Searching Indicator
	*/
	'should show spinner when searching and opened': async ({pass, fail}) => {
		const { container, el } = await createCombobox({ searching: true }, fruitOptions);
		el.opened = true;
		await el.updateComplete;
		if(!el.shadowRoot.querySelector('.searching k-spinner')) {
			cleanup(container);
			return fail('Spinner should be visible');
		}
		cleanup(container);
		pass();
	},

	'should not show spinner when not searching': async ({pass, fail}) => {
		const { container, el } = await createCombobox({}, fruitOptions);
		el.opened = true;
		await el.updateComplete;
		if(el.shadowRoot.querySelector('.searching')) {
			cleanup(container);
			return fail('Searching indicator should not be visible');
		}
		cleanup(container);
		pass();
	},

	/*
		Document Click
	*/
	'should close on outside click': async ({pass, fail}) => {
		const { container, el } = await createCombobox({}, fruitOptions);
		el.opened = true;
		await el.updateComplete;
		document.body.click();
		await el.updateComplete;
		if(el.opened) {
			cleanup(container);
			return fail('Dropdown should close on outside click');
		}
		cleanup(container);
		pass();
	},

	/*
		Form Association
	*/
	'should be form-associated': async ({pass, fail}) => {
		if(Combobox.formAssociated !== true) return fail('formAssociated should be true');
		pass();
	},

	'should have internals': async ({pass, fail}) => {
		const { container, el } = await createCombobox();
		if(!el.internals) {
			cleanup(container);
			return fail('internals should exist');
		}
		cleanup(container);
		pass();
	},

	'should submit matched option value in form': async ({pass, fail}) => {
		const form = document.createElement('form');
		form.innerHTML = `
			<k-combobox name="fruit">
				<k-option value="a1">Apple</k-option>
			</k-combobox>
		`;
		document.body.appendChild(form);
		const el = form.querySelector('k-combobox');
		await el.updateComplete;
		el.value = 'Apple';
		await el.updateComplete;
		const data = new FormData(form);
		document.body.removeChild(form);
		if(data.get('fruit') !== 'a1') return fail(`Expected 'a1', got '${data.get('fruit')}'`);
		pass();
	},

	/*
		Required Validation
	*/
	'required: invalid when empty': async ({pass, fail}) => {
		const { container, el } = await createCombobox({ required: true }, fruitOptions);
		await el.updateComplete;
		if(el.internals.checkValidity()) {
			cleanup(container);
			return fail('Should be invalid when required and empty');
		}
		cleanup(container);
		pass();
	},

	'required: valid when has value': async ({pass, fail}) => {
		const { container, el } = await createCombobox({ required: true }, fruitOptions);
		el.value = 'anything';
		await el.updateComplete;
		if(!el.internals.checkValidity()) {
			cleanup(container);
			return fail('Should be valid when required and has value');
		}
		cleanup(container);
		pass();
	},

	/*
		Require-Match Validation
	*/
	'require-match: valid when empty': async ({pass, fail}) => {
		const { container, el } = await createCombobox({ requireMatch: true }, fruitOptions);
		await el.updateComplete;
		if(!el.internals.checkValidity()) {
			cleanup(container);
			return fail('Should be valid when empty (not required)');
		}
		cleanup(container);
		pass();
	},

	'require-match: invalid when value does not match': async ({pass, fail}) => {
		const { container, el } = await createCombobox({ requireMatch: true }, fruitOptions);
		el.value = 'not a fruit';
		await el.updateComplete;
		if(el.internals.checkValidity()) {
			cleanup(container);
			return fail('Should be invalid when value does not match any option');
		}
		cleanup(container);
		pass();
	},

	'require-match: valid when value matches option label': async ({pass, fail}) => {
		const { container, el } = await createCombobox({ requireMatch: true }, fruitOptions);
		el.value = 'Apple';
		await el.updateComplete;
		if(!el.internals.checkValidity()) {
			cleanup(container);
			return fail('Should be valid when value matches an option label');
		}
		cleanup(container);
		pass();
	},

	/*
		Form Reset
	*/
	'should clear value on form reset': async ({pass, fail}) => {
		const form = document.createElement('form');
		form.innerHTML = `
			<k-combobox name="fruit">
				<k-option value="a1">Apple</k-option>
			</k-combobox>
		`;
		document.body.appendChild(form);
		const el = form.querySelector('k-combobox');
		await el.updateComplete;
		el.value = 'Apple';
		await el.updateComplete;
		form.reset();
		await el.updateComplete;
		document.body.removeChild(form);
		if(el.value !== '') return fail(`Expected '' after reset, got '${el.value}'`);
		pass();
	},

	/*
		Disabled
	*/
	'should render disabled input when disabled': async ({pass, fail}) => {
		const { container, el } = await createCombobox({ disabled: true });
		if(!el.shadowRoot.querySelector('input').disabled) {
			cleanup(container);
			return fail('Input should be disabled');
		}
		cleanup(container);
		pass();
	},
};
