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
const forwardedHandlers = Symbol();

/*
  document.fullscreenElement only ever reports the OUTERMOST participating shadow host when the
  actual fullscreen element sits inside nested shadow trees — e.g. a k-video slotted deep inside
  a consumer's own shadow-DOM component hierarchy (it-viewer inside it-app, say). Per the
  Fullscreen API spec, each shadow-including ancestor root along the way gets its own
  fullscreenElement set, and document.fullscreenElement resolves to the one closest to the
  document; the actual element k-video called requestFullscreen() on is further down, reachable
  only by walking shadowRoot.fullscreenElement one boundary at a time. Comparing
  document.fullscreenElement directly against `this` (as exitFullscreen/handleFullscreenChange
  used to) never matches once k-video is nested two or more shadow roots deep, which left
  `fullscreen` stuck false — breaking both the exit-fullscreen control (toggleFullscreen kept
  re-entering instead) and the kc-fullscreen icon/active state.
*/
const deepestFullscreenElement = () => {
  let el = document.fullscreenElement;
  while(el?.shadowRoot?.fullscreenElement) el = el.shadowRoot.fullscreenElement;
  return el;
};

export default class Video extends ShadowComponent {
  static properties = {
    src: { type: String, reflect: true },
    poster: { type: String, reflect: true },
    preload: { type: String, reflect: true },
    autoplay: { type: Boolean, reflect: true },
    loop: { type: Boolean, reflect: true },
    muted: { type: Boolean, reflect: true },
    playsinline: { type: Boolean, reflect: true },
    crossorigin: { type: String, reflect: true },
    downloadName: { type: String, reflect: true, attribute: 'download-name' },
    exclusive: { type: Boolean, reflect: true },
    volume: { type: Number },
    playbackRate: { type: Number, attribute: 'playback-rate' },
    fullscreen: { type: Boolean, reflect: true },
    pictureInPicture: { type: Boolean, reflect: true, attribute: 'picture-in-picture' },
    controls: { type: String, reflect: true },
    persistentId: { type: String, reflect: true, attribute: 'persistent-id' },
    idleDelayMs: { type: Number, reflect: true, attribute: 'idle-delay-ms' },
    skipFlashMs: { type: Number, reflect: true, attribute: 'skip-flash-ms' },
    skipDuration: { type: Number, reflect: true, attribute: 'skip-duration' },
    artist: { type: String },
    trackTitle: { type: String, attribute: 'track-title' },
    album: { type: String },
    year: { type: String },
    readMetadata: { type: Boolean, converter: boolTrueFalse, attribute: 'read-metadata' }
  };

  static forwardedEvents = [
    'play', 'pause', 'playing', 'ended', 'timeupdate', 'durationchange',
    'volumechange', 'ratechange', 'seeking', 'seeked', 'waiting',
    'progress', 'loadedmetadata', 'canplay', 'error',
    'enterpictureinpicture', 'leavepictureinpicture'
  ];

  /*
    Constructor
  */
  constructor() {
    super();
    this.src = '';
    this.poster = '';
    this.preload = 'metadata';
    this.autoplay = false;
    this.loop = false;
    this.muted = false;
    this.playsinline = true;
    this.crossorigin = '';
    this.downloadName = '';
    this.exclusive = false;
    this.volume = 1;
    this.playbackRate = 1;
    this.fullscreen = false;
    this.pictureInPicture = false;
    this.controls = '';
    this.persistentId = null;
    this.idleDelayMs = 2500;
    this.skipFlashMs = 600;
    this.skipDuration = 10;
    this.artist = '';
    this.trackTitle = '';
    this.album = '';
    this.year = '';
    this.readMetadata = true;
    this[pendingSeek] = null;
    this.buffering = false;
    this.skipFlash = null;
    this.persistTimeDebounced = debounce(() => this.persistTimeNow(), 1000);
  }

