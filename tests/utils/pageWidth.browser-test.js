const wait = (ms = 100) => new Promise(r => setTimeout(r, ms));

const createFrame = async width => {
	const frame = document.createElement('iframe');
	frame.style.cssText = `width: ${width}px; height: 200px; border: 0`;
	const url = new URL('../../src/utils/pageWidth.js', import.meta.url).href;
	frame.srcdoc = `<!doctype html><body><div style="height: 2000px">tall</div><script type="module" src="${url}"></script></body>`;
	document.body.appendChild(frame);
	await new Promise(resolve => { frame.onload = resolve; });
	await wait(300);
	return frame;
};

const widthOf = frame => frame.contentDocument.documentElement.style.getPropertyValue('--page-width');

export default {
	'should publish the page width without the scrollbar as --page-width': async ({pass, fail}) => {
		const frame = await createFrame(420);
		const value = widthOf(frame);
		const expected = `${frame.contentDocument.documentElement.clientWidth}px`;
		frame.remove();
		if(value !== expected) return fail(`Expected ${expected}, got "${value}"`);
		pass('--page-width is the root element width');
	},

	'should keep --page-width up to date when the page is resized': async ({pass, fail}) => {
		const frame = await createFrame(420);
		const before = widthOf(frame);
		frame.style.width = '300px';
		await wait(300);
		const after = widthOf(frame);
		const expected = `${frame.contentDocument.documentElement.clientWidth}px`;
		frame.remove();
		if(after === before) return fail(`The value should change with the frame, still ${after}`);
		if(after !== expected) return fail(`Expected ${expected}, got "${after}"`);
		pass('--page-width follows the page size');
	}
};
