import { styleClasses, styleCss, styleId, decorate, cleanSides, supportsStyles, shownStyles, STYLE_PARTS } from '../../src/utils/styles.js';

/*
  Tests
*/
export default {
  'margin and padding sides become one kempo-css class each': async ({ pass, fail }) => {
    const classes = styleClasses({ margin: { top: 'f', bottom: 'q' }, padding: { left: 'h' } });
    const expected = ['mt', 'mbq', 'plh'];
    if(JSON.stringify(classes) !== JSON.stringify(expected)) return fail(`Expected ${expected.join(' ')}, got ${classes.join(' ')}`);
    pass('sides become mt, mbq and plh');
  },

  'sides with the same size combine: all four is m, top and bottom is my, left and right is mx': async ({ pass, fail }) => {
    const all = { top: 'f', right: 'f', bottom: 'f', left: 'f' };
    if(JSON.stringify(styleClasses({ padding: all })) !== JSON.stringify(['p'])) return fail('all four whole spaces should be p');
    if(JSON.stringify(styleClasses({ margin: { top: 'h', bottom: 'h', left: 'q', right: 'q' } })) !== JSON.stringify(['myh', 'mxq'])) return fail('vertical and horizontal should combine');
    if(JSON.stringify(styleClasses({ margin: { top: 'h', right: 'h', bottom: 'h', left: 'h' } })) !== JSON.stringify(['mh'])) return fail('all four halves should be mh');
    if(JSON.stringify(styleClasses({ margin: { top: 'f', bottom: 'f', left: 'q' } })) !== JSON.stringify(['my', 'mlq'])) return fail('a pair and a single side should mix');
    pass('matching sides are combined');
  },

  'a background is a kempo-css class, and its opacity is the one style': async ({ pass, fail }) => {
    if(JSON.stringify(styleClasses({ background: 'primary' })) !== JSON.stringify(['bg-primary'])) return fail('a solid background should be its class');
    if(styleClasses({ background: 'primary', alpha: 50 }).length) return fail('a see-through background should not use a class');
    const css = styleCss({ background: 'primary', alpha: 50 });
    if(css !== 'background-color: oklch(from var(--c_primary) l c h / 0.5); color: var(--tc_on_primary)') return fail(css);
    if(styleCss({ background: 'primary', alpha: 100 }) !== '') return fail('a full opacity needs no style');
    if(styleCss({ background: 'inv', alpha: 30 }) !== 'background-color: oklch(from var(--c_bg__inv) l c h / 0.3); color: var(--tc_light)') return fail('the inverse background should use the light text');
    if(styleClasses({ background: 'pink' }).length) return fail('an unknown background should be left out');
    pass('backgrounds are classes, with an opacity style');
  },

  'a text colour is a kempo-css class': async ({ pass, fail }) => {
    if(JSON.stringify(styleClasses({ textColour: 'muted' })) !== JSON.stringify(['tc-muted'])) return fail('muted should be tc-muted');
    if(styleClasses({ textColour: 'mauve' }).length) return fail('an unknown text colour should be left out');
    pass('text colours are classes');
  },

  'a text alignment is a kempo-css class': async ({ pass, fail }) => {
    if(JSON.stringify(styleClasses({ align: 'center' })) !== JSON.stringify(['ta-center'])) return fail('center should be ta-center');
    if(JSON.stringify(styleClasses({ align: 'right', textColour: 'muted' })) !== JSON.stringify(['tc-muted', 'ta-right'])) return fail('alignment should follow the colour');
    if(styleClasses({ align: 'justify' }).length || styleClasses({ align: '' }).length) return fail('an unknown or empty alignment should be left out');
    pass('alignments are classes');
  },

  'hidden parts of the styles are left out, the rest kept, and nothing hidden changes nothing': async ({ pass, fail }) => {
    const styles = { margin: { top: 'f' }, background: 'primary', alpha: 40, textColour: 'muted', align: 'center', classes: 'x', id: 'y' };
    const noBackground = shownStyles(styles, ['background']);
    if('background' in noBackground || 'alpha' in noBackground) return fail(`The background and its opacity should go, got ${JSON.stringify(noBackground)}`);
    if(noBackground.align !== 'center' || noBackground.margin?.top !== 'f' || noBackground.classes !== 'x') return fail('The other styles should stay');
    if(styleClasses(noBackground).some(name => name.startsWith('bg-')) || styleCss(noBackground)) return fail('A hidden background must not be written');
    if(shownStyles(styles) !== styles || shownStyles(styles, []) !== styles) return fail('With nothing hidden the styles should be returned as they are');
    if(shownStyles(undefined, ['background']) !== undefined) return fail('No styles should stay no styles');
    const box = shownStyles({ margin: {}, padding: {}, corners: ['tl'], sides: ['top'], align: 'left' }, ['box']);
    if(JSON.stringify(Object.keys(box)) !== JSON.stringify(['align'])) return fail(`The box parts should all go, got ${Object.keys(box)}`);
    if(shownStyles(styles, ['nonsense']).background !== 'primary') return fail('An unknown part should hide nothing');
    if(!Object.keys(STYLE_PARTS).includes('background')) return fail('background should be a part');
    pass('hidden style parts are dropped');
  },

  'chosen corners and sides are classes, and all of them is the one class': async ({ pass, fail }) => {
    if(JSON.stringify(styleClasses({ corners: ['tl', 'tr'] })) !== JSON.stringify(['rtl', 'rtr'])) return fail('two corners should be rtl and rtr');
    if(JSON.stringify(styleClasses({ corners: ['tl', 'tr', 'bl', 'br'] })) !== JSON.stringify(['r'])) return fail('all corners should be r');
    if(JSON.stringify(styleClasses({ sides: ['top'] })) !== JSON.stringify(['bt'])) return fail('the top side should be bt');
    if(JSON.stringify(styleClasses({ sides: ['top', 'right', 'bottom', 'left'] })) !== JSON.stringify(['b'])) return fail('all sides should be b');
    pass('corners and sides are classes');
  },

  'extra classes are kept only when they are valid class names': async ({ pass, fail }) => {
    const classes = styleClasses({ classes: 'shadow  bad"name ok-2' });
    if(JSON.stringify(classes) !== JSON.stringify(['shadow', 'ok-2'])) return fail(`Got ${classes.join(' ')}`);
    pass('only valid class names are used');
  },

  'a side with no size, or an unknown size, gets no class': async ({ pass, fail }) => {
    if(styleClasses({ margin: { top: 'z', right: '' }, padding: {} }).length) return fail('none and unknown sizes should write no class');
    if(JSON.stringify(cleanSides({ top: 'z' })) !== JSON.stringify({ top: '', right: '', bottom: '', left: '' })) return fail('unknown sizes should be cleaned to none');
    pass('none and unknown sizes write nothing');
  },

  'an id is used only when it is a valid one': async ({ pass, fail }) => {
    if(styleId({ id: 'hero-1' }) !== 'hero-1') return fail('a valid id should be used');
    if(styleId({ id: '1bad' }) !== '' || styleId({ id: 'has space' }) !== '') return fail('an invalid id should be left out');
    pass('ids are checked');
  },

  'the classes, style and id are added to the first element and join what it has': async ({ pass, fail }) => {
    const styles = { margin: { top: 'f' }, background: 'primary', alpha: 50, id: 'x-1' };
    const plain = decorate('<p class="lead">Hi</p><p>two</p>', styles);
    const bare = decorate('<div style="position: relative">x</div>', { background: 'alt' });
    const withId = decorate('<button id="own">Go</button>', { id: 'x-1' });
    const expectedPlain = '<p class="lead mt" style="background-color: oklch(from var(--c_primary) l c h / 0.5); color: var(--tc_on_primary)" id="x-1">Hi</p><p>two</p>';
    if(plain !== expectedPlain) return fail(plain);
    if(bare !== '<div style="position: relative" class="bg-alt">x</div>') return fail(bare);
    if(withId !== '<button id="own">Go</button>') return fail(withId);
    pass('the first element gets the styles');
  },

  'sections take no styles': async ({ pass, fail }) => {
    if(supportsStyles({ section: true })) return fail('a section should not take styles');
    if(!supportsStyles({ tag: 'div' })) return fail('an ordinary widget should take styles');
    pass('sections are left out');
  }
};
