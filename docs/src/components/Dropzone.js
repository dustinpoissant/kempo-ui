import{html as e,css as t}from"../lit-all.min.js";import r from"./ShadowComponent.js";import{boolExists as a}from"../utils/propConverters.js";import"./Icon.js";export default class i extends r{static formAssociated=!0;static properties={accept:{type:String,reflect:!0},multiple:{type:Boolean,reflect:!0,converter:a},disabled:{type:Boolean,reflect:!0,converter:a},readonly:{type:Boolean,reflect:!0,converter:a},required:{type:Boolean,reflect:!0,converter:a},name:{type:String,reflect:!0},label:{type:String},dragging:{type:Boolean,reflect:!0,converter:a}};#e=[];constructor(){super(),this.internals=this.attachInternals(),this.accept="",this.multiple=!1,this.disabled=!1,this.readonly=!1,this.required=!1,this.name="",this.label="",this.dragging=!1,this.dragDepth=0}updated(e){super.updated(e),(e.has("name")||e.has("required"))&&this.updateFormValue()}formResetCallback(){this.#e=[],this.updateFormValue()}formDisabledCallback(e){this.disabled=e}get files(){return[...this.#e]}open(){this.disabled||this.readonly||this.renderRoot.querySelector("#input")?.click()}handleKeydown=e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this.open())};handleDragEnter=e=>{e.preventDefault(),this.disabled||this.readonly||(this.dragDepth++,this.dragging=!0)};handleDragOver=e=>{e.preventDefault(),e.dataTransfer&&(e.dataTransfer.dropEffect=this.disabled||this.readonly?"none":"copy")};handleDragLeave=()=>{this.dragDepth=Math.max(0,this.dragDepth-1),this.dragDepth||(this.dragging=!1)};handleDrop=e=>{e.preventDefault(),this.dragDepth=0,this.dragging=!1,this.disabled||this.readonly||this.collect([...e.dataTransfer?.files??[]])};handleInput=e=>{this.collect([...e.target.files]),e.target.value=""};collect(e){const t=[],r=[];e.forEach(e=>{!((e,t)=>{const r=t.split(",").map(e=>e.trim().toLowerCase()).filter(Boolean);if(!r.length)return!0;const a=e.name.toLowerCase(),i=(e.type||"").toLowerCase();return r.some(e=>e.startsWith(".")?a.endsWith(e):e.endsWith("/*")?i.startsWith(e.slice(0,-1)):i===e)})(e,this.accept)||!this.multiple&&t.length?r.push(e):t.push(e)}),t.length&&(this.#e=t,this.updateFormValue()),this.dispatchEvent(new CustomEvent("files",{detail:{files:t,rejected:r},bubbles:!0,composed:!0}))}updateFormValue(){const e=new FormData;this.#e.forEach(t=>e.append(this.name,t)),this.internals.setFormValue(this.name&&this.#e.length?e:null),this.internals.setValidity(this.required&&!this.#e.length?{valueMissing:!0}:{},"Please choose a file.",this.renderRoot.querySelector("#zone"))}get defaultLabel(){return this.multiple?"Drag and drop files here, or click to choose them":"Drag and drop a file here, or click to choose one"}render(){return e`
			<div
				id="zone"
				part="zone"
				role="button"
				tabindex=${this.disabled?"-1":"0"}
				aria-disabled=${this.disabled?"true":"false"}
				@click=${()=>this.open()}
				@keydown=${this.handleKeydown}
				@dragenter=${this.handleDragEnter}
				@dragover=${this.handleDragOver}
				@dragleave=${this.handleDragLeave}
				@drop=${this.handleDrop}
			>
				<slot>
					<k-icon name="upload"></k-icon>
					<span>${this.label||this.defaultLabel}</span>
				</slot>
			</div>
			<input id="input" type="file" accept=${this.accept} ?multiple=${this.multiple} tabindex="-1" style="display: none" @change=${this.handleInput} />
		`}static styles=t`
		:host {
			display: block;
		}
		:host([disabled]) {
			opacity: 0.5;
			pointer-events: none;
		}
		:host([readonly]) {
			opacity: 0.75;
		}
		:host([readonly]) #zone {
			pointer-events: none;
		}
		#zone {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: var(--spacer_h);
			padding: calc(var(--spacer) * 2) var(--spacer);
			border: 2px dashed var(--c_border);
			border-radius: var(--radius);
			color: var(--tc_muted);
			text-align: center;
			cursor: pointer;
			transition: border-color var(--animation_ms), background var(--animation_ms), color var(--animation_ms);
		}
		#zone:hover,
		#zone:focus-visible {
			outline: none;
			border-color: var(--c_primary);
			color: var(--tc);
		}
		:host([dragging]) #zone {
			border-color: var(--c_primary);
			background: var(--c_bg__alt);
			color: var(--tc);
		}
	`}window.customElements.define("k-dropzone",i);