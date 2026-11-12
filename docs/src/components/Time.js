import{html as e,css as t}from"../lit-all.min.js";import i from"./ShadowComponent.js";export default class a extends i{static formAssociated=!0;static properties={value:{type:String,reflect:!0},name:{type:String,reflect:!0},increment:{type:Number,reflect:!0},military:{type:Boolean,reflect:!0},disabled:{type:Boolean,reflect:!0},readonly:{type:Boolean,reflect:!0},required:{type:Boolean,reflect:!0}};constructor(){super(),this.internals=this.attachInternals(),this.value="",this.name="",this.increment=1,this.military=!1,this.disabled=!1,this.readonly=!1,this.required=!1}connectedCallback(){super.connectedCallback(),this.initialValue=this.value}formResetCallback(){this.value=this.initialValue}formDisabledCallback(e){this.disabled=e}updated(e){super.updated(e),this.internals.setFormValue(this.value),this.required&&!this.value?this.internals.setValidity({valueMissing:!0},"Please enter a time.",this.shadowRoot?.querySelector("input")):this.internals.setValidity({}),e.has("value")&&void 0!==e.get("value")&&this.dispatchEvent(new CustomEvent("change",{detail:{value:this.value},bubbles:!0}))}get stepSeconds(){return 60*Math.max(1,Math.floor(this.increment||1))}roundToIncrement=e=>{if(!e)return"";const[t,i]=e.split(":");let a=Number(t),r=Number(i);if(isNaN(a)||isNaN(r))return e;const s=Math.max(1,Math.floor(this.increment||1));return r=Math.round(r/s)*s,r>=60&&(r-=60,a=(a+1)%24),`${String(a).padStart(2,"0")}:${String(r).padStart(2,"0")}`};handleNativeChange=e=>{this.disabled||this.readonly||(this.value=e.target.value||"")};handleBlur=e=>{if(this.disabled||this.readonly)return;const t=this.roundToIncrement(e.target.value);t!==this.value&&(this.value=t)};render(){return e`
      <input
        type="time"
        .value=${this.value||""}
        step=${this.stepSeconds}
        lang=${this.military?"en-GB":"en-US"}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        ?required=${this.required}
        @change=${this.handleNativeChange}
        @blur=${this.handleBlur}
      />
    `}static styles=t`
    :host {
      display: inline-block;
    }
    :host([disabled]) {
      opacity: 0.5;
      pointer-events: none;
    }
    input {
      padding: var(--spacer_h) var(--spacer);
      border: 1px solid var(--c_border);
      border-radius: var(--radius);
      background: var(--c_bg);
      color: var(--tc);
      font: inherit;
      outline: none;
      box-sizing: border-box;
      transition: border-color var(--animation_ms);
    }
    input:focus {
      border-color: var(--c_primary);
    }
    input::-webkit-calendar-picker-indicator {
      display: none;
    }
  `}customElements.define("k-time",a);