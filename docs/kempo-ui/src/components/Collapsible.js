import ShadowComponent from"./ShadowComponent.js";import{html,css}from"../lit-all.min.js";import{boolTrueFalse}from"../utils/propConverters.js";import"./Icon.js";export default class Collapsible extends ShadowComponent{static properties={opened:{type:Boolean,reflect:!0,converter:boolTrueFalse}};constructor(){super(),this.opened=!1}handleLabelClick=()=>{this.toggle()};updated(e){super.updated(e),e.has("opened")&&(this.dispatchEvent(new CustomEvent("openedchanged",{detail:this.opened?"open":"close"})),this.dispatchEvent(new CustomEvent(this.opened?"open":"close")))}open(){this.opened=!0}close(){this.opened=!1}toggle(){this.opened=!this.opened,this.dispatchEvent(new CustomEvent("openedtoggled"))}static styles=css`
		:host {
			display: block;
		}
		#labelContainer {
			display: flex;
			cursor: pointer;
		}
		#label {
			flex: 1 1 auto;
		}
		#labelIcon {
			flex: 0 0 none;
			opacity: 0.5;
			transform: rotate(90deg);
			transition: transform var(--animation_ms, 256ms);
		}
		#labelContainer:hover #labelIcon {
			opacity: 1;
		}
		:host([opened="true"]) #labelIcon {
			transform: rotate(-90deg);
		}
		:host(:not([opened="true"])) #content {
			display: none;
		}
	`;render(){return html`
			<div id="labelContainer" @click=${this.handleLabelClick}>
				<div id="label">
					<slot name="label"></slot>
				</div>
				<div id="labelIcon">
					<slot name="labelIcon">
						<k-icon name="chevron-right"></k-icon>
					</slot>
				</div>
			</div>
			<div id="content">
				<slot></slot>
			</div>
		`}}customElements.define("k-collapsible",Collapsible);