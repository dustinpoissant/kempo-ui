import '../../src/components/PageBuilder.js';

/*
  Utility Functions
*/
const wait = (ms = 150) => new Promise(resolve => setTimeout(resolve, ms));

const page = (...nodes) => ({ attrs: { title: 'Test' }, slots: { default: nodes } });

const gallery = (attrs = {}) => ({ id: 'mg', type: 'media-gallery', attrs, slots: {} });

const createBuilder = async value => {
  const builder = document.createElement('k-page-builder');
  builder.value = value;
  document.body.appendChild(builder);
  await builder.updateComplete;
  await builder.frame().ready;
  return builder;
};

const settingsOf = async builder => {
  builder.select('mg');
  await wait(400);
  const panel = builder.renderRoot.querySelector('k-page-builder-settings');
  await panel.updateComplete;
  const settings = panel.shadowRoot.querySelector('k-page-builder-media-gallery-settings');
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

const items = builder => builder.value.slots.default[0].attrs.items;

const refresh = async settings => {
  await wait(400);
  await settings.updateComplete;
};

const panelOf = (settings, index) => settings.shadowRoot.querySelector(`k-accordion-panel[name="pb-gallery-item-${index}"]`);

const headers = settings => [...settings.shadowRoot.querySelectorAll('k-accordion-header')].map(header => header.textContent.trim());

const buttonIn = (container, label) => [...container.querySelectorAll('button')].find(item => item.getAttribute('aria-label') === label);

const typeInto = async (input, value) => {
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  await wait(500);
};

const choose = async (select, value) => {
  select.value = value;
  select.dispatchEvent(new Event('change', { bubbles: true }));
  await wait(600);
};

const ownText = label => [...label.childNodes].find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim())?.textContent.trim();

const labelTexts = container => [...container.querySelectorAll('label')].map(ownText);

const optionTexts = select => [...select.options].map(option => option.textContent.trim());

/* Pictures that exist on the test server. */
const PICTURE = '/docs/media/icon48.png';

