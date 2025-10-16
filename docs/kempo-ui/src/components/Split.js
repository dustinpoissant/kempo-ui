import{html,css}from"../lit-all.min.js";import ShadowComponent from"./ShadowComponent.js";import drag from"../utils/drag.js";import{watchWindowSize,unwatchWindowSize}from"../utils/watchWindowSize.js";export default class Split extends ShadowComponent{static properties={resizing:{type:Boolean,reflect:!0},stacked:{type:Boolean,reflect:!0},stackWidth:{type:Number,attribute:"stack-width"}};constructor(){super(),this.resizing=!1,this.stacked=!1,this.stackWidth=0,this.dragStartWidth=0,this.dragCleanup=()=>{},this.windowResizeHandler=this.handleWindowResize.bind(this)}firstUpdated(){super.firstUpdated(),this.setupDragHandler(),this.stacked=watchWindowSize(this.windowResizeHandler)<=this.stackWidth}disconnectedCallback(){super.disconnectedCallback(),this.dragCleanup(),unwatchWindowSize(this.windowResizeHandler)}handleWindowResize=t=>{this.stacked=t<=this.stackWidth};handleDragStart=()=>{this.resizing=!0,this.dragStartWidth=Math.round(this.shadowRoot.getElementById("left").getBoundingClientRect().width),this.dispatchEvent(new CustomEvent("resizestart",{detail:{startSize:this.dragStartWidth},bubbles:!0}))};handleDrag=({x:t})=>{const e=`${this.dragStartWidth+t}px`;this.setSize(e),this.dispatchEvent(new CustomEvent("resize",{detail:{size:e},bubbles:!0}))};handleDragEnd=({x:t})=>{this.resizing=!1;const e=`${this.dragStartWidth+t}px`;this.setSize(e),this.dispatchEvent(new CustomEvent("resizeend",{detail:{size:e},bubbles:!0}))};setSize(t){this.style.setProperty("--left_width",t)}setupDragHandler(){const t=this.shadowRoot.getElementById("divider-handle");t&&(this.dragCleanup=drag({element:t,callback:this.handleDrag,startCallback:this.handleDragStart,endCallback:this.handleDragEnd}))}static styles=css`
		:host {
			--left_width: calc((100% - var(--handle_width)) / 2);
			--handle_width: 0.5rem;
			--min_pane_width: 6rem;

			height: 100%;
			display: flex;
			align-items: stretch;
			flex: 1 1 auto;
			overflow: hidden;
		}

		.pane, #divider-handle {
			display: inline-block;
		}

		.pane {
			min-width: var(--min_pane_width);
			max-width: calc(100% - var(--min_pane_width));
			max-height: 100%;
			overflow: hidden;
		}

		#left {
			flex: 0 0 var(--left_width);
		}

		#divider-handle {
			display: flex;
			justify-content: center;
			width: var(--handle_width);
			cursor: ew-resize;
		}

		:host([resizing]) #divider-handle {
			background-color: var(--tc_primary);
		}

		:host([resizing]) .pane {
			pointer-events: none;
			user-select: none;
		}

		#divider-border {
			width: 1px;
			height: 100%;
			border-left: 1px solid var(--c_border);
		}

		#right {
			flex: 1 1;
		}

		:host([stacked]) #left,
		:host([stacked]) #right {
			display: block;
		}

		:host([stacked]) #divider-handle {
			display: none;
		}

		:host([stacked]) .pane {
			min-width: 0;
			max-width: 100%;
			max-height: none;
			overflow: auto;
		}

		:host([stacked]) {
			display: block;
		}
	`;render(){return html`
			<div id="left" class="pane">
				<slot></slot>
			</div>
			<div id="divider-handle">
				<div id="divider-border"></div>
			</div>
			<div id="right" class="pane">
				<slot name="right"></slot>
			</div>
		`}}customElements.define("k-split",Split);