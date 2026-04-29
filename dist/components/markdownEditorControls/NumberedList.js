import t from"./MarkdownEditorControl.js";import{html as e}from"../../lit-all.min.js";import"../Icon.js";export default class n extends t{constructor(){super(),this.label="Numbered list"}command(){const t=this.editor;if(!t)return;const e=t.textarea;e&&("write"!==t.mode&&(t.mode="write"),t.updateComplete.then(()=>{e.focus();const{selectionStart:n,selectionEnd:l,value:s}=e,i=s.lastIndexOf("\n",n-1)+1,r=s.indexOf("\n",l),o=-1===r?s.length:r,a=s.substring(i,o).split("\n"),c=/^\d+\. /,u=a.filter(t=>t.length>0);let d;if(u.length>0&&u.every(t=>c.test(t)))d=a.map(t=>t.replace(c,""));else{let t=1;d=a.map(e=>{if(!e)return e;const n=e.replace(c,"");return`${t++}. ${n}`})}const m=d.join("\n"),b=s.substring(0,i)+m+s.substring(o);e.value=b,e.selectionStart=i,e.selectionEnd=i+m.length,t.value=b,e.dispatchEvent(new Event("input",{bubbles:!0}))}))}render(){return e`
      <button
        type="button"
        class=${this.btnClass}
        title=${this.label}
        aria-label=${this.label}
        @click=${this.handleClick}
      >
        <k-icon name="format_list_numbered"></k-icon>
      </button>
    `}}customElements.define("k-md-numbered-list",n);