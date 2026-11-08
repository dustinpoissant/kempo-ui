import fs from 'fs';
import { widgets } from '../../src/utils/pageWidgets.js';

/*
  Utility Functions
*/
const iconFile = name => new URL(`../../icons/${name}.svg`, import.meta.url);

/*
  Tests
*/
export default {
  'every widget with an icon has that icon in the icons folder': async ({ pass, fail }) => {
    const missing = widgets.filter(definition => definition.icon && !definition.iconSrc && !fs.existsSync(iconFile(definition.icon))).map(definition => `${definition.name} (${definition.icon})`);
    if(missing.length) return fail(`These widgets use an icon that is not in icons/: ${missing.join(', ')}`);
    pass('every widget icon exists');
  },

  'the widgets use the icons they were given': async ({ pass, fail }) => {
    const expected = {
      card: 'card',
      'content-slider': 'content_slider',
      slide: 'content_slider',
      'media-gallery': 'gallery-thumbnail',
      'photo-viewer': 'photo_library',
      hero: 'panorama',
      breakout: 'arrows-outward',
      container: 'width_full',
      file: 'attach_file',
      button: 'button',
      embed: 'iframe',
      group: 'fit_screen',
      accordion: 'expansion_panels',
      tabs: 'tab',
      'show-more': 'expand_circle'
    };
    const wrong = Object.entries(expected).filter(([name, icon]) => widgets.find(definition => definition.name === name)?.icon !== icon).map(([name, icon]) => `${name} should use ${icon}, got ${widgets.find(definition => definition.name === name)?.icon}`);
    if(wrong.length) return fail(wrong.join('; '));
    pass('the icons are as chosen');
  },

  'the icon of Show more is a right facing one that the widget turns down': async ({ pass, fail }) => {
    const definition = widgets.find(other => other.name === 'show-more');
    if(definition.iconRotation !== 90) return fail(`Show more turns its icon 90 degrees, got ${definition.iconRotation}`);
    const svg = fs.readFileSync(iconFile('expand_circle'), 'utf8');
    if(!svg.includes('M507-480 384-357l56 57 180-180-180-180-56 57 123 123Z')) return fail('expand_circle.svg should be the right facing circle with a chevron, which the widget turns');
    pass('the icon and its turn agree');
  },

  'every widget is in one of the four groups, and the section widgets are marked as sections': async ({ pass, fail }) => {
    const groups = ['content', 'media', 'layout', 'interactive'];
    const outside = widgets.filter(definition => !groups.includes(definition.category)).map(definition => `${definition.name} (${definition.category})`);
    if(outside.length) return fail(`These widgets are in no group: ${outside.join(', ')}`);
    const notSections = ['column', 'accordion-item', 'tab-item', 'tab-spacer', 'slide'].filter(name => !widgets.find(definition => definition.name === name)?.section);
    if(notSections.length) return fail(`These should be sections: ${notSections.join(', ')}`);
    const names = widgets.map(definition => definition.name);
    if(new Set(names).size !== names.length) return fail('A widget name is used twice');
    pass('the widgets are grouped');
  }
};
