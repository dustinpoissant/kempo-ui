import t from"./MarkdownEditorControl.js";import{html as e}from"../../lit-all.min.js";import"../Icon.js";export default class n extends t{constructor(){super(),this.label="Link"}command(){const t=this.getSelection(),e=this.editor;if(!e)return;const n=e.textarea;if(!n)return;const s=(t,s,l)=>{n.value=t,n.selectionStart=s,n.selectionEnd=l,n.focus(),e.value=t,n.dispatchEvent(new Event("input",{bubbles:!0}))},l=/\[([^\]]*)\]\([^)]*\)/g;let i;for(;null!==(i=l.exec(n.value));){const e=i.index,l=e+i[0].length;if(t.start>=e&&t.end<=l){const t=i[1];return void s(n.value.substring(0,e)+t+n.value.substring(l),e,e+t.length)}}const r=t.text||"link text",o=`[${r}](url)`,a=n.value.substring(0,t.start)+o+n.value.substring(t.end),u=t.start+1+r.length+2;s(a,u,u+3)}render(){return e`
      <button
        type="button"
        class=${this.btnClass}
        title=${this.label}
        aria-label=${this.label}
        @click=${this.handleClick}
      >
        <k-icon name="link"></k-icon>
      </button>
    `}}customElements.define("k-md-link",n);