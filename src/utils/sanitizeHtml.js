/*
  sanitizeHtml Utility
  - Whitelist-based HTML sanitizer for user-submitted rich text
  - Strips <script>, <style>, <iframe>, event-handler attributes, and javascript: URLs
  - Returns a string of safe HTML

  IMPORTANT: This is a frontend defense, NOT a substitute for server-side
  sanitization. ANY content you persist or rebroadcast must be sanitized again
  on the server. A determined attacker can submit raw HTTP without ever loading
  your client code.
*/

const DEFAULT_TAGS = new Set([
  'A', 'B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE', 'DEL',
  'BR', 'HR', 'P', 'DIV', 'SPAN', 'IMG', 'INPUT',
  'UL', 'OL', 'LI', 'BLOCKQUOTE', 'CODE', 'PRE',
  'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'TABLE', 'THEAD', 'TBODY', 'TFOOT', 'TR', 'TD', 'TH'
]);

// Tags whose contents are also unsafe (e.g. <script>'s textContent is JS source,
// <style>'s textContent is CSS that could contain expressions). Remove the
// entire element including children.
const STRIP_COMPLETELY = new Set([
  'SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'LINK', 'META', 'BASE',
  'FRAME', 'FRAMESET', 'NOSCRIPT', 'SVG', 'MATH'
]);

const DEFAULT_ATTRS_GLOBAL = new Set(['class']);
const DEFAULT_ATTRS_PER_TAG = {
  A: new Set(['href', 'title', 'target', 'rel']),
  IMG: new Set(['src', 'alt', 'title', 'width', 'height']),
  // marked emits `<input type="checkbox" disabled>` for GFM task list items
  // (`- [ ]` / `- [x]`). Only those three attributes are allowed; `disabled`
  // means the user can't actually toggle them in rendered output.
  INPUT: new Set(['type', 'checked', 'disabled']),
  // marked uses the (deprecated but still browser-supported) `align` attr
  // on table cells for column alignment from `:---` / `---:` separators.
  TD: new Set(['colspan', 'rowspan', 'align']),
  TH: new Set(['colspan', 'rowspan', 'scope', 'align'])
};

const SAFE_URL = /^(https?:|mailto:|tel:|\/|#|\.\.?\/)/i;

const sanitizeUrl = (value) => {
  if(!value) return '';
  const trimmed = String(value).trim();
  // Reject any URL that doesn't match the safelist (this rejects javascript:,
  // data:, vbscript:, etc.). Also reject anything that decodes weirdly.
  return SAFE_URL.test(trimmed) ? trimmed : '';
};

const sanitizeNode = (node, allowedTags, allowedAttrsGlobal, allowedAttrsPerTag, stripCompletely) => {
  // Iterate over a snapshot since we may remove children mid-loop
  const children = [...node.childNodes];
  for(const child of children){
    if(child.nodeType === Node.ELEMENT_NODE){
      const tagName = child.tagName;
      if(stripCompletely.has(tagName)){
        node.removeChild(child);
        continue;
      }
      if(!allowedTags.has(tagName)){
        // Replace the disallowed element with its sanitized children — this
        // preserves user text but drops the unsafe wrapper.
        sanitizeNode(child, allowedTags, allowedAttrsGlobal, allowedAttrsPerTag, stripCompletely);
        while(child.firstChild) node.insertBefore(child.firstChild, child);
        node.removeChild(child);
        continue;
      }
      // Strip disallowed attributes
      const tagSpecific = allowedAttrsPerTag[tagName] || new Set();
      for(const attr of [...child.attributes]){
        const name = attr.name.toLowerCase();
        const isAllowed = (
          allowedAttrsGlobal.has(name) ||
          tagSpecific.has(name) ||
          name.startsWith('data-')
        );
        if(!isAllowed){
          child.removeAttribute(attr.name);
          continue;
        }
        // URL attrs need extra scrutiny
        if(name === 'href' || name === 'src'){
          const safe = sanitizeUrl(attr.value);
          if(!safe){
            child.removeAttribute(attr.name);
          } else {
            child.setAttribute(attr.name, safe);
          }
        }
      }
      // For target=_blank links, force noopener/noreferrer
      if(tagName === 'A' && child.getAttribute('target') === '_blank'){
        child.setAttribute('rel', 'noopener noreferrer');
      }
      // Recurse into the (now-cleaned) element
      sanitizeNode(child, allowedTags, allowedAttrsGlobal, allowedAttrsPerTag, stripCompletely);
    } else if(child.nodeType === Node.COMMENT_NODE){
      // Drop HTML comments (could carry conditional comments etc.)
      node.removeChild(child);
    }
    // Text nodes pass through unchanged
  }
};

/*
  sanitizeHtml(html, options?)
  - html: string of untrusted HTML
  - options.allowedTags: Set<string> of UPPERCASE tag names (overrides default)
  - options.allowedAttrs: Set<string> of attr names allowed on every tag
  - options.allowedAttrsPerTag: { TAGNAME: Set<string> }
  - options.stripCompletely: Set<string> of UPPERCASE tag names whose entire
      subtree (element + content) is always removed regardless of
      allowedTags. Defaults to STRIP_COMPLETELY (script/iframe/style/etc.).
      Pass a narrowed set to opt back into one of these (e.g. SCRIPT) — but
      only when you trust the input.
*/
const sanitizeHtml = (html, options = {}) => {
  if(html === null || html === undefined) return '';
  const input = String(html);
  if(!input) return '';
  const allowedTags = options.allowedTags || DEFAULT_TAGS;
  const allowedAttrsGlobal = options.allowedAttrs || DEFAULT_ATTRS_GLOBAL;
  const allowedAttrsPerTag = options.allowedAttrsPerTag || DEFAULT_ATTRS_PER_TAG;
  const stripCompletely = options.stripCompletely || STRIP_COMPLETELY;
  // <template>.innerHTML parses without executing scripts, fetching images,
  // etc., so this is safe for untrusted strings.
  const tpl = document.createElement('template');
  tpl.innerHTML = input;
  sanitizeNode(tpl.content, allowedTags, allowedAttrsGlobal, allowedAttrsPerTag, stripCompletely);
  return tpl.innerHTML;
};

export default sanitizeHtml;
export { sanitizeHtml, DEFAULT_TAGS, DEFAULT_ATTRS_GLOBAL, DEFAULT_ATTRS_PER_TAG, STRIP_COMPLETELY };
