import { html, css, nothing } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';
import { bound } from '../utils/number.js';
import debounce from '../utils/debounce.js';
import Control from './controls/Control.js';
import './Icon.js';
import './Spinner.js';

const pendingSeek = Symbol();

export default class Audio extends ShadowComponent {
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
    skipDuration: { type: Number, reflect: true, attribute: 'skip-duration' }
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
        ${this.buffering ? html`<div id="buffering"><k-spinner size="lg"></k-spinner></div>` : nothing}
        <div id="controls-bar" ?hidden=${!set.bottom && !this.children.length}>
          <slot>${set.bottom ?? nothing}</slot>
        </div>
      </div>
    `;
  }

  handlePlay = () => {
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
    this.buffering = false;
    this.requestUpdate();
    this.dispatchEvent(new CustomEvent('canplay', { bubbles: true }));
  };

  handleWaiting = () => {
    this.buffering = true;
    this.requestUpdate();
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
      background: transparent;
      border-radius: var(--radius);
      overflow: visible;
    }
    #frame {
      position: relative;
      width: 100%;
      display: flex;
      flex-direction: column;
    }
    audio {
      display: none;
    }
    #controls-bar {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0;
      padding: 0.1rem 0.25rem;
      background: var(--controls-bg, #000);
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
    #controls-bar ::slotted(kc-vid-play-pause),
    #controls-bar ::slotted(kc-vid-skip-back),
    #controls-bar ::slotted(kc-vid-skip-forward),
    #controls-bar ::slotted(kc-vid-loop) {
      min-width: 1.5rem !important;
      min-height: 1.5rem !important;
    }
    #buffering {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      color: #666;
      line-height: normal;
    }
  `;

  static controlSets = {
    '': { bottom: null },
    none: { bottom: null },
    minimal: {
      bottom: html`
        <kc-vid-play-pause></kc-vid-play-pause>
        <kc-vid-time></kc-vid-time>
        <kc-vid-seek></kc-vid-seek>
        <kc-vid-duration></kc-vid-duration>
      `
    },
    normal: {
      bottom: html`
        <kc-vid-play-pause></kc-vid-play-pause>
        <kc-vid-time></kc-vid-time>
        <kc-vid-seek></kc-vid-seek>
        <kc-vid-duration></kc-vid-duration>
        <kc-vid-volume></kc-vid-volume>
        <kc-vid-speed></kc-vid-speed>
        <kc-vid-loop></kc-vid-loop>
      `
    },
    full: {
      bottom: html`
        <kc-vid-skip-back></kc-vid-skip-back>
        <kc-vid-play-pause></kc-vid-play-pause>
        <kc-vid-skip-forward></kc-vid-skip-forward>
        <kc-vid-time></kc-vid-time>
        <kc-vid-seek></kc-vid-seek>
        <kc-vid-duration></kc-vid-duration>
        <kc-vid-volume></kc-vid-volume>
        <kc-vid-speed></kc-vid-speed>
        <kc-vid-loop></kc-vid-loop>
      `
    }
  };
}

customElements.define('k-audio', Audio);
