import Video from '../../src/components/Video.js';

const createVideo = async (attrs = '') => {
	const container = document.createElement('div');
	container.innerHTML = `<k-video ${attrs}></k-video>`;
	document.body.appendChild(container);
	const el = container.querySelector('k-video');
	await el.updateComplete;
	return { container, el };
};

const cleanup = (container) => {
	if(container && container.parentNode){
		container.parentNode.removeChild(container);
	}
};

/*
	Two hosts for nesting a k-video two shadow roots deep — the
	consumer-inside-a-consumer shape (e.g. it-viewer inside it-app) that
	document.fullscreenElement doesn't resolve directly to. Defined once,
	guarded, since a test file may be evaluated more than once per page.
*/
const defineHost = (name, markup) => {
	if(customElements.get(name)) return;
	customElements.define(name, class extends HTMLElement {
		constructor(){
			super();
			this.attachShadow({ mode: 'open' }).innerHTML = markup;
		}
	});
};
defineHost('test-video-middle', '<k-video></k-video>');
defineHost('test-video-outer', '<test-video-middle></test-video-middle>');

const createNestedVideo = async () => {
	const outer = document.createElement('test-video-outer');
	document.body.appendChild(outer);
	const middle = outer.shadowRoot.querySelector('test-video-middle');
	const el = middle.shadowRoot.querySelector('k-video');
	await el.updateComplete;
	return { outer, middle, el };
};

// Stubs the three-level chain a real requestFullscreen() on `el` produces once the browser
// propagates it up through both shadow roots: document.fullscreenElement resolves to the
// OUTERMOST host, and each shadow root along the way reports the next one down via its own
// .fullscreenElement, ending at `el` itself.
const stubNestedFullscreen = (outer, middle, el) => {
	Object.defineProperty(document, 'fullscreenElement', { value: outer, configurable: true });
	Object.defineProperty(outer.shadowRoot, 'fullscreenElement', { value: middle, configurable: true });
	Object.defineProperty(middle.shadowRoot, 'fullscreenElement', { value: el, configurable: true });
};
const clearStubbedFullscreen = () => { delete document.fullscreenElement; };

