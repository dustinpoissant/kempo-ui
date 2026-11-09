import { escapeAttribute, escapeText } from './renderPage.js';
import imageSize from './imageSize.js';
import { sectionOpen } from './pageTree.js';

/*
  The widgets PageBuilder starts with, the same set kempo (cms) ships, minus the ones extensions add. A widget is a
  plain object (see pageWidgets.js for how it is checked). Paths point at kempo-ui's own files, resolved from this file,
  so they work wherever kempo-ui is served from.
*/

const componentUrl = path => new URL(path, import.meta.url).href;

const pagebuilder = name => componentUrl(`../components/pagebuilder/${name}.js`);

const options = (values, labels = {}) => values.map(value => ({ value, label: labels[value] ?? (value ? value[0].toUpperCase() + value.slice(1) : 'None') }));

const COLORS = ['primary', 'secondary', 'success', 'warning', 'danger'];

/* No main: a page has one, and it belongs to the template the page is drawn in, not to the page. */
const GROUP_ELEMENTS = ['div', 'section', 'article', 'header', 'footer', 'aside', 'nav'];

const COLUMN_SIZES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

/* A column's width at each screen size: a number of twelfths, or '' to fill what the other columns leave. Phones stack. */
const COLUMN_WIDTH_DEFAULTS = { desktop: '', tablet: '', mobile: '12' };

const IMAGE_RATIOS = ['', '1/1', '4/3', '3/2', '16/9', '21/9', '3/4', '2/3'];

const VIDEO_RATIOS = ['', '16/9', '21/9', '4/3', '1/1', '3/4', '9/16'];

const MEDIA_CONTROLS = options(['none', 'minimal', 'normal', 'full'], { none: 'Off', minimal: 'Minimal', normal: 'Normal', full: 'Full' });

/*
  The style that spreads an element to the full width of the screen from inside a narrower, centred column, with a negative
  margin, so it stays where it is in the page. The width is the page less the side panels a k-main makes room for
  (--left-panel-width and --right-panel-width, 0 where there are none), and the margin pulls the left edge out by half of what
  the column leaves over. Needs the column to be centred in the space it has, which `main`, `.container` and k-main are.
  --page-width, set by utils/pageWidth.js, is the page without its scrollbar; 100vw is only the fallback before it runs,
  because it includes the scrollbar, which would make the page scroll sideways.
*/
const BREAKOUT_STYLE = 'box-sizing: border-box; max-width: none; width: calc(var(--page-width, 100vw) - var(--left-panel-width, 0px) - var(--right-panel-width, 0px)); margin-left: calc((100% - (var(--page-width, 100vw) - var(--left-panel-width, 0px) - var(--right-panel-width, 0px))) / 2)';

const PAGE_WIDTH_MODULE = componentUrl('../utils/pageWidth.js');

/* The non-empty lines of a text field, trimmed: one address each. */
const trackLines = value => String(value || '').split('\n').map(line => line.trim()).filter(Boolean);

const SPACER_HEIGHTS = { small: '2rem', medium: '6rem', large: '12rem' };

const SPACING_CHOICES = ['', 'small', 'medium', 'large', 'custom'];

const SPACING_LABELS = { '': 'None', small: 'Small (2rem)', medium: 'Medium (6rem)', large: 'Large (12rem)', custom: 'Custom' };

/* Each twelfth as its simplest fraction (6 of 12 is 1/2), and the whole row as full width. */
const COLUMN_WIDTH_LABELS = Object.fromEntries(COLUMN_SIZES.map(size => {
  const n = Number(size);
  let a = n;
  let b = 12;
  while(b) [a, b] = [b, a % b];
  return [size, n === 12 ? 'Full width' : `${n / a}/${12 / a}`];
}));

export const COLUMN_WIDTH_OPTIONS = options(['', ...COLUMN_SIZES], { '': 'Fill the space', ...COLUMN_WIDTH_LABELS });

/* The width of a column at one screen size, with the default where the column has never been given one. */
export const columnWidth = (attrs, breakpoint) => attrs[breakpoint] ?? COLUMN_WIDTH_DEFAULTS[breakpoint];

/* The classes that give a column a width at one screen size (d-, t- or m- for desktop, tablet and mobile), or fill it. */
const widthClasses = (width, prefix) => (COLUMN_SIZES.includes(width) ? [`${prefix}-span-${width}`, `${prefix}-flex-0`] : [`${prefix}-flex-1`]);

/* The text of a placeholder, shown in the builder only, for a widget that has nothing to show yet. */
const placeholder = (node, ctx, definition, detail) => `<div class="p b r tc-muted ta-center"${ctx.mark(node, definition)}>${escapeText(definition.title)}: ${escapeText(detail)}</div>`;

/* The stand-in for a picture that has none yet, sized as the picture would be: 256px square, or its width and ratio. */
const imagePlaceholder = (node, ctx, definition) => {
  const attrs = node.attrs || {};
  const width = attrs.full ? '100%' : `${Number(attrs.width) > 0 ? Number(attrs.width) : 256}px`;
  const ratio = (imageRatio(attrs.ratio) || '1/1').replace('/', ' / ');
  const style = `position: relative; width: ${width}; max-width: 100%; aspect-ratio: ${ratio}; container-type: inline-size; background: #9e9e9e; color: #4a4a4a`;
  return `<div${ctx.mark(node, definition)} style="${escapeAttribute(style)}"><k-icon name="image" style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 30cqi"></k-icon></div>`;
};

const cssUrl = url => `url("${String(url).replace(/["\\\n]/g, '\\$&')}")`;

/* An icon in a widget's markup: a kempo icon by name, or a custom SVG when the value is "src:" and its path. */
const iconElement = (value, mark = '', spaced = false) => {
  if(!value) return '';
  const classes = spaced ? ' class="mrq"' : '';
  return String(value).startsWith('src:')
    ? `<k-icon src="${escapeAttribute(String(value).slice(4))}"${classes}${mark}></k-icon>`
    : `<k-icon name="${escapeAttribute(value)}"${classes}${mark}></k-icon>`;
};

const spacerHeight = attrs => (attrs.size === 'custom' ? `${Number(attrs.height) || 0}px` : SPACER_HEIGHTS[attrs.size] || SPACER_HEIGHTS.medium);

const spacing = (choice, pixels) => (choice === 'custom' ? `${Number(pixels) || 0}px` : SPACER_HEIGHTS[choice] || '');

