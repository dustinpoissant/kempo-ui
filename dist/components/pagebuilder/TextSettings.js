import t from"./WidgetSettings.js";import{html as e}from"../../lit-all.min.js";import i from"../../utils/sanitizeHtml.js";import"../HtmlEditor.js";import l from"../Dialog.js";export default class s extends t{handleEdit=()=>{let t=this.node.attrs?.html??"";l.create(e`
      <div class="p">
        <k-html-editor controls="full" style="min-height: 55vh;" .value="${t}" @change="${e=>{t=e.target.value}}"></k-html-editor>
      </div>
    `,{title:"Edit text",confirmText:"Save text",cancelText:"Cancel",width:"min(95vw, 80rem)",height:"85vh",confirmAction:()=>this.set("html",i(t),!1)})};render(){return this.node?e`
      ${this.renderFields()}
      <div class="mb">
        <button class="primary full" @click="${this.handleEdit}">Edit text</button>
      </div>
    `:""}}customElements.define("k-page-builder-text-settings",s);