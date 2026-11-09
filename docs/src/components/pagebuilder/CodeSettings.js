import e from"./WidgetSettings.js";import{html as t}from"../../lit-all.min.js";import"../CodeEditor.js";import i from"../Dialog.js";export default class d extends e{get codeSetting(){return"code"}get codeLanguage(){return"plaintext"}get codeTitle(){return"Edit code"}get codeSaveText(){return"Save"}handleOpen=()=>{let e=this.node.attrs?.[this.codeSetting]??"";i.create(t`
      <div class="p">
        <k-code-editor language="${this.codeLanguage}" controls="full" style="height: calc(94vh - 10.5rem); min-height: 20rem;" .value="${e}" @change="${t=>{e=t.target.value}}"></k-code-editor>
      </div>
    `,{title:this.codeTitle,confirmText:this.codeSaveText,cancelText:"Cancel",width:"96vw",height:"94vh",confirmAction:()=>this.set(this.codeSetting,e,!1)})};renderCode({note:e="",disabled:i=!1}={}){return t`
      <div class="mb">
        <button class="primary full" ?disabled="${i}" @click="${this.handleOpen}">Open code editor</button>
        ${e?t`<small class="d-b tc-muted mt">${e}</small>`:""}
      </div>
    `}}