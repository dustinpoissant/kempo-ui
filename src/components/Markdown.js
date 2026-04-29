import { html, unsafeHTML } from '../lit-all.min.js';
import LightComponent from './LightComponent.js';
import renderMarkdown from '../utils/renderMarkdown.js';
import sanitizeHtml, { STRIP_COMPLETELY } from '../utils/sanitizeHtml.js';

/*
  k-markdown

  Reads markdown from its child text content (or the `value` attribute) and
  renders the HTML equivalent in-place. Markdown is parsed with the vendored
  `marked` (CommonMark + GFM) and the resulting HTML is run through
  `sanitizeHtml` before being inserted, with the same allowed-tags /
  disallowed-tags / scripts-enabled controls as MarkdownEditor's preview.

  Renders to the light DOM so page-level typography and styles cascade into
  headings, paragraphs, tables, etc. without extra wiring.
*/

export default class Markdown extends LightComponent {
  static properties = {
    value: { type: String },
    breaks: { type: Boolean, reflect: true },
    allowedTags: { type: String, reflect: true, attribute: 'allowed-tags' },
    disallowedTags: { type: String, reflect: true, attribute: 'disallowed-tags' },
    scriptsEnabled: { type: Boolean, reflect: true, attribute: 'scripts-enabled' }
  };

  #captured = false;

  /*
    Lifecycle Callbacks
  */
  constructor() {
    super();
    this.value = '';
    this.breaks = false;
    this.allowedTags = '';
    this.disallowedTags = '';
    this.scriptsEnabled = false;
  }

  connectedCallback() {
    // Capture and clear the original markdown children BEFORE Lit appends
    // its lightRoot div — once super runs, lightRoot lives among the
    // siblings we'd otherwise scan. After capture, the markdown lives on
    // the `value` property; the source nodes are dropped so the parsed
    // HTML doesn't render alongside its raw source.
    if(!this.#captured){
      this.#captured = true;
      const text = this.textContent || '';
      const dedented = dedent(text);
      while(this.firstChild) this.removeChild(this.firstChild);
      if(!this.hasAttribute('value') && !this.value && dedented){
        this.value = dedented;
      }
    }
    super.connectedCallback();
  }

  /*
    Public Methods
  */
  get renderedHtml() {
    const opts = {};
    const resolved = this.#resolvedAllowedTags;
    if(resolved) opts.allowedTags = resolved;
    if(this.scriptsEnabled){
      const stripCompletely = new Set(STRIP_COMPLETELY);
      stripCompletely.delete('SCRIPT');
      opts.stripCompletely = stripCompletely;
    }
    return sanitizeHtml(renderMarkdown(this.value || '', { breaks: this.breaks }), opts);
  }

  /*
    Utility
  */
  get #resolvedAllowedTags() {
    const allow = (this.allowedTags || '').trim();
    const deny = (this.disallowedTags || '').trim();
    if(allow && deny){
      console.warn('[k-markdown] `allowed-tags` and `disallowed-tags` are mutually exclusive; using `allowed-tags`.');
    }
    if(allow){
      if(allow === '*') return { has: () => true };
      return new Set(allow.split(',').map(t => t.trim().toUpperCase()).filter(Boolean));
    }
    if(deny){
      const denySet = new Set(deny.split(',').map(t => t.trim().toUpperCase()).filter(Boolean));
      return { has: (tag) => !denySet.has(tag) };
    }
    return null;
  }

  /*
    Rendering
  */
  renderLightDom() {
    if(!this.value) return html``;
    return html`${unsafeHTML(this.renderedHtml)}`;
  }
}

/*
  Strip a common leading indent from every line so users can indent the
  markdown source to match the surrounding HTML without breaking parsing.
  Also trims fully-blank leading/trailing lines.
*/
const dedent = (text) => {
  const lines = text.split('\n');
  while(lines.length && lines[0].trim() === '') lines.shift();
  while(lines.length && lines[lines.length - 1].trim() === '') lines.pop();
  if(!lines.length) return '';
  let minIndent = Infinity;
  for(const line of lines){
    if(line.trim().length === 0) continue;
    const match = line.match(/^(\s*)/);
    const indent = match ? match[1].length : 0;
    if(indent < minIndent) minIndent = indent;
  }
  if(minIndent === Infinity) minIndent = 0;
  return lines.map(l => l.slice(minIndent)).join('\n');
};

customElements.define('k-markdown', Markdown);
