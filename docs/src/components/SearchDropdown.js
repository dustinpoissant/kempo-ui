import{html as e,css as t,nothing as s}from"../lit-all.min.js";import i from"./ShadowComponent.js";import a from"../utils/debounce.js";import"./Spinner.js";let r=0;export default class n extends i{static formAssociated=!0;static properties={value:{type:String,reflect:!0},name:{type:String,reflect:!0},placeholder:{type:String},opened:{type:Boolean,reflect:!0},searching:{type:Boolean,reflect:!0},required:{type:Boolean,reflect:!0},disabled:{type:Boolean,reflect:!0},readonly:{type:Boolean,reflect:!0},debounceMs:{type:Number,attribute:"debounce-ms"},minLength:{type:Number,attribute:"min-length"},noResultsMessage:{type:String,attribute:"no-results-message"},results:{state:!0},message:{state:!0}};#e="--search-dropdown-"+r++;#t=()=>{};#s=-1;#i="";constructor(){super(),this.internals=this.attachInternals(),this.value="",this.name="",this.placeholder="",this.opened=!1,this.searching=!1,this.required=!1,this.disabled=!1,this.readonly=!1,this.debounceMs=300,this.minLength=2,this.noResultsMessage="No results",this.results=null,this.message="",this.#a(300)}connectedCallback(){super.connectedCallback(),this.#i=this.value,document.addEventListener("click",this.handleDocumentClick)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("click",this.handleDocumentClick)}updated(e){super.updated(e);const t=this.shadowRoot?.querySelector("#menu");t&&!t.matches(":popover-open")&&t.showPopover(),e.has("debounceMs")&&this.#a(this.debounceMs),(e.has("value")||e.has("required"))&&this.#r()}formResetCallback(){this.clear(),this.value=this.#i,this.#r()}formStateRestoreCallback(e){this.value=e}formDisabledCallback(e){this.disabled=e}handleInput=e=>{if(!this.readonly){if(this.value=e.target.value,this.#s=-1,this.message="",this.value.trim().length<this.minLength)return this.results=null,this.searching=!1,void(this.opened=!1);this.opened=!0,this.searching=!0,this.#t(this.value.trim())}};handleKeydown=e=>{if(this.readonly)return;const t=this.#n.length;if("ArrowDown"===e.key){if(e.preventDefault(),!this.opened&&this.#o)return void(this.opened=!0);this.#s=Math.min(this.#s+1,t-1),this.requestUpdate(),this.#l()}else"ArrowUp"===e.key?(e.preventDefault(),this.#s=Math.max(this.#s-1,-1),this.requestUpdate(),this.#l()):"Enter"===e.key?(e.preventDefault(),this.opened&&this.#s>=0&&this.#s<t?this.#d(this.#n[this.#s],!0):(this.opened=!1,this.internals.form?.requestSubmit())):"Escape"===e.key?(e.preventDefault(),this.opened=!1,this.#s=-1):"Tab"===e.key&&(this.opened=!1,this.#s=-1)};handleFocus=()=>{this.readonly||this.value.trim().length<this.minLength||this.#o&&(this.opened=!0)};handleDocumentClick=e=>{e.composedPath().includes(this)||(this.opened=!1,this.#s=-1)};handleResultClick=e=>{const t=this.#n[Number(e.currentTarget.dataset.index)];this.#d(t,!1)||e.preventDefault()};setResults(e){return this.results=Array.isArray(e)?e.filter(e=>e&&"object"==typeof e):[],this.message="",this.searching=!1,this.#s=-1,this}setError(e){return this.results=null,this.message=String(e||"The search failed."),this.searching=!1,this.#s=-1,this}clear(){return this.value="",this.results=null,this.message="",this.searching=!1,this.opened=!1,this.#s=-1,this.#r(),this}focus(e){this.shadowRoot?.querySelector("input")?.focus(e)}#a(e){this.#t=a(e=>{this.dispatchEvent(new CustomEvent("search",{detail:{value:e},bubbles:!0,composed:!0}))},e)}#d(e,t){const s=this.dispatchEvent(new CustomEvent("select",{detail:{result:e},bubbles:!0,composed:!0,cancelable:!0}));return this.opened=!1,s&&t&&e.url&&location.assign(e.url),s}#r(){this.internals.setFormValue(this.value),this.required&&!this.value.trim()?this.internals.setValidity({valueMissing:!0},"Please fill out this field.",this.shadowRoot?.querySelector("input")):this.internals.setValidity({})}#l(){this.updateComplete.then(()=>{this.shadowRoot?.querySelector(".result.focused")?.scrollIntoView({block:"nearest"})})}get#n(){return this.results??[]}get#o(){return this.searching||null!==this.results||Boolean(this.message)}renderResult(t,i,a){const r=i===this.#s,n=e`
			<span class="title">${t.title||t.url||"Untitled"}</span>
			${t.description?e`<span class="description">${t.description}</span>`:s}
		`;return e`
			${t.group&&t.group!==a?.group?e`<div class="group">${t.group}</div>`:s}
			${t.url?e`
				<a id="result-${i}" role="option" aria-selected=${r} class="result ${r?"focused":""}" href=${t.url} data-index=${i} @click=${this.handleResultClick}>${n}</a>
			`:e`
				<div id="result-${i}" role="option" aria-selected=${r} class="result ${r?"focused":""}" data-index=${i} @click=${this.handleResultClick}>${n}</div>
			`}
		`}render(){const t=this.#n;return e`
			<input
				type="search"
				class="full"
				role="combobox"
				aria-expanded=${this.opened?"true":"false"}
				aria-autocomplete="list"
				aria-controls="menu"
				aria-activedescendant=${this.opened&&this.#s>=0?`result-${this.#s}`:s}
				.value=${this.value}
				placeholder=${this.placeholder}
				?disabled=${this.disabled}
				?readonly=${this.readonly}
				@input=${this.handleInput}
				@keydown=${this.handleKeydown}
				@focus=${this.handleFocus}
				autocomplete="off"
				style="anchor-name: ${this.#e}"
			/>
			${this.opened&&this.#o?e`
				<div id="menu" role="listbox" popover="manual" style="position-anchor: ${this.#e}">
					${t.map((e,s)=>this.renderResult(e,s,t[s-1]))}
					${this.message?e`<div class="message error">${this.message}</div>`:s}
					${0!==this.results?.length||this.searching?s:e`<div class="message">${this.noResultsMessage}</div>`}
					${this.searching?e`
						<div class="message searching">
							<k-spinner size="xs"></k-spinner>
							<span>Searching...</span>
						</div>
					`:s}
				</div>
			`:s}
		`}static styles=t`
		:host {
			display: block;
			position: relative;
		}
		:host([disabled]) {
			opacity: 0.5;
			pointer-events: none;
		}
		#menu {
			position: fixed;
			position-area: bottom span-right;
			position-try-fallbacks: flip-inline, flip-block, flip-block flip-inline;
			width: max(anchor-size(width), var(--min-width, 22rem));
			max-width: 90vw;
			max-height: 24rem;
			margin: 0.25rem 0;
			padding: 0;
			overflow-y: auto;
			color: inherit;
			background: var(--c_bg);
			border: 1px solid var(--c_border);
			border-radius: var(--radius);
			box-shadow: var(--drop_shadow);
		}
		.group {
			padding: var(--spacer_h) var(--spacer) var(--spacer_q);
			font-weight: bold;
			color: var(--tc_muted);
		}
		.result {
			display: block;
			padding: var(--spacer_h) var(--spacer);
			color: inherit;
			text-decoration: none;
			cursor: pointer;
			transition: background var(--animation_ms);
		}
		.result:hover,
		.result.focused {
			background: var(--c_bg__alt);
		}
		.title,
		.description {
			display: block;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.description {
			color: var(--tc_muted);
		}
		.message {
			padding: var(--spacer_h) var(--spacer);
			color: var(--tc_muted);
		}
		.message.error {
			color: var(--tc_danger);
		}
		.searching {
			display: flex;
			align-items: center;
			gap: 0.5rem;
		}
	`}customElements.define("k-search-dropdown",n);