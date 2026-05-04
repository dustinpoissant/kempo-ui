import{html as t,css as e,nothing as i}from"../lit-all.min.js";import s from"./ShadowComponent.js";import o from"../utils/renderMarkdown.js";import l,{STRIP_COMPLETELY as a}from"../utils/sanitizeHtml.js";import n from"../utils/debounce.js";import"./Resize.js";import"./Tabs.js";const r=Symbol(),d=Symbol(),m=Symbol(),h=Symbol(),c=Symbol();export default class u extends s{static formAssociated=!0;static properties={value:{type:String},name:{type:String,reflect:!0},placeholder:{type:String,reflect:!0},disabled:{type:Boolean,reflect:!0},required:{type:Boolean,reflect:!0},readonly:{type:Boolean,reflect:!0},mode:{type:String,reflect:!0},allowedTags:{type:String,reflect:!0,attribute:"allowed-tags"},disallowedTags:{type:String,reflect:!0,attribute:"disallowed-tags"},scriptsEnabled:{type:Boolean,reflect:!0,attribute:"scripts-enabled"},controls:{type:String,reflect:!0}};constructor(){super(),this.internals=this.attachInternals(),this.value="",this.name="",this.placeholder="",this.disabled=!1,this.required=!1,this.readonly=!1,this.mode="write",this.allowedTags="",this.disallowedTags="",this.scriptsEnabled=!1,this.controls="",this[r]="",this[m]=!1,this[d]=n(()=>this.handleChange(),300)}async loadControls(){if(this[m])return;this[m]=!0;const t=new URL("./markdownEditorControls/",import.meta.url).href;await Promise.all([import(`${t}Bold.js`),import(`${t}Italic.js`),import(`${t}Strikethrough.js`),import(`${t}Heading.js`),import(`${t}Code.js`),import(`${t}Link.js`),import(`${t}Image.js`),import(`${t}Table.js`),import(`${t}BulletList.js`),import(`${t}NumberedList.js`),import(`${t}Quote.js`),import(`${t}Menu.js`),import(`${t}FormatBlock.js`),import(`${t}SpeechToText.js`)]),this.requestUpdate()}connectedCallback(){super.connectedCallback(),this.hasAttribute("value")&&(this[r]=this.getAttribute("value")),!this.value&&this[r]&&(this.value=this[r])}updated(t){super.updated(t),t.has("value")&&this.internals.setFormValue(this.value),t.has("controls")&&this.controls&&"none"!==this.controls&&this.loadControls(),this[c]()}formResetCallback(){this.value=this[r],this.mode="write"}formStateRestoreCallback(t){"string"==typeof t&&(this.value=t)}formDisabledCallback(t){this.disabled=t}focus(){"write"!==this.mode&&(this.mode="write"),this.updateComplete.then(()=>{this.shadowRoot?.querySelector("textarea")?.focus()})}blur(){this.shadowRoot?.querySelector("textarea")?.blur()}clear(){this.value=""}setMode(t){"write"!==t&&"preview"!==t||(this.mode=t)}togglePreview(){this.mode="write"===this.mode?"preview":"write"}get textarea(){return this.shadowRoot?.querySelector("textarea")||null}getSelection(){const t=this.textarea;return t?{start:t.selectionStart,end:t.selectionEnd,text:t.value.substring(t.selectionStart,t.selectionEnd)}:{start:0,end:0,text:""}}replaceSelection(t,{selectInserted:e=!0}={}){const i=this.textarea;i&&("write"!==this.mode&&(this.mode="write"),this.updateComplete.then(()=>{i.focus();const{selectionStart:s,selectionEnd:o}=i,l=i.value.substring(0,s),a=i.value.substring(o),n=l+t+a;i.value=n;const r=s+t.length;i.selectionStart=e?s:r,i.selectionEnd=r,this.value=n,i.dispatchEvent(new Event("input",{bubbles:!0}))}))}wrapSelection(t,e=t,i=""){const s=this.textarea;s?("write"!==this.mode&&(this.mode="write"),this.updateComplete.then(()=>{s.focus();const{selectionStart:o,selectionEnd:l,value:a}=s,n=a.substring(o,l);if(n.length>=t.length+e.length&&n.startsWith(t)&&n.endsWith(e)){const i=n.slice(t.length,n.length-e.length),r=a.substring(0,o)+i+a.substring(l);return s.value=r,s.selectionStart=o,s.selectionEnd=o+i.length,this.value=r,void s.dispatchEvent(new Event("input",{bubbles:!0}))}const r=a.substring(Math.max(0,o-t.length),o),d=a.substring(l,Math.min(a.length,l+e.length));if(r===t&&d===e){const i=a.substring(0,o-t.length)+n+a.substring(l+e.length);return s.value=i,s.selectionStart=o-t.length,s.selectionEnd=s.selectionStart+n.length,this.value=i,void s.dispatchEvent(new Event("input",{bubbles:!0}))}const m=n||i,h=a.substring(0,o)+t+m+e+a.substring(l);s.value=h;const c=o+t.length;s.selectionStart=c,s.selectionEnd=c+m.length,this.value=h,s.dispatchEvent(new Event("input",{bubbles:!0}))})):this.replaceSelection(t+i+e)}insertAtCursor(t){this.replaceSelection(t,{selectInserted:!1})}replaceInSelectedLines(t,e=""){const i=this.textarea;i&&("write"!==this.mode&&(this.mode="write"),this.updateComplete.then(()=>{i.focus();const{selectionStart:s,selectionEnd:o,value:l}=i,a=l.lastIndexOf("\n",s-1)+1,n=l.indexOf("\n",o),r=-1===n?l.length:n,d=l.substring(a,r),m=d.split("\n").map(i=>i.replace(t,e)).join("\n");if(m===d)return;const h=l.substring(0,a)+m+l.substring(r);i.value=h,i.selectionStart=a,i.selectionEnd=a+m.length,this.value=h,i.dispatchEvent(new Event("input",{bubbles:!0}))}))}insertLinePrefix(t,e=null){const i=this.textarea;i&&("write"!==this.mode&&(this.mode="write"),this.updateComplete.then(()=>{i.focus();const{selectionStart:s,selectionEnd:o,value:l}=i,a=l.lastIndexOf("\n",s-1)+1,n=l.indexOf("\n",o),r=-1===n?l.length:n,d=l.substring(a,r).split("\n"),m=d.filter(t=>t.length>0),h=m.length>0&&m.every(e=>e.startsWith(t)),c=d.map(i=>0===i.length?i:h?i.startsWith(t)?i.slice(t.length):i:i.startsWith(t)?i:e&&e.test(i)?i.replace(e,t):t+i).join("\n"),u=l.substring(0,a)+c+l.substring(r);i.value=u,i.selectionStart=a,i.selectionEnd=a+c.length,this.value=u,i.dispatchEvent(new Event("input",{bubbles:!0}))}))}get isEmpty(){return!(this.value||"").trim()}get renderedHtml(){const t={},e=this[h];if(e&&(t.allowedTags=e),this.scriptsEnabled){const e=new Set(a);e.delete("SCRIPT"),t.stripCompletely=e}return l(o(this.value||""),t)}get[h](){const t=(this.allowedTags||"").trim(),e=(this.disallowedTags||"").trim();if(t&&e&&console.warn("[k-markdown-editor] `allowed-tags` and `disallowed-tags` are mutually exclusive; using `allowed-tags`."),t)return"*"===t?{has:()=>!0}:new Set(t.split(",").map(t=>t.trim().toUpperCase()).filter(Boolean));if(e){const t=new Set(e.split(",").map(t=>t.trim().toUpperCase()).filter(Boolean));return{has:e=>!t.has(e)}}return null}[c]=()=>{const t=this.shadowRoot?.querySelector("textarea");this.required&&this.isEmpty?this.internals.setValidity({valueMissing:!0},"Please fill out this field.",t):this.internals.setValidity({})};handleInput=t=>{this.value=t.target.value,this.dispatchEvent(new CustomEvent("input",{detail:{value:this.value},bubbles:!0})),this[d]()};handleChange=()=>{this.dispatchEvent(new CustomEvent("change",{detail:{value:this.value},bubbles:!0}))};handleTabChange=t=>{const e=t.detail?.tab;e&&e!==this.mode&&(this.mode=e,this.dispatchEvent(new CustomEvent("mode-change",{detail:{mode:e},bubbles:!0})))};render(){const e=this.constructor.controlSets[this.controls]??this.constructor.controlSets[""];return t`
      <k-resize dimension="height" ?disabled=${this.disabled}>
        <div class="frame">
          <k-tabs fixed-height active=${this.mode} @tab=${this.handleTabChange}>
            <k-tab slot="tabs" for="write">Write</k-tab>
            <k-tab slot="tabs" for="preview">Preview</k-tab>
            <k-tab-spacer slot="tabs"></k-tab-spacer>
            <div slot="tabs" class="controls-top">
              <slot name="controls-top">${e.top??i}</slot>
            </div>
            <k-tab-content name="write">
              <textarea
                class="editor"
                .value=${this.value}
                placeholder=${this.placeholder}
                ?disabled=${this.disabled}
                ?readonly=${this.readonly}
                aria-label=${this.name||this.placeholder}
                @input=${this.handleInput}
                @blur=${this.handleChange}
                @change=${this.handleChange}
              ></textarea>
            </k-tab-content>
            <k-tab-content name="preview">
              <div
                class="preview"
                role="article"
                .innerHTML=${this.isEmpty?'<p class="preview-empty">Nothing to preview</p>':this.renderedHtml}
              ></div>
            </k-tab-content>
          </k-tabs>
          <div class="footer">
            <slot name="controls-bottom">${e.bottom??i}</slot>
          </div>
        </div>
      </k-resize>
    `}static styles=e`
    :host {
      --padding: 0.5rem 0.75rem;
      display: block;
    }
    :host([disabled]) {
      opacity: 0.6;
    }
    :host([disabled]) k-tabs {
      pointer-events: none;
    }
    /* readonly: textarea is read-only via the native attribute, but the
       toolbar buttons mutate value programmatically, bypassing it. Mute
       the controls-top wrapper and the footer so their buttons can't
       fire. The Write/Preview tabs themselves stay interactive. */
    :host([readonly]) .controls-top,
    :host([readonly]) .footer {
      pointer-events: none;
      opacity: 0.5;
    }
    .controls-top {
      display: inline-flex;
      align-items: center;
      flex-wrap: wrap;
    }
    k-resize {
      width: 100%;
      height: var(--height, 14rem);
      min-height: var(--min-height);
      max-height: var(--max-height);
      background: var(--c_bg);
    }
    .frame {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      min-height: 0;
      box-sizing: border-box;
    }
    k-tabs {
      flex: 1 1 auto;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }
    k-tab-content[active] {
      display: flex;
      flex-direction: column;
      padding: var(--spacer_q);
    }
    k-tab-content:not([active]) {
      display: none;
    }
    .editor,
    .preview {
      box-sizing: border-box;
      flex: 1 1 0;
      min-height: 0;
      width: 100%;
      padding: var(--padding);
      background: transparent;
      color: var(--tc);
      font: inherit;
      line-height: 1.5;
      overflow-y: auto;
      scrollbar-width: thin;
      resize: none;
      max-height: none !important;
    }
    .preview-empty {
      color: var(--tc_muted);
      font-style: italic;
    }
    .footer {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.5rem;
      flex: 0 0 auto;
      border-top: 1px solid var(--c_border);
      box-sizing: border-box;
    }
    .footer:not(:has(::slotted(*))) {
      display: none;
    }
  `;static controlSets={"":{top:null,bottom:null},none:{top:null,bottom:null},minimal:{top:t`
        <k-md-menu label="Heading">
          <k-icon slot="trigger" name="text_fields"></k-icon>
          <k-md-format-block tag="h1"></k-md-format-block>
          <k-md-format-block tag="h3"></k-md-format-block>
          <k-md-format-block tag="h5"></k-md-format-block>
        </k-md-menu>
        <k-md-bold></k-md-bold>
        <k-md-italic></k-md-italic>
        <k-md-bullet-list></k-md-bullet-list>
        <k-md-numbered-list></k-md-numbered-list>
      `,bottom:null},normal:{top:t`
        <k-md-menu label="Heading">
          <k-icon slot="trigger" name="text_fields"></k-icon>
          <k-md-format-block tag="h1"></k-md-format-block>
          <k-md-format-block tag="h2"></k-md-format-block>
          <k-md-format-block tag="h3"></k-md-format-block>
          <k-md-format-block tag="h4"></k-md-format-block>
          <k-md-format-block tag="h5"></k-md-format-block>
          <k-md-format-block tag="h6"></k-md-format-block>
        </k-md-menu>
        <k-md-bold></k-md-bold>
        <k-md-italic></k-md-italic>
        <k-md-quote></k-md-quote>
        <k-md-code></k-md-code>
        <k-md-link></k-md-link>
        <k-md-bullet-list></k-md-bullet-list>
        <k-md-numbered-list></k-md-numbered-list>
      `,bottom:null},full:{top:t`
        <k-md-menu label="Heading">
          <k-icon slot="trigger" name="text_fields"></k-icon>
          <k-md-format-block tag="h1"></k-md-format-block>
          <k-md-format-block tag="h2"></k-md-format-block>
          <k-md-format-block tag="h3"></k-md-format-block>
          <k-md-format-block tag="h4"></k-md-format-block>
          <k-md-format-block tag="h5"></k-md-format-block>
          <k-md-format-block tag="h6"></k-md-format-block>
        </k-md-menu>
        <k-md-bold></k-md-bold>
        <k-md-italic></k-md-italic>
        <k-md-strikethrough></k-md-strikethrough>
        <k-md-quote></k-md-quote>
        <k-md-code></k-md-code>
        <k-md-link></k-md-link>
        <k-md-image></k-md-image>
        <k-md-table></k-md-table>
        <k-md-bullet-list></k-md-bullet-list>
        <k-md-numbered-list></k-md-numbered-list>
        <k-md-speech-to-text></k-md-speech-to-text>
      `,bottom:null}}}customElements.define("k-markdown-editor",u);