/*
  The page tree. A page is { attrs, slots: { default: [nodes] } }, and each widget on it is a node:
  { id, type, attrs, slots: { [slotName]: [node, ...] } }. The functions here work on a list of nodes (the page's
  default slot, or any slot) and a registry (a Map of widget definitions by name). Nothing here touches the DOM, so the
  builder and a server can share it.
*/

export const MAX_DEPTH = 100;

export const newId = () => [...crypto.getRandomValues(new Uint8Array(6))].map(byte => byte.toString(16).padStart(2, '0')).join('');

export const createNode = (type, attrs = {}, slots = {}) => ({ id: newId(), type, attrs, slots });

/*
  A value inside a widget's attrs by path: 'html' is attrs.html, 'rows.1.0' is attrs.rows[1][0]. A widget marks a part of
  itself that can be edited on the page with the path of what it edits (data-pb-edit).
*/
export const valueAt = (attrs, path) => String(path).split('.').reduce((value, key) => (value === null || typeof value !== 'object' ? undefined : value[key]), attrs);

/* Sets the value at a path. The place has to exist already (an array position, or an object to put a name on), or nothing changes and it returns false. */
export const setValueAt = (attrs, path, value) => {
  const keys = String(path).split('.');
  const last = keys.pop();
  const parent = keys.reduce((object, key) => (object === null || typeof object !== 'object' ? undefined : object[key]), attrs);
  if(parent === null || typeof parent !== 'object') return false;
  parent[last] = value;
  return true;
};

export const attributeDefault = attribute => structuredClone(attribute.default ?? (attribute.type === 'boolean' ? false : ''));

const slotsOf = definition => definition?.slots || [];

/*
  Calls fn(node, { parent, slot, list, index, depth }) for every node, parents before children. Return false from fn to
  skip a node's children.
*/
export const walk = (nodes, fn) => walkSlot(nodes, '', null, 1, fn);

const walkSlot = (children, slot, parent, depth, fn) => {
  children.forEach((node, index) => {
    if(fn(node, { parent, slot, list: children, index, depth }) === false) return;
    for(const [name, grandchildren] of Object.entries(node.slots || {})) walkSlot(grandchildren, name, node, depth + 1, fn);
  });
};

export const findNode = (nodes, id) => {
  let found = null;
  walk(nodes, (node, info) => {
    if(node.id !== id) return undefined;
    found = { node, ...info };
    return false;
  });
  return found;
};

/* The list a slot of a parent holds (the list of nodes itself when there is no parent), creating the slot if needed. */
export const findSlot = (nodes, parentId, slot) => {
  if(!parentId) return nodes;
  const found = findNode(nodes, parentId);
  if(!found) return null;
  found.node.slots = found.node.slots || {};
  found.node.slots[slot] = found.node.slots[slot] || [];
  return found.node.slots[slot];
};

export const countNodes = nodes => {
  let count = 0;
  walk(nodes, () => { count++; });
  return count;
};

/* The depth of the deepest node. A list of top-level nodes is depth 1. */
export const maxDepth = nodes => {
  let deepest = 0;
  walk(nodes, (node, { depth }) => { if(depth > deepest) deepest = depth; });
  return deepest;
};

export const cloneNodes = (nodes, freshIds = false) => nodes.map(node => cloneNode(node, freshIds));

export const cloneNode = (node, freshIds = false) => ({
  id: freshIds ? newId() : node.id,
  type: node.type,
  attrs: structuredClone(node.attrs || {}),
  slots: Object.fromEntries(Object.entries(node.slots || {}).map(([slot, children]) => [slot, cloneNodes(children, freshIds)]))
});

export const removeNode = (nodes, id) => {
  const found = findNode(nodes, id);
  if(!found) return null;
  found.list.splice(found.index, 1);
  return found.node;
};

/* True when moving the node under the ancestor would put a node inside itself. */
export const isInside = (nodes, ancestorId, id) => {
  const ancestor = findNode(nodes, ancestorId);
  if(!ancestor) return false;
  return !!findNode([ancestor.node], id);
};

/* The slot a widget's children go into by default (its first), or null for a widget with no slot. */
export const firstSlotOf = (registry, node) => slotsOf(registry.get(node.type))[0]?.name ?? null;

