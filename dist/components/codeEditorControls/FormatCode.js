import t from"./CodeEditorButtonControl.js";import{html as e,css as o}from"../../lit-all.min.js";import"../Icon.js";export default class i extends t{static styles=[t.styles,o`
			:host {
				display: inline-flex;
			}
		`];connectedCallback(){super.connectedCallback(),this.hasAttribute("title")||(this.title="Format Code")}handleAction(){this.editor?.formatCode()}render(){return e`<k-icon name="frame_source"></k-icon>`}}customElements.define("k-cec-format-code",i);