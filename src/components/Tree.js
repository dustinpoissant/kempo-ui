import ShadowComponent from './ShadowComponent.js';
import { html, css, render } from '../lit-all.min.js';
import { boolExists } from '../utils/propConverters.js';
import './Icon.js';

export default class Tree extends ShadowComponent {
	/* Properties */
	static properties = {
		data: { type: Object },
		depth: { type: Number, reflect: true },
		editable: { type: Boolean, converter: boolExists, attribute: 'editable', reflect: true }
	}

	constructor(){
		super();
		this.data = null;
		this.depth = 0;
		this.editable = false;
	}

	/* Rendering */
	render(){
		if(!this.data){
			return html`<slot></slot>`;
		}

		if(typeof this.data === 'object' && this.data !== null){
			return html`
				<div class="tree-root">
					${(Array.isArray(this.data)
						? this.data.map((v, i) => [i, v])
						: Object.entries(this.data)
					).map(([key, value]) => Tree.renderValue(value, key, 1, this.depth))}
				</div>
			`;
		}

		return html`
			<div class="tree-root">
				${Tree.renderValue(this.data, null, 0, this.depth)}
			</div>
		`;
	}

	/* Leaf Definitions */
	static leafs = [];

	static addLeaf = (...leafs) => {
		leafs.forEach(leaf => Tree.leafs.unshift(leaf));
	};

	/* Static Methods */
	static renderValue(value, key = null, currentDepth = 0, maxDepth = 0){
		const LeafClass = Tree.leafs.find(leaf => leaf.detect(value));

		if(LeafClass){
			const wrapper = document.createElement('span');
			wrapper.className = 'd-b';
			if(key !== null){
				const keyLabel = document.createElement('span');
				keyLabel.className = typeof key === 'number' ? 'tc-muted' : '';
				keyLabel.textContent = `${key}: `;
				wrapper.appendChild(keyLabel);
			}
			const leaf = new LeafClass(value);
			const rendered = leaf.render();
			if(rendered instanceof Node){
				wrapper.appendChild(rendered);
			} else {
				const span = document.createElement('span');
				render(rendered, span);
				wrapper.appendChild(span);
			}
			return wrapper;
		}

		if(typeof value === 'object' && value !== null){
			const branch = new TreeBranch();
			branch.value = value;
			branch.key = key;
			branch.currentDepth = currentDepth;
			branch.maxDepth = maxDepth;
			return branch;
		}

		return html`<span class="d-b primitive">${key !== null ? html`<span class="${typeof key === 'number' ? 'tc-muted' : ''}">${key}: </span>` : ''}${value}</span>`;
	}
}

window.customElements.define('k-tree', Tree);

export class TreeBranch extends ShadowComponent {
	/* Properties */
	static properties = {
		value: { type: Object },
		key: { type: String },
		currentDepth: { type: Number },
		maxDepth: { type: Number },
		opened: { type: Boolean, converter: boolExists, reflect: true }
	};

	constructor(){
		super();
		this.value = null;
		this.key = null;
		this.currentDepth = 0;
		this.maxDepth = 0;
		this.opened = false;
	}

	/* Lifecycle */
	connectedCallback(){
		super.connectedCallback();
		if(this.currentDepth <= this.maxDepth){
			this.opened = true;
		}
	}

	/* Members */
	get tree(){
		return this.closest('k-tree');
	}

	/* Event Handlers */
	toggle = () => {
		this.opened = !this.opened;
	};

	/* Rendering */
	render(){
		const label = this.key !== null ? `${this.key}: ` : '';
		const type = Array.isArray(this.value) ? 'Array' : 'Object';

		return html`
			<div>
				<button class="branch-label no-btn" @click=${this.toggle} aria-expanded="${this.opened}">
					<k-icon name="chevron-right" class="toggle-icon ${this.opened ? 'opened' : ''}"></k-icon>
					${label}${type}
				</button>
				${this.opened ? html`
					<div class="pl">
						${this.value ? (Array.isArray(this.value)
							? this.value.map((v, i) => [i, v])
							: Object.entries(this.value)
						).map(([key, value]) => Tree.renderValue(value, key, this.currentDepth + 1, this.maxDepth)) : ''}
					</div>
				` : ''}
			</div>
		`;
	}

	static styles = css`
		:host{
			display: block;
		}
		.branch-label{
			display: block;
			width: 100%;
			cursor: pointer;
		}
		.branch-label:hover{
			background-color: var(--c_bg__alt, #f5f5f5);
		}
		.branch-label:focus{
			box-shadow: none;
		}
		.branch-label:focus-visible{
			box-shadow: var(--focus_shadow);
		}
		.toggle-icon{
			transition: transform var(--animation_ms, 200ms);
		}
		.toggle-icon.opened{
			transform: rotate(90deg);
		}
	`;
}

window.customElements.define('k-tree-branch', TreeBranch);

export class TreeLeaf {
	constructor(value = null){
		this.value = value;
	}

	/* Rendering */
	render(){
		return html`${this.value}`;
	}

	/* Static Methods */
	static detect = () => {
		return false;
	};
}

export class StringLeaf extends TreeLeaf {
	/* Rendering */
	render(){
		return html`<span class="tc-success">"${this.value}"</span>`;
	}

	/* Static Methods */
	static detect = value => typeof value === 'string';
}

export class NumberLeaf extends TreeLeaf {
	/* Rendering */
	render(){
		return html`<span class="tc-primary">${this.value}</span>`;
	}

	/* Static Methods */
	static detect = value => typeof value === 'number';
}

export class BooleanLeaf extends TreeLeaf {
	/* Rendering */
	render(){
		return html`<span class="${this.value ? 'tc-success' : 'tc-danger'}">${this.value}</span>`;
	}

	/* Static Methods */
	static detect = value => typeof value === 'boolean';
}

export class NullLeaf extends TreeLeaf {
	/* Rendering */
	render(){
		return html`<span class="tc-muted">null</span>`;
	}
	
	/* Static Methods */
	static detect = value => value === null;
}

export class UndefinedLeaf extends TreeLeaf {
	/* Rendering */
	render(){
		return html`<span class="tc-muted">undefined</span>`;
	}

	/* Static Methods */
	static detect = value => value === undefined;
}

Tree.addLeaf(UndefinedLeaf, NullLeaf, BooleanLeaf, NumberLeaf, StringLeaf);
