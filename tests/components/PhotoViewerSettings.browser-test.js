import '../../src/components/PageBuilder.js';

/*
  Utility Functions
*/
const wait = (ms = 150) => new Promise(resolve => setTimeout(resolve, ms));

const page = (...nodes) => ({ attrs: { title: 'Test' }, slots: { default: nodes } });

const viewer = (attrs = {}) => ({ id: 'pv', type: 'photo-viewer', attrs, slots: {} });

const createBuilder = async value => {
  const builder = document.createElement('k-page-builder');
  builder.value = value;
  document.body.appendChild(builder);
  await builder.updateComplete;
  await builder.frame().ready;
  return builder;
};

const settingsOf = async builder => {
  builder.select('pv');
  await wait(400);
  const panel = builder.renderRoot.querySelector('k-page-builder-settings');
  await panel.updateComplete;
  const settings = panel.shadowRoot.querySelector('k-page-builder-photo-viewer-settings');
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

const images = builder => builder.value.slots.default[0].attrs.images;

const refresh = async settings => {
  await wait(400);
  await settings.updateComplete;
};

const panelOf = (settings, index) => settings.shadowRoot.querySelector(`k-accordion-panel[name="pb-photo-${index}"]`);

const headers = settings => [...settings.shadowRoot.querySelectorAll('k-accordion-header')].map(header => header.textContent.trim());

const buttonIn = (container, label) => [...container.querySelectorAll('button')].find(item => item.getAttribute('aria-label') === label);

const typeInto = async (input, value) => {
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  await wait(500);
};

const labelTexts = container => [...container.querySelectorAll('label')].map(label => label.childNodes[0].textContent.trim());

/* A picture that exists on the test server, so its size can be measured. */
const PICTURE = '/docs/media/icon48.png';

/*
  Tests
*/
export default {
  'should list each photo by its alternative text, its address or its number, with address, alternative text and caption fields': async ({ pass, fail }) => {
    const builder = await createBuilder(page(viewer({ images: [{ src: '/a.jpg', alt: 'Sunset', caption: 'At the beach' }, { src: '/b.jpg' }, { src: '' }] })));
    const settings = await settingsOf(builder);
    if(!settings){ builder.remove(); return fail('The photo viewer settings did not load'); }
    const list = headers(settings);
    const first = panelOf(settings, 0);
    const values = [first.querySelector('#pb-photo-0-src')?.value, first.querySelector('#pb-photo-0-alt')?.value, first.querySelector('#pb-photo-0-caption')?.value];
    const labels = labelTexts(first);
    builder.remove();
    if(list.join() !== 'Sunset,/b.jpg,Photo 3') return fail(`Photos are listed by alt text, then address, then number, got ${list.join()}`);
    if(values.join() !== '/a.jpg,Sunset,At the beach') return fail(`The fields should show the photo, got ${values.join()}`);
    if(labels.join() !== 'Address,Alternative text,Caption') return fail(`Each photo has an address, alternative text and caption, got ${labels.join()}`);
    pass('Each photo is listed with its fields');
  },

  'should add a photo with Add photo, empty, after the others': async ({ pass, fail }) => {
    const builder = await createBuilder(page(viewer({ images: [{ src: '/a.jpg', alt: 'A' }] })));
    const settings = await settingsOf(builder);
    settings.shadowRoot.querySelector('button.primary').click();
    await refresh(settings);
    const list = images(builder);
    const count = headers(settings).length;
    builder.remove();
    if(list.length !== 2 || list[0].src !== '/a.jpg') return fail(`Add photo should add one and keep the first, got ${JSON.stringify(list)}`);
    if(list[1].src !== '' || list[1].alt !== '') return fail(`The new photo is empty, got ${JSON.stringify(list[1])}`);
    if(count !== 2) return fail(`The list should show the new photo, got ${count}`);
    pass('A photo is added');
  },

  'should add the first photo to a viewer that has none, and not list any before': async ({ pass, fail }) => {
    const builder = await createBuilder(page(viewer()));
    const settings = await settingsOf(builder);
    const before = headers(settings).length;
    settings.shadowRoot.querySelector('button.primary').click();
    await refresh(settings);
    const after = images(builder)?.length;
    builder.remove();
    if(before !== 0) return fail(`A viewer with no photos lists none, got ${before}`);
    if(after !== 1) return fail(`Add photo adds the first photo, got ${after}`);
    pass('The first photo can be added');
  },

  'should move a photo up or down keeping its caption, and disable moving past the ends': async ({ pass, fail }) => {
    const builder = await createBuilder(page(viewer({ images: [{ src: '/a.jpg', caption: 'One' }, { src: '/b.jpg', caption: 'Two' }, { src: '/c.jpg', caption: 'Three' }] })));
    const settings = await settingsOf(builder);
    const firstUp = buttonIn(panelOf(settings, 0), 'Move up').disabled;
    const lastDown = buttonIn(panelOf(settings, 2), 'Move down').disabled;
    const middle = buttonIn(panelOf(settings, 1), 'Move up').disabled || buttonIn(panelOf(settings, 1), 'Move down').disabled;
    buttonIn(panelOf(settings, 1), 'Move up').click();
    await refresh(settings);
    const afterUp = images(builder).map(photo => photo.caption).join();
    buttonIn(panelOf(settings, 1), 'Move down').click();
    await refresh(settings);
    const afterDown = images(builder).map(photo => photo.caption).join();
    const iconsOnly = [...panelOf(settings, 1).querySelectorAll('.btn-grp button')].every(item => item.textContent.trim() === '' && item.querySelector('k-icon'));
    builder.remove();
    if(!firstUp || !lastDown || middle) return fail('The first photo cannot move up, the last cannot move down, and a middle one can do both');
    if(afterUp !== 'Two,One,Three') return fail(`Moving the second photo up, got ${afterUp}`);
    if(afterDown !== 'Two,Three,One') return fail(`Moving the second photo down, got ${afterDown}`);
    if(!iconsOnly) return fail('The buttons are icons only');
    pass('Photos move');
  },

  'should remove a photo and leave the others': async ({ pass, fail }) => {
    const builder = await createBuilder(page(viewer({ images: [{ src: '/a.jpg', alt: 'A' }, { src: '/b.jpg', alt: 'B' }, { src: '/c.jpg', alt: 'C' }] })));
    const settings = await settingsOf(builder);
    buttonIn(panelOf(settings, 1), 'Remove').click();
    await refresh(settings);
    const left = images(builder).map(photo => photo.alt).join();
    const list = headers(settings).join();
    builder.remove();
    if(left !== 'A,C') return fail(`Removing the second photo leaves the first and third, got ${left}`);
    if(list !== 'A,C') return fail(`The list should follow, got ${list}`);
    pass('A photo is removed');
  },

  'should store the address, alternative text and caption as typed, and draw the photo with its caption on the page': async ({ pass, fail }) => {
    const builder = await createBuilder(page(viewer({ images: [{ src: '', alt: '' }] })));
    const settings = await settingsOf(builder);
    const panel = panelOf(settings, 0);
    await typeInto(panel.querySelector('#pb-photo-0-alt'), 'A small icon');
    await typeInto(panel.querySelector('#pb-photo-0-caption'), 'The icon');
    await typeInto(panel.querySelector('#pb-photo-0-src'), PICTURE);
    await waitForWidget(builder, 'pv');
    await wait(300);
    const stored = images(builder)[0];
    const element = frameDoc(builder).querySelector('k-photo-viewer');
    const shown = { src: element?.getAttribute('src'), alt: element?.getAttribute('alt'), caption: element?.textContent.trim() };
    const heading = headers(settings)[0];
    builder.remove();
    if(stored.src !== PICTURE || stored.alt !== 'A small icon' || stored.caption !== 'The icon') return fail(`The three fields are stored, got ${JSON.stringify(stored)}`);
    if(shown.src !== PICTURE || shown.alt !== 'A small icon' || shown.caption !== 'The icon') return fail(`The page should draw the photo with its alt text and caption, got ${JSON.stringify(shown)}`);
    if(heading !== 'A small icon') return fail(`The heading follows the alt text, got ${heading}`);
    pass('The photo fields are stored and drawn');
  },

  'should measure a photo when its address is set, and forget the size when the address changes to one that cannot be loaded': async ({ pass, fail }) => {
    const builder = await createBuilder(page(viewer({ images: [{ src: '', alt: 'A' }] })));
    const settings = await settingsOf(builder);
    const input = panelOf(settings, 0).querySelector('#pb-photo-0-src');
    await typeInto(input, PICTURE);
    await wait(600);
    const measured = { width: images(builder)[0].width, height: images(builder)[0].height };
    await typeInto(panelOf(settings, 0).querySelector('#pb-photo-0-src'), '/missing/photo.png');
    await wait(600);
    const after = images(builder)[0];
    builder.remove();
    if(measured.width !== 48 || measured.height !== 48) return fail(`The picture is 48 by 48, got ${JSON.stringify(measured)}`);
    if(after.src !== '/missing/photo.png' || after.width !== undefined || after.height !== undefined) return fail(`A new address drops the old size, and one that does not load has none, got ${JSON.stringify(after)}`);
    pass('The photo size follows its address');
  },

  'should draw one photo as a single viewer, and several as a grid of the chosen number of columns': async ({ pass, fail }) => {
    const builder = await createBuilder(page(viewer({ images: [{ src: PICTURE, alt: 'One' }] })));
    await waitForWidget(builder, 'pv');
    const single = frameDoc(builder).querySelector('[data-pb-id="pv"]');
    const singleTag = single.localName;
    builder.setWidgetAttribute('pv', 'images', [{ src: PICTURE, alt: 'One' }, { src: PICTURE, alt: 'Two' }, { src: PICTURE, alt: 'Three' }], false);
    await wait(600);
    const settings = await settingsOf(builder);
    const fields = await fieldsOf(settings);
    const select = fields.shadowRoot.querySelector('#pb-field-columns');
    const options = [...select.options].map(option => option.textContent.trim());
    const initial = select.value;
    const grid = () => frameDoc(builder).querySelector('[data-pb-id="pv"]');
    const classes = grid().className;
    const count = grid().querySelectorAll('k-photo-viewer').length;
    select.value = '4';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    await wait(700);
    const four = grid().className;
    const stored = builder.value.slots.default[0].attrs.columns;
    fields.shadowRoot.querySelector('#pb-field-columns').value = '12';
    fields.shadowRoot.querySelector('#pb-field-columns').dispatchEvent(new Event('change', { bubbles: true }));
    await wait(700);
    const twelve = { classes: grid().className, style: grid().getAttribute('style') };
    builder.remove();
    if(singleTag !== 'k-photo-viewer') return fail(`One photo is a single viewer, got ${singleTag}`);
    if(options.join() !== '1,2,3,4,5,6,7,8,9,10,11,12') return fail(`Photos per row go from 1 to 12, got ${options.join()}`);
    if(initial !== '3') return fail(`Three photos per row by default, got ${initial}`);
    if(!/\bd-g\b/.test(classes) || !/\bcols-3\b/.test(classes) || count !== 3) return fail(`Several photos are a grid of three columns, got ${classes} with ${count}`);
    if(!/\bcols-4\b/.test(four) || stored !== '4') return fail(`Choosing 4 stores it and draws four columns, got ${four} and ${stored}`);
    if(/cols-/.test(twelve.classes) || !/repeat\(12, 1fr\)/.test(twelve.style || '')) return fail(`12 columns are drawn with a style, got ${JSON.stringify(twelve)}`);
    pass('The grid follows the photos per row');
  },

  'should leave a photo with no address out of the page, and show a placeholder when none has one': async ({ pass, fail }) => {
    const builder = await createBuilder(page(viewer({ images: [{ src: PICTURE, alt: 'One' }, { src: '', alt: 'Empty' }, { src: PICTURE, alt: 'Two' }] })));
    await waitForWidget(builder, 'pv');
    const drawn = [...frameDoc(builder).querySelectorAll('k-photo-viewer')].map(item => item.getAttribute('alt')).join();
    builder.setWidgetAttribute('pv', 'images', [{ src: '', alt: 'Empty' }], false);
    await wait(600);
    const element = frameDoc(builder).querySelector('[data-pb-id="pv"]');
    const placeholder = element?.textContent.trim();
    const viewers = frameDoc(builder).querySelectorAll('k-photo-viewer').length;
    builder.remove();
    if(drawn !== 'One,Two') return fail(`Only the photos with an address are drawn, got ${drawn}`);
    if(viewers !== 0 || !/add photos in the settings/.test(placeholder || '')) return fail(`With no address a placeholder says to add photos, got "${placeholder}"`);
    pass('Photos with no address are left out');
  },

  'should keep fullscreen off for the viewers in the builder': async ({ pass, fail }) => {
    const builder = await createBuilder(page(viewer({ images: [{ src: PICTURE, alt: 'One' }, { src: PICTURE, alt: 'Two' }] })));
    await waitForWidget(builder, 'pv');
    const flags = [...frameDoc(builder).querySelectorAll('k-photo-viewer')].map(item => item.hasAttribute('no-fullscreen'));
    builder.remove();
    if(flags.length !== 2 || flags.some(flag => !flag)) return fail(`Every viewer in the builder has no-fullscreen, got ${flags.join()}`);
    pass('The builder keeps clicks for selecting');
  }
};
