import e from"./ShadowComponent.js";import{html as t,css as s,render as i}from"../lit-all.min.js";import r from"./Dialog.js";import o from"./Toast.js";import"./ControlBar.js";import"./ControlGroup.js";import"./Icon.js";import"./controls/Menu.js";import"./controls/Undo.js";import"./controls/Redo.js";import"./controls/PbTree.js";import"./controls/PbAdd.js";import"./controls/PbDelete.js";import"./controls/PbDuplicate.js";import"./controls/PbMoveUp.js";import"./controls/PbMoveDown.js";import"./controls/PbMoveIn.js";import"./controls/PbMoveOut.js";import"./controls/PbDevice.js";import"./controls/PbView.js";import"./controls/PbSave.js";import"./controls/PbSettings.js";import"./controls/PbTemplateSave.js";import"./controls/PbTemplateInsert.js";import"./controls/PbShortcuts.js";import"./controls/PbReset.js";import"./pagebuilder/PageBuilderTree.js";import"./pagebuilder/PageBuilderSettings.js";import"./pagebuilder/PageBuilderInserter.js";import*as n from"../utils/pageTree.js";import{widgets as l,addWidget as a,registryOf as h}from"../utils/pageWidgets.js";import d from"../utils/pageHistory.js";import c from"../utils/pageFrame.js";const p="kempo-ui:page-builder",u=[["phone","Phone"],["tablet","Tablet"],["desktop","Desktop"]],g=["tree","page","settings"],m=/^Already /,b=Symbol("tree"),f=Symbol("saved"),v=Symbol("frame"),y=Symbol("coalesce"),w=Symbol("coalesceTime"),k=Symbol("resize"),S=Symbol("extras");export default class $ extends e{static widgets=l;static addWidget=a;static properties={mobile:{type:Boolean,reflect:!0},mobileWidth:{type:Number,attribute:"mobile-width"},view:{state:!0},treeOpen:{state:!0},settingsOpen:{state:!0},device:{state:!0},selection:{state:!0},version:{state:!0},ready:{state:!0}};constructor(){super(),this[b]={attrs:{},slots:{default:[]}},this[f]=JSON.stringify(this[b]),this[v]=null,this[y]=null,this[w]=0,this.history=new d,this.selection=[],this.mobile=!1,this.mobileWidth=768,this.view="page",this.treeOpen=!0,this.settingsOpen=!0,this.device="desktop",this.version=0,this.ready=!1,this.templates=[],this.settings=(()=>{try{return{confirmDeletion:!1,...JSON.parse(localStorage.getItem(p)||"{}")}}catch{return{confirmDeletion:!1}}})()}connectedCallback(){super.connectedCallback(),this.setAttribute("controlled",""),document.addEventListener("keydown",this.handleKeyDown),window.addEventListener("beforeunload",this.handleBeforeUnload),this.updateMobile(),this[k]=new ResizeObserver(this.updateMobile),this[k].observe(this),this[S]=new MutationObserver(()=>this.requestUpdate()),this[S].observe(this,{childList:!0,attributes:!0,attributeFilter:["slot"]})}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("keydown",this.handleKeyDown),window.removeEventListener("beforeunload",this.handleBeforeUnload),this[k]?.disconnect(),this[S]?.disconnect()}willUpdate(e){super.willUpdate(e),e.has("mobileWidth")&&this.updateMobile()}updated(e){super.updated(e),(e.has("mobile")||e.has("view"))&&requestAnimationFrame(()=>this.frame()?.placeHandle())}firstUpdated(){this[v]=new c(this.renderRoot.querySelector("iframe"),{onSelect:(e,t)=>this.select(e,t),onBlank:()=>this.setSelection([]),onChange:(e,t)=>{const s=this.find(e);s&&!Object.entries(t).every(([e,t])=>n.valueAt(s.node.attrs,e)===t)&&this.change(s=>{const i=n.findNode(s,e);if(!i)return"That widget no longer exists";for(const[e,s]of Object.entries(t))n.setValueAt(i.node.attrs,e,s);return!0},{coalesce:`${e}:widget`,render:!1})},onDrop:(e,t)=>this.moveTo(e,t,!0),restricted:e=>this.isSection(e),canDrop:(e,t,s)=>{const i=this.find(e);return!(!i||this.registry.get(i.node.type)?.section||t&&(t===e||n.isInside(this.nodes,e,t)))&&n.canContain(this.registry,t?this.find(t)?.node:null,s,i.node.type)},nameOf:e=>this.nameOf(e),locate:e=>this.locate(e),onKeyDown:e=>this.handleKeyDown(e)}),this.ready=!0,this.refresh()}get registry(){return h(this.constructor.widgets)}get nodes(){return this[b].slots.default}get value(){return this[b]}set value(e){const t=e?structuredClone(e):{attrs:{},slots:{default:[]}};t.attrs=t.attrs||{},t.slots=t.slots||{},t.slots.default=t.slots.default||[];const s=JSON.stringify(t);if(s===JSON.stringify(this[b]))return this[f]=s,void this.requestUpdate();this[b]=t,this[f]=s,this.history.clear(),this.prune(),this.refresh(),this.settle()}get dirty(){return JSON.stringify(this[b])!==this[f]}find=e=>e?n.findNode(this.nodes,e):null;locate=e=>{const t=this.find(e);return t?{parentId:t.parent?.id??null,slot:t.slot,index:t.index}:null};isSection=e=>!!this.registry.get(this.find(e)?.node.type)?.section;nameOf(e){if(!e)return"the page";const t=this.frame()?.document.querySelector(`[data-pb-id="${CSS.escape(e)}"]`),s=t?.matches("k-accordion-header, k-tab")?t.textContent.trim():"";return s?s.slice(0,30):this.registry.get(this.find(e)?.node.type)?.title||"here"}frame(){return this[v]}placement(){return{targetId:this.selection[this.selection.length-1]??null}}addPlacement(e){const t=this.selection[this.selection.length-1],s=t&&this.find(t)?.node,i=s&&this.registry.get(s.type);if(i?.slots?.length){const i=this.registry.get(e)?.section?[]:(s.slots?.[n.firstSlotOf(this.registry,s)]||[]).filter(e=>this.registry.get(e.type)?.section&&this.registry.get(e.type).slots?.length),r=e=>e.getBoundingClientRect().height>0,o=i.find(e=>[...this.frame()?.document.querySelectorAll(`[data-pb-id="${CSS.escape(e.id)}"][data-pb-slot]`)||[]].some(r))||i[0],l=o?{targetId:o.id,inside:!0}:{targetId:t,inside:!0};if(!n.addWidget(structuredClone(this.nodes),this.registry,e,l).error)return l}return this.placement()}canAdd=e=>!n.addWidget(structuredClone(this.nodes),this.registry,e,this.addPlacement(e)).error;change(e,{coalesce:t=null,render:s=!0}={}){const i=structuredClone(this[b]),r=e(this.nodes,this[b]),n="string"==typeof r?r:r?.error;if(n)return this[b]=i,m.test(n)||o.error(n),!1;const l=Date.now();return t&&this[y]===t&&l-this[w]<1e3||this.history.push(i),this[y]=t,this[w]=l,r?.select&&(this.selection=r.select),this.prune(),s?this.refresh():this.version++,this.publish(),!0}refresh(){this.version++,this.frame()?.render(this.nodes,this.registry,this.selection),this.requestUpdate()}publish(){this.dispatchEvent(new CustomEvent("change",{detail:{value:structuredClone(this[b])}})),this.requestUpdate()}settle(){const e=[];n.walk(this.nodes,t=>{const s=this.registry.get(t.type)?.prepare;s&&e.push(s(structuredClone(t)).then(e=>({id:t.id,apply:e})))}),Promise.all(e).then(e=>{e.map(({id:e,apply:t})=>{const s=t&&n.findNode(this.nodes,e);return!!s&&t(s.node)}).some(Boolean)&&(this.prune(),this.refresh(),this.publish())})}prune(){this.selection=this.selection.filter(e=>this.find(e))}reset=()=>{if(!this.dirty)return;const e=structuredClone(this[b]);this[b]=JSON.parse(this[f]),this.history.push(e),this[y]=null,this.prune(),this.refresh(),this.publish()};save=()=>{this[f]=JSON.stringify(this[b]),this.dispatchEvent(new CustomEvent("save",{detail:{value:structuredClone(this[b])}})),this.requestUpdate(),o.success("Page saved")};undo=()=>{const e=this.history.undo(structuredClone(this[b]));e&&(this[b]=e,this[y]=null,this.prune(),this.refresh(),this.publish())};redo=()=>{const e=this.history.redo(structuredClone(this[b]));e&&(this[b]=e,this[y]=null,this.prune(),this.refresh(),this.publish())};setDevice=e=>{this.device=e,this.frame()?.placeHandle()};setView=e=>{g.includes(e)&&(this.view=e)};updateMobile=()=>{this.mobile=this.clientWidth<=this.mobileWidth};toggleTree=()=>{this.mobile?this.setView("tree"===this.view?"page":"tree"):this.treeOpen=!this.treeOpen};toggleSettings=()=>{this.mobile?this.setView("settings"===this.view?"page":"settings"):this.settingsOpen=!this.settingsOpen};setPageAttr(e,t){this.change((s,i)=>(i.attrs[e]=t,!0),{coalesce:`page:${e}`,render:!1})}setWidgetAttribute(e,t,s,i=!1){this.change(i=>{const r=n.findNode(i,e);return r?(r.node.attrs[t]=s,!0):"That widget no longer exists"},{coalesce:i?`${e}:${t}`:null})}editWidget(e,t,s=!1){this.change(s=>{const i=n.findNode(s,e);return i?t(i.node,s):"That widget no longer exists"},{coalesce:s?`${e}:edit`:null})}addChild(e,t,s="default"){this.change(i=>{const r=n.addWidget(i,this.registry,t,{targetId:e,inside:!0,slot:s});return!r.error||r})}select=(e,{additive:t=!1}={})=>{let s=this.find(e);for(;s?.parent&&this.registry.get(s.node.type)?.section;)e=s.parent.id,s=this.find(e);let i=[e];t&&(this.selection.includes(e)?i=this.selection.filter(t=>t!==e):n.sharePlace(this.nodes,[...this.selection,e])&&(i=[...this.selection,e])),this.setSelection(i)};setSelection(e){this.selection=e,this.frame()?.setSelection(e),e[0]&&this.frame()?.scrollTo(e[0]),this.version++}selectParent=()=>{const e=1===this.selection.length?this.find(this.selection[0])?.parent:null;this.setSelection(e?[e.id]:[])};openInserter=()=>{const e=document.createElement("k-page-builder-inserter");e.registry=this.registry,e.host=this,this.inserterDialog=r.create(e,{title:"Add a widget",cancelText:"Close",width:"min(60rem, 95vw)",height:"90vh"}),this.inserterDialog.updateComplete?.then(()=>requestAnimationFrame(()=>e.focusSearch()))};insert=e=>{this.inserterDialog?.close(),this.change(t=>{const s=n.addWidget(t,this.registry,e,this.addPlacement(e));return s.error?s:{select:[s.id]}})};removeSelection=()=>{if(!this.selection.length)return;const e=[...this.selection],t=()=>this.change(t=>{const s=n.neighbour(t,e[0]);return n.removeWidgets(t,e),{select:s&&!e.includes(s)?[s]:[]}});this.settings.confirmDeletion?r.confirm(`Delete ${e.length>1?`these ${e.length} widgets`:"this widget"}?`,e=>e&&t(),{title:"Delete"}):t()};moveUp=()=>this.selection.length&&this.change(e=>n.moveBy(e,this.registry,this.selection,-1));moveDown=()=>this.selection.length&&this.change(e=>n.moveBy(e,this.registry,this.selection,1));moveOutOf=()=>1===this.selection.length&&this.change(e=>n.moveOut(e,this.registry,this.selection[0]));moveInto=()=>1===this.selection.length&&this.change(e=>n.moveIn(e,this.registry,this.selection[0]));duplicateSelection=()=>{this.selection.length&&this.change(e=>{const t=n.duplicateWidgets(e,this.selection);return t.error?t:{select:t.ids}})};moveTo(e,t,s=!1){this.change(i=>{const r=n.moveWidget(i,this.registry,e,t.parentId,t.slot,t.index);return!0!==r||s?r:{select:[e]}})}dropOn=(e,t,s)=>{const i=this.find(t);if(i&&this.find(e)){if("inside"===s){const s=n.firstSlotOf(this.registry,i.node);if(!s)return;return void this.moveTo(e,{parentId:t,slot:s,index:1/0})}this.dropNear(e,t,"before"===s)}};dropNear(e,t,s){const i=this.find(e);if(!i||this.registry.get(i.node.type)?.section||e===t||n.isInside(this.nodes,e,t))return;const r=this.find(t);r&&this.moveTo(e,{parentId:r.parent?.id??null,slot:r.slot,index:r.index+(s?0:1)})}showDropTarget=(e,t)=>this.frame()?.showDropTarget(e,t);saveTemplate=()=>{if(!this.selection.length)return void o.error("Select a widget to save as a template");const e=this.selection.map(e=>n.cloneNode(this.find(e).node)).filter(Boolean),s=r.create(t`
      <div class="p">
        <label class="d-b mbq" for="pb-template-name">Template name<small class="d-b tc-muted">Inserting a template makes a copy, so changing it later does not change the pages that used it.</small></label>
        <input id="pb-template-name" type="text" class="full" maxlength="100">
      </div>
    `,{title:"Save as a template",confirmText:"Save template",cancelText:"Cancel",confirmAction:t=>{const i=s.querySelector("#pb-template-name").value.trim();if(!i)return t.keepDialogOpen=!0,void o.error("Give the template a name");this.dispatchEvent(new CustomEvent("template-save",{detail:{name:i,nodes:structuredClone(e)}})),o.success("Template saved")}})};insertTemplate=()=>{if(!this.templates.length)return void o.error("There are no templates yet. Select a widget and use Save as a template.");const e=document.createElement("div");i(t`
      <div class="p">
        ${this.templates.map((e,i)=>t`
          <div class="d-f mb">
            <span class="flex">${e.name}</span>
            <button class="primary" @click="${()=>{s.close(),this.insertTemplateNodes(e)}}">Insert</button>
            <button class="danger" @click="${()=>{s.close(),this.dispatchEvent(new CustomEvent("template-remove",{detail:{index:i}}))}}">Delete</button>
          </div>
        `)}
      </div>
    `,e);const s=r.create(e,{title:"Insert a template",cancelText:"Close"})};insertTemplateNodes(e){this.change(t=>{const s=n.freshCopies(structuredClone(e.nodes)),i=n.insertNodes(t,this.registry,s,this.placement());return i.error?i:{select:i.ids}})}setEditorSetting(e,t){this.settings={...this.settings,[e]:t},(e=>{try{localStorage.setItem(p,JSON.stringify(e))}catch{}})(this.settings),this.requestUpdate()}openShortcuts=()=>{r.create(t`
      <div class="p">
        <p class="tc-muted">On a Mac, Ctrl means Cmd. Inside text the browser's own shortcuts work (Ctrl + B and the rest), and Ctrl + Z and Delete stay the text's own, so one key never does two things.</p>
        <table>
          <thead><tr><th>Keys</th><th>Does</th></tr></thead>
          <tbody>${[["Click","Select the outermost widget under the pointer. Each click inside it selects the next widget down, and clicking the selected widget edits its text."],["Shift or Ctrl + click","Add the widget beside the selected one (same parent) to the selection."],["Drag the handle","Move the selected widget: drop it in a box that shows on the page. Letting go anywhere else cancels."],["Ctrl + K","Open the Add a widget list, with the search ready to type in. Enter adds the first widget it finds."],["Ctrl + S","Save the page."],["Ctrl + D","Duplicate the selected widgets."],["Ctrl + Z","Undo."],["Ctrl + Shift + Z, Ctrl + Shift + Y or Ctrl + Y","Redo."],["Delete or Backspace","Delete the selected widgets."],["Enter, in a table cell","Add a row below and move into the same column of it."],["Shift + Enter, in a table cell","A new line in the same cell."],["Ctrl + Enter, in a table cell","Add a column after the cell and move into it."],["Tab, in a table cell","Move to the next cell."],["Escape","Stop typing and keep the widget selected. Pressed again, select its parent, and at the top of the page select nothing, which shows the page settings."],["Alt + Shift + Up or Down","Move the selection up or down."],["Alt + Shift + Left","Move the selection out of its parent."],["Alt + Shift + Right","Move the selection into the widget before it."]].map(([e,s])=>t`<tr><td><strong>${e}</strong></td><td>${s}</td></tr>`)}</tbody>
        </table>
      </div>
    `,{title:"Keyboard shortcuts",cancelText:"Close",width:"min(48rem, 95vw)"})};isTyping(e){const t=e.composedPath(),s=t.find(e=>e.dataset?.pbId);return!(s&&!this.selection.includes(s.dataset.pbId))&&t.some(e=>e.matches?.("input, textarea, select, [contenteditable]")||"K-HTML-EDITOR"===e.tagName)}handleEditKeys(e){if(e.isComposing)return!1;const t=e.target?.closest?.("[data-pb-edit]"),s=t?.closest("[data-pb-id]")?.dataset.pbId,i=s&&this.find(s),r=i&&this.registry.get(i.node.type)?.keydown?.(e,{node:i.node,path:t.dataset.pbEdit,html:this.frame().htmlOf(t)});return!!r&&(e.preventDefault(),this.frame().focusAfterRender(s,r.focus),this.change(e=>{const t=n.findNode(e,s);return t?(Object.assign(t.node.attrs,r.attrs),!0):"That widget no longer exists"}),!0)}handleKeyDown=e=>{if(!this.ready)return;if(this.handleEditKeys(e))return;const t=e.ctrlKey||e.metaKey,s=e.key.toLowerCase(),i=this.isTyping(e);if(t&&"s"===s)return e.preventDefault(),this.frame()?.blurFocus(),void this.save();if(t&&!e.altKey&&!e.shiftKey&&"k"===s)return e.preventDefault(),void(document.querySelector("k-dialog[opened]")||this.openInserter());if(t&&"d"===s&&this.selection.length)return e.preventDefault(),void this.duplicateSelection();if(t&&!e.altKey&&("z"===s||"y"===s)){if(i)return;return e.preventDefault(),void("y"===s||e.shiftKey?this.redo():this.undo())}return e.altKey&&e.shiftKey&&s.startsWith("arrow")?(e.preventDefault(),void("arrowup"===s?this.moveUp():"arrowdown"===s?this.moveDown():"arrowleft"===s?this.moveOutOf():this.moveInto())):"escape"===s?i?(document.activeElement?.blur?.(),void this.frame()?.blurFocus()):void this.selectParent():void("delete"!==s&&"backspace"!==s||i||!this.selection.length||(e.preventDefault(),this.removeSelection()))};handleBeforeUnload=e=>{this.dirty&&(e.preventDefault(),e.returnValue="")};handleTreeClick=e=>{e.composedPath().some(e=>e.matches?.(".row, button"))||this.setSelection([])};hasExtra=e=>!!this.querySelector(`:scope > [slot="${e}"]`);renderBar(){const e=this.selection.length>0,s=1===this.selection.length;return t`
      <k-control-bar>
        ${this.mobile?t`
            <k-control-group no-collapse>
              ${g.map(e=>t`<kc-pb-view view="${e}" ?active="${this.view===e}"></kc-pb-view>`)}
            </k-control-group>`:t`<kc-pb-tree no-collapse ?active="${this.treeOpen}"></kc-pb-tree>`}
        <k-control-group split>
          <kc-pb-add no-collapse></kc-pb-add>
          <kc-pb-delete priority="11" ?disabled="${!e}"></kc-pb-delete>
          <kc-pb-duplicate ?disabled="${!e}"></kc-pb-duplicate>
        </k-control-group>
        <k-control-group priority="5">
          <kc-undo ?disabled="${!this.history.canUndo}"></kc-undo>
          <kc-redo ?disabled="${!this.history.canRedo}"></kc-redo>
        </k-control-group>
        <k-control-group priority="1">
          <kc-pb-move-up ?disabled="${!e}"></kc-pb-move-up>
          <kc-pb-move-down ?disabled="${!e}"></kc-pb-move-down>
          <kc-pb-move-in ?disabled="${!s}"></kc-pb-move-in>
          <kc-pb-move-out ?disabled="${!s}"></kc-pb-move-out>
        </k-control-group>
        ${this.hasExtra("left-end")?t`<k-control-group priority="2"><slot name="left-end"></slot></k-control-group>`:""}
        ${this.hasExtra("center-start")?t`<k-control-group slot="center" priority="2"><slot name="center-start"></slot></k-control-group>`:""}
        ${this.mobile?"":t`
          <k-control-group slot="center" priority="10">
            ${u.map(([e])=>t`<kc-pb-device device="${e}" ?active="${this.device===e}"></kc-pb-device>`)}
          </k-control-group>`}
        ${this.hasExtra("center-end")?t`<k-control-group slot="center" priority="2"><slot name="center-end"></slot></k-control-group>`:""}
        ${this.hasExtra("right-start")?t`<k-control-group slot="right" priority="2"><slot name="right-start"></slot></k-control-group>`:""}
        <kc-menu slot="right" title="Templates" split>
          <k-icon slot="icon" name="dashboard_customize"></k-icon>
          <kc-pb-template-save ?disabled="${!e}"></kc-pb-template-save>
          <kc-pb-template-insert></kc-pb-template-insert>
        </kc-menu>
        <k-control-group slot="right" split>
          <kc-pb-save no-collapse ?dirty="${this.dirty}" title="${this.dirty?"Save the page (Ctrl+S). There are unsaved changes.":"Save the page (Ctrl+S)"}"></kc-pb-save>
          <kc-pb-reset ?disabled="${!this.dirty}"></kc-pb-reset>
        </k-control-group>
        <kc-pb-shortcuts slot="right"></kc-pb-shortcuts>
        ${this.mobile?"":t`<kc-pb-settings slot="right" no-collapse ?active="${this.settingsOpen}"></kc-pb-settings>`}
      </k-control-bar>
    `}render(){const e=1===this.selection.length?this.find(this.selection[0])?.node:null,s=e?this.registry.get(e.type):null,i=this.mobile?"tree"===this.view:this.treeOpen,r=this.mobile?"settings"===this.view:this.settingsOpen,o=!this.mobile||"page"===this.view,n=this.mobile?"full":"";return t`
      <div class="pb">
        <div class="bar">${this.renderBar()}</div>
        <div class="body">
          ${i?t`
            <aside class="tree ${n}" @click="${this.handleTreeClick}">
              <k-page-builder-tree .nodes="${this.nodes}" .registry="${this.registry}" .selection="${this.selection}" .host="${this}"></k-page-builder-tree>
            </aside>`:""}
          <div class="canvas ${this.mobile?"":this.device}" ?hidden="${!o}">
            <iframe title="Page content"></iframe>
          </div>
          ${r?t`
            <aside class="attrs ${n}">
              <k-page-builder-settings .node="${e}" .widget="${s}" .count="${this.selection.length}" .page="${this[b]}" .editorSettings="${this.settings}" .registry="${this.registry}" .host="${this}" .version="${this.version}"></k-page-builder-settings>
            </aside>`:""}
        </div>
      </div>
    `}static styles=s`
    :host {
      display: block;
      height: 80vh;
      min-height: 30rem;
    }
    .pb {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }
    .bar {
      padding: var(--spacer_h, 0.5rem);
      border-bottom: 1px solid var(--c_border, #8884);
    }
    .body {
      display: flex;
      flex: 1;
      min-height: 0;
    }
    aside {
      overflow: auto;
      flex: none;
    }
    aside.tree {
      width: 18rem;
      border-right: 1px solid var(--c_border, #8884);
    }
    aside.attrs {
      width: 22rem;
      border-left: 1px solid var(--c_border, #8884);
    }
    aside.full {
      flex: 1 1 auto;
      width: auto;
      min-width: 0;
      border: 0;
    }
    .canvas {
      flex: 1;
      min-width: 0;
      overflow: auto;
      background: var(--c_bg__alt, #8881);
    }
    iframe {
      display: block;
      width: 100%;
      height: 100%;
      border: 0;
      background: var(--c_bg, #fff);
      margin: 0 auto;
    }
    /* The page's breakpoints work on the frame's own width, so each preview is a width inside its own range (desktop from 1024px, tablet 769 to 1023px, phone 768px or less). */
    .desktop iframe {
      min-width: 1024px;
    }
    .tablet iframe {
      width: 900px;
    }
    .phone iframe {
      width: 390px;
      max-width: 100%;
    }
  `}customElements.define("k-page-builder",$);