import{html as e,css as t}from"../lit-all.min.js";import s from"./ShadowComponent.js";import{bound as a}from"../utils/number.js";import"./Icon.js";export default class l extends s{static formAssociated=!0;static properties={value:{type:Number,reflect:!0},name:{type:String,reflect:!0},disabled:{type:Boolean,reflect:!0},readonly:{type:Boolean,reflect:!0},hoverValue:{type:Number,state:!0}};constructor(){super(),this.internals=this.attachInternals(),this.value=0,this.name="",this.disabled=!1,this.readonly=!1,this.hoverValue=null,this.initialValue=0}connectedCallback(){super.connectedCallback(),this.initialValue=this.value;const e=this.closest("form");e&&e.addEventListener("reset",this.handleReset)}disconnectedCallback(){super.disconnectedCallback();const e=this.closest("form");e&&e.removeEventListener("reset",this.handleReset)}updated(e){super.updated(e),e.has("value")&&(this.internals.setFormValue(String(this.value)),this.dispatchEvent(new CustomEvent("change",{detail:{value:this.value},bubbles:!0})))}handleReset=()=>{this.value=this.initialValue};formDisabledCallback(e){this.disabled=e}handleStarClick=e=>{this.disabled||this.readonly||(this.value=a(e,0,5))};handleStarEnter=e=>{this.disabled||this.readonly||(this.hoverValue=e)};handleMouseLeave=()=>{this.hoverValue=null};render(){const t=this.hoverValue??this.value;return e`
			<div id="stars" @mouseleave=${this.handleMouseLeave}>
				${Array.from({length:5},(s,a)=>{const l=a+1,r=l<=t;return e`
						<button
							type="button"
							class="no-btn star${r?" filled":""}"
							?disabled=${this.disabled}
							aria-label="Rate ${l} of ${5}"
							?aria-pressed=${r}
							@click=${()=>this.handleStarClick(l)}
							@mouseenter=${()=>this.handleStarEnter(l)}
						><k-icon name=${r?"star_filled":"star"}></k-icon></button>
					`})}
			</div>
		`}static styles=t`
		:host {
			--star_size: 1.5rem;
			--star_color: var(--tc_muted);
			--star_color__filled: var(--tc_primary);
			--star_gap: 0.25rem;

			display: inline-block;
		}
		:host([disabled]) {
			opacity: 0.5;
			pointer-events: none;
		}
		:host([readonly]) {
			opacity: 0.75;
		}
		:host([readonly]) .star {
			pointer-events: none;
		}
		#stars {
			display: flex;
			gap: var(--star_gap);
		}
		.star {
			display: flex;
			padding: 0;
			border: none;
			background: none;
			color: var(--star_color);
			font-size: var(--star_size);
			line-height: 1;
			cursor: pointer;
		}
		.star:focus:not(:focus-visible) {
			box-shadow: none;
		}
		.star:disabled {
			cursor: not-allowed;
		}
		.star k-icon {
			font-size: var(--star_size);
		}
		.star.filled {
			color: var(--star_color__filled);
		}
	`}window.customElements.define("k-rating",l);