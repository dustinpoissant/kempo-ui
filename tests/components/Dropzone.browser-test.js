import Dropzone from '../../src/components/Dropzone.js';

const createDropzone = async (attrs = '') => {
	const container = document.createElement('div');
	container.innerHTML = `<k-dropzone ${attrs}></k-dropzone>`;
	document.body.appendChild(container);
	const el = container.querySelector('k-dropzone');
	await el.updateComplete;
	return { container, el };
};

const cleanup = container => {
	container?.parentNode?.removeChild(container);
};

const file = (name, type = '') => new File(['x'], name, { type });

const drop = (el, files) => {
	const transfer = new DataTransfer();
	files.forEach(item => transfer.items.add(item));
	const zone = el.shadowRoot.querySelector('#zone');
	zone.dispatchEvent(new DragEvent('dragenter', { dataTransfer: transfer, bubbles: true, cancelable: true }));
	zone.dispatchEvent(new DragEvent('drop', { dataTransfer: transfer, bubbles: true, cancelable: true }));
};

const listen = el => {
	const events = [];
	el.addEventListener('files', event => events.push(event.detail));
	return events;
};

export default {
	'should create the element and say what it is for': async ({ pass, fail }) => {
		const { container, el } = await createDropzone();
		const text = el.shadowRoot.querySelector('#zone').textContent.trim();
		const isInstance = el instanceof Dropzone;
		cleanup(container);
		if(!isInstance) return fail('Element should be an instance of Dropzone');
		if(!/Drag and drop a file here, or click to choose one/.test(text)) return fail(`Unexpected label: ${text}`);
		pass('Renders the label');
	},

	'should say files, not a file, when it takes several': async ({ pass, fail }) => {
		const { container, el } = await createDropzone('multiple');
		const text = el.shadowRoot.querySelector('#zone').textContent.trim();
		cleanup(container);
		if(!/files here, or click to choose them/.test(text)) return fail(`Unexpected label: ${text}`);
		pass('Label follows multiple');
	},

	'should use its label and slotted content': async ({ pass, fail }) => {
		const { container, el } = await createDropzone('label="Drop the photos"');
		const labelled = el.shadowRoot.querySelector('#zone span').textContent;
		el.innerHTML = '<b>Mine</b>';
		await el.updateComplete;
		const slotted = el.shadowRoot.querySelector('slot').assignedElements().length;
		cleanup(container);
		if(labelled !== 'Drop the photos') return fail(`Label was "${labelled}"`);
		if(slotted !== 1) return fail('Slotted content should replace the default');
		pass('Label and slot work');
	},

	'should report dropped files in a files event': async ({ pass, fail }) => {
		const { container, el } = await createDropzone('multiple');
		const events = listen(el);
		drop(el, [file('a.png', 'image/png'), file('b.txt', 'text/plain')]);
		cleanup(container);
		if(events.length !== 1) return fail(`Expected 1 event, got ${events.length}`);
		if(events[0].files.map(item => item.name).join() !== 'a.png,b.txt') return fail('Both files should be reported');
		if(events[0].rejected.length) return fail('Nothing should be rejected');
		pass('files event carries the files');
	},

	'should keep only the first file when it takes one': async ({ pass, fail }) => {
		const { container, el } = await createDropzone();
		const events = listen(el);
		drop(el, [file('a.png', 'image/png'), file('b.png', 'image/png')]);
		cleanup(container);
		if(events[0].files.map(item => item.name).join() !== 'a.png') return fail('Only the first file should be kept');
		if(events[0].rejected.map(item => item.name).join() !== 'b.png') return fail('The others should be rejected');
		pass('Single mode keeps one');
	},

	'should reject files that do not match accept': async ({ pass, fail }) => {
		const { container, el } = await createDropzone('multiple accept="image/*,.pdf"');
		const events = listen(el);
		drop(el, [file('a.png', 'image/png'), file('b.PDF', 'application/pdf'), file('c.txt', 'text/plain'), file('d.mp4', 'video/mp4')]);
		cleanup(container);
		if(events[0].files.map(item => item.name).join() !== 'a.png,b.PDF') return fail(`Accepted ${events[0].files.map(item => item.name)}`);
		if(events[0].rejected.map(item => item.name).join() !== 'c.txt,d.mp4') return fail(`Rejected ${events[0].rejected.map(item => item.name)}`);
		pass('accept filters files by type and extension');
	},

	'should show that a drag is over it until it leaves or drops': async ({ pass, fail }) => {
		const { container, el } = await createDropzone();
		const zone = el.shadowRoot.querySelector('#zone');
		zone.dispatchEvent(new DragEvent('dragenter', { bubbles: true, cancelable: true }));
		await el.updateComplete;
		const over = el.hasAttribute('dragging');
		zone.dispatchEvent(new DragEvent('dragleave', { bubbles: true }));
		await el.updateComplete;
		const left = el.hasAttribute('dragging');
		cleanup(container);
		if(!over) return fail('Should show the drag while it is over');
		if(left) return fail('Should stop showing it when the drag leaves');
		pass('dragging follows the drag');
	},

	'should open the file picker on click and on Enter or Space': async ({ pass, fail }) => {
		const { container, el } = await createDropzone();
		const input = el.shadowRoot.querySelector('#input');
		let opened = 0;
		input.click = () => { opened++; };
		const zone = el.shadowRoot.querySelector('#zone');
		zone.click();
		zone.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
		zone.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
		zone.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true }));
		cleanup(container);
		if(opened !== 3) return fail(`The picker should open 3 times, opened ${opened}`);
		pass('Click and keys open the picker');
	},

	'should report the files chosen in the picker': async ({ pass, fail }) => {
		const { container, el } = await createDropzone('multiple');
		const events = listen(el);
		const input = el.shadowRoot.querySelector('#input');
		const transfer = new DataTransfer();
		transfer.items.add(file('picked.png', 'image/png'));
		input.files = transfer.files;
		input.dispatchEvent(new Event('change', { bubbles: true }));
		cleanup(container);
		if(events.length !== 1 || events[0].files[0].name !== 'picked.png') return fail('The picked file should be reported');
		pass('The picker reports files too');
	},

	'should do nothing while disabled': async ({ pass, fail }) => {
		const { container, el } = await createDropzone('disabled');
		const events = listen(el);
		const input = el.shadowRoot.querySelector('#input');
		let opened = 0;
		input.click = () => { opened++; };
		el.shadowRoot.querySelector('#zone').click();
		drop(el, [file('a.png', 'image/png')]);
		const dragging = el.hasAttribute('dragging');
		cleanup(container);
		if(opened) return fail('A disabled dropzone should not open the picker');
		if(events.length) return fail('A disabled dropzone should not report files');
		if(dragging) return fail('A disabled dropzone should not show a drag');
		pass('Disabled does nothing');
	}
};
