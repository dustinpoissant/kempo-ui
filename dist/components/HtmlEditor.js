import{html as e,css as t}from"../lit-all.min.js";import i from"./ShadowComponent.js";import o from"../utils/formatCode.js";import l from"../utils/debounce.js";import{getCalculatedTheme as r,subscribeToTheme as s}from"../utils/theme.js";import a from"./Dialog.js";export default class c extends i{static formAssociated=!0;static properties={name:{type:String,reflect:!0},value:{type:String,reflect:!0},selection:{type:Object,state:!0},mode:{type:String,reflect:!0},controls:{type:String,reflect:!0},lexicalSrc:{type:String,attribute:"lexical-src"},monacoSrc:{type:String,attribute:"monaco-src"},nodes:{type:String},hasTopToolbar:{type:Boolean,state:!0},hasBottomToolbar:{type:Boolean,state:!0},fullscreen:{type:Boolean,reflect:!0},disabled:{type:Boolean,reflect:!0},readonly:{type:Boolean,reflect:!0},required:{type:Boolean,reflect:!0}};constructor(){super(),this.internals=this.attachInternals(),this.name="",this.value="",this.selection=null,this.cursor=null,this.mode="visual",this.controls="",this.lexicalSrc="",this.monacoSrc="",this.nodes="",this.hasTopToolbar=!1,this.hasBottomToolbar=!1,this.skipValueSync=!1,this.lexicalValueSync=!1,this.savedSelection=null,this.lexicalEditor=null,this.monacoEditor=null,this.editorTheme="auto",this.wordWrap=!0,this.minimapEnabled=!1,this.fontSize=14,this.fullscreen=!1,this.disabled=!1,this.readonly=!1,this.required=!1,this.lx={},this.debouncedSyncValue=l(()=>this.syncValueFromLexical(),300)}connectedCallback(){super.connectedCallback(),this.hasAttribute("value")&&(this.value=this.getAttribute("value")),this.slotObserver=new MutationObserver(()=>this.updateToolbarVisibility()),this.slotObserver.observe(this,{childList:!0,subtree:!0}),this.updateToolbarVisibility()}disconnectedCallback(){super.disconnectedCallback(),this.slotObserver?.disconnect(),this.cleanupFns?.forEach(e=>e?.()),this.monacoEditor?.dispose(),this.unsubscribeTheme?.(),this.fullscreen&&this.exitFullscreen()}updateToolbarVisibility(){const e=new Set(Array.from(this.children).map(e=>e.getAttribute("slot"))),t=this.constructor.controlSets[this.controls]??null;this.hasTopToolbar=!(!t?.topLeft&&!t?.topRight)||["toolbar-top","toolbar-top-left","toolbar-top-right"].some(t=>e.has(t)),this.hasBottomToolbar=!(!t?.bottomLeft&&!t?.bottomRight)||["toolbar-bottom","toolbar-bottom-left","toolbar-bottom-right"].some(t=>e.has(t))}updated(e){if(super.updated(e),e.has("controls")&&(this.updateToolbarVisibility(),this.controls&&"none"!==this.controls&&this.loadControls()),e.has("value")&&!this.skipValueSync&&(this.lexicalValueSync?this.lexicalValueSync=!1:this.lexicalEditor&&"visual"===this.mode&&!this.isVisualCompatible(this.value)?(this.skipLexicalExport=!0,this.mode="code"):this.syncContentToEditors(),this.updateFormValue(),this.dispatchEvent(new CustomEvent("change",{detail:{value:this.value},bubbles:!0}))),e.has("mode")){const t=window.scrollY;this.handleModeSwitch(e.get("mode")),this.dispatchEvent(new CustomEvent("mode-changed",{detail:{mode:this.mode},bubbles:!0})),requestAnimationFrame(()=>window.scrollTo(0,t))}if(e.has("fullscreen")&&requestAnimationFrame(()=>this.monacoEditor?.layout()),e.has("disabled")||e.has("readonly")){const e=this.disabled||this.readonly;this.lexicalEditor?.setEditable(!e),this.monacoEditor?.updateOptions({readOnly:e})}(e.has("value")||e.has("required")||e.has("disabled"))&&this.#e()}#e=()=>{if(this.disabled)return void this.internals.setValidity({});const e=!(this.value||"").replace(/<[^>]+>/g,"").trim();this.required&&e?this.internals.setValidity({valueMissing:!0},"Please fill out this field.",this.lexicalContainer||this):this.internals.setValidity({})};async firstUpdated(){this.lexicalContainer=this.shadowRoot.querySelector(".lexical-editor"),this.monacoContainer=this.shadowRoot.querySelector(".monaco-editor-container"),await this.initLexical(),this.dispatchEvent(new CustomEvent("ready",{detail:{value:this.value},bubbles:!0}))}loadControls(){const e=this.constructor.controlModules[this.controls];if(!e?.length)return;const t=this.constructor.loadedModules,i=new URL("./htmlEditorControls/",import.meta.url).href,o=new URL("./codeEditorControls/",import.meta.url).href,l=new URL("./",import.meta.url).href;e.filter(e=>!t.has(e)).forEach(e=>{if(t.add(e),e.startsWith("components/"))import(`${l}${e.slice(11)}.js`);else{const[t,l]=e.split("/");import(`${"cec"===t?o:i}${l}.js`)}})}async loadNodeModules(){if(!this.nodes?.trim())return[];const e=new URL("./htmlEditorNodes/",import.meta.url).href;return(await Promise.all(this.nodes.split(",").map(e=>e.trim()).filter(Boolean).map(t=>import(`${e}${t}.js`)))).map(e=>e.default?.lexicalNode).filter(Boolean)}async loadLexicalModules(){const e=this.lexicalSrc||window.kempo?.lexicalUrl||"https://esm.sh",t=t=>((e,t)=>`${e}/${t}@0.43.0`)(e,t),[i,o,l,r,s,a,c,n,h]=await Promise.all([import(t("lexical")),import(t("@lexical/rich-text")),import(t("@lexical/html")),import(t("@lexical/history")),import(t("@lexical/list")),import(t("@lexical/link")),import(t("@lexical/selection")),import(t("@lexical/table")),import(t("@lexical/code"))]);this.lx={lexical:i,richText:o,lexicalHtml:l,history:r,list:s,link:a,selection:c,table:n,code:h},this.StyledTextNode=class extends i.TextNode{static getType(){return"styled-text"}static clone(e){return new this(e.__text,e.__key)}static importDOM(){return{span:()=>({conversion:e=>{const t=e.getAttribute("style");if(!t)return null;const o=i.$createTextNode(e.textContent);return o.setStyle(t),{node:o}},priority:1})}}static importJSON(e){return i.$createTextNode(e.text)}exportJSON(){return{...super.exportJSON(),type:"styled-text"}}}}async initLexical(){await this.loadLexicalModules(),this.customNodes=await this.loadNodeModules(),this.nodeCompatCheckers=this.customNodes.filter(e=>"function"==typeof e.isVisualCompatible).map(e=>e.isVisualCompatible),this.nodePreprocessors=this.customNodes.filter(e=>"function"==typeof e.preprocessHtml).map(e=>e.preprocessHtml);const{lexical:e,richText:t,history:i,list:o,link:l,table:r,code:s}=this.lx,a={namespace:"KempoHtmlEditor",theme:{paragraph:"k-editor-p",heading:{h1:"k-editor-h1",h2:"k-editor-h2",h3:"k-editor-h3",h4:"k-editor-h4",h5:"k-editor-h5",h6:"k-editor-h6"},text:{underline:"td-u",strikethrough:"td-lt"},list:{ul:"k-editor-ul",ol:"k-editor-ol",listitem:"k-editor-li"},link:"k-editor-link",quote:"k-editor-quote",code:"k-editor-code-block",codeHighlight:{},table:"k-editor-table",tableCell:"k-editor-table-cell",tableCellHeader:"k-editor-table-cell-header"},nodes:[t.HeadingNode,t.QuoteNode,o.ListNode,o.ListItemNode,l.LinkNode,r.TableNode,r.TableCellNode,r.TableRowNode,s.CodeNode,s.CodeHighlightNode,this.StyledTextNode,...this.customNodes],onError:console.error,editorState:null};this.lexicalEditor=e.createEditor(a),this.lexicalEditor.setRootElement(this.lexicalContainer),(this.disabled||this.readonly)&&this.lexicalEditor.setEditable(!1),this.lexicalEditor._window=new Proxy(window,{get:(e,t)=>{if("getSelection"===t)return()=>this.shadowRoot.getSelection();const i=Reflect.get(e,t);return"function"==typeof i?i.bind(e):i}}),this.cleanupFns=[t.registerRichText(this.lexicalEditor),i.registerHistory(this.lexicalEditor,i.createEmptyHistoryState(),300)],o.registerList&&this.cleanupFns.push(o.registerList(this.lexicalEditor)),r.registerTable&&this.cleanupFns.push(r.registerTable(this.lexicalEditor)),s.registerCodeHighlighting&&this.cleanupFns.push(s.registerCodeHighlighting(this.lexicalEditor)),l.registerLink&&this.cleanupFns.push(l.registerLink(this.lexicalEditor,{validateUrl:e=>{try{return new URL(e),!0}catch{return!1}}})),this.value&&(this.isVisualCompatible(this.value)?this.importHtmlToLexical(this.value):(this.skipLexicalExport=!0,this.mode="code")),this.lexicalEditor.registerUpdateListener(({dirtyElements:e,dirtyLeaves:t})=>{0===e.size&&0===t.size||(this.debouncedSyncValue(),this.dispatchEvent(new CustomEvent("input",{detail:{value:this.exportHtmlFromLexical()},bubbles:!0})))}),this.lexicalEditor.registerCommand(e.SELECTION_CHANGE_COMMAND,()=>(this.updateSelection(),!1),e.COMMAND_PRIORITY_LOW)}async initMonaco(){if(!this.monacoEditor){if(this.monacoInitPromise)return this.monacoInitPromise;this.monacoInitPromise=this._initMonaco(),await this.monacoInitPromise,this.monacoInitPromise=null}}async _initMonaco(){const e=this.monacoSrc||window.kempo?.monacoUrl||"https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min";await new Promise((t,i)=>{if(window.monaco)return void t();if(window.require?.defined?.("vs/editor/editor.main"))return void t();const o=document.querySelector(`script[src="${e}/vs/loader.js"]`);if(o)return void o.addEventListener("load",()=>{window.require.config({paths:{vs:`${e}/vs`}}),window.require(["vs/editor/editor.main"],()=>t(),i)});const l=document.createElement("script");l.src=`${e}/vs/loader.js`,l.onload=()=>{window.require.config({paths:{vs:`${e}/vs`}}),window.require(["vs/editor/editor.main"],()=>t(),i)},l.onerror=i,document.head.appendChild(l)}),this.monacoEditor=window.monaco.editor.create(this.monacoContainer,{value:o(this.value),language:"html",theme:this.resolveMonacoTheme(),minimap:{enabled:this.minimapEnabled},wordWrap:this.wordWrap?"on":"off",fontSize:this.fontSize,scrollBeyondLastLine:!1,automaticLayout:!0,tabSize:2,padding:{top:8},readOnly:this.disabled||this.readonly});const t=document.querySelector('link[href*="monaco"][href*="editor.main.css"]');if(t){const e=document.createElement("link");e.rel="stylesheet",e.href=t.href,this.shadowRoot.appendChild(e)}this.unsubscribeTheme=s(()=>{this.monacoEditor&&"auto"===this.editorTheme&&window.monaco.editor.setTheme(this.resolveMonacoTheme())}),this.monacoEditor.onDidChangeModelContent(()=>{this.skipValueSync=!0,this.value=this.monacoEditor.getValue(),this.skipValueSync=!1,this.updateFormValue(),this.dispatchEvent(new CustomEvent("change",{detail:{value:this.value},bubbles:!0})),this.dispatchEvent(new CustomEvent("input",{detail:{value:this.value},bubbles:!0}))})}importHtmlToLexical(e){if(!this.lexicalEditor||!this.lx.lexicalHtml)return;const{lexical:t,lexicalHtml:i}=this.lx,o=(this.nodePreprocessors||[]).reduce((e,t)=>t(e),e);this.lexicalEditor.update(()=>{if(t.$getRoot().clear(),!o?.trim())return;const e=(new DOMParser).parseFromString(o,"text/html"),l=i.$generateNodesFromDOM(this.lexicalEditor,e);l.length>0&&t.$insertNodes(l)},{discrete:!0})}exportHtmlFromLexical(){if(!this.lexicalEditor||!this.lx.lexicalHtml)return this.value;let e="";return this.lexicalEditor.getEditorState().read(()=>{e=this.lx.lexicalHtml.$generateHtmlFromNodes(this.lexicalEditor,null)}),this.cleanExportedHtml(e)}isVisualCompatible(e){if(!e?.trim())return!0;const t=new Set(["script","style","meta","link","head","iframe","object","embed","canvas","video","audio","form","input","button","select","textarea","fieldset","label","noscript","template","slot","svg","math"]),i=this.nodeCompatCheckers||[],o=(new DOMParser).parseFromString(e,"text/html"),l=document.createTreeWalker(o.body,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_COMMENT);let r;for(;r=l.nextNode();)if(!i.some(e=>e(r))){if(r.nodeType===Node.COMMENT_NODE)return!1;if(t.has(r.tagName?.toLowerCase()))return!1}return!0}cleanExportedHtml(e){const t=(new DOMParser).parseFromString(e,"text/html");return t.body.querySelectorAll("[class]").forEach(e=>{const t=Array.from(e.classList).filter(e=>!e.startsWith("k-editor-")&&"td-u"!==e&&"td-lt"!==e);0===t.length?e.removeAttribute("class"):e.className=t.join(" ")}),t.body.querySelectorAll("[style]").forEach(e=>{const t=e.style.cssText.replace(/white-space:\s*pre-wrap;?\s*/g,"").trim();t?e.style.cssText=t:e.removeAttribute("style")}),t.body.querySelectorAll("span:not([class]):not([style]):not([id])").forEach(e=>{e.attributes.length||e.replaceWith(...e.childNodes)}),t.body.querySelectorAll("b > strong, i > em, b > b, strong > strong, i > i, em > em").forEach(e=>{e.replaceWith(...e.childNodes)}),t.body.querySelectorAll("pre[data-highlight-language], code[data-highlight-language]").forEach(e=>{e.removeAttribute("data-highlight-language"),e.removeAttribute("data-language")}),t.body.innerHTML}syncValueFromLexical(){this.lexicalEditor&&(this.lexicalValueSync=!0,this.value=this.exportHtmlFromLexical(),this.updateFormValue())}syncContentToEditors(){"visual"===this.mode&&this.lexicalEditor&&this.importHtmlToLexical(this.value)}async handleModeSwitch(e){"code"===this.mode?(this.lexicalEditor&&!this.skipLexicalExport&&(this.value=this.exportHtmlFromLexical()),this.skipLexicalExport=!1,await this.initMonaco(),this.monacoEditor&&(this.monacoEditor.setValue(o(this.value)),this.monacoEditor.layout())):"visual"===this.mode&&(this.monacoEditor&&(this.value=this.monacoEditor.getValue()),this.lexicalEditor&&this.importHtmlToLexical(this.value)),this.requestUpdate()}updateFormValue(){this.internals.setFormValue(this.getValue())}formResetCallback(){this.value=""}formStateRestoreCallback(e){this.value=e}formDisabledCallback(e){this.disabled=e}updateSelection=()=>{if("visual"!==this.mode||!this.lexicalEditor)return void(this.selection=null);const{lexical:e}=this.lx;this.lexicalEditor.getEditorState().read(()=>{const t=e.$getSelection();e.$isRangeSelection(t)&&!t.isCollapsed()?this.selection={text:t.getTextContent(),collapsed:!1}:(this.selection=null,this.cursor=t?{anchor:t.anchor,focus:t.focus}:null)})};setMode(e){return["visual","code"].includes(e)?"visual"!==e||this.isVisualCompatible(this.getValue())?(this.mode=e,this):(a.confirm("This html contains code that is not compatible with the visual editor, the incompatible code will be lost",t=>{t&&(this.mode=e)},{title:"Warning",confirmText:"Change Anyways"}),this):this}toggleMode(){return this.setMode("visual"===this.mode?"code":"visual")}getValue(){if("visual"===this.mode&&this.lexicalEditor)this.skipValueSync=!0,this.value=this.exportHtmlFromLexical(),this.skipValueSync=!1;else if("code"===this.mode&&this.monacoEditor)return this.monacoEditor.getValue();return this.value}setValue(e){return this.lexicalEditor&&"visual"===this.mode&&!this.isVisualCompatible(e)?(this.value=e,this.skipLexicalExport=!0,this.mode="code",this.updateFormValue(),this):(this.skipValueSync=!0,this.value=e,"visual"===this.mode?this.syncContentToEditors():"code"===this.mode&&this.monacoEditor&&this.monacoEditor.setValue(o(e)),this.updateFormValue(),this.skipValueSync=!1,this)}clear(){return this.setValue("")}bold(){return this.lexicalFormat("bold"),this}italic(){return this.lexicalFormat("italic"),this}underline(){return this.lexicalFormat("underline"),this}strikethrough(){return this.lexicalFormat("strikethrough"),this}inlineCode(){return this.lexicalFormat("code"),this}orderedList(){return"visual"===this.mode&&this.lexicalEditor?(this.lexicalEditor.update(()=>{this.lx.list.$insertList("number")},{discrete:!0}),this):this}unorderedList(){return"visual"===this.mode&&this.lexicalEditor?(this.lexicalEditor.update(()=>{this.lx.list.$insertList("bullet")},{discrete:!0}),this):this}alignLeft(){return this.lexicalFormatElement("left"),this}alignCenter(){return this.lexicalFormatElement("center"),this}alignRight(){return this.lexicalFormatElement("right"),this}alignJustify(){return this.lexicalFormatElement("justify"),this}setTextColor(e){if("visual"!==this.mode||!this.lexicalEditor)return this;const{lexical:t,selection:i}=this.lx;return this.lexicalEditor.update(()=>{const o=t.$getSelection();t.$isRangeSelection(o)&&i.$patchStyleText(o,{color:e})},{discrete:!0}),this}removeTextColor(){if("visual"!==this.mode||!this.lexicalEditor)return this;const{lexical:e,selection:t}=this.lx;return this.lexicalEditor.update(()=>{const i=e.$getSelection();e.$isRangeSelection(i)&&t.$patchStyleText(i,{color:null})},{discrete:!0}),this}setTextBackgroundColor(e){if("visual"!==this.mode||!this.lexicalEditor)return this;const{lexical:t,selection:i}=this.lx;return this.lexicalEditor.update(()=>{const o=t.$getSelection();t.$isRangeSelection(o)&&i.$patchStyleText(o,{"background-color":e})},{discrete:!0}),this}removeTextBackgroundColor(){if("visual"!==this.mode||!this.lexicalEditor)return this;const{lexical:e,selection:t}=this.lx;return this.lexicalEditor.update(()=>{const i=e.$getSelection();e.$isRangeSelection(i)&&t.$patchStyleText(i,{"background-color":null})},{discrete:!0}),this}removeFormat(){if("visual"!==this.mode||!this.lexicalEditor)return this;const{lexical:e,selection:t}=this.lx;return this.lexicalEditor.update(()=>{const i=e.$getSelection();e.$isRangeSelection(i)&&(i.getNodes().forEach(t=>{e.$isTextNode(t)&&t.setFormat(0)}),t.$patchStyleText(i,{color:null,"background-color":null}))},{discrete:!0}),this}formatBlock(e){if("visual"!==this.mode||!this.lexicalEditor)return this;const{lexical:t,richText:i,code:o}=this.lx;return this.lexicalEditor.update(()=>{const l=t.$getSelection();if(!t.$isRangeSelection(l))return;const r=l.anchor.getNode().getTopLevelElementOrThrow(),s=o.$isCodeNode(r);let a;if("p"===e)a=t.$createParagraphNode();else if(e.match(/^h[1-6]$/))a=i.$createHeadingNode(e);else if("blockquote"===e)a=i.$createQuoteNode();else{if("pre"!==e)return;a=o.$createCodeNode()}if(s&&"pre"!==e){const e=r.getTextContent();r.replace(a),a.append(t.$createTextNode(e))}else{const e=r.getChildren();r.replace(a),e.forEach(e=>a.append(e))}a.selectEnd()},{discrete:!0}),this}isSelectionInCodeBlock(){if("visual"!==this.mode||!this.lexicalEditor)return!1;let e=!1;const{lexical:t,code:i}=this.lx;return this.lexicalEditor.getEditorState().read(()=>{const o=t.$getSelection();t.$isRangeSelection(o)&&(e=i.$isCodeNode(o.anchor.getNode().getTopLevelElementOrThrow()))}),e}getTableAtSelection(){if("visual"!==this.mode||!this.lexicalEditor)return null;let e=null;const{lexical:t,table:i}=this.lx;return this.lexicalEditor.getEditorState().read(()=>{const o=t.$getSelection();if(!t.$isRangeSelection(o))return;let l=o.anchor.getNode();for(;l;){if(i.$isTableNode(l)){const t=l.getChildren(),o=[];let r=!1,s=0;t.forEach((e,t)=>{const l=[];e.getChildren().forEach(e=>{0===t&&i.$isTableCellNode(e)&&e.getHeaderStyles()===i.TableCellHeaderStates.ROW&&(r=!0),l.push(e.getTextContent())}),l.length>s&&(s=l.length),o.push(l)}),e={key:l.getKey(),rows:r?t.length-1:t.length,cols:s,hasHeaders:r,cellData:o};break}l=l.getParent()}}),e}removeTableByKey(e){if("visual"!==this.mode||!this.lexicalEditor)return this;const{lexical:t}=this.lx;return this.lexicalEditor.update(()=>{const i=t.$getNodeByKey(e);i&&i.remove()},{discrete:!0}),this}insertHTML(e){if("visual"!==this.mode||!this.lexicalEditor)return this;const{lexical:t,lexicalHtml:i}=this.lx;return this.lexicalEditor.update(()=>{const o=(new DOMParser).parseFromString(e,"text/html"),l=i.$generateNodesFromDOM(this.lexicalEditor,o);t.$insertNodes(l)},{discrete:!0}),this}insertAtCursor(e){return this.insertHTML(e)}insertTable(e,t,i=!1,o=null){if("visual"!==this.mode||!this.lexicalEditor)return this;const{lexical:l,table:r}=this.lx;return this.lexicalEditor.update(()=>{const s=e+(i?1:0),a=[];for(let e=0;e<s;e++){const s=[];for(let a=0;a<t;a++){const t=i&&0===e,c=t?r.TableCellHeaderStates.ROW:r.TableCellHeaderStates.NO_STATUS,n=r.$createTableCellNode(c),h=o?.[e]?.[a]??(t?`Header ${a+1}`:""),d=l.$createParagraphNode();d.append(l.$createTextNode(h||" ")),n.append(d),s.push(n)}a.push(r.$createTableRowNode().append(...s))}const c=r.$createTableNode().append(...a),n=l.$getSelection();if(l.$isRangeSelection(n)){n.anchor.getNode().getTopLevelElementOrThrow().insertAfter(c);const e=l.$createParagraphNode();c.insertAfter(e),e.selectEnd()}else{const e=l.$getRoot();e.append(c),e.append(l.$createParagraphNode())}},{discrete:!0}),this}insertElementAtCursor(e){return this.insertHTML(e.outerHTML)}replaceSelectionWithElement(e){if("visual"!==this.mode||!this.lexicalEditor)return this;const{lexical:t,lexicalHtml:i}=this.lx;return this.lexicalEditor.update(()=>{const o=t.$getSelection();if(!t.$isRangeSelection(o))return;o.removeText();const l=(new DOMParser).parseFromString(e.outerHTML,"text/html"),r=i.$generateNodesFromDOM(this.lexicalEditor,l);t.$insertNodes(r)},{discrete:!0}),this}wrapSelection(e,t,i=null){if("visual"!==this.mode||!this.lexicalEditor)return this;const o=i||this.getSelectedText();return o?this.insertHTML(e+o+t):this}getSelection(){if("visual"!==this.mode||!this.lexicalEditor)return null;let e=null;const{lexical:t}=this.lx;return this.lexicalEditor.getEditorState().read(()=>{const i=t.$getSelection();t.$isRangeSelection(i)&&!i.isCollapsed()&&(e={text:i.getTextContent(),html:i.getTextContent(),selection:i})}),e}getSelectedText(){let e="";if("visual"!==this.mode||!this.lexicalEditor)return e;const{lexical:t}=this.lx;return this.lexicalEditor.getEditorState().read(()=>{const i=t.$getSelection();t.$isRangeSelection(i)&&(e=i.getTextContent())}),e}getSelectedHTML(){return this.getSelectedText()}selectAll(){if("visual"===this.mode&&this.lexicalEditor){const{lexical:e}=this.lx;this.lexicalEditor.update(()=>{e.$selectAll()},{discrete:!0})}else if(this.monacoEditor){const e=this.monacoEditor.getModel();e&&this.monacoEditor.setSelection(e.getFullModelRange())}return this}replaceSelection(e){return this.insertHTML(e)}deleteSelection(){return"visual"===this.mode?this.lexicalCmd("DELETE_CHARACTER_COMMAND",!1):this.monacoEditor&&this.monacoEditor.trigger("keyboard","deleteAllLeft",null),this}getValueWithSelectionMarkers(){if("visual"!==this.mode||!this.lexicalEditor)return{html:this.value,hasCursor:!1,hasSelection:!1,selectedText:""};let e={html:this.exportHtmlFromLexical(),hasCursor:!1,hasSelection:!1,selectedText:""};const{lexical:t}=this.lx;return this.lexicalEditor.getEditorState().read(()=>{const i=t.$getSelection();t.$isRangeSelection(i)&&(i.isCollapsed()?e.hasCursor=!0:(e.hasSelection=!0,e.selectedText=i.getTextContent()))}),e}setValueFromSelectionMarkers(e){return this.setValue(e)}captureSelection(){return this.selection}restoreSavedSelection(){return!1}clearSavedSelection(){this.savedSelection=null}createLink(e){if("visual"!==this.mode||!this.lexicalEditor)return this;const{link:t}=this.lx;return this.lexicalEditor.update(()=>{t.$toggleLink(e)},{discrete:!0}),this}createLinkWithText(e,t){if("visual"!==this.mode||!this.lexicalEditor)return this;const{lexical:i,link:o}=this.lx;return this.lexicalEditor.update(()=>{const l=i.$getSelection();i.$isRangeSelection(l)&&!l.isCollapsed()&&l.removeText();const r=o.$createLinkNode(e);r.append(i.$createTextNode(t)),i.$insertNodes([r])},{discrete:!0}),this}unlink(){if("visual"!==this.mode||!this.lexicalEditor)return this;const{lexical:e,link:t}=this.lx;return this.lexicalEditor.update(()=>{const i=e.$getSelection();e.$isRangeSelection(i)&&i.getNodes().forEach(e=>{const i=e.getParent();i&&t.$isLinkNode?.(i)&&(i.getChildren().forEach(e=>i.insertBefore(e)),i.remove())})},{discrete:!0}),this}insertImage(e){return this.insertHTML(`<img src="${encodeURI(e)}" />`)}undo(){return"code"===this.mode?this.monacoEditor?.trigger("toolbar","undo"):this.lexicalCmd("UNDO_COMMAND",void 0),this}redo(){return"code"===this.mode?this.monacoEditor?.trigger("toolbar","redo"):this.lexicalCmd("REDO_COMMAND",void 0),this}copyToClipboard(){return navigator.clipboard.writeText(this.getValue()),this}setEditorTheme(e){return["auto","light","dark"].includes(e)&&(this.editorTheme=e),this.monacoEditor&&window.monaco.editor.setTheme(this.resolveMonacoTheme()),this}openFind(){return this.monacoEditor?.getAction("actions.find")?.run(),this}foldAll(){return this.monacoEditor?.getAction("editor.foldAll")?.run(),this}unfoldAll(){return this.monacoEditor?.getAction("editor.unfoldAll")?.run(),this}enterFullscreen(){return this.fullscreen=!0,document.body.classList.add("no-scroll"),this.dispatchEvent(new CustomEvent("fullscreen-changed",{detail:{fullscreen:!0},bubbles:!0})),this}exitFullscreen(){return this.fullscreen=!1,document.body.classList.remove("no-scroll"),this.dispatchEvent(new CustomEvent("fullscreen-changed",{detail:{fullscreen:!1},bubbles:!0})),this}toggleFullscreen(){return this.fullscreen?this.exitFullscreen():this.enterFullscreen()}increaseFontSize(){return this.fontSize=Math.min(this.fontSize+2,40),this.monacoEditor?.updateOptions({fontSize:this.fontSize}),this}decreaseFontSize(){return this.fontSize=Math.max(this.fontSize-2,8),this.monacoEditor?.updateOptions({fontSize:this.fontSize}),this}setWordWrap(e){return this.wordWrap=e,this.monacoEditor?.updateOptions({wordWrap:e?"on":"off"}),this}setMinimap(e){return this.minimapEnabled=e,this.monacoEditor?.updateOptions({minimap:{enabled:e}}),this}resolveMonacoTheme(){return"dark"===this.editorTheme?"vs-dark":"light"===this.editorTheme?"vs":"dark"===r()?"vs-dark":"vs"}lexicalCmd(e,t){if("visual"!==this.mode||!this.lexicalEditor)return;const i=this.lx.lexical?.[e];i&&this.lexicalEditor.dispatchCommand(i,t)}lexicalFormat(e){if("visual"!==this.mode||!this.lexicalEditor)return;const{lexical:t}=this.lx;this.lexicalEditor.update(()=>{const i=t.$getSelection();t.$isRangeSelection(i)&&i.formatText(e)},{discrete:!0})}lexicalFormatElement(e){"visual"===this.mode&&this.lexicalEditor&&this.lexicalEditor.dispatchCommand(this.lx.lexical.FORMAT_ELEMENT_COMMAND,e)}render(){const t=this.constructor.controlSets[this.controls]??{};return e`
			${this.hasTopToolbar?e`
				<div class="toolbar-top bb">
					<div class="toolbar-start">
									<slot name="toolbar-top-left">${t.topLeft??""}</slot>
					</div>
					<div class="toolbar-end">
									<slot name="toolbar-top-right">${t.topRight??""}</slot>
					</div>
				</div>
			`:""}
			<div class="editor-container">
				<div
					class="lexical-editor"
					contenteditable=${this.disabled||this.readonly?"false":"true"}
					?hidden=${"visual"!==this.mode}
				></div>
				<div
					class="monaco-editor-container"
					?hidden=${"code"!==this.mode}
				></div>
			</div>
			${this.hasBottomToolbar?e`
				<div class="toolbar-bottom bt">
					<div class="toolbar-start">
									<slot name="toolbar-bottom-left">${t.bottomLeft??""}</slot>
					</div>
					<div class="toolbar-end">
									<slot name="toolbar-bottom-right">${t.bottomRight??""}</slot>
					</div>
				</div>
			`:""}
		`}static styles=t`
		:host {
			display: flex;
			flex-direction: column;
			gap: 0;
			height: 400px;
			background: var(--c_bg, rgb(249, 249, 249));
		}
		:host([fullscreen]) {
			position: fixed;
			top: 0;
			left: 0;
			width: 100vw !important;
			height: 100vh !important;
			z-index: 10000;
		}
		:host([disabled]) {
			opacity: 0.6;
		}
		/* disabled blocks all interaction -- toolbar AND editor. Lexical
		   and Monaco both prevent typing on their own; pointer-events: none
		   also stops focus / cursor placement, matching native form control
		   semantics. */
		:host([disabled]) .toolbar-top,
		:host([disabled]) .toolbar-bottom,
		:host([disabled]) .editor-container {
			pointer-events: none;
		}
		/* readonly keeps the editor interactive (so users can place a cursor
		   to select / copy) but mutes the toolbar so its buttons can't
		   mutate the document. */
		:host([readonly]) .toolbar-top,
		:host([readonly]) .toolbar-bottom {
			pointer-events: none;
			opacity: 0.5;
		}
		.toolbar-top,
		.toolbar-bottom {
			display: flex;
			align-items: center;
			background: var(--bg-secondary);
			min-height: 40px;
			width: 100%;
		}
		.toolbar-start {
			display: flex;
			flex-wrap: wrap;
			align-items: center;
		}
		.toolbar-end {
			display: flex;
			flex-wrap: wrap-reverse;
			align-items: center;
			justify-content: flex-end;
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
			padding: var(--editor_padding, 1rem);
			border: 1px solid var(--border-color);
			background: var(--bg-primary);
			color: var(--text-primary);
			font-family: inherit;
			font-size: inherit;
			line-height: 1.5;
			outline: none;
			/* Always show a slim scrollbar when content overflows (macOS would
			   otherwise hide overlay scrollbars when not actively scrolling,
			   leaving users unaware they can scroll back). */
			scrollbar-width: thin;
			scrollbar-color: var(--c_border, rgba(128,128,128,0.4)) transparent;
		}
		.lexical-editor::-webkit-scrollbar {
			width: 8px;
			height: 8px;
		}
		.lexical-editor::-webkit-scrollbar-track {
			background: transparent;
		}
		.lexical-editor::-webkit-scrollbar-thumb {
			background: var(--c_border, rgba(128,128,128,0.4));
			border-radius: 4px;
		}
		.lexical-editor::-webkit-scrollbar-thumb:hover {
			background: rgba(128,128,128,0.7);
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
	`;static loadedModules=new Set;static controlModules={minimal:["hec/Bold","hec/Italic","hec/Underline","hec/BulletList","hec/NumberList","components/ControlGroup"],normal:["hec/Bold","hec/Italic","hec/Underline","hec/Strikethrough","hec/InlineCode","hec/DropdownControl","hec/FormatBlock","hec/CodeBlock","hec/BulletList","hec/NumberList","hec/AlignLeft","hec/AlignCenter","hec/AlignRight","hec/CreateLink","hec/Mode","hec/WordCount","components/ControlGroup","cec/FormatCode"],full:["hec/Bold","hec/Italic","hec/Underline","hec/Strikethrough","hec/InlineCode","hec/DropdownControl","hec/FormatBlock","hec/CodeBlock","hec/BulletList","hec/NumberList","hec/AlignLeft","hec/AlignCenter","hec/AlignRight","hec/AlignJustify","hec/TextColor","hec/TextBackgroundColor","hec/ClearFormatting","hec/CreateLink","hec/InsertTable","hec/Mode","hec/WordCount","hec/CharacterCount","components/ControlGroup","cec/Undo","cec/Redo","cec/FormatCode","cec/CopyCode","cec/FindReplace","cec/WordWrap","cec/Minimap","cec/FoldAll","cec/FontSize","cec/EditorTheme","cec/Fullscreen","components/ControlGroup"]};static controlSets={minimal:{topLeft:e`
				<k-control-group>
					<k-hec-bold></k-hec-bold>
					<k-hec-italic></k-hec-italic>
					<k-hec-underline></k-hec-underline>
				</k-control-group>
				<k-control-group>
					<k-hec-bullet-list></k-hec-bullet-list>
					<k-hec-number-list></k-hec-number-list>
				</k-control-group>
			`,topRight:null,bottomLeft:null,bottomRight:null},normal:{topLeft:e`
				<k-control-group>
					<k-hec-bold></k-hec-bold>
					<k-hec-italic></k-hec-italic>
					<k-hec-underline></k-hec-underline>
					<k-hec-strikethrough></k-hec-strikethrough>
				</k-control-group>
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
				<k-control-group>
					<k-hec-bullet-list></k-hec-bullet-list>
					<k-hec-number-list></k-hec-number-list>
				</k-control-group>
			`,topRight:e`
				<k-control-group>
					<k-hec-align-left></k-hec-align-left>
					<k-hec-align-center></k-hec-align-center>
					<k-hec-align-right></k-hec-align-right>
				</k-control-group>
				<k-hec-create-link></k-hec-create-link>
				<k-cec-format-code></k-cec-format-code>
				<k-hec-mode></k-hec-mode>
			`,bottomLeft:e`<k-hec-word-count></k-hec-word-count>`,bottomRight:null},full:{topLeft:e`
				<k-control-group>
					<k-hec-bold></k-hec-bold>
					<k-hec-italic></k-hec-italic>
					<k-hec-underline></k-hec-underline>
					<k-hec-strikethrough></k-hec-strikethrough>
				</k-control-group>
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
				<k-control-group>
					<k-hec-bullet-list></k-hec-bullet-list>
					<k-hec-number-list></k-hec-number-list>
				</k-control-group>
				<k-control-group>
					<k-cec-undo></k-cec-undo>
					<k-cec-redo></k-cec-redo>
				</k-control-group>
				<k-control-group>
					<k-cec-format-code></k-cec-format-code>
					<k-cec-copy-code></k-cec-copy-code>
					<k-cec-find-replace></k-cec-find-replace>
				</k-control-group>
				<k-control-group>
					<k-cec-word-wrap></k-cec-word-wrap>
					<k-cec-minimap></k-cec-minimap>
					<k-cec-fold-all></k-cec-fold-all>
				</k-control-group>
				<k-cec-font-size></k-cec-font-size>
			`,topRight:e`
				<k-control-group>
					<k-hec-align-left></k-hec-align-left>
					<k-hec-align-center></k-hec-align-center>
					<k-hec-align-right></k-hec-align-right>
					<k-hec-align-justify></k-hec-align-justify>
				</k-control-group>
				<k-hec-create-link></k-hec-create-link>
				<k-control-group>
					<k-hec-text-color></k-hec-text-color>
					<k-hec-text-background-color></k-hec-text-background-color>
				</k-control-group>
				<k-hec-clear-formatting></k-hec-clear-formatting>
				<k-hec-insert-table></k-hec-insert-table>
				<k-cec-editor-theme></k-cec-editor-theme>
				<k-hec-mode></k-hec-mode>
				<k-cec-fullscreen></k-cec-fullscreen>
			`,bottomLeft:e`
				<k-hec-word-count></k-hec-word-count>
				<k-hec-character-count></k-hec-character-count>
			`,bottomRight:null},"":{topLeft:null,topRight:null,bottomLeft:null,bottomRight:null}}}customElements.define("k-html-editor",c);