import Audio from '../../src/components/Audio.js';
import '../../src/components/controls/AudioTrack.js';

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
	<kc-audio-track src="a.mp3" artist="Artist A" track-title="One"></kc-audio-track>
	<kc-audio-track src="b.mp3" artist="Artist B" track-title="Two"></kc-audio-track>
	<kc-audio-track src="c.mp3" artist="Artist C" track-title="Three"></kc-audio-track>
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
			return fail('A controls preset should still render when only kc-audio-track children exist');
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
	}
};
