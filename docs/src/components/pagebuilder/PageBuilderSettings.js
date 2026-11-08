import t from"../ShadowComponent.js";import{html as e}from"../../lit-all.min.js";import{titleOf as s,widgetIcon as i}from"../../utils/pageLabels.js";import{supportsStyles as o}from"../../utils/styles.js";import"./PageBuilderFields.js";import"./StyleFields.js";import"../Tabs.js";import"../Toggle.js";import"../Icon.js";export default class r extends t{static properties={node:{attribute:!1},widget:{attribute:!1},count:{type:Number},registry:{attribute:!1},host:{attribute:!1},page:{attribute:!1},editorSettings:{attribute:!1},version:{type:Number}};constructor(){super(),this.node=null,this.count=0}async updated(){const t=this.renderRoot.querySelector(".custom");t&&this.widget?.settings&&(customElements.get(this.widget.settingsTag)||await(import(this.widget.settings)),t.firstElementChild?.localName!==this.widget.settingsTag&&t.replaceChildren(document.createElement(this.widget.settingsTag)),Object.assign(t.firstElementChild,{node:this.node,widget:this.widget,host:this.host,registry:this.registry,version:this.version}))}renderPage(){const t=this.page?.attrs?.title??"",s=this.page?.attrs?.description??"";return e`
      <div class="p">
        <h5 class="mb"><k-icon name="settings"></k-icon> Page settings</h5>
        <p class="tc-muted">Select a widget on the page to edit its settings.</p>
        <div class="mb">
          <label class="d-b mbq" for="pb-page-title">Title</label>
          <input id="pb-page-title" type="text" class="full" .value="${t}" @input="${t=>this.host.setPageAttr("title",t.target.value)}">
        </div>
        <div class="mb">
          <label class="d-b mbq" for="pb-page-description">Description</label>
          <textarea id="pb-page-description" class="full" rows="3" .value="${s}" @input="${t=>this.host.setPageAttr("description",t.target.value)}"></textarea>
        </div>
        <k-toggle id="pb-setting-confirm" .value="${!!this.editorSettings?.confirmDeletion}" @change="${t=>t.detail.value!==!!this.editorSettings?.confirmDeletion&&this.host.setEditorSetting("confirmDeletion",t.detail.value)}">Confirm deletion<small class="d-b tc-muted">Ask before the Delete key or the delete button removes a widget. Kept in this browser, not in the page.</small></k-toggle>
      </div>
    `}render(){if(this.count>1)return e`<div class="p tc-muted">${this.count} widgets are selected. Select one to edit its settings.</div>`;if(!this.node)return this.renderPage();const t=this.widget,r=t?.settings?e`<div class="custom"></div>`:e`<k-page-builder-fields .node="${this.node}" .widget="${t}" .host="${this.host}" .version="${this.version}"></k-page-builder-fields>`;return e`
      <div class="p">
        <h5 class="mb">${i(t)} ${s(this.registry,this.node)}</h5>
        ${t?.description?e`<p class="tc-muted">${t.description}</p>`:""}
        ${o(t)?e`
          <k-tabs>
            <k-tab for="pb-widget">Widget</k-tab>
            <k-tab for="pb-styles">Styles</k-tab>
            <k-tab-content name="pb-widget">${r}</k-tab-content>
            <k-tab-content name="pb-styles"><k-page-builder-styles .node="${this.node}" .host="${this.host}" .hide="${t.hideStyles}" .version="${this.version}"></k-page-builder-styles></k-tab-content>
          </k-tabs>`:r}
      </div>
    `}}customElements.define("k-page-builder-settings",r);