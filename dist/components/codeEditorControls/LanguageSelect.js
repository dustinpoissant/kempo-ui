import e from"./CodeEditorControl.js";import{html as a,css as t}from"../../lit-all.min.js";import"../Icon.js";const l=["javascript","typescript","html","css","json","markdown","python","java","csharp","cpp","go","rust","php","ruby","sql","xml","yaml","shell","plaintext"];export default class n extends e{static properties={value:{type:String,state:!0}};constructor(){super(),this.value="javascript"}connectedCallback(){super.connectedCallback();const e=this.editor;e&&(this.value=e.language||"javascript",this.languageHandler=e=>{this.value=e.detail.language},e.addEventListener("language-changed",this.languageHandler))}disconnectedCallback(){super.disconnectedCallback(),this.editor?.removeEventListener("language-changed",this.languageHandler),this.languageHandler=null}handleChange=e=>{this.editor?.setLanguage(e.target.value)};static styles=[e.styles,t`
			:host {
				display: inline-flex;
				align-items: center;
				padding: 0 0.25rem;
				gap: 0.25rem;
				background-color: 
			}
		`];render(){return a`
			<select .value=${this.value} @change=${this.handleChange} title="Language">
				${l.map(e=>a`
					<option value="${e}" ?selected=${this.value===e}>${e}</option>
				`)}
			</select>
		`}}customElements.define("k-cec-language",n);