export default {
	/*
		Element Creation
	*/
	'should create video element': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		if(!el){
			cleanup(container);
			return fail('Video element should be created');
		}
		if(!(el instanceof Video)){
			cleanup(container);
			return fail('Element should be instance of Video');
		}
		cleanup(container);
		pass('Video element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		if(!el.shadowRoot){
			cleanup(container);
			return fail('Video should have shadow root');
		}
		cleanup(container);
		pass('Video has shadow root');
	},

	'should render an internal video element': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		const inner = el.shadowRoot.querySelector('#player');
		cleanup(container);
		if(!inner) return fail('Should render an internal <video id="player">');
		if(inner.tagName !== 'VIDEO') return fail(`Expected internal element to be VIDEO, got ${inner.tagName}`);
		pass('Renders internal video element');
	},

	'should set controlled attribute': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		const has = el.hasAttribute('controlled');
		cleanup(container);
		if(!has) return fail('Video should set the controlled attribute for control discovery');
		pass('controlled attribute set');
	},

	/*
		Default Values
	*/
	'should default volume to 1': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		const v = el.volume;
		cleanup(container);
		if(v !== 1) return fail(`Expected volume to default to 1, got ${v}`);
		pass('volume defaults to 1');
	},

	'should default playbackRate to 1': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		const r = el.playbackRate;
		cleanup(container);
		if(r !== 1) return fail(`Expected playbackRate to default to 1, got ${r}`);
		pass('playbackRate defaults to 1');
	},

	'should default loop to false': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		const loop = el.loop;
		cleanup(container);
		if(loop !== false) return fail(`Expected loop to default to false, got ${loop}`);
		pass('loop defaults to false');
	},

	'should default paused to true with no source': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		const paused = el.paused;
		cleanup(container);
		if(paused !== true) return fail(`Expected paused to default to true, got ${paused}`);
		pass('paused defaults to true');
	},

	'should default currentTime and duration to 0': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		const ct = el.currentTime;
		const d = el.duration;
		cleanup(container);
		if(ct !== 0) return fail(`Expected currentTime to default to 0, got ${ct}`);
		if(d !== 0) return fail(`Expected duration to default to 0 with no source, got ${d}`);
		pass('currentTime and duration default to 0');
	},

	'should default idleDelayMs to 2500': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		const v = el.idleDelayMs;
		cleanup(container);
		if(v !== 2500) return fail(`Expected idleDelayMs to default to 2500, got ${v}`);
		pass('idleDelayMs defaults to 2500');
	},

	'should default skipFlashMs to 600': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		const v = el.skipFlashMs;
		cleanup(container);
		if(v !== 600) return fail(`Expected skipFlashMs to default to 600, got ${v}`);
		pass('skipFlashMs defaults to 600');
	},

	'should default skipDuration to 10': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		const v = el.skipDuration;
		cleanup(container);
		if(v !== 10) return fail(`Expected skipDuration to default to 10, got ${v}`);
		pass('skipDuration defaults to 10');
	},

	/*
		Attribute Reflection
	*/
	'should reflect src attribute to property': async ({pass, fail}) => {
		const { container, el } = await createVideo('src="movie.mp4"');
		const src = el.src;
		cleanup(container);
		if(src !== 'movie.mp4') return fail(`Expected src to be movie.mp4, got ${src}`);
		pass('src attribute reflected to property');
	},

	'should reflect loop attribute to property': async ({pass, fail}) => {
		const { container, el } = await createVideo('loop');
		const loop = el.loop;
		cleanup(container);
		if(loop !== true) return fail(`Expected loop to be true, got ${loop}`);
		pass('loop attribute reflected to property');
	},

	'should reflect muted attribute to property': async ({pass, fail}) => {
		const { container, el } = await createVideo('muted');
		const muted = el.muted;
		cleanup(container);
		if(muted !== true) return fail(`Expected muted to be true, got ${muted}`);
		pass('muted attribute reflected to property');
	},

	'should reflect idle-delay-ms attribute to property': async ({pass, fail}) => {
		const { container, el } = await createVideo('idle-delay-ms="5000"');
		const v = el.idleDelayMs;
		cleanup(container);
		if(v !== 5000) return fail(`Expected idleDelayMs to be 5000, got ${v}`);
		pass('idle-delay-ms attribute reflected to property');
	},

	'should reflect skip-flash-ms attribute to property': async ({pass, fail}) => {
		const { container, el } = await createVideo('skip-flash-ms="1000"');
		const v = el.skipFlashMs;
		cleanup(container);
		if(v !== 1000) return fail(`Expected skipFlashMs to be 1000, got ${v}`);
		pass('skip-flash-ms attribute reflected to property');
	},

	'should reflect skip-duration attribute to property': async ({pass, fail}) => {
		const { container, el } = await createVideo('skip-duration="20"');
		const v = el.skipDuration;
		cleanup(container);
		if(v !== 20) return fail(`Expected skipDuration to be 20, got ${v}`);
		pass('skip-duration attribute reflected to property');
	},

	'should reflect idleDelayMs property back to idle-delay-ms attribute': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		el.idleDelayMs = 4000;
		await el.updateComplete;
		const attr = el.getAttribute('idle-delay-ms');
		cleanup(container);
		if(attr !== '4000') return fail(`Expected idle-delay-ms attribute to be "4000", got "${attr}"`);
		pass('idleDelayMs reflects to idle-delay-ms attribute');
	},

	/*
		Playback Methods
	*/
	'togglePlayPause should not throw without a source': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		try {
			el.togglePlayPause();
		} catch(e){
			cleanup(container);
			return fail(`togglePlayPause threw: ${e.message}`);
		}
		cleanup(container);
		pass('togglePlayPause does not throw');
	},

	'play and pause should be chainable': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		const playReturn = el.play();
		const pauseReturn = el.pause();
		cleanup(container);
		if(playReturn !== el) return fail('play() should return the element for chaining');
		if(pauseReturn !== el) return fail('pause() should return the element for chaining');
		pass('play/pause are chainable');
	},

	/*
		Seeking
	*/
	'seek should clamp to 0 minimum': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		el.seek(-50);
		const ct = el.currentTime;
		cleanup(container);
		if(ct !== 0) return fail(`Expected currentTime clamped to 0, got ${ct}`);
		pass('seek clamps to 0 minimum');
	},

	'skip should be relative to currentTime': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		let seekedTo = null;
		el.seek = (t) => { seekedTo = t; };
		Object.defineProperty(el, 'currentTime', { value: 20, configurable: true });
		el.skip(10);
		cleanup(container);
		if(seekedTo !== 30) return fail(`Expected skip(10) from currentTime 20 to seek to 30, got ${seekedTo}`);
		pass('skip is relative to currentTime');
	},

	/*
		Volume
	*/
	'setVolume should clamp between 0 and 1': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		el.setVolume(5);
		const high = el.volume;
		el.setVolume(-5);
		const low = el.volume;
		cleanup(container);
		if(high !== 1) return fail(`Expected setVolume(5) to clamp to 1, got ${high}`);
		if(low !== 0) return fail(`Expected setVolume(-5) to clamp to 0, got ${low}`);
		pass('setVolume clamps between 0 and 1');
	},

	'setVolume above 0 should unmute': async ({pass, fail}) => {
		const { container, el } = await createVideo('muted');
		el.setVolume(0.5);
		const muted = el.muted;
		cleanup(container);
		if(muted !== false) return fail('setVolume above 0 should unmute the player');
		pass('setVolume above 0 unmutes');
	},

	'toggleMute should flip muted state': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		el.toggleMute();
		const afterFirst = el.muted;
		el.toggleMute();
		const afterSecond = el.muted;
		cleanup(container);
		if(afterFirst !== true) return fail('First toggleMute should set muted to true');
		if(afterSecond !== false) return fail('Second toggleMute should set muted back to false');
		pass('toggleMute flips muted state');
	},

	'mute and unmute should set explicit state': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		el.mute();
		const muted = el.muted;
		el.unmute();
		const unmuted = el.muted;
		cleanup(container);
		if(muted !== true) return fail('mute() should set muted to true');
		if(unmuted !== false) return fail('unmute() should set muted to false');
		pass('mute/unmute set explicit state');
	},

	/*
		Playback Rate
	*/
	'setPlaybackRate should clamp between 0.25 and 4': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		el.setPlaybackRate(10);
		const high = el.playbackRate;
		el.setPlaybackRate(0);
		const low = el.playbackRate;
		cleanup(container);
		if(high !== 4) return fail(`Expected setPlaybackRate(10) to clamp to 4, got ${high}`);
		if(low !== 0.25) return fail(`Expected setPlaybackRate(0) to clamp to 0.25, got ${low}`);
		pass('setPlaybackRate clamps between 0.25 and 4');
	},

	/*
		Loop
	*/
	'toggleLoop should flip loop state': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		el.toggleLoop();
		const afterFirst = el.loop;
		el.toggleLoop();
		const afterSecond = el.loop;
		cleanup(container);
		if(afterFirst !== true) return fail('First toggleLoop should set loop to true');
		if(afterSecond !== false) return fail('Second toggleLoop should set loop back to false');
		pass('toggleLoop flips loop state');
	},

	'should fire loop-changed event when loop changes': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		let fired = false;
		el.addEventListener('loop-changed', () => { fired = true; });
		el.toggleLoop();
		await el.updateComplete;
		cleanup(container);
		if(!fired) return fail('loop-changed event should fire when loop changes');
		pass('loop-changed fires on loop change');
	},

	/*
		Fullscreen
	*/
	'toggleFullscreen should not throw': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		try {
			el.toggleFullscreen();
		} catch(e){
			cleanup(container);
			return fail(`toggleFullscreen threw: ${e.message}`);
		}
		cleanup(container);
		pass('toggleFullscreen does not throw');
	},

	'should fire fullscreen-changed event when fullscreen property changes': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		let fired = false;
		el.addEventListener('fullscreen-changed', () => { fired = true; });
		el.fullscreen = true;
		await el.updateComplete;
		cleanup(container);
		if(!fired) return fail('fullscreen-changed event should fire when fullscreen changes');
		pass('fullscreen-changed fires on fullscreen change');
	},

	'handleFullscreenChange should recognize fullscreen when the host is directly document.fullscreenElement': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		Object.defineProperty(document, 'fullscreenElement', { value: el, configurable: true });
		el.handleFullscreenChange();
		const isFullscreen = el.fullscreen;
		clearStubbedFullscreen();
		cleanup(container);
		if(isFullscreen !== true) return fail(`Expected fullscreen to be true when the host is document.fullscreenElement directly, got ${isFullscreen}`);
		pass('fullscreen recognized when the host is document.fullscreenElement directly');
	},

	'handleFullscreenChange should recognize fullscreen when k-video is nested two shadow roots deep': async ({pass, fail}) => {
		const { outer, middle, el } = await createNestedVideo();
		stubNestedFullscreen(outer, middle, el);
		el.handleFullscreenChange();
		const isFullscreen = el.fullscreen;
		clearStubbedFullscreen();
		cleanup(outer);
		if(isFullscreen !== true) return fail(`Expected fullscreen to be true once resolved through both shadow roots, got ${isFullscreen}`);
		pass('fullscreen recognized through nested shadow roots by walking shadowRoot.fullscreenElement');
	},

	'handleFullscreenChange should not report fullscreen for an unrelated nested k-video': async ({pass, fail}) => {
		const { outer, middle, el } = await createNestedVideo();
		const { outer: otherOuter, middle: otherMiddle, el: otherEl } = await createNestedVideo();
		// Fullscreen chain resolves to otherEl, not el — el should stay false.
		stubNestedFullscreen(otherOuter, otherMiddle, otherEl);
		el.handleFullscreenChange();
		const isFullscreen = el.fullscreen;
		clearStubbedFullscreen();
		cleanup(outer);
		cleanup(otherOuter);
		if(isFullscreen !== false) return fail(`Expected fullscreen to stay false for an unrelated nested k-video, got ${isFullscreen}`);
		pass('fullscreen stays false for a k-video that is not the resolved chain');
	},

	'exitFullscreen should call document.exitFullscreen when k-video is nested two shadow roots deep': async ({pass, fail}) => {
		const { outer, middle, el } = await createNestedVideo();
		stubNestedFullscreen(outer, middle, el);
		let exitCalled = false;
		const originalExit = document.exitFullscreen;
		document.exitFullscreen = () => { exitCalled = true; return Promise.resolve(); };
		el.exitFullscreen();
		document.exitFullscreen = originalExit;
		clearStubbedFullscreen();
		cleanup(outer);
		if(!exitCalled) return fail('exitFullscreen() should call document.exitFullscreen() once resolved through both shadow roots');
		pass('exitFullscreen() calls document.exitFullscreen() through nested shadow roots');
	},

	'exitFullscreen should not call document.exitFullscreen for an unrelated nested k-video': async ({pass, fail}) => {
		const { outer, middle, el } = await createNestedVideo();
		const { outer: otherOuter, middle: otherMiddle, el: otherEl } = await createNestedVideo();
		stubNestedFullscreen(otherOuter, otherMiddle, otherEl);
		let exitCalled = false;
		const originalExit = document.exitFullscreen;
		document.exitFullscreen = () => { exitCalled = true; return Promise.resolve(); };
		el.exitFullscreen();
		document.exitFullscreen = originalExit;
		clearStubbedFullscreen();
		cleanup(outer);
		cleanup(otherOuter);
		if(exitCalled) return fail('exitFullscreen() should not call document.exitFullscreen() for a k-video that is not the resolved chain');
		pass('exitFullscreen() is a no-op for a k-video that is not the resolved chain');
	},

	/*
		Download
	*/
	'download should be a no-op without a source': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		const before = document.querySelectorAll('a').length;
		el.download();
		const after = document.querySelectorAll('a').length;
		cleanup(container);
		if(before !== after) return fail('download() without a src should not add anchors to the document');
		pass('download is a no-op without a source');
	},

	'download should create and remove a temporary anchor': async ({pass, fail}) => {
		const { container, el } = await createVideo('src="movie.mp4" download-name="my-movie.mp4"');
		el.download();
		const remaining = document.querySelectorAll('a[download]').length;
		cleanup(container);
		if(remaining !== 0) return fail('download() should clean up its temporary anchor element');
		pass('download creates and cleans up a temporary anchor');
	},

	/*
		Event Forwarding
	*/
	'should forward native video events to the host': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		const inner = el.shadowRoot.querySelector('#player');
		let fired = false;
		el.addEventListener('timeupdate', () => { fired = true; });
		inner.dispatchEvent(new Event('timeupdate'));
		cleanup(container);
		if(!fired) return fail('timeupdate should be forwarded from the internal video to the host');
		pass('native video events are forwarded to the host');
	},

	'should toggle paused attribute on play/pause events': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		const inner = el.shadowRoot.querySelector('#player');
		Object.defineProperty(inner, 'paused', { value: false, configurable: true });
		inner.dispatchEvent(new Event('play'));
		const whilePlaying = el.hasAttribute('paused');
		Object.defineProperty(inner, 'paused', { value: true, configurable: true });
		inner.dispatchEvent(new Event('pause'));
		const whilePaused = el.hasAttribute('paused');
		cleanup(container);
		if(whilePlaying) return fail('paused attribute should be removed while playing');
		if(!whilePaused) return fail('paused attribute should be set while paused');
		pass('paused attribute toggles with play/pause events');
	},

	/*
		Preconfigured control sets
	*/
	'minimal controls should render play-pause, seek, time, and duration': async ({pass, fail}) => {
		const { container, el } = await createVideo('controls="minimal"');
		await el.updateComplete;
		const sr = el.shadowRoot;
		const hasPlayPause = !!sr.querySelector('kc-vid-play-pause');
		const hasSeek = !!sr.querySelector('kc-vid-seek');
		const hasTime = !!sr.querySelector('kc-vid-time');
		const hasDuration = !!sr.querySelector('kc-vid-duration');
		const hasVolume = !!sr.querySelector('kc-vid-volume');
		cleanup(container);
		if(!hasPlayPause || !hasSeek || !hasTime || !hasDuration) return fail('minimal set missing required controls');
		if(hasVolume) return fail('minimal set should not include volume control');
		pass('minimal control set renders correct controls');
	},

	'full controls should render skip, download, volume, speed, and loop': async ({pass, fail}) => {
		const { container, el } = await createVideo('controls="full"');
		await el.updateComplete;
		const sr = el.shadowRoot;
		const hasSkipBack = !!sr.querySelector('kc-vid-skip-back');
		const hasSkipForward = !!sr.querySelector('kc-vid-skip-forward');
		const hasDownload = !!sr.querySelector('kc-vid-download');
		const hasVolume = !!sr.querySelector('kc-vid-volume');
		const hasSpeed = !!sr.querySelector('kc-vid-speed');
		const hasLoop = !!sr.querySelector('kc-vid-loop');
		cleanup(container);
		if(!hasSkipBack || !hasSkipForward || !hasDownload || !hasVolume || !hasSpeed || !hasLoop){
			return fail('full set missing required controls');
		}
		pass('full control set renders correct controls');
	},

	'none controls should render no built-in controls': async ({pass, fail}) => {
		const { container, el } = await createVideo('controls="none"');
		await el.updateComplete;
		const hasAny = !!el.shadowRoot.querySelector('[class^="kc-"], kc-vid-play-pause');
		cleanup(container);
		if(hasAny) return fail('none set should not render any built-in controls');
		pass('none control set renders nothing');
	},

	/*
		Slots (top / center / bottom)
	*/
	'should render a slot="center" region': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		const slot = el.shadowRoot.querySelector('slot[name="center"]');
		cleanup(container);
		if(!slot) return fail('Video should render a slot="center" region');
		pass('slot="center" region rendered');
	},

	'manually slotted center content should be assigned to slot="center"': async ({pass, fail}) => {
		const container = document.createElement('div');
		container.innerHTML = `<k-video><kc-vid-play-big slot="center"></kc-vid-play-big></k-video>`;
		document.body.appendChild(container);
		const el = container.querySelector('k-video');
		await el.updateComplete;
		const slot = el.shadowRoot.querySelector('slot[name="center"]');
		const assigned = slot.assignedElements();
		cleanup(container);
		if(assigned.length !== 1 || assigned[0].tagName !== 'KC-VID-PLAY-BIG'){
			return fail('slot="center" should receive the manually slotted kc-vid-play-big');
		}
		pass('manually slotted center content assigned correctly');
	},

	'minimal/normal/full controls should include kc-vid-play-big in the center slot': async ({pass, fail}) => {
		for(const set of ['minimal', 'normal', 'full']){
			const { container, el } = await createVideo(`controls="${set}"`);
			await el.updateComplete;
			const hasPlayBig = !!el.shadowRoot.querySelector('kc-vid-play-big');
			cleanup(container);
			if(!hasPlayBig) return fail(`controls="${set}" should include kc-vid-play-big by default`);
		}
		pass('minimal/normal/full control sets include kc-vid-play-big');
	},

	/*
		Persistent ID (resume position)
	*/
	'persistent-id: should save currentTime to localStorage on pause': async ({pass, fail}) => {
		const id = 'video-test-save-' + Date.now();
		const key = `video-persistent-id-${id}`;
		window.localStorage.removeItem(key);
		const { container, el } = await createVideo(`persistent-id="${id}"`);
		const inner = el.shadowRoot.querySelector('#player');
		Object.defineProperty(inner, 'currentTime', { value: 12.5, configurable: true });
		Object.defineProperty(inner, 'paused', { value: true, configurable: true });
		inner.dispatchEvent(new Event('pause'));
		const stored = window.localStorage.getItem(key);
		window.localStorage.removeItem(key);
		cleanup(container);
		if(stored !== '12.5') return fail(`Expected localStorage to contain "12.5", got "${stored}"`);
		pass('currentTime saved to localStorage on pause');
	},

	'persistent-id: should debounce-save currentTime on timeupdate': async ({pass, fail}) => {
		const id = 'video-test-debounce-' + Date.now();
		const key = `video-persistent-id-${id}`;
		window.localStorage.removeItem(key);
		const { container, el } = await createVideo(`persistent-id="${id}"`);
		const inner = el.shadowRoot.querySelector('#player');
		Object.defineProperty(inner, 'currentTime', { value: 7, configurable: true });
		inner.dispatchEvent(new Event('timeupdate'));
		const immediately = window.localStorage.getItem(key);
		await new Promise(r => setTimeout(r, 1200));
		const afterDebounce = window.localStorage.getItem(key);
		window.localStorage.removeItem(key);
		cleanup(container);
		if(immediately !== null) return fail('timeupdate should not save immediately (should be debounced)');
		if(afterDebounce !== '7') return fail(`Expected localStorage to contain "7" after debounce, got "${afterDebounce}"`);
		pass('currentTime debounce-saved to localStorage on timeupdate');
	},

	'persistent-id: should restore currentTime from localStorage and fire restored event': async ({pass, fail}) => {
		const id = 'video-test-restore-' + Date.now();
		const key = `video-persistent-id-${id}`;
		window.localStorage.setItem(key, '33.25');
		const container = document.createElement('div');
		container.innerHTML = `<k-video persistent-id="${id}"></k-video>`;
		document.body.appendChild(container);
		const el = container.querySelector('k-video');
		let restoredDetail = null;
		el.addEventListener('restored', (e) => { restoredDetail = e.detail; });
		await el.updateComplete;
		const ct = el.currentTime;
		window.localStorage.removeItem(key);
		cleanup(container);
		if(ct !== 33.25) return fail(`Expected currentTime restored to 33.25, got ${ct}`);
		if(!restoredDetail || restoredDetail.time !== 33.25) return fail(`Expected restored event with { time: 33.25 }, got ${JSON.stringify(restoredDetail)}`);
		pass('currentTime restored from localStorage and restored event fired');
	},

	'persistent-id: should not restore when no localStorage entry exists': async ({pass, fail}) => {
		const id = 'video-test-norestore-' + Date.now();
		const key = `video-persistent-id-${id}`;
		window.localStorage.removeItem(key);
		const { container, el } = await createVideo(`persistent-id="${id}"`);
		const ct = el.currentTime;
		cleanup(container);
		if(ct !== 0) return fail(`Expected currentTime to remain 0 with no stored value, got ${ct}`);
		pass('currentTime unaffected when no localStorage entry exists');
	},

	'persistent-id: should clear localStorage entry when playback ends': async ({pass, fail}) => {
		const id = 'video-test-clear-' + Date.now();
		const key = `video-persistent-id-${id}`;
		window.localStorage.setItem(key, '5');
		const { container, el } = await createVideo(`persistent-id="${id}"`);
		const inner = el.shadowRoot.querySelector('#player');
		inner.dispatchEvent(new Event('ended'));
		const stored = window.localStorage.getItem(key);
		window.localStorage.removeItem(key);
		cleanup(container);
		if(stored !== null) return fail(`Expected localStorage entry to be cleared on ended, got "${stored}"`);
		pass('localStorage entry cleared when playback ends');
	},

	'without persistent-id, pause should not touch localStorage': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		const inner = el.shadowRoot.querySelector('#player');
		const before = window.localStorage.length;
		inner.dispatchEvent(new Event('pause'));
		const after = window.localStorage.length;
		cleanup(container);
		if(before !== after) return fail('pause without persistent-id should not write to localStorage');
		pass('no localStorage writes without persistent-id');
	},

	/*
		Picture-in-Picture
	*/
	'should default pictureInPicture to false': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		const pip = el.pictureInPicture;
		cleanup(container);
		if(pip !== false) return fail(`Expected pictureInPicture to default to false, got ${pip}`);
		pass('pictureInPicture defaults to false');
	},

	'enterPictureInPicture/exitPictureInPicture/togglePictureInPicture should not throw': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		try {
			el.enterPictureInPicture();
			el.exitPictureInPicture();
			el.togglePictureInPicture();
		} catch(e){
			cleanup(container);
			return fail(`Picture-in-Picture methods threw: ${e.message}`);
		}
		cleanup(container);
		pass('Picture-in-Picture methods do not throw');
	},

	'should set pictureInPicture true when document.pictureInPictureElement matches the host': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		const inner = el.shadowRoot.querySelector('#player');
		Object.defineProperty(document, 'pictureInPictureElement', { value: el, configurable: true });
		inner.dispatchEvent(new Event('enterpictureinpicture'));
		const entered = el.pictureInPicture;
		Object.defineProperty(document, 'pictureInPictureElement', { value: null, configurable: true });
		inner.dispatchEvent(new Event('leavepictureinpicture'));
		const left = el.pictureInPicture;
		delete document.pictureInPictureElement;
		cleanup(container);
		if(entered !== true) return fail('pictureInPicture should be true when document.pictureInPictureElement is the k-video host');
		if(left !== false) return fail('pictureInPicture should be false after leavepictureinpicture');
		pass('pictureInPicture tracks document.pictureInPictureElement against the host');
	},

	'should fire picture-in-picture-changed event when pictureInPicture property changes': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		let fired = false;
		el.addEventListener('picture-in-picture-changed', () => { fired = true; });
		el.pictureInPicture = true;
		await el.updateComplete;
		cleanup(container);
		if(!fired) return fail('picture-in-picture-changed event should fire when pictureInPicture changes');
		pass('picture-in-picture-changed fires on pictureInPicture change');
	},

	/*
		Double-Click to Seek
	*/
	'single click should call togglePlayPause after a short delay': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		const inner = el.shadowRoot.querySelector('#player');
		let called = false;
		el.togglePlayPause = () => { called = true; };
		inner.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
		const immediately = called;
		await new Promise(r => setTimeout(r, 300));
		cleanup(container);
		if(immediately) return fail('togglePlayPause should not fire immediately on a single click');
		if(!called) return fail('togglePlayPause should fire after the single-click delay');
		pass('single click calls togglePlayPause after a short delay');
	},

	'double click on the right half should skip forward 10 and not toggle play/pause': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		const inner = el.shadowRoot.querySelector('#player');
		const rect = inner.getBoundingClientRect();
		let skippedBy = null;
		let toggled = false;
		el.skip = (s) => { skippedBy = s; };
		el.togglePlayPause = () => { toggled = true; };
		const rightX = rect.left + rect.width * 0.9;
		const midY = rect.top + rect.height / 2;
		inner.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1, clientX: rightX, clientY: midY }));
		inner.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 2, clientX: rightX, clientY: midY }));
		await new Promise(r => setTimeout(r, 300));
		cleanup(container);
		if(skippedBy !== 10) return fail(`Expected skip(10) on right-side double-click, got ${skippedBy}`);
		if(toggled) return fail('togglePlayPause should not fire after a double-click');
		pass('double click on right half skips forward and suppresses togglePlayPause');
	},

	'double click on the left half should skip backward 10': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		const inner = el.shadowRoot.querySelector('#player');
		const rect = inner.getBoundingClientRect();
		let skippedBy = null;
		el.skip = (s) => { skippedBy = s; };
		const leftX = rect.left + rect.width * 0.1;
		const midY = rect.top + rect.height / 2;
		inner.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1, clientX: leftX, clientY: midY }));
		inner.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 2, clientX: leftX, clientY: midY }));
		cleanup(container);
		if(skippedBy !== -10) return fail(`Expected skip(-10) on left-side double-click, got ${skippedBy}`);
		pass('double click on left half skips backward');
	},

	'double click should show a skip-flash indicator that clears itself': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		const inner = el.shadowRoot.querySelector('#player');
		const rect = inner.getBoundingClientRect();
		const rightX = rect.left + rect.width * 0.9;
		const midY = rect.top + rect.height / 2;
		inner.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1, clientX: rightX, clientY: midY }));
		inner.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 2, clientX: rightX, clientY: midY }));
		await el.updateComplete;
		const flashPresent = !!el.shadowRoot.querySelector('.skip-flash.forward');
		await new Promise(r => setTimeout(r, 800));
		const flashGone = !el.shadowRoot.querySelector('.skip-flash');
		cleanup(container);
		if(!flashPresent) return fail('skip-flash indicator should render immediately after a double-click');
		if(!flashGone) return fail('skip-flash indicator should clear itself after the flash duration');
		pass('skip-flash indicator shows and clears itself');
	},

	'double click should skip by the custom skip-duration instead of the default 10': async ({pass, fail}) => {
		const { container, el } = await createVideo('skip-duration="5"');
		const inner = el.shadowRoot.querySelector('#player');
		const rect = inner.getBoundingClientRect();
		let skippedBy = null;
		el.skip = (s) => { skippedBy = s; };
		const rightX = rect.left + rect.width * 0.9;
		const midY = rect.top + rect.height / 2;
		inner.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1, clientX: rightX, clientY: midY }));
		inner.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 2, clientX: rightX, clientY: midY }));
		cleanup(container);
		if(skippedBy !== 5) return fail(`Expected skip(5) with skip-duration="5", got ${skippedBy}`);
		pass('double click respects custom skip-duration');
	},

	'skip-flash indicator should clear after the custom skip-flash-ms duration': async ({pass, fail}) => {
		const { container, el } = await createVideo('skip-flash-ms="200"');
		const inner = el.shadowRoot.querySelector('#player');
		const rect = inner.getBoundingClientRect();
		const rightX = rect.left + rect.width * 0.9;
		const midY = rect.top + rect.height / 2;
		inner.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1, clientX: rightX, clientY: midY }));
		inner.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 2, clientX: rightX, clientY: midY }));
		await el.updateComplete;
		const flashPresent = !!el.shadowRoot.querySelector('.skip-flash');
		await new Promise(r => setTimeout(r, 300));
		const flashGone = !el.shadowRoot.querySelector('.skip-flash');
		cleanup(container);
		if(!flashPresent) return fail('skip-flash indicator should render immediately after a double-click');
		if(!flashGone) return fail('skip-flash indicator should have cleared within the custom 200ms duration');
		pass('skip-flash indicator respects custom skip-flash-ms');
	},

	/*
		Buffering Indicator
	*/
	'should show buffering spinner on waiting and clear on playing': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		const inner = el.shadowRoot.querySelector('#player');
		inner.dispatchEvent(new Event('waiting'));
		await el.updateComplete;
		const bufferingShown = el.buffering === true && !!el.shadowRoot.querySelector('#buffering k-spinner');
		inner.dispatchEvent(new Event('playing'));
		await el.updateComplete;
		const bufferingCleared = el.buffering === false && !el.shadowRoot.querySelector('#buffering');
		cleanup(container);
		if(!bufferingShown) return fail('buffering spinner should render on waiting');
		if(!bufferingCleared) return fail('buffering spinner should clear on playing');
		pass('buffering spinner shows on waiting and clears on playing');
	},

	'should clear buffering spinner on canplay': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		const inner = el.shadowRoot.querySelector('#player');
		inner.dispatchEvent(new Event('waiting'));
		await el.updateComplete;
		inner.dispatchEvent(new Event('canplay'));
		await el.updateComplete;
		const cleared = el.buffering === false;
		cleanup(container);
		if(!cleared) return fail('buffering should clear on canplay');
		pass('buffering spinner clears on canplay');
	},

	/*
		Custom Sizes / Aspect Ratio
	*/
	'internal video element should use object-fit: contain': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		const inner = el.shadowRoot.querySelector('#player');
		const objectFit = getComputedStyle(inner).objectFit;
		cleanup(container);
		if(objectFit !== 'contain') return fail(`Expected object-fit: contain, got "${objectFit}"`);
		pass('internal video element uses object-fit: contain');
	},

	'internal video element should center its content both ways': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		const inner = el.shadowRoot.querySelector('#player');
		const objectPosition = getComputedStyle(inner).objectPosition;
		cleanup(container);
		if(objectPosition !== '50% 50%') return fail(`Expected object-position centered (50% 50%), got "${objectPosition}"`);
		pass('internal video element centers its content both ways');
	},

	'#video-wrapper should fill a host forced to an explicit size': async ({pass, fail}) => {
		const container = document.createElement('div');
		container.innerHTML = `<k-video style="width: 480px; height: 200px; display: block;"></k-video>`;
		document.body.appendChild(container);
		const el = container.querySelector('k-video');
		await el.updateComplete;
		const wrapperRect = el.shadowRoot.querySelector('#video-wrapper').getBoundingClientRect();
		cleanup(container);
		if(Math.round(wrapperRect.width) !== 480) return fail(`Expected #video-wrapper width 480, got ${wrapperRect.width}`);
		if(Math.round(wrapperRect.height) !== 200) return fail(`Expected #video-wrapper height 200, got ${wrapperRect.height}`);
		pass('#video-wrapper fills a forced host size');
	},

	'forcing the host to a mismatched size should size the internal video element to match it, not overflow or shrink-wrap': async ({pass, fail}) => {
		const container = document.createElement('div');
		container.innerHTML = `<k-video style="width: 480px; height: 200px; display: block;"></k-video>`;
		document.body.appendChild(container);
		const el = container.querySelector('k-video');
		await el.updateComplete;
		const inner = el.shadowRoot.querySelector('#player');
		const rect = inner.getBoundingClientRect();
		cleanup(container);
		if(Math.round(rect.width) !== 480) return fail(`Expected internal video width to match the forced host width (480), got ${rect.width}`);
		if(Math.round(rect.height) !== 200) return fail(`Expected internal video height to match the forced host height (200), got ${rect.height}`);
		pass('internal video element is sized to the forced host box, so object-fit: contain can letterbox/pillarbox within it');
	},

	'forcing the host to a tall/narrow mismatched size should size the internal video element to match it too': async ({pass, fail}) => {
		const container = document.createElement('div');
		container.innerHTML = `<k-video style="width: 200px; height: 400px; display: block;"></k-video>`;
		document.body.appendChild(container);
		const el = container.querySelector('k-video');
		await el.updateComplete;
		const inner = el.shadowRoot.querySelector('#player');
		const rect = inner.getBoundingClientRect();
		cleanup(container);
		if(Math.round(rect.width) !== 200) return fail(`Expected internal video width to match the forced host width (200), got ${rect.width}`);
		if(Math.round(rect.height) !== 400) return fail(`Expected internal video height to match the forced host height (400), got ${rect.height}`);
		pass('internal video element matches a forced tall/narrow host box too');
	},

	'--height and --max-height custom properties should still override the fallback height': async ({pass, fail}) => {
		const container = document.createElement('div');
		container.innerHTML = `<k-video style="width: 480px; height: 200px; display: block; --height: 120px;"></k-video>`;
		document.body.appendChild(container);
		const el = container.querySelector('k-video');
		await el.updateComplete;
		const inner = el.shadowRoot.querySelector('#player');
		const height = getComputedStyle(inner).height;
		cleanup(container);
		if(height !== '120px') return fail(`Expected --height to override the internal video's height to 120px, got "${height}"`);
		pass('--height custom property still overrides the internal video element\'s height');
	},

	'a host with no explicit size should not collapse the internal video element to zero height': async ({pass, fail}) => {
		const container = document.createElement('div');
		container.innerHTML = `<k-video style="width: 400px; display: block;"></k-video>`;
		document.body.appendChild(container);
		const el = container.querySelector('k-video');
		await el.updateComplete;
		const inner = el.shadowRoot.querySelector('#player');
		const rect = inner.getBoundingClientRect();
		cleanup(container);
		if(rect.width === 0 || rect.height === 0) return fail(`Expected non-zero natural size, got ${rect.width}x${rect.height}`);
		pass('Video with no forced host height still lays out via the natural auto-height fallback');
	},

	'fullscreen attribute should still apply object-fit: contain': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		el.setAttribute('fullscreen', '');
		await el.updateComplete;
		const inner = el.shadowRoot.querySelector('#player');
		const objectFit = getComputedStyle(inner).objectFit;
		cleanup(container);
		if(objectFit !== 'contain') return fail(`Expected object-fit: contain while fullscreen, got "${objectFit}"`);
		pass('object-fit: contain still applies in the fullscreen attribute state');
	},

	/*
		Controls Bar Background
	*/
	'#controls-bar should default to the gradient background': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		const bar = el.shadowRoot.querySelector('#controls-bar');
		const background = getComputedStyle(bar).backgroundImage;
		cleanup(container);
		if(!background.includes('gradient')) return fail(`Expected the default gradient background, got "${background}"`);
		pass('#controls-bar defaults to the gradient background');
	},

	'--controls-bg custom property should override the default gradient with a solid background': async ({pass, fail}) => {
		const container = document.createElement('div');
		container.innerHTML = `<k-video style="--controls-bg: rgba(0, 0, 0, 0.6);"></k-video>`;
		document.body.appendChild(container);
		const el = container.querySelector('k-video');
		await el.updateComplete;
		const bar = el.shadowRoot.querySelector('#controls-bar');
		const cs = getComputedStyle(bar);
		const background = cs.backgroundColor;
		const backgroundImage = cs.backgroundImage;
		cleanup(container);
		if(backgroundImage !== 'none') return fail(`Expected no gradient once --controls-bg is set, got backgroundImage "${backgroundImage}"`);
		if(background !== 'rgba(0, 0, 0, 0.6)') return fail(`Expected --controls-bg's solid color to apply, got "${background}"`);
		pass('--controls-bg overrides the default gradient with a solid background');
	},

	/*
		Auto-Hide Controls (idle)
	*/
	'pause should immediately clear the idle attribute': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		const inner = el.shadowRoot.querySelector('#player');
		el.setAttribute('idle', '');
		Object.defineProperty(inner, 'paused', { value: true, configurable: true });
		inner.dispatchEvent(new Event('pause'));
		const idle = el.hasAttribute('idle');
		cleanup(container);
		if(idle) return fail('idle attribute should be cleared immediately on pause');
		pass('pause clears idle attribute immediately');
	},

	'pointerleave while playing should not immediately set idle': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		const inner = el.shadowRoot.querySelector('#player');
		Object.defineProperty(inner, 'paused', { value: false, configurable: true });
		inner.dispatchEvent(new Event('play'));
		el.dispatchEvent(new Event('pointerleave', { bubbles: true }));
		const idle = el.hasAttribute('idle');
		cleanup(container);
		if(idle) return fail('idle attribute should not be set immediately on pointerleave - should wait for the idle timeout');
		pass('pointerleave does not immediately set idle, timeout continues');
	},

	'pointermove should clear idle immediately': async ({pass, fail}) => {
		const { container, el } = await createVideo();
		el.setAttribute('idle', '');
		el.dispatchEvent(new Event('pointermove', { bubbles: true }));
		const idle = el.hasAttribute('idle');
		cleanup(container);
		if(idle) return fail('idle attribute should be cleared immediately on pointermove');
		pass('pointermove clears idle attribute immediately');
	},

	'control bar should auto-hide after a period of inactivity while playing': async ({pass, fail}) => {
		const { container, el } = await createVideo('controls="normal"');
		const inner = el.shadowRoot.querySelector('#player');
		Object.defineProperty(inner, 'paused', { value: false, configurable: true });
		inner.dispatchEvent(new Event('play'));
		const idleBefore = el.hasAttribute('idle');
		await new Promise(r => setTimeout(r, 2800));
		const idleAfter = el.hasAttribute('idle');
		cleanup(container);
		if(idleBefore) return fail('idle should not be set immediately after play');
		if(!idleAfter) return fail('idle should be set automatically after the inactivity delay while playing');
		pass('control bar auto-hides after inactivity while playing');
	},

	'control bar should respect a custom idle-delay-ms': async ({pass, fail}) => {
		const { container, el } = await createVideo('controls="normal" idle-delay-ms="150"');
		const inner = el.shadowRoot.querySelector('#player');
		Object.defineProperty(inner, 'paused', { value: false, configurable: true });
		inner.dispatchEvent(new Event('play'));
		await new Promise(r => setTimeout(r, 100));
		const idleBeforeCustomDelay = el.hasAttribute('idle');
		await new Promise(r => setTimeout(r, 200));
		const idleAfterCustomDelay = el.hasAttribute('idle');
		cleanup(container);
		if(idleBeforeCustomDelay) return fail('idle should not be set before the custom 150ms delay elapses');
		if(!idleAfterCustomDelay) return fail('idle should be set once the custom 150ms delay elapses');
		pass('control bar auto-hides using the custom idle-delay-ms');
	},

	'wakeControls should not immediately clear idle after pointerleave (mouseenter/click race)': async ({pass, fail}) => {
		const { container, el } = await createVideo('controls="normal" idle-delay-ms="150"');
		const inner = el.shadowRoot.querySelector('#player');
		Object.defineProperty(inner, 'paused', { value: false, configurable: true });
		inner.dispatchEvent(new Event('play'));
		el.dispatchEvent(new Event('pointermove', { bubbles: true }));
		el.dispatchEvent(new Event('pointerleave', { bubbles: true }));
		const idleImmediatelyAfterLeave = el.hasAttribute('idle');
		await new Promise(r => setTimeout(r, 250));
		const idleAfterDelay = el.hasAttribute('idle');
		cleanup(container);
		if(idleImmediatelyAfterLeave) return fail('pointerleave should not immediately set idle — the timer started by pointermove should still run');
		if(!idleAfterDelay) return fail('idle should still be set once the delay from the last pointermove elapses');
		pass('pointerleave does not cut the idle timer short');
	}
};
