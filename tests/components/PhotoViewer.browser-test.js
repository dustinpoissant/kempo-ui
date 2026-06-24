import PhotoViewer from '../../src/components/PhotoViewer.js';
import { html } from '../../src/lit-all.min.js';

const createPhotoViewer = async (options = {}) => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-photo-viewer
			src="${options.src || 'https://picsum.photos/200/300'}"
			alt="${options.alt || 'Test photo'}"
			${options.fullscreen ? 'fullscreen' : ''}
			${options.keyboardControls === false ? 'keyboard-controls="false"' : ''}
			${options.global ? 'global' : ''}
		>
			${options.caption || ''}
		</k-photo-viewer>
	`;
	document.body.appendChild(container);

	const viewer = container.querySelector('k-photo-viewer');
	await viewer.updateComplete;

	return { container, viewer };
};

const createMultipleViewers = async (count = 3) => {
	const container = document.createElement('div');
	let html = '';
	for(let i = 0; i < count; i++){
		html += `<k-photo-viewer src="https://picsum.photos/200/30${i}" alt="Photo ${i}"></k-photo-viewer>`;
	}
	container.innerHTML = html;
	document.body.appendChild(container);

	const viewers = Array.from(container.querySelectorAll('k-photo-viewer'));
	await Promise.all(viewers.map(v => v.updateComplete));

	return { container, viewers };
};

const cleanup = container => {
	if(container && container.parentNode){
		container.parentNode.removeChild(container);
	}
};

export default {
	/*
		Element Creation Tests
	*/
	'should create photo viewer element': async ({pass, fail}) => {
		const { container, viewer } = await createPhotoViewer();

		if(!viewer){
			cleanup(container);
			fail('PhotoViewer element should be created');
			return;
		}

		if(!(viewer instanceof PhotoViewer)){
			cleanup(container);
			fail('Element should be instance of PhotoViewer');
			return;
		}

		cleanup(container);
		pass('PhotoViewer element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, viewer } = await createPhotoViewer();

		if(!viewer.shadowRoot){
			cleanup(container);
			fail('PhotoViewer should have shadow root');
			return;
		}

		cleanup(container);
		pass('PhotoViewer has shadow root');
	},

	/*
		Default Property Tests
	*/
	'should have default properties': async ({pass, fail}) => {
		const { container, viewer } = await createPhotoViewer();

		if(viewer.fullscreen !== false){
			cleanup(container);
			fail(`Expected fullscreen false, got ${viewer.fullscreen}`);
			return;
		}

		if(viewer.keyboardControls !== true){
			cleanup(container);
			fail(`Expected keyboardControls true, got ${viewer.keyboardControls}`);
			return;
		}

		if(viewer.global !== false){
			cleanup(container);
			fail(`Expected global false, got ${viewer.global}`);
			return;
		}

		cleanup(container);
		pass('Default properties are correct');
	},

	'should set src property': async ({pass, fail}) => {
		const testSrc = 'https://example.com/image.jpg';
		const { container, viewer } = await createPhotoViewer({ src: testSrc });

		if(viewer.src !== testSrc){
			cleanup(container);
			fail(`Expected src "${testSrc}", got "${viewer.src}"`);
			return;
		}

		cleanup(container);
		pass('src property set correctly');
	},

	'should set alt property': async ({pass, fail}) => {
		const testAlt = 'My test image';
		const { container, viewer } = await createPhotoViewer({ alt: testAlt });

		if(viewer.alt !== testAlt){
			cleanup(container);
			fail(`Expected alt "${testAlt}", got "${viewer.alt}"`);
			return;
		}

		cleanup(container);
		pass('alt property set correctly');
	},

	/*
		Rendering Tests
	*/
	'should render image element': async ({pass, fail}) => {
		const { container, viewer } = await createPhotoViewer();

		const img = viewer.shadowRoot.querySelector('#img');
		if(!img){
			cleanup(container);
			fail('Should render #img element');
			return;
		}

		cleanup(container);
		pass('Image element rendered');
	},

	'should render fullscreen overlay': async ({pass, fail}) => {
		const { container, viewer } = await createPhotoViewer();

		const overlay = viewer.shadowRoot.querySelector('#fullscreen-overlay');
		if(!overlay){
			cleanup(container);
			fail('Should render #fullscreen-overlay element');
			return;
		}

		cleanup(container);
		pass('Fullscreen overlay rendered');
	},

	'should render navigation buttons': async ({pass, fail}) => {
		const { container, viewer } = await createPhotoViewer();

		const prevBtn = viewer.shadowRoot.querySelector('#prev');
		const nextBtn = viewer.shadowRoot.querySelector('#next');

		if(!prevBtn){
			cleanup(container);
			fail('Should render #prev button');
			return;
		}

		if(!nextBtn){
			cleanup(container);
			fail('Should render #next button');
			return;
		}

		cleanup(container);
		pass('Navigation buttons rendered');
	},

	/*
		Open/Close Tests
	*/
	'should open fullscreen with open method': async ({pass, fail}) => {
		const { container, viewer } = await createPhotoViewer();

		viewer.open();
		await viewer.updateComplete;

		if(viewer.fullscreen !== true){
			cleanup(container);
			fail(`Expected fullscreen true, got ${viewer.fullscreen}`);
			return;
		}

		cleanup(container);
		pass('open() opens fullscreen');
	},

	'should close fullscreen with close method': async ({pass, fail}) => {
		const { container, viewer } = await createPhotoViewer({ fullscreen: true });

		viewer.close();
		await viewer.updateComplete;

		if(viewer.fullscreen !== false){
			cleanup(container);
			fail(`Expected fullscreen false, got ${viewer.fullscreen}`);
			return;
		}

		cleanup(container);
		pass('close() closes fullscreen');
	},

	'should toggle fullscreen state': async ({pass, fail}) => {
		const { container, viewer } = await createPhotoViewer();

		viewer.toggle();
		await viewer.updateComplete;

		if(viewer.fullscreen !== true){
			cleanup(container);
			fail(`Expected fullscreen true after first toggle, got ${viewer.fullscreen}`);
			return;
		}

		viewer.toggle();
		await viewer.updateComplete;

		if(viewer.fullscreen !== false){
			cleanup(container);
			fail(`Expected fullscreen false after second toggle, got ${viewer.fullscreen}`);
			return;
		}

		cleanup(container);
		pass('toggle() switches fullscreen state');
	},

	'should open fullscreen on image click': async ({pass, fail}) => {
		const { container, viewer } = await createPhotoViewer();

		const img = viewer.shadowRoot.querySelector('#img');
		img.click();
		await viewer.updateComplete;

		if(viewer.fullscreen !== true){
			cleanup(container);
			fail('Clicking image should open fullscreen');
			return;
		}

		cleanup(container);
		pass('Image click opens fullscreen');
	},

	'should open fullscreen on Enter key': async ({pass, fail}) => {
		const { container, viewer } = await createPhotoViewer();

		const img = viewer.shadowRoot.querySelector('#img');
		img.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
		await viewer.updateComplete;

		if(viewer.fullscreen !== true){
			cleanup(container);
			fail('Enter key should open fullscreen');
			return;
		}

		cleanup(container);
		pass('Enter key opens fullscreen');
	},

	'should close on close button click': async ({pass, fail}) => {
		const { container, viewer } = await createPhotoViewer({ fullscreen: true });

		const closeBtn = viewer.shadowRoot.querySelector('#close');
		closeBtn.click();
		await viewer.updateComplete;

		if(viewer.fullscreen !== false){
			cleanup(container);
			fail('Close button should close fullscreen');
			return;
		}

		cleanup(container);
		pass('Close button closes fullscreen');
	},

	'should close on overlay click': async ({pass, fail}) => {
		const { container, viewer } = await createPhotoViewer({ fullscreen: true });

		const overlay = viewer.shadowRoot.querySelector('#fullscreen-overlay');
		overlay.click();
		await viewer.updateComplete;

		if(viewer.fullscreen !== false){
			cleanup(container);
			fail('Clicking overlay should close fullscreen');
			return;
		}

		cleanup(container);
		pass('Overlay click closes fullscreen');
	},

	/*
		Event Tests
	*/
	'should dispatch fullscreenchange event on open': async ({pass, fail}) => {
		const { container, viewer } = await createPhotoViewer();

		let eventDetail = null;
		viewer.addEventListener('fullscreenchange', e => {
			eventDetail = e.detail;
		});

		viewer.open();
		await viewer.updateComplete;

		if(!eventDetail || eventDetail.fullscreen !== true){
			cleanup(container);
			fail('fullscreenchange event should be dispatched with fullscreen: true');
			return;
		}

		cleanup(container);
		pass('fullscreenchange event dispatched on open');
	},

	'should dispatch fullscreen event on open': async ({pass, fail}) => {
		const { container, viewer } = await createPhotoViewer();

		let eventFired = false;
		viewer.addEventListener('fullscreen', () => {
			eventFired = true;
		});

		viewer.open();
		await viewer.updateComplete;

		if(!eventFired){
			cleanup(container);
			fail('fullscreen event should be dispatched');
			return;
		}

		cleanup(container);
		pass('fullscreen event dispatched on open');
	},

	'should dispatch fullscreenclose event on close': async ({pass, fail}) => {
		const { container, viewer } = await createPhotoViewer({ fullscreen: true });

		let eventFired = false;
		viewer.addEventListener('fullscreenclose', () => {
			eventFired = true;
		});

		viewer.close();
		await viewer.updateComplete;

		if(!eventFired){
			cleanup(container);
			fail('fullscreenclose event should be dispatched');
			return;
		}

		cleanup(container);
		pass('fullscreenclose event dispatched on close');
	},

	/*
		Keyboard Controls Tests
	*/
	'should close on Escape key when fullscreen': async ({pass, fail}) => {
		const { container, viewer } = await createPhotoViewer();

		viewer.open();
		await viewer.updateComplete;

		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		await viewer.updateComplete;

		if(viewer.fullscreen !== false){
			cleanup(container);
			fail('Escape key should close fullscreen');
			return;
		}

		cleanup(container);
		pass('Escape key closes fullscreen');
	},

	/*
		Navigation Tests
	*/
	'should detect photo siblings': async ({pass, fail}) => {
		const { container, viewers } = await createMultipleViewers(3);

		const hasSiblings = viewers[0].hasPhotoSiblings();

		if(!hasSiblings){
			cleanup(container);
			fail('Should detect photo siblings');
			return;
		}

		cleanup(container);
		pass('Photo siblings detected');
	},

	'should get next sibling': async ({pass, fail}) => {
		const { container, viewers } = await createMultipleViewers(3);

		const next = viewers[0].getNextSibling();

		if(next !== viewers[1]){
			cleanup(container);
			fail('Should get next sibling viewer');
			return;
		}

		cleanup(container);
		pass('Next sibling retrieved correctly');
	},

	'should get previous sibling': async ({pass, fail}) => {
		const { container, viewers } = await createMultipleViewers(3);

		const prev = viewers[1].getPrevSibling();

		if(prev !== viewers[0]){
			cleanup(container);
			fail('Should get previous sibling viewer');
			return;
		}

		cleanup(container);
		pass('Previous sibling retrieved correctly');
	},

	'should wrap around to last viewer from first': async ({pass, fail}) => {
		const { container, viewers } = await createMultipleViewers(3);

		const prev = viewers[0].getPrevSibling();

		if(prev !== viewers[2]){
			cleanup(container);
			fail('Should wrap to last viewer');
			return;
		}

		cleanup(container);
		pass('Navigation wraps to last viewer');
	},

	'should wrap around to first viewer from last': async ({pass, fail}) => {
		const { container, viewers } = await createMultipleViewers(3);

		const next = viewers[2].getNextSibling();

		if(next !== viewers[0]){
			cleanup(container);
			fail('Should wrap to first viewer');
			return;
		}

		cleanup(container);
		pass('Navigation wraps to first viewer');
	},

	/*
		Attribute Reflection Tests
	*/
	'should reflect fullscreen attribute': async ({pass, fail}) => {
		const { container, viewer } = await createPhotoViewer();

		viewer.open();
		await viewer.updateComplete;

		if(!viewer.hasAttribute('fullscreen')){
			cleanup(container);
			fail('fullscreen attribute should be reflected');
			return;
		}

		viewer.close();
		await viewer.updateComplete;

		if(viewer.hasAttribute('fullscreen')){
			cleanup(container);
			fail('fullscreen attribute should be removed when closed');
			return;
		}

		cleanup(container);
		pass('fullscreen attribute reflects property');
	},

	'should reflect src attribute': async ({pass, fail}) => {
		const testSrc = 'https://example.com/test.jpg';
		const { container, viewer } = await createPhotoViewer({ src: testSrc });

		if(viewer.getAttribute('src') !== testSrc){
			cleanup(container);
			fail('src attribute should reflect property');
			return;
		}

		cleanup(container);
		pass('src attribute reflects property');
	},

	'should reflect alt attribute': async ({pass, fail}) => {
		const testAlt = 'Test alt text';
		const { container, viewer } = await createPhotoViewer({ alt: testAlt });

		if(viewer.getAttribute('alt') !== testAlt){
			cleanup(container);
			fail('alt attribute should reflect property');
			return;
		}

		cleanup(container);
		pass('alt attribute reflects property');
	},

	/*
		Display Tests
	*/
	'should have block display': async ({pass, fail}) => {
		const { container, viewer } = await createPhotoViewer();

		const computedStyle = window.getComputedStyle(viewer);
		if(computedStyle.display !== 'block'){
			cleanup(container);
			fail(`Expected display "block", got "${computedStyle.display}"`);
			return;
		}

		cleanup(container);
		pass('PhotoViewer has block display');
	},

	'should show fullscreen overlay when fullscreen': async ({pass, fail}) => {
		const { container, viewer } = await createPhotoViewer();

		viewer.open();
		await viewer.updateComplete;

		const overlay = viewer.shadowRoot.querySelector('#fullscreen-overlay');
		const computedStyle = window.getComputedStyle(overlay);

		if(computedStyle.display === 'none'){
			cleanup(container);
			fail('Fullscreen overlay should be visible when fullscreen');
			return;
		}

		cleanup(container);
		pass('Fullscreen overlay visible when fullscreen');
	},

	'should hide fullscreen overlay when not fullscreen': async ({pass, fail}) => {
		const { container, viewer } = await createPhotoViewer();

		const overlay = viewer.shadowRoot.querySelector('#fullscreen-overlay');
		const computedStyle = window.getComputedStyle(overlay);

		if(computedStyle.display !== 'none'){
			cleanup(container);
			fail('Fullscreen overlay should be hidden when not fullscreen');
			return;
		}

		cleanup(container);
		pass('Fullscreen overlay hidden when not fullscreen');
	},

	/*
		Single Viewer Tests
	*/
	'should not have siblings when alone': async ({pass, fail}) => {
		const { container, viewer } = await createPhotoViewer();

		const hasSiblings = viewer.hasPhotoSiblings();

		if(hasSiblings){
			cleanup(container);
			fail('Single viewer should not have siblings');
			return;
		}

		cleanup(container);
		pass('Single viewer has no siblings');
	},

	/*
		Slot Tests
	*/
	'should render default slot for caption': async ({pass, fail}) => {
		const { container, viewer } = await createPhotoViewer();

		const slot = viewer.shadowRoot.querySelector('slot:not([name])');
		if(!slot){
			cleanup(container);
			fail('Should have default slot');
			return;
		}

		cleanup(container);
		pass('Default slot rendered');
	},

	'should slot caption content': async ({pass, fail}) => {
		const { container, viewer } = await createPhotoViewer({ caption: '<span>Test caption</span>' });

		const caption = viewer.querySelector('span');
		if(!caption || caption.textContent !== 'Test caption'){
			cleanup(container);
			fail('Caption content should be slotted');
			return;
		}

		cleanup(container);
		pass('Caption content slotted correctly');
	},

	/*
		Static open() Tests
	*/
	'should create and open a viewer with PhotoViewer.open': async ({pass, fail}) => {
		const viewer = PhotoViewer.open([
			{ src: 'https://picsum.photos/200/300', caption: '<span>Photo 1</span>' },
			{ src: 'https://picsum.photos/200/301', caption: '<span>Photo 2</span>' }
		]);
		await viewer.updateComplete;

		if(!(viewer instanceof PhotoViewer)){
			viewer.close();
			fail('open() should return a PhotoViewer instance');
			return;
		}

		if(viewer.fullscreen !== true){
			viewer.close();
			fail('open() should open the viewer in fullscreen');
			return;
		}

		viewer.close();
		pass('PhotoViewer.open() creates and opens a viewer');
	},

	'should open at the given openIndex': async ({pass, fail}) => {
		const viewer = PhotoViewer.open([
			{ src: 'https://picsum.photos/200/300', caption: 'Photo 1' },
			{ src: 'https://picsum.photos/200/301', caption: 'Photo 2' },
			{ src: 'https://picsum.photos/200/302', caption: 'Photo 3' }
		], 1);
		await viewer.updateComplete;

		if(viewer.src !== 'https://picsum.photos/200/301'){
			viewer.close();
			fail(`Expected src for index 1, got "${viewer.src}"`);
			return;
		}

		viewer.close();
		pass('PhotoViewer.open() opens at the given openIndex');
	},

	'should default to openIndex 0': async ({pass, fail}) => {
		const viewer = PhotoViewer.open([
			{ src: 'https://picsum.photos/200/300' },
			{ src: 'https://picsum.photos/200/301' }
		]);
		await viewer.updateComplete;

		if(viewer.src !== 'https://picsum.photos/200/300'){
			viewer.close();
			fail(`Expected src for index 0, got "${viewer.src}"`);
			return;
		}

		viewer.close();
		pass('PhotoViewer.open() defaults to openIndex 0');
	},

	'should remove the gallery from the DOM after closing': async ({pass, fail}) => {
		const viewer = PhotoViewer.open([
			{ src: 'https://picsum.photos/200/300' }
		]);
		await viewer.updateComplete;

		viewer.close();
		await viewer.updateComplete;

		if(document.body.contains(viewer)){
			fail('Gallery should be removed from the DOM after closing');
			return;
		}

		pass('Gallery removed from the DOM after closing');
	},

	'should not remove the gallery from the DOM while navigating': async ({pass, fail}) => {
		const viewer = PhotoViewer.open([
			{ src: 'https://picsum.photos/200/300' },
			{ src: 'https://picsum.photos/200/301' }
		], 0);
		await viewer.updateComplete;

		const next = viewer.getNextSibling();
		viewer.handleNextClick({ stopPropagation: () => {} });
		await next.updateComplete;

		if(!document.body.contains(next)){
			next.close();
			fail('Gallery should remain in the DOM while navigating between photos');
			return;
		}

		if(next.fullscreen !== true){
			next.close();
			fail('Next photo should be opened after navigating');
			return;
		}

		next.close();
		pass('Gallery remains in the DOM while navigating');
	},

	'should call onClose when the gallery is fully closed': async ({pass, fail}) => {
		let closed = false;
		const viewer = PhotoViewer.open([
			{ src: 'https://picsum.photos/200/300' }
		], 0, { onClose: () => { closed = true; } });
		await viewer.updateComplete;

		viewer.close();
		await viewer.updateComplete;

		if(!closed){
			fail('onClose callback should be called after the gallery closes');
			return;
		}

		pass('onClose callback called after gallery closes');
	},

	'should render string captions in the opened viewer': async ({pass, fail}) => {
		const viewer = PhotoViewer.open([
			{ src: 'https://picsum.photos/200/300', caption: '<span class="open-test-caption">Hello</span>' }
		]);
		await viewer.updateComplete;

		const caption = viewer.querySelector('.open-test-caption');
		if(!caption || caption.textContent !== 'Hello'){
			viewer.close();
			fail('String caption should be rendered as HTML content');
			return;
		}

		viewer.close();
		pass('String caption rendered correctly');
	},

	'should render lit html template captions in the opened viewer': async ({pass, fail}) => {
		const viewer = PhotoViewer.open([
			{ src: 'https://picsum.photos/200/300', caption: html`<span class="open-test-lit-caption">Lit Hello</span>` }
		]);
		await viewer.updateComplete;

		const caption = viewer.querySelector('.open-test-lit-caption');
		if(!caption || caption.textContent !== 'Lit Hello'){
			viewer.close();
			fail('Lit html caption should be rendered as content');
			return;
		}

		viewer.close();
		pass('Lit html template caption rendered correctly');
	},

	'should keep multiple opened photos isolated as siblings': async ({pass, fail}) => {
		const viewer = PhotoViewer.open([
			{ src: 'https://picsum.photos/200/300' },
			{ src: 'https://picsum.photos/200/301' }
		]);
		await viewer.updateComplete;

		const hasSiblings = viewer.hasPhotoSiblings();
		if(!hasSiblings){
			viewer.close();
			fail('Opened gallery photos should detect each other as siblings');
			return;
		}

		viewer.close();
		pass('Opened gallery photos are isolated siblings');
	}
};
