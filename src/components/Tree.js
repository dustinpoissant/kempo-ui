import ShadowComponent from './ShadowComponent.js';
import { html, css } from '../lit-all.min.js';
import { boolExists } from '../utils/propConverters.js';

export default class Tree extends ShadowComponent {
	/* Properties */
	static properties = {
		data: { type: Object },
		editable: { type: Boolean, converter: boolExists, attribute: 'editable', reflect: true }
	}

	constructor(){
		super();
		this.data = null;
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
					).map(([key, value]) => Tree.renderValue(value, key))}
				</div>
			`;
		}

		return html`
			<div class="tree-root">
				${Tree.renderValue(this.data)}
			</div>
		`;
	}

	/* Leaf Definitions */
	static leafs = [];

	static addLeaf = (...leafs) => {
		leafs.forEach(leaf => Tree.leafs.unshift(leaf));
	};

	/* Static Methods */
	static renderValue(value, key = null){
		const LeafClass = Tree.leafs.find(leaf => leaf.detect(value));

		if(LeafClass){
			const leaf = document.createElement(LeafClass.tagName);
			leaf.value = value;
			leaf.key = key;
			return leaf;
		}

		if(typeof value === 'object' && value !== null){
			const branch = document.createElement('k-tree-branch');
			branch.value = value;
			branch.key = key;
			return branch;
		}

		return html`<span class="primitive">${key !== null ? `${key}: ` : ''}${value}</span>`;
	}
}

window.customElements.define('k-tree', Tree);

export class TreeBranch extends ShadowComponent {
	/* Properties */
	static properties = {
		value: { type: Object },
		key: { type: String },
		opened: { type: Boolean, converter: boolExists, reflect: true }
	};

	constructor(){
		super();
		this.value = null;
		this.key = null;
		this.opened = false;
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
			<div class="branch">
				<div class="branch-label" @click=${this.toggle}>
					<span class="toggle">${this.opened ? '▼' : '▶'}</span>
					${label}${type}
				</div>
				${this.opened ? html`
					<div class="branch-content">
						${this.value ? (Array.isArray(this.value)
							? this.value.map((v, i) => [i, v])
							: Object.entries(this.value)
						).map(([key, value]) => Tree.renderValue(value, key)) : ''}
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
			cursor: pointer;
			padding: 2px 4px;
		}
		.branch-label:hover{
			background-color: var(--c_bg__alt, #f5f5f5);
		}
		.toggle{
			display: inline-block;
			width: 1rem;
		}
		.branch-content{
			margin-left: 1.5rem;
		}
	`;
}

window.customElements.define('k-tree-branch', TreeBranch);
export class TreeLeaf extends ShadowComponent {
	/* Properties */
	static properties = {
		value: {},
		key: { type: String },
		opened: { reflect: true, type: Boolean, converter: boolExists }
	};

	constructor(){
		super();
		this.value = null;
		this.key = null;
		this.opened = false;
	}

	/* Members */
	get tree(){
		return this.closest('k-tree');
	}

	/* Rendering */
	render(){
		const label = this.key !== null ? html`<span class="tc-muted">${this.key}: </span>` : '';
		return html`${label}<slot></slot>`;
	}

	/* Static Methods */
	static detect = () => {
		return false;
	};
}

window.customElements.define('k-tree-leaf', TreeLeaf);

export class StringLeaf extends TreeLeaf {
	/* Rendering */
	render(){
		const label = this.key !== null ? html`<span class="tc-muted">${this.key}: </span>` : '';
		return html`<span class="d-b">${label}<span class="tc-success">"${this.value}"</span></span>`;
	}

	static detect = value => typeof value === 'string';

	static tagName = 'k-tree-string-leaf';
}

window.customElements.define(StringLeaf.tagName, StringLeaf);

export class NumberLeaf extends TreeLeaf {
	/* Rendering */
	render(){
		const label = this.key !== null ? html`<span class="tc-muted">${this.key}: </span>` : '';
		return html`<span class="d-b">${label}<span class="tc-primary">${this.value}</span></span>`;
	}

	static detect = value => typeof value === 'number';

	static tagName = 'k-tree-number-leaf';
}

window.customElements.define(NumberLeaf.tagName, NumberLeaf);

export class BooleanLeaf extends TreeLeaf {
	/* Rendering */
	render(){
		const label = this.key !== null ? html`<span class="tc-muted">${this.key}: </span>` : '';
		return html`<span class="d-b">${label}<span class="${this.value ? 'tc-success' : 'tc-danger'}">${this.value}</span></span>`;
	}

	static detect = value => typeof value === 'boolean';

	static tagName = 'k-tree-boolean-leaf';
}

window.customElements.define(BooleanLeaf.tagName, BooleanLeaf);

export class NullLeaf extends TreeLeaf {
	/* Rendering */
	render(){
		const label = this.key !== null ? html`<span class="tc-muted">${this.key}: </span>` : '';
		return html`<span class="d-b">${label}<span class="tc-muted">null</span></span>`;
	}

	static detect = value => value === null;

	static tagName = 'k-tree-null-leaf';
}

window.customElements.define(NullLeaf.tagName, NullLeaf);

export class UndefinedLeaf extends TreeLeaf {
	/* Rendering */
	render(){
		const label = this.key !== null ? html`<span class="tc-muted">${this.key}: </span>` : '';
		return html`<span class="d-b">${label}<span class="tc-muted">undefined</span></span>`;
	}

	static detect = value => value === undefined;

	static tagName = 'k-tree-undefined-leaf';
}

window.customElements.define(UndefinedLeaf.tagName, UndefinedLeaf);

Tree.addLeaf(UndefinedLeaf, NullLeaf, BooleanLeaf, NumberLeaf, StringLeaf);
