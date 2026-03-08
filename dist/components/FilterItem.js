import ShadowComponent from"./ShadowComponent.js";import{html,css}from"../lit-all.min.js";export default class FilterItem extends ShadowComponent{render(){return html`<slot></slot>`}static styles=css`
		:host {
			display: contents;
		}
		:host([hidden]) {
			display: none !important;
		}
	`}customElements.define("k-filter-item",FilterItem);