/* An embed address for a YouTube, Vimeo or Spotify page, or '' for anything else. */
export const embedUrl = (address, { autoplay = false, muted = false, loop = false, controls = true } = {}) => {
  const url = String(address || '').trim();
  const youtube = /(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/.exec(url);
  if(youtube){
    const params = new URLSearchParams({ autoplay: autoplay ? 1 : 0, mute: muted || autoplay ? 1 : 0, loop: loop ? 1 : 0, controls: controls ? 1 : 0, playlist: loop ? youtube[1] : '' });
    return `https://www.youtube.com/embed/${youtube[1]}?${params}`;
  }
  const vimeo = /vimeo\.com\/(?:video\/)?(\d+)/.exec(url);
  if(vimeo){
    const params = new URLSearchParams({ autoplay: autoplay ? 1 : 0, muted: muted || autoplay ? 1 : 0, loop: loop ? 1 : 0, controls: controls ? 1 : 0 });
    return `https://player.vimeo.com/video/${vimeo[1]}?${params}`;
  }
  const spotify = /open\.spotify\.com\/(?:embed\/)?(track|album|playlist|episode|show)\/(\w+)/.exec(url);
  if(spotify) return `https://open.spotify.com/embed/${spotify[1]}/${spotify[2]}`;
  return '';
};

const sanitizeCode = code => String(code).replace(/<\/script/gi, '<\\/script');

const heroHeight = { full: '100vh', tall: '60vh', medium: '40vh' };

const imageRatio = ratio => (IMAGE_RATIOS.includes(ratio) ? ratio : '');

const sectionIds = node => `pb-${node.id}`;

/* The name a tab and its content share: the one it was given (letters, numbers, dashes), unless an earlier tab has it, then the id-based one. It is what the address hash and the remembered tab hold. */
const cleanTabName = value => String(value ?? '').trim().replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '');

const tabName = (node, parent) => {
  const name = cleanTabName(node.attrs?.name);
  const tabs = parent?.slots?.default || [];
  return name && !tabs.slice(0, tabs.indexOf(node)).some(tab => cleanTabName(tab.attrs?.name) === name) ? name : sectionIds(node);
};

