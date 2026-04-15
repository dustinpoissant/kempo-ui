import e from"./CodeEditorControl.js";import{html as t,css as o}from"../../lit-all.min.js";import"../Icon.js";export default class r extends e{static properties={value:{type:String,state:!0}};constructor(){super(),this.value="auto"}connectedCallback(){super.connectedCallback(),this.editor&&(this.value=this.editor.editorTheme||"auto")}handleChange=e=>{this.value=e.target.value,this.editor?.setEditorTheme(this.value)};static styles=[e.styles,o`
			:host {
				display: inline-flex;
				align-items: center;
				padding: 0 0.25rem;
				gap: 0.25rem;
			}
			select {
				border: 1px solid var(--border-color, #ccc);
				background: var(--bg-primary, #fff);
				color: var(--text-primary, #333);
				border-radius: 3px;
				padding: 0.125rem 0.25rem;
				font-size: 0.8125rem;
				cursor: pointer;
				outline: none;
			}
			select:focus {
				border-color: var(--primary-color, #007acc);
			}
		`];render(){return t`
			<k-icon name="contrast" style="font-size: 1.125rem; opacity: 0.7;"></k-icon>
			<select .value=${this.value} @change=${this.handleChange} title="Editor Theme">
				<option value="auto">Auto</option>
				<option value="light">Light</option>
				<option value="dark">Dark</option>
			</select>
		`}}customElements.define("k-cec-editor-theme",r);