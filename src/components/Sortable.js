import { LitElement, html, css } from '../lit-all.min.js';
import drag from '../utils/drag.js';

/*
	Sortable Container Component
*/
export class Sortable extends LitElement {
	getCursorElement(){
		const items = Array.from(this.children).filter(child => 
			child.tagName === 'K-SORTABLE-ITEM' && !child.hasAttribute('sorting')
		);
		if(items.length === 0) return null;

		const cursorY = event.clientY;
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
*/
export class SortableItem extends LitElement {
	static properties = {
		sorting: { type: Boolean, reflect: true }
	};

	constructor(){
		super();
		this.cleanupDrag = null;
	}

	/*
		Lifecycle Callbacks
	*/
	firstUpdated(){
		this.setupDrag();
	}

	updated(changedProperties){
		super.updated(changedProperties);
		if(changedProperties.has('sorting') && !this.sorting){
			// Re-setup drag after sorting completes
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
		const handle = this.shadowRoot.getElementById('handle');
		if(handle){
			this.cleanupDrag = drag({
				element: handle,
				startCallback: this.handleDragStart,
				moveCallback: this.handleDragMove,
				endCallback: this.handleDragEnd
			});
		}
	}

	/*
		Event Handlers
	*/
	handleDragStart = () => {
		this.sorting = true;
	};

	handleDragMove = ({y}) => {
		this.style.transform = `translateY(${y}px)`;
		this.style.zIndex = '9999';
		const [target, position] = this.sortable.getCursorElement();
		Array.from(this.sortable.children).forEach(child => {
			child.classList.remove('target-before', 'target-after');
		});
		if(target){
			target.classList.add(`target-${position}`);
		}
	};

	handleDragEnd = () => {
		this.sorting = false;
		this.style.transform = '';
		this.style.zIndex = '';
		const [target, position] = this.sortable.getCursorElement();
		Array.from(this.sortable.children).forEach(child => {
			child.classList.remove('target-before', 'target-after');
		});
		if(target){
			if(position === 'before'){
				this.sortable.insertBefore(this, target);
			} else if(position === 'after'){
				this.sortable.insertBefore(this, target.nextSibling);
			}
			this.sortable.dispatchEvent(new CustomEvent('sort', { bubbles: true }));
		}
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
			display: block;
			border: 1px solid var(--c_border);
			user-select: none;
			position: relative;
		}
		:host([sorting]){
			opacity: 0.8;
		}
		#handle {
			display: inline-block;
			cursor: pointer;
			padding: var(--spacer);
		}
		#content {
			display: inline-block;
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
	`;
}
customElements.define('k-sortable-item', SortableItem);
