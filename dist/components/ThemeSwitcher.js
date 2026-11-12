import e from"./ShadowComponent.js";import{html as t,css as s,nothing as i}from"../lit-all.min.js";import a from"../utils/theme.js";import"./Icon.js";const r={auto:"mode-auto",light:"mode-light",dark:"mode-dark"},o=e=>e.split(",").map(e=>e.trim()).filter(Boolean),n=e=>e.charAt(0).toUpperCase()+e.slice(1);export default class l extends e{static formAssociated=!0;static properties={currentTheme:{type:String,reflect:!0,attribute:"current-theme"},name:{type:String,reflect:!0},disabled:{type:Boolean,reflect:!0},readonly:{type:Boolean,reflect:!0},mode:{type:String,reflect:!0},options:{type:String,reflect:!0},labels:{type:String,reflect:!0},resolvedMode:{type:String,state:!0},resolvedLabels:{type:Array,state:!0}};constructor(){super(),this.internals=this.attachInternals(),this.currentTheme=a.get(),this.name="",this.disabled=!1,this.readonly=!1,this.initialValue="",this.mode="auto",this.options="light, auto, dark",this.labels=null,this.resolvedMode="segmented",this.resolvedLabels=null}#e=null;handleAsideStateChange=e=>{"auto"===this.mode&&(this.resolvedMode="collapsed"===e.detail.state?"toggle":"segmented"),this.resolveLabels()};resolveMode=()=>{"toggle"!==this.mode&&"segmented"!==this.mode?this.#e?this.resolvedMode="collapsed"===this.#e.state?"toggle":"segmented":this.resolvedMode="segmented":this.resolvedMode=this.mode};resolveLabels=()=>{if(null===this.labels||void 0===this.labels||this.#e&&"collapsed"===this.#e.state)return void(this.resolvedLabels=null);const e=o(this.options);if(""===this.labels)this.resolvedLabels=e.map(n);else{const t=o(this.labels);this.resolvedLabels=e.map((e,s)=>t[s]??n(e))}};handleClick=()=>{if(this.disabled||this.readonly)return;const e=o(this.options);if(0===e.length)return;const t=e.indexOf(a.get());a.set(e[(t+1)%e.length])};handleSegmentClick=e=>{this.disabled||this.readonly||a.set(e)};formResetCallback(){a.set(this.initialValue)}formStateRestoreCallback(e){a.set(e||this.initialValue)}formDisabledCallback(e){this.disabled=e}connectedCallback(){super.connectedCallback(),this.initialValue=a.get(),this.unsubscribe=a.subscribe(e=>{this.currentTheme=e}),this.#e=this.closest("k-aside"),this.#e&&this.#e.addEventListener("aside_state_change",this.handleAsideStateChange),this.resolveMode(),this.resolveLabels()}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe&&this.unsubscribe(),this.#e&&(this.#e.removeEventListener("aside_state_change",this.handleAsideStateChange),this.#e=null)}updated(e){super.updated(e),this.internals.setFormValue(this.currentTheme||null),e.has("mode")&&this.resolveMode(),(e.has("labels")||e.has("options"))&&this.resolveLabels()}static styles=s`
		:host {
			--padding: var(--spacer, 1rem);
			--c_inactive: transparent;
			--tc_inactive: inherit;
			--c_inactive__hover: var(--c_bg__alt);
			--tc_inactive__hover: inherit;
			--c_active: var(--c_primary);
			--tc_active: var(--tc_light);
			--c_active__hover: var(--c_active);
			--tc_active__hover: var(--tc_active);
			--border: 1px solid var(--c_border);
		}
		:host([disabled]) {
			opacity: 0.5;
			pointer-events: none;
		}
		:host([readonly]) {
			opacity: 0.75;
		}
		:host([readonly]) button {
			pointer-events: none;
		}
		button.no-btn {
			padding: var(--padding);
			border-radius: var(--radius);
			display: flex;
			align-items: center;
			gap: calc(var(--spacer, 1rem) * 0.35);
			color: var(--tc_inactive);
		}
		button.no-btn:hover {
			color: var(--tc_inactive__hover);
		}
		.segmented {
			display: inline-flex;
		}
		.segmented button {
			padding: var(--padding);
			background: var(--c_inactive);
			cursor: pointer;
			color: var(--tc_inactive);
			display: flex;
			align-items: center;
			justify-content: center;
			gap: calc(var(--spacer, 1rem) * 0.35);
			border: var(--border);
			border-right: none;
		}
		.segmented button:first-child {
			border-radius: var(--radius) 0 0 var(--radius);
		}
		.segmented button:last-child {
			border-radius: 0 var(--radius) var(--radius) 0;
			border-right: var(--border);
		}
		.segmented button:not(:first-child):not(:last-child) {
			border-radius: 0;
		}
		.segmented button.active {
			background: var(--c_active);
			color: var(--tc_active);
			border-color: var(--c_active);
		}
		.segmented button.active + button {
			border-left-color: var(--c_active);
		}
		.segmented button:not(.active):hover {
			background: var(--c_inactive__hover);
			color: var(--tc_inactive__hover);
		}
		.segmented button.active:hover {
			background: var(--c_active__hover);
			color: var(--tc_active__hover);
		}
	`;renderToggle(){return t`
			<button
				class="no-btn"
				?disabled=${this.disabled}
				@click=${this.handleClick}
			>
				<k-icon name=${r[this.currentTheme]||"mode-auto"}></k-icon>
				${this.resolvedLabels?t`<span>${this.resolvedLabels[o(this.options).indexOf(this.currentTheme)]??n(this.currentTheme)}</span>`:i}
			</button>
		`}renderSegmented(){const e=o(this.options);return t`
			<div class="segmented">
				${e.map((e,s)=>t`
					<button
						class="no-style ${e===this.currentTheme?"active":""}"
						?disabled=${this.disabled}
						@click=${()=>this.handleSegmentClick(e)}
						title=${e}
					>
						<k-icon name=${r[e]||"mode-auto"}></k-icon>
					${this.resolvedLabels?t`<span>${this.resolvedLabels[s]}</span>`:i}
					</button>
				`)}
			</div>
		`}render(){return"toggle"===this.resolvedMode?this.renderToggle():this.renderSegmented()}static setTheme(e){a.set(e)}static getCurrentTheme(){return a.get()}static getCalculatedCurrentTheme(){return a.getCalculated()}}customElements.define("k-theme-switcher",l);