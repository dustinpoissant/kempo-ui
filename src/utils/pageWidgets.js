import defaults from './pageWidgetDefaults.js';

/*
  The widgets a page can use. PageBuilder.widgets is this list and PageBuilder.addWidget adds to it. PageRenderer reads
  the same list, so a page that only renders a builder's JSON registers the same widgets (import addWidget from here).
  Nothing here touches the DOM, so it can be imported on a server.

  A widget is { name, title, category, tag, ... }:
    name                  the type stored in the page's JSON (lowercase letters, digits and hyphens)
    title                 the name shown in the Add list, the tree and the settings
    category              the group in the Add list (content, media, layout, interactive, or any name)
    categoryTitle         the group's heading, for a new category
    icon, iconSrc         a kempo-ui icon name, or the path of an icon file
    iconRotation          degrees to turn the icon clockwise (a right facing icon with 90 points down)
    description, keywords shown in the Add list, and matched by search
    tag                   the element the page uses for it
    page                  module URL(s) the page needs (the elements the widget's markup uses), loaded on the page
    editor, editorTag     a module URL for the element the builder shows it with, and that element's tag
    settings, settingsTag a module URL for the element the settings panel shows, and that element's tag
    attributes            the settings (see attributeTypes in the builder); a select with `beside: 'name'` is drawn on the same line as that number setting, with no label of its own (a value and its unit)
    slots                 where other widgets go: [{ name, label }]
    children              widgets a new one starts with: { slotName: ['type', ...] }
    section               true for a part of another widget (a column, a tab): added from its parent's settings
    inline                true for a widget that sits in a line with others (a button, an icon): drawn inline-block;
                          any other widget is drawn as a block, so its margin, padding and border apply
    hideStyles            parts of the Styles tab the widget does not have, because it has its own setting for them: 'box' (margin,
                          padding, corners, sides), 'background', 'textColour', 'align', 'id', 'classes'. They are left out of the tab, and
                          anything stored for them is not written on the page
    keydown               optional function(event, { node, path, html }) for a key pressed in an editable part of the widget (data-pb-edit),
                          where `path` names the part and `html` is what is typed in it now (not stored yet). It returns null to leave the key
                          alone, or { attrs, focus } to store those settings, draw the page again, and put the caret in the part at the `focus`
                          path. The key's default is cancelled when it does
    display               the display class the widget's first element gets, instead of d-b (or d-ib with `inline`); '' for none, for a
                          widget that sets its own display (Columns is flex, a Hero sets it inline), which d-b would override
    content               { name, mode } the attribute that is the element's text ('html', 'text' or 'raw')
    classes, style        functions of the attributes, returning kempo-css classes and an inline style
    prepare               optional async function(node) run when a page is shown in the builder, for data that comes from outside
                          the page (a picture's size, say). It resolves to null, or to a function(liveNode) that changes the
                          live widget and returns true when it did; the builder then publishes the change
    render                function(node, ctx, info, definition) returning the widget's whole HTML
*/

const NAME = /^[a-z][a-z0-9-]*$/;

const normalize = config => {
  if(!config || !NAME.test(config.name || '')) throw new Error(`Widget name "${config?.name}" must start with a letter and use only lowercase letters, digits and hyphens`);
  if(!config.title) throw new Error(`Widget "${config.name}" needs a title`);
  if(!NAME.test(config.tag || '')) throw new Error(`Widget "${config.name}" needs a tag name`);
  if(config.editor && !config.editorTag) throw new Error(`Widget "${config.name}" has an editor module, so it needs an editorTag`);
  if(config.settings && !config.settingsTag) throw new Error(`Widget "${config.name}" has a settings module, so it needs a settingsTag`);
  return {
    category: 'content',
    icon: 'help',
    description: '',
    keywords: [],
    ...config,
    page: [config.page].flat().filter(Boolean),
    attributes: (config.attributes || []).map(attribute => ({ type: 'string', ...attribute })),
    slots: config.slots || [],
    children: config.children || {}
  };
};

/* Every widget a page can use, in the order they are listed in the Add list. */
export const widgets = defaults.map(normalize);

/*
  Adds a widget (or replaces the one with the same name). Returns the widget as it is stored.
*/
export const addWidget = config => {
  const definition = normalize(config);
  const index = widgets.findIndex(other => other.name === definition.name);
  if(index === -1) widgets.push(definition);
  else widgets[index] = definition;
  return definition;
};

/* The widgets by name, the form the tree, the renderer and the builder look them up in. */
export const registryOf = (list = widgets) => new Map(list.map(definition => [definition.name, definition]));
