import '../../../src/components/Video.js';
import MediaPlayPause from '../../../src/components/controls/MediaPlayPause.js';
import MediaSeek from '../../../src/components/controls/MediaSeek.js';
import MediaMute from '../../../src/components/controls/MediaMute.js';
import MediaVolume from '../../../src/components/controls/MediaVolume.js';
import MediaRepeat from '../../../src/components/controls/MediaRepeat.js';
import MediaSpeed from '../../../src/components/controls/MediaSpeed.js';
import MediaDownload from '../../../src/components/controls/MediaDownload.js';
import MediaSkipForward from '../../../src/components/controls/MediaSkipForward.js';
import MediaSkipBack from '../../../src/components/controls/MediaSkipBack.js';
import VidPip from '../../../src/components/controls/VidPip.js';
import VidPlayBig from '../../../src/components/controls/VidPlayBig.js';
import VidMenu from '../../../src/components/controls/VidMenu.js';

const createVideoWithControl = async (tag) => {
	const container = document.createElement('div');
	container.innerHTML = `<k-video>${tag}</k-video>`;
	document.body.appendChild(container);
	const video = container.querySelector('k-video');
	await video.updateComplete;
	const control = video.querySelector(tag.match(/^<([a-z0-9-]+)/i)[1]);
	await control.updateComplete;
	return { container, video, control };
};

const createVideoWithMenu = async (innerHTML) => {
	const container = document.createElement('div');
	container.innerHTML = `<k-video><kc-vid-menu>${innerHTML}</kc-vid-menu></k-video>`;
	document.body.appendChild(container);
	const video = container.querySelector('k-video');
	await video.updateComplete;
	const menu = video.querySelector('kc-vid-menu');
	await menu.updateComplete;
	// Let the menu's slotchange handler (icon/label injection) run.
	await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
	return { container, video, menu };
};

const cleanup = (container) => {
	if(container?.parentNode) container.parentNode.removeChild(container);
};

