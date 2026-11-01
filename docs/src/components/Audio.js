import{html as e,css as t,nothing as i}from"../lit-all.min.js";import s from"./ShadowComponent.js";import{bound as a}from"../utils/number.js";import o from"../utils/debounce.js";import r from"./controls/Control.js";import"./Icon.js";import"./Spinner.js";const d=Symbol();export default class l extends s{static properties={src:{type:String,reflect:!0},preload:{type:String,reflect:!0},autoplay:{type:Boolean,reflect:!0},loop:{type:Boolean,reflect:!0},muted:{type:Boolean,reflect:!0},crossorigin:{type:String,reflect:!0},volume:{type:Number},playbackRate:{type:Number,attribute:"playback-rate"},controls:{type:String,reflect:!0},persistentId:{type:String,reflect:!0,attribute:"persistent-id"},idleDelayMs:{type:Number,reflect:!0,attribute:"idle-delay-ms"},skipDuration:{type:Number,reflect:!0,attribute:"skip-duration"}};static forwardedEvents=["play","pause","playing","ended","timeupdate","durationchange","volumechange","ratechange","seeking","seeked","waiting","progress","loadedmetadata","canplay","error"];constructor(){super(),this.src="",this.preload="metadata",this.autoplay=!1,this.loop=!1,this.muted=!1,this.crossorigin="",this.volume=1,this.playbackRate=1,this.controls="",this.persistentId=null,this.idleDelayMs=2500,this.skipDuration=10,this[d]=null,this.buffering=!1,this.persistTimeDebounced=o(()=>this.persistTimeNow(),1e3)}connectedCallback(){super.connectedCallback(),this.hasAttribute("controlled")||this.setAttribute("controlled","")}disconnectedCallback(){super.disconnectedCallback(),this.clearIdleTimer(),this.persistTimeNow()}get audioEl(){return this.shadowRoot?.querySelector("#player")}get videoEl(){return this.audioEl}get currentTime(){return this.audioEl?.currentTime??0}set currentTime(e){if(this.audioEl){const t=this.audioEl.seeking;this.audioEl.currentTime=a(e,0,this.audioEl.duration||0),t||(this[d]=this.audioEl.currentTime)}}get duration(){return this.audioEl?.duration??0}get paused(){return this.audioEl?.paused??!0}get playing(){return this.audioEl&&!this.audioEl.paused&&!this.audioEl.ended}get ended(){return this.audioEl?.ended??!1}play(){const e=this.audioEl?.play();return e?.catch?.(()=>{}),this}pause(){return this.audioEl?.pause(),this}togglePlayPause(){return this.audioEl?(this.audioEl.paused||this.audioEl.ended?this.play():this.pause(),this):this}seek(e){return this.currentTime=e,this}skip(e){return this.seek(this.currentTime+e),this}setVolume(e){return this.volume=a(e,0,1),this.volume>0&&this.muted&&(this.muted=!1),this}mute(){return this.muted=!0,this}unmute(){return this.muted=!1,this}toggleMute(){return this.muted=!this.muted,this}setPlaybackRate(e){return this.playbackRate=a(e,.25,4),this}toggleLoop(){return this.loop=!this.loop,this}wakeControls(){this.removeAttribute("idle"),clearTimeout(this.idleTimer),this.idleDelayMs&&this.idleDelayMs>0&&(this.idleTimer=setTimeout(()=>this.setAttribute("idle",""),this.idleDelayMs))}clearIdleTimer(){clearTimeout(this.idleTimer)}persistTimeNow(){const e=this.persistentId;e&&this.audioEl&&this.audioEl.currentTime>0&&sessionStorage.setItem(`audio-time:${e}`,this.audioEl.currentTime)}clearPersistedTime(){this.persistentId&&sessionStorage.removeItem(`audio-time:${this.persistentId}`)}updated(e){super.updated(e),e.has("controls")&&this.controls&&"none"!==this.controls&&this.loadControls();const t=this.audioEl;t&&(e.has("src")&&(t.src=this.src||"",this.persistentId&&(t.currentTime=parseFloat(sessionStorage.getItem(`audio-time:${this.persistentId}`))||0)),e.has("volume")&&(t.volume=this.volume),e.has("playbackRate")&&(t.playbackRate=this.playbackRate),e.has("muted")&&(t.muted=this.muted),e.has("loop")&&(t.loop=this.loop,this.dispatchEvent(new CustomEvent("loop-changed",{detail:{loop:this.loop},bubbles:!0}))),e.has("preload")&&(t.preload=this.preload||"metadata"),e.has("idleDelayMs")&&this.playing&&this.wakeControls())}loadControls(){const e=this.constructor.controlSets[this.controls];e&&r.load(Object.values(e))}render(){const t=this.constructor.controlSets[this.controls]??this.constructor.controlSets[""];return e`
      <div id="frame">
        <audio
          id="player"
          .muted=${this.muted}
          .volume=${this.volume}
          .playbackRate=${this.playbackRate}
          .defaultPlaybackRate=${this.playbackRate}
          ?autoplay=${this.autoplay}
          ?loop=${this.loop}
          preload=${this.preload||"metadata"}
          crossorigin=${this.crossorigin||i}
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
        ${this.buffering?e`<div id="buffering"><k-spinner size="lg"></k-spinner></div>`:i}
        <div id="controls-bar" ?hidden=${!t.bottom&&!this.children.length}>
          <slot>${t.bottom??i}</slot>
        </div>
      </div>
    `}handlePlay=()=>{this.wakeControls(),this.dispatchEvent(new CustomEvent("play",{bubbles:!0}))};handlePause=()=>{clearTimeout(this.idleTimer),this.persistTimeNow(),this.toggleAttribute("paused",!0),this.dispatchEvent(new CustomEvent("pause",{bubbles:!0}))};handleTimeUpdate=()=>{this.persistTimeDebounced(),this.dispatchEvent(new CustomEvent("timeupdate",{bubbles:!0}))};handleLoadedMetadata=()=>{this.dispatchEvent(new CustomEvent("loadedmetadata",{bubbles:!0}))};handleCanPlay=()=>{this.buffering=!1,this.requestUpdate(),this.dispatchEvent(new CustomEvent("canplay",{bubbles:!0}))};handleWaiting=()=>{this.buffering=!0,this.requestUpdate(),this.dispatchEvent(new CustomEvent("waiting",{bubbles:!0}))};handleSeeking=()=>{this.dispatchEvent(new CustomEvent("seeking",{bubbles:!0}))};handleSeeked=()=>{this.dispatchEvent(new CustomEvent("seeked",{bubbles:!0}))};handleEnded=()=>{this.clearPersistedTime(),this.toggleAttribute("ended",!0),this.dispatchEvent(new CustomEvent("ended",{bubbles:!0}))};handleDurationChange=()=>{this.dispatchEvent(new CustomEvent("durationchange",{bubbles:!0}))};handleVolumeChange=()=>{this.volume=this.audioEl?.volume??1,this.muted=this.audioEl?.muted??!1,this.dispatchEvent(new CustomEvent("volumechange",{bubbles:!0}))};handleRateChange=()=>{this.playbackRate=this.audioEl?.playbackRate??1,this.dispatchEvent(new CustomEvent("ratechange",{bubbles:!0}))};handleError=()=>{this.dispatchEvent(new CustomEvent("error",{bubbles:!0}))};handlePointerMove=()=>{this.wakeControls()};static styles=t`
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
  `;static controlSets={"":{bottom:null},none:{bottom:null},minimal:{bottom:e`
        <kc-vid-play-pause></kc-vid-play-pause>
        <kc-vid-time></kc-vid-time>
        <kc-vid-seek></kc-vid-seek>
        <kc-vid-duration></kc-vid-duration>
      `},normal:{bottom:e`
        <kc-vid-play-pause></kc-vid-play-pause>
        <kc-vid-time></kc-vid-time>
        <kc-vid-seek></kc-vid-seek>
        <kc-vid-duration></kc-vid-duration>
        <kc-vid-volume></kc-vid-volume>
        <kc-vid-speed></kc-vid-speed>
        <kc-vid-loop></kc-vid-loop>
      `},full:{bottom:e`
        <kc-vid-skip-back></kc-vid-skip-back>
        <kc-vid-play-pause></kc-vid-play-pause>
        <kc-vid-skip-forward></kc-vid-skip-forward>
        <kc-vid-time></kc-vid-time>
        <kc-vid-seek></kc-vid-seek>
        <kc-vid-duration></kc-vid-duration>
        <kc-vid-volume></kc-vid-volume>
        <kc-vid-speed></kc-vid-speed>
        <kc-vid-loop></kc-vid-loop>
      `}}}customElements.define("k-audio",l);