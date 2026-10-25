import '../../../src/components/controls/TcOpen.js';
import '../../../src/components/Table.js';
import Table from '../../../src/components/Table.js';

const createTable = async (controlsHtml, records) => {
	const container = document.createElement('div');
	container.innerHTML = `<k-table>${controlsHtml}</k-table>`;
	document.body.appendChild(container);
	const table = container.querySelector('k-table');
	table.setRecords(records.map(r => ({ ...r })));
	await table.updateComplete;
	await new Promise(r => setTimeout(r, 0));
	return { container, table, control: table.querySelector('kc-tc-open') };
};

const cleanup = (container) => {
	if(container?.parentNode) container.parentNode.removeChild(container);
};

const records = [
	{ name: 'Alice', _url: 'https://example.com/alice' },
	{ name: 'Bob' }
];

export default {
	'Open: default icon is visibility and title is Open': async ({ pass, fail }) => {
		const { container, table } = await createTable('<kc-tc-open slot="before"></kc-tc-open>', records);
		const control = table.querySelector('kc-tc-open');
		await control.updateComplete;
		const icon = control.shadowRoot.querySelector('k-icon')?.getAttribute('name');
		if(icon === 'visibility' && control.title === 'Open') pass('Default icon and title are correct');
		else fail(`Expected visibility/Open, got ${icon}/${control.title}`);
		cleanup(container);
	},

	'Open: target _blank uses open_in_browser icon and new tab title': async ({ pass, fail }) => {
		const { container, table } = await createTable('<kc-tc-open slot="after" target="_blank"></kc-tc-open>', records);
		const control = table.querySelector('kc-tc-open');
		await control.updateComplete;
		const icon = control.shadowRoot.querySelector('k-icon')?.getAttribute('name');
		if(icon === 'open_in_browser' && control.title === 'Open in New Tab') pass('New tab icon and title are correct');
		else fail(`Expected open_in_browser/Open in New Tab, got ${icon}/${control.title}`);
		cleanup(container);
	},

	'Open: slotted icon overrides the default icon': async ({ pass, fail }) => {
		const { container, table } = await createTable('<kc-tc-open slot="before"><k-icon name="check"></k-icon></kc-tc-open>', records);
		const control = table.shadowRoot.querySelector('tr.record kc-tc-open');
		await control.updateComplete;
		const assigned = control.shadowRoot.querySelector('slot').assignedElements();
		if(assigned.length === 1 && assigned[0].getAttribute('name') === 'check') pass('Slotted icon replaces the default');
		else fail('Slotted icon did not replace the default fallback');
		cleanup(container);
	},

	'Open: target _blank opens the _url in a new tab': async ({ pass, fail }) => {
		const { container, table } = await createTable('<kc-tc-open slot="before" target="_blank"></kc-tc-open>', records);
		const control = table.shadowRoot.querySelector('tr.record kc-tc-open');
		await control.updateComplete;
		const calls = [];
		const original = window.open;
		window.open = (...args) => { calls.push(args); return null; };
		try {
			control.click();
		} finally {
			window.open = original;
		}
		if(calls.length === 1 && calls[0][0] === 'https://example.com/alice' && calls[0][1] === '_blank') pass('window.open called with _url and _blank');
		else fail(`Unexpected window.open calls: ${JSON.stringify(calls)}`);
		cleanup(container);
	},

	'Open: record without _url does nothing on click': async ({ pass, fail }) => {
		const { container, table } = await createTable('<kc-tc-open slot="before" target="_blank"></kc-tc-open>', records);
		const bobControl = table.shadowRoot.querySelectorAll('tr.record kc-tc-open')[1];
		let called = false;
		const original = window.open;
		window.open = () => { called = true; return null; };
		try {
			bobControl.click();
		} finally {
			window.open = original;
		}
		if(!called) pass('No window.open call when _url is missing');
		else fail('window.open was called for a record without _url');
		cleanup(container);
	},

	'Table: _url is not extracted as a field': async ({ pass, fail }) => {
		const fields = Table.extractFieldsFromRecords(records);
		const names = fields.map(f => f.name);
		if(names.includes('name') && !names.includes('_url')) pass('_url excluded from extracted fields');
		else fail(`Unexpected fields: ${names.join(', ')}`);
	},

	'Table: row click opens _url in a new tab with open-on-click and row-target _blank': async ({ pass, fail }) => {
		const { container, table } = await createTable('', records);
		table.setAttribute('open-on-click', '');
		table.setAttribute('row-target', '_blank');
		await table.updateComplete;
		const calls = [];
		const original = window.open;
		window.open = (...args) => { calls.push(args); return null; };
		try {
			table.shadowRoot.querySelector('tr.record td[data-field="name"]').click();
		} finally {
			window.open = original;
		}
		if(calls.length === 1 && calls[0][0] === 'https://example.com/alice' && calls[0][1] === '_blank') pass('Row click opens _url in a new tab');
		else fail(`Unexpected window.open calls: ${JSON.stringify(calls)}`);
		cleanup(container);
	},

	'Table: row click does nothing without open-on-click': async ({ pass, fail }) => {
		const { container, table } = await createTable('', records);
		table.setAttribute('row-target', '_blank');
		await table.updateComplete;
		let called = false;
		const original = window.open;
		window.open = () => { called = true; return null; };
		try {
			table.shadowRoot.querySelector('tr.record td[data-field="name"]').click();
		} finally {
			window.open = original;
		}
		if(!called) pass('No row navigation without open-on-click');
		else fail('Row click opened a URL without open-on-click');
		cleanup(container);
	},

	'Table: row click does nothing for a record without _url': async ({ pass, fail }) => {
		const { container, table } = await createTable('', records);
		table.setAttribute('open-on-click', '');
		table.setAttribute('row-target', '_blank');
		await table.updateComplete;
		let called = false;
		const original = window.open;
		window.open = () => { called = true; return null; };
		try {
			table.shadowRoot.querySelectorAll('tr.record td[data-field="name"]')[1].click();
		} finally {
			window.open = original;
		}
		if(!called) pass('Row without _url is not opened');
		else fail('Row without _url opened a URL');
		cleanup(container);
	},

	'Table: clicking a row control does not also trigger the row': async ({ pass, fail }) => {
		const { container, table } = await createTable('<kc-tc-open slot="before" target="_blank"></kc-tc-open>', records);
		table.setAttribute('open-on-click', '');
		await table.updateComplete;
		const calls = [];
		const original = window.open;
		window.open = (...args) => { calls.push(args); return null; };
		try {
			table.shadowRoot.querySelector('tr.record kc-tc-open').click();
		} finally {
			window.open = original;
		}
		if(calls.length === 1) pass('Row control click opens once, row handler skipped');
		else fail(`Expected one window.open call, got ${calls.length}`);
		cleanup(container);
	},

	'Table: _url is not rendered as a cell': async ({ pass, fail }) => {
		const { container, table } = await createTable('', records);
		const headers = [...table.shadowRoot.querySelectorAll('thead th')].map(th => th.textContent.trim());
		const cellText = [...table.shadowRoot.querySelectorAll('tbody td')].map(td => td.textContent.trim());
		if(!headers.some(h => /url/i.test(h)) && !cellText.some(t => t.includes('example.com'))) pass('_url is not rendered');
		else fail('_url was rendered in the table');
		cleanup(container);
	}
};
