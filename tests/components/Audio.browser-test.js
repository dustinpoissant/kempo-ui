import Audio from '../../src/components/Audio.js';
import '../../src/components/AudioTrack.js';

const wait = (ms = 50) => new Promise(r => setTimeout(r, ms));

const createAudio = async (attrs = '', inner = '') => {
	const container = document.createElement('div');
	container.innerHTML = `<k-audio ${attrs}>${inner}</k-audio>`;
	document.body.appendChild(container);
	const el = container.querySelector('k-audio');
	await el.updateComplete;
	await wait();
	return { container, el };
};

const cleanup = (container) => {
	if(container && container.parentNode){
		container.parentNode.removeChild(container);
	}
};

const tracksMarkup = `
	<k-audio-track src="a.mp3" artist="Artist A" track-title="One"></k-audio-track>
	<k-audio-track src="b.mp3" artist="Artist B" track-title="Two"></k-audio-track>
	<k-audio-track src="c.mp3" artist="Artist C" track-title="Three"></k-audio-track>
`;

export default {
	/*
		Element Creation
	*/
	'should create audio element': async ({pass, fail}) => {
		const { container, el } = await createAudio();
		if(!(el instanceof Audio)){
			cleanup(container);
			return fail('Element should be instance of Audio');
		}
		cleanup(container);
		pass('Audio element is created');
	},

	/*
		Playlists
	*/
	'should load the first track of a playlist': async ({pass, fail}) => {
		const { container, el } = await createAudio('', tracksMarkup);
		if(el.tracks.length !== 3){
			cleanup(container);
			return fail(`Expected 3 tracks, got ${el.tracks.length}`);
		}
		if(el.trackIndex !== 0 || el.src !== 'a.mp3' || el.trackTitle !== 'One'){
			cleanup(container);
			return fail('First track should be selected with its src and title');
		}
		cleanup(container);
		pass('First track is selected');
	},

	'should move to the next and previous track': async ({pass, fail}) => {
		const { container, el } = await createAudio('', tracksMarkup);
		el.nextTrack();
		if(el.trackIndex !== 1 || el.src !== 'b.mp3'){
			cleanup(container);
			return fail('nextTrack should select the second track');
		}
		el.previousTrack();
		if(el.trackIndex !== 0 || el.src !== 'a.mp3'){
			cleanup(container);
			return fail('previousTrack should select the first track');
		}
		cleanup(container);
		pass('Next and previous move through the playlist');
	},

	'should stop at the ends of the playlist by default': async ({pass, fail}) => {
		const { container, el } = await createAudio('', tracksMarkup);
		el.previousTrack();
		if(el.trackIndex !== 0){
			cleanup(container);
			return fail('previousTrack on the first track should do nothing');
		}
		el.selectTrack(2);
		el.nextTrack();
		if(el.trackIndex !== 2){
			cleanup(container);
			return fail('nextTrack on the last track should do nothing without playlist-loop');
		}
		cleanup(container);
		pass('Playlist stops at both ends by default');
	},

	'should wrap around the playlist with playlist-loop': async ({pass, fail}) => {
		const { container, el } = await createAudio('playlist-loop', tracksMarkup);
		el.previousTrack();
		if(el.trackIndex !== 2){
			cleanup(container);
			return fail('previousTrack on the first track should go to the last with playlist-loop');
		}
		el.nextTrack();
		if(el.trackIndex !== 0){
			cleanup(container);
			return fail('nextTrack on the last track should go to the first with playlist-loop');
		}
		cleanup(container);
		pass('playlist-loop wraps around both ends');
	},

	'should toggle playlist looping': async ({pass, fail}) => {
		const { container, el } = await createAudio('', tracksMarkup);
		el.togglePlaylistLoop();
		await el.updateComplete;
		if(!el.playlistLoop || !el.hasAttribute('playlist-loop')){
			cleanup(container);
			return fail('togglePlaylistLoop should turn looping on and reflect the attribute');
		}
		el.togglePlaylistLoop();
		await el.updateComplete;
		if(el.playlistLoop || el.hasAttribute('playlist-loop')){
			cleanup(container);
			return fail('togglePlaylistLoop should turn looping off again');
		}
		cleanup(container);
		pass('Playlist looping toggles');
	},

	'should keep preset controls when only tracks are slotted': async ({pass, fail}) => {
		const { container, el } = await createAudio('controls="minimal"', tracksMarkup);
		const presetPlay = el.shadowRoot.querySelector('#controls-row kc-media-play-pause');
		if(!presetPlay){
			cleanup(container);
			return fail('A controls preset should still render when only k-audio-track children exist');
		}
		cleanup(container);
		pass('Track children do not replace the preset controls');
	},

	'should shuffle and restore the saved order': async ({pass, fail}) => {
		const { container, el } = await createAudio('', tracksMarkup);
		const before = el.tracks.map(track => track.trackTitle);
		el.toggleShuffle();
		await el.updateComplete;
		if(!el.shuffled || !el.hasAttribute('shuffled')){
			cleanup(container);
			return fail('toggleShuffle should turn shuffle on and reflect the attribute');
		}
		el.toggleShuffle();
		await el.updateComplete;
		const after = el.tracks.map(track => track.trackTitle);
		if(el.shuffled || after.join('|') !== before.join('|')){
			cleanup(container);
			return fail('toggling shuffle off should restore the original order');
		}
		cleanup(container);
		pass('Shuffle toggles on and restores the saved order');
	},

	'should forget the shuffle when a track is moved by hand': async ({pass, fail}) => {
		const { container, el } = await createAudio('', tracksMarkup);
		el.toggleShuffle();
		el.reorderTracks([2, 0, 1]);
		await el.updateComplete;
		if(el.shuffled){
			cleanup(container);
			return fail('reorderTracks should turn shuffle off');
		}
		const manual = el.tracks.map(track => track.trackTitle);
		el.toggleShuffle();
		el.toggleShuffle();
		await el.updateComplete;
		if(el.tracks.map(track => track.trackTitle).join('|') !== manual.join('|')){
			cleanup(container);
			return fail('shuffling after a manual move should restore the order from after the move');
		}
		cleanup(container);
		pass('A manual move clears the saved shuffle order');
	},

	'should keep the current track selected through a reorder': async ({pass, fail}) => {
		const { container, el } = await createAudio('', tracksMarkup);
		el.selectTrack(1);
		el.reorderTracks([2, 1, 0]);
		if(el.trackIndex !== 1 || el.src !== 'b.mp3'){
			cleanup(container);
			return fail('the selected track should stay selected after a reorder');
		}
		cleanup(container);
		pass('Reordering keeps the current track selected');
	},

	'should select a track from its attributes, not from a track element that is not upgraded yet': async ({pass, fail}) => {
		const { container, el } = await createAudio('', tracksMarkup);
		const track = el.tracks[1];
		Object.defineProperty(track, 'src', { value: undefined, configurable: true });
		el.selectTrack(1);
		if(el.src !== 'b.mp3'){
			cleanup(container);
			return fail(`The source should come from the track's src attribute, got "${el.src}"`);
		}
		cleanup(container);
		pass('Track attributes are read directly');
	},

	/*
		Control Presets
	*/
	'should build the playlist preset from its playlist, previous, next, loop and shuffle controls': async ({pass, fail}) => {
		const { container, el } = await createAudio('controls="playlist"', tracksMarkup);
		const missing = ['kc-audio-playlist', 'kc-audio-previous', 'kc-audio-next', 'kc-audio-loop', 'kc-audio-shuffle', 'kc-media-play-pause', 'kc-media-seek']
			.filter(tag => !el.shadowRoot.querySelector(tag));
		cleanup(container);
		if(missing.length) return fail(`The playlist preset is missing ${missing.join(', ')}`);
		pass('The playlist preset has its controls');
	},

	'should keep the play button and the seek bar out of the menu in every preset': async ({pass, fail}) => {
		const problems = [];
		for(const preset of ['minimal', 'normal', 'full', 'playlist']){
			const { container, el } = await createAudio(`controls="${preset}"`, tracksMarkup);
			const play = el.shadowRoot.querySelector('kc-media-play-pause');
			const seek = el.shadowRoot.querySelector('kc-media-seek');
			if(!play?.hasAttribute('no-collapse')) problems.push(`${preset}: play`);
			if(!seek?.hasAttribute('no-collapse')) problems.push(`${preset}: seek`);
			cleanup(container);
		}
		if(problems.length) return fail(`Not kept out of the menu: ${problems.join(', ')}`);
		pass('Play and seek never collapse into the menu');
	},

	'should move previous before next, and skip back before skip forward, into the menu': async ({pass, fail}) => {
		const playlist = await createAudio('controls="playlist"', tracksMarkup);
		const previous = Number(playlist.el.shadowRoot.querySelector('kc-audio-previous')?.getAttribute('priority'));
		const next = Number(playlist.el.shadowRoot.querySelector('kc-audio-next')?.getAttribute('priority'));
		cleanup(playlist.container);
		const full = await createAudio('controls="full"', tracksMarkup);
		const back = Number(full.el.shadowRoot.querySelector('kc-media-skip-back')?.getAttribute('priority'));
		const forward = Number(full.el.shadowRoot.querySelector('kc-media-skip-forward')?.getAttribute('priority'));
		cleanup(full.container);
		if(!(previous < next)) return fail(`Previous (${previous}) should have a lower priority than next (${next})`);
		if(!(back < forward)) return fail(`Skip back (${back}) should have a lower priority than skip forward (${forward})`);
		pass('The buttons collapse in the right order');
	},

	'should put volume after the duration in the playlist preset': async ({pass, fail}) => {
		const { container, el } = await createAudio('controls="playlist"', tracksMarkup);
		const bar = el.shadowRoot.querySelector('k-control-bar');
		const order = [...bar.children].map(child => child.localName);
		const volume = bar.querySelector('kc-media-volume');
		cleanup(container);
		const expected = ['kc-audio-previous', 'kc-media-play-pause', 'kc-audio-next', 'kc-media-time', 'kc-media-seek', 'kc-media-duration', 'kc-media-volume', 'kc-audio-loop', 'kc-audio-shuffle'];
		if(order.join() !== expected.join()) return fail(`Playlist controls were ${order.join(', ')}`);
		if(volume?.getAttribute('slot') !== 'right') return fail('Volume should be in the right-hand group, as in the full preset');
		pass('Volume sits after the duration, before loop and shuffle');
	},

	/*
		Track Metadata
	*/
	'should label a track with its file name when it has no title or tags': async ({pass, fail}) => {
		const { container, el } = await createAudio('controls="playlist"', '<k-audio-track src="no-such-track-file.mp3"></k-audio-track>');
		await wait(100);
		const rows = [...el.shadowRoot.querySelector('kc-audio-playlist').shadowRoot.querySelectorAll('k-sortable-item')]
			.map(row => row.textContent.replace(/\s+/g, ' ').trim());
		cleanup(container);
		if(rows[0] !== 'no-such-track-file.mp3') return fail(`The row should show the file name, got "${rows[0]}"`);
		pass('An untagged track is labelled by its file name');
	},

	'should use a title set on the track over anything read from its file': async ({pass, fail}) => {
		const { container, el } = await createAudio('', '<k-audio-track src="no-such-track-file.mp3" track-title="Set Title" artist="Set Artist"></k-audio-track>');
		const track = el.tracks[0];
		cleanup(container);
		if(track.trackTitle !== 'Set Title' || track.artist !== 'Set Artist') return fail(`Track should keep its own title and artist, got "${track.trackTitle}" / "${track.artist}"`);
		pass('Attributes on the track win');
	},

	/*
		Visualizer Slot
	*/
	'should have a visualizer slot above the toolbar': async ({pass, fail}) => {
		const { container, el } = await createAudio();
		const slot = el.shadowRoot.querySelector('slot[name="visualizer"]');
		const bar = el.shadowRoot.querySelector('#controls-bar');
		const above = !!slot && !!bar && !!(slot.compareDocumentPosition(bar) & Node.DOCUMENT_POSITION_FOLLOWING);
		cleanup(container);
		if(!slot) return fail('There should be a slot named visualizer');
		if(!above) return fail('The visualizer slot should come before the controls bar');
		pass('The visualizer slot sits above the toolbar');
	},

	'should not count a visualizer as slotted content': async ({pass, fail}) => {
		const { container, el } = await createAudio('', '<div slot="visualizer"></div>');
		const onlyVisualizer = el.hasSlottedContent;
		el.appendChild(Object.assign(document.createElement('div'), { slot: 'top' }));
		const withTop = el.hasSlottedContent;
		cleanup(container);
		if(onlyVisualizer) return fail('A visualizer alone should not count as slotted controls');
		if(!withTop) return fail('Anything in another slot should count');
		pass('The visualizer is not slotted content');
	},

	'should hide the empty toolbar when only a visualizer is slotted, and keep a preset': async ({pass, fail}) => {
		const plain = await createAudio('', '<div slot="visualizer"></div>');
		await plain.el.updateComplete;
		const plainBarHidden = plain.el.shadowRoot.querySelector('#controls-bar').hidden;
		cleanup(plain.container);
		const preset = await createAudio('controls="minimal"', '<div slot="visualizer"></div>');
		const presetBarHidden = preset.el.shadowRoot.querySelector('#controls-bar').hidden;
		const presetControls = !!preset.el.shadowRoot.querySelector('kc-media-play-pause');
		cleanup(preset.container);
		if(!plainBarHidden) return fail('A visualizer alone should leave no empty toolbar');
		if(presetBarHidden || !presetControls) return fail('A preset should still draw its controls beside a visualizer');
		pass('The toolbar follows the controls, not the visualizer');
	},

	'should fill the height the player is given with the visualizer': async ({pass, fail}) => {
		const { container, el } = await createAudio('controls="minimal"', '<div slot="visualizer" style="height: 4rem"></div>');
		el.style.display = 'block';
		el.style.height = '400px';
		await wait(100);
		const height = el.querySelector('[slot="visualizer"]').getBoundingClientRect().height;
		cleanup(container);
		if(height < 300) return fail(`The visualizer should grow to fill the player, got ${height}`);
		pass('The visualizer takes the spare height');
	}
};