/*
  Whether a widget may be placed in this slot of this parent (parent is null at the top level). Anything can go in
  anything: the only requirement is that the parent has the slot.
*/
export const canContain = (registry, parentNode, slotName, childType) => {
  if(!registry.has(childType)) return false;
  if(!parentNode) return true;
  return slotsOf(registry.get(parentNode.type)).some(slot => slot.name === slotName);
};

/* A new widget with its settings at their defaults, and the children it starts with (the two columns of Columns, say). */
export const defaultNode = (registry, type) => {
  const definition = registry.get(type);
  const attrs = {};
  for(const attribute of definition.attributes){
    const value = attributeDefault(attribute);
    if(value !== '' && value !== false) attrs[attribute.name] = value;
  }
  const node = createNode(type, attrs);
  for(const [slot, types] of Object.entries(definition.children || {})){
    node.slots[slot] = types.map(childType => defaultNode(registry, childType));
  }
  return node;
};

/* Puts a node in a parent's slot at an index. Returns true, or the reason it was refused. */
export const place = (nodes, registry, node, parentId, slot, index) => {
  const parent = parentId ? findNode(nodes, parentId)?.node : null;
  if(parentId && !parent) return 'That place no longer exists';
  if(!canContain(registry, parent, slot, node.type)) return `${registry.get(node.type)?.title ?? 'That widget'} cannot go there`;
  const depth = (parentId ? findNode(nodes, parentId).depth : 0) + maxDepth([node]);
  if(depth > MAX_DEPTH) return `Widgets cannot be nested more than ${MAX_DEPTH} levels deep`;
  const list = findSlot(nodes, parentId, slot);
  if(!list) return 'That place no longer exists';
  list.splice(Math.max(0, Math.min(index, list.length)), 0, node);
  return true;
};

/*
  Puts an existing node near a target: after it, or into the target's first slot when `inside` is set (the target is a
  container the person is adding to). Without a target it goes at the end. If the target's own list will not take it, it
  goes after the target's parent, and so on up. A target with nothing in it that takes the widget gets it inside.
*/
const placeNode = (nodes, registry, node, { targetId = null, inside = false, slot = null } = {}) => {
  const target = targetId ? findNode(nodes, targetId) : null;
  if(target && inside){
    const name = slot || firstSlotOf(registry, target.node);
    if(!name) return { error: `${registry.get(node.type).title} cannot go inside ${registry.get(target.node.type).title}` };
    const result = place(nodes, registry, node, target.node.id, name, findSlot(nodes, target.node.id, name).length);
    return result === true ? {} : { error: result };
  }
  if(!target){
    const result = place(nodes, registry, node, null, '', nodes.length);
    return result === true ? {} : { error: result };
  }
  const inner = firstSlotOf(registry, target.node);
  const placeInside = () => {
    const result = place(nodes, registry, node, target.node.id, inner, findSlot(nodes, target.node.id, inner).length);
    return result === true ? {} : { error: result };
  };
  const isSection = registry.get(node.type)?.section;
  if(inner && !isSection && !Object.values(target.node.slots || {}).some(children => children.length)) return placeInside();
  let current = target;
  let failure = '';
  while(current){
    const parentNode = current.parent;
    const result = place(nodes, registry, node, parentNode?.id ?? null, current.slot, current.index + 1);
    if(result === true) return {};
    failure = result;
    current = parentNode ? findNode(nodes, parentNode.id) : null;
  }
  return inner ? placeInside() : { error: failure };
};

/* Adds a new widget at its defaults. Returns { id } or { error }. */
export const addWidget = (nodes, registry, type, options = {}) => {
  const node = defaultNode(registry, type);
  const result = placeNode(nodes, registry, node, options);
  return result.error ? result : { id: node.id };
};

/* Adds nodes that already exist (a saved template's copies), one after the other. Returns { ids } or { error }. */
export const insertNodes = (nodes, registry, list, options = {}) => {
  const ids = [];
  let anchor = options;
  for(const node of list){
    const result = placeNode(nodes, registry, node, anchor);
    if(result.error){
      for(const id of ids) removeNode(nodes, id);
      return { error: result.error };
    }
    ids.push(node.id);
    anchor = { targetId: node.id };
  }
  return { ids };
};

export const removeWidgets = (nodes, ids) => {
  for(const id of ids) removeNode(nodes, id);
  return true;
};

