import '../../../src/components/Audio.js';
import AudioVisualizer from '../../../src/components/controls/AudioVisualizer.js';

const wait = (ms = 50) => new Promise(r => setTimeout(r, ms));

/* A tenth of a second of sound as a data: URL, which the visualizer may read (it is not another origin). */
const sound = (() => {
	const bytes = new Uint8Array(44 + 800);
	const view = new DataView(bytes.buffer);
	const text = (offset, value) => [...value].forEach((character, i) => view.setUint8(offset + i, character.charCodeAt(0)));
	text(0, 'RIFF');
	view.setUint32(4, 36 + 800, true);
	text(8, 'WAVEfmt ');
	view.setUint32(16, 16, true);
	view.setUint16(20, 1, true);
	view.setUint16(22, 1, true);
	view.setUint32(24, 8000, true);
	view.setUint32(28, 8000, true);
	view.setUint16(32, 1, true);
	view.setUint16(34, 8, true);
	text(36, 'data');
	view.setUint32(40, 800, true);
	for(let i = 0; i < 800; i++) bytes[44 + i] = 128 + Math.round(60 * Math.sin(i / 4));
	return `data:audio/wav;base64,${btoa(String.fromCharCode(...bytes))}`;
})();

/* An address on this page's own origin (the player has preload="none", so nothing is fetched). */
const sameOrigin = new URL('no-such-sound.mp3', document.baseURI).href;

const createAudio = async (attrs = '', visualizerAttrs = '') => {
	const container = document.createElement('div');
	container.innerHTML = `<k-audio preload="none" ${attrs}><kc-audio-visualizer slot="visualizer" ${visualizerAttrs}></kc-audio-visualizer></k-audio>`;
	document.body.appendChild(container);
	const el = container.querySelector('k-audio');
	const visualizer = container.querySelector('kc-audio-visualizer');
	await el.updateComplete;
	await visualizer.updateComplete;
	await wait(100);
	return { container, el, visualizer };
};

const cleanup = container => {
	if(container?.parentNode) container.parentNode.removeChild(container);
};

const litPixels = visualizer => {
	const canvas = visualizer.shadowRoot.querySelector('canvas');
	const pixels = canvas.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, canvas.width, canvas.height).data;
	let lit = 0;
	for(let i = 3; i < pixels.length; i += 4) if(pixels[i] > 0) lit++;
	return lit;
};

