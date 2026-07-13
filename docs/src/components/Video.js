import{html as e,css as t,nothing as i}from"../lit-all.min.js";import s from"./ShadowComponent.js";import{bound as r}from"../utils/number.js";import o from"../utils/debounce.js";import n from"./controls/Control.js";import"./Icon.js";import"./Spinner.js";const l=Symbol(),a=Symbol();export default class c extends s{static properties={src:{type:String,reflect:!0},poster:{type:String,reflect:!0},preload:{type:String,reflect:!0},autoplay:{type:Boolean,reflect:!0},loop:{type:Boolean,reflect:!0},muted:{type:Boolean,reflect:!0},playsinline:{type:Boolean,reflect:!0},crossorigin:{type:String,reflect:!0},downloadName:{type:String,reflect:!0,attribute:"download-name"},volume:{type:Number},playbackRate:{type:Number,attribute:"playback-rate"},fullscreen:{type:Boolean,reflect:!0},pictureInPicture:{type:Boolean,reflect:!0,attribute:"picture-in-picture"},controls:{type:String,reflect:!0},persistentId:{type:String,reflect:!0,attribute:"persistent-id"},idleDelayMs:{type:Number,reflect:!0,attribute:"idle-delay-ms"},skipFlashMs:{type:Number,reflect:!0,attribute:"skip-flash-ms"},skipDuration:{type:Number,reflect:!0,attribute:"skip-duration"}};static forwardedEvents=["play","pause","playing","ended","timeupdate","durationchange","volumechange","ratechange","seeking","seeked","waiting","progress","loadedmetadata","canplay","error","enterpictureinpicture","leavepictureinpicture"];constructor(){super(),this.src="",this.poster="",this.preload="metadata",this.autoplay=!1,this.loop=!1,this.muted=!1,this.playsinline=!0,this.crossorigin="",this.downloadName="",this.volume=1,this.playbackRate=1,this.fullscreen=!1,this.pictureInPicture=!1,this.controls="",this.persistentId=null,this.idleDelayMs=2500,this.skipFlashMs=600,this.skipDuration=10,this[l]=null,this.buffering=!1,this.skipFlash=null,this.persistTimeDebounced=o(()=>this.persistTimeNow(),1e3)}connectedCallback(){super.connectedCallback(),this.hasAttribute("controlled")||this.setAttribute("controlled",""),document.addEventListener("fullscreenchange",this.handleFullscreenChange),this.addEventListener("pointermove",this.handlePointerMove),this.addEventListener("pointerleave",this.handlePointerLeave)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("fullscreenchange",this.handleFullscreenChange),this.removeEventListener("pointermove",this.handlePointerMove),this.removeEventListener("pointerleave",this.handlePointerLeave),clearTimeout(this.idleTimer),clearTimeout(this.skipFlashTimer),clearTimeout(this.clickTimer);const e=this[a];if(e&&this.videoEl)for(const t of Object.keys(e))this.videoEl.removeEventListener(t,e[t]);this[a]=null}firstUpdated(e){super.firstUpdated?.(e);const t=this.videoEl;if(!t)return;null!==this[l]&&(t.currentTime=this[l],this[l]=null);const i={};for(const e of this.constructor.forwardedEvents){const s=this.makeForwardHandler(e);i[e]=s,t.addEventListener(e,s)}this[a]=i}updated(e){if(super.updated(e),e.has("fullscreen")&&this.dispatchEvent(new CustomEvent("fullscreen-changed",{detail:{fullscreen:this.fullscreen},bubbles:!0})),e.has("pictureInPicture")&&this.dispatchEvent(new CustomEvent("picture-in-picture-changed",{detail:{pictureInPicture:this.pictureInPicture},bubbles:!0})),e.has("loop")&&this.dispatchEvent(new CustomEvent("loop-changed",{detail:{loop:this.loop},bubbles:!0})),e.has("controls")&&this.controls&&"none"!==this.controls&&this.loadControls(),e.has("persistentId")&&this.persistentId&&window?.localStorage){const e=`video-persistent-id-${this.persistentId}`,t=window.localStorage.getItem(e);if(null!==t){const e=Number(t);isNaN(e)||(this.currentTime=e,this.dispatchEvent(new CustomEvent("restored",{detail:{time:e},bubbles:!0})))}}}loadControls(){const e=this.constructor.controlSets[this.controls];e&&n.load(Object.values(e))}get videoEl(){return this.shadowRoot?.querySelector("#player")||null}get currentTime(){return this.videoEl?this.videoEl.currentTime:this[l]??0}set currentTime(e){const t=this.videoEl;t?t.currentTime=r(e,0,t.duration||e):this[l]=e}get duration(){return this.videoEl?.duration||0}get paused(){return!this.videoEl||this.videoEl.paused}get ended(){return this.videoEl?.ended??!1}play(){const e=this.videoEl?.play();return e?.catch?.(()=>{}),this}pause(){return this.videoEl?.pause(),this}togglePlayPause(){return this.videoEl?(this.videoEl.paused||this.videoEl.ended?this.play():this.pause(),this):this}seek(e){return this.currentTime=e,this}skip(e){return this.seek(this.currentTime+e),this}setVolume(e){return this.volume=r(e,0,1),this.volume>0&&this.muted&&(this.muted=!1),this}mute(){return this.muted=!0,this}unmute(){return this.muted=!1,this}toggleMute(){return this.muted=!this.muted,this}setPlaybackRate(e){return this.playbackRate=r(e,.25,4),this}toggleLoop(){return this.loop=!this.loop,this}enterFullscreen(){const e=this.requestFullscreen?.();return e?.catch?.(()=>{}),this}exitFullscreen(){if(document.fullscreenElement===this){const e=document.exitFullscreen?.();e?.catch?.(()=>{})}return this}toggleFullscreen(){return this.fullscreen?this.exitFullscreen():this.enterFullscreen()}enterPictureInPicture(){const e=this.videoEl?.requestPictureInPicture?.();return e?.catch?.(()=>{}),this}exitPictureInPicture(){if(document.pictureInPictureElement===this){const e=document.exitPictureInPicture?.();e?.catch?.(()=>{})}return this}togglePictureInPicture(){return this.pictureInPicture?this.exitPictureInPicture():this.enterPictureInPicture()}download(){if(!this.src)return this;const e=document.createElement("a");return e.href=this.src,e.download=this.downloadName||"",e.rel="noopener",document.body.appendChild(e),e.click(),e.remove(),this}persistTimeNow(){this.persistentId&&window?.localStorage&&window.localStorage.setItem(`video-persistent-id-${this.persistentId}`,String(this.currentTime))}clearPersistedTime(){this.persistentId&&window?.localStorage&&window.localStorage.removeItem(`video-persistent-id-${this.persistentId}`)}wakeControls(){this.removeAttribute("idle"),clearTimeout(this.idleTimer),this.paused||(this.idleTimer=setTimeout(()=>this.setAttribute("idle",""),this.idleDelayMs))}handleFullscreenChange=()=>{const e=document.fullscreenElement===this;this.fullscreen!==e&&(this.fullscreen=e)};handlePointerMove=()=>{this.wakeControls()};handlePointerLeave=()=>{};handleVideoClick=e=>{if(clearTimeout(this.clickTimer),e.detail>=2){const t=this.videoEl.getBoundingClientRect(),i=e.clientX-t.left>t.width/2;this.skip(i?this.skipDuration:-this.skipDuration),this.flashSkip(i?"forward":"backward")}else this.clickTimer=setTimeout(()=>this.togglePlayPause(),220)};flashSkip(e){clearTimeout(this.skipFlashTimer),this.skipFlash=e,this.requestUpdate(),this.skipFlashTimer=setTimeout(()=>{this.skipFlash=null,this.requestUpdate()},this.skipFlashMs)}makeForwardHandler(e){return()=>{const t=this.videoEl;t&&("volumechange"===e&&this.muted!==t.muted&&(this.muted=t.muted),"ratechange"===e&&this.playbackRate!==t.playbackRate&&(this.playbackRate=t.playbackRate),"play"!==e&&"pause"!==e&&"playing"!==e&&"ended"!==e||(this.toggleAttribute("paused",t.paused),this.toggleAttribute("ended",t.ended)),"play"!==e&&"playing"!==e||this.wakeControls(),"pause"===e&&(clearTimeout(this.idleTimer),this.removeAttribute("idle"),this.persistTimeNow()),"timeupdate"===e&&this.persistTimeDebounced(),"ended"===e&&this.clearPersistedTime(),"waiting"===e&&(this.buffering=!0,this.requestUpdate()),"playing"!==e&&"canplay"!==e||(this.buffering=!1,this.requestUpdate()),"enterpictureinpicture"!==e&&"leavepictureinpicture"!==e||(this.pictureInPicture=document.pictureInPictureElement===this),this.dispatchEvent(new CustomEvent(e,{bubbles:!0})))}}render(){const t=this.constructor.controlSets[this.controls]??this.constructor.controlSets[""];return e`
      <div id="frame">
        <slot name="top"></slot>
        <div
          id="video-wrapper"
          @click=${this.handleVideoClick}
        >
          <video
            id="player"
            part="video"
            .src=${this.src||""}
            .poster=${this.poster||""}
            .muted=${this.muted}
            .volume=${this.volume}
            .playbackRate=${this.playbackRate}
            .defaultPlaybackRate=${this.playbackRate}
            ?autoplay=${this.autoplay}
            ?loop=${this.loop}
            ?playsinline=${this.playsinline}
            preload=${this.preload||"metadata"}
            crossorigin=${this.crossorigin||i}
          ></video>
        </div>
        ${this.buffering?e`
          <div id="buffering"><k-spinner size="lg"></k-spinner></div>
        `:i}
        ${this.skipFlash?e`
          <div class="skip-flash ${this.skipFlash}">
            <k-icon name="${"forward"===this.skipFlash?"fast_forward":"fast_rewind"}"></k-icon>
            <span>${this.skipDuration}s</span>
          </div>
        `:i}
        <slot name="center">${t.center??i}</slot>
        <div id="controls-bar">
          <slot>${t.bottom??i}</slot>
        </div>
      </div>
    `}static styles=t`
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
    video {
      display: block;
      width: 100%;
      height: var(--height, auto);
      max-height: var(--max-height);
      background: #000;
      cursor: pointer;
      pointer-events: none;
    }
    :host(:fullscreen),
    :host([fullscreen]) {
      width: 100%;
      height: 100%;
    }
    :host(:fullscreen) video,
    :host([fullscreen]) video {
      height: 100%;
      object-fit: contain;
    }
    :host([idle]) {
      cursor: none;
    }
    :host([idle]) #controls-bar {
      opacity: 0;
      pointer-events: none;
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
      background: linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0));
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
    #controls-bar ::slotted(kc-vid-play-pause),
    #controls-bar ::slotted(kc-vid-skip-back),
    #controls-bar ::slotted(kc-vid-skip-forward),
    #controls-bar ::slotted(kc-vid-loop),
    #controls-bar ::slotted(kc-vid-download),
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
  `;static controlSets={"":{bottom:null},none:{bottom:null},minimal:{center:e`<kc-vid-play-big></kc-vid-play-big>`,bottom:e`
        <kc-vid-play-pause></kc-vid-play-pause>
        <kc-vid-time></kc-vid-time>
        <kc-vid-seek></kc-vid-seek>
        <kc-vid-duration></kc-vid-duration>
        <kc-fullscreen></kc-fullscreen>
      `},normal:{center:e`<kc-vid-play-big></kc-vid-play-big>`,bottom:e`
        <kc-vid-play-pause></kc-vid-play-pause>
        <kc-vid-time></kc-vid-time>
        <kc-vid-seek></kc-vid-seek>
        <kc-vid-duration></kc-vid-duration>
        <kc-vid-volume></kc-vid-volume>
        <kc-vid-speed></kc-vid-speed>
        <kc-vid-loop></kc-vid-loop>
        <kc-fullscreen></kc-fullscreen>
      `},full:{center:e`<kc-vid-play-big></kc-vid-play-big>`,bottom:e`
        <kc-vid-skip-back></kc-vid-skip-back>
        <kc-vid-play-pause></kc-vid-play-pause>
        <kc-vid-skip-forward></kc-vid-skip-forward>
        <kc-vid-time></kc-vid-time>
        <kc-vid-seek></kc-vid-seek>
        <kc-vid-duration></kc-vid-duration>
        <kc-vid-volume></kc-vid-volume>
        <kc-vid-speed></kc-vid-speed>
        <kc-vid-loop></kc-vid-loop>
        <kc-vid-pip></kc-vid-pip>
        <kc-vid-download></kc-vid-download>
        <kc-fullscreen></kc-fullscreen>
      `}}}customElements.define("k-video",c);