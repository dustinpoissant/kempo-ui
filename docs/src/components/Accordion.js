import ShadowComponent from"./ShadowComponent.js";import{html,css}from"../lit-all.min.js";import{boolTrueFalse}from"../utils/propConverters.js";export default class Accordion extends ShadowComponent{static properties={};getHeader(e){return this.querySelector(`k-accordion-header[for-panel="${e}"]`)}getPanel(e){return this.querySelector(`k-accordion-panel[name="${e}"]`)}openPanel(e){const t=this.querySelector('k-accordion-panel[active="true"]');if(t&&t.name!==e){t.active=!1;const e=this.getHeader(t.name);e&&(e.active=!1)}const o=this.getPanel(e);if(o){o.active=!0,o.transitioning=!0,setTimeout(()=>{o.transitioning=!1},parseInt(getComputedStyle(this).getPropertyValue("--animation_ms")||256));const t=this.getHeader(e);t&&(t.active=!0),this.dispatchEvent(new CustomEvent("openpanel",{detail:{panelName:e}}))}}closePanel(e){const t=this.getPanel(e);if(t){t.active=!1,t.transitioning=!0,setTimeout(()=>{t.transitioning=!1},parseInt(getComputedStyle(this).getPropertyValue("--animation_ms")||256));const o=this.getHeader(e);o&&(o.active=!1),this.dispatchEvent(new CustomEvent("closepanel",{detail:{panelName:e}}))}}togglePanel(e){const t=this.getPanel(e);t&&(t.active?this.closePanel(e):this.openPanel(e),this.dispatchEvent(new CustomEvent("togglepanel",{detail:{panelName:e}})))}get activeHeader(){return this.querySelector('k-accordion-header[active="true"]')}get activePanel(){return this.querySelector('k-accordion-panel[active="true"]')}static styles=css`
		:host {
			display: block;
			border: 1px solid var(--c_border);
			border-radius: var(--radius);
		}
		::slotted(k-accordion-header) {
			border-top: 1px solid var(--c_border);
		}
		::slotted(k-accordion-header[active="true"]) {
			border-bottom: 1px solid var(--c_border);
		}
		::slotted(k-accordion-header:first-of-type) {
			border-top: 0;
		}
		::slotted(k-accordion-header:last-of-type:not([active="true"])) {
			border-bottom: 0;
		}
	`;render(){return html`<slot></slot>`}}export class AccordionHeader extends ShadowComponent{static properties={forPanel:{type:String,reflect:!0,attribute:"for-panel"},active:{type:Boolean,reflect:!0,converter:boolTrueFalse}};constructor(){super(),this.forPanel="",this.active=!1}handleClick=()=>{this.accordion?.togglePanel(this.forPanel)};connectedCallback(){super.connectedCallback(),this.addEventListener("click",this.handleClick)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("click",this.handleClick)}get accordion(){return this.closest("k-accordion")}static styles=css`
		:host {
			display: block;
			padding: 1rem;
			cursor: pointer;
		}
	`;render(){return html`<slot></slot>`}}export class AccordionPanel extends ShadowComponent{static properties={name:{type:String,reflect:!0},active:{type:Boolean,reflect:!0,converter:boolTrueFalse},transitioning:{type:Boolean,reflect:!0,converter:boolTrueFalse}};constructor(){super(),this.name="",this.active=!1,this.transitioning=!1}get accordion(){return this.closest("k-accordion")}static styles=css`
		:host {
			display: block;
			interpolate-size: allow-keywords;
			height: 0;
			overflow: hidden;
			transition: height var(--animation_ms, 256ms) ease-in-out;
		}
		:host([active="true"]) {
			height: max-content;
		}
	`;render(){return html`<slot></slot>`}}customElements.define("k-accordion",Accordion),customElements.define("k-accordion-header",AccordionHeader),customElements.define("k-accordion-panel",AccordionPanel);