import { html, render } from '../../lit-all.min.js';
import '../Icon.js';
import '../Dropdown.js';
const LEXICAL_VERSION = '0.43.0';
const { DecoratorNode, $applyNodeReplacement, $getNodeByKey } = await import(`https://esm.sh/lexical@${LEXICAL_VERSION}`);

class HtmlCommentLexicalNode extends DecoratorNode {
  static getType() { return 'html-comment'; }

  static clone(node) { return new HtmlCommentLexicalNode(node.__comment, node.__key); }

  static isVisualCompatible(domNode) {
    return domNode.nodeType === Node.COMMENT_NODE;
  }

  static preprocessHtml(htmlString) {
    return htmlString.replace(/<!--(.*?)-->/gs, (_, text) => `<span data-html-comment="${text.replace(/"/g, '&quot;')}"></span>`);
  }

  static importDOM() {
    return {
      span: domNode => {
        if(!domNode.hasAttribute('data-html-comment')) return null;
        return {
          conversion: n => ({ node: $createHtmlCommentNode(n.getAttribute('data-html-comment') || '') }),
          priority: 2
        };
      }
    };
  }

  static importJSON(json) { return $createHtmlCommentNode(json.comment || ''); }

  constructor(comment = '', key) {
    super(key);
    this.__comment = comment;
  }

  getComment() { return this.getLatest().__comment; }

  setComment(comment) {
    const self = this.getWritable();
    self.__comment = comment;
    return self;
  }

  createDOM(config, editor) {
    const container = document.createElement('span');
    const key = this.__key;
    render(html`
      <k-dropdown close-on-select="false" open-direction="down left"
        contenteditable="false"
        data-html-comment=${this.__comment}
        title=${this.__comment || 'HTML Comment (empty)'}
        @mousedown=${e => e.stopPropagation()}
      >
        <k-icon slot="trigger" name="comment" class="tc-muted"
          style="cursor:pointer"
          @mousedown=${e => { e.preventDefault(); e.stopPropagation(); }}
        ></k-icon>
        <div class="pq">
          <div class="small tc-muted mbh">HTML Comment</div>
          <textarea class="ff-mono full p0"
					style="resize: both"
            .value=${this.__comment}
            @input=${e => {
              const host = e.target.closest('[data-html-comment]');
              if(host) { host.setAttribute('data-html-comment', e.target.value); host.title = e.target.value; }
            }}
            @blur=${e => {
              editor.update(() => {
                const node = $getNodeByKey(key);
                if(node) node.setComment(e.target.value);
              });
            }}
            @keydown=${e => e.stopPropagation()}
            @beforeinput=${e => e.stopPropagation()}
          ></textarea>
        </div>
      </k-dropdown>
    `, container);
    return container.firstElementChild;
  }

  updateDOM(prevNode, dom) {
    if(prevNode.__comment !== this.__comment){
      dom.setAttribute('data-html-comment', this.__comment);
      dom.title = this.__comment || 'HTML Comment (empty)';
    }
    return false;
  }

  exportDOM() {
    return { element: document.createComment(this.__comment) };
  }

  exportJSON() {
    return { ...super.exportJSON(), type: 'html-comment', comment: this.__comment };
  }

  isInline() { return true; }

  isKeyboardSelectable() { return true; }

  decorate() { return null; }
}

const $createHtmlCommentNode = (comment = '') => $applyNodeReplacement(new HtmlCommentLexicalNode(comment));

const $isHtmlCommentNode = node => node instanceof HtmlCommentLexicalNode;

export { HtmlCommentLexicalNode, $createHtmlCommentNode, $isHtmlCommentNode };

export default class HenHtmlComment extends HTMLElement {
  static lexicalNode = HtmlCommentLexicalNode;
}

customElements.define('k-hen-html-comment', HenHtmlComment);
