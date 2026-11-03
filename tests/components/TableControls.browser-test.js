import Table from '../../src/components/Table.js';

const records = [
  { name: 'Olivia Smith', email: 'olivia@example.com' },
  { name: 'Liam Johnson', email: 'liam@example.com' },
  { name: 'Emma Brown', email: 'emma@example.com' }
];

const create = async (attrs = '', children = '') => {
  const container = document.createElement('div');
  container.innerHTML = `<k-table ${attrs}>${children}</k-table>`;
  document.body.appendChild(container);
  const table = container.querySelector('k-table');
  await customElements.whenDefined('k-table');
  table.setRecords([...records]);
  await table.updateComplete;
  await new Promise(resolve => setTimeout(resolve, 300));
  return { container, table };
};

const bars = table => [...table.shadowRoot.querySelectorAll('k-control-bar')];
const tags = bar => [...bar.children].map(c => c.tagName.toLowerCase());
const cleanup = container => container.remove();

export default {
  /*
    Presets
  */
  'should have no toolbars by default': async ({pass, fail}) => {
    const { container, table } = await create();
    const count = bars(table).length;
    const flagged = table.hasAttribute('top-controls') || table.hasAttribute('bottom-controls');
    cleanup(container);
    if(count) return fail(`Expected no bars, got ${count}`);
    if(flagged) return fail('top-controls / bottom-controls should not be set');
    pass('No toolbars without controls');
  },

  'should have no toolbars with controls="none"': async ({pass, fail}) => {
    const { container, table } = await create('controls="none"');
    const count = bars(table).length;
    cleanup(container);
    if(count) return fail(`Expected no bars, got ${count}`);
    pass('controls="none" shows nothing');
  },

  'should render search, filters and fields for minimal, with no bottom bar': async ({pass, fail}) => {
    const { container, table } = await create('controls="minimal"');
    const found = bars(table);
    const top = found[0] && tags(found[0]);
    const flags = [table.hasAttribute('top-controls'), table.hasAttribute('bottom-controls')];
    cleanup(container);
    if(found.length !== 1) return fail(`Expected one bar, got ${found.length}`);
    if(top.join() !== 'kc-tc-search,kc-tc-filters,kc-tc-field-sort-hide') return fail(`Unexpected top bar: ${top}`);
    if(!['kc-tc-filters', 'kc-tc-field-sort-hide'].every(tag => found[0].querySelector(tag).getAttribute('slot') === 'right')) return fail('Filters and fields should be on the right');
    if(!flags[0] || flags[1]) return fail(`Expected top-controls only, got ${flags}`);
    pass('minimal renders the top bar only');
  },

  'should add export and paging for normal': async ({pass, fail}) => {
    const { container, table } = await create('controls="normal" enable-pages');
    const [top, bottom] = bars(table).map(tags);
    cleanup(container);
    if(!top?.includes('kc-tc-export-csv')) return fail(`Top bar should export CSV: ${top}`);
    if(bottom?.join() !== 'kc-tc-prev-page,kc-tc-next-page,kc-tc-page-size') return fail(`Unexpected bottom bar: ${bottom}`);
    if(table.shadowRoot.querySelector('kc-tc-page-size').getAttribute('slot') !== 'right') return fail('Page size should be on the right');
    pass('normal renders both bars');
  },

  'should render every table control for full': async ({pass, fail}) => {
    const { container, table } = await create('controls="full" enable-pages');
    const [top, bottom] = bars(table).map(tags);
    cleanup(container);
    const topWanted = ['kc-tc-search', 'kc-tc-filters', 'kc-tc-field-sort-hide', 'kc-tc-export-csv', 'kc-tc-export-json', 'kc-tc-hidden-count', 'kc-tc-show-all'];
    const bottomWanted = ['kc-tc-first-page', 'kc-tc-prev-page', 'kc-tc-next-page', 'kc-tc-last-page', 'kc-tc-page-select', 'kc-tc-page-size'];
    if(topWanted.join() !== top?.join()) return fail(`Unexpected top bar: ${top}`);
    if(bottomWanted.join() !== bottom?.join()) return fail(`Unexpected bottom bar: ${bottom}`);
    pass('full renders every control');
  },

  'should not include selection or delete controls in any preset': async ({pass, fail}) => {
    const found = [];
    for(const controls of ['minimal', 'normal', 'full']){
      const { container, table } = await create(`controls="${controls}"`);
      if(table.shadowRoot.querySelector('kc-tc-delete-selected')) found.push(controls);
      cleanup(container);
    }
    if(found.length) return fail(`Delete selected found in: ${found}`);
    pass('No selection or delete controls in the presets');
  },

  'should add a hide button to every row for full only': async ({pass, fail}) => {
    const full = await create('controls="full"');
    const fullButtons = full.table.shadowRoot.querySelectorAll('kc-tc-hide').length;
    cleanup(full.container);
    const normal = await create('controls="normal"');
    const normalButtons = normal.table.shadowRoot.querySelectorAll('kc-tc-hide').length;
    cleanup(normal.container);
    if(fullButtons !== records.length) return fail(`Expected ${records.length} hide buttons, got ${fullButtons}`);
    if(normalButtons) return fail(`normal should have none, got ${normalButtons}`);
    pass('Hide buttons only in full');
  },

  'should hide a record from its row button': async ({pass, fail}) => {
    const { container, table } = await create('controls="full"');
    table.shadowRoot.querySelector('kc-tc-hide').click();
    await new Promise(resolve => setTimeout(resolve, 200));
    const rows = table.shadowRoot.querySelectorAll('.record').length;
    cleanup(container);
    if(rows !== records.length - 1) return fail(`Expected ${records.length - 1} rows, got ${rows}`);
    pass('Row hide button hides its record');
  },

  'should let slotted after controls replace the row hide button': async ({pass, fail}) => {
    const { container, table } = await create('controls="full"', '<kc-tc-open slot="after"></kc-tc-open>');
    const hides = table.shadowRoot.querySelectorAll('kc-tc-hide').length;
    const opens = table.shadowRoot.querySelectorAll('kc-tc-open').length;
    cleanup(container);
    if(hides) return fail(`The preset hide buttons should be replaced, found ${hides}`);
    if(opens !== records.length) return fail(`Expected ${records.length} open buttons, got ${opens}`);
    pass('Slotted after controls replace the preset ones');
  },

  /*
    Behavior
  */
  'should import the controls it needs': async ({pass, fail}) => {
    const { container } = await create('controls="full"');
    const missing = ['kc-tc-search', 'kc-tc-filters', 'kc-tc-page-select', 'k-control-bar'].filter(tag => !customElements.get(tag));
    cleanup(container);
    if(missing.length) return fail(`Not defined: ${missing}`);
    pass('Control modules are loaded');
  },

  'should connect preset controls to the table': async ({pass, fail}) => {
    const { container, table } = await create('controls="minimal"');
    const host = table.shadowRoot.querySelector('kc-tc-search').host;
    cleanup(container);
    if(host !== table) return fail('The preset search should find the table as its host');
    pass('Preset controls find the table');
  },

  'should let slotted controls replace a preset bar': async ({pass, fail}) => {
    const { container, table } = await create('controls="normal" enable-pages', '<k-control-bar slot="top"><kc-tc-export-json></kc-tc-export-json></k-control-bar>');
    const [presetTop, presetBottom] = bars(table);
    const topHidden = presetTop.getBoundingClientRect().height === 0;
    const bottomShown = presetBottom.getBoundingClientRect().height > 0;
    cleanup(container);
    if(!topHidden) return fail('The preset top bar should be replaced');
    if(!bottomShown) return fail('The preset bottom bar should stay');
    pass('Slotted bar replaces only its own region');
  },

  'should switch presets when controls changes': async ({pass, fail}) => {
    const { container, table } = await create('controls="minimal"');
    table.controls = 'normal';
    await table.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 300));
    const count = bars(table).length;
    cleanup(container);
    if(count !== 2) return fail(`Expected two bars after switching to normal, got ${count}`);
    pass('Changing controls re-renders the bars');
  }
};
