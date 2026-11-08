import '../../src/components/PageBuilder.js';

/*
  Utility Functions
*/
const wait = (ms = 150) => new Promise(resolve => setTimeout(resolve, ms));

const page = (...nodes) => ({ attrs: { title: 'Test' }, slots: { default: nodes } });

const text = (id, html) => ({ id, type: 'text', attrs: { html }, slots: {} });

const section = (id, title, attrs = {}, ...children) => ({ id, type: 'accordion-item', attrs: { title, ...attrs }, slots: { default: children } });

const accordion = (attrs, ...sections) => ({ id: 'ac', type: 'accordion', attrs, slots: { default: sections } });

const tab = (id, label, attrs = {}, ...children) => ({ id, type: 'tab-item', attrs: { label, ...attrs }, slots: { default: children } });

const tabs = (attrs, ...items) => ({ id: 'tb', type: 'tabs', attrs, slots: { default: items } });

const slide = (id, ...children) => ({ id, type: 'slide', attrs: {}, slots: { default: children } });

const slider = (attrs, ...slides) => ({ id: 'cs', type: 'content-slider', attrs, slots: { default: slides } });

const column = (id, ...children) => ({ id, type: 'column', attrs: {}, slots: { default: children } });

const columns = (...list) => ({ id: 'cols', type: 'columns', attrs: {}, slots: { default: list } });

const createBuilder = async value => {
  const builder = document.createElement('k-page-builder');
  builder.value = value;
  document.body.appendChild(builder);
  await builder.updateComplete;
  await builder.frame().ready;
  return builder;
};

const frameDoc = builder => builder.renderRoot.querySelector('iframe').contentDocument;

const waitForWidget = async (builder, id) => {
  for(let tries = 0; tries < 50; tries++){
    const found = frameDoc(builder).querySelector(`[data-pb-id="${id}"]`);
    if(found) return found;
    await wait(50);
  }
  return null;
};

const ready = async (builder, id) => {
  await waitForWidget(builder, id);
  await wait(300);
};

const openPanels = builder => [...frameDoc(builder).querySelectorAll('k-accordion-panel[active]')].map(panel => panel.getAttribute('name')).join();

const find = (builder, id) => {
  const search = nodes => {
    for(const node of nodes){
      if(node.id === id) return node;
      for(const children of Object.values(node.slots || {})){
        const found = search(children);
        if(found) return found;
      }
    }
    return null;
  };
  return search(builder.value.slots.default);
};

const ids = (builder, id) => (find(builder, id)?.slots.default || []).map(child => child.type).join();

const press = (element, type = 'mousedown') => {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, composed: true });
  element.dispatchEvent(event);
  return event;
};