/* Sections (columns, accordion sections, tabs) are added, ordered and removed from their parent's settings, never moved on the page. */
const sectionMoved = 'Sections are moved from their parent\'s settings';

/* Moves one node to a place. Refuses to put a node inside itself. */
export const moveWidget = (nodes, registry, id, parentId, slot, index) => {
  const found = findNode(nodes, id);
  if(!found) return 'That widget no longer exists';
  if(registry.get(found.node.type)?.section) return sectionMoved;
  if(parentId && (parentId === id || isInside(nodes, id, parentId))) return 'A widget cannot go inside itself';
  const backup = { list: found.list, index: found.index };
  const [node] = found.list.splice(found.index, 1);
  let target = index;
  if(backup.list === findSlot(nodes, parentId, slot) && backup.index < index) target = index - 1;
  const result = place(nodes, registry, node, parentId, slot, target);
  if(result !== true){
    backup.list.splice(backup.index, 0, node);
    return result;
  }
  return true;
};

/* Several nodes that share a list, moved together by one step. */
export const moveBy = (nodes, registry, ids, step) => {
  const found = ids.map(id => findNode(nodes, id)).filter(Boolean);
  if(!found.length) return 'Nothing is selected';
  if(found.some(item => registry.get(item.node.type)?.section)) return sectionMoved;
  const { list } = found[0];
  const indexes = found.map(item => item.index).sort((a, b) => a - b);
  const first = indexes[0];
  const last = indexes[indexes.length - 1];
  if(step < 0 && first === 0) return 'Already first';
  if(step > 0 && last === list.length - 1) return 'Already last';
  const moving = list.splice(first, last - first + 1);
  list.splice(first + step, 0, ...moving);
  return true;
};

/* Moves a node out of its parent, to sit just after it. */
export const moveOut = (nodes, registry, id) => {
  const found = findNode(nodes, id);
  if(!found?.parent) return 'Already at the top';
  const parent = findNode(nodes, found.parent.id);
  return moveWidget(nodes, registry, id, parent.parent?.id ?? null, parent.slot, parent.index + 1);
};

/* Moves a node into the widget just before it, at the end of the first slot that takes it. */
export const moveIn = (nodes, registry, id) => {
  const found = findNode(nodes, id);
  if(!found) return 'That widget no longer exists';
  for(let index = found.index - 1; index >= 0; index--){
    const sibling = found.list[index];
    const slot = firstSlotOf(registry, sibling);
    if(slot) return moveWidget(nodes, registry, id, sibling.id, slot, findSlot(nodes, sibling.id, slot).length);
  }
  return 'There is nothing before it to move into';
};

/* Copies nodes (with their children) to sit just after the last of them. Returns the ids of the copies. */
export const duplicateWidgets = (nodes, ids) => {
  const found = ids.map(id => findNode(nodes, id)).filter(Boolean);
  if(!found.length) return { error: 'Nothing is selected' };
  const { list } = found[0];
  const sorted = [...found].sort((a, b) => a.index - b.index);
  const copies = sorted.map(item => cloneNode(item.node, true));
  list.splice(sorted[sorted.length - 1].index + 1, 0, ...copies);
  return { ids: copies.map(copy => copy.id) };
};

/* Whether every node in the set shares one parent and slot (what multi-select allows). */
export const sharePlace = (nodes, ids) => {
  const found = ids.map(id => findNode(nodes, id));
  if(found.some(item => !item)) return false;
  return found.every(item => item.list === found[0].list);
};

/* The selection after a node is removed: its next sibling, else the previous, else its parent. */
export const neighbour = (nodes, id) => {
  const found = findNode(nodes, id);
  if(!found) return null;
  return found.list[found.index + 1]?.id ?? found.list[found.index - 1]?.id ?? found.parent?.id ?? null;
};

/* A copy of nodes with fresh ids, for inserting a saved template. */
export const freshCopies = nodes => nodes.map(node => cloneNode(node, true));

/* Whether an accordion section starts open: what its settings say, and until any section says, the first one. */
export const sectionOpen = (node, parent) => {
  if(node.attrs?.open !== undefined) return !!node.attrs.open;
  const sections = parent?.slots?.default || [];
  return sections[0] === node && !sections.some(section => section.attrs?.open !== undefined);
};