export default {
	/*
		Element Creation
	*/
	'should create a kc-audio-visualizer with a canvas': async ({pass, fail}) => {
		const { container, visualizer } = await createAudio();
		const canvas = visualizer.shadowRoot?.querySelector('canvas');
		cleanup(container);
		if(!(visualizer instanceof AudioVisualizer)) return fail('Element should be instance of AudioVisualizer');
		if(!canvas) return fail('It should draw on a canvas');
		pass('The visualizer is created with a canvas');
	},

	'should default to bars, 48 of them': async ({pass, fail}) => {
		const { container, visualizer } = await createAudio();
		const { type, bars } = visualizer;
		cleanup(container);
		if(type !== 'bars' || bars !== 48) return fail(`Expected bars and 48, got ${type} and ${bars}`);
		pass('Bars is the default type');
	},

	/*
		Host and Size
	*/
	'should attach to the k-audio it is slotted in and stay enabled': async ({pass, fail}) => {
		const { container, el, visualizer } = await createAudio();
		const { boundHost, disabled } = visualizer;
		cleanup(container);
		if(boundHost !== el) return fail('The host should be the k-audio');
		if(disabled) return fail('A visualizer on a k-audio should not be disabled');
		pass('The visualizer finds its host');
	},

	'should size its canvas to the element, not the 40px control height': async ({pass, fail}) => {
		const { container, visualizer } = await createAudio();
		const height = visualizer.getBoundingClientRect().height;
		const drawn = visualizer.shadowRoot.querySelector('canvas').height;
		cleanup(container);
		if(Math.abs(height - 128) > 1) return fail(`The default height is 8rem (128px), got ${height}`);
		if(drawn < 100) return fail(`The canvas should be sized to the element, got ${drawn}`);
		pass('The visualizer is 8rem tall');
	},

	'should follow --visualizer_height': async ({pass, fail}) => {
		const { container, visualizer } = await createAudio();
		visualizer.style.setProperty('--visualizer_height', '4rem');
		await wait(100);
		const height = visualizer.getBoundingClientRect().height;
		cleanup(container);
		if(Math.abs(height - 64) > 1) return fail(`Expected 64px, got ${height}`);
		pass('The height is set by --visualizer_height');
	},

	/*
		Resting State
	*/
	'should draw a resting state for bars and for the wave': async ({pass, fail}) => {
		const { container, visualizer } = await createAudio();
		const bars = litPixels(visualizer);
		visualizer.type = 'wave';
		await visualizer.updateComplete;
		const wave = litPixels(visualizer);
		cleanup(container);
		if(!bars) return fail('The resting bars should be drawn');
		if(!wave) return fail('The resting wave should be drawn');
		pass('Both types draw while nothing plays');
	},

	'should use the primary color in the middle and the secondary at the edges': async ({pass, fail}) => {
		const { container, visualizer } = await createAudio();
		const canvas = visualizer.shadowRoot.querySelector('canvas');
		const { color, outlineColor } = getComputedStyle(canvas);
		const pixel = x => Array.from(canvas.getContext('2d', { willReadFrequently: true }).getImageData(x, canvas.height - 1, 1, 1).data.slice(0, 3));
		const middle = pixel(Math.floor(canvas.width / 2));
		const edge = pixel(0);
		cleanup(container);
		if(!/^rgb/.test(color) || !/^rgb/.test(outlineColor)) return fail(`The colors should resolve to rgb(), got ${color} and ${outlineColor}`);
		const channels = value => value.match(/\d+/g).slice(0, 3).map(Number);
		if(middle.some((channel, i) => Math.abs(channel - channels(color)[i]) > 2)) return fail(`The middle should be ${color}, got ${middle}`);
		if(edge.some((channel, i) => Math.abs(channel - channels(outlineColor)[i]) > 2)) return fail(`The edge should be ${outlineColor}, got ${edge}`);
		pass('Primary in the middle, secondary at the edges');
	},

	/*
		Reading the Sound
	*/
	'should read a same-origin sound, and rest again when it pauses': async ({pass, fail}) => {
		const { container, el, visualizer } = await createAudio(`src="${sound}"`);
		el.dispatchEvent(new CustomEvent('play'));
		await wait(300);
		const { unavailable } = visualizer;
		el.dispatchEvent(new CustomEvent('pause'));
		await wait(50);
		const resting = litPixels(visualizer);
		cleanup(container);
		if(unavailable) return fail('A data: URL can be read, so the visualizer should be available');
		if(!resting) return fail('It should draw its resting state after pause');
		pass('A readable file is read');
	},

	'should read a file from the same origin': async ({pass, fail}) => {
		const { container, el, visualizer } = await createAudio(`src="${sameOrigin}"`);
		el.dispatchEvent(new CustomEvent('play'));
		await wait(100);
		const { unavailable } = visualizer;
		el.dispatchEvent(new CustomEvent('pause'));
		cleanup(container);
		if(unavailable) return fail('A file on the same origin should be readable');
		pass('A same-origin file is read');
	},

	'should leave a file from another origin alone and mark itself unavailable': async ({pass, fail}) => {
		const { container, el, visualizer } = await createAudio('src="https://example.invalid/a.mp3"');
		el.dispatchEvent(new CustomEvent('play'));
		await wait(100);
		const { unavailable } = visualizer;
		const hasAttribute = visualizer.hasAttribute('unavailable');
		const resting = litPixels(visualizer);
		cleanup(container);
		if(!unavailable || !hasAttribute) return fail('A file from another origin should leave the visualizer unavailable');
		if(!resting) return fail('It should still draw its resting state');
		pass('Another origin is left alone');
	},

	'should read a file in a srcdoc frame, where location.origin is "null"': async ({pass, fail}) => {
		const frame = document.createElement('iframe');
		const base = new URL('../../../src/components/', import.meta.url).href;
		frame.srcdoc = `<!doctype html><body><k-audio preload="none" src="${sameOrigin}"><kc-audio-visualizer slot="visualizer"></kc-audio-visualizer></k-audio><script type="module" src="${base}Audio.js"></script><script type="module" src="${base}controls/AudioVisualizer.js"></script></body>`;
		document.body.appendChild(frame);
		await new Promise(resolve => { frame.onload = resolve; });
		const win = frame.contentWindow;
		await win.customElements.whenDefined('kc-audio-visualizer');
		await win.customElements.whenDefined('k-audio');
		await wait(200);
		const audio = frame.contentDocument.querySelector('k-audio');
		const visualizer = frame.contentDocument.querySelector('kc-audio-visualizer');
		const origin = win.location.origin;
		audio.dispatchEvent(new CustomEvent('play'));
		await wait(200);
		const { unavailable } = visualizer;
		frame.remove();
		if(unavailable) return fail(`In a frame whose location.origin is ${origin}, a same-origin file should still be readable`);
		pass('A srcdoc frame reads its own files');
	},

	/*
		Moving
	*/
	'should keep resizing and drawing after the player is moved to another place': async ({pass, fail}) => {
		const { container, el, visualizer } = await createAudio(`src="${sameOrigin}"`);
		const spot = document.createElement('div');
		spot.style.width = '300px';
		document.body.appendChild(spot);
		visualizer.style.setProperty('--visualizer_height', '6rem');
		spot.appendChild(el);
		await wait(200);
		const canvas = visualizer.shadowRoot.querySelector('canvas');
		const first = canvas.width;
		spot.style.width = '500px';
		await wait(200);
		const second = canvas.width;
		const bound = visualizer.boundHost === el && !visualizer.disabled;
		const resting = litPixels(visualizer);
		cleanup(container);
		cleanup(spot);
		if(!bound) return fail('The visualizer should still have its host after a move');
		if(second <= first) return fail(`The canvas should follow the new size, got ${first} then ${second}`);
		if(!resting) return fail('It should still draw after a move');
		pass('A moved visualizer keeps up with its size');
	},

	/*
		Waiting for the Player
	*/
	'should wait for a player that is defined after it, and attach then': async ({pass, fail}) => {
		const tag = `test-late-player-${Math.random().toString(36).slice(2, 8)}`;
		const container = document.createElement('div');
		container.innerHTML = `<${tag}><kc-audio-visualizer></kc-audio-visualizer></${tag}>`;
		document.body.appendChild(container);
		const visualizer = container.querySelector('kc-audio-visualizer');
		await visualizer.updateComplete;
		const before = visualizer.boundHost;
		customElements.define(tag, class extends HTMLElement {
			connectedCallback() { this.setAttribute('controlled', ''); }
			play() {}
			pause() {}
			get paused() { return true; }
			get videoEl() { return null; }
		});
		await wait(100);
		const host = container.querySelector(tag);
		const { boundHost, disabled } = visualizer;
		cleanup(container);
		if(before) return fail('There should be no host before the player is defined');
		if(boundHost !== host) return fail('The visualizer should attach once the player is defined');
		if(disabled) return fail('It should be enabled once it has a host');
		pass('The visualizer attaches to a player defined later');
	}
};