export default {
	/*
		kc-media-play-pause
	*/
	'kc-media-play-pause should be an instance of MediaPlayPause': async ({pass, fail}) => {
		const { container, control } = await createVideoWithControl('<kc-media-play-pause></kc-media-play-pause>');
		const ok = control instanceof MediaPlayPause;
		cleanup(container);
		if(!ok) return fail('Element should be instance of MediaPlayPause');
		pass('kc-media-play-pause created correctly');
	},

	'kc-media-play-pause should find its parent k-video as host': async ({pass, fail}) => {
		const { container, video, control } = await createVideoWithControl('<kc-media-play-pause></kc-media-play-pause>');
		const host = control.host;
		cleanup(container);
		if(host !== video) return fail('kc-media-play-pause should discover the k-video as its host');
		pass('kc-media-play-pause finds its host');
	},

	'kc-media-play-pause click should call togglePlayPause': async ({pass, fail}) => {
		const { container, video, control } = await createVideoWithControl('<kc-media-play-pause></kc-media-play-pause>');
		let called = false;
		video.togglePlayPause = () => { called = true; };
		control.click();
		cleanup(container);
		if(!called) return fail('Click should call host.togglePlayPause()');
		pass('Click calls togglePlayPause');
	},

	'kc-media-play-pause should render play icon when paused': async ({pass, fail}) => {
		const { container, control } = await createVideoWithControl('<kc-media-play-pause></kc-media-play-pause>');
		await control.updateComplete;
		const icon = control.shadowRoot.querySelector('k-icon');
		const name = icon?.getAttribute('name');
		cleanup(container);
		if(name !== 'play') return fail(`Expected play icon while paused, got "${name}"`);
		pass('Renders play icon when paused');
	},

	'kc-media-play-pause should be disabled without a host': async ({pass, fail}) => {
		const control = document.createElement('kc-media-play-pause');
		document.body.appendChild(control);
		await control.updateComplete;
		const disabled = control.disabled;
		control.remove();
		if(!disabled) return fail('kc-media-play-pause should disable itself without a [controlled] host');
		pass('kc-media-play-pause disables itself without a host');
	},

	/*
		kc-media-seek
	*/
	'kc-media-seek should be an instance of MediaSeek': async ({pass, fail}) => {
		const { container, control } = await createVideoWithControl('<kc-media-seek></kc-media-seek>');
		const ok = control instanceof MediaSeek;
		cleanup(container);
		if(!ok) return fail('Element should be instance of MediaSeek');
		pass('kc-media-seek created correctly');
	},

	'kc-media-seek should render a k-slider': async ({pass, fail}) => {
		const { container, control } = await createVideoWithControl('<kc-media-seek></kc-media-seek>');
		const slider = control.shadowRoot.querySelector('k-slider');
		cleanup(container);
		if(!slider) return fail('kc-media-seek should render a k-slider');
		pass('kc-media-seek renders a k-slider');
	},

	'kc-media-seek slider change should call host.seek': async ({pass, fail}) => {
		const { container, video, control } = await createVideoWithControl('<kc-media-seek></kc-media-seek>');
		let seekedTo = null;
		video.seek = (t) => { seekedTo = t; };
		Object.defineProperty(video, 'duration', { value: 100, configurable: true });
		video.dispatchEvent(new CustomEvent('durationchange'));
		await control.updateComplete;
		const slider = control.shadowRoot.querySelector('k-slider');
		slider.setValue(42);
		await slider.updateComplete;
		cleanup(container);
		if(seekedTo !== 42) return fail(`Expected host.seek(42) to be called, got ${seekedTo}`);
		pass('kc-media-seek forwards slider changes to host.seek');
	},

	'kc-media-seek should not call host.seek when host-driven currentTime updates re-render the slider': async ({pass, fail}) => {
		const { container, video, control } = await createVideoWithControl('<kc-media-seek></kc-media-seek>');
		let seekCalls = 0;
		video.seek = () => { seekCalls++; };
		Object.defineProperty(video, 'currentTime', { value: 5, configurable: true });
		video.dispatchEvent(new CustomEvent('timeupdate'));
		await control.updateComplete;
		cleanup(container);
		if(seekCalls !== 0) return fail(`Host-driven timeupdate should not call host.seek, but it was called ${seekCalls} time(s)`);
		pass('kc-media-seek does not feed back into host.seek on host-driven updates');
	},

	'kc-media-seek should suppress host-driven updates while scrubbing': async ({pass, fail}) => {
		const { container, video, control } = await createVideoWithControl('<kc-media-seek></kc-media-seek>');
		control.scrubbing = true;
		let updated = false;
		const original = control.requestUpdate.bind(control);
		control.requestUpdate = (...args) => { updated = true; original(...args); };
		video.dispatchEvent(new CustomEvent('timeupdate'));
		control.requestUpdate = original;
		control.scrubbing = false;
		cleanup(container);
		if(updated) return fail('kc-media-seek should not requestUpdate while scrubbing is true');
		pass('kc-media-seek suppresses updates while scrubbing');
	},

	/*
		kc-media-mute
	*/
	'kc-media-mute should be an instance of MediaMute': async ({pass, fail}) => {
		const { container, control } = await createVideoWithControl('<kc-media-mute></kc-media-mute>');
		const ok = control instanceof MediaMute;
		cleanup(container);
		if(!ok) return fail('Element should be instance of MediaMute');
		pass('kc-media-mute created correctly');
	},

	'kc-media-mute click should call toggleMute': async ({pass, fail}) => {
		const { container, video, control } = await createVideoWithControl('<kc-media-mute></kc-media-mute>');
		let called = false;
		video.toggleMute = () => { called = true; };
		control.click();
		cleanup(container);
		if(!called) return fail('Click should call host.toggleMute()');
		pass('Click calls toggleMute');
	},

	/*
		kc-media-repeat
	*/
	'kc-media-repeat should be an instance of MediaRepeat': async ({pass, fail}) => {
		const { container, control } = await createVideoWithControl('<kc-media-repeat></kc-media-repeat>');
		const ok = control instanceof MediaRepeat;
		cleanup(container);
		if(!ok) return fail('Element should be instance of MediaRepeat');
		pass('kc-media-repeat created correctly');
	},

	'kc-media-repeat should reflect active attribute from host.loop': async ({pass, fail}) => {
		const { container, video, control } = await createVideoWithControl('<kc-media-repeat></kc-media-repeat>');
		video.loop = true;
		await video.updateComplete;
		await control.updateComplete;
		const active = control.hasAttribute('active');
		cleanup(container);
		if(!active) return fail('kc-media-repeat should set active attribute when host.loop is true');
		pass('kc-media-repeat reflects active state');
	},

	/*
		kc-media-speed
	*/
	'kc-media-speed should be an instance of MediaSpeed': async ({pass, fail}) => {
		const { container, control } = await createVideoWithControl('<kc-media-speed></kc-media-speed>');
		const ok = control instanceof MediaSpeed;
		cleanup(container);
		if(!ok) return fail('Element should be instance of MediaSpeed');
		pass('kc-media-speed created correctly');
	},

	'kc-media-speed menu click should call setPlaybackRate': async ({pass, fail}) => {
		const { container, video, control } = await createVideoWithControl('<kc-media-speed></kc-media-speed>');
		let rateSet = null;
		video.setPlaybackRate = (r) => { rateSet = r; };
		const target = [...control.shadowRoot.querySelectorAll('k-dropdown > button')].find(b => b.textContent.trim() === '1.5x');
		target.click();
		cleanup(container);
		if(rateSet !== 1.5) return fail(`Expected setPlaybackRate(1.5) to be called, got ${rateSet}`);
		pass('kc-media-speed forwards menu clicks to host.setPlaybackRate');
	},

	'kc-media-speed standalone should not be in submenu mode': async ({pass, fail}) => {
		const { container, control } = await createVideoWithControl('<kc-media-speed></kc-media-speed>');
		const inMenu = control.inMenu;
		const dd = control.shadowRoot.querySelector('k-dropdown');
		const submenu = dd.submenu;
		const openDirection = dd.openDirection;
		cleanup(container);
		if(inMenu) return fail('Standalone kc-media-speed should not detect itself as inMenu');
		if(submenu) return fail('Standalone kc-media-speed should not switch its internal k-dropdown to submenu mode');
		if(openDirection !== 'up center') return fail(`Expected standalone open-direction "up center", got "${openDirection}"`);
		pass('Standalone kc-media-speed keeps its compact up-popup behavior');
	},

	'kc-media-speed inside kc-vid-menu should switch to submenu mode': async ({pass, fail}) => {
		const { container, menu } = await createVideoWithMenu('<kc-media-speed>Speed</kc-media-speed>');
		const speed = menu.querySelector('kc-media-speed');
		await speed.updateComplete;
		const inMenu = speed.inMenu;
		const dd = speed.shadowRoot.querySelector('k-dropdown');
		const submenu = dd.submenu;
		const openDirection = dd.openDirection;
		cleanup(container);
		if(!inMenu) return fail('kc-media-speed nested inside kc-vid-menu should detect itself as inMenu');
		if(!submenu) return fail('kc-media-speed nested inside kc-vid-menu should switch its internal k-dropdown to submenu mode');
		if(openDirection !== 'right down') return fail(`Expected submenu open-direction "right down", got "${openDirection}"`);
		pass('kc-media-speed inside kc-vid-menu behaves as a native submenu');
	},

	'kc-media-speed submenu should still forward rate selection to host.setPlaybackRate': async ({pass, fail}) => {
		const { container, video, menu } = await createVideoWithMenu('<kc-media-speed>Speed</kc-media-speed>');
		const speed = menu.querySelector('kc-media-speed');
		await speed.updateComplete;
		let rateSet = null;
		video.setPlaybackRate = (r) => { rateSet = r; };
		const target = [...speed.shadowRoot.querySelectorAll('k-dropdown > button')].find(b => b.textContent.trim() === '1.75x');
		target.click();
		cleanup(container);
		if(rateSet !== 1.75) return fail(`Expected setPlaybackRate(1.75) to be called, got ${rateSet}`);
		pass('kc-media-speed submenu still forwards rate selection to host.setPlaybackRate');
	},

	/*
		kc-media-download
	*/
	'kc-media-download should be an instance of MediaDownload': async ({pass, fail}) => {
		const { container, control } = await createVideoWithControl('<kc-media-download></kc-media-download>');
		const ok = control instanceof MediaDownload;
		cleanup(container);
		if(!ok) return fail('Element should be instance of MediaDownload');
		pass('kc-media-download created correctly');
	},

	'kc-media-download click should call host.download': async ({pass, fail}) => {
		const { container, video, control } = await createVideoWithControl('<kc-media-download></kc-media-download>');
		let called = false;
		video.download = () => { called = true; };
		control.click();
		cleanup(container);
		if(!called) return fail('Click should call host.download()');
		pass('Click calls download');
	},

	/*
		kc-media-skip-forward
	*/
	'kc-media-skip-forward should be an instance of MediaSkipForward': async ({pass, fail}) => {
		const { container, control } = await createVideoWithControl('<kc-media-skip-forward></kc-media-skip-forward>');
		const ok = control instanceof MediaSkipForward;
		cleanup(container);
		if(!ok) return fail('Element should be instance of MediaSkipForward');
		pass('kc-media-skip-forward created correctly');
	},

	'kc-media-skip-forward click should call skip with +10': async ({pass, fail}) => {
		const { container, video, control } = await createVideoWithControl('<kc-media-skip-forward></kc-media-skip-forward>');
		let skippedBy = null;
		video.skip = (s) => { skippedBy = s; };
		control.click();
		cleanup(container);
		if(skippedBy !== 10) return fail(`Expected skip(10) to be called, got ${skippedBy}`);
		pass('Click calls skip(10)');
	},

	/*
		kc-media-skip-back
	*/
	'kc-media-skip-back should be an instance of MediaSkipBack': async ({pass, fail}) => {
		const { container, control } = await createVideoWithControl('<kc-media-skip-back></kc-media-skip-back>');
		const ok = control instanceof MediaSkipBack;
		cleanup(container);
		if(!ok) return fail('Element should be instance of MediaSkipBack');
		pass('kc-media-skip-back created correctly');
	},

	'kc-media-skip-back click should call skip with -10': async ({pass, fail}) => {
		const { container, video, control } = await createVideoWithControl('<kc-media-skip-back></kc-media-skip-back>');
		let skippedBy = null;
		video.skip = (s) => { skippedBy = s; };
		control.click();
		cleanup(container);
		if(skippedBy !== -10) return fail(`Expected skip(-10) to be called, got ${skippedBy}`);
		pass('Click calls skip(-10)');
	},

	/*
		kc-media-volume
	*/
	'kc-media-volume should be an instance of MediaVolume': async ({pass, fail}) => {
		const { container, control } = await createVideoWithControl('<kc-media-volume></kc-media-volume>');
		const ok = control instanceof MediaVolume;
		cleanup(container);
		if(!ok) return fail('Element should be instance of MediaVolume');
		pass('kc-media-volume created correctly');
	},

	'kc-media-volume trigger click should call toggleMute': async ({pass, fail}) => {
		const { container, video, control } = await createVideoWithControl('<kc-media-volume></kc-media-volume>');
		let called = false;
		video.toggleMute = () => { called = true; };
		const trigger = control.shadowRoot.querySelector('[slot="trigger"]');
		trigger.click();
		cleanup(container);
		if(!called) return fail('Trigger click should call host.toggleMute()');
		pass('Trigger click calls toggleMute');
	},

	'kc-media-volume slider change should call setVolume scaled to 0-1': async ({pass, fail}) => {
		const { container, video, control } = await createVideoWithControl('<kc-media-volume></kc-media-volume>');
		let volumeSet = null;
		video.setVolume = (v) => { volumeSet = v; };
		const slider = control.shadowRoot.querySelector('k-slider');
		slider.setValue(50);
		await slider.updateComplete;
		cleanup(container);
		if(volumeSet !== 0.5) return fail(`Expected setVolume(0.5) to be called, got ${volumeSet}`);
		pass('Slider change forwards scaled value to setVolume');
	},

	'kc-media-volume should show volume_off icon when muted': async ({pass, fail}) => {
		const { container, video, control } = await createVideoWithControl('<kc-media-volume></kc-media-volume>');
		const inner = video.shadowRoot.querySelector('#player');
		Object.defineProperty(inner, 'muted', { value: true, configurable: true, writable: true });
		inner.dispatchEvent(new Event('volumechange'));
		await video.updateComplete;
		await control.updateComplete;
		const icon = control.shadowRoot.querySelector('k-icon');
		const name = icon?.getAttribute('name');
		cleanup(container);
		if(name !== 'volume_off') return fail(`Expected volume_off icon while muted, got "${name}"`);
		pass('Renders volume_off icon when muted');
	},

	'kc-media-volume should show volume_up icon when unmuted with volume': async ({pass, fail}) => {
		const { container, control } = await createVideoWithControl('<kc-media-volume></kc-media-volume>');
		await control.updateComplete;
		const icon = control.shadowRoot.querySelector('k-icon');
		const name = icon?.getAttribute('name');
		cleanup(container);
		if(name !== 'volume_up') return fail(`Expected volume_up icon by default, got "${name}"`);
		pass('Renders volume_up icon when unmuted');
	},

	/*
		kc-media-repeat (active color)
	*/
	'kc-media-repeat should declare a --tc_primary color rule for the active state': async ({pass, fail}) => {
		const { container, control } = await createVideoWithControl('<kc-media-repeat></kc-media-repeat>');
		const sheets = [...control.shadowRoot.querySelectorAll('style')];
		const rule = sheets
			.flatMap(s => { try { return [...s.sheet.cssRules]; } catch(e) { return []; } })
			.find(r => r.selectorText === ':host([active])' && /--tc_primary/.test(r.style.color));
		cleanup(container);
		if(!rule) return fail('Expected a :host([active]) rule setting color to var(--tc_primary)');
		pass('kc-media-repeat declares --tc_primary color rule for active state');
	},

	/*
		kc-vid-pip
	*/
	'kc-vid-pip should be an instance of VidPip': async ({pass, fail}) => {
		const { container, control } = await createVideoWithControl('<kc-vid-pip></kc-vid-pip>');
		const ok = control instanceof VidPip;
		cleanup(container);
		if(!ok) return fail('Element should be instance of VidPip');
		pass('kc-vid-pip created correctly');
	},

	'kc-vid-pip click should call togglePictureInPicture': async ({pass, fail}) => {
		const { container, video, control } = await createVideoWithControl('<kc-vid-pip></kc-vid-pip>');
		let called = false;
		video.togglePictureInPicture = () => { called = true; };
		control.click();
		cleanup(container);
		if(!called) return fail('Click should call host.togglePictureInPicture()');
		pass('Click calls togglePictureInPicture');
	},

	'kc-vid-pip should reflect active attribute from host.pictureInPicture': async ({pass, fail}) => {
		const { container, video, control } = await createVideoWithControl('<kc-vid-pip></kc-vid-pip>');
		video.pictureInPicture = true;
		await video.updateComplete;
		await control.updateComplete;
		const active = control.hasAttribute('active');
		cleanup(container);
		if(!active) return fail('kc-vid-pip should set active attribute when host.pictureInPicture is true');
		pass('kc-vid-pip reflects active state');
	},

	/*
		kc-vid-play-big
	*/
	'kc-vid-play-big should be an instance of VidPlayBig': async ({pass, fail}) => {
		const { container, control } = await createVideoWithControl('<kc-vid-play-big></kc-vid-play-big>');
		const ok = control instanceof VidPlayBig;
		cleanup(container);
		if(!ok) return fail('Element should be instance of VidPlayBig');
		pass('kc-vid-play-big created correctly');
	},

	'kc-vid-play-big should render a button by default (host paused)': async ({pass, fail}) => {
		const { container, control } = await createVideoWithControl('<kc-vid-play-big></kc-vid-play-big>');
		const btn = control.shadowRoot.querySelector('button');
		cleanup(container);
		if(!btn) return fail('kc-vid-play-big should render a button while host is paused');
		pass('kc-vid-play-big renders a button while paused');
	},

	'kc-vid-play-big should render nothing while host is playing': async ({pass, fail}) => {
		const { container, video, control } = await createVideoWithControl('<kc-vid-play-big></kc-vid-play-big>');
		const inner = video.shadowRoot.querySelector('#player');
		Object.defineProperty(inner, 'paused', { value: false, configurable: true });
		inner.dispatchEvent(new Event('play'));
		await control.updateComplete;
		const btn = control.shadowRoot.querySelector('button');
		cleanup(container);
		if(btn) return fail('kc-vid-play-big should render nothing while host is playing');
		pass('kc-vid-play-big renders nothing while playing');
	},

	'kc-vid-play-big should show play icon by default and replay icon when ended': async ({pass, fail}) => {
		const { container, video, control } = await createVideoWithControl('<kc-vid-play-big></kc-vid-play-big>');
		const inner = video.shadowRoot.querySelector('#player');
		const playIcon = control.shadowRoot.querySelector('k-icon')?.getAttribute('name');
		Object.defineProperty(inner, 'ended', { value: true, configurable: true });
		inner.dispatchEvent(new Event('ended'));
		await control.updateComplete;
		const replayIcon = control.shadowRoot.querySelector('k-icon')?.getAttribute('name');
		cleanup(container);
		if(playIcon !== 'play') return fail(`Expected play icon by default, got "${playIcon}"`);
		if(replayIcon !== 'replay') return fail(`Expected replay icon when ended, got "${replayIcon}"`);
		pass('kc-vid-play-big shows play/replay icon correctly');
	},

	'kc-vid-play-big click should call host.play': async ({pass, fail}) => {
		const { container, video, control } = await createVideoWithControl('<kc-vid-play-big></kc-vid-play-big>');
		let called = false;
		video.play = () => { called = true; };
		control.shadowRoot.querySelector('button').click();
		cleanup(container);
		if(!called) return fail('Click should call host.play()');
		pass('Click calls play');
	},

	'kc-vid-play-big click when ended should seek to 0 before playing': async ({pass, fail}) => {
		const { container, video, control } = await createVideoWithControl('<kc-vid-play-big></kc-vid-play-big>');
		const inner = video.shadowRoot.querySelector('#player');
		Object.defineProperty(inner, 'ended', { value: true, configurable: true });
		inner.dispatchEvent(new Event('ended'));
		await control.updateComplete;
		let seekedTo = null;
		let played = false;
		video.seek = (t) => { seekedTo = t; };
		video.play = () => { played = true; };
		control.shadowRoot.querySelector('button').click();
		cleanup(container);
		if(seekedTo !== 0) return fail(`Expected seek(0) to be called when ended, got ${seekedTo}`);
		if(!played) return fail('Expected play() to be called after seek(0)');
		pass('Click when ended seeks to 0 then plays');
	},

	/*
		kc-vid-menu
	*/
	'kc-vid-menu should be an instance of VidMenu': async ({pass, fail}) => {
		const { container, menu } = await createVideoWithMenu('<kc-media-repeat>Loop</kc-media-repeat>');
		const ok = menu instanceof VidMenu;
		cleanup(container);
		if(!ok) return fail('Element should be instance of VidMenu');
		pass('kc-vid-menu created correctly');
	},

	'kc-vid-menu should default its icon to more_vert': async ({pass, fail}) => {
		const { container, menu } = await createVideoWithMenu('<kc-media-repeat>Loop</kc-media-repeat>');
		const triggerIcon = menu.shadowRoot.querySelector('button[slot="trigger"] k-icon')?.getAttribute('name');
		cleanup(container);
		if(triggerIcon !== 'more_vert') return fail(`Expected default trigger icon "more_vert", got "${triggerIcon}"`);
		pass('kc-vid-menu trigger defaults to more_vert icon');
	},

	'kc-vid-menu should respect a custom icon attribute': async ({pass, fail}) => {
		const container = document.createElement('div');
		container.innerHTML = `<k-video><kc-vid-menu icon="settings"><kc-media-repeat>Loop</kc-media-repeat></kc-vid-menu></k-video>`;
		document.body.appendChild(container);
		const video = container.querySelector('k-video');
		await video.updateComplete;
		const menu = video.querySelector('kc-vid-menu');
		await menu.updateComplete;
		const triggerIcon = menu.shadowRoot.querySelector('button[slot="trigger"] k-icon')?.getAttribute('name');
		cleanup(container);
		if(triggerIcon !== 'settings') return fail(`Expected trigger icon "settings", got "${triggerIcon}"`);
		pass('kc-vid-menu respects the icon attribute');
	},

	'kc-vid-menu should inject a matching icon and the label text into a slotted control': async ({pass, fail}) => {
		const { container, menu } = await createVideoWithMenu('<kc-media-repeat>Loop</kc-media-repeat>');
		const loop = menu.querySelector('kc-media-repeat');
		const icon = loop.querySelector('k-icon');
		const label = loop.querySelector('span');
		cleanup(container);
		if(icon?.getAttribute('name') !== 'repeat') return fail(`Expected injected icon "repeat" (matching MediaRepeat's own default), got "${icon?.getAttribute('name')}"`);
		if(label?.textContent !== 'Loop') return fail(`Expected injected label text "Loop", got "${label?.textContent}"`);
		pass('kc-vid-menu injects a matching icon and label into a slotted control');
	},

	'kc-vid-menu should use kc-vid-pip\'s own "pip" icon, not a mismatched one': async ({pass, fail}) => {
		const { container, menu } = await createVideoWithMenu('<kc-vid-pip>Picture-in-Picture</kc-vid-pip>');
		const pip = menu.querySelector('kc-vid-pip');
		const icon = pip.querySelector('k-icon');
		cleanup(container);
		if(icon?.getAttribute('name') !== 'pip') return fail(`Expected injected PiP icon "pip", got "${icon?.getAttribute('name')}"`);
		pass('kc-vid-menu uses kc-vid-pip\'s own "pip" icon');
	},

	'kc-vid-menu should preserve kc-media-repeat\'s active state and its color styling': async ({pass, fail}) => {
		// --tc_primary normally comes from kempo-css (via light-dark(), which
		// also needs color-scheme), neither of which this isolated test page
		// loads — define it explicitly so the test doesn't depend on that.
		document.documentElement.style.setProperty('--tc_primary', 'rgb(51, 102, 255)');
		const { container, video, menu } = await createVideoWithMenu('<kc-media-repeat>Loop</kc-media-repeat>');
		const loop = menu.querySelector('kc-media-repeat');
		const dd = menu.shadowRoot.querySelector('k-dropdown');
		dd.open();
		video.toggleLoop();
		await video.updateComplete;
		await loop.updateComplete;
		const active = loop.hasAttribute('active');
		const color = getComputedStyle(loop).color;
		cleanup(container);
		document.documentElement.style.removeProperty('--tc_primary');
		if(!active) return fail('kc-media-repeat inside kc-vid-menu should still set the active attribute when host.loop is true');
		// A rule in kc-vid-menu's own ::slotted(*) clobbering kc-media-repeat's
		// :host([active]) color would show up here as black instead.
		if(color !== 'rgb(51, 102, 255)') return fail(`Expected kc-media-repeat's active-state color (rgb(51, 102, 255)) to win, got ${color} — kc-vid-menu's own color rule is clobbering it`);
		pass('kc-vid-menu preserves kc-media-repeat\'s active attribute and its own active-state color');
	},

	'kc-vid-menu should still forward clicks on a slotted control to the host': async ({pass, fail}) => {
		const { container, video, menu } = await createVideoWithMenu('<kc-media-repeat>Loop</kc-media-repeat>');
		const loop = menu.querySelector('kc-media-repeat');
		let called = false;
		video.toggleLoop = () => { called = true; };
		loop.click();
		cleanup(container);
		if(!called) return fail('Clicking kc-media-repeat inside kc-vid-menu should still call host.toggleLoop()');
		pass('kc-vid-menu forwards clicks on slotted controls to the host');
	}
};
