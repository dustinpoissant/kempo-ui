import { LitElement, html, css } from '../lit-all.min.js';
import drag from '../utils/drag.js';

/*
	Sortable Container Component

	By default it is a vertical list whose items are moved in the DOM when dropped. `grid` is for items laid out in a row or a
	wrapping grid (the container is styled by whoever uses it), where the drop place is the nearest item and its side. `controlled`
	leaves the DOM alone: the `sort` event says where the item was dropped, and whatever renders the list renders the new order.
*/
export class Sortable extends LitElement {
	static properties = {
		grid: { type: Boolean, reflect: true },
		controlled: { type: Boolean, reflect: true }
	};

	constructor(){
		super();
		this.grid = false;
		this.controlled = false;
	}

	/*
		Methods
	*/
	getCursorElement(point = window.event){
		const items = Array.from(this.children).filter(child =>
			child.tagName === 'K-SORTABLE-ITEM' && !child.hasAttribute('sorting')
		);
		if(items.length === 0) return null;

		const cursorX = point.clientX;
		const cursorY = point.clientY;

		if(this.grid){
			let nearest = null;
			let nearestDistance = Infinity;
			for(const item of items){
				const rect = item.getBoundingClientRect();
				const distance = Math.hypot(Math.max(rect.left - cursorX, 0, cursorX - rect.right), Math.max(rect.top - cursorY, 0, cursorY - rect.bottom));
				if(distance < nearestDistance){
					nearest = item;
					nearestDistance = distance;
				}
				if(!distance) break;
			}
			const rect = nearest.getBoundingClientRect();
			return [nearest, cursorX < rect.left + rect.width / 2 ? 'before' : 'after'];
		}

		if(cursorY < items[0].getBoundingClientRect().top){
			return [items[0], 'before'];
		}
		if(cursorY > items[items.length - 1].getBoundingClientRect().bottom){
			return [items[items.length - 1], 'after'];
		}

		for(const item of items){
			const rect = item.getBoundingClientRect();
			const middleY = rect.top + rect.height / 2;
			if(cursorY < middleY){
				return [item, 'before'];
			} else if(cursorY < rect.bottom){
				return [item, 'after'];
			}
		}
		return null;
	}

	render(){
		return html`<slot></slot>`;
	}

	static styles = css`
		:host {
			display: block;
		}
	`;
}
customElements.define('k-sortable', Sortable);

/*
	Sortable Item Component

	With `bare` it has no handle, border or padding: the whole item is what is dragged (a press on a button, link or field inside
	it is that thing's, and a drag starts only after the pointer has moved a few pixels, so a click is still a click).
*/
export class SortableItem extends LitElement {
	static properties = {
		sorting: { type: Boolean, reflect: true },
		bare: { type: Boolean, reflect: true }
	};

	constructor(){
		super();
		this.cleanupDrag = null;
		this.sorting = false;
		this.bare = false;
	}

	/*
		Lifecycle Callbacks
	*/
	connectedCallback(){
		super.connectedCallback();
		if(this.shadowRoot?.getElementById('handle')) this.setupDrag();
	}

	firstUpdated(){
		this.setupDrag();
	}

	updated(changedProperties){
		super.updated(changedProperties);
		if(changedProperties.has('sorting') && !this.sorting){
			// Re-setup drag after sorting completes
			this.setupDrag();
		}
		if(changedProperties.has('bare') && changedProperties.get('bare') !== undefined){
			this.setupDrag();
		}
	}

	disconnectedCallback(){
		super.disconnectedCallback();
		if(this.cleanupDrag){
			this.cleanupDrag();
			this.cleanupDrag = null;
		}
	}

	/*
		Methods
	*/
	setupDrag(){
		if(this.cleanupDrag){
			this.cleanupDrag();
		}
		const element = this.bare ? this : this.shadowRoot.getElementById('handle');
		if(element){
			this.cleanupDrag = drag({
				element,
				startCallback: this.handleDragStart,
				moveCallback: this.handleDragMove,
				endCallback: this.handleDragEnd,
				threshold: this.bare ? 4 : 0,
				ignore: 'button, a, input, select, textarea, [data-no-drag]'
			});
		}
	}

	/*
		Event Handlers
	*/
	handleDragStart = () => {
		this.sorting = true;
		this.toggleAttribute('grid', !!this.sortable?.grid);
	};

	handleDragMove = ({ x, y, clientX, clientY }) => {
		this.style.transform = `translate(${this.sortable.grid ? x : 0}px, ${y}px)`;
		this.style.zIndex = '9999';
		const [target, position] = this.sortable.getCursorElement({ clientX, clientY }) ?? [];
		Array.from(this.sortable.children).forEach(child => {
			child.classList.remove('target-before', 'target-after');
		});
		if(target){
			target.classList.add(`target-${position}`);
		}
	};

	handleDragEnd = ({ clientX, clientY }) => {
		const sortable = this.sortable;
		const [target, position] = sortable.getCursorElement({ clientX, clientY }) ?? [];
		this.sorting = false;
		this.style.transform = '';
		this.style.zIndex = '';
		Array.from(sortable.children).forEach(child => {
			child.classList.remove('target-before', 'target-after');
		});
		if(!target) return;
		const items = Array.from(sortable.children).filter(child => child.tagName === 'K-SORTABLE-ITEM');
		const from = items.indexOf(this);
		let to = items.indexOf(target) + (position === 'after' ? 1 : 0);
		if(from < to) to -= 1;
		if(!sortable.controlled){
			if(position === 'before'){
				sortable.insertBefore(this, target);
			} else if(position === 'after'){
				sortable.insertBefore(this, target.nextSibling);
			}
		}
		sortable.dispatchEvent(new CustomEvent('sort', {
			detail: { item: this, from, to },
			bubbles: true
		}));
	};

	/*
		Getters
	*/
	get sortable(){
		return this.closest('k-sortable');
	}

	/*
		Rendering
	*/
	render(){
		return html`
			<div id="handle">
				<k-icon name="drag-handle"></k-icon>
			</div>
			<div id="content" class="p pl0">
				<slot></slot>
			</div>
		`;
	}

	static styles = css`
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
	`;
}
customElements.define('k-sortable-item', SortableItem);
