import{LitElement as t,html as e,css as r}from"../lit-all.min.js";import o from"../utils/drag.js";export class Sortable extends t{static properties={grid:{type:Boolean,reflect:!0},controlled:{type:Boolean,reflect:!0}};constructor(){super(),this.grid=!1,this.controlled=!1}getCursorElement(t=window.event){const e=Array.from(this.children).filter(t=>"K-SORTABLE-ITEM"===t.tagName&&!t.hasAttribute("sorting"));if(0===e.length)return null;const r=t.clientX,o=t.clientY;if(this.grid){let t=null,a=1/0;for(const s of e){const e=s.getBoundingClientRect(),i=Math.hypot(Math.max(e.left-r,0,r-e.right),Math.max(e.top-o,0,o-e.bottom));if(i<a&&(t=s,a=i),!i)break}const s=t.getBoundingClientRect();return[t,r<s.left+s.width/2?"before":"after"]}if(o<e[0].getBoundingClientRect().top)return[e[0],"before"];if(o>e[e.length-1].getBoundingClientRect().bottom)return[e[e.length-1],"after"];for(const t of e){const e=t.getBoundingClientRect();if(o<e.top+e.height/2)return[t,"before"];if(o<e.bottom)return[t,"after"]}return null}render(){return e`<slot></slot>`}static styles=r`
		:host {
			display: block;
		}
	`}customElements.define("k-sortable",Sortable);export class SortableItem extends t{static properties={sorting:{type:Boolean,reflect:!0},bare:{type:Boolean,reflect:!0}};constructor(){super(),this.cleanupDrag=null,this.sorting=!1,this.bare=!1}connectedCallback(){super.connectedCallback(),this.shadowRoot?.getElementById("handle")&&this.setupDrag()}firstUpdated(){this.setupDrag()}updated(t){super.updated(t),t.has("sorting")&&!this.sorting&&this.setupDrag(),t.has("bare")&&void 0!==t.get("bare")&&this.setupDrag()}disconnectedCallback(){super.disconnectedCallback(),this.cleanupDrag&&(this.cleanupDrag(),this.cleanupDrag=null)}setupDrag(){this.cleanupDrag&&this.cleanupDrag();const t=this.bare?this:this.shadowRoot.getElementById("handle");t&&(this.cleanupDrag=o({element:t,startCallback:this.handleDragStart,moveCallback:this.handleDragMove,endCallback:this.handleDragEnd,threshold:this.bare?4:0,ignore:"button, a, input, select, textarea, [data-no-drag]"}))}handleDragStart=()=>{this.sorting=!0,this.toggleAttribute("grid",!!this.sortable?.grid)};handleDragMove=({x:t,y:e,clientX:r,clientY:o})=>{this.style.transform=`translate(${this.sortable.grid?t:0}px, ${e}px)`,this.style.zIndex="9999";const[a,s]=this.sortable.getCursorElement({clientX:r,clientY:o})??[];Array.from(this.sortable.children).forEach(t=>{t.classList.remove("target-before","target-after")}),a&&a.classList.add(`target-${s}`)};handleDragEnd=({clientX:t,clientY:e})=>{const r=this.sortable,[o,a]=r.getCursorElement({clientX:t,clientY:e})??[];if(this.sorting=!1,this.style.transform="",this.style.zIndex="",Array.from(r.children).forEach(t=>{t.classList.remove("target-before","target-after")}),!o)return;const s=Array.from(r.children).filter(t=>"K-SORTABLE-ITEM"===t.tagName),i=s.indexOf(this);let n=s.indexOf(o)+("after"===a?1:0);i<n&&(n-=1),r.controlled||("before"===a?r.insertBefore(this,o):"after"===a&&r.insertBefore(this,o.nextSibling)),r.dispatchEvent(new CustomEvent("sort",{detail:{item:this,from:i,to:n},bubbles:!0}))};get sortable(){return this.closest("k-sortable")}render(){return e`
			<div id="handle">
				<k-icon name="drag-handle"></k-icon>
			</div>
			<div id="content" class="p pl0">
				<slot></slot>
			</div>
		`}static styles=r`
		:host {
			display: flex;
			align-items: center;
			border: 1px solid var(--c_border);
			user-select: none;
			position: relative;
		}
		:host([sorting]){
			opacity: 0.8;
		}
		:host([bare]) {
			display: block;
			border: 0;
			cursor: grab;
			touch-action: none;
		}
		:host([bare][sorting]) {
			cursor: grabbing;
		}
		:host([bare]) #handle {
			display: none;
		}
		:host([bare]) #content {
			padding: 0;
		}
		#handle {
			display: inline-block;
			cursor: pointer;
			padding: var(--spacer);
		}
		#content {
			flex: 1;
			min-width: 0;
		}
		:host(.target-before)::before,
		:host(.target-after)::after {
			content: '';
			position: absolute;
			left: 0;
			right: 0;
			height: 4px;
			background-color: var(--c_primary);
		}
		:host(.target-before)::before {
			top: -2px;
		}
		:host(.target-after)::after {
			bottom: -2px;
		}
		:host([grid].target-before)::before,
		:host([grid].target-after)::after {
			top: 0;
			bottom: 0;
			left: auto;
			right: auto;
			width: 4px;
			height: auto;
		}
		:host([grid].target-before)::before {
			left: -4px;
		}
		:host([grid].target-after)::after {
			right: -4px;
		}
	`}customElements.define("k-sortable-item",SortableItem);