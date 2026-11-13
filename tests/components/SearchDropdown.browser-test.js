import SearchDropdown from '../../src/components/SearchDropdown.js';

const mount = async (markup, wrap = 'div') => {
	const container = document.createElement(wrap);
	container.innerHTML = markup;
	document.body.appendChild(container);
	const el = container.querySelector('k-search-dropdown');
	await el.updateComplete;
	await new Promise(resolve => setTimeout(resolve));
	return { container, el };
};

const type = async (el, text) => {
	const input = el.shadowRoot.querySelector('input');
	input.value = text;
	input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
	await el.updateComplete;
};

const press = async (el, key) => {
	el.shadowRoot.querySelector('input').dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, composed: true }));
	await el.updateComplete;
};

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const results = [
	{ title: 'Pricing', url: '#sd-pricing', description: 'What our plans cost', group: 'Pages' },
	{ title: 'About us', url: '#sd-about', group: 'Pages' },
	{ title: 'Ada', description: 'ada@example.com', group: 'Users' }
];

const rows = el => [...el.shadowRoot.querySelectorAll('.result')];

export default {
	/*
		Basics
	*/
	'creates a search dropdown element with a shadow root': async ({pass, fail}) => {
		const { container, el } = await mount('<k-search-dropdown></k-search-dropdown>');
		const ok = el instanceof SearchDropdown && !!el.shadowRoot;
		container.remove();
		ok ? pass() : fail('Element should be a SearchDropdown with a shadow root');
	},

	'has sensible defaults': async ({pass, fail}) => {
		const { container, el } = await mount('<k-search-dropdown></k-search-dropdown>');
		const ok = el.value === '' && el.opened === false && el.searching === false && el.minLength === 2 && el.debounceMs === 300 && el.noResultsMessage === 'No results';
		container.remove();
		ok ? pass() : fail('Unexpected defaults');
	},

	/*
		Searching
	*/
	'fires search with the trimmed text once typing pauses, and shows the spinner': async ({pass, fail}) => {
		const { container, el } = await mount('<k-search-dropdown debounce-ms="10"></k-search-dropdown>');
		const heard = [];
		el.addEventListener('search', e => heard.push(e.detail.value));
		await type(el, '  pric ');
		const showsSpinner = el.searching === true && el.opened === true && !!el.shadowRoot.querySelector('k-spinner');
		await wait(60);
		container.remove();
		if(heard.join() !== 'pric') return fail(`heard ${JSON.stringify(heard)}`);
		showsSpinner ? pass() : fail('should be searching, open and show the spinner while waiting');
	},

	'typing fewer characters than min-length does not search or open': async ({pass, fail}) => {
		const { container, el } = await mount('<k-search-dropdown debounce-ms="10" min-length="3"></k-search-dropdown>');
		let heard = 0;
		el.addEventListener('search', () => heard++);
		await type(el, 'ab');
		await wait(60);
		const ok = heard === 0 && el.opened === false && el.searching === false;
		container.remove();
		ok ? pass() : fail(`heard ${heard}, opened ${el.opened}`);
	},

	'only the last text typed is searched': async ({pass, fail}) => {
		const { container, el } = await mount('<k-search-dropdown debounce-ms="30"></k-search-dropdown>');
		const heard = [];
		el.addEventListener('search', e => heard.push(e.detail.value));
		await type(el, 'pr');
		await type(el, 'pri');
		await type(el, 'pric');
		await wait(100);
		container.remove();
		heard.join() === 'pric' ? pass() : fail(`heard ${JSON.stringify(heard)}`);
	},

	/*
		Results
	*/
	'setResults draws each result, with a heading where the group changes': async ({pass, fail}) => {
		const { container, el } = await mount('<k-search-dropdown debounce-ms="10"></k-search-dropdown>');
		await type(el, 'a');
		await type(el, 'ab');
		el.setResults(results);
		await el.updateComplete;
		const headings = [...el.shadowRoot.querySelectorAll('.group')].map(group => group.textContent.trim());
		const count = rows(el).length;
		const spinner = el.searching;
		container.remove();
		if(count !== 3) return fail(`${count} results`);
		if(headings.join() !== 'Pages,Users') return fail(`headings ${headings}`);
		spinner ? fail('still searching') : pass();
	},

	'a result with an address is a link, and one without is not': async ({pass, fail}) => {
		const { container, el } = await mount('<k-search-dropdown></k-search-dropdown>');
		await type(el, 'ab');
		el.setResults(results);
		await el.updateComplete;
		const [first, , third] = rows(el);
		const ok = first.tagName === 'A' && first.getAttribute('href') === '#sd-pricing' && third.tagName !== 'A' && first.querySelector('.description').textContent.trim() === 'What our plans cost';
		container.remove();
		ok ? pass() : fail('wrong elements');
	},

	'no results says so, and an error is shown': async ({pass, fail}) => {
		const { container, el } = await mount('<k-search-dropdown no-results-message="Nothing here"></k-search-dropdown>');
		await type(el, 'zz');
		el.setResults([]);
		await el.updateComplete;
		const empty = el.shadowRoot.querySelector('.message')?.textContent.trim();
		el.setError('The search failed.');
		await el.updateComplete;
		const error = el.shadowRoot.querySelector('.message.error')?.textContent.trim();
		container.remove();
		if(empty !== 'Nothing here') return fail(`empty message was "${empty}"`);
		error === 'The search failed.' ? pass() : fail(`error was "${error}"`);
	},

	/*
		Keyboard and selection
	*/
	'arrow keys move through the results and Enter selects one': async ({pass, fail}) => {
		const { container, el } = await mount('<k-search-dropdown></k-search-dropdown>');
		await type(el, 'ab');
		el.setResults(results);
		el.addEventListener('select', e => e.preventDefault());
		let chosen = null;
		el.addEventListener('select', e => { chosen = e.detail.result; });
		await el.updateComplete;
		await press(el, 'ArrowDown');
		await press(el, 'ArrowDown');
		const focusedTitle = el.shadowRoot.querySelector('.result.focused .title')?.textContent.trim();
		await press(el, 'Enter');
		container.remove();
		if(focusedTitle !== 'About us') return fail(`focused "${focusedTitle}"`);
		chosen?.title === 'About us' ? pass() : fail(`selected ${JSON.stringify(chosen)}`);
	},

	'Enter on a result follows its address unless select is cancelled': async ({pass, fail}) => {
		const before = location.hash;
		const { container, el } = await mount('<k-search-dropdown></k-search-dropdown>');
		await type(el, 'ab');
		el.setResults(results);
		await el.updateComplete;
		el.addEventListener('select', e => e.preventDefault(), { once: true });
		await press(el, 'ArrowDown');
		await press(el, 'Enter');
		const cancelled = location.hash;
		await type(el, 'ab');
		el.setResults(results);
		await el.updateComplete;
		await press(el, 'ArrowDown');
		await press(el, 'Enter');
		const followed = location.hash;
		container.remove();
		history.replaceState(null, '', location.pathname + location.search + before);
		if(cancelled !== before) return fail(`a cancelled select still went to ${cancelled}`);
		followed === '#sd-pricing' ? pass() : fail(`went to ${followed}`);
	},

	'clicking a result fires select, which can cancel the link': async ({pass, fail}) => {
		const { container, el } = await mount('<k-search-dropdown></k-search-dropdown>');
		await type(el, 'ab');
		el.setResults(results);
		await el.updateComplete;
		let heard = null;
		el.addEventListener('select', e => {
			heard = e.detail.result.title;
			e.preventDefault();
		});
		const before = location.hash;
		rows(el)[0].click();
		await el.updateComplete;
		const ok = heard === 'Pricing' && location.hash === before && el.opened === false;
		container.remove();
		ok ? pass() : fail(`heard ${heard}, hash ${location.hash}, opened ${el.opened}`);
	},

	'Escape and a click outside close the list': async ({pass, fail}) => {
		const { container, el } = await mount('<k-search-dropdown></k-search-dropdown>');
		await type(el, 'ab');
		el.setResults(results);
		await el.updateComplete;
		const opened = el.opened;
		await press(el, 'Escape');
		const afterEscape = el.opened;
		await press(el, 'ArrowDown');
		const reopened = el.opened;
		document.body.click();
		await el.updateComplete;
		const afterClick = el.opened;
		container.remove();
		opened && !afterEscape && reopened && !afterClick ? pass() : fail(`${opened} ${afterEscape} ${reopened} ${afterClick}`);
	},

	'focusing the input again shows the results already found': async ({pass, fail}) => {
		const { container, el } = await mount('<k-search-dropdown></k-search-dropdown>');
		await type(el, 'ab');
		el.setResults(results);
		await press(el, 'Escape');
		el.shadowRoot.querySelector('input').dispatchEvent(new FocusEvent('focus'));
		await el.updateComplete;
		const ok = el.opened === true && rows(el).length === 3;
		container.remove();
		ok ? pass() : fail('results were not shown again');
	},

	'clear empties the value and the results and closes': async ({pass, fail}) => {
		const { container, el } = await mount('<k-search-dropdown></k-search-dropdown>');
		await type(el, 'ab');
		el.setResults(results);
		el.clear();
		await el.updateComplete;
		const ok = el.value === '' && el.opened === false && el.results === null;
		container.remove();
		ok ? pass() : fail('not cleared');
	},

	/*
		Form
	*/
	'submits its text under its name': async ({pass, fail}) => {
		const { container, el } = await mount('<form><k-search-dropdown name="q"></k-search-dropdown></form>', 'div');
		await type(el, 'pricing');
		const submitted = new FormData(container.querySelector('form')).get('q');
		container.remove();
		submitted === 'pricing' ? pass() : fail(`submitted ${submitted}`);
	},

	'Enter with no result chosen submits the form': async ({pass, fail}) => {
		const { container, el } = await mount('<form><k-search-dropdown name="q"></k-search-dropdown></form>', 'div');
		const form = container.querySelector('form');
		let sent = null;
		form.addEventListener('submit', e => {
			e.preventDefault();
			sent = new FormData(form).get('q');
		});
		await type(el, 'pricing');
		await press(el, 'Enter');
		container.remove();
		sent === 'pricing' ? pass() : fail(`submitted ${sent}`);
	},

	'required is invalid while empty and valid once filled': async ({pass, fail}) => {
		const { container, el } = await mount('<form><k-search-dropdown name="q" required></k-search-dropdown></form>', 'div');
		const form = container.querySelector('form');
		const emptyInvalid = !form.checkValidity();
		await type(el, 'pricing');
		const filledValid = form.checkValidity();
		container.remove();
		emptyInvalid && filledValid ? pass() : fail(`empty invalid ${emptyInvalid}, filled valid ${filledValid}`);
	},

	'a form reset restores the starting text': async ({pass, fail}) => {
		const { container, el } = await mount('<form><k-search-dropdown name="q" value="start"></k-search-dropdown></form>', 'div');
		const form = container.querySelector('form');
		await type(el, 'changed');
		form.reset();
		await el.updateComplete;
		const ok = el.value === 'start' && new FormData(form).get('q') === 'start' && el.opened === false;
		container.remove();
		ok ? pass() : fail(`value ${el.value}`);
	},

	'a disabled fieldset disables it': async ({pass, fail}) => {
		const { container, el } = await mount('<form><fieldset disabled><k-search-dropdown name="q"></k-search-dropdown></fieldset></form>', 'div');
		await wait(10);
		const ok = el.disabled === true && el.shadowRoot.querySelector('input').disabled === true;
		container.remove();
		ok ? pass() : fail('not disabled');
	},

	/*
		Read-only
	*/
	'readonly keeps the text in the form but cannot be typed in or opened': async ({pass, fail}) => {
		const { container, el } = await mount('<form><k-search-dropdown name="q" readonly value="pricing" debounce-ms="10"></k-search-dropdown></form>', 'div');
		const input = el.shadowRoot.querySelector('input');
		let heard = 0;
		el.addEventListener('search', () => heard++);
		await type(el, 'something else');
		await wait(60);
		await press(el, 'ArrowDown');
		const submitted = new FormData(container.querySelector('form')).get('q');
		const ok = input.readOnly === true && heard === 0 && el.opened === false && el.value === 'pricing' && submitted === 'pricing';
		container.remove();
		ok ? pass() : fail(`readOnly ${input.readOnly}, heard ${heard}, opened ${el.opened}, value ${el.value}, submitted ${submitted}`);
	}
};
