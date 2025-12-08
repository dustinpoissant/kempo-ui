import ShadowComponent from"./ShadowComponent.js";import{html,css}from"../lit-all.min.js";export default class Main extends ShadowComponent{static properties={panelWidth:{type:String,state:!0},panelSide:{type:String,state:!0}};constructor(){super(),this.panelWidth="0px",this.panelSide="left",this.handlePanelChange=this.handlePanelChange.bind(this)}connectedCallback(){super.connectedCallback(),window.addEventListener("side-panel-change",this.handlePanelChange);const e=document.querySelector("k-side-panel");e&&(this.panelWidth=e.collapsed?"3.5rem":"16rem",this.panelSide=e.side||"left")}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("side-panel-change",this.handlePanelChange)}handlePanelChange(e){this.panelWidth=e.detail.width,this.panelSide=e.detail.side}render(){return html`
			<main>
				<slot></slot>
			</main>
		`}static styles=css`
		:host {
			display: block;
			margin-left: var(--panel-width, 0px);
			transition: margin-left var(--animation_ms, 256ms);
		}
		:host([panel-side="right"]) {
			margin-left: 0;
			margin-right: var(--panel-width, 0px);
			transition: margin-right var(--animation_ms, 256ms);
		}
		main {
			max-width: var(--container_width, 90rem);
			margin-left: auto;
			margin-right: auto;
			padding-top: var(--spacer);
			padding-left: var(--spacer);
			padding-right: var(--spacer);
		}
	`;updated(){super.updated(),this.style.setProperty("--panel-width",this.panelWidth),"right"===this.panelSide?this.setAttribute("panel-side","right"):this.removeAttribute("panel-side")}}window.customElements.define("k-main",Main);