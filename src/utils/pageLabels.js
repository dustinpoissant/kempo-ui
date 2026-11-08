import { html, nothing } from '../lit-all.min.js';
import '../components/Icon.js';

/*
  How the builder names a widget: its icon, its title in the tree and settings, a short hint of what it says or points
  to, and the label of a section (a column by its place, a tab or accordion section by its heading).
*/

export const widgetIcon = definition => (definition?.iconSrc
  ? html`<k-icon src="${definition.iconSrc}" rotation="${definition.iconRotation ?? nothing}"></k-icon>`
  : html`<k-icon name="${definition?.icon || 'help'}" rotation="${definition?.iconRotation ?? nothing}"></k-icon>`);

export const titleOf = (registry, node) => registry.get(node.type)?.title || node.type;

const plain = value => String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

export const hintOf = node => {
  const attrs = node.attrs || {};
  if(node.type === 'text') return plain(attrs.html).slice(0, 40);
  for(const key of ['label', 'title', 'name', 'condition', 'src', 'href']){
    if(attrs[key]) return String(attrs[key]).slice(0, 40);
  }
  return '';
};

export const sectionLabelOf = (node, index) => {
  if(node.type === 'column') return `Column ${index + 1}`;
  if(node.type === 'tab-spacer') return 'Tab spacer';
  if(node.type === 'slide') return `Slide ${index + 1}`;
  return node.attrs?.label || node.attrs?.title || `Section ${index + 1}`;
};
