import ShadowComponent from"./ShadowComponent.js";import{html,css}from"../lit-all.min.js";export default class FilterList extends ShadowComponent{render(){return html`<slot></slot>`}filter(t){const e=t.toLowerCase().split(/\s+/).filter(t=>t.length>0);this.querySelectorAll("k-filter-item").forEach(t=>{const s=(t.getAttribute("filter-keywords")||"").toLowerCase();t.hidden=e.length>0&&!e.every(t=>s.includes(t))})}static styles=css`
		:host {
			display: block;
		}
	`}customElements.define("k-filter-list",FilterList);