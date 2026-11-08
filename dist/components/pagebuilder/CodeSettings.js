import e from"./WidgetSettings.js";import{html as t,css as i,ref as a,createRef as d}from"../../lit-all.min.js";import"../CodeEditor.js";import"../Dialog.js";export default class s extends e{static properties={...e.properties,dialogOpen:{state:!0},draft:{state:!0}};constructor(){super(),this.dialogOpen=!1,this.draft="",this.dialogRef=d()}get codeSetting(){return"code"}get codeLanguage(){return"plaintext"}get codeTitle(){return"Edit code"}get codeSaveText(){return"Save"}handleOpen=async()=>{this.draft=this.node.attrs?.[this.codeSetting]??"",this.dialogOpen=!0,await this.updateComplete,this.dialogRef.value.open()};handleChange=e=>{this.draft=e.target.value};handleSave=()=>{this.set(this.codeSetting,this.draft,!1)};handleClose=()=>{this.dialogOpen=!1};renderCode({note:e="",disabled:i=!1}={}){return t`
      <div class="mb">
        <button class="primary full" ?disabled="${i}" @click="${this.handleOpen}">Open code editor</button>
        ${e?t`<small class="d-b tc-muted mt">${e}</small>`:""}
      </div>
      <k-dialog ${a(this.dialogRef)} confirm-text="${this.codeSaveText}" cancel-text="Cancel" .confirmAction="${this.handleSave}" @close="${this.handleClose}">
        <h5 slot="title" class="pyh px m0">${this.codeTitle}</h5>
        ${this.dialogOpen?t`
          <div class="p">
            <k-code-editor language="${this.codeLanguage}" controls="full" .value="${this.draft}" @change="${this.handleChange}"></k-code-editor>
          </div>`:""}
      </k-dialog>
    `}static styles=i`
    k-dialog {
      --width: 96vw;
      --height: 94vh;
    }
    k-code-editor {
      height: calc(94vh - 10.5rem);
      min-height: 20rem;
    }
  `}