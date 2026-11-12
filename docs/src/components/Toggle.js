import{html as e,css as t}from"../lit-all.min.js";import a from"./ShadowComponent.js";export default class i extends a{static formAssociated=!0;static properties={value:{type:Boolean,reflect:!0},name:{type:String,reflect:!0},disabled:{type:Boolean,reflect:!0},readonly:{type:Boolean,reflect:!0},required:{type:Boolean,reflect:!0}};constructor(){super(),this.internals=this.attachInternals(),this.value=!1,this.name="",this.disabled=!1,this.readonly=!1,this.required=!1,this.initialValue=!1,this.tabIndex=0}updated(e){super.updated(e),this.internals.setFormValue(this.value?"on":null),this.internals.setValidity(this.required&&!this.value?{valueMissing:!0}:{},"Please turn this on."),e.has("value")&&this.dispatchEvent(new CustomEvent("change",{detail:{value:this.value},bubbles:!0}))}connectedCallback(){super.connectedCallback(),this.initialValue=this.value,this.addEventListener("click",this.handleClick),this.addEventListener("keydown",this.handleKeyDown)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("click",this.handleClick),this.removeEventListener("keydown",this.handleKeyDown)}formResetCallback(){this.value=this.initialValue}formStateRestoreCallback(e){this.value="on"===e}formDisabledCallback(e){this.disabled=e}handleClick=()=>{this.disabled||this.readonly||this.toggle()};handleKeyDown=e=>{this.disabled||this.readonly||["Space","Enter"].includes(e.code)&&(e.preventDefault(),this.toggle())};on(){return this.value=!0,this.dispatchEvent(new CustomEvent("on",{detail:{value:!0},bubbles:!0})),this}off(){return this.value=!1,this.dispatchEvent(new CustomEvent("off",{detail:{value:!1},bubbles:!0})),this}toggle(){return this.value?this.off():this.on(),this.dispatchEvent(new CustomEvent("toggle",{detail:{value:this.value},bubbles:!0})),this}render(){return e`
      <div id="switch">
        <div id="handle"></div>
      </div>
      <label id="label">
        <slot></slot>
      </label>
    `}static styles=t`
    :host {
      --switch_height: 2rem;
      --switch_width: 3rem;
      --switch_border: 1px solid var(--c_border);
      --switch_background__off: var(--c_bg__alt);
      --switch_background__on: var(--c_success);
      --handle_size__off: 1rem;
      --handle_size__on: 1.5rem;
      --handle_border: 1px solid var(--c_border);
      --handle_background__off: var(--c_border);
      --handle_background__on: white;

      display: flex;
      align-items: center;
      cursor: pointer;
      margin-bottom: var(--spacer);
      border-radius: 999rem;
      outline: none;
    }

    :host([disabled]) {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }
    :host([readonly]) {
      opacity: 0.75;
      cursor: default;
    }
    #switch {
      display: flex;
      align-items: center;
      flex-shrink: 0;
      flex-grow: 0;
      width: var(--switch_width);
      height: var(--switch_height);
      border: var(--switch_border);
      background: var(--switch_background__off);
      border-radius: 999rem;
      margin-right: var(--spacer);
      box-shadow: 0 0 0 transparent;
      will-change: box-shadow;
      transition: box-shadow var(--animation_ms, 256ms);
    }
    :host(:focus) #switch {
      box-shadow: var(--focus_shadow);
    }

    #handle {
      --margin: calc( (var(--switch_height) - var(--handle_size__off)) / 2);
      width: var(--handle_size__off);
      height: var(--handle_size__off);
      border: var(--handle_border);
      background: var(--handle_background__off);
      border-radius: 999rem;
      transform: translateX(var(--margin));
      transition: width var(--animation_ms, 256ms), height var(--animation_ms, 256ms), transform var(--animation_ms, 256ms);
    }

    :host([value]) #switch {
      background: var(--switch_background__on);
    }

    :host([value]) #handle {
      --m: calc( (var(--switch_height) - var(--handle_size__on)) / 2);
      --d: calc( var(--switch_width) - var(--handle_size__on) - var(--m));
      width: var(--handle_size__on);
      height: var(--handle_size__on);
      background: var(--handle_background__on);
      transform: translateX(var(--d));
    }

    #label {
      display: block;
      flex: 1 1 auto;
      padding: 0;
    }
  `}window.customElements.define("k-toggle",i);