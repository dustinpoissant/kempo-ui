import { attributeDefault, walk } from './pageTree.js';
import { decorate, supportsStyles, shownStyles } from './styles.js';

/*
  Turns a page into HTML. It has no DOM and no Lit, so the same code can write a page on a server (server-side
  rendering) and draw the builder's preview in the browser. Pass `editor: true` for the builder's version: every widget's
  element gets data-pb-id and data-pb-title, containers are marked as places widgets can be dropped, and widgets with an
  editor element use its tag instead.
  A node whose type is not registered is left out of the page; in the builder it is shown as not available, so nothing
  is lost from view.

  Each widget definition may give:
    tag, editorTag      the element (editorTag is used in the builder only)
    classes(attrs)      kempo-css classes, as an array
    display             the display class its first element gets: by default d-b (d-ib when `inline`); '' for none, for a widget
                        that sets its own display (Columns' flex), which d-b would override
    style(attrs)        inline style, as a string
    content             { name, mode } where mode is 'html' (sanitized), 'text' (escaped) or 'raw' (as it is)
    render(node, ctx, info)
                        returns the whole HTML of the widget; ctx.standard(node, info, options) gives the default
                        element, with options { tag, classes, style, content, skip, extra }
*/

const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

export const escapeText = value => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const escapeAttribute = value => escapeText(value).replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const isEmpty = value => value === undefined || value === null || value === '';

const valueText = value => (typeof value === 'object' ? JSON.stringify(value) : String(value));

/* The attributes of a widget, as a string: only what is set and differs from the widget's default. Virtual settings stay in the tree. */
export const attributeString = (definition, node, skip = []) => {
  const parts = [];
  for(const attribute of definition.attributes){
    if(attribute.virtual || skip.includes(attribute.name)) continue;
    const value = node.attrs?.[attribute.name];
    if(isEmpty(value)) continue;
    const name = attribute.attr || attribute.name;
    const fallback = attributeDefault(attribute);
    if(attribute.type === 'boolean'){
      if(attribute.format === 'text'){
        if(value !== fallback) parts.push(`${name}="${value}"`);
      } else if(value === true || value === 'true') parts.push(name);
      continue;
    }
    if(value === fallback) continue;
    parts.push(`${name}="${escapeAttribute(valueText(value))}"`);
  }
  return parts.length ? ` ${parts.join(' ')}` : '';
};

const withSlot = (html, slot) => (slot === 'default' ? html : html.replace(/^(\s*<[a-zA-Z][\w-]*)/, `$1 slot="${escapeAttribute(slot)}"`));

export const createRenderer = (registry, { editor = false, sanitize = html => html } = {}) => {
  const ctx = {
    registry,
    editor,
    sanitize,
    escapeText,
    escapeAttribute,
    attributes: (definition, node, skip) => attributeString(definition, node, skip),
    /* The editor's marks for a widget's element (nothing on the page itself). */
    mark: (node, definition, extra = '') => (editor
      ? ` data-pb-id="${escapeAttribute(node.id)}" data-pb-title="${escapeAttribute(definition.title)}"${extra} tabindex="0"`
      : ''),
    /*
      A named slot (not the default) in the builder is a drop place of its own, so a widget can be dragged into it, even
      while it is empty. The widgets sit in one element that is itself slotted, instead of each carrying `slot`.
    */
    zone: (node, slot) => `<div slot="${escapeAttribute(slot.name)}" data-pb-id="${escapeAttribute(node.id)}" data-pb-slot="${escapeAttribute(slot.name)}" data-pb-title="${escapeAttribute(slot.label || slot.name)}">`
      + (node.slots?.[slot.name] || []).map((child, index) => ctx.node(child, { index, parent: node, slot: slot.name })).join('\n')
      + '</div>',
    /* The HTML of the widgets in one of a widget's slots. */
    children: (node, slot = 'default') => (node.slots?.[slot] || [])
      .map((child, index) => withSlot(ctx.node(child, { index, parent: node, slot }), slot))
      .join('\n'),
    /* The widget's own element, from its definition. */
    standard: (node, info = {}, options = {}) => {
      const definition = registry.get(node.type);
      const attrs = node.attrs || {};
      const tag = options.tag || (editor && definition.editorTag) || definition.tag;
      const classes = [...(definition.classes?.(attrs) || []), ...(options.classes || [])].filter(Boolean);
      const style = [definition.style?.(attrs), options.style].filter(Boolean).join('; ');
      const container = definition.slots?.length > 0;
      const slotMark = editor && definition.slots?.some(slot => slot.name === 'default') ? ' data-pb-slot="default"' : '';
      const attributes = ctx.attributes(definition, node, options.skip)
        + (classes.length ? ` class="${escapeAttribute(classes.join(' '))}"` : '')
        + (style ? ` style="${escapeAttribute(style)}"` : '')
        + (options.extra || '')
        + ctx.mark(node, definition, slotMark);
      if(VOID_TAGS.has(tag)) return `<${tag}${attributes}>`;
      const content = options.content ?? contentOf(definition, attrs, ctx);
      const children = container ? definition.slots.map(slot => (editor && slot.name !== 'default' ? ctx.zone(node, slot) : ctx.children(node, slot.name))).filter(Boolean).join('\n') : '';
      return `<${tag}${attributes}>${content}${children}</${tag}>`;
    },
    node: (node, info = {}) => {
      const definition = registry.get(node.type);
      if(!definition) return editor ? `<div class="p b r tc-muted ta-center" data-pb-id="${escapeAttribute(node.id)}" data-pb-title="${escapeAttribute(node.type)}" tabindex="0">${escapeText(node.type)} is not available in this builder, so it is kept as it was.</div>` : '';
      const html = definition.render ? definition.render(node, ctx, info, definition) : ctx.standard(node, info);
      return supportsStyles(definition) ? decorate(html, shownStyles(node.attrs?.styles, definition.hideStyles), 'display' in definition ? definition.display : (definition.inline ? 'd-ib' : 'd-b')) : html;
    }
  };
  return ctx;
};

const contentOf = (definition, attrs, ctx) => {
  if(!definition.content) return '';
  const value = attrs[definition.content.name] ?? '';
  if(definition.content.mode === 'raw') return String(value);
  if(definition.content.mode === 'html') return ctx.sanitize(String(value));
  return escapeText(value);
};

/* A page's top-level widgets as HTML. */
export const renderPage = (nodes, registry, options = {}) => {
  const ctx = createRenderer(registry, options);
  return (nodes || []).map((node, index) => ctx.node(node, { index, parent: null, slot: 'default' })).join('\n');
};

/* The module URLs a page's widgets need, each once: the page elements (and the editor's, in the builder). */
export const collectModules = (nodes, registry, { editor = false } = {}) => {
  const urls = new Set();
  walk(nodes || [], node => {
    const definition = registry.get(node.type);
    for(const url of definition?.page || []) urls.add(url);
    if(editor && definition?.editor) urls.add(definition.editor);
  });
  return [...urls];
};