  /*
    Lifecycle
  */
  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('controlled')) this.setAttribute('controlled', '');
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
    this.addEventListener('pointermove', this.handlePointerMove);
    this.addEventListener('pointerleave', this.handlePointerLeave);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    this.removeEventListener('pointermove', this.handlePointerMove);
    this.removeEventListener('pointerleave', this.handlePointerLeave);
    clearTimeout(this.idleTimer);
    clearTimeout(this.skipFlashTimer);
    clearTimeout(this.clickTimer);
    const handlers = this[forwardedHandlers];
    if(handlers && this.videoEl){
      for(const type of Object.keys(handlers)) this.videoEl.removeEventListener(type, handlers[type]);
    }
    this[forwardedHandlers] = null;
  }

  firstUpdated(changedProperties) {
    super.firstUpdated?.(changedProperties);
    const video = this.videoEl;
    if(!video) return;
    if(this[pendingSeek] !== null){
      video.currentTime = this[pendingSeek];
      this[pendingSeek] = null;
    }
    const handlers = {};
    for(const type of this.constructor.forwardedEvents){
      const handler = this.makeForwardHandler(type);
      handlers[type] = handler;
      video.addEventListener(type, handler);
    }
    this[forwardedHandlers] = handlers;
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if(['artist', 'trackTitle', 'album', 'year'].some(key => changedProperties.has(key))) this.dispatchEvent(new CustomEvent('metadata-changed', { bubbles: true }));
    if(changedProperties.has('src')) this.dispatchEvent(new CustomEvent('src-changed', { bubbles: true }));
    if(changedProperties.has('src') || changedProperties.has('readMetadata')) loadFileMetadata(this);
    if(changedProperties.has('fullscreen')){
      this.dispatchEvent(new CustomEvent('fullscreen-changed', {
        detail: { fullscreen: this.fullscreen },
        bubbles: true
      }));
    }
    if(changedProperties.has('pictureInPicture')){
      this.dispatchEvent(new CustomEvent('picture-in-picture-changed', {
        detail: { pictureInPicture: this.pictureInPicture },
        bubbles: true
      }));
    }
    if(changedProperties.has('loop')){
      this.dispatchEvent(new CustomEvent('loop-changed', {
        detail: { loop: this.loop },
        bubbles: true
      }));
    }
    if(changedProperties.has('controls') && this.controls && this.controls !== 'none'){
      this.loadControls();
    }
    if(changedProperties.has('persistentId') && this.persistentId && window?.localStorage){
      const key = `video-persistent-id-${this.persistentId}`;
      const value = window.localStorage.getItem(key);
      if(value !== null){
        const time = Number(value);
        if(!isNaN(time)){
          this.currentTime = time;
          this.dispatchEvent(new CustomEvent('restored', {
            detail: { time },
            bubbles: true
          }));
        }
      }
    }
  }

  loadControls() {
    const set = this.constructor.controlSets[this.controls];
    if(!set) return;
    Control.load(Object.values(set));
  }

  /*
    Protected Members
  */
  get videoEl() {
    return this.shadowRoot?.querySelector('#player') || null;
  }

  get currentTime() {
    return this.videoEl ? this.videoEl.currentTime : (this[pendingSeek] ?? 0);
  }

  set currentTime(time) {
    const video = this.videoEl;
    if(video) video.currentTime = bound(time, 0, video.duration || time);
    else this[pendingSeek] = time;
  }

  get duration() {
    return this.videoEl?.duration || 0;
  }

  get paused() {
    return this.videoEl ? this.videoEl.paused : true;
  }

  get ended() {
    return this.videoEl?.ended ?? false;
  }

  /*
    Public Methods - Playback
  */
  play() {
    const promise = this.videoEl?.play();
    promise?.catch?.(() => {});
    return this;
  }

  pause() {
    this.videoEl?.pause();
    return this;
  }

  togglePlayPause() {
    if(!this.videoEl) return this;
    if(this.videoEl.paused || this.videoEl.ended) this.play();
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

  /*
    Public Methods - Volume
  */
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

  /*
    Public Methods - Playback Rate / Loop
  */
  setPlaybackRate(rate) {
    this.playbackRate = bound(rate, 0.25, 4);
    return this;
  }

  toggleLoop() {
    this.loop = !this.loop;
    return this;
  }

  /*
    Public Methods - Fullscreen
  */
  enterFullscreen() {
    const promise = this.requestFullscreen?.();
    promise?.catch?.(() => {});
    return this;
  }

  exitFullscreen() {
    if(deepestFullscreenElement() === this){
      const promise = document.exitFullscreen?.();
      promise?.catch?.(() => {});
    }
    return this;
  }

  toggleFullscreen() {
    return this.fullscreen ? this.exitFullscreen() : this.enterFullscreen();
  }

  /*
    Public Methods - Picture in Picture
  */
  enterPictureInPicture() {
    const promise = this.videoEl?.requestPictureInPicture?.();
    promise?.catch?.(() => {});
    return this;
  }

  exitPictureInPicture() {
    if(document.pictureInPictureElement === this){
      const promise = document.exitPictureInPicture?.();
      promise?.catch?.(() => {});
    }
    return this;
  }

  togglePictureInPicture() {
    return this.pictureInPicture ? this.exitPictureInPicture() : this.enterPictureInPicture();
  }

  /*
    Public Methods - Download
  */
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

  /*
    Private Members - Persistence
  */
  persistTimeNow() {
    if(!this.persistentId || !window?.localStorage) return;
    window.localStorage.setItem(`video-persistent-id-${this.persistentId}`, String(this.currentTime));
  }

  clearPersistedTime() {
    if(!this.persistentId || !window?.localStorage) return;
    window.localStorage.removeItem(`video-persistent-id-${this.persistentId}`);
  }

  /*
    Private Members - Idle / Controls Visibility
  */
  wakeControls() {
    this.removeAttribute('idle');
    clearTimeout(this.idleTimer);
    if(!this.paused){
      this.idleTimer = setTimeout(() => this.setAttribute('idle', ''), this.idleDelayMs);
    }
  }

  /*
    Event Handlers
  */
  handleFullscreenChange = () => {
    const isFullscreen = deepestFullscreenElement() === this;
    if(this.fullscreen !== isFullscreen) this.fullscreen = isFullscreen;
  };

  handlePointerMove = () => {
    this.wakeControls();
  };

  handlePointerLeave = () => {
    // Don't immediately hide controls when pointer leaves.
    // The idle timeout continues counting and will hide them
    // after the full idle delay if there's no activity.
  };

  handleVideoClick = (e) => {
    clearTimeout(this.clickTimer);
    if(e.detail >= 2){
      const rect = this.videoEl.getBoundingClientRect();
      const isRight = (e.clientX - rect.left) > rect.width / 2;
      this.skip(isRight ? this.skipDuration : -this.skipDuration);
      this.flashSkip(isRight ? 'forward' : 'backward');
    } else {
      this.clickTimer = setTimeout(() => this.togglePlayPause(), 220);
    }
  };

  flashSkip(direction) {
    clearTimeout(this.skipFlashTimer);
    this.skipFlash = direction;
    this.requestUpdate();
    this.skipFlashTimer = setTimeout(() => {
      this.skipFlash = null;
      this.requestUpdate();
    }, this.skipFlashMs);
  }

  makeForwardHandler(type) {
    return () => {
      const video = this.videoEl;
      if(!video) return;
      if(type === 'volumechange' && this.muted !== video.muted) this.muted = video.muted;
      if(type === 'ratechange' && this.playbackRate !== video.playbackRate) this.playbackRate = video.playbackRate;
      if(type === 'play' || type === 'pause' || type === 'playing' || type === 'ended'){
        this.toggleAttribute('paused', video.paused);
        this.toggleAttribute('ended', video.ended);
      }
      if(type === 'play' && this.exclusive) pauseOthers(this);
      if(type === 'play' || type === 'playing') this.wakeControls();
      if(type === 'pause'){
        clearTimeout(this.idleTimer);
        this.removeAttribute('idle');
        this.persistTimeNow();
      }
      if(type === 'timeupdate') this.persistTimeDebounced();
      if(type === 'ended') this.clearPersistedTime();
      if(type === 'waiting'){
        this.buffering = true;
        this.requestUpdate();
      }
      if(type === 'playing' || type === 'canplay'){
        this.buffering = false;
        this.requestUpdate();
      }
      if(type === 'enterpictureinpicture' || type === 'leavepictureinpicture'){
        this.pictureInPicture = document.pictureInPictureElement === this;
      }
      this.dispatchEvent(new CustomEvent(type, { bubbles: true }));
    };
  }

  /*
    Rendering
  */
  render() {
    const set = this.constructor.controlSets[this.controls] ?? this.constructor.controlSets[''];
    return html`
      <div id="frame">
        <div id="top-bar">
          <slot name="top"></slot>
        </div>
        <div
          id="video-wrapper"
          @click=${this.handleVideoClick}
        >
          <video
            id="player"
            part="video"
            .src=${this.src || ''}
            .poster=${this.poster || ''}
            .muted=${this.muted}
            .volume=${this.volume}
            .playbackRate=${this.playbackRate}
            .defaultPlaybackRate=${this.playbackRate}
            ?autoplay=${this.autoplay}
            ?loop=${this.loop}
            ?playsinline=${this.playsinline}
            preload=${this.preload || 'metadata'}
            crossorigin=${this.crossorigin || nothing}
          ></video>
        </div>
        ${this.buffering ? html`
          <div id="buffering"><k-spinner size="lg"></k-spinner></div>
        ` : nothing}
        ${this.skipFlash ? html`
          <div class="skip-flash ${this.skipFlash}">
            <k-icon name="${this.skipFlash === 'forward' ? 'fast_forward' : 'fast_rewind'}"></k-icon>
            <span>${this.skipDuration}s</span>
          </div>
        ` : nothing}
        <slot name="center">${set.center ?? nothing}</slot>
        <div id="controls-bar">
          <slot>${set.bottom ?? nothing}</slot>
        </div>
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
      position: relative;
      background: #000;
      border-radius: var(--radius);
      overflow: hidden;
      line-height: 0;
    }
    #frame {
      position: relative;
      width: 100%;
      height: 100%;
    }
    /* #video-wrapper has no forced size of its own, so it passes #frame's
       height through unchanged. If :host has no explicit height either,
       percentage heights bottom out as "auto" down this whole chain and
       <video> falls back to its intrinsic aspect ratio — same natural
       sizing as before. If the consumer DOES force :host to a size, that
       height is now definite and propagates all the way down to <video>,
       which is what makes object-fit: contain below able to letterbox it
       instead of just overflowing/getting clipped by :host's own
       overflow: hidden. */
    #video-wrapper {
      width: 100%;
      height: 100%;
    }
    video {
      display: block;
      width: 100%;
      height: var(--height, 100%);
      max-height: var(--max-height);
      background: #000;
      cursor: pointer;
      pointer-events: none;
      /* When the consumer forces k-video into a size/aspect-ratio that
         doesn't match the actual video, fit it within that box instead
         of stretching — letterboxed/pillarboxed with the video's own
         black background, rather than distorted to fill:fill it. */
      object-fit: contain;
      object-position: center center;
    }
    :host(:fullscreen),
    :host([fullscreen]) {
      width: 100%;
      height: 100%;
    }
    :host(:fullscreen) video,
    :host([fullscreen]) video {
      height: 100%;
    }
    :host([idle]) {
      cursor: none;
    }
    :host([idle]) #controls-bar,
    :host([idle]) #top-bar {
      opacity: 0;
      pointer-events: none;
    }
    #top-bar {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      z-index: 1;
      display: flex;
      align-items: center;
      padding: 0.1rem 0.25rem;
      background: var(--top-bg, linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0)));
      color: #fff;
      line-height: normal;
      font-size: 0.8rem;
      transition: opacity 0.25s;
      --c_border: transparent;
      --spacer: 0.5rem;
    }
    #top-bar:not(:has(::slotted(*))) {
      display: none;
    }
    #controls-bar {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0;
      padding: 0.1rem 0.25rem;
      /* --controls-bg lets a consumer swap the default gradient (which reads poorly against
         content that's already dark near the bottom edge) for a flat, solid overlay instead. */
      background: var(--controls-bg, linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0)));
      color: #fff;
      line-height: normal;
      font-size: 0.8rem;
      transition: opacity 0.25s;
      --c_border: transparent;
      --spacer: 0.5rem;
    }
    #controls-bar:not(:has(::slotted(*))) {
      display: none;
    }
    #controls-bar ::slotted(kc-media-play-pause),
    #controls-bar ::slotted(kc-media-skip-back),
    #controls-bar ::slotted(kc-media-skip-forward),
    #controls-bar ::slotted(kc-media-repeat),
    #controls-bar ::slotted(kc-media-download),
    #controls-bar ::slotted(kc-vid-pip),
    #controls-bar ::slotted(kc-fullscreen) {
      min-width: 1.5rem !important;
      min-height: 1.5rem !important;
    }
    #buffering {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      color: #fff;
      line-height: normal;
    }
    .skip-flash {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      width: 30%;
      color: #fff;
      font-size: 1.1rem;
      pointer-events: none;
      opacity: 0.9;
      line-height: normal;
    }
    .skip-flash.backward {
      left: 0;
    }
    .skip-flash.forward {
      right: 0;
    }
  `;

  /*
    Pre-built control sets used as slot fallback content when `controls`
    is set. Modules are loaded lazily by `loadControls()`.
  */
  static controlSets = {
    '': { bottom: null },
    none: { bottom: null },
    minimal: {
      center: html`<kc-vid-play-big></kc-vid-play-big>`,
      bottom: html`
        <k-control-bar>
          <kc-media-play-pause priority="10"></kc-media-play-pause>
          <kc-media-time slot="center" priority="1"></kc-media-time>
          <kc-media-seek slot="center" no-collapse soft-min-width="8rem"></kc-media-seek>
          <kc-media-duration slot="center" priority="1"></kc-media-duration>
          <kc-fullscreen slot="right"></kc-fullscreen>
        </k-control-bar>
      `
    },
    normal: {
      center: html`<kc-vid-play-big></kc-vid-play-big>`,
      bottom: html`
        <k-control-bar>
          <kc-media-play-pause priority="10"></kc-media-play-pause>
          <kc-media-time slot="center" priority="1"></kc-media-time>
          <kc-media-seek slot="center" no-collapse soft-min-width="8rem"></kc-media-seek>
          <kc-media-duration slot="center" priority="1"></kc-media-duration>
          <kc-media-volume slot="right"></kc-media-volume>
          <kc-media-speed slot="right"></kc-media-speed>
          <kc-media-repeat slot="right"></kc-media-repeat>
          <kc-fullscreen slot="right"></kc-fullscreen>
        </k-control-bar>
      `
    },
    full: {
      center: html`<kc-vid-play-big></kc-vid-play-big>`,
      bottom: html`
        <k-control-bar>
          <kc-media-skip-back></kc-media-skip-back>
          <kc-media-play-pause priority="10"></kc-media-play-pause>
          <kc-media-skip-forward></kc-media-skip-forward>
          <kc-media-time slot="center" priority="1"></kc-media-time>
          <kc-media-seek slot="center" no-collapse soft-min-width="8rem"></kc-media-seek>
          <kc-media-duration slot="center" priority="1"></kc-media-duration>
          <kc-media-volume slot="right"></kc-media-volume>
          <kc-media-speed slot="right"></kc-media-speed>
          <kc-media-repeat slot="right"></kc-media-repeat>
          <kc-vid-pip slot="right"></kc-vid-pip>
          <kc-media-download slot="right"></kc-media-download>
          <kc-fullscreen slot="right"></kc-fullscreen>
        </k-control-bar>
      `
    }
  };
}

customElements.define('k-video', Video);
