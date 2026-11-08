import { widgets, addWidget, registryOf } from '../../src/utils/pageWidgets.js';

/*
  Tests
*/
export default {
  'the defaults are the widgets kempo ships, without the sections': async ({ pass, fail }) => {
    const names = widgets.map(definition => definition.name);
    for(const name of ['text', 'image', 'columns', 'accordion', 'tabs', 'content-slider', 'icon']){
      if(!names.includes(name)) return fail(`${name} is missing`);
    }
    if(names.includes('row')) return fail('row was renamed columns');
    if(names.includes('social-icons')) return fail('social icons were removed, the button takes an icon');
    for(const name of ['column', 'accordion-item', 'tab-item', 'tab-spacer', 'slide']){
      const definition = widgets.find(other => other.name === name);
      if(!definition) return fail(`the ${name} section is missing from the registry`);
      if(!definition.section) return fail(`${name} is not a section`);
    }
    pass('the defaults are registered');
  },

  'a widget that breaks the rules is refused with a reason': async ({ pass, fail }) => {
    try {
      addWidget({ name: 'Bad Name', title: 'Bad', tag: 'pb-bad' });
    } catch (error) {
      if(!/lowercase/.test(error.message)) return fail(error.message);
      return pass('a bad name is refused');
    }
    fail('a bad name was accepted');
  },

  'an editor module needs its tag, and so do settings': async ({ pass, fail }) => {
    try {
      addWidget({ name: 'needs-tag', title: 'Needs tag', tag: 'pb-needs-tag', editor: '/x.js' });
    } catch (error) {
      if(!/editorTag/.test(error.message)) return fail(error.message);
      return pass('the editor tag is required');
    }
    fail('an editor without a tag was accepted');
  },

  'adding a widget with the same name replaces it': async ({ pass, fail }) => {
    addWidget({ name: 'quote-box', title: 'Quote', tag: 'pb-quote-box' });
    addWidget({ name: 'quote-box', title: 'Quote box', tag: 'pb-quote-box', category: 'content' });
    const matches = widgets.filter(definition => definition.name === 'quote-box');
    if(matches.length !== 1) return fail(`found ${matches.length} copies`);
    if(matches[0].title !== 'Quote box') return fail('the new title was not kept');
    pass('one widget per name');
  },

  'the registry is keyed by name': async ({ pass, fail }) => {
    const registry = registryOf();
    if(!registry.get('text') || registry.get('text').title !== 'Text') return fail('text is not in the registry');
    pass('lookup by name works');
  }
};
