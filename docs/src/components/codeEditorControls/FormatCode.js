import t from"./CodeEditorControl.js";import{html as o,css as e}from"../../lit-all.min.js";import"../Icon.js";export default class i extends t{static styles=[t.styles,e`
			:host {
				display: inline-flex;
			}
		`];handleClick=()=>{this.editor?.monacoEditor&&this.editor.monacoEditor.getAction("editor.action.formatDocument")?.run()};render(){return o`
			<button class="${this.buttonClasses}" @click="${this.handleClick}" title="Format Code">
				<k-icon name="frame_source"></k-icon>
			</button>
		`}}customElements.define("k-cec-format-code",i);