export default [

  /*
    Text
  */
  {
    name: 'text',
    title: 'Text',
    category: 'content',
    icon: 'format_paragraph',
    description: 'Paragraphs, headings, lists, quotes and code, with bold, italic and links.',
    keywords: ['paragraph', 'heading', 'list', 'quote', 'code', 'markup'],
    tag: 'div',
    settings: pagebuilder('TextSettings'),
    settingsTag: 'k-page-builder-text-settings',
    content: { name: 'html', mode: 'html' },
    render: (node, ctx, info) => ctx.standard(node, info, { extra: ctx.editor ? ' contenteditable="true"' : '' }),
    attributes: [
      { name: 'html', type: 'text', virtual: true }
    ]
  },
  {
    name: 'markdown',
    title: 'Markdown',
    category: 'content',
    icon: 'markdown',
    description: 'Text written in Markdown. It is typed on the page and shown formatted once you leave it.',
    keywords: ['markdown', 'md', 'formatting', 'readme', 'text'],
    tag: 'k-markdown',
    page: componentUrl('../components/Markdown.js'),
    editor: pagebuilder('MarkdownWidgetEditor'),
    editorTag: 'k-page-builder-markdown-editor',
    content: { name: 'markdown', mode: 'text' },
    attributes: [{ name: 'markdown', type: 'text', virtual: true }]
  },

  /*
    Media
  */
  {
    name: 'image',
    title: 'Image',
    category: 'media',
    icon: 'image',
    description: 'A picture.',
    keywords: ['picture', 'photo', 'img'],
    tag: 'img',
    page: componentUrl('../components/Icon.js'),
    attributes: [
      { name: 'src', type: 'image', label: 'Image URL' },
      { name: 'alt', type: 'string', label: 'Alternative text', hint: 'Describes the picture for people who cannot see it.' },
      { name: 'full', type: 'boolean', virtual: true, label: 'Full width', hint: 'Fills the width of its place. The picture keeps its aspect ratio.' },
      { name: 'width', type: 'number', label: 'Width (pixels)', min: 1, max: 4000, when: { full: 'false' } },
      { name: 'ratio', type: 'select', virtual: true, label: 'Aspect ratio', default: '', options: options(IMAGE_RATIOS, { '': 'Original', '1/1': 'Square (1:1)', '4/3': 'Standard (4:3)', '3/2': 'Photo (3:2)', '16/9': 'Widescreen (16:9)', '21/9': 'Cinema (21:9)', '3/4': 'Portrait (3:4)', '2/3': 'Tall portrait (2:3)' }) },
      { name: 'fit', type: 'select', virtual: true, label: 'Fit', default: '', options: options(['', 'contain'], { '': 'Fill and crop', contain: 'Show all' }) },
      { name: 'rounded', type: 'select', virtual: true, label: 'Corners', default: '', options: options(['', 'small', 'round'], { '': 'Square', small: 'Rounded', round: 'Circle' }) }
    ],
    classes: attrs => [attrs.full ? 'full' : '', attrs.rounded === 'round' ? 'round' : attrs.rounded === 'small' ? 'r' : ''],
    style: attrs => (imageRatio(attrs.ratio)
      ? `aspect-ratio: ${attrs.ratio.replace('/', ' / ')}; object-fit: ${attrs.fit === 'contain' ? 'contain' : 'cover'}`
      : ''),
    render: (node, ctx, info, definition) => (node.attrs?.src || !ctx.editor
      ? ctx.standard(node, info, { skip: node.attrs?.full ? ['width'] : [] })
      : imagePlaceholder(node, ctx, definition))
  },
  {
    name: 'video',
    title: 'Video',
    category: 'media',
    icon: 'play',
    description: 'A video file, or a YouTube or Vimeo address.',
    keywords: ['movie', 'youtube', 'vimeo', 'mp4'],
    tag: 'k-video',
    page: componentUrl('../components/Video.js'),
    attributes: [
      { name: 'src', type: 'video', label: 'Video URL', hint: 'A video file, or a YouTube or Vimeo address.' },
      { name: 'poster', type: 'image', label: 'Poster image', hint: 'Shown before the video plays. Video files only.' },
      { name: 'controls', type: 'select', label: 'Controls', default: 'normal', options: MEDIA_CONTROLS },
      { name: 'ratio', type: 'select', virtual: true, label: 'Aspect ratio', hint: 'Original keeps the video\'s own.', default: '', options: options(VIDEO_RATIOS, { '': 'Original', '16/9': 'Widescreen (16:9)', '21/9': 'Cinema (21:9)', '4/3': 'Standard (4:3)', '1/1': 'Square (1:1)', '3/4': 'Portrait (3:4)', '9/16': 'Tall portrait (9:16)' }) },
      { name: 'autoplay', type: 'boolean', label: 'Play automatically', hint: 'Browsers only start a video by themselves when it is muted, so it is muted too.' },
      { name: 'loop', type: 'boolean', label: 'Loop' },
      { name: 'muted', type: 'boolean', label: 'Muted' },
      { name: 'preload', type: 'select', label: 'Loading', hint: 'How much of a video file loads before it is played.', default: 'metadata', options: options(['none', 'metadata', 'auto'], { none: 'Nothing', metadata: 'Its length and first picture', auto: 'All of it' }) }
    ],
    render: (node, ctx, info, definition) => {
      const attrs = node.attrs || {};
      if(!attrs.src) return ctx.editor ? placeholder(node, ctx, definition, 'add a video address in the settings') : '';
      const embed = embedUrl(attrs.src, { autoplay: attrs.autoplay, muted: attrs.muted, loop: attrs.loop, controls: attrs.controls !== 'none' });
      if(!embed) return ctx.standard(node, info, { skip: ['ratio', 'controls'], extra: ` controls="${escapeAttribute(attrs.controls || 'normal')}"`, style: attrs.ratio ? `aspect-ratio: ${attrs.ratio.replace('/', ' / ')}` : '' });
      return `<div${ctx.mark(node, definition)} style="position: relative; aspect-ratio: ${attrs.ratio ? attrs.ratio.replace('/', ' / ') : '16 / 9'}">`
        + `<iframe src="${escapeAttribute(embed)}" title="Video" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0"></iframe></div>`;
    }
  },
  {
    name: 'audio',
    title: 'Audio',
    category: 'media',
    icon: 'volume_up',
    description: 'An audio player.',
    keywords: ['sound', 'music', 'podcast', 'mp3'],
    tag: 'k-audio',
    page: [componentUrl('../components/Audio.js'), componentUrl('../components/AudioTrack.js'), componentUrl('../components/controls/AudioVisualizer.js')],
    attributes: [
      { name: 'src', type: 'audio', label: 'Audio URL', hint: 'The address of an audio file.' },
      { name: 'tracks', type: 'text', virtual: true, label: 'Tracks', hint: 'One address per line. With the Playlist controls these are the tracks, in order.' },
      { name: 'controls', type: 'select', label: 'Controls', default: 'normal', options: options(['none', 'minimal', 'normal', 'full', 'playlist'], { none: 'Off', minimal: 'Minimal', normal: 'Normal', full: 'Full', playlist: 'Playlist' }) },
      { name: 'visualizer', type: 'select', virtual: true, label: 'Visualizer', hint: 'Draws the sound as it plays. It needs a file from this site, or one the other site allows with CORS.', default: '', options: options(['', 'bars', 'wave'], { '': 'Off', bars: 'Bars', wave: 'Waveform' }) },
      { name: 'autoplay', type: 'boolean', label: 'Play automatically' },
      { name: 'loop', type: 'boolean', label: 'Loop' },
      { name: 'muted', type: 'boolean', label: 'Muted' },
      { name: 'preload', type: 'select', label: 'Loading', default: 'metadata', options: options(['none', 'metadata', 'auto'], { none: 'Nothing', metadata: 'Its length', auto: 'All' }) }
    ],
    render: (node, ctx, info, definition) => {
      const attrs = node.attrs || {};
      const tracks = trackLines(attrs.tracks);
      if(!attrs.src && !tracks.length && ctx.editor) return placeholder(node, ctx, definition, 'add an audio address in the settings');
      const visualizer = ['bars', 'wave'].includes(attrs.visualizer) ? `<kc-audio-visualizer slot="visualizer" type="${attrs.visualizer}"></kc-audio-visualizer>` : '';
      const content = visualizer + tracks.map(src => `<k-audio-track src="${escapeAttribute(src)}"></k-audio-track>`).join('');
      return ctx.standard(node, info, { skip: ['controls'], extra: ` controls="${escapeAttribute(attrs.controls || 'normal')}"`, content });
    }
  },
  {
    name: 'file',
    title: 'File',
    category: 'media',
    icon: 'attach_file',
    description: 'A link to download a file.',
    keywords: ['download', 'attachment', 'pdf', 'document'],
    tag: 'a',
    inline: true,
    page: componentUrl('../components/Icon.js'),
    attributes: [
      { name: 'href', type: 'file', label: 'File address' },
      { name: 'label', type: 'string', virtual: true, label: 'Link text', default: 'Download' },
      { name: 'icon', type: 'icon', virtual: true, label: 'Icon', hint: 'Shown in front of the link text. Leave it empty for no icon.', default: 'download' },
      { name: 'look', type: 'select', virtual: true, label: 'Shows as', default: 'link', options: [{ value: 'link', label: 'Link' }, { value: 'button', label: 'Button' }] },
      { name: 'color', type: 'select', virtual: true, label: 'Color', default: '', options: options(['', ...COLORS], { '': 'Default' }), when: { look: 'button' } },
      { name: 'download', type: 'boolean', label: 'Download the file', default: true }
    ],
    render: (node, ctx, info) => {
      const attrs = node.attrs || {};
      return ctx.standard(node, info, {
        classes: attrs.look === 'button' ? ['btn', COLORS.includes(attrs.color) ? attrs.color : ''] : [],
        content: iconElement(attrs.icon ?? 'download', '', true) + escapeText(attrs.label ?? 'Download')
      });
    }
  },
  {
    name: 'photo-viewer',
    title: 'Photo viewer',
    category: 'media',
    icon: 'photo_library',
    description: 'One picture, or a gallery of them, that open large when they are clicked and can be paged through.',
    keywords: ['gallery', 'lightbox', 'photo', 'zoom', 'images'],
    tag: 'k-photo-viewer',
    page: componentUrl('../components/PhotoViewer.js'),
    settings: pagebuilder('PhotoViewerSettings'),
    settingsTag: 'k-page-builder-photo-viewer-settings',
    attributes: [
      { name: 'images', type: 'json', virtual: true, default: [] },
      { name: 'columns', type: 'select', virtual: true, label: 'Photos per row', default: '3', options: options(Array.from({ length: 12 }, (_, index) => String(index + 1))) }
    ],
    prepare: async node => {
      const images = node.attrs?.images || [];
      const sizes = await Promise.all(images.map(image => (image?.src && image.width === undefined ? imageSize(image.src) : null)));
      if(!sizes.some(Boolean)) return null;
      return live => {
        const photos = live.attrs.images || [];
        return sizes.map((size, index) => {
          if(!size || photos[index]?.src !== images[index].src || photos[index].width !== undefined) return false;
          photos[index] = { ...photos[index], width: size.width, height: size.height };
          return true;
        }).some(Boolean);
      };
    },
    render: (node, ctx, info, definition) => {
      const images = (node.attrs?.images || []).filter(image => image?.src);
      if(!images.length) return ctx.editor ? placeholder(node, ctx, definition, 'add photos in the settings') : '';
      const viewer = (image, extra = '') => `<k-photo-viewer src="${escapeAttribute(image.src)}" alt="${escapeAttribute(image.alt || '')}"${ctx.editor ? ' no-fullscreen' : ''}${extra}>${escapeText(image.caption || '')}</k-photo-viewer>`;
      if(images.length === 1) return viewer(images[0], ctx.mark(node, definition));
      const squarest = images.filter(image => image.width && image.height).reduce((best, image) => (!best || Math.abs(Math.log(image.width / image.height)) < Math.abs(Math.log(best.width / best.height)) ? image : best), null);
      const ratio = squarest ? ` ratio="${squarest.width}/${squarest.height}"` : '';
      const columns = Math.min(12, Math.max(1, Number(node.attrs?.columns) || 3));
      const sized = columns >= 2 && columns <= 10;
      const classes = ['d-g', sized ? `cols-${columns}` : '', sized && columns > 2 ? 'm-cols-2' : ''].filter(Boolean).join(' ');
      const style = sized ? '' : ` style="grid-template-columns: repeat(${columns}, 1fr)"`;
      return `<div class="${classes}"${style}${ctx.mark(node, definition)}>\n${images.map(image => viewer(image, ` class="pq"${ratio}`)).join('\n')}\n</div>`;
    }
  },
  {
    name: 'media-gallery',
    title: 'Media gallery',
    category: 'media',
    icon: 'gallery-thumbnail',
    description: 'Pictures, videos and sounds in one gallery, with thumbnails, arrows and a fullscreen view.',
    keywords: ['gallery', 'product', 'images', 'photos', 'video', 'audio', 'carousel', 'slider', 'thumbnails', 'lightbox'],
    tag: 'k-media-gallery',
    page: componentUrl('../components/MediaGallery.js'),
    settings: pagebuilder('MediaGallerySettings'),
    settingsTag: 'k-page-builder-media-gallery-settings',
    attributes: [
      { name: 'items', type: 'json', virtual: true, default: [] },
      { name: 'thumbsPosition', attr: 'thumbs-position', type: 'select', label: 'Thumbnails', default: 'left', options: options(['left', 'top', 'right', 'bottom']) },
      { name: 'ratio', type: 'select', label: 'Shape', hint: 'The shape of the large area. Every item is fitted inside it.', default: '1/1', options: options(['1/1', '4/3', '3/2', '16/9', '21/9', '3/4', '2/3'], { '1/1': 'Square (1/1)' }) },
      { name: 'controls', type: 'select', label: 'Video and audio controls', default: 'minimal', options: MEDIA_CONTROLS },
      { name: 'visualizer', type: 'select', label: 'Audio visualizer', hint: 'Draws the sound as it plays. It needs a file from this site, or one the other site allows with CORS.', default: 'bars', options: options(['bars', 'wave', 'none'], { bars: 'Bars', wave: 'Waveform', none: 'Off' }) }
    ],
    render: (node, ctx, info, definition) => {
      const items = (node.attrs?.items || []).filter(item => item?.src);
      if(!items.length) return ctx.editor ? placeholder(node, ctx, definition, 'add items in the settings') : '';
      const element = item => `<k-media-gallery-item src="${escapeAttribute(item.src)}"${['type', 'poster', 'thumb', 'alt'].filter(name => item[name]).map(name => ` ${name}="${escapeAttribute(item[name])}"`).join('')}></k-media-gallery-item>`;
      return ctx.standard(node, info, { content: items.map(element).join(''), extra: ctx.editor ? ' no-fullscreen' : '' });
    }
  },
  {
    name: 'hero',
    title: 'Hero',
    category: 'media',
    icon: 'panorama',
    description: 'A large background image with content on top of it.',
    keywords: ['banner', 'cover', 'header', 'background'],
    tag: 'section',
    page: PAGE_WIDTH_MODULE,
    display: '',
    attributes: [
      { name: 'image', type: 'image', virtual: true, label: 'Background image' },
      { name: 'height', type: 'select', virtual: true, label: 'Height', default: 'tall', options: options(['full', 'tall', 'medium'], { full: 'Full screen', tall: 'Tall', medium: 'Medium' }) },
      { name: 'overlay', type: 'number', virtual: true, label: 'Overlay darkness (0 to 90)', default: 40, min: 0, max: 90 },
      { name: 'fixed', type: 'boolean', virtual: true, label: 'Fixed background', hint: 'The picture stays still while the page scrolls over it. Phones that do not support this scroll it with the page.' },
      { name: 'breakout', type: 'boolean', virtual: true, label: 'Fullscreen breakout', hint: 'Spread to the full width of the screen, out of the page column.' }
    ],
    slots: [{ name: 'default', label: 'Content' }],
    render: (node, ctx, info, definition) => {
      const attrs = node.attrs || {};
      const background = attrs.image ? `background-image: ${cssUrl(attrs.image)}; background-size: cover; background-position: center; ${attrs.fixed ? 'background-attachment: fixed; ' : ''}` : '';
      const style = `position: relative; display: flex; align-items: center; min-height: ${heroHeight[attrs.height] || heroHeight.tall}; ${background}${attrs.breakout ? `${BREAKOUT_STYLE}; ` : ''}`;
      const shade = `position: absolute; inset: 0; pointer-events: none; background: rgba(0, 0, 0, ${(Number(attrs.overlay) || 0) / 100})`;
      return `<section${ctx.mark(node, definition)} style="${escapeAttribute(style)}">`
        + (attrs.image ? `<div style="${shade}"></div>` : '')
        + `<div class="p" style="position: relative; width: 100%"${ctx.editor ? ' data-pb-slot="default"' : ''}>${ctx.children(node)}</div>`
        + '</section>';
    }
  },
  {
    name: 'embed',
    title: 'Embed',
    category: 'media',
    icon: 'iframe',
    description: 'A YouTube, Vimeo or Spotify embed.',
    keywords: ['iframe', 'youtube', 'vimeo', 'spotify', 'embed'],
    tag: 'div',
    attributes: [
      { name: 'src', type: 'url', virtual: true, label: 'Address', hint: 'The address of a YouTube, Vimeo or Spotify page.' },
      { name: 'title', type: 'string', virtual: true, label: 'Title' }
    ],
    /* In the builder the embedded page does not take clicks or focus: a cross-origin iframe swallows both, so the widget could not be selected by clicking it, and keys pressed in it never reach the builder. */
    render: (node, ctx, info, definition) => {
      const src = embedUrl(node.attrs?.src);
      if(!src) return ctx.editor ? placeholder(node, ctx, definition, 'add a YouTube, Vimeo or Spotify address in the settings') : '';
      const height = src.startsWith('https://open.spotify.com') ? 'height: 352px' : 'aspect-ratio: 16 / 9';
      return `<div${ctx.mark(node, definition)} style="position: relative; ${height}">`
        + `<iframe src="${escapeAttribute(src)}" title="${escapeAttribute(node.attrs?.title || 'Embedded content')}" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen loading="lazy"${ctx.editor ? ' tabindex="-1"' : ''} style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0${ctx.editor ? '; pointer-events: none' : ''}"></iframe></div>`;
    }
  },

  /*
    Layout
  */
  {
    name: 'group',
    title: 'Group',
    category: 'layout',
    icon: 'fit_screen',
    description: 'A box that holds other widgets.',
    keywords: ['container', 'section', 'box', 'div', 'wrapper'],
    tag: 'div',
    attributes: [
      { name: 'element', type: 'select', virtual: true, label: 'HTML element', default: 'div', options: options(GROUP_ELEMENTS, { div: 'div (a plain box)' }) },
      { name: 'height', type: 'number', virtual: true, label: 'Height', hint: '0 keeps it as tall as what is inside. A set height gives widgets that fill their container, like Tabs with a fixed height, something to fill.', min: 0, max: 5000, default: 0 },
      { name: 'heightUnit', type: 'select', virtual: true, label: 'Height unit', beside: 'height', default: 'px', options: options(['px', 'rem', 'vh'], { px: 'px', rem: 'rem', vh: 'vh' }) }
    ],
    style: attrs => (Number(attrs.height) > 0 ? `height: ${Number(attrs.height)}${['px', 'rem', 'vh'].includes(attrs.heightUnit) ? attrs.heightUnit : 'px'}` : ''),
    slots: [{ name: 'default', label: 'Content' }],
    render: (node, ctx, info) => ctx.standard(node, info, { tag: GROUP_ELEMENTS.includes(node.attrs?.element) ? node.attrs.element : 'div' })
  },
  {
    name: 'breakout',
    title: 'Fullscreen breakout',
    category: 'layout',
    icon: 'arrows-outward',
    description: 'A box that spreads to the full width of the screen, out of a narrow page column. It stays where it is in the page.',
    keywords: ['full width', 'fullscreen', 'full bleed', 'edge to edge', 'wide', 'stretch', 'break out', 'container'],
    tag: 'div',
    page: PAGE_WIDTH_MODULE,
    attributes: [
      { name: 'contain', type: 'boolean', virtual: true, label: 'Keep the content in a column', hint: 'The box, and its background, spread across the screen, and the content stays as wide as the page column.' }
    ],
    slots: [{ name: 'default', label: 'Content' }],
    render: (node, ctx, info, definition) => {
      if(!node.attrs?.contain) return ctx.standard(node, info, { style: BREAKOUT_STYLE });
      return `<div${ctx.mark(node, definition)} style="${escapeAttribute(BREAKOUT_STYLE)}"><div class="container"${ctx.editor ? ' data-pb-slot="default"' : ''}>${ctx.children(node)}</div></div>`;
    }
  },
  {
    name: 'container',
    title: 'Container',
    category: 'layout',
    icon: 'width_full',
    description: 'A centred column no wider than the page column (the container class). Use it to narrow a page whose template is full width.',
    keywords: ['column', 'narrow', 'constrain', 'centered', 'centred', 'width', 'max width', 'wrapper'],
    tag: 'div',
    slots: [{ name: 'default', label: 'Content' }],
    classes: () => ['container']
  },
  {
    name: 'columns',
    title: 'Columns',
    category: 'layout',
    icon: 'view_column',
    description: 'Side by side columns that stack on a phone. Add a column for each part.',
    keywords: ['row', 'columns', 'grid', 'split', 'side by side'],
    tag: 'div',
    settings: pagebuilder('ColumnsSettings'),
    settingsTag: 'k-page-builder-columns-settings',
    slots: [{ name: 'default', label: 'Columns' }],
    children: { default: ['column', 'column'] },
    display: '',
    classes: () => ['row', '-mx']
  },
  {
    name: 'column',
    title: 'Column',
    category: 'layout',
    icon: 'view_column',
    description: 'One column of a row. Give it a width at each screen size, or let it fill the space the others leave.',
    keywords: ['row', 'width', 'split'],
    section: true,
    tag: 'div',
    attributes: [
      { name: 'desktop', type: 'select', virtual: true, label: 'Desktop width', hint: 'Screens 1024px and wider.', default: COLUMN_WIDTH_DEFAULTS.desktop, options: COLUMN_WIDTH_OPTIONS },
      { name: 'tablet', type: 'select', virtual: true, label: 'Tablet width', hint: 'Screens from 769px to 1023px.', default: COLUMN_WIDTH_DEFAULTS.tablet, options: COLUMN_WIDTH_OPTIONS },
      { name: 'mobile', type: 'select', virtual: true, label: 'Mobile width', hint: 'Screens 768px and narrower. A full width column stacks on its own.', default: COLUMN_WIDTH_DEFAULTS.mobile, options: COLUMN_WIDTH_OPTIONS }
    ],
    slots: [{ name: 'default', label: 'Content' }],
    classes: attrs => [
      ...widthClasses(columnWidth(attrs, 'desktop'), 'd'),
      ...widthClasses(columnWidth(attrs, 'tablet'), 't'),
      ...widthClasses(columnWidth(attrs, 'mobile'), 'm'),
      'px'
    ]
  },
  {
    name: 'spacer',
    title: 'Spacer',
    category: 'layout',
    icon: 'unfold_more',
    description: 'Empty space between widgets.',
    keywords: ['gap', 'space', 'margin', 'padding'],
    tag: 'div',
    attributes: [
      { name: 'size', type: 'select', virtual: true, label: 'Size', default: 'medium', options: options(['small', 'medium', 'large', 'custom'], { small: 'Small (2rem)', medium: 'Medium (6rem)', large: 'Large (12rem)', custom: 'Custom' }) },
      { name: 'height', type: 'number', virtual: true, label: 'Height (pixels)', min: 0, max: 2000, default: 48, when: { size: 'custom' } }
    ],
    style: attrs => `height: ${spacerHeight(attrs)}`,
    render: (node, ctx, info) => ctx.standard(node, info, ctx.editor ? { content: 'Spacer', classes: ['tc-muted', 'ta-center'] } : {})
  },
  {
    name: 'divider',
    title: 'Horizontal rule',
    category: 'layout',
    icon: 'horizontal_rule',
    description: 'A horizontal line, with space above and below it.',
    keywords: ['line', 'rule', 'divider', 'separator', 'hr', 'horizontal'],
    tag: 'hr',
    attributes: [
      { name: 'above', type: 'select', virtual: true, label: 'Space above', hint: 'Used instead of the top margin in the Styles tab, when it is not None.', default: '', options: options(SPACING_CHOICES, SPACING_LABELS) },
      { name: 'aboveHeight', type: 'number', virtual: true, label: 'Space above (pixels)', min: 0, max: 2000, default: 48, when: { above: 'custom' } },
      { name: 'below', type: 'select', virtual: true, label: 'Space below', hint: 'Used instead of the bottom margin in the Styles tab, when it is not None.', default: '', options: options(SPACING_CHOICES, SPACING_LABELS) },
      { name: 'belowHeight', type: 'number', virtual: true, label: 'Space below (pixels)', min: 0, max: 2000, default: 48, when: { below: 'custom' } }
    ],
    /* !important, because the margin classes of the Styles tab are: without it a margin set there would silently win over a Space above or below chosen here. */
    style: attrs => [
      spacing(attrs.above, attrs.aboveHeight) && `margin-top: ${spacing(attrs.above, attrs.aboveHeight)} !important`,
      spacing(attrs.below, attrs.belowHeight) && `margin-bottom: ${spacing(attrs.below, attrs.belowHeight)} !important`
    ].filter(Boolean).join('; ')
  },

  /*
    Content
  */
  {
    name: 'button',
    title: 'Button',
    category: 'content',
    icon: 'button',
    description: 'A link that looks like a button, or a real button that a script can use.',
    keywords: ['link', 'call to action', 'cta', 'script'],
    tag: 'a',
    inline: true,
    hideStyles: ['background'],
    page: componentUrl('../components/Icon.js'),
    attributes: [
      { name: 'kind', type: 'select', virtual: true, label: 'Type', default: 'link', options: [{ value: 'link', label: 'Link' }, { value: 'button', label: 'Button' }] },
      { name: 'href', type: 'url', label: 'URL', when: { kind: 'link' } },
      { name: 'newTab', type: 'boolean', virtual: true, label: 'Open in a new tab', when: { kind: 'link' } },
      { name: 'id', type: 'id', label: 'ID', hint: 'A script on the page can find this button by its ID, to make it do something.', when: { kind: 'button' } },
      { name: 'label', type: 'string', virtual: true, label: 'Button text', default: 'Button' },
      { name: 'icon', type: 'icon', virtual: true, label: 'Icon', hint: 'Shown in front of the text. Leave it empty for no icon.' },
      { name: 'color', type: 'select', virtual: true, label: 'Color', hint: 'The whole look of the button: its background, text and border. The Styles tab has no background for a button for this reason.', default: '', options: options(['', ...COLORS], { '': 'Default' }) },
      { name: 'full', type: 'boolean', virtual: true, label: 'Full width', hint: 'Stretches the button across the width of its place. Line the text up inside it with the text alignment in the Styles tab.' }
    ],
    render: (node, ctx, info) => {
      const attrs = node.attrs || {};
      const real = attrs.kind === 'button' && !ctx.editor;
      const link = attrs.kind !== 'button';
      const color = COLORS.includes(attrs.color) ? attrs.color : '';
      return ctx.standard(node, info, {
        tag: real ? 'button' : 'a',
        skip: link ? [] : ['href'],
        classes: real ? [color, attrs.full ? 'full' : ''] : ['btn', color, attrs.full ? 'full' : ''],
        extra: real ? ' type="button"' : (link && attrs.newTab ? ' target="_blank" rel="noopener"' : ''),
        content: iconElement(attrs.icon, '', true) + escapeText(attrs.label ?? 'Button')
      });
    }
  },
  {
    name: 'table',
    title: 'Table',
    category: 'content',
    icon: 'table',
    description: 'Rows and columns of text.',
    keywords: ['grid', 'rows', 'columns', 'data', 'spreadsheet'],
    tag: 'table',
    settings: pagebuilder('TableSettings'),
    settingsTag: 'k-page-builder-table-settings',
    attributes: [
      { name: 'headers', type: 'select', virtual: true, label: 'Headings', hint: 'Which cells are headings. A table with no headings is styled with kempo-css\'s no-headers class; one whose first column is headings with left-headers.', default: 'top', options: options(['top', 'left-top', 'left', 'none'], { top: 'First row', 'left-top': 'First row and first column', left: 'First column', none: 'No headings' }) },
      { name: 'responsive', type: 'boolean', virtual: true, label: 'Make responsive', hint: 'Puts the table in a box that scrolls sideways when the screen is too narrow for it, instead of making the whole page wider.', default: true },
      { name: 'rows', type: 'json', virtual: true, label: 'Cells', default: [['', ''], ['', '']] },
      { name: 'spans', type: 'json', virtual: true, label: 'Columns a cell spans', default: {} },
      { name: 'widths', type: 'json', virtual: true, label: 'Column widths', default: [] }
    ],
    /*
      Keys in a cell (see `keydown` in pageWidgets.js): Enter moves into the same column of the next row, and on the last row adds
      a row below and moves into it. Ctrl (or Cmd) + Enter adds a column after the cell and moves into it. Shift + Enter is left alone, so it is a new
      line in the cell. What was typed in the cell is not stored yet, so it comes in as `html`.
    */
    keydown: (event, { node, path, html }) => {
      const at = /^rows\.(\d+)\.(\d+)$/.exec(path);
      if(!at || event.key !== 'Enter' || event.shiftKey || event.altKey) return null;
      const row = Number(at[1]);
      const column = Number(at[2]);
      const attrs = node.attrs || {};
      const rows = structuredClone(Array.isArray(attrs.rows) && attrs.rows.length ? attrs.rows : [['', ''], ['', '']]);
      rows[row][column] = html;
      const columns = Math.max(1, ...rows.map(cells => cells.length));
      const spans = attrs.spans && typeof attrs.spans === 'object' ? attrs.spans : {};
      const moved = {};
      if(!(event.ctrlKey || event.metaKey)){
        if(row + 1 < rows.length) return { attrs: { rows }, focus: `rows.${row + 1}.${column}` };
        rows.splice(row + 1, 0, Array(columns).fill(''));
        for(const [key, span] of Object.entries(spans)){
          const [spanRow, spanColumn] = key.split('.').map(Number);
          moved[`${spanRow > row ? spanRow + 1 : spanRow}.${spanColumn}`] = span;
        }
        return { attrs: { rows, spans: moved }, focus: `rows.${row + 1}.${column}` };
      }
      const index = column + Math.min(columns - column, Math.max(1, Math.floor(Number(spans[`${row}.${column}`])) || 1));
      for(const cells of rows){
        while(cells.length < columns) cells.push('');
        cells.splice(index, 0, '');
      }
      for(const [key, span] of Object.entries(spans)){
        const [spanRow, spanColumn] = key.split('.').map(Number);
        if(spanColumn >= index) moved[`${spanRow}.${spanColumn + 1}`] = span;
        else moved[key] = spanColumn + span > index ? span + 1 : span;
      }
      const widths = Array.isArray(attrs.widths) ? [...attrs.widths] : [];
      if(widths.length){
        while(widths.length < columns) widths.push('');
        widths.splice(index, 0, '');
      }
      return { attrs: { rows, spans: moved, widths }, focus: `rows.${row}.${index}` };
    },
    /*
      The cells are HTML, typed on the page: in the builder each is contenteditable and names where it is kept
      (data-pb-edit="rows.1.0"). `spans` is { "row.column": number }, a cell that covers the columns after it; the cells it
      covers are left out of the markup, and keep their content, so unmerging brings it back.
    */
    render: (node, ctx, info, definition) => {
      const attrs = node.attrs || {};
      const rows = Array.isArray(attrs.rows) && attrs.rows.length ? attrs.rows : [['', ''], ['', '']];
      const headers = ['top', 'left-top', 'left', 'none'].includes(attrs.headers) ? attrs.headers : 'top';
      const top = headers === 'top' || headers === 'left-top';
      const left = headers === 'left' || headers === 'left-top';
      const classAttr = headers === 'none' ? ' class="no-headers"' : (left ? ' class="left-headers"' : '');
      const columns = Math.max(1, ...rows.map(row => row.length));
      const spans = attrs.spans && typeof attrs.spans === 'object' ? attrs.spans : {};
      const widths = Array.isArray(attrs.widths) ? attrs.widths : [];
      const group = widths.some(Boolean)
        ? `<colgroup>${Array.from({ length: columns }, (_, index) => `<col${widths[index] ? ` style="width: ${escapeAttribute(widths[index])}"` : ''}>`).join('')}</colgroup>\n`
        : '';
      const line = (rowIndex, cell, first = cell) => {
        const cells = [];
        for(let column = 0; column < columns;){
          const span = Math.min(columns - column, Math.max(1, Math.floor(Number(spans[`${rowIndex}.${column}`])) || 1));
          const edit = ctx.editor ? ` contenteditable="true" data-pb-edit="rows.${rowIndex}.${column}"` : '';
          const tag = column === 0 ? first : cell;
          cells.push(`<${tag}${span > 1 ? ` colspan="${span}"` : ''}${edit}>${ctx.sanitize(String(rows[rowIndex][column] ?? ''))}</${tag}>`);
          column += span;
        }
        return `<tr>${cells.join('')}</tr>`;
      };
      const head = top ? `<thead>\n${line(0, 'th')}\n</thead>\n` : '';
      const body = rows.map((row, index) => (top && index === 0 ? '' : line(index, 'td', left ? 'th' : 'td'))).filter(Boolean).join('\n');
      /* Responsive: the table is wrapped in kempo-css's .table-wrapper (which scrolls sideways). The widget's marks and styles then belong to the wrapper, its first element. */
      const table = responsive => `<table${classAttr}${responsive ? '' : ctx.mark(node, definition)}>\n${group}${head}<tbody>\n${body}\n</tbody>\n</table>`;
      return attrs.responsive === false ? table(false) : `<div class="table-wrapper"${ctx.mark(node, definition)}>\n${table(true)}\n</div>`;
    }
  },
  {
    name: 'html',
    title: 'HTML',
    category: 'content',
    icon: 'code',
    description: 'HTML written by hand, shown on the page exactly as it is.',
    keywords: ['code', 'raw', 'custom', 'markup'],
    tag: 'div',
    settings: pagebuilder('HtmlSettings'),
    settingsTag: 'k-page-builder-html-settings',
    content: { name: 'html', mode: 'raw' },
    attributes: [{ name: 'html', type: 'text', virtual: true }]
  },
  {
    name: 'script',
    title: 'Script',
    category: 'content',
    icon: 'code_blocks',
    description: 'Loads a JavaScript file, or runs JavaScript written here. Best placed in the scripts location.',
    keywords: ['javascript', 'js', 'file', 'src', 'module', 'defer', 'async', 'analytics', 'library', 'code'],
    tag: 'script',
    /* A script is not shown, which is its default display: a display class (d-b) would show its code on the page. */
    display: '',
    /* Nothing of a script is drawn, so margin, padding, colours, alignment and classes mean nothing to it: only its id is kept. */
    hideStyles: ['box', 'background', 'textColour', 'align', 'classes'],
    settings: pagebuilder('ScriptSettings'),
    settingsTag: 'k-page-builder-script-settings',
    attributes: [
      { name: 'src', type: 'url', label: 'Script file', hint: 'The address of the .js file.', default: '' },
      { name: 'type', type: 'select', label: 'Type', hint: 'A module can use import and export, and is always deferred.', default: '', options: [{ value: '', label: 'Classic' }, { value: 'module', label: 'Module' }] },
      { name: 'defer', type: 'boolean', label: 'Defer', hint: 'Run it after the page has been read, in order.' },
      { name: 'async', type: 'boolean', label: 'Async', hint: 'Run it as soon as it has loaded, in any order.' },
      { name: 'crossorigin', type: 'select', label: 'Cross-origin', hint: 'For a file from another site.', default: '', options: [{ value: '', label: 'Not set' }, { value: 'anonymous', label: 'Anonymous' }, { value: 'use-credentials', label: 'Use credentials' }] },
      { name: 'integrity', type: 'string', label: 'Integrity', hint: 'A hash that the file must match, such as sha384-…', default: '' },
      { name: 'code', type: 'text', virtual: true, label: 'JavaScript', hint: 'Used when there is no script file.' }
    ],
    render: (node, ctx, info, definition) => {
      const attrs = node.attrs || {};
      if(ctx.editor){
        const lines = String(attrs.code || '').trim() ? String(attrs.code).trim().split('\n').length : 0;
        return placeholder(node, ctx, definition, attrs.src || (lines ? `JavaScript written here, ${lines} ${lines === 1 ? 'line' : 'lines'}` : 'choose a script file, or write JavaScript, in the settings'));
      }
      const inline = !attrs.src && String(attrs.code || '').trim() ? sanitizeCode(attrs.code) : '';
      return ctx.standard(node, info, { content: inline });
    }
  },

  /*
    Interactive (kempo-ui components)
  */
  {
    name: 'accordion',
    title: 'Accordion',
    category: 'interactive',
    icon: 'expansion_panels',
    description: 'Sections that open and close.',
    keywords: ['collapse', 'faq', 'expand', 'panels'],
    tag: 'k-accordion',
    page: componentUrl('../components/Accordion.js'),
    settings: pagebuilder('AccordionSettings'),
    settingsTag: 'k-page-builder-accordion-settings',
    attributes: [{ name: 'multiple', type: 'boolean', label: 'Allow several open at once' }],
    slots: [{ name: 'default', label: 'Sections' }],
    children: { default: ['accordion-item'] }
  },
  {
    name: 'accordion-item',
    title: 'Accordion section',
    category: 'interactive',
    icon: 'unfold_less',
    description: 'One section of an accordion.',
    section: true,
    tag: 'k-accordion-header',
    page: componentUrl('../components/Icon.js'),
    attributes: [
      { name: 'title', type: 'string', virtual: true, label: 'Heading', default: 'Section' },
      { name: 'icon', type: 'icon', virtual: true, label: 'Icon', hint: 'Shown in front of the heading. Leave it empty for no icon.' }
    ],
    slots: [{ name: 'default', label: 'Content' }],
    render: (node, ctx, info, definition) => {
      const id = sectionIds(node);
      const open = sectionOpen(node, info.parent) ? ' active' : '';
      const header = `<k-accordion-header for-panel="${id}"${open}${ctx.mark(node, definition)}>${iconElement(node.attrs?.icon, '', true)}${escapeText(node.attrs?.title ?? 'Section')}</k-accordion-header>`;
      const panel = `<k-accordion-panel name="${id}"${open}${ctx.mark(node, definition, ' data-pb-slot="default"')}>${ctx.children(node)}</k-accordion-panel>`;
      return `${header}\n${panel}`;
    }
  },
  {
    name: 'tabs',
    title: 'Tabs',
    category: 'interactive',
    icon: 'tab',
    description: 'Content split into tabs.',
    keywords: ['tabbed', 'panels'],
    tag: 'k-tabs',
    page: componentUrl('../components/Tabs.js'),
    settings: pagebuilder('TabsSettings'),
    settingsTag: 'k-page-builder-tabs-settings',
    attributes: [
      { name: 'fixedHeight', attr: 'fixed-height', type: 'boolean', label: 'Fixed height', hint: 'The tabs fill the height of their container, and content that is too long scrolls. Put the tabs in a Group with a set height.' },
      { name: 'hashRouting', attr: 'hash-routing', type: 'boolean', label: 'Hash routing', hint: 'The open tab is the address hash (#name), so a refresh reopens it and back/forward move between tabs. One per page.' },
      { name: 'persistentId', attr: 'persistent-id', type: 'string', label: 'Persistent ID', hint: 'Saves the open tab to the browser\'s localStorage, so a reload reopens it. Use a different ID for each.' }
    ],
    style: attrs => (attrs.fixedHeight ? 'height: 100%' : ''),
    slots: [{ name: 'default', label: 'Tabs' }],
    children: { default: ['tab-item', 'tab-item'] },
    render: (node, ctx, info) => {
      const chosen = (node.slots?.default || []).find(tab => tab.id === node.attrs?.active);
      /* The builder keeps the address and the browser's memory out of the page it edits. */
      return ctx.standard(node, info, { skip: ctx.editor ? ['hashRouting', 'persistentId'] : [], extra: chosen ? ` active="${escapeAttribute(tabName(chosen, node))}"` : '' });
    }
  },
  {
    name: 'tab-item',
    title: 'Tab',
    category: 'interactive',
    icon: 'label',
    description: 'One tab.',
    section: true,
    tag: 'k-tab',
    page: componentUrl('../components/Icon.js'),
    attributes: [
      { name: 'label', type: 'string', virtual: true, label: 'Title', default: 'Tab' },
      { name: 'name', type: 'string', virtual: true, label: 'Name', hint: 'The tab\'s name, used by Hash routing and Persistent ID. Letters, numbers and dashes. One is made for you when it is empty.' },
      { name: 'icon', type: 'icon', virtual: true, label: 'Icon', hint: 'Shown in front of the tab title. Leave it empty for no icon.' }
    ],
    slots: [{ name: 'default', label: 'Content' }],
    render: (node, ctx, info, definition) => {
      const id = tabName(node, info.parent);
      const tab = `<k-tab for="${escapeAttribute(id)}"${ctx.mark(node, definition)}>${iconElement(node.attrs?.icon, '', true)}${escapeText(node.attrs?.label ?? 'Tab')}</k-tab>`;
      const content = `<k-tab-content name="${escapeAttribute(id)}"${ctx.mark(node, definition, ' data-pb-slot="default"')}>${ctx.children(node)}</k-tab-content>`;
      return `${tab}\n${content}`;
    }
  },
  {
    name: 'tab-spacer',
    title: 'Tab spacer',
    category: 'interactive',
    icon: 'format_align_right',
    description: 'Pushes the tabs after it to the right.',
    section: true,
    tag: 'k-tab-spacer',
    page: componentUrl('../components/Tabs.js'),
    render: (node, ctx, info, definition) => `<k-tab-spacer${ctx.mark(node, definition)}></k-tab-spacer>`
  },
  {
    name: 'card',
    title: 'Card',
    category: 'interactive',
    icon: 'card',
    description: 'A bordered box with an optional label.',
    keywords: ['box', 'panel', 'tile'],
    tag: 'k-card',
    page: componentUrl('../components/Card.js'),
    attributes: [{ name: 'label', type: 'string', label: 'Label' }],
    slots: [{ name: 'default', label: 'Content' }]
  },
  {
    name: 'content-slider',
    title: 'Content slider',
    category: 'interactive',
    icon: 'content_slider',
    description: 'A carousel. Add the slides in its settings, then put widgets in each slide.',
    keywords: ['carousel', 'slideshow', 'slides'],
    tag: 'k-content-slider',
    page: componentUrl('../components/ContentSlider.js'),
    settings: pagebuilder('ContentSliderSettings'),
    settingsTag: 'k-page-builder-content-slider-settings',
    attributes: [
      { name: 'controls', type: 'boolean', label: 'Controls', hint: 'Shows the previous and next buttons.', default: true, format: 'text' },
      { name: 'loop', type: 'boolean', label: 'Loop', hint: 'After the last slide it goes back to the first, and the other way round.', default: false, format: 'text' },
      { name: 'minHeight', type: 'number', virtual: true, label: 'Minimum height', hint: '0 keeps it as tall as the current slide. A set minimum keeps the slider this tall, so slides of different heights do not change its size.', min: 0, max: 5000, default: 0 },
      { name: 'minHeightUnit', type: 'select', virtual: true, label: 'Minimum height unit', beside: 'minHeight', default: 'px', options: options(['px', 'rem', 'vh'], { px: 'px', rem: 'rem', vh: 'vh' }) },
      { name: 'keyboardControls', attr: 'keyboard-controls', type: 'boolean', label: 'Keyboard controls', hint: 'The left and right arrow keys change the slide while the slider is focused.', default: true, format: 'text' },
      { name: 'globalControls', attr: 'global-controls', type: 'boolean', label: 'Global controls', hint: 'The arrow keys change the slide anywhere on the page. Use it for one prominent slider only.', default: false, format: 'text', when: { keyboardControls: 'true' } }
    ],
    slots: [{ name: 'default', label: 'Slides' }],
    children: { default: ['slide', 'slide'] },
    render: (node, ctx, info) => {
      const slides = (node.slots?.default || []);
      const start = slides.findIndex(slide => slide.id === node.attrs?.active);
      const minHeight = Number(node.attrs?.minHeight) > 0 ? `${Number(node.attrs.minHeight)}${['px', 'rem', 'vh'].includes(node.attrs.minHeightUnit) ? node.attrs.minHeightUnit : 'px'}` : '';
      /* The builder keeps the arrow keys for editing, and the keys of a slider with every key on the page would take them from the text being typed. */
      return ctx.standard(node, info, {
        skip: ctx.editor ? ['keyboardControls', 'globalControls'] : [],
        extra: `${start > 0 ? ` index="${start}"` : ''}${minHeight ? ` min-height="${minHeight}"` : ''}${ctx.editor ? ' keyboard-controls="false"' : ''}`
      });
    }
  },
  {
    name: 'slide',
    title: 'Slide',
    category: 'interactive',
    icon: 'content_slider',
    description: 'One slide of a content slider.',
    section: true,
    tag: 'div',
    slots: [{ name: 'default', label: 'Content' }]
  },
  {
    name: 'show-more',
    title: 'Show more',
    category: 'interactive',
    icon: 'expand_circle',
    iconRotation: 90,
    description: 'Long content that is cut short with a toggle to read the rest.',
    keywords: ['read more', 'expand', 'truncate'],
    tag: 'k-show-more',
    page: componentUrl('../components/ShowMore.js'),
    attributes: [{ name: 'opened', type: 'boolean', label: 'Start open' }],
    slots: [{ name: 'default', label: 'Content' }]
  },
  {
    name: 'icon',
    title: 'Icon',
    category: 'interactive',
    icon: 'star',
    description: 'A small symbol.',
    keywords: ['symbol', 'glyph'],
    tag: 'k-icon',
    inline: true,
    page: componentUrl('../components/Icon.js'),
    attributes: [
      { name: 'name', type: 'icon', virtual: true, label: 'Icon', hint: 'Choose one of the icons. Or give the address of an SVG file below.' },
      { name: 'src', type: 'url', virtual: true, label: 'Source', hint: 'The address of any SVG file, on this site or another. It is used instead of the icon above.' },
      { name: 'direction', type: 'select', virtual: true, label: 'Direction', default: '', options: options(['', 'down', 'left', 'up'], { '': 'None / Right (0deg)', down: 'Down (90deg)', left: 'Left (180deg)', up: 'Up (270deg)' }) },
      { name: 'rotation', type: 'number', virtual: true, label: 'Rotation', hint: 'Turns the icon clockwise by this many degrees.', min: -360, max: 360, default: 0, when: { direction: '' } },
      { name: 'animation', type: 'select', virtual: true, label: 'Animation', default: '', options: options(['', 'spin', 'blink', 'pulse'], { '': 'None', spin: 'Spin', blink: 'Blink', pulse: 'Pulse' }) }
    ],
    render: (node, ctx, info, definition) => {
      const attrs = node.attrs || {};
      const picked = String(attrs.name ?? '');
      const source = String(attrs.src || '').trim() || (picked.startsWith('src:') ? picked.slice(4) : '');
      const turn = ['down', 'left', 'up'].includes(attrs.direction) ? ` direction="${attrs.direction}"` : (Number(attrs.rotation) ? ` rotation="${Number(attrs.rotation)}"` : '');
      const animation = ['spin', 'blink', 'pulse'].includes(attrs.animation) ? ` animation="${attrs.animation}"` : '';
      return iconElement(source ? `src:${source}` : picked, ctx.mark(node, definition) + turn + animation) || (ctx.editor ? placeholder(node, ctx, definition, 'choose an icon, or give a source, in the settings') : '');
    }
  }
];
