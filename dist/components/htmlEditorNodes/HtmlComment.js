import{html as t,render as e}from"../../lit-all.min.js";import"../Icon.js";import"../Dropdown.js";const o="0.43.0",{DecoratorNode:n,$applyNodeReplacement:m,$getNodeByKey:r}=await(import(`https://esm.sh/lexical@${o}`));class s extends n{static getType(){return"html-comment"}static clone(t){return new s(t.__comment,t.__key)}static isVisualCompatible(t){return t.nodeType===Node.COMMENT_NODE}static preprocessHtml(t){return t.replace(/<!--(.*?)-->/gs,(t,e)=>`<span data-html-comment="${e.replace(/"/g,"&quot;")}"></span>`)}static importDOM(){return{span:t=>t.hasAttribute("data-html-comment")?{conversion:t=>({node:a(t.getAttribute("data-html-comment")||"")}),priority:2}:null}}static importJSON(t){return a(t.comment||"")}constructor(t="",e){super(e),this.__comment=t}getComment(){return this.getLatest().__comment}setComment(t){const e=this.getWritable();return e.__comment=t,e}createDOM(o,n){const m=document.createElement("span"),s=this.__key;return e(t`
      <k-dropdown close-on-select="false" open-direction="down left"
        contenteditable="false"
        data-html-comment=${this.__comment}
        title=${this.__comment||"HTML Comment (empty)"}
        @mousedown=${t=>t.stopPropagation()}
      >
        <k-icon slot="trigger" name="comment" class="tc-muted"
          style="cursor:pointer"
          @mousedown=${t=>{t.preventDefault(),t.stopPropagation()}}
        ></k-icon>
        <div class="pq">
          <div class="small tc-muted mbh">HTML Comment</div>
          <textarea class="ff-mono full p0"
					style="resize: both"
            .value=${this.__comment}
            @input=${t=>{const e=t.target.closest("[data-html-comment]");e&&(e.setAttribute("data-html-comment",t.target.value),e.title=t.target.value)}}
            @blur=${t=>{n.update(()=>{const e=r(s);e&&e.setComment(t.target.value)})}}
            @keydown=${t=>t.stopPropagation()}
            @beforeinput=${t=>t.stopPropagation()}
          ></textarea>
        </div>
      </k-dropdown>
    `,m),m.firstElementChild}updateDOM(t,e){return t.__comment!==this.__comment&&(e.setAttribute("data-html-comment",this.__comment),e.title=this.__comment||"HTML Comment (empty)"),!1}exportDOM(){return{element:document.createComment(this.__comment)}}exportJSON(){return{...super.exportJSON(),type:"html-comment",comment:this.__comment}}isInline(){return!0}isKeyboardSelectable(){return!0}decorate(){return null}}const a=(t="")=>m(new s(t)),c=t=>t instanceof s;export{s as HtmlCommentLexicalNode,a as $createHtmlCommentNode,c as $isHtmlCommentNode};export default class i extends HTMLElement{static lexicalNode=s}customElements.define("k-hen-html-comment",i);