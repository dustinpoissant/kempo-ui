import Control from './Control.js';
import { html, css } from '../../lit-all.min.js';

/*
  Utility Functions
*/
const analysers = new WeakMap();

/*
  A media element can only be given a Web Audio source once, and from then on its sound goes through
  the graph. A file from another origin that is not served with CORS makes that source silent, which
  would mute the player, so those are not routed (and there is nothing to analyse). `window.origin`, not
  `location.origin`, because a srcdoc or about:blank frame (the page builder's) has a location origin of "null"
  but inherits its parent's real origin.
*/
const getAnalyser = media => {
  if(analysers.has(media)) return analysers.get(media);
  const src = media.currentSrc || media.src;
  if(!src) return null;
  let analyser = null;
  if(media.crossOrigin !== null || /^(blob|data):/.test(src) || new URL(src, document.baseURI).origin === window.origin){
    try {
      const context = new AudioContext();
      analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;
      context.createMediaElementSource(media).connect(analyser);
      analyser.connect(context.destination);
    } catch(error) {
      analyser = null;
    }
  }
  analysers.set(media, analyser);
  return analyser;
};

/*
  Symbols
*/
const frameId = Symbol();
const activeAnalyser = Symbol();
const frequencyData = Symbol();
const timeData = Symbol();
const resizeObserver = Symbol();

export default class AudioVisualizer extends Control {
  static requires = ['play', 'pause'];

  /*
    Reactive Properties / Attributes
  */
  static properties = {
    type: { type: String, reflect: true },
    bars: { type: Number, reflect: true },
    unavailable: { type: Boolean, reflect: true }
  };

  /*
    Constructor
  */
  constructor() {
    super();
    this[frameId] = 0;
    this[activeAnalyser] = null;
    this[resizeObserver] = new ResizeObserver(() => {
      const canvas = this.canvas;
      canvas.width = Math.round(canvas.clientWidth * devicePixelRatio);
      canvas.height = Math.round(canvas.clientHeight * devicePixelRatio);
      this.draw();
    });
    this.type = 'bars';
    this.bars = 48;
    this.unavailable = false;
  }

  /*
    Lifecycle Callbacks
  */
  connectedCallback() {
    super.connectedCallback();
    /* The canvas outlives a move to another place in the page; only its observer was let go. */
    if(this.hasUpdated) this[resizeObserver].observe(this.canvas);
    this.bindHost();
  }

  disconnectedCallback() {
    const host = this.boundHost;
    host?.removeEventListener('play', this.handlePlay);
    host?.removeEventListener('pause', this.handleStop);
    host?.removeEventListener('ended', this.handleStop);
    cancelAnimationFrame(this[frameId]);
    this[frameId] = 0;
    this[resizeObserver].disconnect();
    super.disconnectedCallback();
  }

  firstUpdated() {
    this[resizeObserver].observe(this.canvas);
    if(this.boundHost && !this.boundHost.paused) this.handlePlay();
  }

  updated(changed) {
    super.updated(changed);
    if((changed.has('type') || changed.has('bars')) && !this[frameId]) this.draw();
  }

  /*
    Protected Members
  */
  get canvas() {
    return this.shadowRoot.querySelector('canvas');
  }

  /*
    Event Handlers
  */
  bindHost = () => {
    if(!this.isConnected) return;
    if(!this.boundHost){
      const host = this.host;
      if(!host){
        /* The player's module can load after this one, then there is no host yet: wait for it to be defined. */
        const pending = this.closest(':not(:defined)');
        if(pending) customElements.whenDefined(pending.localName).then(this.bindHost);
        return;
      }
      this.boundHost = host;
      this.updateHostSupport();
    }
    this.boundHost.addEventListener('play', this.handlePlay);
    this.boundHost.addEventListener('pause', this.handleStop);
    this.boundHost.addEventListener('ended', this.handleStop);
    if(this.hasUpdated && !this.boundHost.paused) this.handlePlay();
  };

