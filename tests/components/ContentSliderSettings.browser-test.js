import '../../src/components/PageBuilder.js';

/*
  Utility Functions
*/
const wait = (ms = 150) => new Promise(resolve => setTimeout(resolve, ms));

const page = (...nodes) => ({ attrs: { title: 'Test' }, slots: { default: nodes } });

const slide = (id, ...children) => ({ id, type: 'slide', attrs: {}, slots: { default: children } });

const text = (id, html) => ({ id, type: 'text', attrs: { html }, slots: {} });

const slider = (attrs, ...slides) => ({ id: 'cs', type: 'content-slider', attrs, slots: { default: slides } });

const createBuilder = async value => {
  const builder = document.createElement('k-page-builder');
  builder.value = value;
  document.body.appendChild(builder);
  await builder.updateComplete;
  await builder.frame().ready;
  return builder;
};

const settingsOf = async builder => {
  builder.select('cs');
  await wait(400);
  const panel = builder.renderRoot.querySelector('k-page-builder-settings');
  await panel.updateComplete;
  const settings = panel.shadowRoot.querySelector('k-page-builder-content-slider-settings');
  await settings?.updateComplete;
  return settings;
};

const fieldsOf = async settings => {
  const fields = settings.shadowRoot.querySelector('k-page-builder-fields');
  await fields?.updateComplete;
  return fields;
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

const slides = builder => builder.value.slots.default[0].slots.default;

const rowsOf = settings => [...settings.shadowRoot.querySelectorAll('.p.b.mbq')];

const button = (row, label) => [...row.querySelectorAll('button')].find(item => item.getAttribute('aria-label') === label);

const refresh = async settings => {
  await wait(300);
  await settings.updateComplete;
};

/*
  Tests
*/
export default {
  'should list each slide with icon buttons to move it left or right and remove it': async ({ pass, fail }) => {
    const builder = await createBuilder(page(slider({}, slide('a'), slide('b'), slide('c'))));
    const settings = await settingsOf(builder);
    if(!settings){ builder.remove(); return fail('The content slider settings did not load'); }
    const rows = rowsOf(settings);
    const names = rows.map(row => row.querySelector('span').textContent.trim());
    const labels = rows[0] ? [...rows[0].querySelectorAll('button')].map(item => item.getAttribute('aria-label')) : [];
    const iconsOnly = rows.every(row => [...row.querySelectorAll('button')].every(item => item.textContent.trim() === '' && item.querySelector('k-icon')));
    const first = button(rows[0], 'Move left').disabled;
    const last = button(rows[2], 'Move right').disabled;
    const middle = button(rows[1], 'Move left').disabled || button(rows[1], 'Move right').disabled;
    builder.remove();
    if(names.join() !== 'Slide 1,Slide 2,Slide 3') return fail(`Expected one row for each slide, got ${names.join()}`);
    if(labels.join() !== 'Move left,Move right,Remove') return fail(`Each row should have Move left, Move right and Remove, got ${labels.join()}`);
    if(!iconsOnly) return fail('The buttons should be icons only');
    if(!first || !last || middle) return fail('The first slide cannot move left, the last cannot move right, and a middle one can do both');
    pass('Each slide is listed with its buttons');
  },

  'should put the slide name on its own line, with the buttons below it': async ({ pass, fail }) => {
    const builder = await createBuilder(page(slider({}, slide('a'), slide('b'))));
    const settings = await settingsOf(builder);
    const row = rowsOf(settings)[0];
    const name = row.querySelector('span').getBoundingClientRect();
    const buttons = row.querySelector('.btn-grp').getBoundingClientRect();
    builder.remove();
    if(buttons.top < name.bottom - 1) return fail(`The buttons should be below the name, name bottom ${name.bottom} and buttons top ${buttons.top}`);
    pass('The buttons are below the slide name');
  },

  'should add a slide with Add slide, after the others and empty': async ({ pass, fail }) => {
    const builder = await createBuilder(page(slider({}, slide('a', text('t1', '<p>One</p>')), slide('b'))));
    const settings = await settingsOf(builder);
    settings.shadowRoot.querySelector('button.primary').click();
    await refresh(settings);
    const list = slides(builder);
    const added = list[2];
    const rows = rowsOf(settings).length;
    builder.remove();
    if(list.length !== 3) return fail(`Add slide should add one slide, got ${list.length}`);
    if(added.type !== 'slide' || (added.slots.default || []).length) return fail('The new slide should be an empty slide');
    if(list[0].slots.default.length !== 1) return fail('The other slides must keep their content');
    if(rows !== 3) return fail(`The list should show the new slide, got ${rows} rows`);
    pass('Add slide adds an empty slide at the end');
  },

  'should add the first slide to a slider with none': async ({ pass, fail }) => {
    const builder = await createBuilder(page(slider({})));
    const settings = await settingsOf(builder);
    const before = rowsOf(settings).length;
    const startBefore = !!settings.shadowRoot.querySelector('#pb-slider-start');
    settings.shadowRoot.querySelector('button.primary').click();
    await refresh(settings);
    const after = slides(builder).length;
    const startAfter = !!settings.shadowRoot.querySelector('#pb-slider-start');
    builder.remove();
    if(before !== 0 || startBefore) return fail('A slider with no slides lists none, and has nothing to start on');
    if(after !== 1 || !startAfter) return fail(`Add slide should add the first slide and show the start choice, got ${after} slides`);
    pass('The first slide can be added');
  },

  'should move a slide left or right, keeping its content': async ({ pass, fail }) => {
    const builder = await createBuilder(page(slider({}, slide('a', text('ta', '<p>A</p>')), slide('b'), slide('c'))));
    const settings = await settingsOf(builder);
    button(rowsOf(settings)[1], 'Move left').click();
    await refresh(settings);
    const afterLeft = slides(builder).map(item => item.id).join();
    button(rowsOf(settings)[0], 'Move right').click();
    await refresh(settings);
    const afterRight = slides(builder).map(item => item.id).join();
    button(rowsOf(settings)[1], 'Move right').click();
    await refresh(settings);
    const last = slides(builder).map(item => item.id).join();
    const kept = slides(builder).find(item => item.id === 'a').slots.default.length;
    builder.remove();
    if(afterLeft !== 'b,a,c') return fail(`Moving slide 2 left should swap it with slide 1, got ${afterLeft}`);
    if(afterRight !== 'a,b,c') return fail(`Moving slide 1 right should swap it back, got ${afterRight}`);
    if(last !== 'a,c,b') return fail(`Moving slide 2 right should swap it with slide 3, got ${last}`);
    if(kept !== 1) return fail('A moved slide keeps its content');
    pass('Slides can be moved');
  },

  'should remove a slide and its content, and leave the others': async ({ pass, fail }) => {
    const builder = await createBuilder(page(slider({}, slide('a'), slide('b', text('tb', '<p>B</p>')), slide('c'))));
    const settings = await settingsOf(builder);
    button(rowsOf(settings)[1], 'Remove').click();
    await refresh(settings);
    const ids = slides(builder).map(item => item.id).join();
    const rows = rowsOf(settings).length;
    builder.remove();
    if(ids !== 'a,c') return fail(`Removing slide 2 should leave slides 1 and 3, got ${ids}`);
    if(rows !== 2) return fail(`The list should have two rows, got ${rows}`);
    pass('A slide is removed');
  },

  'should choose the slide the slider starts on, and start the slider on it': async ({ pass, fail }) => {
    const builder = await createBuilder(page(slider({}, slide('a'), slide('b'), slide('c'))));
    const settings = await settingsOf(builder);
    const select = settings.shadowRoot.querySelector('#pb-slider-start');
    const options = [...select.options].map(option => option.textContent.trim());
    const first = select.value;
    select.value = 'c';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    await refresh(settings);
    await waitForWidget(builder, 'cs');
    await wait(300);
    const stored = builder.value.slots.default[0].attrs.active;
    const index = frameDoc(builder).querySelector('k-content-slider').getAttribute('index');
    const now = settings.shadowRoot.querySelector('#pb-slider-start').value;
    builder.remove();
    if(options.join() !== 'Slide 1,Slide 2,Slide 3') return fail(`The choice should list the slides, got ${options.join()}`);
    if(first !== 'a') return fail(`The first slide is chosen until another is, got ${first}`);
    if(stored !== 'c') return fail(`The slide is stored by its id, got ${stored}`);
    if(index !== '2') return fail(`The slider should start on the third slide, got index ${index}`);
    if(now !== 'c') return fail(`The choice should stay on the third slide, got ${now}`);
    pass('The start slide is chosen');
  },

  'should fall back to the first slide when the start slide is removed': async ({ pass, fail }) => {
    const builder = await createBuilder(page(slider({ active: 'b' }, slide('a'), slide('b'), slide('c'))));
    const settings = await settingsOf(builder);
    const before = settings.shadowRoot.querySelector('#pb-slider-start').value;
    button(rowsOf(settings)[1], 'Remove').click();
    await refresh(settings);
    const after = settings.shadowRoot.querySelector('#pb-slider-start').value;
    builder.remove();
    if(before !== 'b') return fail(`The chosen slide should be selected, got ${before}`);
    if(after !== 'a') return fail(`With the chosen slide gone the first is selected, got ${after}`);
    pass('A removed start slide falls back to the first');
  },

  'should show the settings of the component, and Global controls only while the keyboard controls are on': async ({ pass, fail }) => {
    const builder = await createBuilder(page(slider({}, slide('a'), slide('b'))));
    const settings = await settingsOf(builder);
    const fields = await fieldsOf(settings);
    const names = () => [...fields.shadowRoot.querySelectorAll('[id^="pb-field-"]')].map(item => item.id.replace('pb-field-', ''));
    const labels = [...fields.shadowRoot.querySelectorAll('k-toggle, label')].map(item => item.textContent.replace(/\s+/g, ' ').trim());
    const withKeys = names();
    builder.setWidgetAttribute('cs', 'keyboardControls', false, false);
    await wait(400);
    await fields.updateComplete;
    const withoutKeys = names();
    builder.remove();
    for(const label of ['Controls', 'Loop', 'Minimum height', 'Keyboard controls', 'Global controls']){
      if(!labels.some(text => text.startsWith(label))) return fail(`${label} is missing, got ${labels.join(' | ')}`);
    }
    if(!withKeys.includes('globalControls')) return fail(`Global controls should show with keyboard controls on, got ${withKeys.join()}`);
    if(withoutKeys.includes('globalControls')) return fail(`Global controls should hide when keyboard controls are off, got ${withoutKeys.join()}`);
    if(!withoutKeys.includes('keyboardControls')) return fail('Keyboard controls should stay');
    pass('The component settings are shown');
  },

  'should set the minimum height with a value and a unit on one line, and write it on the slider': async ({ pass, fail }) => {
    const builder = await createBuilder(page(slider({}, slide('a'), slide('b'))));
    const settings = await settingsOf(builder);
    const fields = await fieldsOf(settings);
    const input = fields.shadowRoot.querySelector('#pb-field-minHeight');
    const unit = input.parentElement.querySelector('select');
    const units = [...unit.options].map(option => option.textContent.trim());
    const sameLine = Math.abs(input.getBoundingClientRect().top - unit.getBoundingClientRect().top) < 4;
    input.value = '12';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await wait(200);
    unit.value = 'rem';
    unit.dispatchEvent(new Event('change', { bubbles: true }));
    await wait(500);
    const attrs = builder.value.slots.default[0].attrs;
    await waitForWidget(builder, 'cs');
    const written = frameDoc(builder).querySelector('k-content-slider').getAttribute('min-height');
    builder.remove();
    if(units.join() !== 'px,rem,vh') return fail(`The units should be just px, rem and vh, got ${units.join()}`);
    if(!sameLine) return fail('The value and its unit should be on one line');
    if(attrs.minHeight !== 12 || attrs.minHeightUnit !== 'rem') return fail(`Expected 12 and rem to be stored, got ${attrs.minHeight} ${attrs.minHeightUnit}`);
    if(written !== '12rem') return fail(`The slider should get min-height="12rem", got ${written}`);
    pass('The minimum height has a unit beside it');
  },

  'should keep the slide being edited shown when a setting changes': async ({ pass, fail }) => {
    const builder = await createBuilder(page(slider({}, slide('a', text('ta', '<p>A</p>')), slide('b', text('tb', '<p>B</p>')))));
    const settings = await settingsOf(builder);
    await waitForWidget(builder, 'cs');
    const sliderEl = frameDoc(builder).querySelector('k-content-slider');
    sliderEl.next();
    await wait(300);
    builder.setWidgetAttribute('cs', 'loop', true, false);
    await wait(600);
    await settings.updateComplete;
    const after = frameDoc(builder).querySelector('k-content-slider');
    const shown = after.textContent.trim();
    builder.remove();
    if(shown !== 'B') return fail(`The second slide should stay shown after a setting changes, got "${shown}"`);
    pass('The shown slide is kept');
  }
};
