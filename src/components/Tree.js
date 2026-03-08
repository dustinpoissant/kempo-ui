import ShadowComponent from './ShadowComponent.js';
import { html, css } from '../lit-all.min.js';
import { boolExists } from '../utils/propConverters.js';
import './Icon.js';

let nodeTagCounter = 0;

export default class Tree extends ShadowComponent {
	/* Properties */
	static properties = {
		data: { type: Object },
		depth: { type: Number, reflect: true },
		editable: { type: Boolean, converter: boolExists, attribute: 'editable', reflect: true }
	};

	constructor(){
		super();
		this.data = null;
		this.depth = 0;
		this.editable = false;
	}

	/* Rendering */
	render(){
		if(this.data === null || this.data === undefined) return html`<slot></slot>`;
		if(Tree.nodes.find(n => n.detect(this.data))){
			return html`
				<div class="tree-root">
					${Tree.renderValue(this.data, null, 0, this.depth)}
				</div>
			`;
		}
		const entries = Array.isArray(this.data)
			? this.data.map((v, i) => [i, v])
			: typeof this.data === 'object'
				? Object.entries(this.data)
				: null;
		return html`
			<div class="tree-root">
				${entries
					? entries.map(([key, value]) => Tree.renderValue(value, key, 1, this.depth))
					: Tree.renderValue(this.data, null, 0, this.depth)}
			</div>
		`;
	}

	/* Node Registry */
	static nodes = [];

	static addNode = (...nodes) => {
		[...nodes].reverse().forEach(node => {
			if(!Object.prototype.hasOwnProperty.call(node, 'nodeTag')){
				node.nodeTag = `k-tree-node-${nodeTagCounter++}`;
				window.customElements.define(node.nodeTag, node);
			}
			Tree.nodes.unshift(node);
		});
	};

	/* Static Methods */
	static renderValue(value, key = null, depth = 0, maxDepth = 0){
		const NodeClass = Tree.nodes.find(n => n.detect(value));
		if(NodeClass && NodeClass.prototype.getChildren === TreeNode.prototype.getChildren){
			const keyLabel = key !== null
				? html`<span class="${typeof key === 'number' ? 'tc-muted' : ''}">${key}: </span>`
				: '';
			return html`<span class="d-b">${keyLabel}${new NodeClass(value).renderLabel()}</span>`;
		}
		const el = document.createElement((NodeClass ?? TreeNode).nodeTag);
		el.value = value;
		el.key = key;
		el.depth = depth;
		el.maxDepth = maxDepth;
		return el;
	}
}

window.customElements.define('k-tree', Tree);

export class TreeNode extends ShadowComponent {
	static nodeTag = 'k-tree-node';

	/* Properties */
	static properties = {
		value: { type: Object },
		key: { attribute: false },
		depth: { type: Number },
		maxDepth: { type: Number },
		opened: { type: Boolean, converter: boolExists, reflect: true },
		icon: { type: String }
	};

	constructor(value){
		super();
		this.value = value !== undefined ? value : null;
		this.key = null;
		this.depth = 0;
		this.maxDepth = 0;
		this.opened = false;
		this.icon = null;
	}

	/* Lifecycle */
	connectedCallback(){
		super.connectedCallback();
		if(this.depth <= this.maxDepth) this.opened = true;
	}

	/* Members */
	get tree(){ return this.closest('k-tree'); }

	/* Event Handlers */
	toggle = () => { this.opened = !this.opened; };

	/* Rendering */
	renderLabel(){
		if(typeof this.value === 'object' && this.value !== null){
			return html`${Array.isArray(this.value) ? 'Array' : 'Object'}`;
		}
		return html`${this.value}`;
	}

	getChildren(){
		if(typeof this.value !== 'object' || this.value === null) return null;
		return Array.isArray(this.value)
			? this.value.map((v, i) => [i, v])
			: Object.entries(this.value);
	}

	renderIcon(){
		if(this.icon) return html`<k-icon name="${this.icon}"></k-icon>`;
		return html`<k-icon name="chevron" class="toggle-icon" direction="${this.opened ? 'down' : 'right'}"></k-icon>`;
	}

	render(){
		const children = this.getChildren();
		const keyLabel = this.key !== null
			? html`<span class="${typeof this.key === 'number' ? 'tc-muted' : ''}">${this.key}: </span>`
			: '';

		if(!children){
			return html`<span class="d-b">${keyLabel}${this.renderLabel()}</span>`;
		}

		return html`
			<div>
				<button class="branch-label no-btn" @click=${this.toggle} aria-expanded="${this.opened}">
					${this.renderIcon()}
					${keyLabel}${this.renderLabel()}
				</button>
				${this.opened ? html`
					<div class="pl">
						${children.map(([k, v]) => Tree.renderValue(v, k, this.depth + 1, this.maxDepth))}
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
		.branch-label:focus{
			box-shadow: none;
		}
		.branch-label:focus-visible{
			box-shadow: var(--focus_shadow);
		}
	`;

	static detect = () => false;
}

window.customElements.define('k-tree-node', TreeNode);

export class StringNode extends TreeNode {
	renderLabel(){ return html`<span class="tc-success">"${this.value}"</span>`; }
	static detect = v => typeof v === 'string';
}

export class NumberNode extends TreeNode {
	renderLabel(){ return html`<span class="tc-primary">${this.value}</span>`; }
	static detect = v => typeof v === 'number';
}

export class BooleanNode extends TreeNode {
	renderLabel(){ return html`<span class="${this.value ? 'tc-success' : 'tc-danger'}">${this.value}</span>`; }
	static detect = v => typeof v === 'boolean';
}

export class NullNode extends TreeNode {
	renderLabel(){ return html`<span class="tc-muted">null</span>`; }
	static detect = v => v === null;
}

export class UndefinedNode extends TreeNode {
	renderLabel(){ return html`<span class="tc-muted">undefined</span>`; }
	static detect = v => v === undefined;
}

Tree.addNode(StringNode, NumberNode, BooleanNode, NullNode, UndefinedNode);

