import '../../src/components/PageBuilder.js';

/*
  Utility Functions
*/
const wait = (ms = 150) => new Promise(resolve => setTimeout(resolve, ms));

const page = (...nodes) => ({ attrs: { title: 'Test' }, slots: { default: nodes } });

const createBuilder = async value => {
  const builder = document.createElement('k-page-builder');
  builder.value = value || page();
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

/* Finds an element in a root or in any shadow root under it, for the settings that sit inside other components. */
const deepQuery = (root, selector) => {
  const found = root.querySelector(selector);
  if(found) return found;
  for(const el of root.querySelectorAll('*')){
    const inner = el.shadowRoot && deepQuery(el.shadowRoot, selector);
    if(inner) return inner;
  }
  return null;
};

/* Adds a widget the way the Add list does, and selects it. Returns its node. */
const add = async (builder, type) => {
  builder.insert(type);
  await wait(400);
  const nodes = builder.value.slots.default;
  const node = nodes[nodes.length - 1];
  builder.select(node.id);
  await wait(500);
  await builder.renderRoot.querySelector('k-page-builder-settings')?.updateComplete;
  await wait(200);
  return node;
};

const field = (builder, name) => deepQuery(builder.renderRoot.querySelector('k-page-builder-settings').shadowRoot, `#pb-field-${name}`);

const choose = async (element, value) => {
  element.value = value;
  element.dispatchEvent(new Event('change', { bubbles: true }));
  await wait(400);
};

const typeInto = async (element, value) => {
  element.value = value;
  element.dispatchEvent(new Event('input', { bubbles: true }));
  await wait(400);
};

const turn = async (element, value) => {
  element.dispatchEvent(new CustomEvent('change', { detail: { value }, bubbles: true }));
  await wait(400);
};

const labels = element => [...element.querySelectorAll('option')].map(option => option.textContent.trim());

const first = builder => builder.value.slots.default[0];

const widgetOf = async (builder, id) => {
  await wait(200);
  return waitForWidget(builder, id);
};

/*
  Tests
*/
export default {
  'should add a fullscreen breakout that spreads across the page width, and holds widgets': async ({ pass, fail }) => {
    const builder = await createBuilder();
    const node = await add(builder, 'breakout');
    const box = await widgetOf(builder, node.id);
    const style = box.getAttribute('style');
    const place = box.matches('[data-pb-slot="default"]');
    builder.insert('text');
    await wait(700);
    const inside = first(builder).slots.default?.map(child => child.type).join();
    builder.remove();
    if(!/width: calc\(var\(--page-width/.test(style) || !/max-width: none/.test(style)) return fail(`A breakout spreads across the page, got ${style}`);
    if(!place) return fail('The breakout itself is the place for its content');
    if(inside !== 'text') return fail(`A widget added while it is selected goes inside it, got ${inside}`);
    pass('A breakout spreads out and holds widgets');
  },

  'should keep the content of a breakout in a column when asked, with the box and its background still full width': async ({ pass, fail }) => {
    const builder = await createBuilder();
    const node = await add(builder, 'breakout');
    await turn(field(builder, 'contain'), true);
    const box = await widgetOf(builder, node.id);
    const column = box.querySelector(':scope > .container');
    const place = column?.matches('[data-pb-slot="default"]');
    const style = box.getAttribute('style');
    builder.remove();
    if(!column) return fail('The content is in a container column');
    if(!place) return fail('The column is the place for the content');
    if(!/width: calc\(var\(--page-width/.test(style)) return fail(`The box is still full width, got ${style}`);
    pass('A breakout can contain its content');
  },

  /*
    Container
  */
  'should add a container with the container class that holds widgets': async ({ pass, fail }) => {
    const builder = await createBuilder();
    const node = await add(builder, 'container');
    const box = await widgetOf(builder, node.id);
    const result = { tag: box.localName, container: box.classList.contains('container'), place: box.matches('[data-pb-slot="default"]'), text: getComputedStyle(box, '::before').content };
    builder.insert('text');
    await wait(700);
    const inside = first(builder).slots.default?.map(child => child.type).join();
    builder.remove();
    if(result.tag !== 'div' || !result.container || !result.place) return fail(`A container is a div with the container class that holds widgets, got ${JSON.stringify(result)}`);
    if(!/Container is empty/.test(result.text)) return fail(`An empty container says so, got ${result.text}`);
    if(inside !== 'text') return fail(`A widget added while it is selected goes inside, got ${inside}`);
    pass('A container holds widgets');
  },

  'should narrow a container to the page column and nest widgets and other containers in it': async ({ pass, fail }) => {
    const builder = await createBuilder();
    const outer = await add(builder, 'container');
    builder.insert('container');
    await wait(700);
    const nested = first(builder).slots.default?.[0];
    builder.select(nested.id);
    await wait(300);
    builder.insert('image');
    await wait(700);
    const found = (await widgetOf(builder, nested.id));
    const types = (first(builder).slots.default[0].slots.default || []).map(child => child.type).join();
    const classes = [frameDoc(builder).querySelector(`[data-pb-id="${outer.id}"]`).className, found.className];
    builder.remove();
    if(first(builder) !== undefined && false) return fail('unreachable');
    if(nested?.type !== 'container') return fail(`A container can be added inside a container, got ${nested?.type}`);
    if(types !== 'image') return fail(`A widget goes into the inner container, got ${types}`);
    if(!classes.every(name => /\bcontainer\b/.test(name))) return fail(`Both are containers, got ${classes.join(' | ')}`);
    pass('Containers nest');
  },

  /*
    Spacer
  */
  'should add a spacer 6rem tall that says Spacer in the builder': async ({ pass, fail }) => {
    const builder = await createBuilder();
    const node = await add(builder, 'spacer');
    const spacer = await widgetOf(builder, node.id);
    const result = { height: spacer.style.height, text: spacer.textContent.trim(), muted: spacer.classList.contains('tc-muted') };
    builder.remove();
    if(result.height !== '6rem') return fail(`A spacer is medium (6rem) by default, got ${result.height}`);
    if(result.text !== 'Spacer' || !result.muted) return fail(`In the builder a spacer is labelled so it can be seen, got ${JSON.stringify(result)}`);
    pass('A spacer is added');
  },

  'should choose the size of a spacer, with a height in pixels only when Custom is chosen': async ({ pass, fail }) => {
    const builder = await createBuilder();
    const node = await add(builder, 'spacer');
    const sizes = labels(field(builder, 'size'));
    const heightBefore = !!field(builder, 'height');
    const heights = {};
    for(const size of ['small', 'large']){
      await choose(field(builder, 'size'), size);
      heights[size] = (await widgetOf(builder, node.id)).style.height;
    }
    await choose(field(builder, 'size'), 'custom');
    const heightField = field(builder, 'height');
    await typeInto(heightField, '100');
    const custom = (await widgetOf(builder, node.id)).style.height;
    builder.remove();
    if(sizes.join() !== 'Small (2rem),Medium (6rem),Large (12rem),Custom') return fail(`The sizes are named with their heights, got ${sizes.join()}`);
    if(heightBefore) return fail('The height in pixels is only for a custom size');
    if(heights.small !== '2rem' || heights.large !== '12rem') return fail(`Small is 2rem and large 12rem, got ${JSON.stringify(heights)}`);
    if(!heightField || custom !== '100px') return fail(`A custom spacer takes its height in pixels, got ${custom}`);
    pass('A spacer is sized');
  },

  /*
    Horizontal rule
  */
  'should add a horizontal rule, shown as a line that can be selected': async ({ pass, fail }) => {
    const builder = await createBuilder();
    const node = await add(builder, 'divider');
    const rule = await widgetOf(builder, node.id);
    const result = { tag: rule.localName, title: rule.dataset.pbTitle, selected: builder.selection.join(), marked: rule.classList.contains('pb-selected') };
    builder.remove();
    if(result.tag !== 'hr') return fail(`A rule is an hr, got ${result.tag}`);
    if(result.title !== 'Horizontal rule') return fail(`A rule is called Horizontal rule, got ${result.title}`);
    if(result.selected !== node.id || !result.marked) return fail(`The new rule is selected, got ${JSON.stringify(result)}`);
    pass('A rule is added');
  },

  'should set the space above and below a rule, with a pixel box for Custom, winning over a margin from the styles': async ({ pass, fail }) => {
    const builder = await createBuilder();
    const node = await add(builder, 'divider');
    const choices = labels(field(builder, 'above'));
    const boxBefore = !!field(builder, 'aboveHeight');
    await choose(field(builder, 'above'), 'large');
    await choose(field(builder, 'below'), 'custom');
    await typeInto(field(builder, 'belowHeight'), '30');
    const rule = await widgetOf(builder, node.id);
    const style = rule.getAttribute('style');
    builder.remove();
    if(choices.join() !== 'None,Small (2rem),Medium (6rem),Large (12rem),Custom') return fail(`The space choices, got ${choices.join()}`);
    if(boxBefore) return fail('The pixel box is only for a custom space');
    if(!/margin-top: 12rem !important/.test(style)) return fail(`Space above large is 12rem, got ${style}`);
    if(!/margin-bottom: 30px !important/.test(style)) return fail(`A custom space below is in pixels, got ${style}`);
    pass('A rule has its spaces');
  }
};
