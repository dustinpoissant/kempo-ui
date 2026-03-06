import{html,css}from"../lit-all.min.js";import ShadowComponent from"./ShadowComponent.js";import drag from"../utils/drag.js";export default class Split extends ShadowComponent{static properties={resizing:{type:Boolean,reflect:!0},stacked:{type:Boolean,reflect:!0},stackWidth:{type:Number,attribute:"stack-width"},direction:{type:String,reflect:!0}};constructor(){super(),this.resizing=!1,this.stacked=!1,this.stackWidth=0,this.direction="horizontal",this.dragStartSize=0,this.dragCleanup=()=>{},this.resizeObserver=null}firstUpdated(){super.firstUpdated(),this.setupDragHandler(),this.setupResizeObserver()}disconnectedCallback(){super.disconnectedCallback(),this.dragCleanup(),this.resizeObserver&&(this.resizeObserver.disconnect(),this.resizeObserver=null)}handleDragStart=()=>{this.resizing=!0,this.dragStartSize=Math.round(this.shadowRoot.getElementById("pane-1").getBoundingClientRect()["vertical"===this.direction?"height":"width"]),this.dispatchEvent(new CustomEvent("resizestart",{detail:{startSize:this.dragStartSize},bubbles:!0}))};handleDrag=({x:e,y:t})=>{const i="vertical"===this.direction?t:e,s=`${this.dragStartSize+i}px`;this.setSize(s),this.dispatchEvent(new CustomEvent("resize",{detail:{size:s},bubbles:!0}))};handleDragEnd=({x:e,y:t})=>{this.resizing=!1;const i="vertical"===this.direction?t:e,s=`${this.dragStartSize+i}px`;this.setSize(s),this.dispatchEvent(new CustomEvent("resizeend",{detail:{size:s},bubbles:!0}))};setSize(e){this.style.setProperty("--pane_1_size",e)}setupDragHandler(){const e=this.shadowRoot.getElementById("divider-handle");e&&(this.dragCleanup=drag({element:e,callback:this.handleDrag,startCallback:this.handleDragStart,endCallback:this.handleDragEnd}))}setupResizeObserver(){this.resizeObserver=new ResizeObserver(e=>{for(const t of e){const e=t.contentRect.width;this.stacked=e<=this.stackWidth}}),this.resizeObserver.observe(this)}static styles=css`
		:host {
			--pane_1_size: calc((100% - var(--handle_width)) / 2);
			--handle_width: 0.5rem;
			--min_pane_size: 6rem;

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
			min-width: var(--min_pane_size);
			max-width: calc(100% - var(--min_pane_size));
			max-height: 100%;
			overflow: hidden;
		}

		#pane-1 {
			flex: 0 0 var(--pane_1_size);
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

		#pane-2 {
			flex: 1 1;
		}

		:host([stacked]) #pane-1,
		:host([stacked]) #pane-2 {
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

		:host([direction="vertical"]) {
			flex-direction: column;
		}

		:host([direction="vertical"]) .pane {
			min-width: 0;
			max-width: 100%;
			min-height: var(--min_pane_size);
			max-height: calc(100% - var(--min_pane_size));
		}

		:host([direction="vertical"]) #pane-1 {
			flex: 0 0 var(--pane_1_size);
		}

		:host([direction="vertical"]) #divider-handle {
			width: 100%;
			height: var(--handle_width);
			cursor: ns-resize;
			align-items: center;
			justify-content: initial;
		}

		:host([direction="vertical"]) #divider-border {
			width: 100%;
			height: 1px;
			border-left: none;
			border-top: 1px solid var(--c_border);
		}
	`;render(){return html`
			<div id="pane-1" class="pane">
				<slot></slot>
			</div>
			<div id="divider-handle">
				<div id="divider-border"></div>
			</div>
			<div id="pane-2" class="pane">
				<slot name="right"></slot>
			</div>
		`}}customElements.define("k-split",Split);