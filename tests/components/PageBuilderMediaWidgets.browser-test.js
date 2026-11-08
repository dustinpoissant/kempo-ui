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
  'should add a file link that downloads by default, with the text and icon of a download': async ({ pass, fail }) => {
    const builder = await createBuilder();
    const node = await add(builder, 'file');
    const link = await widgetOf(builder, node.id);
    const result = { tag: link?.localName, text: link?.textContent.trim(), icon: link?.querySelector('k-icon')?.getAttribute('name'), download: link?.hasAttribute('download'), type: first(builder).type, selected: builder.selection.join() };
    builder.remove();
    if(result.type !== 'file' || result.selected !== node.id) return fail(`A file should be added and selected, got ${result.type} ${result.selected}`);
    if(result.tag !== 'a' || result.text !== 'Download' || result.icon !== 'download') return fail(`A file is a link called Download with a download icon, got ${JSON.stringify(result)}`);
    if(!result.download) return fail('A file link downloads the file by default');
    pass('A file link is added');
  },

  'should set the address, text and look of a file link, with Color only for a button, and turn Download off': async ({ pass, fail }) => {
    const builder = await createBuilder();
    const node = await add(builder, 'file');
    await typeInto(field(builder, 'href'), '/files/report.pdf');
    await typeInto(field(builder, 'label'), 'Get the report');
    const colorBefore = !!field(builder, 'color');
    await choose(field(builder, 'look'), 'button');
    const colorAfter = field(builder, 'color');
    const colors = colorAfter ? labels(colorAfter) : [];
    await choose(colorAfter, 'primary');
    await turn(field(builder, 'download'), false);
    const link = await widgetOf(builder, node.id);
    const result = { href: link.getAttribute('href'), text: link.textContent.trim(), classes: link.className, download: link.hasAttribute('download') };
    builder.remove();
    if(colorBefore) return fail('Color is only for a file shown as a button');
    if(colors.join() !== 'Default,Primary,Secondary,Success,Warning,Danger') return fail(`The colors are the button colors, got ${colors.join()}`);
    if(result.href !== '/files/report.pdf' || result.text !== 'Get the report') return fail(`The address and text are on the page, got ${JSON.stringify(result)}`);
    if(!/\bbtn\b/.test(result.classes) || !/\bprimary\b/.test(result.classes)) return fail(`A button file is a primary button, got ${result.classes}`);
    if(result.download) return fail('Download off removes the download attribute');
    pass('A file link is set up');
  },

  /*
    Hero
  */
  'should add a hero 60vh tall with an empty place for content, and put a widget added while it is selected inside it': async ({ pass, fail }) => {
    const builder = await createBuilder();
    const node = await add(builder, 'hero');
    const hero = await widgetOf(builder, node.id);
    const style = hero.getAttribute('style');
    const place = hero.querySelector('[data-pb-slot="default"]');
    const shade = hero.querySelector('div[style*="rgba"]');
    builder.insert('text');
    await wait(700);
    const inside = first(builder).slots.default?.map(child => child.type).join();
    builder.remove();
    if(hero.localName !== 'section' || !/min-height: 60vh/.test(style)) return fail(`A hero is a section that is 60vh tall, got ${hero.localName} ${style}`);
    if(!place) return fail('A hero has a place for its content');
    if(shade) return fail('A hero with no picture has no overlay');
    if(inside !== 'text') return fail(`A widget added while the hero is selected goes inside it, got ${inside}`);
    pass('A hero holds widgets');
  },

  'should set the height, picture, overlay and fixed background of a hero, and spread it across the screen': async ({ pass, fail }) => {
    const builder = await createBuilder();
    const node = await add(builder, 'hero');
    const heights = labels(field(builder, 'height'));
    await choose(field(builder, 'height'), 'full');
    const full = (await widgetOf(builder, node.id)).getAttribute('style');
    await choose(field(builder, 'height'), 'medium');
    const medium = (await widgetOf(builder, node.id)).getAttribute('style');
    await typeInto(field(builder, 'image'), '/media/hero.jpg');
    await typeInto(field(builder, 'overlay'), '70');
    await turn(field(builder, 'fixed'), true);
    await turn(field(builder, 'breakout'), true);
    const hero = await widgetOf(builder, node.id);
    const style = hero.getAttribute('style');
    const shade = hero.querySelector('div[style*="rgba"]')?.getAttribute('style') || '';
    builder.remove();
    if(heights.join() !== 'Full screen,Tall,Medium') return fail(`The heights are full screen, tall and medium, got ${heights.join()}`);
    if(!/min-height: 100vh/.test(full) || !/min-height: 40vh/.test(medium)) return fail(`The height is a minimum height, got ${full} and ${medium}`);
    if(!/background-image: url\(.*hero\.jpg.*\)/.test(style) || !/background-size: cover/.test(style)) return fail(`The picture covers the hero, got ${style}`);
    if(!/background-attachment: fixed/.test(style)) return fail(`A fixed background stays still, got ${style}`);
    if(!/rgba\(0, 0, 0, 0\.7\)/.test(shade)) return fail(`An overlay of 70 is 0.7 dark, got ${shade}`);
    if(!/width: calc\(var\(--page-width/.test(style)) return fail(`A breakout hero spreads across the screen, got ${style}`);
    pass('A hero is set up');
  },

  /*
    Embed
  */
  'should show a placeholder for an embed with no address, then the embedded page once there is one': async ({ pass, fail }) => {
    const builder = await createBuilder();
    const node = await add(builder, 'embed');
    const empty = await widgetOf(builder, node.id);
    const placeholder = empty.textContent;
    const hadFrame = !!empty.querySelector('iframe');
    await typeInto(field(builder, 'src'), 'https://open.spotify.com/track/abc123');
    const music = await widgetOf(builder, node.id);
    const spotify = { src: music.querySelector('iframe')?.getAttribute('src'), style: music.getAttribute('style') };
    await typeInto(field(builder, 'src'), 'https://www.youtube.com/watch?v=abcdef12345');
    const video = await widgetOf(builder, node.id);
    const youtube = { src: video.querySelector('iframe')?.getAttribute('src'), style: video.getAttribute('style') };
    await typeInto(field(builder, 'src'), 'https://example.com/not-supported');
    const unsupported = await widgetOf(builder, node.id);
    const back = !!unsupported.querySelector('iframe');
    builder.remove();
    if(!/YouTube, Vimeo or Spotify/.test(placeholder) || hadFrame) return fail(`An embed with no address says what to add, got "${placeholder}"`);
    if(spotify.src !== 'https://open.spotify.com/embed/track/abc123' || !/height: 352px/.test(spotify.style)) return fail(`A Spotify page is its embed, 352px tall, got ${JSON.stringify(spotify)}`);
    if(!/^https:\/\/www\.youtube\.com\/embed\/abcdef12345\?/.test(youtube.src) || !/aspect-ratio: 16 \/ 9/.test(youtube.style)) return fail(`A YouTube page is its embed, 16 by 9, got ${JSON.stringify(youtube)}`);
    if(back) return fail('An address that is not YouTube, Vimeo or Spotify is not embedded');
    pass('An embed is shown when it has an address');
  },

  'should title an embed, and keep the embedded page from taking clicks or focus in the builder': async ({ pass, fail }) => {
    const builder = await createBuilder();
    const node = await add(builder, 'embed');
    await typeInto(field(builder, 'src'), 'https://open.spotify.com/album/xyz789');
    await typeInto(field(builder, 'title'), 'My album');
    const embed = await widgetOf(builder, node.id);
    const frame = embed.querySelector('iframe');
    const result = { title: frame.getAttribute('title'), tabindex: frame.getAttribute('tabindex'), events: frame.style.pointerEvents };
    builder.remove();
    if(result.title !== 'My album') return fail(`The title is the title of the embedded frame, got ${result.title}`);
    if(result.tabindex !== '-1' || result.events !== 'none') return fail(`In the builder the frame takes neither focus nor clicks, so the widget can be selected, got ${JSON.stringify(result)}`);
    pass('An embed is inert in the builder');
  }
};