  handlePlay = () => {
    cancelAnimationFrame(this[frameId]);
    this[frameId] = 0;
    const media = this.boundHost?.videoEl;
    this[activeAnalyser] = media ? getAnalyser(media) : null;
    this.unavailable = !this[activeAnalyser];
    if(!this[activeAnalyser] || matchMedia('(prefers-reduced-motion: reduce)').matches) return this.draw();
    this[activeAnalyser].context.resume();
    this[frequencyData] = new Uint8Array(this[activeAnalyser].frequencyBinCount);
    this[timeData] = new Uint8Array(this[activeAnalyser].fftSize);
    this[frameId] = requestAnimationFrame(this.tick);
  };

  handleStop = () => {
    cancelAnimationFrame(this[frameId]);
    this[frameId] = 0;
    this.draw();
  };

  tick = () => {
    this.draw();
    this[frameId] = requestAnimationFrame(this.tick);
  };

  /*
    Drawing
  */
  draw() {
    const canvas = this.canvas;
    const context = canvas.getContext('2d');
    const { width, height } = canvas;
    const live = !!this[frameId];
    context.clearRect(0, 0, width, height);
    /* A canvas can't read var() or modern color syntax, so the second color rides on `outline-color`, which the browser resolves to a plain rgb() for us. */
    const colors = getComputedStyle(canvas);
    const gradient = context.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, colors.outlineColor);
    gradient.addColorStop(1 / 3, colors.color);
    gradient.addColorStop(2 / 3, colors.color);
    gradient.addColorStop(1, colors.outlineColor);
    context.fillStyle = context.strokeStyle = gradient;

    if(this.type === 'wave'){
      if(live) this[activeAnalyser].getByteTimeDomainData(this[timeData]);
      const steps = Math.max(1, Math.floor(width / (2 * devicePixelRatio)));
      context.lineWidth = 2 * devicePixelRatio;
      context.lineJoin = 'round';
      context.beginPath();
      for(let i = 0; i <= steps; i++){
        const sample = live ? this[timeData][Math.floor(i / steps * (this[timeData].length - 1))] / 128 - 1 : 0;
        const y = height / 2 + sample * height * 0.45;
        if(i) context.lineTo(i / steps * width, y);
        else context.moveTo(0, y);
      }
      context.stroke();
      return;
    }

    if(live) this[activeAnalyser].getByteFrequencyData(this[frequencyData]);
    const count = Math.max(1, this.bars);
    const gap = 2 * devicePixelRatio;
    const barWidth = (width - gap * (count - 1)) / count;
    const first = 2;
    const last = Math.floor((this[frequencyData]?.length ?? 1024) * 0.75);
    for(let i = 0; i < count; i++){
      let value = 0;
      if(live){
        const from = Math.floor(first * (last / first) ** (i / count));
        const to = Math.max(from + 1, Math.floor(first * (last / first) ** ((i + 1) / count)));
        for(let bin = from; bin < to; bin++) value += this[frequencyData][bin];
        value = Math.min(1, value / (to - from) / 255 * (1 + 0.8 * i / count));
      }
      const barHeight = Math.max(2 * devicePixelRatio, value * height);
      context.fillRect(i * (barWidth + gap), height - barHeight, barWidth, barHeight);
    }
  }

  /*
    Rendering
  */
  render() {
    return html`<canvas part="canvas"></canvas>`;
  }

  static styles = [Control.styles, css`
    :host {
      display: block;
      width: 100%;
      height: var(--visualizer_height, 8rem);
    }
    canvas {
      display: block;
      width: 100%;
      height: 100%;
      color: var(--visualizer_color, var(--c_primary));
      outline: 0 solid var(--visualizer_color_2, var(--c_secondary));
    }
  `];
}

customElements.define('kc-audio-visualizer', AudioVisualizer);
