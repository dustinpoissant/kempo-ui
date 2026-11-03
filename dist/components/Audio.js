import{html as t,css as e,nothing as i}from"../lit-all.min.js";import s from"./ShadowComponent.js";import{bound as a}from"../utils/number.js";import r from"../utils/debounce.js";import o from"../utils/pauseOthers.js";import l from"../utils/loadFileMetadata.js";import{boolTrueFalse as n}from"../utils/propConverters.js";import d from"./controls/Control.js";import"./Icon.js";import"./Spinner.js";const h=Symbol();export default class c extends s{#t=null;static properties={src:{type:String,reflect:!0},preload:{type:String,reflect:!0},autoplay:{type:Boolean,reflect:!0},loop:{type:Boolean,reflect:!0},muted:{type:Boolean,reflect:!0},crossorigin:{type:String,reflect:!0},volume:{type:Number},playbackRate:{type:Number,attribute:"playback-rate"},controls:{type:String,reflect:!0},persistentId:{type:String,reflect:!0,attribute:"persistent-id"},idleDelayMs:{type:Number,reflect:!0,attribute:"idle-delay-ms"},skipDuration:{type:Number,reflect:!0,attribute:"skip-duration"},artist:{type:String},trackTitle:{type:String,attribute:"track-title"},album:{type:String},year:{type:String},readMetadata:{type:Boolean,converter:n,attribute:"read-metadata"},downloadName:{type:String,reflect:!0,attribute:"download-name"},playlistLoop:{type:Boolean,reflect:!0,attribute:"playlist-loop"},trackIndex:{type:Number,attribute:!1},shuffled:{type:Boolean,reflect:!0},exclusive:{type:Boolean,reflect:!0}};static forwardedEvents=["play","pause","playing","ended","timeupdate","durationchange","volumechange","ratechange","seeking","seeked","waiting","progress","loadedmetadata","canplay","error"];constructor(){super(),this.src="",this.preload="metadata",this.autoplay=!1,this.loop=!1,this.muted=!1,this.crossorigin="",this.volume=1,this.playbackRate=1,this.controls="",this.persistentId=null,this.idleDelayMs=2500,this.skipDuration=10,this.artist="",this.trackTitle="",this.album="",this.year="",this.readMetadata=!0,this.defaultSlotted=!1,this.downloadName="",this.playlistLoop=!1,this.trackIndex=-1,this.shuffled=!1,this.exclusive=!1,this[h]=null,this.buffering=!1,this.persistTimeDebounced=r(()=>this.persistTimeNow(),1e3)}connectedCallback(){super.connectedCallback(),this.hasAttribute("controlled")||this.setAttribute("controlled","")}disconnectedCallback(){super.disconnectedCallback(),this.clearIdleTimer(),this.persistTimeNow()}get audioEl(){return this.shadowRoot?.querySelector("#player")}get videoEl(){return this.audioEl}get currentTime(){return this.audioEl?.currentTime??0}set currentTime(t){if(this.audioEl){const e=this.audioEl.seeking;this.audioEl.currentTime=a(t,0,this.audioEl.duration||0),e||(this[h]=this.audioEl.currentTime)}}get duration(){return this.audioEl?.duration??0}get paused(){return this.audioEl?.paused??!0}get playing(){return this.audioEl&&!this.audioEl.paused&&!this.audioEl.ended}get ended(){return this.audioEl?.ended??!1}play(){const t=this.audioEl?.play();return t?.catch?.(()=>{}),this}pause(){return this.audioEl?.pause(),this}togglePlayPause(){return this.audioEl?(this.audioEl.paused||this.audioEl.ended?this.play():this.pause(),this):this}seek(t){return this.currentTime=t,this}skip(t){return this.seek(this.currentTime+t),this}setVolume(t){return this.volume=a(t,0,1),this.volume>0&&this.muted&&(this.muted=!1),this}mute(){return this.muted=!0,this}unmute(){return this.muted=!1,this}toggleMute(){return this.muted=!this.muted,this}setPlaybackRate(t){return this.playbackRate=a(t,.25,4),this}toggleLoop(){return this.loop=!this.loop,this}download(){if(!this.src)return this;const t=document.createElement("a");return t.href=this.src,t.download=this.downloadName||"",t.rel="noopener",document.body.appendChild(t),t.click(),t.remove(),this}get tracks(){return[...this.children].filter(t=>"kc-audio-track"===t.localName)}get hasSlottedContent(){return[...this.children].some(t=>"kc-audio-track"!==t.localName)}selectTrack(t){const e=this.tracks[t];return e?(this.trackIndex=t,this.src=e.src,this.artist=e.artist,this.trackTitle=e.trackTitle,this.album=e.album,this.year=e.year,this.downloadName=e.downloadName,this.dispatchEvent(new CustomEvent("track-changed",{detail:{index:t},bubbles:!0})),this):this}playTrack(t){return this.selectTrack(t),this.updateComplete.then(()=>this.play()),this}previousTrack(){const t=this.tracks.length;return t?this.trackIndex>0?this.playTrack(this.trackIndex-1):this.playlistLoop?this.playTrack(t-1):this:this}nextTrack(){const t=this.tracks.length;return t?this.trackIndex<t-1?this.playTrack(this.trackIndex+1):this.playlistLoop?this.playTrack(0):this:this}togglePlaylistLoop(){return this.playlistLoop=!this.playlistLoop,this}reorderTracks(t){return this.applyOrder(t),this.#t=null,this.shuffled=!1,this}applyOrder(t){const e=this.tracks,i=e[this.trackIndex];return t.forEach(t=>this.appendChild(e[t])),this.trackIndex=this.tracks.indexOf(i),this.dispatchEvent(new CustomEvent("playlist-changed",{bubbles:!0})),this}toggleShuffle(){return this.shuffled?this.restoreOrder():this.randomizeOrder()}randomizeOrder(){const t=this.tracks,e=t.map((t,e)=>e);for(let t=e.length-1;t>0;t--){const i=Math.floor(Math.random()*(t+1));[e[t],e[i]]=[e[i],e[t]]}return this.#t=[...t],this.dispatchEvent(new CustomEvent("playlist-shuffling",{bubbles:!0})),this.applyOrder(e),this.shuffled=!0,this}restoreOrder(){const t=this.tracks,e=(this.#t??t).map(e=>t.indexOf(e)).filter(t=>-1!==t);return t.forEach((t,i)=>{e.includes(i)||e.push(i)}),this.dispatchEvent(new CustomEvent("playlist-shuffling",{bubbles:!0})),this.applyOrder(e),this.#t=null,this.shuffled=!1,this}wakeControls(){this.removeAttribute("idle"),clearTimeout(this.idleTimer),this.idleDelayMs&&this.idleDelayMs>0&&(this.idleTimer=setTimeout(()=>this.setAttribute("idle",""),this.idleDelayMs))}clearIdleTimer(){clearTimeout(this.idleTimer)}persistTimeNow(){const t=this.persistentId;t&&this.audioEl&&this.audioEl.currentTime>0&&sessionStorage.setItem(`audio-time:${t}`,this.audioEl.currentTime)}clearPersistedTime(){this.persistentId&&sessionStorage.removeItem(`audio-time:${this.persistentId}`)}updated(t){super.updated(t),["artist","trackTitle","album","year"].some(e=>t.has(e))&&this.dispatchEvent(new CustomEvent("metadata-changed",{bubbles:!0})),t.has("src")&&this.dispatchEvent(new CustomEvent("src-changed",{bubbles:!0})),(t.has("src")||t.has("readMetadata"))&&l(this),t.has("playlistLoop")&&this.dispatchEvent(new CustomEvent("playlist-loop-changed",{bubbles:!0})),t.has("shuffled")&&this.dispatchEvent(new CustomEvent("shuffle-changed",{bubbles:!0})),t.has("controls")&&this.controls&&"none"!==this.controls&&this.loadControls();const e=this.audioEl;e&&(t.has("src")&&(e.src=this.src||"",this.persistentId&&(e.currentTime=parseFloat(sessionStorage.getItem(`audio-time:${this.persistentId}`))||0)),t.has("volume")&&(e.volume=this.volume),t.has("playbackRate")&&(e.playbackRate=this.playbackRate),t.has("muted")&&(e.muted=this.muted),t.has("loop")&&(e.loop=this.loop,this.dispatchEvent(new CustomEvent("loop-changed",{detail:{loop:this.loop},bubbles:!0}))),t.has("preload")&&(e.preload=this.preload||"metadata"),t.has("idleDelayMs")&&this.playing&&this.wakeControls())}loadControls(){const t=this.constructor.controlSets[this.controls];t&&d.load(Object.values(t))}render(){const e=this.constructor.controlSets[this.controls]??this.constructor.controlSets[""];return t`
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
        ${this.buffering?t`<div id="buffering"><k-spinner size="lg"></k-spinner></div>`:i}
        <div id="controls-bar" ?hidden=${!e.bottom&&!this.hasSlottedContent}>
          <slot name="top"></slot>
          <div id="controls-row">
            <slot @slotchange=${this.handleSlotChange}></slot>
            ${this.defaultSlotted?i:e.bottom??i}
          </div>
          <slot name="bottom"></slot>
        </div>
      </div>
    `}handleSlotChange=t=>{this.defaultSlotted=t.target.assignedElements().some(t=>"kc-audio-track"!==t.localName),this.trackIndex<0&&this.tracks.length&&this.selectTrack(0),this.dispatchEvent(new CustomEvent("playlist-changed",{bubbles:!0})),this.requestUpdate()};handlePlay=()=>{this.exclusive&&o(this),this.removeAttribute("ended"),this.wakeControls(),this.dispatchEvent(new CustomEvent("play",{bubbles:!0}))};handlePause=()=>{clearTimeout(this.idleTimer),this.persistTimeNow(),this.toggleAttribute("paused",!0),this.dispatchEvent(new CustomEvent("pause",{bubbles:!0}))};handleTimeUpdate=()=>{this.persistTimeDebounced(),this.dispatchEvent(new CustomEvent("timeupdate",{bubbles:!0}))};handleLoadedMetadata=()=>{this.dispatchEvent(new CustomEvent("loadedmetadata",{bubbles:!0}))};handleCanPlay=()=>{clearTimeout(this.bufferingTimer),this.buffering=!1,this.requestUpdate(),this.dispatchEvent(new CustomEvent("canplay",{bubbles:!0}))};handleWaiting=()=>{clearTimeout(this.bufferingTimer),this.bufferingTimer=setTimeout(()=>{this.buffering=!0,this.requestUpdate()},300),this.dispatchEvent(new CustomEvent("waiting",{bubbles:!0}))};handleSeeking=()=>{this.dispatchEvent(new CustomEvent("seeking",{bubbles:!0}))};handleSeeked=()=>{this.dispatchEvent(new CustomEvent("seeked",{bubbles:!0}))};handleEnded=()=>{this.clearPersistedTime(),this.toggleAttribute("ended",!0),this.dispatchEvent(new CustomEvent("ended",{bubbles:!0})),this.nextTrack()};handleDurationChange=()=>{this.dispatchEvent(new CustomEvent("durationchange",{bubbles:!0}))};handleVolumeChange=()=>{this.volume=this.audioEl?.volume??1,this.muted=this.audioEl?.muted??!1,this.dispatchEvent(new CustomEvent("volumechange",{bubbles:!0}))};handleRateChange=()=>{this.playbackRate=this.audioEl?.playbackRate??1,this.dispatchEvent(new CustomEvent("ratechange",{bubbles:!0}))};handleError=()=>{this.dispatchEvent(new CustomEvent("error",{bubbles:!0}))};handlePointerMove=()=>{this.wakeControls()};static styles=e`
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
      display: flex;
      flex-direction: column;
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
  `;static controlSets={"":{bottom:null},none:{bottom:null},minimal:{bottom:t`
        <k-control-bar>
          <kc-media-play-pause priority="10"></kc-media-play-pause>
          <kc-media-time slot="center" priority="1"></kc-media-time>
          <kc-media-seek slot="center" no-collapse soft-min-width="8rem"></kc-media-seek>
          <kc-media-duration slot="center" priority="1"></kc-media-duration>
        </k-control-bar>
      `},normal:{bottom:t`
        <k-control-bar>
          <kc-media-play-pause priority="10"></kc-media-play-pause>
          <kc-media-time slot="center" priority="1"></kc-media-time>
          <kc-media-seek slot="center" no-collapse soft-min-width="8rem"></kc-media-seek>
          <kc-media-duration slot="center" priority="1"></kc-media-duration>
          <kc-media-volume slot="right"></kc-media-volume>
          <kc-media-repeat slot="right"></kc-media-repeat>
        </k-control-bar>
      `},full:{bottom:t`
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
          <kc-media-download slot="right"></kc-media-download>
        </k-control-bar>
      `}}}customElements.define("k-audio",c);