import { widgetIcon, titleOf, hintOf, sectionLabelOf } from '../../src/utils/pageLabels.js';
import { widgets, registryOf } from '../../src/utils/pageWidgets.js';
import { render } from '../../src/lit-all.min.js';

/*
  Utility Functions
*/
const registry = registryOf(widgets);

const wait = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms));

const draw = async definition => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  render(widgetIcon(definition), host);
  const icon = host.querySelector('k-icon');
  await icon.updateComplete;
  await wait();
  return { host, icon };
};

/*
  Tests
*/
export default {
  'a widget icon is the icon by name, by file with iconSrc, or a help icon when it has none': async ({ pass, fail }) => {
    const named = await draw({ icon: 'star' });
    const sourced = await draw({ iconSrc: '/icons/card.svg' });
    const none = await draw({});
    const missing = await draw(undefined);
    const result = [named.icon.getAttribute('name'), sourced.icon.getAttribute('src'), none.icon.getAttribute('name'), missing.icon.getAttribute('name')];
    for(const item of [named, sourced, none, missing]) item.host.remove();
    if(result.join() !== 'star,/icons/card.svg,help,help') return fail(`Expected star, the file, help and help, got ${result.join()}`);
    if(sourced.icon.getAttribute('name')) return fail('An icon from a file has no name');
    pass('The widget icon is chosen');
  },

  'a widget icon is turned clockwise by iconRotation in degrees, and not turned without it': async ({ pass, fail }) => {
    const turned = await draw({ icon: 'chevron', iconRotation: 90 });
    const sourced = await draw({ iconSrc: '/icons/card.svg', iconRotation: 180 });
    const plain = await draw({ icon: 'chevron' });
    const transform = element => getComputedStyle(element.shadowRoot.querySelector('svg')).transform;
    const result = {
      turned: turned.icon.getAttribute('rotation'),
      turnedTransform: transform(turned.icon),
      sourced: sourced.icon.getAttribute('rotation'),
      plain: plain.icon.getAttribute('rotation'),
      plainTransform: transform(plain.icon)
    };
    for(const item of [turned, sourced, plain]) item.host.remove();
    if(result.turned !== '90' || result.sourced !== '180') return fail(`The rotation is passed to the icon, got ${result.turned} and ${result.sourced}`);
    if(result.turnedTransform !== 'matrix(0, 1, -1, 0, 0, 0)') return fail(`90 degrees turns the icon clockwise, got ${result.turnedTransform}`);
    if(result.plain || (result.plainTransform !== 'none' && result.plainTransform !== 'matrix(1, 0, 0, 1, 0, 0)')) return fail(`No iconRotation leaves the icon as it is, got "${result.plain}" ${result.plainTransform}`);
    pass('The icon is turned by iconRotation');
  },

  'the Show more widget points its icon down by turning a right facing one': async ({ pass, fail }) => {
    const definition = registry.get('show-more');
    const shown = await draw(definition);
    const turn = shown.icon.getAttribute('rotation');
    const name = shown.icon.getAttribute('name');
    shown.host.remove();
    if(name !== 'expand_circle' || turn !== '90') return fail(`Show more uses expand_circle turned 90 degrees, got ${name} ${turn}`);
    if(widgets.filter(item => item.iconRotation !== undefined && typeof item.iconRotation !== 'number').length) return fail('iconRotation is a number of degrees');
    pass('Show more points down');
  },

  'the title of a widget is its definition title, or its type when it is not registered': async ({ pass, fail }) => {
    const known = titleOf(registry, { type: 'columns' });
    const slide = titleOf(registry, { type: 'slide' });
    const unknown = titleOf(registry, { type: 'mystery' });
    if(known !== 'Columns' || slide !== 'Slide' || unknown !== 'mystery') return fail(`Expected Columns, Slide and mystery, got ${known}, ${slide}, ${unknown}`);
    pass('Titles come from the definitions');
  },

  'the hint of a widget is its text, or its label, title, name, condition, source or link, shortened': async ({ pass, fail }) => {
    const long = 'x'.repeat(60);
    const results = [
      hintOf({ type: 'text', attrs: { html: '<p>Hello <b>big</b>&nbsp;world</p>' } }),
      hintOf({ type: 'text', attrs: { html: `<p>${long}</p>` } }).length,
      hintOf({ type: 'button', attrs: { label: 'Buy', href: '/buy' } }),
      hintOf({ type: 'accordion-item', attrs: { title: 'Heading' } }),
      hintOf({ type: 'image', attrs: { src: '/a.jpg' } }),
      hintOf({ type: 'file', attrs: { href: '/a.pdf' } }),
      hintOf({ type: 'group', attrs: {} })
    ];
    if(results[0] !== 'Hello big world') return fail(`Markup and spaces are cleaned from text, got "${results[0]}"`);
    if(results[1] !== 40) return fail(`A hint is at most 40 characters, got ${results[1]}`);
    if(results[2] !== 'Buy' || results[3] !== 'Heading' || results[4] !== '/a.jpg' || results[5] !== '/a.pdf') return fail(`The label, title, source and link are hints, got ${results.slice(2, 6).join()}`);
    if(results[6] !== '') return fail(`A widget with nothing to show has no hint, got "${results[6]}"`);
    pass('Hints are worked out');
  },

  'a section is labelled by its place or its heading: Column 1, Slide 2, Tab spacer, its label or title, or Section number': async ({ pass, fail }) => {
    const results = [
      sectionLabelOf({ type: 'column', attrs: {} }, 0),
      sectionLabelOf({ type: 'column', attrs: {} }, 2),
      sectionLabelOf({ type: 'slide', attrs: {} }, 1),
      sectionLabelOf({ type: 'tab-spacer', attrs: {} }, 3),
      sectionLabelOf({ type: 'tab-item', attrs: { label: 'Parts' } }, 0),
      sectionLabelOf({ type: 'accordion-item', attrs: { title: 'Q' } }, 0),
      sectionLabelOf({ type: 'tab-item', attrs: {} }, 4)
    ];
    if(results.join() !== 'Column 1,Column 3,Slide 2,Tab spacer,Parts,Q,Section 5') return fail(`Got ${results.join()}`);
    pass('Sections are labelled');
  }
};
