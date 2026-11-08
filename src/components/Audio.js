import { html, css, nothing } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';
import { bound } from '../utils/number.js';
import debounce from '../utils/debounce.js';
import pauseOthers from '../utils/pauseOthers.js';
import loadFileMetadata from '../utils/loadFileMetadata.js';
import { boolTrueFalse } from '../utils/propConverters.js';
import Control from './controls/Control.js';
import './Icon.js';
import './Spinner.js';

const pendingSeek = Symbol();

export default class Audio extends ShadowComponent {
  #originalTracks = null;

  static properties = {
    src: { type: String, reflect: true },
    preload: { type: String, reflect: true },
    autoplay: { type: Boolean, reflect: true },
    loop: { type: Boolean, reflect: true },
    muted: { type: Boolean, reflect: true },
    crossorigin: { type: String, reflect: true },
    volume: { type: Number },
    playbackRate: { type: Number, attribute: 'playback-rate' },
    controls: { type: String, reflect: true },
    persistentId: { type: String, reflect: true, attribute: 'persistent-id' },
    idleDelayMs: { type: Number, reflect: true, attribute: 'idle-delay-ms' },
    skipDuration: { type: Number, reflect: true, attribute: 'skip-duration' },
    artist: { type: String },
    trackTitle: { type: String, attribute: 'track-title' },
    album: { type: String },
    year: { type: String },
    readMetadata: { type: Boolean, converter: boolTrueFalse, attribute: 'read-metadata' },
    downloadName: { type: String, reflect: true, attribute: 'download-name' },
    playlistLoop: { type: Boolean, reflect: true, attribute: 'playlist-loop' },
    trackIndex: { type: Number, attribute: false },
    shuffled: { type: Boolean, reflect: true },
    exclusive: { type: Boolean, reflect: true }
  };

  static forwardedEvents = [
    'play', 'pause', 'playing', 'ended', 'timeupdate', 'durationchange',
    'volumechange', 'ratechange', 'seeking', 'seeked', 'waiting',
    'progress', 'loadedmetadata', 'canplay', 'error'
  ];

