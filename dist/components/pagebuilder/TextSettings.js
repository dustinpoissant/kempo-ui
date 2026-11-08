import t from"./WidgetSettings.js";import{html as e,css as i,ref as s,createRef as l}from"../../lit-all.min.js";import a from"../../utils/sanitizeHtml.js";import"../HtmlEditor.js";import"../Dialog.js";export default class d extends t{static properties={...t.properties,dialogOpen:{state:!0},draft:{state:!0}};constructor(){super(),this.dialogOpen=!1,this.draft="",this.dialogRef=l()}handleEdit=async()=>{this.draft=this.node.attrs?.html??"",this.dialogOpen=!0,await this.updateComplete,this.dialogRef.value.open()};handleChange=t=>{this.draft=t.target.value};handleSave=()=>{this.set("html",a(this.draft),!1)};handleClose=()=>{this.dialogOpen=!1};render(){return this.node?e`
      ${this.renderFields()}
      <div class="mb">
        <button class="primary full" @click="${this.handleEdit}">Edit text</button>
      </div>
      <k-dialog ${s(this.dialogRef)} confirm-text="Save text" cancel-text="Cancel" .confirmAction="${this.handleSave}" @close="${this.handleClose}">
        <h5 slot="title" class="pyh px m0">Edit text</h5>
        ${this.dialogOpen?e`
          <div class="p">
            <k-html-editor controls="full" .value="${this.draft}" @change="${this.handleChange}"></k-html-editor>
          </div>`:""}
      </k-dialog>
    `:""}static styles=i`
    k-dialog {
      --width: min(95vw, 80rem);
      --height: 85vh;
    }
    k-html-editor {
      min-height: 55vh;
    }
  `}customElements.define("k-page-builder-text-settings",d);