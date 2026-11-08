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
  'should add a card that holds widgets, and says it is empty until it does': async ({ pass, fail }) => {
    const builder = await createBuilder();
    const node = await add(builder, 'card');
    const card = await widgetOf(builder, node.id);
    const result = { tag: card.localName, place: card.matches('[data-pb-slot="default"]') };
    builder.insert('text');
    await wait(700);
    const inside = first(builder).slots.default?.map(child => child.type).join();
    builder.remove();
    if(result.tag !== 'k-card' || !result.place) return fail(`A card is a k-card that holds widgets, got ${JSON.stringify(result)}`);
    if(inside !== 'text') return fail(`A widget added while the card is selected goes inside, got ${inside}`);
    pass('A card holds widgets');
  },

  'should label a card, and show the label on the page': async ({ pass, fail }) => {
    const builder = await createBuilder();
    const node = await add(builder, 'card');
    await typeInto(field(builder, 'label'), 'Pricing');
    const card = await widgetOf(builder, node.id);
    const result = { attribute: card.getAttribute('label'), stored: first(builder).attrs.label };
    builder.remove();
    if(result.stored !== 'Pricing' || result.attribute !== 'Pricing') return fail(`The label is stored and on the card, got ${JSON.stringify(result)}`);
    pass('A card has a label');
  },

  /*
    Show more
  */
  'should add a show more that holds widgets, closed until it is opened': async ({ pass, fail }) => {
    const builder = await createBuilder();
    const node = await add(builder, 'show-more');
    const element = await widgetOf(builder, node.id);
    const result = { tag: element.localName, place: element.matches('[data-pb-slot="default"]'), opened: element.hasAttribute('opened') };
    builder.insert('text');
    await wait(700);
    const inside = first(builder).slots.default?.map(child => child.type).join();
    builder.remove();
    if(result.tag !== 'k-show-more' || !result.place) return fail(`A show more holds widgets, got ${JSON.stringify(result)}`);
    if(result.opened) return fail('A show more starts closed');
    if(inside !== 'text') return fail(`A widget added while it is selected goes inside, got ${inside}`);
    pass('A show more holds widgets');
  },

  'should start a show more open when Start open is on': async ({ pass, fail }) => {
    const builder = await createBuilder();
    const node = await add(builder, 'show-more');
    const toggle = field(builder, 'opened');
    const label = toggle?.textContent.trim();
    await turn(toggle, true);
    const on = (await widgetOf(builder, node.id)).hasAttribute('opened');
    await turn(field(builder, 'opened'), false);
    const off = (await widgetOf(builder, node.id)).hasAttribute('opened');
    builder.remove();
    if(label !== 'Start open') return fail(`The setting is Start open, got ${label}`);
    if(!on) return fail('Start open opens it');
    if(off) return fail('Turning Start open off closes it again');
    pass('A show more can start open');
  }

};