  constructor() {
    super();
    this.src = '';
    this.preload = 'metadata';
    this.autoplay = false;
    this.loop = false;
    this.muted = false;
    this.crossorigin = '';
    this.volume = 1;
    this.playbackRate = 1;
    this.controls = '';
    this.persistentId = null;
    this.idleDelayMs = 2500;
    this.skipDuration = 10;
    this.artist = '';
    this.trackTitle = '';
    this.album = '';
    this.year = '';
    this.readMetadata = true;
    this.defaultSlotted = false;
    this.downloadName = '';
    this.playlistLoop = false;
    this.trackIndex = -1;
    this.shuffled = false;
    this.exclusive = false;
    this[pendingSeek] = null;
    this.buffering = false;
    this.persistTimeDebounced = debounce(() => this.persistTimeNow(), 1000);
  }

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('controlled')) this.setAttribute('controlled', '');
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.clearIdleTimer();
    this.persistTimeNow();
  }

  get audioEl() {
    return this.shadowRoot?.querySelector('#player');
  }

  get videoEl() {
    return this.audioEl;
  }

  get currentTime() {
    return this.audioEl?.currentTime ?? 0;
  }

  set currentTime(time) {
    if(this.audioEl){
      const seeking = this.audioEl.seeking;
      this.audioEl.currentTime = bound(time, 0, this.audioEl.duration || 0);
      if(!seeking) this[pendingSeek] = this.audioEl.currentTime;
    }
  }

  get duration() {
    return this.audioEl?.duration ?? 0;
  }

  get paused() {
    return this.audioEl?.paused ?? true;
  }

  get playing() {
    return this.audioEl && !this.audioEl.paused && !this.audioEl.ended;
  }

  get ended() {
    return this.audioEl?.ended ?? false;
  }

  play() {
    const promise = this.audioEl?.play();
    promise?.catch?.(() => {});
    return this;
  }

  pause() {
    this.audioEl?.pause();
    return this;
  }

  togglePlayPause() {
    if(!this.audioEl) return this;
    if(this.audioEl.paused || this.audioEl.ended) this.play();
    else this.pause();
    return this;
  }

  seek(time) {
    this.currentTime = time;
    return this;
  }

  skip(seconds) {
    this.seek(this.currentTime + seconds);
    return this;
  }

  setVolume(volume) {
    this.volume = bound(volume, 0, 1);
    if(this.volume > 0 && this.muted) this.muted = false;
    return this;
  }

  mute() {
    this.muted = true;
    return this;
  }

  unmute() {
    this.muted = false;
    return this;
  }

  toggleMute() {
    this.muted = !this.muted;
    return this;
  }

  setPlaybackRate(rate) {
    this.playbackRate = bound(rate, 0.25, 4);
    return this;
  }

  toggleLoop() {
    this.loop = !this.loop;
    return this;
  }

  download() {
    if(!this.src) return this;
    const a = document.createElement('a');
    a.href = this.src;
    a.download = this.downloadName || '';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    return this;
  }

  get tracks() {
    return [...this.children].filter(child => child.localName === 'k-audio-track');
  }

  get hasSlottedContent() {
    return [...this.children].some(child => child.localName !== 'k-audio-track' && child.slot !== 'visualizer');
  }

  selectTrack(index) {
    const track = this.tracks[index];
    if(!track) return this;
    this.trackIndex = index;
    this.src = track.getAttribute('src') ?? '';
    this.artist = track.getAttribute('artist') ?? '';
    this.trackTitle = track.getAttribute('track-title') ?? '';
    this.album = track.getAttribute('album') ?? '';
    this.year = track.getAttribute('year') ?? '';
    this.downloadName = track.getAttribute('download-name') ?? '';
    this.dispatchEvent(new CustomEvent('track-changed', { detail: { index }, bubbles: true }));
    return this;
  }

  playTrack(index) {
    this.selectTrack(index);
    this.updateComplete.then(() => this.play());
    return this;
  }

  previousTrack() {
    const count = this.tracks.length;
    if(!count) return this;
    if(this.trackIndex > 0) return this.playTrack(this.trackIndex - 1);
    if(this.playlistLoop) return this.playTrack(count - 1);
    return this;
  }

  nextTrack() {
    const count = this.tracks.length;
    if(!count) return this;
    if(this.trackIndex < count - 1) return this.playTrack(this.trackIndex + 1);
    if(this.playlistLoop) return this.playTrack(0);
    return this;
  }

  togglePlaylistLoop() {
    this.playlistLoop = !this.playlistLoop;
    return this;
  }

  reorderTracks(order) {
    this.applyOrder(order);
    this.#originalTracks = null;
    this.shuffled = false;
    return this;
  }

  applyOrder(order) {
    const tracks = this.tracks;
    const current = tracks[this.trackIndex];
    order.forEach(index => this.appendChild(tracks[index]));
    this.trackIndex = this.tracks.indexOf(current);
    this.dispatchEvent(new CustomEvent('playlist-changed', { bubbles: true }));
    return this;
  }

  toggleShuffle() {
    return this.shuffled ? this.restoreOrder() : this.randomizeOrder();
  }

  randomizeOrder() {
    const tracks = this.tracks;
    const order = tracks.map((track, index) => index);
    for(let i = order.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    this.#originalTracks = [...tracks];
    this.dispatchEvent(new CustomEvent('playlist-shuffling', { bubbles: true }));
    this.applyOrder(order);
    this.shuffled = true;
    return this;
  }

  restoreOrder() {
    const tracks = this.tracks;
    const original = this.#originalTracks ?? tracks;
    const order = original.map(track => tracks.indexOf(track)).filter(index => index !== -1);
    tracks.forEach((track, index) => {
      if(!order.includes(index)) order.push(index);
    });
    this.dispatchEvent(new CustomEvent('playlist-shuffling', { bubbles: true }));
    this.applyOrder(order);
    this.#originalTracks = null;
    this.shuffled = false;
    return this;
  }

  wakeControls() {
    this.removeAttribute('idle');
    clearTimeout(this.idleTimer);
    if(this.idleDelayMs && this.idleDelayMs > 0){
      this.idleTimer = setTimeout(() => this.setAttribute('idle', ''), this.idleDelayMs);
    }
  }

  clearIdleTimer() {
    clearTimeout(this.idleTimer);
  }

  persistTimeNow() {
    const key = this.persistentId;
    if(!key || !this.audioEl) return;
    if(this.audioEl.currentTime > 0) sessionStorage.setItem(`audio-time:${key}`, this.audioEl.currentTime);
  }

  clearPersistedTime() {
    if(this.persistentId) sessionStorage.removeItem(`audio-time:${this.persistentId}`);
  }

  updated(changed) {
    super.updated(changed);
    if(['artist', 'trackTitle', 'album', 'year'].some(key => changed.has(key))) this.dispatchEvent(new CustomEvent('metadata-changed', { bubbles: true }));
    if(changed.has('src')) this.dispatchEvent(new CustomEvent('src-changed', { bubbles: true }));
    if(changed.has('src') || changed.has('readMetadata')) loadFileMetadata(this);
    if(changed.has('playlistLoop')) this.dispatchEvent(new CustomEvent('playlist-loop-changed', { bubbles: true }));
    if(changed.has('shuffled')) this.dispatchEvent(new CustomEvent('shuffle-changed', { bubbles: true }));
    if(changed.has('controls') && this.controls && this.controls !== 'none') this.loadControls();
    const audio = this.audioEl;
    if(!audio) return;
    if(changed.has('src')){
      audio.src = this.src || '';
      if(this.persistentId) audio.currentTime = parseFloat(sessionStorage.getItem(`audio-time:${this.persistentId}`)) || 0;
    }
    if(changed.has('volume')) audio.volume = this.volume;
    if(changed.has('playbackRate')) audio.playbackRate = this.playbackRate;
    if(changed.has('muted')) audio.muted = this.muted;
    if(changed.has('loop')){
      audio.loop = this.loop;
      this.dispatchEvent(new CustomEvent('loop-changed', { detail: { loop: this.loop }, bubbles: true }));
    }
    if(changed.has('preload')) audio.preload = this.preload || 'metadata';
    if(changed.has('idleDelayMs') && this.playing) this.wakeControls();
  }

  loadControls() {
    const set = this.constructor.controlSets[this.controls];
    if(set) Control.load(Object.values(set));
  }

  render() {
    const set = this.constructor.controlSets[this.controls] ?? this.constructor.controlSets[''];
    return html`
      <div id="frame">
        <audio
          id="player"
          .muted=${this.muted}
          .volume=${this.volume}
          .playbackRate=${this.playbackRate}
          .defaultPlaybackRate=${this.playbackRate}
          ?autoplay=${this.autoplay}
          ?loop=${this.loop}
          preload=${this.preload || 'metadata'}
          crossorigin=${this.crossorigin || nothing}
          @play=${this.handlePlay}
          @pause=${this.handlePause}
          @timeupdate=${this.handleTimeUpdate}
          @loadedmetadata=${this.handleLoadedMetadata}
          @canplay=${this.handleCanPlay}
          @waiting=${this.handleWaiting}
          @seeking=${this.handleSeeking}
          @seeked=${this.handleSeeked}
          @ended=${this.handleEnded}
          @durationchange=${this.handleDurationChange}
          @volumechange=${this.handleVolumeChange}
          @ratechange=${this.handleRateChange}
          @error=${this.handleError}
          @pointermove=${this.handlePointerMove}
        ></audio>
        <slot name="visualizer"></slot>
        ${this.buffering ? html`<div id="buffering"><k-spinner size="lg"></k-spinner></div>` : nothing}
        <div id="controls-bar" ?hidden=${!set.bottom && !this.hasSlottedContent}>
          <slot name="top">${set.top ?? nothing}</slot>
          <div id="controls-row">
            <slot @slotchange=${this.handleSlotChange}></slot>
            ${this.defaultSlotted ? nothing : set.bottom ?? nothing}
          </div>
          <slot name="bottom"></slot>
        </div>
      </div>
    `;
  }

  handleSlotChange = (event) => {
    this.defaultSlotted = event.target.assignedElements().some(el => el.localName !== 'k-audio-track');
    if(this.trackIndex < 0 && this.tracks.length) this.selectTrack(0);
    this.dispatchEvent(new CustomEvent('playlist-changed', { bubbles: true }));
    this.requestUpdate();
  };

  handlePlay = () => {
    if(this.exclusive) pauseOthers(this);
    this.removeAttribute('ended');
    this.wakeControls();
    this.dispatchEvent(new CustomEvent('play', { bubbles: true }));
  };

  handlePause = () => {
    clearTimeout(this.idleTimer);
    this.persistTimeNow();
    this.toggleAttribute('paused', true);
    this.dispatchEvent(new CustomEvent('pause', { bubbles: true }));
  };

  handleTimeUpdate = () => {
    this.persistTimeDebounced();
    this.dispatchEvent(new CustomEvent('timeupdate', { bubbles: true }));
  };

  handleLoadedMetadata = () => {
    this.dispatchEvent(new CustomEvent('loadedmetadata', { bubbles: true }));
  };

  handleCanPlay = () => {
    clearTimeout(this.bufferingTimer);
    this.buffering = false;
    this.requestUpdate();
    this.dispatchEvent(new CustomEvent('canplay', { bubbles: true }));
  };

  handleWaiting = () => {
    clearTimeout(this.bufferingTimer);
    this.bufferingTimer = setTimeout(() => {
      this.buffering = true;
      this.requestUpdate();
    }, 300);
    this.dispatchEvent(new CustomEvent('waiting', { bubbles: true }));
  };

  handleSeeking = () => {
    this.dispatchEvent(new CustomEvent('seeking', { bubbles: true }));
  };

  handleSeeked = () => {
    this.dispatchEvent(new CustomEvent('seeked', { bubbles: true }));
  };

  handleEnded = () => {
    this.clearPersistedTime();
    this.toggleAttribute('ended', true);
    this.dispatchEvent(new CustomEvent('ended', { bubbles: true }));
    this.nextTrack();
  };

  handleDurationChange = () => {
    this.dispatchEvent(new CustomEvent('durationchange', { bubbles: true }));
  };

  handleVolumeChange = () => {
    this.volume = this.audioEl?.volume ?? 1;
    this.muted = this.audioEl?.muted ?? false;
    this.dispatchEvent(new CustomEvent('volumechange', { bubbles: true }));
  };

  handleRateChange = () => {
    this.playbackRate = this.audioEl?.playbackRate ?? 1;
    this.dispatchEvent(new CustomEvent('ratechange', { bubbles: true }));
  };

  handleError = () => {
    this.dispatchEvent(new CustomEvent('error', { bubbles: true }));
  };

  handlePointerMove = () => {
    this.wakeControls();
  };

  static styles = css`
    :host {
      display: block;
      width: 100%;
      background: var(--controls-bg, #000);
      border-radius: var(--radius);
      overflow: visible;
    }
    #frame {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    ::slotted([slot="visualizer"]) {
      flex: 1 1 auto;
      min-height: 0;
    }
    audio {
      display: none;
    }
    #controls-bar {
      display: flex;
      flex-direction: column;
      gap: 0;
      padding: 0.1rem 0.25rem;
      background: transparent;
      border-radius: var(--radius, 0.25rem);
      color: #fff;
      line-height: normal;
      font-size: 0.8rem;
      --c_border: transparent;
      --spacer: 0.5rem;
      min-height: 2.75rem;
      box-sizing: border-box;
      width: 100%;
    }
    #controls-bar[hidden] {
      display: none;
    }
    #controls-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      width: 100%;
    }
    #controls-row ::slotted(kc-media-play-pause),
    #controls-row ::slotted(kc-media-skip-back),
    #controls-row ::slotted(kc-media-skip-forward),
    #controls-row ::slotted(kc-media-repeat) {
      min-width: 1.5rem !important;
      min-height: 1.5rem !important;
    }
    #buffering {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      color: #fff;
      line-height: normal;
    }
  `;

  static controlSets = {
    '': { bottom: null },
    none: { bottom: null },
    minimal: {
      bottom: html`
        <k-control-bar>
          <kc-media-play-pause priority="10" no-collapse></kc-media-play-pause>
          <kc-media-time slot="center" priority="1"></kc-media-time>
          <kc-media-seek slot="center" no-collapse soft-min-width="8rem"></kc-media-seek>
          <kc-media-duration slot="center" priority="1"></kc-media-duration>
        </k-control-bar>
      `
    },
    normal: {
      bottom: html`
        <k-control-bar>
          <kc-media-play-pause priority="10" no-collapse></kc-media-play-pause>
          <kc-media-time slot="center" priority="1"></kc-media-time>
          <kc-media-seek slot="center" no-collapse soft-min-width="8rem"></kc-media-seek>
          <kc-media-duration slot="center" priority="1"></kc-media-duration>
          <kc-media-volume slot="right"></kc-media-volume>
          <kc-media-repeat slot="right"></kc-media-repeat>
        </k-control-bar>
      `
    },
    full: {
      bottom: html`
        <k-control-bar>
          <kc-media-skip-back priority="4"></kc-media-skip-back>
          <kc-media-play-pause priority="10" no-collapse></kc-media-play-pause>
          <kc-media-skip-forward priority="5"></kc-media-skip-forward>
          <kc-media-time slot="center" priority="1"></kc-media-time>
          <kc-media-seek slot="center" no-collapse soft-min-width="8rem"></kc-media-seek>
          <kc-media-duration slot="center" priority="1"></kc-media-duration>
          <kc-media-volume slot="right"></kc-media-volume>
          <kc-media-speed slot="right"></kc-media-speed>
          <kc-media-repeat slot="right"></kc-media-repeat>
          <kc-media-download slot="right"></kc-media-download>
        </k-control-bar>
      `
    },
    playlist: {
      top: html`<kc-audio-playlist></kc-audio-playlist>`,
      bottom: html`
        <k-control-bar>
          <kc-audio-previous priority="4"></kc-audio-previous>
          <kc-media-play-pause priority="10" no-collapse></kc-media-play-pause>
          <kc-audio-next priority="5"></kc-audio-next>
          <kc-media-time slot="center" priority="1"></kc-media-time>
          <kc-media-seek slot="center" no-collapse soft-min-width="8rem"></kc-media-seek>
          <kc-media-duration slot="center" priority="1"></kc-media-duration>
          <kc-media-volume slot="right"></kc-media-volume>
          <kc-audio-loop slot="right"></kc-audio-loop>
          <kc-audio-shuffle slot="right"></kc-audio-shuffle>
        </k-control-bar>
      `
    }
  };
}

customElements.define('k-audio', Audio);
