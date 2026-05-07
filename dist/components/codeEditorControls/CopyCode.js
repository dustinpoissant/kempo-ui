import t from"./CodeEditorButtonControl.js";import{html as e,css as o}from"../../lit-all.min.js";import"../Icon.js";export default class i extends t{static styles=[t.styles,o`
			:host {
				display: inline-flex;
			}
		`];connectedCallback(){super.connectedCallback(),this.hasAttribute("title")||(this.title="Copy Code")}handleAction(){this.editor?.copyToClipboard()}render(){return e`<k-icon name="content_copy"></k-icon>`}}customElements.define("k-cec-copy-code",i);