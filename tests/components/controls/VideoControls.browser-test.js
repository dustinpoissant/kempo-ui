import '../../../src/components/Video.js';
import VidPlayPause from '../../../src/components/controls/VidPlayPause.js';
import VidSeek from '../../../src/components/controls/VidSeek.js';
import VidMute from '../../../src/components/controls/VidMute.js';
import VidVolume from '../../../src/components/controls/VidVolume.js';
import VidLoop from '../../../src/components/controls/VidLoop.js';
import VidSpeed from '../../../src/components/controls/VidSpeed.js';
import VidDownload from '../../../src/components/controls/VidDownload.js';
import VidSkipForward from '../../../src/components/controls/VidSkipForward.js';
import VidSkipBack from '../../../src/components/controls/VidSkipBack.js';
import VidPip from '../../../src/components/controls/VidPip.js';
import VidPlayBig from '../../../src/components/controls/VidPlayBig.js';

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

const cleanup = (container) => {
	if(container?.parentNode) container.parentNode.removeChild(container);
};

export default {
	/*
		kc-vid-play-pause
	*/
	'kc-vid-play-pause should be an instance of VidPlayPause': async ({pass, fail}) => {
		const { container, control } = await createVideoWithControl('<kc-vid-play-pause></kc-vid-play-pause>');
		const ok = control instanceof VidPlayPause;
		cleanup(container);
		if(!ok) return fail('Element should be instance of VidPlayPause');
		pass('kc-vid-play-pause created correctly');
	},

	'kc-vid-play-pause should find its parent k-video as host': async ({pass, fail}) => {
		const { container, video, control } = await createVideoWithControl('<kc-vid-play-pause></kc-vid-play-pause>');
		const host = control.host;
		cleanup(container);
		if(host !== video) return fail('kc-vid-play-pause should discover the k-video as its host');
		pass('kc-vid-play-pause finds its host');
	},

	'kc-vid-play-pause click should call togglePlayPause': async ({pass, fail}) => {
		const { container, video, control } = await createVideoWithControl('<kc-vid-play-pause></kc-vid-play-pause>');
		let called = false;
		video.togglePlayPause = () => { called = true; };
		control.click();
		cleanup(container);
		if(!called) return fail('Click should call host.togglePlayPause()');
		pass('Click calls togglePlayPause');
	},

	'kc-vid-play-pause should render play icon when paused': async ({pass, fail}) => {
		const { container, control } = await createVideoWithControl('<kc-vid-play-pause></kc-vid-play-pause>');
		await control.updateComplete;
		const icon = control.shadowRoot.querySelector('k-icon');
		const name = icon?.getAttribute('name');
		cleanup(container);
		if(name !== 'play') return fail(`Expected play icon while paused, got "${name}"`);
		pass('Renders play icon when paused');
	},

	'kc-vid-play-pause should be disabled without a host': async ({pass, fail}) => {
		const control = document.createElement('kc-vid-play-pause');
		document.body.appendChild(control);
		await control.updateComplete;
		const disabled = control.disabled;
		control.remove();
		if(!disabled) return fail('kc-vid-play-pause should disable itself without a [controlled] host');
		pass('kc-vid-play-pause disables itself without a host');
	},

	/*
		kc-vid-seek
	*/
	'kc-vid-seek should be an instance of VidSeek': async ({pass, fail}) => {
		const { container, control } = await createVideoWithControl('<kc-vid-seek></kc-vid-seek>');
		const ok = control instanceof VidSeek;
		cleanup(container);
		if(!ok) return fail('Element should be instance of VidSeek');
		pass('kc-vid-seek created correctly');
	},

	'kc-vid-seek should render a k-slider': async ({pass, fail}) => {
		const { container, control } = await createVideoWithControl('<kc-vid-seek></kc-vid-seek>');
		const slider = control.shadowRoot.querySelector('k-slider');
		cleanup(container);
		if(!slider) return fail('kc-vid-seek should render a k-slider');
		pass('kc-vid-seek renders a k-slider');
	},

	'kc-vid-seek slider change should call host.seek': async ({pass, fail}) => {
		const { container, video, control } = await createVideoWithControl('<kc-vid-seek></kc-vid-seek>');
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
		pass('kc-vid-seek forwards slider changes to host.seek');
	},

	'kc-vid-seek should not call host.seek when host-driven currentTime updates re-render the slider': async ({pass, fail}) => {
		const { container, video, control } = await createVideoWithControl('<kc-vid-seek></kc-vid-seek>');
		let seekCalls = 0;
		video.seek = () => { seekCalls++; };
		Object.defineProperty(video, 'currentTime', { value: 5, configurable: true });
		video.dispatchEvent(new CustomEvent('timeupdate'));
		await control.updateComplete;
		cleanup(container);
		if(seekCalls !== 0) return fail(`Host-driven timeupdate should not call host.seek, but it was called ${seekCalls} time(s)`);
		pass('kc-vid-seek does not feed back into host.seek on host-driven updates');
	},

	'kc-vid-seek should suppress host-driven updates while scrubbing': async ({pass, fail}) => {
		const { container, video, control } = await createVideoWithControl('<kc-vid-seek></kc-vid-seek>');
		control.scrubbing = true;
		let updated = false;
		const original = control.requestUpdate.bind(control);
		control.requestUpdate = (...args) => { updated = true; original(...args); };
		video.dispatchEvent(new CustomEvent('timeupdate'));
		control.requestUpdate = original;
		control.scrubbing = false;
		cleanup(container);
		if(updated) return fail('kc-vid-seek should not requestUpdate while scrubbing is true');
		pass('kc-vid-seek suppresses updates while scrubbing');
	},

	/*
		kc-vid-mute
	*/
	'kc-vid-mute should be an instance of VidMute': async ({pass, fail}) => {
		const { container, control } = await createVideoWithControl('<kc-vid-mute></kc-vid-mute>');
		const ok = control instanceof VidMute;
		cleanup(container);
		if(!ok) return fail('Element should be instance of VidMute');
		pass('kc-vid-mute created correctly');
	},

	'kc-vid-mute click should call toggleMute': async ({pass, fail}) => {
		const { container, video, control } = await createVideoWithControl('<kc-vid-mute></kc-vid-mute>');
		let called = false;
		video.toggleMute = () => { called = true; };
		control.click();
		cleanup(container);
		if(!called) return fail('Click should call host.toggleMute()');
		pass('Click calls toggleMute');
	},

	/*
		kc-vid-loop
	*/
	'kc-vid-loop should be an instance of VidLoop': async ({pass, fail}) => {
		const { container, control } = await createVideoWithControl('<kc-vid-loop></kc-vid-loop>');
		const ok = control instanceof VidLoop;
		cleanup(container);
		if(!ok) return fail('Element should be instance of VidLoop');
		pass('kc-vid-loop created correctly');
	},

	'kc-vid-loop should reflect active attribute from host.loop': async ({pass, fail}) => {
		const { container, video, control } = await createVideoWithControl('<kc-vid-loop></kc-vid-loop>');
		video.loop = true;
		await video.updateComplete;
		await control.updateComplete;
		const active = control.hasAttribute('active');
		cleanup(container);
		if(!active) return fail('kc-vid-loop should set active attribute when host.loop is true');
		pass('kc-vid-loop reflects active state');
	},

	/*
		kc-vid-speed
	*/
	'kc-vid-speed should be an instance of VidSpeed': async ({pass, fail}) => {
		const { container, control } = await createVideoWithControl('<kc-vid-speed></kc-vid-speed>');
		const ok = control instanceof VidSpeed;
		cleanup(container);
		if(!ok) return fail('Element should be instance of VidSpeed');
		pass('kc-vid-speed created correctly');
	},

	'kc-vid-speed menu click should call setPlaybackRate': async ({pass, fail}) => {
		const { container, video, control } = await createVideoWithControl('<kc-vid-speed></kc-vid-speed>');
		let rateSet = null;
		video.setPlaybackRate = (r) => { rateSet = r; };
		const target = [...control.shadowRoot.querySelectorAll('k-dropdown > button')].find(b => b.textContent.trim() === '1.5x');
		target.click();
		cleanup(container);
		if(rateSet !== 1.5) return fail(`Expected setPlaybackRate(1.5) to be called, got ${rateSet}`);
		pass('kc-vid-speed forwards menu clicks to host.setPlaybackRate');
	},

	/*
		kc-vid-download
	*/
	'kc-vid-download should be an instance of VidDownload': async ({pass, fail}) => {
		const { container, control } = await createVideoWithControl('<kc-vid-download></kc-vid-download>');
		const ok = control instanceof VidDownload;
		cleanup(container);
		if(!ok) return fail('Element should be instance of VidDownload');
		pass('kc-vid-download created correctly');
	},

	'kc-vid-download click should call host.download': async ({pass, fail}) => {
		const { container, video, control } = await createVideoWithControl('<kc-vid-download></kc-vid-download>');
		let called = false;
		video.download = () => { called = true; };
		control.click();
		cleanup(container);
		if(!called) return fail('Click should call host.download()');
		pass('Click calls download');
	},

	/*
		kc-vid-skip-forward
	*/
	'kc-vid-skip-forward should be an instance of VidSkipForward': async ({pass, fail}) => {
		const { container, control } = await createVideoWithControl('<kc-vid-skip-forward></kc-vid-skip-forward>');
		const ok = control instanceof VidSkipForward;
		cleanup(container);
		if(!ok) return fail('Element should be instance of VidSkipForward');
		pass('kc-vid-skip-forward created correctly');
	},

	'kc-vid-skip-forward click should call skip with +10': async ({pass, fail}) => {
		const { container, video, control } = await createVideoWithControl('<kc-vid-skip-forward></kc-vid-skip-forward>');
		let skippedBy = null;
		video.skip = (s) => { skippedBy = s; };
		control.click();
		cleanup(container);
		if(skippedBy !== 10) return fail(`Expected skip(10) to be called, got ${skippedBy}`);
		pass('Click calls skip(10)');
	},

	/*
		kc-vid-skip-back
	*/
	'kc-vid-skip-back should be an instance of VidSkipBack': async ({pass, fail}) => {
		const { container, control } = await createVideoWithControl('<kc-vid-skip-back></kc-vid-skip-back>');
		const ok = control instanceof VidSkipBack;
		cleanup(container);
		if(!ok) return fail('Element should be instance of VidSkipBack');
		pass('kc-vid-skip-back created correctly');
	},

	'kc-vid-skip-back click should call skip with -10': async ({pass, fail}) => {
		const { container, video, control } = await createVideoWithControl('<kc-vid-skip-back></kc-vid-skip-back>');
		let skippedBy = null;
		video.skip = (s) => { skippedBy = s; };
		control.click();
		cleanup(container);
		if(skippedBy !== -10) return fail(`Expected skip(-10) to be called, got ${skippedBy}`);
		pass('Click calls skip(-10)');
	},

	/*
		kc-vid-volume
	*/
	'kc-vid-volume should be an instance of VidVolume': async ({pass, fail}) => {
		const { container, control } = await createVideoWithControl('<kc-vid-volume></kc-vid-volume>');
		const ok = control instanceof VidVolume;
		cleanup(container);
		if(!ok) return fail('Element should be instance of VidVolume');
		pass('kc-vid-volume created correctly');
	},

	'kc-vid-volume trigger click should call toggleMute': async ({pass, fail}) => {
		const { container, video, control } = await createVideoWithControl('<kc-vid-volume></kc-vid-volume>');
		let called = false;
		video.toggleMute = () => { called = true; };
		const trigger = control.shadowRoot.querySelector('[slot="trigger"]');
		trigger.click();
		cleanup(container);
		if(!called) return fail('Trigger click should call host.toggleMute()');
		pass('Trigger click calls toggleMute');
	},

	'kc-vid-volume slider change should call setVolume scaled to 0-1': async ({pass, fail}) => {
		const { container, video, control } = await createVideoWithControl('<kc-vid-volume></kc-vid-volume>');
		let volumeSet = null;
		video.setVolume = (v) => { volumeSet = v; };
		const slider = control.shadowRoot.querySelector('k-slider');
		slider.setValue(50);
		await slider.updateComplete;
		cleanup(container);
		if(volumeSet !== 0.5) return fail(`Expected setVolume(0.5) to be called, got ${volumeSet}`);
		pass('Slider change forwards scaled value to setVolume');
	},

	'kc-vid-volume should show volume_off icon when muted': async ({pass, fail}) => {
		const { container, video, control } = await createVideoWithControl('<kc-vid-volume></kc-vid-volume>');
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

	'kc-vid-volume should show volume_up icon when unmuted with volume': async ({pass, fail}) => {
		const { container, control } = await createVideoWithControl('<kc-vid-volume></kc-vid-volume>');
		await control.updateComplete;
		const icon = control.shadowRoot.querySelector('k-icon');
		const name = icon?.getAttribute('name');
		cleanup(container);
		if(name !== 'volume_up') return fail(`Expected volume_up icon by default, got "${name}"`);
		pass('Renders volume_up icon when unmuted');
	},

	/*
		kc-vid-loop (active color)
	*/
	'kc-vid-loop should declare a --tc_primary color rule for the active state': async ({pass, fail}) => {
		const { container, control } = await createVideoWithControl('<kc-vid-loop></kc-vid-loop>');
		const sheets = [...control.shadowRoot.querySelectorAll('style')];
		const rule = sheets
			.flatMap(s => { try { return [...s.sheet.cssRules]; } catch(e) { return []; } })
			.find(r => r.selectorText === ':host([active])' && /--tc_primary/.test(r.style.color));
		cleanup(container);
		if(!rule) return fail('Expected a :host([active]) rule setting color to var(--tc_primary)');
		pass('kc-vid-loop declares --tc_primary color rule for active state');
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
};