/*
  Tests
*/
export default {
  'should list each item by its alternative text, its file name or its number': async ({ pass, fail }) => {
    const builder = await createBuilder(page(gallery({ items: [{ src: '/a.jpg', alt: 'Cat' }, { src: '/media/My%20clip.mp4' }, { src: '/s.mp3?x=1' }, { src: '' }] })));
    const settings = await settingsOf(builder);
    if(!settings){ builder.remove(); return fail('The media gallery settings did not load'); }
    const list = headers(settings);
    builder.remove();
    if(list.join() !== 'Cat,My clip.mp4,s.mp3,Item 4') return fail(`Items are listed by alt text, then file name, then number, got ${list.join()}`);
    pass('Each item is listed by name');
  },

  'should give each item an address, a type, a thumbnail and alternative text, and a poster only for a video and cover art only for a sound': async ({ pass, fail }) => {
    const builder = await createBuilder(page(gallery({ items: [{ src: '/a.jpg' }, { src: '/b.mp4' }, { src: '/c.mp3' }] })));
    const settings = await settingsOf(builder);
    const image = labelTexts(panelOf(settings, 0));
    const video = labelTexts(panelOf(settings, 1));
    const audio = labelTexts(panelOf(settings, 2));
    const types = optionTexts(panelOf(settings, 0).querySelector('#pb-gallery-item-0-type'));
    const typeValue = ['0', '1', '2'].map(index => panelOf(settings, index).querySelector(`#pb-gallery-item-${index}-type`).value);
    builder.remove();
    if(image.join() !== 'Address,Type,Thumbnail,Alternative text') return fail(`A picture has address, type, thumbnail and alternative text, got ${image.join()}`);
    if(video.join() !== 'Address,Type,Poster,Thumbnail,Alternative text') return fail(`A video also has a poster, got ${video.join()}`);
    if(audio.join() !== 'Address,Type,Cover art,Thumbnail,Alternative text') return fail(`A sound has cover art, got ${audio.join()}`);
    if(types.join() !== 'Automatic (from the file),Image,Video,Audio') return fail(`The types are automatic, image, video and audio, got ${types.join()}`);
    if(typeValue.join() !== ',,') return fail(`The type is automatic until one is chosen, got ${typeValue.join()}`);
    pass('Each item has its fields');
  },

  'should add an item with Add item, empty, after the others, and add the first item to an empty gallery': async ({ pass, fail }) => {
    const builder = await createBuilder(page(gallery()));
    const settings = await settingsOf(builder);
    const before = headers(settings).length;
    settings.shadowRoot.querySelector('button.primary').click();
    await refresh(settings);
    const first = items(builder);
    settings.shadowRoot.querySelector('button.primary').click();
    await refresh(settings);
    const second = items(builder);
    const count = headers(settings).length;
    builder.remove();
    if(before !== 0) return fail(`A gallery with no items lists none, got ${before}`);
    if(first.length !== 1 || first[0].src !== '') return fail(`Add item adds an empty item, got ${JSON.stringify(first)}`);
    if(second.length !== 2 || count !== 2) return fail(`A second item is added after it, got ${second.length} and ${count}`);
    pass('Items are added');
  },

  'should move an item up or down keeping its fields, and disable moving past the ends, with icon only buttons': async ({ pass, fail }) => {
    const builder = await createBuilder(page(gallery({ items: [{ src: '/a.jpg', alt: 'One' }, { src: '/b.jpg', alt: 'Two' }, { src: '/c.jpg', alt: 'Three' }] })));
    const settings = await settingsOf(builder);
    const firstUp = buttonIn(panelOf(settings, 0), 'Move up').disabled;
    const lastDown = buttonIn(panelOf(settings, 2), 'Move down').disabled;
    const middle = buttonIn(panelOf(settings, 1), 'Move up').disabled || buttonIn(panelOf(settings, 1), 'Move down').disabled;
    buttonIn(panelOf(settings, 1), 'Move up').click();
    await refresh(settings);
    const afterUp = items(builder).map(item => item.alt).join();
    buttonIn(panelOf(settings, 1), 'Move down').click();
    await refresh(settings);
    const afterDown = items(builder).map(item => item.alt).join();
    const iconsOnly = [...panelOf(settings, 1).querySelectorAll('.btn-grp button')].every(item => item.textContent.trim() === '' && item.querySelector('k-icon'));
    builder.remove();
    if(!firstUp || !lastDown || middle) return fail('The first item cannot move up, the last cannot move down, and a middle one can do both');
    if(afterUp !== 'Two,One,Three') return fail(`Moving the second item up, got ${afterUp}`);
    if(afterDown !== 'Two,Three,One') return fail(`Moving the second item down, got ${afterDown}`);
    if(!iconsOnly) return fail('The buttons are icons only');
    pass('Items move');
  },

  'should remove an item and leave the others': async ({ pass, fail }) => {
    const builder = await createBuilder(page(gallery({ items: [{ src: '/a.jpg', alt: 'A' }, { src: '/b.jpg', alt: 'B' }, { src: '/c.jpg', alt: 'C' }] })));
    const settings = await settingsOf(builder);
    buttonIn(panelOf(settings, 1), 'Remove').click();
    await refresh(settings);
    const left = items(builder).map(item => item.alt).join();
    const list = headers(settings).join();
    builder.remove();
    if(left !== 'A,C' || list !== 'A,C') return fail(`Removing the second item leaves the first and third, got ${left} and ${list}`);
    pass('An item is removed');
  },

  'should store the fields of an item as typed, leave a field out when it is emptied, and draw the item in the gallery': async ({ pass, fail }) => {
    const builder = await createBuilder(page(gallery({ items: [{ src: '', alt: '' }] })));
    const settings = await settingsOf(builder);
    const panel = panelOf(settings, 0);
    await typeInto(panel.querySelector('#pb-gallery-item-0-alt'), 'A small icon');
    await typeInto(panelOf(settings, 0).querySelector('#pb-gallery-item-0-thumb'), PICTURE);
    await typeInto(panelOf(settings, 0).querySelector('#pb-gallery-item-0-src'), PICTURE);
    await waitForWidget(builder, 'mg');
    await wait(300);
    const stored = { ...items(builder)[0] };
    const element = frameDoc(builder).querySelector('k-media-gallery-item');
    const drawn = { src: element?.getAttribute('src'), alt: element?.getAttribute('alt'), thumb: element?.getAttribute('thumb') };
    await typeInto(panelOf(settings, 0).querySelector('#pb-gallery-item-0-thumb'), '');
    const cleared = { ...items(builder)[0] };
    builder.remove();
    if(stored.src !== PICTURE || stored.alt !== 'A small icon' || stored.thumb !== PICTURE) return fail(`The fields are stored, got ${JSON.stringify(stored)}`);
    if(drawn.src !== PICTURE || drawn.alt !== 'A small icon' || drawn.thumb !== PICTURE) return fail(`The gallery item has them as attributes, got ${JSON.stringify(drawn)}`);
    if('thumb' in cleared) return fail(`An emptied field is removed from the item, got ${JSON.stringify(cleared)}`);
    pass('Item fields are stored and drawn');
  },

  'should choose the type of an item, which shows its poster, and go back to automatic': async ({ pass, fail }) => {
    const builder = await createBuilder(page(gallery({ items: [{ src: '/a.jpg' }] })));
    const settings = await settingsOf(builder);
    const before = labelTexts(panelOf(settings, 0));
    await choose(panelOf(settings, 0).querySelector('#pb-gallery-item-0-type'), 'video');
    await settings.updateComplete;
    const typed = labelTexts(panelOf(settings, 0));
    const stored = items(builder)[0].type;
    await choose(panelOf(settings, 0).querySelector('#pb-gallery-item-0-type'), 'audio');
    await settings.updateComplete;
    const audio = labelTexts(panelOf(settings, 0));
    await choose(panelOf(settings, 0).querySelector('#pb-gallery-item-0-type'), '');
    await settings.updateComplete;
    const automatic = { labels: labelTexts(panelOf(settings, 0)), has: 'type' in items(builder)[0] };
    builder.remove();
    if(before.includes('Poster') || before.includes('Cover art')) return fail(`A picture has neither poster nor cover art, got ${before.join()}`);
    if(stored !== 'video' || !typed.includes('Poster')) return fail(`Choosing Video stores it and shows a poster, got ${stored} and ${typed.join()}`);
    if(!audio.includes('Cover art') || audio.includes('Poster')) return fail(`Choosing Audio shows cover art, got ${audio.join()}`);
    if(automatic.has || automatic.labels.includes('Poster')) return fail(`Automatic removes the type, got ${JSON.stringify(automatic)}`);
    pass('The type decides the poster');
  },

  'should store a poster for a video, and draw it on the gallery item': async ({ pass, fail }) => {
    const builder = await createBuilder(page(gallery({ items: [{ src: '/clip.mp4' }] })));
    const settings = await settingsOf(builder);
    await typeInto(panelOf(settings, 0).querySelector('#pb-gallery-item-0-poster'), PICTURE);
    await waitForWidget(builder, 'mg');
    await wait(300);
    const stored = items(builder)[0].poster;
    const drawn = frameDoc(builder).querySelector('k-media-gallery-item')?.getAttribute('poster');
    builder.remove();
    if(stored !== PICTURE || drawn !== PICTURE) return fail(`The poster is stored and drawn, got ${stored} and ${drawn}`);
    pass('A poster is stored');
  },

  'should leave an item with no address out of the gallery, and show a placeholder when none has one': async ({ pass, fail }) => {
    const builder = await createBuilder(page(gallery({ items: [{ src: PICTURE, alt: 'One' }, { src: '', alt: 'Empty' }, { src: PICTURE, alt: 'Two' }] })));
    await waitForWidget(builder, 'mg');
    const drawn = [...frameDoc(builder).querySelectorAll('k-media-gallery-item')].map(item => item.getAttribute('alt')).join();
    builder.setWidgetAttribute('mg', 'items', [{ src: '', alt: 'Empty' }], false);
    await wait(600);
    const placeholder = frameDoc(builder).querySelector('[data-pb-id="mg"]')?.textContent.trim();
    const gone = frameDoc(builder).querySelectorAll('k-media-gallery-item').length;
    builder.remove();
    if(drawn !== 'One,Two') return fail(`Only the items with an address are drawn, got ${drawn}`);
    if(gone !== 0 || !/add items in the settings/.test(placeholder || '')) return fail(`With no address a placeholder says to add items, got "${placeholder}"`);
    pass('Items with no address are left out');
  },

  'should have the settings of the gallery with their choices, and the defaults selected': async ({ pass, fail }) => {
    const builder = await createBuilder(page(gallery({ items: [{ src: PICTURE }] })));
    const settings = await settingsOf(builder);
    const fields = await fieldsOf(settings);
    const get = name => fields.shadowRoot.querySelector(`#pb-field-${name}`);
    const result = Object.fromEntries(['thumbsPosition', 'ratio', 'controls', 'visualizer'].map(name => [name, { options: optionTexts(get(name)).join(), value: get(name).value }]));
    const labels = labelTexts(fields.shadowRoot);
    builder.remove();
    if(labels.join() !== 'Thumbnails,Shape,Video and audio controls,Audio visualizer') return fail(`The settings are thumbnails, shape, controls and visualizer, got ${labels.join()}`);
    if(result.thumbsPosition.options !== 'Left,Top,Right,Bottom' || result.thumbsPosition.value !== 'left') return fail(`Thumbnails: ${JSON.stringify(result.thumbsPosition)}`);
    if(result.ratio.options !== 'Square (1/1),4/3,3/2,16/9,21/9,3/4,2/3' || result.ratio.value !== '1/1') return fail(`Shape: ${JSON.stringify(result.ratio)}`);
    if(result.controls.options !== 'Off,Minimal,Normal,Full' || result.controls.value !== 'minimal') return fail(`Controls: ${JSON.stringify(result.controls)}`);
    if(result.visualizer.options !== 'Bars,Waveform,Off' || result.visualizer.value !== 'bars') return fail(`Visualizer: ${JSON.stringify(result.visualizer)}`);
    pass('The gallery settings are offered');
  },

  'should store each gallery setting, write it on the gallery in the page, and go back to the default': async ({ pass, fail }) => {
    const builder = await createBuilder(page(gallery({ items: [{ src: PICTURE }] })));
    const settings = await settingsOf(builder);
    const fields = await fieldsOf(settings);
    const element = () => frameDoc(builder).querySelector('k-media-gallery');
    await waitForWidget(builder, 'mg');
    for(const [name, value] of [['thumbsPosition', 'top'], ['ratio', '16/9'], ['controls', 'full'], ['visualizer', 'wave']]){
      await choose(fields.shadowRoot.querySelector(`#pb-field-${name}`), value);
      await waitForWidget(builder, 'mg');
    }
    await wait(300);
    const stored = { ...builder.value.slots.default[0].attrs };
    const written = ['thumbs-position', 'ratio', 'controls', 'visualizer'].map(name => element().getAttribute(name)).join();
    const noFullscreen = element().hasAttribute('no-fullscreen');
    await choose(fields.shadowRoot.querySelector('#pb-field-thumbsPosition'), 'left');
    await waitForWidget(builder, 'mg');
    const back = element().getAttribute('thumbs-position');
    builder.remove();
    if(stored.thumbsPosition !== 'top' || stored.ratio !== '16/9' || stored.controls !== 'full' || stored.visualizer !== 'wave') return fail(`The choices are stored, got ${JSON.stringify(stored)}`);
    if(written !== 'top,16/9,full,wave') return fail(`The gallery in the page has them as attributes, got ${written}`);
    if(!noFullscreen) return fail('The gallery in the builder does not open fullscreen');
    if(back !== 'left' && back !== null) return fail(`Choosing left again leaves left, got ${back}`);
    pass('The gallery settings reach the page');
  }
};
