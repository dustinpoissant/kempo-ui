import t from"./Button.js";import{html as e,css as i}from"../lit-all.min.js";import"./Icon.js";export default class s extends t{static properties={...t.properties,targetId:{type:String,attribute:"for"},position:{type:String,reflect:!0},push:{type:Boolean,reflect:!0},label:{type:String},asideOpen:{type:Boolean,reflect:!0,attribute:"aside-open"},asideSide:{type:String,attribute:!1},asideWidth:{type:Number,attribute:!1}};constructor(){super(),this.targetId="",this.position="top left",this.push=!1,this.label="Menu",this.asideOpen=!1,this.asideSide="left",this.asideWidth=0,this.aside=null}connectedCallback(){super.connectedCallback(),window.addEventListener("aside_state_change",this.handleAsideChange),this.syncFromAside()}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("aside_state_change",this.handleAsideChange)}updated(t){super.updated(t),t.has("targetId")&&this.syncFromAside(),this.setAttribute("aria-label",this.label),this.setAttribute("aria-expanded",String(this.asideOpen));const e=this.position.includes("left")?"left":"right",i=this.push&&e===this.asideSide?this.asideWidth:0;this.style.setProperty("--aside-btn-offset",`${i}px`)}handleAsideChange=t=>{const{aside:e,state:i,width:s}=t.detail;e.id===this.targetId&&(this.aside=e,this.applyAside(i,e.side,s))};handleClick=t=>{this.disabled?t.stopImmediatePropagation():(this.aside||(this.aside=document.getElementById(this.targetId)),this.aside&&(this.asideOpen?this.aside.hide():this.aside.expand()))};syncFromAside=()=>{const t=document.getElementById(this.targetId);if(!t||void 0===t.state)return;this.aside=t;const e="offscreen"===t.state?0:t.getTargetWidth(t.state);this.applyAside(t.state,t.side,e)};applyAside=(t,e,i)=>{this.asideOpen="offscreen"!==t,this.asideSide=e||"left",this.asideWidth=i};render(){return e`<div id="icon"><slot><k-icon name="menu"></k-icon></slot></div>`}static styles=[t.styles,i`
		:host {
			position: fixed;
			z-index: 20;
			display: block;
			width: 3rem;
			height: 3rem;
			padding: 0;
			margin: var(--spacer);
			border-radius: 50%;
			transition: left var(--animation_ms, 256ms), right var(--animation_ms, 256ms), opacity var(--animation_ms, 256ms);
			opacity: 0.7;
		}
		:host(:hover),
		:host(:focus-visible) {
			opacity: 1;
		}
		#icon {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 100%;
			height: 100%;
		}
		:host([position*="top"]) {
			top: 0;
		}
		:host([position*="bottom"]) {
			bottom: 0;
		}
		:host([position*="left"]) {
			left: var(--aside-btn-offset, 0px);
		}
		:host([position*="right"]) {
			right: var(--aside-btn-offset, 0px);
		}
		:host([aside-open]:not([push])) {
			visibility: hidden;
		}
	`]}customElements.define("k-aside-btn",s);