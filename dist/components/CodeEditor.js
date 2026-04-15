import{html as t,css as o}from"../lit-all.min.js";import e from"./ShadowComponent.js";import i from"../utils/formatCode.js";import{getCalculatedTheme as r,subscribeToTheme as s}from"../utils/theme.js";export default class a extends e{static formAssociated=!0;static properties={name:{type:String,reflect:!0},value:{type:String,reflect:!0},language:{type:String,reflect:!0},monacoSrc:{type:String,attribute:"monaco-src"},controls:{type:String,reflect:!0},editorTheme:{type:String,attribute:"editor-theme",reflect:!0},hasTopToolbar:{type:Boolean,state:!0},hasBottomToolbar:{type:Boolean,state:!0}};constructor(){super(),this.internals=this.attachInternals(),this.name="",this.value="",this.language="javascript",this.monacoSrc="",this.controls="",this.controlsLoaded=!1,this.hasTopToolbar=!1,this.hasBottomToolbar=!1,this.monacoEditor=null,this.skipValueSync=!1,this.editorTheme="auto",this.wordWrap=!0,this.minimapEnabled=!1,this.fontSize=14}connectedCallback(){super.connectedCallback(),this.hasAttribute("value")&&(this.value=this.getAttribute("value")),this.slotObserver=new MutationObserver(()=>this.updateToolbarVisibility()),this.slotObserver.observe(this,{childList:!0,subtree:!0}),this.updateToolbarVisibility()}disconnectedCallback(){super.disconnectedCallback(),this.slotObserver?.disconnect(),this.monacoEditor?.dispose(),this.unsubscribeTheme?.()}updateToolbarVisibility(){const t=new Set(Array.from(this.children).map(t=>t.getAttribute("slot"))),o=this.controls||"none";this.hasTopToolbar="none"!==o||["toolbar-top","toolbar-top-left","toolbar-top-center","toolbar-top-right"].some(o=>t.has(o)),this.hasBottomToolbar="none"!==o||["toolbar-bottom","toolbar-bottom-left","toolbar-bottom-center","toolbar-bottom-right"].some(o=>t.has(o))}updated(t){if(super.updated(t),t.has("controls")&&(this.updateToolbarVisibility(),this.controls&&"none"!==this.controls&&this.loadControls()),t.has("value")&&!this.skipValueSync&&(this.monacoEditor&&this.monacoEditor.getValue()!==this.value&&this.monacoEditor.setValue(this.value),this.updateFormValue(),this.dispatchEvent(new CustomEvent("change",{detail:{value:this.value},bubbles:!0}))),t.has("language")&&this.monacoEditor){const t=this.monacoEditor.getModel();t&&window.monaco.editor.setModelLanguage(t,this.language)}t.has("editorTheme")&&this.monacoEditor&&window.monaco.editor.setTheme(this.resolveMonacoTheme())}async firstUpdated(){this.monacoContainer=this.shadowRoot.querySelector(".monaco-editor-container"),await this.initMonaco(),this.dispatchEvent(new CustomEvent("ready",{detail:{value:this.value},bubbles:!0}))}async loadControls(){if(this.controlsLoaded)return;this.controlsLoaded=!0;const t=new URL("./codeEditorControls/",import.meta.url).href;await Promise.all([import(`${t}FormatCode.js`),import(`${t}CopyCode.js`),import(`${t}EditorTheme.js`),import(`${t}Undo.js`),import(`${t}Redo.js`),import(`${t}WordWrap.js`),import(`${t}Minimap.js`),import(`${t}FindReplace.js`),import(`${t}FontSize.js`),import(`${t}FoldAll.js`),import(`${t}LanguageSelect.js`),import(`${t}Fullscreen.js`),import(`${t}ControlGroup.js`),import(`${t}ControlSpacer.js`)]),this.requestUpdate()}async initMonaco(){if(!this.monacoEditor){if(this.monacoInitPromise)return this.monacoInitPromise;this.monacoInitPromise=this._initMonaco(),await this.monacoInitPromise,this.monacoInitPromise=null}}async _initMonaco(){const t=this.monacoSrc||window.kempo?.monacoUrl||"https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min";await new Promise((o,e)=>{if(window.monaco)return void o();if(window.require?.defined?.("vs/editor/editor.main"))return void o();const i=document.querySelector(`script[src="${t}/vs/loader.js"]`);if(i)return void i.addEventListener("load",()=>{window.require.config({paths:{vs:`${t}/vs`}}),window.require(["vs/editor/editor.main"],()=>o(),e)});const r=document.createElement("script");r.src=`${t}/vs/loader.js`,r.onload=()=>{window.require.config({paths:{vs:`${t}/vs`}}),window.require(["vs/editor/editor.main"],()=>o(),e)},r.onerror=e,document.head.appendChild(r)}),this.monacoEditor=window.monaco.editor.create(this.monacoContainer,{value:this.value,language:this.language,theme:this.resolveMonacoTheme(),minimap:{enabled:!1},wordWrap:"on",fontSize:14,scrollBeyondLastLine:!1,automaticLayout:!0,tabSize:2});const o=document.querySelector('link[href*="monaco"][href*="editor.main.css"]');if(o){const t=document.createElement("link");t.rel="stylesheet",t.href=o.href,this.shadowRoot.appendChild(t)}this.unsubscribeTheme=s(()=>{this.monacoEditor&&"auto"===this.editorTheme&&window.monaco.editor.setTheme(this.resolveMonacoTheme())}),this.monacoEditor.onDidChangeModelContent(()=>{this.skipValueSync=!0,this.value=this.monacoEditor.getValue(),this.skipValueSync=!1,this.updateFormValue(),this.dispatchEvent(new CustomEvent("change",{detail:{value:this.value},bubbles:!0})),this.dispatchEvent(new CustomEvent("input",{detail:{value:this.value},bubbles:!0}))})}updateFormValue(){this.internals.setFormValue(this.getValue())}formResetCallback(){this.value=""}formStateRestoreCallback(t){this.value=t}getValue(){return this.monacoEditor?this.monacoEditor.getValue():this.value}setValue(t){return this.skipValueSync=!0,this.value=t,this.monacoEditor&&this.monacoEditor.setValue(t),this.updateFormValue(),this.skipValueSync=!1,this}clear(){return this.setValue("")}formatCode(){return this.monacoEditor?.getAction("editor.action.formatDocument")?.run(),this}selectAll(){if(!this.monacoEditor)return this;const t=this.monacoEditor.getModel();return t&&this.monacoEditor.setSelection(t.getFullModelRange()),this}getSelectedText(){return this.monacoEditor&&this.monacoEditor.getModel()?.getValueInRange(this.monacoEditor.getSelection())||""}focus(){return this.monacoEditor?.focus(),this}setLanguage(t){return this.language=t,this}setEditorTheme(t){return["auto","light","dark"].includes(t)&&(this.editorTheme=t),this}copyToClipboard(){return navigator.clipboard.writeText(this.getValue()),this}undo(){return this.monacoEditor?.trigger("toolbar","undo"),this}redo(){return this.monacoEditor?.trigger("toolbar","redo"),this}setWordWrap(t){return this.wordWrap=t,this.monacoEditor?.updateOptions({wordWrap:t?"on":"off"}),this}setMinimap(t){return this.minimapEnabled=t,this.monacoEditor?.updateOptions({minimap:{enabled:t}}),this}openFind(){return this.monacoEditor?.getAction("actions.find")?.run(),this}increaseFontSize(){return this.fontSize=Math.min(this.fontSize+2,40),this.monacoEditor?.updateOptions({fontSize:this.fontSize}),this}decreaseFontSize(){return this.fontSize=Math.max(this.fontSize-2,8),this.monacoEditor?.updateOptions({fontSize:this.fontSize}),this}foldAll(){return this.monacoEditor?.getAction("editor.foldAll")?.run(),this}unfoldAll(){return this.monacoEditor?.getAction("editor.unfoldAll")?.run(),this}resolveMonacoTheme(){return"dark"===this.editorTheme?"vs-dark":"light"===this.editorTheme?"vs":"dark"===r()?"vs-dark":"vs"}topLeftControls(){return"none"===(this.controls||"none")?"":t`
			<k-cec-group>
				<k-cec-undo></k-cec-undo>
				<k-cec-redo></k-cec-redo>
			</k-cec-group>
			<k-cec-group>
				<k-cec-format-code></k-cec-format-code>
				<k-cec-copy-code></k-cec-copy-code>
				<k-cec-find-replace></k-cec-find-replace>
			</k-cec-group>
			<k-cec-group>
				<k-cec-word-wrap></k-cec-word-wrap>
				<k-cec-minimap></k-cec-minimap>
				<k-cec-fold-all></k-cec-fold-all>
			</k-cec-group>
			<k-cec-font-size></k-cec-font-size>
		`}topCenterControls(){return""}topRightControls(){return"none"===(this.controls||"none")?"":t`
			<k-cec-language></k-cec-language>
			<k-cec-editor-theme></k-cec-editor-theme>
			<k-cec-fullscreen></k-cec-fullscreen>
		`}bottomLeftControls(){return""}static styles=o`
		:host {
			display: flex;
			flex-direction: column;
			gap: 0;
			height: 400px;
		}
		.toolbar-top,
		.toolbar-bottom {
			display: flex;
			flex-wrap: nowrap;
			align-items: center;
			gap: 0;
			background: var(--bg-secondary);
			min-height: 40px;
		}
		.toolbar-start,
		.toolbar-center,
		.toolbar-end {
			display: flex;
			flex-wrap: wrap;
			align-items: center;
		}
		.toolbar-end {
			margin-left: auto;
		}
		.editor-container {
			position: relative;
			flex: 1;
			min-height: 0;
			overflow: hidden;
		}
		.monaco-editor-container {
			width: 100%;
			height: 100%;
			box-sizing: border-box;
			overflow: auto;
			border: 1px solid var(--border-color);
		}
		[hidden] {
			display: none !important;
		}
	`;render(){return t`
			${this.hasTopToolbar?t`
				<div class="toolbar-top bb">
					<div class="toolbar-start">
						<slot name="toolbar-top-left">${this.topLeftControls()}</slot>
					</div>
					<div class="toolbar-center">
						<slot name="toolbar-top-center">${this.topCenterControls()}</slot>
					</div>
					<div class="toolbar-end">
						<slot name="toolbar-top-right">${this.topRightControls()}</slot>
					</div>
					<slot name="toolbar-top"></slot>
				</div>
			`:""}
			<div class="editor-container">
				<div class="monaco-editor-container"></div>
			</div>
			${this.hasBottomToolbar?t`
				<div class="toolbar-bottom bt">
					<div class="toolbar-start">
						<slot name="toolbar-bottom-left">${this.bottomLeftControls()}</slot>
					</div>
					<div class="toolbar-center">
						<slot name="toolbar-bottom-center"></slot>
					</div>
					<div class="toolbar-end">
						<slot name="toolbar-bottom-right"></slot>
					</div>
					<slot name="toolbar-bottom"></slot>
				</div>
			`:""}
		`}}customElements.define("k-code-editor",a);