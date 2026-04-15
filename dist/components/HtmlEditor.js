import{html as t,css as e}from"../lit-all.min.js";import i from"./ShadowComponent.js";import o from"../utils/formatCode.js";import r from"../utils/debounce.js";import{getCalculatedTheme as l,subscribeToTheme as s}from"../utils/theme.js";import a from"./Dialog.js";export default class n extends i{static formAssociated=!0;static properties={name:{type:String,reflect:!0},value:{type:String,reflect:!0},selection:{type:Object,state:!0},mode:{type:String,reflect:!0},controls:{type:String,reflect:!0},lexicalSrc:{type:String,attribute:"lexical-src"},monacoSrc:{type:String,attribute:"monaco-src"},nodes:{type:String},hasTopToolbar:{type:Boolean,state:!0},hasBottomToolbar:{type:Boolean,state:!0}};constructor(){super(),this.internals=this.attachInternals(),this.name="",this.value="",this.selection=null,this.cursor=null,this.mode="visual",this.controls="",this.controlsLoaded=!1,this.lexicalSrc="",this.monacoSrc="",this.nodes="",this.hasTopToolbar=!1,this.hasBottomToolbar=!1,this.skipValueSync=!1,this.lexicalValueSync=!1,this.savedSelection=null,this.lexicalEditor=null,this.monacoEditor=null,this.editorTheme="auto",this.wordWrap=!0,this.minimapEnabled=!1,this.fontSize=14,this.lx={},this.debouncedSyncValue=r(()=>this.syncValueFromLexical(),300)}connectedCallback(){super.connectedCallback(),this.hasAttribute("value")&&(this.value=this.getAttribute("value")),this.slotObserver=new MutationObserver(()=>this.updateToolbarVisibility()),this.slotObserver.observe(this,{childList:!0,subtree:!0}),this.updateToolbarVisibility()}disconnectedCallback(){super.disconnectedCallback(),this.slotObserver?.disconnect(),this.cleanupFns?.forEach(t=>t?.()),this.monacoEditor?.dispose(),this.unsubscribeTheme?.(),this.syncShadowSelection&&document.removeEventListener("selectionchange",this.syncShadowSelection)}updateToolbarVisibility(){const t=new Set(Array.from(this.children).map(t=>t.getAttribute("slot"))),e=this.controls||"none";this.hasTopToolbar="none"!==e||["toolbar-top","toolbar-top-left","toolbar-top-center","toolbar-top-right"].some(e=>t.has(e)),this.hasBottomToolbar="normal"===e||"full"===e||["toolbar-bottom","toolbar-bottom-left","toolbar-bottom-center","toolbar-bottom-right"].some(e=>t.has(e))}updated(t){if(super.updated(t),t.has("controls")&&(this.updateToolbarVisibility(),this.controls&&"none"!==this.controls&&this.loadControls()),t.has("value")&&!this.skipValueSync&&(this.lexicalValueSync?this.lexicalValueSync=!1:this.lexicalEditor&&"visual"===this.mode&&!this.isVisualCompatible(this.value)?(this.skipLexicalExport=!0,this.mode="code"):this.syncContentToEditors(),this.updateFormValue(),this.dispatchEvent(new CustomEvent("change",{detail:{value:this.value},bubbles:!0}))),t.has("mode")){const e=window.scrollY;this.handleModeSwitch(t.get("mode")),this.dispatchEvent(new CustomEvent("mode-changed",{detail:{mode:this.mode},bubbles:!0})),requestAnimationFrame(()=>window.scrollTo(0,e))}}async firstUpdated(){this.lexicalContainer=this.shadowRoot.querySelector(".lexical-editor"),this.monacoContainer=this.shadowRoot.querySelector(".monaco-editor-container"),await this.initLexical(),this.dispatchEvent(new CustomEvent("ready",{detail:{value:this.value},bubbles:!0}))}async loadControls(){if(this.controlsLoaded)return;this.controlsLoaded=!0;const t=new URL("./htmlEditorControls/",import.meta.url).href;await Promise.all([import(`${t}Bold.js`),import(`${t}Italic.js`),import(`${t}Underline.js`),import(`${t}Strikethrough.js`),import(`${t}InlineCode.js`),import(`${t}DropdownControl.js`),import(`${t}FormatBlock.js`),import(`${t}CodeBlock.js`),import(`${t}BulletList.js`),import(`${t}NumberList.js`),import(`${t}AlignLeft.js`),import(`${t}AlignCenter.js`),import(`${t}AlignRight.js`),import(`${t}AlignJustify.js`),import(`${t}TextColor.js`),import(`${t}TextBackgroundColor.js`),import(`${t}ClearFormatting.js`),import(`${t}CreateLink.js`),import(`${t}InsertTable.js`),import(`${t}ControlGroup.js`),import(`${t}ControlSpacer.js`),import(`${t}Mode.js`),import(`${t}WordCount.js`),import(`${t}CharacterCount.js`)]);const e=new URL("./codeEditorControls/",import.meta.url).href;await Promise.all([import(`${e}FormatCode.js`),import(`${e}CopyCode.js`),import(`${e}Undo.js`),import(`${e}Redo.js`),import(`${e}WordWrap.js`),import(`${e}Minimap.js`),import(`${e}FindReplace.js`),import(`${e}FontSize.js`),import(`${e}FoldAll.js`),import(`${e}EditorTheme.js`),import(`${e}Fullscreen.js`),import(`${e}ControlGroup.js`)]),this.requestUpdate()}async loadNodeModules(){if(!this.nodes?.trim())return[];const t=new URL("./htmlEditorNodes/",import.meta.url).href;return(await Promise.all(this.nodes.split(",").map(t=>t.trim()).filter(Boolean).map(e=>import(`${t}${e}.js`)))).map(t=>t.default?.lexicalNode).filter(Boolean)}async loadLexicalModules(){const t=this.lexicalSrc||window.kempo?.lexicalUrl||"https://esm.sh",e=e=>((t,e)=>`${t}/${e}@0.43.0`)(t,e),[i,o,r,l,s,a,n,c,d]=await Promise.all([import(e("lexical")),import(e("@lexical/rich-text")),import(e("@lexical/html")),import(e("@lexical/history")),import(e("@lexical/list")),import(e("@lexical/link")),import(e("@lexical/selection")),import(e("@lexical/table")),import(e("@lexical/code"))]);this.lx={lexical:i,richText:o,lexicalHtml:r,history:l,list:s,link:a,selection:n,table:c,code:d},this.StyledTextNode=class extends i.TextNode{static getType(){return"styled-text"}static clone(t){return new this(t.__text,t.__key)}static importDOM(){return{span:()=>({conversion:t=>{const e=t.getAttribute("style");if(!e)return null;const o=i.$createTextNode(t.textContent);return o.setStyle(e),{node:o}},priority:1})}}static importJSON(t){return i.$createTextNode(t.text)}exportJSON(){return{...super.exportJSON(),type:"styled-text"}}}}async initLexical(){await this.loadLexicalModules(),this.customNodes=await this.loadNodeModules(),this.nodeCompatCheckers=this.customNodes.filter(t=>"function"==typeof t.isVisualCompatible).map(t=>t.isVisualCompatible),this.nodePreprocessors=this.customNodes.filter(t=>"function"==typeof t.preprocessHtml).map(t=>t.preprocessHtml);const{lexical:t,richText:e,history:i,list:o,link:r,table:l,code:s}=this.lx,a={namespace:"KempoHtmlEditor",theme:{paragraph:"k-editor-p",heading:{h1:"k-editor-h1",h2:"k-editor-h2",h3:"k-editor-h3",h4:"k-editor-h4",h5:"k-editor-h5",h6:"k-editor-h6"},text:{underline:"td-u",strikethrough:"td-lt"},list:{ul:"k-editor-ul",ol:"k-editor-ol",listitem:"k-editor-li"},link:"k-editor-link",quote:"k-editor-quote",code:"k-editor-code-block",codeHighlight:{},table:"k-editor-table",tableCell:"k-editor-table-cell",tableCellHeader:"k-editor-table-cell-header"},nodes:[e.HeadingNode,e.QuoteNode,o.ListNode,o.ListItemNode,r.LinkNode,l.TableNode,l.TableCellNode,l.TableRowNode,s.CodeNode,s.CodeHighlightNode,this.StyledTextNode,...this.customNodes],onError:console.error,editorState:null};this.lexicalEditor=t.createEditor(a),this.lexicalEditor.setRootElement(this.lexicalContainer),this.cleanupFns=[e.registerRichText(this.lexicalEditor),i.registerHistory(this.lexicalEditor,i.createEmptyHistoryState(),300)],o.registerList&&this.cleanupFns.push(o.registerList(this.lexicalEditor)),l.registerTable&&this.cleanupFns.push(l.registerTable(this.lexicalEditor)),s.registerCodeHighlighting&&this.cleanupFns.push(s.registerCodeHighlighting(this.lexicalEditor)),r.registerLink&&this.cleanupFns.push(r.registerLink(this.lexicalEditor,{validateUrl:t=>{try{return new URL(t),!0}catch{return!1}}})),this.value&&(this.isVisualCompatible(this.value)?this.importHtmlToLexical(this.value):(this.skipLexicalExport=!0,this.mode="code")),this.lexicalEditor.registerUpdateListener(({dirtyElements:t,dirtyLeaves:e})=>{0===t.size&&0===e.size||(this.debouncedSyncValue(),this.dispatchEvent(new CustomEvent("input",{detail:{value:this.exportHtmlFromLexical()},bubbles:!0})))}),this.lexicalEditor.registerCommand(t.SELECTION_CHANGE_COMMAND,()=>(this.updateSelection(),!1),t.COMMAND_PRIORITY_LOW),this.syncShadowSelection=()=>{if("visual"!==this.mode||!this.lexicalEditor)return;const e=this.shadowRoot.getSelection?.();if(!e||0===e.rangeCount)return;const i=e.getRangeAt(0);this.lexicalContainer.contains(i.startContainer)&&(this.lexicalEditor.update(()=>{const i=t.$createRangeSelectionFromDom(e,this.lexicalEditor);i&&t.$setSelection(i)},{discrete:!0}),this.updateSelection())},document.addEventListener("selectionchange",this.syncShadowSelection)}async initMonaco(){if(!this.monacoEditor){if(this.monacoInitPromise)return this.monacoInitPromise;this.monacoInitPromise=this._initMonaco(),await this.monacoInitPromise,this.monacoInitPromise=null}}async _initMonaco(){const t=this.monacoSrc||window.kempo?.monacoUrl||"https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min";await new Promise((e,i)=>{if(window.monaco)return void e();if(window.require?.defined?.("vs/editor/editor.main"))return void e();const o=document.querySelector(`script[src="${t}/vs/loader.js"]`);if(o)return void o.addEventListener("load",()=>{window.require.config({paths:{vs:`${t}/vs`}}),window.require(["vs/editor/editor.main"],()=>e(),i)});const r=document.createElement("script");r.src=`${t}/vs/loader.js`,r.onload=()=>{window.require.config({paths:{vs:`${t}/vs`}}),window.require(["vs/editor/editor.main"],()=>e(),i)},r.onerror=i,document.head.appendChild(r)}),this.monacoEditor=window.monaco.editor.create(this.monacoContainer,{value:o(this.value),language:"html",theme:this.resolveMonacoTheme(),minimap:{enabled:this.minimapEnabled},wordWrap:this.wordWrap?"on":"off",fontSize:this.fontSize,scrollBeyondLastLine:!1,automaticLayout:!0,tabSize:2});const e=document.querySelector('link[href*="monaco"][href*="editor.main.css"]');if(e){const t=document.createElement("link");t.rel="stylesheet",t.href=e.href,this.shadowRoot.appendChild(t)}this.unsubscribeTheme=s(()=>{this.monacoEditor&&"auto"===this.editorTheme&&window.monaco.editor.setTheme(this.resolveMonacoTheme())}),this.monacoEditor.onDidChangeModelContent(()=>{this.skipValueSync=!0,this.value=this.monacoEditor.getValue(),this.skipValueSync=!1,this.updateFormValue(),this.dispatchEvent(new CustomEvent("change",{detail:{value:this.value},bubbles:!0})),this.dispatchEvent(new CustomEvent("input",{detail:{value:this.value},bubbles:!0}))})}importHtmlToLexical(t){if(!this.lexicalEditor||!this.lx.lexicalHtml)return;const{lexical:e,lexicalHtml:i}=this.lx,o=(this.nodePreprocessors||[]).reduce((t,e)=>e(t),t);this.lexicalEditor.update(()=>{if(e.$getRoot().clear(),!o?.trim())return;const t=(new DOMParser).parseFromString(o,"text/html"),r=i.$generateNodesFromDOM(this.lexicalEditor,t);r.length>0&&e.$insertNodes(r)},{discrete:!0})}exportHtmlFromLexical(){if(!this.lexicalEditor||!this.lx.lexicalHtml)return this.value;let t="";return this.lexicalEditor.getEditorState().read(()=>{t=this.lx.lexicalHtml.$generateHtmlFromNodes(this.lexicalEditor,null)}),this.cleanExportedHtml(t)}isVisualCompatible(t){if(!t?.trim())return!0;const e=new Set(["script","style","meta","link","head","iframe","object","embed","canvas","video","audio","form","input","button","select","textarea","fieldset","label","noscript","template","slot","svg","math"]),i=this.nodeCompatCheckers||[],o=(new DOMParser).parseFromString(t,"text/html"),r=document.createTreeWalker(o.body,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_COMMENT);let l;for(;l=r.nextNode();)if(!i.some(t=>t(l))){if(l.nodeType===Node.COMMENT_NODE)return!1;if(e.has(l.tagName?.toLowerCase()))return!1}return!0}cleanExportedHtml(t){const e=(new DOMParser).parseFromString(t,"text/html");return e.body.querySelectorAll("[class]").forEach(t=>{const e=Array.from(t.classList).filter(t=>!t.startsWith("k-editor-")&&"td-u"!==t&&"td-lt"!==t);0===e.length?t.removeAttribute("class"):t.className=e.join(" ")}),e.body.querySelectorAll("[style]").forEach(t=>{const e=t.style.cssText.replace(/white-space:\s*pre-wrap;?\s*/g,"").trim();e?t.style.cssText=e:t.removeAttribute("style")}),e.body.querySelectorAll("span:not([class]):not([style]):not([id])").forEach(t=>{t.attributes.length||t.replaceWith(...t.childNodes)}),e.body.querySelectorAll("b > strong, i > em, b > b, strong > strong, i > i, em > em").forEach(t=>{t.replaceWith(...t.childNodes)}),e.body.querySelectorAll("pre[data-highlight-language], code[data-highlight-language]").forEach(t=>{t.removeAttribute("data-highlight-language"),t.removeAttribute("data-language")}),e.body.innerHTML}syncValueFromLexical(){this.lexicalEditor&&(this.lexicalValueSync=!0,this.value=this.exportHtmlFromLexical(),this.updateFormValue())}syncContentToEditors(){"visual"===this.mode&&this.lexicalEditor&&this.importHtmlToLexical(this.value)}async handleModeSwitch(t){"code"===this.mode?(this.lexicalEditor&&!this.skipLexicalExport&&(this.value=this.exportHtmlFromLexical()),this.skipLexicalExport=!1,await this.initMonaco(),this.monacoEditor&&(this.monacoEditor.setValue(o(this.value)),this.monacoEditor.layout())):"visual"===this.mode&&(this.monacoEditor&&(this.value=this.monacoEditor.getValue()),this.lexicalEditor&&this.importHtmlToLexical(this.value)),this.requestUpdate()}updateFormValue(){this.internals.setFormValue(this.getValue())}formResetCallback(){this.value=""}formStateRestoreCallback(t){this.value=t}updateSelection=()=>{if("visual"!==this.mode||!this.lexicalEditor)return void(this.selection=null);const{lexical:t}=this.lx;this.lexicalEditor.getEditorState().read(()=>{const e=t.$getSelection();t.$isRangeSelection(e)&&!e.isCollapsed()?this.selection={text:e.getTextContent(),collapsed:!1}:(this.selection=null,this.cursor=e?{anchor:e.anchor,focus:e.focus}:null)})};setMode(t){return["visual","code"].includes(t)?"visual"!==t||this.isVisualCompatible(this.getValue())?(this.mode=t,this):(a.confirm("This html contains code that is not compatible with the visual editor, the incompatible code will be lost",e=>{e&&(this.mode=t)},{title:"Warning",confirmText:"Change Anyways"}),this):this}toggleMode(){return this.setMode("visual"===this.mode?"code":"visual")}getValue(){if("visual"===this.mode&&this.lexicalEditor)this.skipValueSync=!0,this.value=this.exportHtmlFromLexical(),this.skipValueSync=!1;else if("code"===this.mode&&this.monacoEditor)return this.monacoEditor.getValue();return this.value}setValue(t){return this.lexicalEditor&&"visual"===this.mode&&!this.isVisualCompatible(t)?(this.value=t,this.skipLexicalExport=!0,this.mode="code",this.updateFormValue(),this):(this.skipValueSync=!0,this.value=t,"visual"===this.mode?this.syncContentToEditors():"code"===this.mode&&this.monacoEditor&&this.monacoEditor.setValue(o(t)),this.updateFormValue(),this.skipValueSync=!1,this)}clear(){return this.setValue("")}bold(){return this.lexicalFormat("bold"),this}italic(){return this.lexicalFormat("italic"),this}underline(){return this.lexicalFormat("underline"),this}strikethrough(){return this.lexicalFormat("strikethrough"),this}orderedList(){return"visual"===this.mode&&this.lexicalEditor?(this.lexicalEditor.update(()=>{this.lx.list.$insertList("number")},{discrete:!0}),this):this}unorderedList(){return"visual"===this.mode&&this.lexicalEditor?(this.lexicalEditor.update(()=>{this.lx.list.$insertList("bullet")},{discrete:!0}),this):this}alignLeft(){return this.lexicalFormatElement("left"),this}alignCenter(){return this.lexicalFormatElement("center"),this}alignRight(){return this.lexicalFormatElement("right"),this}alignJustify(){return this.lexicalFormatElement("justify"),this}setTextColor(t){if("visual"!==this.mode||!this.lexicalEditor)return this;const{lexical:e,selection:i}=this.lx;return this.lexicalEditor.update(()=>{const o=e.$getSelection();e.$isRangeSelection(o)&&i.$patchStyleText(o,{color:t})},{discrete:!0}),this}removeTextColor(){if("visual"!==this.mode||!this.lexicalEditor)return this;const{lexical:t,selection:e}=this.lx;return this.lexicalEditor.update(()=>{const i=t.$getSelection();t.$isRangeSelection(i)&&e.$patchStyleText(i,{color:null})},{discrete:!0}),this}setTextBackgroundColor(t){if("visual"!==this.mode||!this.lexicalEditor)return this;const{lexical:e,selection:i}=this.lx;return this.lexicalEditor.update(()=>{const o=e.$getSelection();e.$isRangeSelection(o)&&i.$patchStyleText(o,{"background-color":t})},{discrete:!0}),this}removeTextBackgroundColor(){if("visual"!==this.mode||!this.lexicalEditor)return this;const{lexical:t,selection:e}=this.lx;return this.lexicalEditor.update(()=>{const i=t.$getSelection();t.$isRangeSelection(i)&&e.$patchStyleText(i,{"background-color":null})},{discrete:!0}),this}removeFormat(){if("visual"!==this.mode||!this.lexicalEditor)return this;const{lexical:t,selection:e}=this.lx;return this.lexicalEditor.update(()=>{const i=t.$getSelection();t.$isRangeSelection(i)&&(i.getNodes().forEach(e=>{t.$isTextNode(e)&&e.setFormat(0)}),e.$patchStyleText(i,{color:null,"background-color":null}))},{discrete:!0}),this}formatBlock(t){if("visual"!==this.mode||!this.lexicalEditor)return this;const{lexical:e,richText:i,code:o}=this.lx;return this.lexicalEditor.update(()=>{const r=e.$getSelection();if(!e.$isRangeSelection(r))return;const l=r.anchor.getNode().getTopLevelElementOrThrow(),s=o.$isCodeNode(l);let a;if("p"===t)a=e.$createParagraphNode();else if(t.match(/^h[1-6]$/))a=i.$createHeadingNode(t);else if("blockquote"===t)a=i.$createQuoteNode();else{if("pre"!==t)return;a=o.$createCodeNode()}if(s&&"pre"!==t){const t=l.getTextContent();l.replace(a),a.append(e.$createTextNode(t))}else{const t=l.getChildren();l.replace(a),t.forEach(t=>a.append(t))}a.selectEnd()},{discrete:!0}),this}insertHTML(t){if("visual"!==this.mode||!this.lexicalEditor)return this;const{lexical:e,lexicalHtml:i}=this.lx;return this.lexicalEditor.update(()=>{const o=(new DOMParser).parseFromString(t,"text/html"),r=i.$generateNodesFromDOM(this.lexicalEditor,o);e.$insertNodes(r)},{discrete:!0}),this}insertAtCursor(t){return this.insertHTML(t)}insertTable(t,e,i=!1,o=null){if("visual"!==this.mode||!this.lexicalEditor)return this;const{lexical:r,table:l}=this.lx;return this.lexicalEditor.update(()=>{const s=t+(i?1:0),a=[];for(let t=0;t<s;t++){const s=[];for(let a=0;a<e;a++){const e=i&&0===t,n=e?l.TableCellHeaderStates.ROW:l.TableCellHeaderStates.NO_STATUS,c=l.$createTableCellNode(n),d=o?.[t]?.[a]??(e?`Header ${a+1}`:""),h=r.$createParagraphNode();h.append(r.$createTextNode(d||" ")),c.append(h),s.push(c)}a.push(l.$createTableRowNode().append(...s))}const n=l.$createTableNode().append(...a),c=r.$getSelection();if(r.$isRangeSelection(c)){c.anchor.getNode().getTopLevelElementOrThrow().insertAfter(n);const t=r.$createParagraphNode();n.insertAfter(t),t.selectEnd()}else{const t=r.$getRoot();t.append(n),t.append(r.$createParagraphNode())}},{discrete:!0}),this}insertElementAtCursor(t){return this.insertHTML(t.outerHTML)}replaceSelectionWithElement(t){if("visual"!==this.mode||!this.lexicalEditor)return this;const{lexical:e,lexicalHtml:i}=this.lx;return this.lexicalEditor.update(()=>{const o=e.$getSelection();if(!e.$isRangeSelection(o))return;o.removeText();const r=(new DOMParser).parseFromString(t.outerHTML,"text/html"),l=i.$generateNodesFromDOM(this.lexicalEditor,r);e.$insertNodes(l)},{discrete:!0}),this}wrapSelection(t,e,i=null){if("visual"!==this.mode||!this.lexicalEditor)return this;const o=i||this.getSelectedText();return o?this.insertHTML(t+o+e):this}getSelection(){if("visual"!==this.mode||!this.lexicalEditor)return null;let t=null;const{lexical:e}=this.lx;return this.lexicalEditor.getEditorState().read(()=>{const i=e.$getSelection();e.$isRangeSelection(i)&&!i.isCollapsed()&&(t={text:i.getTextContent(),html:i.getTextContent(),selection:i})}),t}getSelectedText(){let t="";if("visual"!==this.mode||!this.lexicalEditor)return t;const{lexical:e}=this.lx;return this.lexicalEditor.getEditorState().read(()=>{const i=e.$getSelection();e.$isRangeSelection(i)&&(t=i.getTextContent())}),t}getSelectedHTML(){return this.getSelectedText()}selectAll(){if("visual"===this.mode&&this.lexicalEditor){const{lexical:t}=this.lx;this.lexicalEditor.update(()=>{t.$selectAll()},{discrete:!0})}else if(this.monacoEditor){const t=this.monacoEditor.getModel();t&&this.monacoEditor.setSelection(t.getFullModelRange())}return this}replaceSelection(t){return this.insertHTML(t)}deleteSelection(){return"visual"===this.mode?this.lexicalCmd("DELETE_CHARACTER_COMMAND",!1):this.monacoEditor&&this.monacoEditor.trigger("keyboard","deleteAllLeft",null),this}getValueWithSelectionMarkers(){if("visual"!==this.mode||!this.lexicalEditor)return{html:this.value,hasCursor:!1,hasSelection:!1,selectedText:""};let t={html:this.exportHtmlFromLexical(),hasCursor:!1,hasSelection:!1,selectedText:""};const{lexical:e}=this.lx;return this.lexicalEditor.getEditorState().read(()=>{const i=e.$getSelection();e.$isRangeSelection(i)&&(i.isCollapsed()?t.hasCursor=!0:(t.hasSelection=!0,t.selectedText=i.getTextContent()))}),t}setValueFromSelectionMarkers(t){return this.setValue(t)}captureSelection(){return this.selection}restoreSavedSelection(){return!1}clearSavedSelection(){this.savedSelection=null}createLink(t){if("visual"!==this.mode||!this.lexicalEditor)return this;const{link:e}=this.lx;return this.lexicalEditor.update(()=>{e.$toggleLink(t)},{discrete:!0}),this}createLinkWithText(t,e){if("visual"!==this.mode||!this.lexicalEditor)return this;const{lexical:i,link:o}=this.lx;return this.lexicalEditor.update(()=>{const r=i.$getSelection();i.$isRangeSelection(r)&&!r.isCollapsed()&&r.removeText();const l=o.$createLinkNode(t);l.append(i.$createTextNode(e)),i.$insertNodes([l])},{discrete:!0}),this}unlink(){if("visual"!==this.mode||!this.lexicalEditor)return this;const{lexical:t,link:e}=this.lx;return this.lexicalEditor.update(()=>{const i=t.$getSelection();t.$isRangeSelection(i)&&i.getNodes().forEach(t=>{const i=t.getParent();i&&e.$isLinkNode?.(i)&&(i.getChildren().forEach(t=>i.insertBefore(t)),i.remove())})},{discrete:!0}),this}insertImage(t){return this.insertHTML(`<img src="${encodeURI(t)}" />`)}undo(){return"code"===this.mode?this.monacoEditor?.trigger("toolbar","undo"):this.lexicalCmd("UNDO_COMMAND",void 0),this}redo(){return"code"===this.mode?this.monacoEditor?.trigger("toolbar","redo"):this.lexicalCmd("REDO_COMMAND",void 0),this}copyToClipboard(){return navigator.clipboard.writeText(this.getValue()),this}setEditorTheme(t){return["auto","light","dark"].includes(t)&&(this.editorTheme=t),this.monacoEditor&&window.monaco.editor.setTheme(this.resolveMonacoTheme()),this}openFind(){return this.monacoEditor?.getAction("actions.find")?.run(),this}foldAll(){return this.monacoEditor?.getAction("editor.foldAll")?.run(),this}unfoldAll(){return this.monacoEditor?.getAction("editor.unfoldAll")?.run(),this}increaseFontSize(){return this.fontSize=Math.min(this.fontSize+2,40),this.monacoEditor?.updateOptions({fontSize:this.fontSize}),this}decreaseFontSize(){return this.fontSize=Math.max(this.fontSize-2,8),this.monacoEditor?.updateOptions({fontSize:this.fontSize}),this}setWordWrap(t){return this.wordWrap=t,this.monacoEditor?.updateOptions({wordWrap:t?"on":"off"}),this}setMinimap(t){return this.minimapEnabled=t,this.monacoEditor?.updateOptions({minimap:{enabled:t}}),this}resolveMonacoTheme(){return"dark"===this.editorTheme?"vs-dark":"light"===this.editorTheme?"vs":"dark"===l()?"vs-dark":"vs"}lexicalCmd(t,e){if("visual"!==this.mode||!this.lexicalEditor)return;const i=this.lx.lexical?.[t];i&&this.lexicalEditor.dispatchCommand(i,e)}lexicalFormat(t){if("visual"!==this.mode||!this.lexicalEditor)return;const{lexical:e}=this.lx;this.lexicalEditor.update(()=>{const i=e.$getSelection();e.$isRangeSelection(i)&&i.formatText(t)},{discrete:!0})}lexicalFormatElement(t){"visual"===this.mode&&this.lexicalEditor&&this.lexicalEditor.dispatchCommand(this.lx.lexical.FORMAT_ELEMENT_COMMAND,t)}topLeftControls(){const e=this.controls||"none";return"none"===e?"":t`
			<k-hec-group>
				<k-hec-bold></k-hec-bold>
				<k-hec-italic></k-hec-italic>
				<k-hec-underline></k-hec-underline>
				${"minimal"!==e?t`<k-hec-strikethrough></k-hec-strikethrough>`:""}
			</k-hec-group>
			${"minimal"!==e?t`
				<k-hec-inline-code></k-hec-inline-code>
				<k-hec-dropdown>
					<k-icon slot="icon" name="format_paragraph"></k-icon>
					<span slot="label">Text Style</span>
					<k-hec-format-block tag="p">Paragraph</k-hec-format-block>
					<k-hec-format-block tag="h1">Heading 1</k-hec-format-block>
					<k-hec-format-block tag="h2">Heading 2</k-hec-format-block>
					<k-hec-format-block tag="h3">Heading 3</k-hec-format-block>
					<k-hec-format-block tag="blockquote">Blockquote</k-hec-format-block>
					<k-hec-code-block></k-hec-code-block>
				</k-hec-dropdown>
			`:""}
		`}topCenterControls(){const e=this.controls||"none";return"none"===e?"":t`
			<k-hec-group>
				<k-hec-bullet-list></k-hec-bullet-list>
				<k-hec-number-list></k-hec-number-list>
			</k-hec-group>
			${"minimal"!==e?t`
				<k-hec-group>
					<k-hec-align-left></k-hec-align-left>
					<k-hec-align-center></k-hec-align-center>
					<k-hec-align-right></k-hec-align-right>
					${"full"===e?t`<k-hec-align-justify></k-hec-align-justify>`:""}
				</k-hec-group>
				<k-hec-create-link></k-hec-create-link>
			`:""}
			${"full"===e?t`
				<k-hec-group>
					<k-hec-text-color></k-hec-text-color>
					<k-hec-text-background-color></k-hec-text-background-color>
				</k-hec-group>
				<k-hec-clear-formatting></k-hec-clear-formatting>
				<k-hec-insert-table></k-hec-insert-table>
			`:""}
		`}topRightControls(){const e=this.controls;return e&&"none"!==e&&"minimal"!==e?t`
			${"full"===e?t`
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
				<k-cec-editor-theme></k-cec-editor-theme>
				<k-cec-fullscreen></k-cec-fullscreen>
			`:"normal"===e?t`<k-cec-format-code></k-cec-format-code>`:""}
			<k-hec-mode></k-hec-mode>
		`:""}bottomLeftControls(){const e=this.controls||"none";return"normal"!==e&&"full"!==e?"":t`
			<k-hec-word-count></k-hec-word-count>
			${"full"===e?t`<k-hec-character-count></k-hec-character-count>`:""}
		`}static styles=e`
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
			align-items: flex-start;
			gap: 0;
			background: var(--bg-secondary);
			min-height: 40px;
		}
		.toolbar-bottom {
			align-items: center;
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
		.lexical-editor,
		.monaco-editor-container {
			width: 100%;
			height: 100%;
			box-sizing: border-box;
			overflow: auto;
		}
		.lexical-editor {
			padding: 1rem;
			border: 1px solid var(--border-color);
			background: var(--bg-primary);
			color: var(--text-primary);
			font-family: inherit;
			font-size: inherit;
			line-height: 1.5;
			outline: none;
		}
		.lexical-editor:focus {
			border-color: var(--primary-color);
		}
		.lexical-editor p { margin: 0 0 0.5em 0; }
		.lexical-editor h1,
		.lexical-editor h2,
		.lexical-editor h3,
		.lexical-editor h4,
		.lexical-editor h5,
		.lexical-editor h6 { margin: 0.5em 0; }
		.lexical-editor ul,
		.lexical-editor ol { margin: 0.5em 0; padding-left: 1.5em; }
		.lexical-editor blockquote {
			margin: 0.5em 0;
			padding-left: 1em;
			border-left: 3px solid var(--border-color, #ccc);
			color: var(--text-secondary, #666);
		}
		.lexical-editor a { color: var(--primary-color, #007acc); }
		.lexical-editor code {
			background: var(--bg-secondary, #f5f5f5);
			padding: 0.125em 0.25em;
			border-radius: 3px;
			font-family: monospace;
		}
		.lexical-editor pre {
			background: var(--bg-secondary, #f5f5f5);
			padding: 1em;
			border-radius: 4px;
			font-family: monospace;
			overflow-x: auto;
			white-space: pre-wrap;
		}
		.lexical-editor table {
			border-collapse: collapse;
			width: 100%;
		}
		.lexical-editor th,
		.lexical-editor td {
			border: 1px solid var(--border-color, #ccc);
			padding: 0.5rem;
		}
		.lexical-editor th {
			background-color: var(--bg-secondary, #f5f5f5);
			text-align: left;
		}
		.monaco-editor-container {
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
				<div
					class="lexical-editor"
					contenteditable="true"
					?hidden=${"visual"!==this.mode}
				></div>
				<div
					class="monaco-editor-container"
					?hidden=${"code"!==this.mode}
				></div>
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
		`}}customElements.define("k-html-editor",n);