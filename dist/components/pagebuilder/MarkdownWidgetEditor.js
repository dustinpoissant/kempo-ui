import t from"./WidgetEditor.js";import{html as e,css as i}from"../../lit-all.min.js";import"../Markdown.js";export default class r extends t{static properties={...t.properties,editing:{state:!0},draft:{state:!0},saved:{state:!0}};constructor(){super(),this.editing=!1,this.draft="",this.saved=null}updated(t){super.updated(t),t.has("editing")&&this.editing&&this.renderRoot.querySelector("textarea")?.focus()}get source(){return this.saved??this.textContent}startEditing=()=>{this.draft=this.source,this.editing=!0};handleSelected=t=>{this.selected=t.detail.selected,this.selected&&this.startEditing()};handleClick=()=>{this.startEditing()};handleInput=t=>{this.draft=t.target.value};commit=()=>{if(!this.editing)return;const t=this.draft,e=t!==this.source;this.editing=!1,this.saved=t,e&&this.emitChange({markdown:t})};render(){if(this.editing)return e`<textarea class="draft" .value="${this.draft}" @input="${this.handleInput}" @blur="${this.commit}"></textarea>`;const t=this.source;return t.trim()?e`<div class="rendered" @click="${this.handleClick}"><k-markdown .value="${t}"></k-markdown></div>`:e`<div class="placeholder" @click="${this.handleClick}">Click here to edit using Markdown</div>`}static styles=i`
    :host {
      display: block;
    }
    textarea.draft {
      display: block;
      box-sizing: border-box;
      width: 100%;
      min-height: 6rem;
      margin: 0;
      padding: 0;
      border: 0;
      outline: none;
      background: transparent;
      color: inherit;
      font: inherit;
      line-height: inherit;
      field-sizing: content;
      height: auto;
      max-height: none;
      overflow: hidden;
      resize: none;
    }
    .rendered {
      cursor: text;
    }
    .placeholder {
      cursor: text;
      font-style: italic;
      opacity: 0.55;
    }
  `}customElements.define("k-page-builder-markdown-editor",r);