import e from"./ShadowComponent.js";import{html as t,css as s}from"../lit-all.min.js";import a from"../utils/theme.js";export default class i extends e{static formAssociated=!0;static properties={currentTheme:{type:String,reflect:!0,attribute:"current-theme"},name:{type:String,reflect:!0},disabled:{type:Boolean,reflect:!0},readonly:{type:Boolean,reflect:!0}};constructor(){super(),this.internals=this.attachInternals(),this.currentTheme=a.get(),this.name="",this.disabled=!1,this.readonly=!1,this.initialValue=""}formResetCallback(){a.set(this.initialValue)}formStateRestoreCallback(e){a.set(e||this.initialValue)}formDisabledCallback(e){this.disabled=e}handleChange=e=>{this.disabled||this.readonly||a.set(e.target.value)};connectedCallback(){super.connectedCallback(),this.initialValue=a.get(),this.unsubscribe=a.subscribe(e=>{this.currentTheme=e})}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe&&this.unsubscribe()}updated(e){super.updated(e),this.internals.setFormValue(this.currentTheme||null)}render(){const e=this.childNodes.length>0;return t`
			${e?t`<label><slot></slot></label>`:""}
			<select
				@change=${this.handleChange}
				.value=${this.currentTheme}
				?disabled=${this.disabled||this.readonly}
				?readonly=${this.readonly}
			>
				<option value="light">Light</option>
				<option value="dark">Dark</option>
				<option value="auto">System Default</option>
			</select>
		`}static styles=s`
		:host {
			display: block;
		}
		:host([disabled]) {
			opacity: 0.5;
			pointer-events: none;
		}
	`;static setTheme(e){a.set(e)}static getCurrentTheme(){return a.get()}static getCalculatedCurrentTheme(){return a.getCalculated()}}customElements.define("k-theme-select",i);