/*
  Tests
*/
export default {
  'should keep the open accordion section open when the page is drawn again, and open the section a setting asks for': async ({ pass, fail }) => {
    const builder = await createBuilder(page(accordion({}, section('a', 'A', {}, text('ta', '<p>A</p>')), section('b', 'B', {}, text('tb', '<p>B</p>')), section('c', 'C', {}, text('tc', '<p>C</p>')))));
    await ready(builder, 'ac');
    const first = openPanels(builder);
    frameDoc(builder).querySelector('k-accordion-header[for-panel="pb-b"]').click();
    await wait(400);
    const opened = openPanels(builder);
    builder.setWidgetAttribute('ta', 'html', '<p>Changed</p>', false);
    await wait(700);
    await ready(builder, 'ac');
    const afterRedraw = openPanels(builder);
    builder.setWidgetAttribute('c', 'open', true, false);
    await wait(700);
    await ready(builder, 'ac');
    const afterDefault = openPanels(builder);
    builder.remove();
    if(first !== 'pb-a') return fail(`The first section starts open, got ${first}`);
    if(opened !== 'pb-b') return fail(`Clicking the second heading opens the second section, got ${opened}`);
    if(afterRedraw !== 'pb-b') return fail(`Changing something must not close the section that was opened, got ${afterRedraw}`);
    if(afterDefault !== 'pb-c') return fail(`Changing which section opens by default shows it, got ${afterDefault}`);
    pass('The open section is kept until the default changes');
  },

  'should keep the open tab, even when it is renamed, when the page is drawn again, and open the tab a setting asks for': async ({ pass, fail }) => {
    const builder = await createBuilder(page(tabs({}, tab('t1', 'One', {}, text('a', '<p>A</p>')), tab('t2', 'Two', {}, text('b', '<p>B</p>')))));
    await ready(builder, 'tb');
    const active = () => frameDoc(builder).querySelector('k-tabs').getAttribute('active');
    frameDoc(builder).querySelector('k-tab[for="pb-t2"]').shadowRoot.querySelector('#button').click();
    await wait(400);
    const opened = active();
    builder.setWidgetAttribute('a', 'html', '<p>Changed</p>', false);
    await wait(700);
    await ready(builder, 'tb');
    const afterRedraw = active();
    builder.setWidgetAttribute('t2', 'name', 'second', false);
    await wait(700);
    await ready(builder, 'tb');
    const afterRename = active();
    builder.setWidgetAttribute('tb', 'active', 't1', false);
    await wait(700);
    await ready(builder, 'tb');
    const afterDefault = active();
    builder.remove();
    if(opened !== 'pb-t2') return fail(`Clicking the second tab opens it, got ${opened}`);
    if(afterRedraw !== 'pb-t2') return fail(`Changing something must not go back to the first tab, got ${afterRedraw}`);
    if(afterRename !== 'second') return fail(`Renaming the open tab keeps it open, got ${afterRename}`);
    if(afterDefault !== 'pb-t1') return fail(`Changing the default open tab shows it, got ${afterDefault}`);
    pass('The open tab is kept until the default changes');
  },

  'should keep the slide being shown when the page is drawn again, and show the slide a setting asks for': async ({ pass, fail }) => {
    const builder = await createBuilder(page(slider({}, slide('a', text('ta', '<p>A</p>')), slide('b', text('tb', '<p>B</p>')), slide('c', text('tc', '<p>C</p>')))));
    await ready(builder, 'cs');
    const shown = () => frameDoc(builder).querySelector('k-content-slider').textContent.trim();
    frameDoc(builder).querySelector('k-content-slider').next();
    await wait(300);
    const opened = shown();
    builder.setWidgetAttribute('ta', 'html', '<p>Changed</p>', false);
    await wait(700);
    await ready(builder, 'cs');
    const afterRedraw = shown();
    builder.setWidgetAttribute('cs', 'active', 'c', false);
    await wait(700);
    await ready(builder, 'cs');
    const afterDefault = shown();
    builder.remove();
    if(opened !== 'B') return fail(`The arrow moves to the second slide, got ${opened}`);
    if(afterRedraw !== 'B') return fail(`Changing something must not go back to the first slide, got ${afterRedraw}`);
    if(afterDefault !== 'C') return fail(`Changing the start slide shows it, got ${afterDefault}`);
    pass('The shown slide is kept until the start slide changes');
  },

  'should add a widget into the open section of a selected accordion': async ({ pass, fail }) => {
    const builder = await createBuilder(page(accordion({}, section('a', 'A', {}, text('ta', '<p>A</p>')), section('b', 'B', { open: true }), section('c', 'C', {}, text('tc', '<p>C</p>')))));
    await ready(builder, 'ac');
    builder.select('ac');
    await wait(300);
    builder.insert('text');
    await wait(600);
    const result = ['a', 'b', 'c'].map(id => ids(builder, id)).join('|');
    builder.remove();
    if(result !== 'text|text|text') return fail(`The widget should go into the open section b, got ${result}`);
    pass('A widget goes into the open section');
  },

  'should add a widget into the active tab of selected tabs': async ({ pass, fail }) => {
    const builder = await createBuilder(page(tabs({ active: 't2' }, tab('t1', 'One', {}, text('a', '<p>A</p>')), tab('t2', 'Two'))));
    await ready(builder, 'tb');
    builder.select('tb');
    await wait(300);
    builder.insert('image');
    await wait(600);
    const result = `${ids(builder, 't1')}|${ids(builder, 't2')}`;
    builder.remove();
    if(result !== 'text|image') return fail(`The widget should go into the second tab, got ${result}`);
    pass('A widget goes into the active tab');
  },

  'should add a widget into the slide being shown of a selected content slider': async ({ pass, fail }) => {
    const builder = await createBuilder(page(slider({ active: 'b' }, slide('a', text('ta', '<p>A</p>')), slide('b'))));
    await ready(builder, 'cs');
    builder.select('cs');
    await wait(300);
    builder.insert('image');
    await wait(600);
    const result = `${ids(builder, 'a')}|${ids(builder, 'b')}`;
    builder.remove();
    if(result !== 'text|image') return fail(`The widget should go into the second slide, got ${result}`);
    pass('A widget goes into the shown slide');
  },

  'should add a widget into the first column of selected columns, and inside a selected group': async ({ pass, fail }) => {
    const builder = await createBuilder(page(columns(column('c1'), column('c2')), { id: 'g', type: 'group', attrs: {}, slots: { default: [] } }));
    await ready(builder, 'cols');
    builder.select('cols');
    await wait(300);
    builder.insert('image');
    await wait(600);
    builder.select('g');
    await wait(300);
    builder.insert('text');
    await wait(600);
    const result = `${ids(builder, 'c1')}|${ids(builder, 'c2')}|${ids(builder, 'g')}`;
    builder.remove();
    if(result !== 'image||text') return fail(`Expected image in the first column and text in the group, got ${result}`);
    pass('A widget goes into the first column, or the group');
  },

  'should add a slide, not a widget inside a slide, when a section is added to a selected content slider': async ({ pass, fail }) => {
    const builder = await createBuilder(page(slider({}, slide('a'), slide('b'))));
    await ready(builder, 'cs');
    builder.select('cs');
    await wait(300);
    builder.insert('slide');
    await wait(600);
    const slides = find(builder, 'cs').slots.default;
    builder.remove();
    if(slides.length !== 3 || slides.some(item => item.slots.default?.length)) return fail(`A third slide should be added to the slider, got ${slides.length} slides`);
    pass('A slide is added to the slider');
  },

  'should add a widget after a selected widget that cannot hold one': async ({ pass, fail }) => {
    const builder = await createBuilder(page(text('t1', '<p>One</p>'), text('t2', '<p>Two</p>')));
    await ready(builder, 't1');
    builder.select('t1');
    await wait(300);
    builder.insert('image');
    await wait(600);
    const order = builder.value.slots.default.map(item => item.type).join();
    builder.remove();
    if(order !== 'text,image,text') return fail(`The widget should go after the selected one, got ${order}`);
    pass('A widget goes after a selected widget');
  },

  'should select the accordion, tabs or slider when its heading, tab or arrow is pressed, without cancelling the press': async ({ pass, fail }) => {
    const builder = await createBuilder(page(
      accordion({}, section('a', 'A', {}, text('ta', '<p>A</p>')), section('b', 'B', {}, text('tb', '<p>B</p>'))),
      tabs({}, tab('t1', 'One', {}, text('t1a', '<p>A</p>')), tab('t2', 'Two', {}, text('t2a', '<p>B</p>'))),
      slider({}, slide('s1', text('x', '<p>X</p>')), slide('s2', text('y', '<p>Y</p>')))
    ));
    await ready(builder, 'ac');
    const doc = frameDoc(builder);
    const header = press(doc.querySelector('k-accordion-header[for-panel="pb-b"]'));
    const afterHeader = builder.selection.join();
    const tabPress = press(doc.querySelector('k-tab[for="pb-t2"]'));
    const afterTab = builder.selection.join();
    const arrow = doc.querySelector('k-content-slider').shadowRoot.querySelector('#next');
    const arrowPress = press(arrow);
    const afterArrow = builder.selection.join();
    builder.remove();
    if(afterHeader !== 'ac' || header.defaultPrevented) return fail(`A heading selects the accordion and is not cancelled, got "${afterHeader}" ${header.defaultPrevented}`);
    if(afterTab !== 'tb' || tabPress.defaultPrevented) return fail(`A tab selects the tabs and is not cancelled, got "${afterTab}" ${tabPress.defaultPrevented}`);
    if(afterArrow !== 'cs' || arrowPress.defaultPrevented) return fail(`An arrow selects the slider and is not cancelled, got "${afterArrow}" ${arrowPress.defaultPrevented}`);
    pass('Headings, tabs and arrows select their widget');
  },

  'should move between the slides with the slider arrows in the builder': async ({ pass, fail }) => {
    const builder = await createBuilder(page(slider({}, slide('s1', text('x', '<p>X</p>')), slide('s2', text('y', '<p>Y</p>')))));
    await ready(builder, 'cs');
    const element = frameDoc(builder).querySelector('k-content-slider');
    const next = element.shadowRoot.querySelector('#next');
    const prev = element.shadowRoot.querySelector('#prev');
    const start = { prev: prev.disabled, next: next.disabled };
    press(next);
    next.click();
    await wait(400);
    const second = element.textContent.trim();
    const end = { prev: prev.disabled, next: next.disabled };
    const keys = element.keyboardControls;
    builder.remove();
    if(!start.prev || start.next) return fail(`On the first slide only the previous arrow is disabled, got ${JSON.stringify(start)}`);
    if(second !== 'Y') return fail(`The next arrow shows the second slide, got ${second}`);
    if(end.next !== true || end.prev !== false) return fail(`On the last slide only the next arrow is disabled, got ${JSON.stringify(end)}`);
    if(keys !== false) return fail('The arrow keys are left for editing in the builder');
    pass('The arrows move between slides');
  },

  'should say what an empty place is when it shows, and hide it with its closed section or inactive tab': async ({ pass, fail }) => {
    const builder = await createBuilder(page(
      accordion({}, section('a', 'A'), section('b', 'B')),
      tabs({}, tab('t1', 'One'), tab('t2', 'Two')),
      slider({}, slide('s1'), slide('s2'))
    ));
    await ready(builder, 'ac');
    const doc = frameDoc(builder);
    const content = element => getComputedStyle(element, '::before').content;
    const openPanel = doc.querySelector('k-accordion-panel[name="pb-a"]');
    const closedPanel = doc.querySelector('k-accordion-panel[name="pb-b"]');
    const activeTab = doc.querySelector('k-tab-content[name="pb-t1"]');
    const idleTab = doc.querySelector('k-tab-content[name="pb-t2"]');
    const slideEl = doc.querySelector('[data-pb-id="s1"]');
    const result = {
      open: content(openPanel),
      closed: getComputedStyle(closedPanel).display,
      active: content(activeTab),
      idle: getComputedStyle(idleTab).display,
      slide: content(slideEl),
      hiddenSlide: !!doc.querySelector('[data-pb-id="s2"]')
    };
    builder.remove();
    if(!/is empty/.test(result.open) || !/Accordion section/.test(result.open)) return fail(`An open empty section says it is empty, got ${result.open}`);
    if(result.closed !== 'none') return fail(`A closed empty section is not shown, got ${result.closed}`);
    if(!/is empty/.test(result.active)) return fail(`The active empty tab says it is empty, got ${result.active}`);
    if(result.idle !== 'none') return fail(`An inactive empty tab is not shown, got ${result.idle}`);
    if(!/Slide is empty/.test(result.slide)) return fail(`The shown empty slide says it is empty, got ${result.slide}`);
    if(result.hiddenSlide) return fail('The slide that is not shown is kept out of the page by the slider');
    pass('Empty places say so only while they are shown');
  }
};
