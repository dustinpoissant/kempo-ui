import ShadowComponent from"./ShadowComponent.js";import{html,css,render}from"../lit-all.min.js";import{boolExists}from"../utils/propConverters.js";import"./Icon.js";export default class Tree extends ShadowComponent{static properties={data:{type:Object},depth:{type:Number,reflect:!0},editable:{type:Boolean,converter:boolExists,attribute:"editable",reflect:!0}};constructor(){super(),this.data=null,this.depth=0,this.editable=!1}render(){return this.data?"object"==typeof this.data&&null!==this.data?html`
				<div class="tree-root">
					${(Array.isArray(this.data)?this.data.map((e,t)=>[t,e]):Object.entries(this.data)).map(([e,t])=>Tree.renderValue(t,e,1,this.depth))}
				</div>
			`:html`
			<div class="tree-root">
				${Tree.renderValue(this.data,null,0,this.depth)}
			</div>
		`:html`<slot></slot>`}static leafs=[];static addLeaf=(...e)=>{e.forEach(e=>Tree.leafs.unshift(e))};static renderValue(e,t=null,s=0,r=0){const a=Tree.leafs.find(t=>t.detect(e));if(a){const s=document.createElement("span");if(s.className="d-b",null!==t){const e=document.createElement("span");e.className="number"==typeof t?"tc-muted":"",e.textContent=`${t}: `,s.appendChild(e)}const r=new a(e).render();if(r instanceof Node)s.appendChild(r);else{const e=document.createElement("span");render(r,e),s.appendChild(e)}return s}if("object"==typeof e&&null!==e){const a=new TreeBranch;return a.value=e,a.key=t,a.currentDepth=s,a.maxDepth=r,a}return html`<span class="d-b primitive">${null!==t?html`<span class="${"number"==typeof t?"tc-muted":""}">${t}: </span>`:""}${e}</span>`}}window.customElements.define("k-tree",Tree);export class TreeBranch extends ShadowComponent{static properties={value:{type:Object},key:{type:String},currentDepth:{type:Number},maxDepth:{type:Number},opened:{type:Boolean,converter:boolExists,reflect:!0}};constructor(){super(),this.value=null,this.key=null,this.currentDepth=0,this.maxDepth=0,this.opened=!1}connectedCallback(){super.connectedCallback(),this.currentDepth<=this.maxDepth&&(this.opened=!0)}get tree(){return this.closest("k-tree")}toggle=()=>{this.opened=!this.opened};render(){const e=null!==this.key?`${this.key}: `:"",t=Array.isArray(this.value)?"Array":"Object";return html`
			<div>
				<div class="branch-label" @click=${this.toggle}>
					<k-icon name="chevron-right" class="toggle-icon ${this.opened?"opened":""}"></k-icon>
					${e}${t}
				</div>
				${this.opened?html`
					<div class="pl">
						${this.value?(Array.isArray(this.value)?this.value.map((e,t)=>[t,e]):Object.entries(this.value)).map(([e,t])=>Tree.renderValue(t,e,this.currentDepth+1,this.maxDepth)):""}
					</div>
				`:""}
			</div>
		`}static styles=css`
		:host{
			display: block;
		}
		.branch-label{
			cursor: pointer;
		}
		.branch-label:hover{
			background-color: var(--c_bg__alt, #f5f5f5);
		}
		.toggle-icon{
			transition: transform var(--animation_ms, 200ms);
		}
		.toggle-icon.opened{
			transform: rotate(90deg);
		}
	`}window.customElements.define("k-tree-branch",TreeBranch);export class TreeLeaf{constructor(e=null){this.value=e}render(){return html`${this.value}`}static detect=()=>!1}export class StringLeaf extends TreeLeaf{render(){return html`<span class="tc-success">"${this.value}"</span>`}static detect=e=>"string"==typeof e}export class NumberLeaf extends TreeLeaf{render(){return html`<span class="tc-primary">${this.value}</span>`}static detect=e=>"number"==typeof e}export class BooleanLeaf extends TreeLeaf{render(){return html`<span class="${this.value?"tc-success":"tc-danger"}">${this.value}</span>`}static detect=e=>"boolean"==typeof e}export class NullLeaf extends TreeLeaf{render(){return html`<span class="tc-muted">null</span>`}static detect=e=>null===e}export class UndefinedLeaf extends TreeLeaf{render(){return html`<span class="tc-muted">undefined</span>`}static detect=e=>void 0===e}Tree.addLeaf(UndefinedLeaf,NullLeaf,BooleanLeaf,NumberLeaf,StringLeaf);