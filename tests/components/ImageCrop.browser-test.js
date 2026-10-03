import ImageCrop from '../../src/components/ImageCrop.js';

const makeImageBlob = (width = 400, height = 200, type = 'image/png') => new Promise(resolve => {
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d');
	ctx.fillStyle = '#c00';
	ctx.fillRect(0, 0, width, height);
	canvas.toBlob(resolve, type);
});

const createCrop = async (attrs = '', { width = 400, height = 200, load = true } = {}) => {
	const container = document.createElement('div');
	container.style.width = '600px';
	container.innerHTML = `<k-image-crop ${attrs}></k-image-crop>`;
	document.body.appendChild(container);
	const crop = container.querySelector('k-image-crop');
	await crop.updateComplete;
	if(load){
		const blob = await makeImageBlob(width, height);
		await crop.loadImage(new File([blob], 'photo.png', { type: 'image/png' }));
		await crop.updateComplete;
	}
	return { container, crop };
};

const cleanup = (container) => container.parentNode?.removeChild(container);

export default {
	/*
		Element Creation
	*/
	'should create image crop element with a shadow root': async ({pass, fail}) => {
		const { container, crop } = await createCrop('', { load: false });
		const ok = crop instanceof ImageCrop && !!crop.shadowRoot;
		cleanup(container);
		ok ? pass('ImageCrop created') : fail('ImageCrop should be an ImageCrop with a shadow root');
	},

	'should show the upload button and drop zone when empty': async ({pass, fail}) => {
		const { container, crop } = await createCrop('', { load: false });
		const button = crop.shadowRoot.getElementById('upload');
		const text = button?.textContent.trim();
		const hasCanvas = !!crop.shadowRoot.getElementById('canvas');
		cleanup(container);
		if(text !== 'Upload Image') return fail(`Expected "Upload Image" button, got ${text}`);
		if(hasCanvas) return fail('Should not render a canvas without an image');
		pass('Empty state rendered');
	},

	'should use a custom label': async ({pass, fail}) => {
		const { container, crop } = await createCrop('label="Pick a Photo"', { load: false });
		const text = crop.shadowRoot.getElementById('upload').textContent.trim();
		cleanup(container);
		text === 'Pick a Photo' ? pass('Custom label used') : fail(`Got ${text}`);
	},

	/*
		Loading
	*/
	'should render the cropper after loading a file': async ({pass, fail}) => {
		const { container, crop } = await createCrop();
		const hasCanvas = !!crop.shadowRoot.getElementById('canvas');
		const hasBox = !!crop.shadowRoot.getElementById('box');
		const handles = crop.shadowRoot.querySelectorAll('.handle').length;
		const ok = crop.hasImage && hasCanvas && hasBox && handles === 8;
		cleanup(container);
		ok ? pass('Cropper rendered') : fail(`hasImage=${crop.hasImage} canvas=${hasCanvas} box=${hasBox} handles=${handles}`);
	},

	'should load an image from src': async ({pass, fail}) => {
		const blob = await makeImageBlob(100, 100);
		const url = URL.createObjectURL(blob);
		const { container, crop } = await createCrop(`src="${url}"`, { load: false });
		await new Promise(resolve => setTimeout(resolve, 300));
		const ok = crop.hasImage;
		cleanup(container);
		URL.revokeObjectURL(url);
		ok ? pass('src loaded') : fail('Image should load from src');
	},

	'should fire load and error events': async ({pass, fail}) => {
		const { container, crop } = await createCrop('', { load: false });
		let loaded = null;
		let errored = null;
		crop.addEventListener('load', e => loaded = e.detail);
		crop.addEventListener('error', e => errored = e.detail);
		await crop.loadImage(await makeImageBlob(300, 120));
		crop.acceptFile(new File(['x'], 'notes.txt', { type: 'text/plain' }));
		cleanup(container);
		if(!loaded || loaded.width !== 300 || loaded.height !== 120) return fail(`Bad load detail ${JSON.stringify(loaded)}`);
		if(!errored) return fail('Non-image file should fire error');
		pass('load and error events fired');
	},

	'should fail on an undecodable image': async ({pass, fail}) => {
		const { container, crop } = await createCrop('', { load: false });
		let errored = false;
		crop.addEventListener('error', () => errored = true);
		const result = await crop.loadImage(new Blob(['not an image'], { type: 'image/png' }));
		const ok = result === false && errored && !crop.hasImage;
		cleanup(container);
		ok ? pass('Undecodable image rejected') : fail('Should report error and stay empty');
	},

	'should clear the image': async ({pass, fail}) => {
		const { container, crop } = await createCrop();
		crop.clear();
		await crop.updateComplete;
		const ok = !crop.hasImage && crop.crop === null && !!crop.shadowRoot.getElementById('upload');
		cleanup(container);
		ok ? pass('Cleared') : fail('clear() should return to empty state');
	},

	/*
		Crop Rectangle
	*/
	'should default to the full image when free-form': async ({pass, fail}) => {
		const { container, crop } = await createCrop();
		const c = crop.crop;
		cleanup(container);
		const ok = c.x === 0 && c.y === 0 && c.width === 400 && c.height === 200;
		ok ? pass('Full image crop') : fail(`Got ${JSON.stringify(c)}`);
	},

	'should default to the largest centered crop for an aspect ratio': async ({pass, fail}) => {
		const { container, crop } = await createCrop('aspect-ratio="1"');
		const c = crop.crop;
		cleanup(container);
		const ok = c.width === 200 && c.height === 200 && c.x === 100 && c.y === 0;
		ok ? pass('Centered square') : fail(`Got ${JSON.stringify(c)}`);
	},

	'should parse aspect ratio formats': async ({pass, fail}) => {
		const results = [];
		for(const [value, expected] of [['16/9', 16 / 9], ['4:3', 4 / 3], ['1.5', 1.5], ['free', null], ['', null], ['abc', null], ['0', null]]){
			const { container, crop } = await createCrop(`aspect-ratio="${value}"`, { load: false });
			results.push([value, crop.ratio, expected]);
			cleanup(container);
		}
		const bad = results.find(([, actual, expected]) => actual !== expected);
		bad ? fail(`aspect-ratio "${bad[0]}" gave ${bad[1]}, expected ${bad[2]}`) : pass('Aspect ratios parsed');
	},

	'should honor aspect ratio taller than the image allows': async ({pass, fail}) => {
		const { container, crop } = await createCrop('aspect-ratio="4/1"');
		const c = crop.crop;
		cleanup(container);
		const ok = c.width === 400 && c.height === 100;
		ok ? pass('Wide ratio fits') : fail(`Got ${JSON.stringify(c)}`);
	},

	'should re-fit the crop when the aspect ratio changes': async ({pass, fail}) => {
		const { container, crop } = await createCrop();
		crop.setAttribute('aspect-ratio', '1');
		await crop.updateComplete;
		const c = crop.crop;
		cleanup(container);
		const ok = c.width === c.height && c.width <= 200;
		ok ? pass('Re-fit to square') : fail(`Got ${JSON.stringify(c)}`);
	},

	'should clamp a crop set through the crop setter': async ({pass, fail}) => {
		const { container, crop } = await createCrop();
		crop.crop = { x: 350, y: 150, width: 300, height: 300 };
		const c = crop.crop;
		cleanup(container);
		const ok = c.x >= 0 && c.y >= 0 && c.x + c.width <= 400 && c.y + c.height <= 200;
		ok ? pass('Crop clamped to image') : fail(`Got ${JSON.stringify(c)}`);
	},

	'should keep the aspect ratio when the crop setter is used': async ({pass, fail}) => {
		const { container, crop } = await createCrop('aspect-ratio="2"');
		crop.crop = { x: 10, y: 10, width: 100, height: 100 };
		const c = crop.crop;
		cleanup(container);
		const ok = c.width === c.height * 2;
		ok ? pass('Ratio kept') : fail(`Got ${JSON.stringify(c)}`);
	},

	/*
		Output Size
	*/
	'should scale output down to max-width and max-height': async ({pass, fail}) => {
		const { container, crop } = await createCrop('aspect-ratio="1" max-width="50" max-height="50"');
		const size = crop.outputSize;
		const canvas = crop.getCroppedCanvas();
		cleanup(container);
		const ok = size.width === 50 && size.height === 50 && canvas.width === 50 && canvas.height === 50;
		ok ? pass('Output limited to 50x50') : fail(`Got ${JSON.stringify(size)}`);
	},

	'should keep the ratio when only one max is set': async ({pass, fail}) => {
		const { container, crop } = await createCrop('max-width="100"');
		const size = crop.outputSize;
		cleanup(container);
		const ok = size.width === 100 && size.height === 50;
		ok ? pass('Scaled by width') : fail(`Got ${JSON.stringify(size)}`);
	},

	'should fit within both maximums for free-form crops': async ({pass, fail}) => {
		const { container, crop } = await createCrop('max-width="100" max-height="20"');
		const size = crop.outputSize;
		cleanup(container);
		const ok = size.width === 40 && size.height === 20;
		ok ? pass('Fit within both limits') : fail(`Got ${JSON.stringify(size)}`);
	},

	'should never upscale': async ({pass, fail}) => {
		const { container, crop } = await createCrop('max-width="2000" max-height="2000"');
		const size = crop.outputSize;
		cleanup(container);
		const ok = size.width === 400 && size.height === 200;
		ok ? pass('Not upscaled') : fail(`Got ${JSON.stringify(size)}`);
	},

	'should have a null output size without an image': async ({pass, fail}) => {
		const { container, crop } = await createCrop('', { load: false });
		const ok = crop.outputSize === null && crop.getCroppedCanvas() === null && crop.toDataURL() === null && (await crop.toBlob()) === null && (await crop.toFile()) === null;
		cleanup(container);
		ok ? pass('Null without image') : fail('Export methods should return null without an image');
	},

	/*
		Export API
	*/
	'should export a blob with the requested type': async ({pass, fail}) => {
		const { container, crop } = await createCrop('type="image/jpeg" max-width="100"');
		const blob = await crop.toBlob();
		cleanup(container);
		const ok = blob instanceof Blob && blob.type === 'image/jpeg';
		ok ? pass('JPEG blob') : fail(`Got ${blob?.type}`);
	},

	'should export a file named after the upload': async ({pass, fail}) => {
		const { container, crop } = await createCrop('type="image/jpeg"');
		const file = await crop.toFile();
		const named = await crop.toFile('custom.png');
		cleanup(container);
		if(!(file instanceof File) || file.name !== 'photo-cropped.jpg') return fail(`Got ${file?.name}`);
		named.name === 'custom.png' ? pass('File names correct') : fail('Custom name ignored');
	},

	'should export pixels from the crop region': async ({pass, fail}) => {
		const container = document.createElement('div');
		document.body.appendChild(container);
		const source = document.createElement('canvas');
		source.width = 200;
		source.height = 100;
		const sctx = source.getContext('2d');
		sctx.fillStyle = '#f00';
		sctx.fillRect(0, 0, 100, 100);
		sctx.fillStyle = '#00f';
		sctx.fillRect(100, 0, 100, 100);
		const blob = await new Promise(resolve => source.toBlob(resolve, 'image/png'));
		const crop = document.createElement('k-image-crop');
		crop.setAttribute('aspect-ratio', '1');
		container.appendChild(crop);
		await crop.loadImage(blob);
		crop.crop = { x: 100, y: 0, width: 100, height: 100 };
		const [r, g, b] = crop.getCroppedCanvas().getContext('2d').getImageData(50, 50, 1, 1).data;
		cleanup(container);
		const ok = r < 5 && g < 5 && b > 250;
		ok ? pass('Cropped the blue half') : fail(`Pixel was ${r},${g},${b}`);
	},

	'should return a data URL': async ({pass, fail}) => {
		const { container, crop } = await createCrop();
		const url = crop.toDataURL();
		cleanup(container);
		url.startsWith('data:image/png') ? pass('Data URL returned') : fail(`Got ${url.slice(0, 30)}`);
	},

	/*
		Events
	*/
	'should fire change when the crop is set': async ({pass, fail}) => {
		const { container, crop } = await createCrop('aspect-ratio="1" max-width="64"');
		let detail = null;
		crop.addEventListener('change', e => detail = e.detail);
		crop.crop = { x: 0, y: 0, width: 150, height: 150 };
		cleanup(container);
		const ok = detail && detail.width === 64 && detail.height === 64 && detail.crop.width === 150;
		ok ? pass('change fired') : fail(`Got ${JSON.stringify(detail)}`);
	},

	/*
		Interaction
	*/
	'should move the crop box with the keyboard': async ({pass, fail}) => {
		const { container, crop } = await createCrop('aspect-ratio="1"');
		const before = crop.crop;
		crop.shadowRoot.getElementById('box').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
		const after = crop.crop;
		cleanup(container);
		after.x > before.x && after.y === before.y ? pass('Moved right') : fail(`${before.x} -> ${after.x}`);
	},

	'should resize the crop box with shift and arrow keys': async ({pass, fail}) => {
		const { container, crop } = await createCrop('aspect-ratio="1"');
		crop.crop = { x: 50, y: 20, width: 100, height: 100 };
		crop.shadowRoot.getElementById('box').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', shiftKey: true, ctrlKey: true, bubbles: true, cancelable: true }));
		const c = crop.crop;
		cleanup(container);
		c.width > 100 && c.width === c.height ? pass('Grew, ratio kept') : fail(`Got ${JSON.stringify(c)}`);
	},

	'should resize with a handle drag, respecting aspect ratio and bounds': async ({pass, fail}) => {
		const { container, crop } = await createCrop('aspect-ratio="2"');
		crop.crop = { x: 0, y: 0, width: 100, height: 50 };
		const resized = crop.resizeRect('se', crop.cropRect, 150, 5000);
		const free = (() => { crop.setAttribute('aspect-ratio', ''); return crop.resizeRect('se', crop.cropRect, 150, 90); })();
		cleanup(container);
		if(Math.abs(resized.width / resized.height - 2) > 0.001) return fail(`Ratio broken: ${JSON.stringify(resized)}`);
		if(resized.x + resized.width > 400 || resized.y + resized.height > 200) return fail('Out of bounds');
		free.width === 150 && free.height === 90 ? pass('Resize correct') : fail(`Free resize gave ${JSON.stringify(free)}`);
	},

	'should enforce a minimum crop size': async ({pass, fail}) => {
		const { container, crop } = await createCrop();
		const rect = crop.resizeRect('se', crop.cropRect, -100, -100);
		cleanup(container);
		rect.width > 0 && rect.height > 0 ? pass('Minimum size enforced') : fail(`Got ${JSON.stringify(rect)}`);
	},

	/*
		Form Association
	*/
	'should submit the cropped image as a file in FormData': async ({pass, fail}) => {
		const container = document.createElement('div');
		container.innerHTML = '<form><k-image-crop name="avatar" aspect-ratio="1" max-width="64"></k-image-crop></form>';
		document.body.appendChild(container);
		const crop = container.querySelector('k-image-crop');
		await crop.updateComplete;
		await crop.loadImage(new File([await makeImageBlob()], 'me.png', { type: 'image/png' }));
		await new Promise(resolve => setTimeout(resolve, 200));
		const file = new FormData(container.querySelector('form')).get('avatar');
		cleanup(container);
		if(!(file instanceof File)) return fail(`Expected a File, got ${file}`);
		file.name === 'me-cropped.png' && file.size > 0 ? pass('Submitted as File') : fail(`Got ${file.name} (${file.size})`);
	},

	'should be invalid when required and empty': async ({pass, fail}) => {
		const container = document.createElement('div');
		container.innerHTML = '<form><k-image-crop name="avatar" required></k-image-crop></form>';
		document.body.appendChild(container);
		const crop = container.querySelector('k-image-crop');
		await crop.updateComplete;
		const form = container.querySelector('form');
		const before = form.checkValidity();
		await crop.loadImage(await makeImageBlob());
		await new Promise(resolve => setTimeout(resolve, 100));
		const after = form.checkValidity();
		cleanup(container);
		!before && after ? pass('Required validity works') : fail(`before=${before} after=${after}`);
	},

	'should reset on form reset': async ({pass, fail}) => {
		const container = document.createElement('div');
		container.innerHTML = '<form><k-image-crop name="avatar"></k-image-crop></form>';
		document.body.appendChild(container);
		const crop = container.querySelector('k-image-crop');
		await crop.updateComplete;
		await crop.loadImage(await makeImageBlob());
		container.querySelector('form').reset();
		await crop.updateComplete;
		const ok = !crop.hasImage;
		cleanup(container);
		ok ? pass('Reset cleared image') : fail('Form reset should clear the image');
	},

	'should have no form value without an image': async ({pass, fail}) => {
		const container = document.createElement('div');
		container.innerHTML = '<form><k-image-crop name="avatar"></k-image-crop></form>';
		document.body.appendChild(container);
		await container.querySelector('k-image-crop').updateComplete;
		const value = new FormData(container.querySelector('form')).get('avatar');
		cleanup(container);
		value === null ? pass('No value when empty') : fail(`Got ${value}`);
	},

	/*
		Disabled
	*/
	'should not allow changes when disabled': async ({pass, fail}) => {
		const { container, crop } = await createCrop('aspect-ratio="1" disabled');
		const before = crop.crop;
		crop.shadowRoot.getElementById('box').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
		const same = crop.crop.x === before.x;
		const buttonsDisabled = [...crop.shadowRoot.querySelectorAll('button')].every(b => b.disabled);
		cleanup(container);
		same && buttonsDisabled ? pass('Disabled respected') : fail(`same=${same} buttonsDisabled=${buttonsDisabled}`);
	}
};
