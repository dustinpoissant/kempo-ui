import{html,css}from"../lit-all.min.js";import ShadowComponent from"./ShadowComponent.js";import drag from"../utils/drag.js";export default class Split extends ShadowComponent{static properties={resizing:{type:Boolean,reflect:!0},stacked:{type:Boolean,reflect:!0},stackWidth:{type:Number,attribute:"stack-width"}};constructor(){super(),this.resizing=!1,this.stacked=!1,this.stackWidth=0,this.dragStartWidth=0,this.dragCleanup=()=>{},this.resizeObserver=null}firstUpdated(){super.firstUpdated(),this.setupDragHandler(),this.setupResizeObserver()}disconnectedCallback(){super.disconnectedCallback(),this.dragCleanup(),this.resizeObserver&&(this.resizeObserver.disconnect(),this.resizeObserver=null)}handleDragStart=()=>{this.resizing=!0,this.dragStartWidth=Math.round(this.shadowRoot.getElementById("left").getBoundingClientRect().width),this.dispatchEvent(new CustomEvent("resizestart",{detail:{startSize:this.dragStartWidth},bubbles:!0}))};handleDrag=({x:e})=>{const t=`${this.dragStartWidth+e}px`;this.setSize(t),this.dispatchEvent(new CustomEvent("resize",{detail:{size:t},bubbles:!0}))};handleDragEnd=({x:e})=>{this.resizing=!1;const t=`${this.dragStartWidth+e}px`;this.setSize(t),this.dispatchEvent(new CustomEvent("resizeend",{detail:{size:t},bubbles:!0}))};setSize(e){this.style.setProperty("--left_width",e)}setupDragHandler(){const e=this.shadowRoot.getElementById("divider-handle");e&&(this.dragCleanup=drag({element:e,callback:this.handleDrag,startCallback:this.handleDragStart,endCallback:this.handleDragEnd}))}setupResizeObserver(){this.resizeObserver=new ResizeObserver(e=>{for(const t of e){const e=t.contentRect.width;this.stacked=e<=this.stackWidth}}),this.resizeObserver.observe(this)}static styles=css`
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