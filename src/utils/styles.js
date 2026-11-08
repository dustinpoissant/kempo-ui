/*
  The styles a widget has beyond its own settings, kept on the widget as `styles`. Almost all of them are kempo-css
  classes the person chooses: the space around the widget (margin) and inside it (padding), a background, a text colour,
  the text alignment, which corners are rounded, and which sides have a border. The background's opacity is the one style value, because
  kempo-css has no class for it. Plus its id and extra classes. The page and the builder write them the same way, on the
  widget's first element. DOM-free, so a server can use it too.
*/
/*
  The parts of the Styles tab a widget can hide with `hideStyles`, and the styles each one holds. A widget that has its own
  setting for something (a Button's color is its background) hides that part, so there is one way to set it. A hidden
  part is left out of the tab, and what was stored for it is not written on the page either.
*/
export const STYLE_PARTS = {
  box: ['margin', 'padding', 'corners', 'sides'],
  background: ['background', 'alpha'],
  textColour: ['textColour'],
  align: ['align'],
  id: ['id'],
  classes: ['classes']
};

/* The styles without the ones in the hidden parts. */
export const shownStyles = (styles, hidden = []) => {
  if(!styles || !hidden?.length) return styles;
  const dropped = hidden.flatMap(part => STYLE_PARTS[part] || []);
  return Object.fromEntries(Object.entries(styles).filter(([name]) => !dropped.includes(name)));
};

export const SIDES = ['top', 'right', 'bottom', 'left'];

export const SIZES = ['', 'q', 'h', 'f'];

export const BACKGROUNDS = ['default', 'alt', 'inv', 'primary', 'secondary', 'success', 'warning', 'danger'];

export const TEXT_COLOURS = ['default', 'muted', 'inv', 'primary', 'secondary', 'success', 'warning', 'danger'];

export const ALIGNS = ['left', 'center', 'right'];

export const CORNERS = ['tl', 'tr', 'bl', 'br'];

/* The kempo-css variable each background is drawn with, so an opacity can be applied to it. */
const BACKGROUND_VARIABLE = {
  default: '--c_bg',
  alt: '--c_bg__alt',
  inv: '--c_bg__inv',
  primary: '--c_primary',
  secondary: '--c_secondary',
  success: '--c_success',
  warning: '--c_warning',
  danger: '--c_danger'
};

/* The text colour a background is drawn with (the kempo-css variable that is readable on it). */
const BACKGROUND_TEXT = {
  default: '--tc',
  alt: '--tc',
  inv: '--tc_light',
  primary: '--tc_on_primary',
  secondary: '--tc_on_secondary',
  success: '--tc_on_success',
  warning: '--tc_on_warning',
  danger: '--tc_on_danger'
};

/* The opacity of a background, as a percentage from 0 to 100 (whole). */
const alphaOf = styles => {
  const alpha = Number(styles?.alpha);
  return Number.isFinite(alpha) ? Math.min(100, Math.max(0, Math.round(alpha))) : 100;
};

/* A background that is see-through: kempo-css background classes have no opacity, so it is drawn as a style instead. */
const translucent = styles => BACKGROUNDS.includes(styles?.background) && alphaOf(styles) < 100;

const CORNER_CLASS = { tl: 'rtl', tr: 'rtr', bl: 'rbl', br: 'rbr' };

const SIDE_CLASS = { top: 'bt', right: 'br', bottom: 'bb', left: 'bl' };

const ID = /^[A-Za-z][\w-]*$/;

const TOKEN = /^[\w-]+$/;

/* A value with a size for every side, and '' for any side that is missing or not a size. */
export const cleanSides = value => Object.fromEntries(SIDES.map(side => [side, SIZES.includes(value?.[side]) ? value[side] : '']));

/*
  The classes for the sides that have a size, using the shortest names: all four sides the same is one class (m, mh,
  mq), top and bottom the same is my, left and right the same is mx, and anything else is a class per side (mt, mbq).
  A whole space has no suffix.
*/
const sideClasses = (letter, sides) => {
  const suffix = size => (size === 'f' ? '' : size);
  const { top, right, bottom, left } = sides;
  if(top && top === right && top === bottom && top === left) return [`${letter}${suffix(top)}`];
  const classes = [];
  if(top && top === bottom) classes.push(`${letter}y${suffix(top)}`);
  else {
    if(top) classes.push(`${letter}t${suffix(top)}`);
    if(bottom) classes.push(`${letter}b${suffix(bottom)}`);
  }
  if(left && left === right) classes.push(`${letter}x${suffix(left)}`);
  else {
    if(right) classes.push(`${letter}r${suffix(right)}`);
    if(left) classes.push(`${letter}l${suffix(left)}`);
  }
  return classes;
};

/* The classes for the chosen corners or sides: all of them is the one class (r, b), otherwise one class each. */
const choiceClasses = (chosen, all, names, classes) => {
  const picked = chosen.filter(key => names.includes(key));
  if(picked.length === names.length) return [all];
  return picked.map(key => classes[key]);
};

/* The kempo-css classes a widget's styles give it. */
export const styleClasses = styles => [
  ...sideClasses('m', cleanSides(styles?.margin)),
  ...sideClasses('p', cleanSides(styles?.padding)),
  ...(BACKGROUNDS.includes(styles?.background) && !translucent(styles) ? [`bg-${styles.background}`] : []),
  ...(TEXT_COLOURS.includes(styles?.textColour) ? [`tc-${styles.textColour}`] : []),
  ...(ALIGNS.includes(styles?.align) ? [`ta-${styles.align}`] : []),
  ...choiceClasses(Array.isArray(styles?.corners) ? styles.corners : [], 'r', CORNERS, CORNER_CLASS),
  ...choiceClasses(Array.isArray(styles?.sides) ? styles.sides : [], 'b', SIDES, SIDE_CLASS),
  ...String(styles?.classes || '').split(/\s+/).filter(name => TOKEN.test(name))
];

/* The one style a widget's styles give it: a background's opacity, when it has a background and less than all of it. */
export const styleCss = styles => {
  if(!translucent(styles)) return '';
  const { background } = styles;
  const css = [`background-color: oklch(from var(${BACKGROUND_VARIABLE[background]}) l c h / ${alphaOf(styles) / 100})`];
  if(!TEXT_COLOURS.includes(styles.textColour)) css.push(`color: var(${BACKGROUND_TEXT[background]})`);
  return css.join('; ');
};

/* The id a widget's styles give it, when it is a valid one. */
export const styleId = styles => (ID.test(styles?.id ?? '') ? styles.id : '');

/* Whether a widget takes styles. The pieces of a widget (sections, columns, tabs) do not: their parent lays them out. */
export const supportsStyles = definition => !!definition && !definition.section;

/* The end of the tag that starts at `start`, after its closing '>' (quoted values may hold a '>'). */
const tagEnd = (html, start) => {
  let quote = '';
  for(let index = start + 1; index < html.length; index++){
    const character = html[index];
    if(quote){
      if(character === quote) quote = '';
    } else if(character === '"' || character === "'") quote = character;
    else if(character === '>') return index + 1;
  }
  return html.length;
};

/* Adds to one attribute of a tag: the values join what it has (classes skip the ones it has already). */
const joinAttribute = (tag, name, values, separator) => {
  const found = new RegExp(`\\s${name}="([^"]*)"`).exec(tag);
  if(!found) return tag.replace(/\s*\/?>$/, closing => ` ${name}="${values.join(separator)}"${closing}`);
  const existing = found[1].trim();
  const current = existing.split(/\s+/);
  const extra = name === 'class' ? values.filter(value => !current.includes(value)) : values;
  const joined = [existing, ...extra].filter(Boolean).join(separator);
  return tag.replace(found[0], ` ${name}="${joined}"`);
};

/* Adds a widget's styles to the first element of a piece of HTML, with its display class (d-b or d-ib). An id the element already has is kept. */
export const decorate = (html, styles, display = '') => {
  const classes = [display, ...styleClasses(styles)].filter(Boolean);
  const style = styleCss(styles);
  const id = styleId(styles);
  const start = html.search(/<[a-zA-Z]/);
  if(start === -1 || (!classes.length && !style && !id)) return html;
  const end = tagEnd(html, start);
  let tag = html.slice(start, end);
  if(classes.length) tag = joinAttribute(tag, 'class', classes, ' ');
  if(style) tag = joinAttribute(tag, 'style', [style], '; ');
  if(id && !/\sid=/.test(tag)) tag = joinAttribute(tag, 'id', [id], ' ');
  return html.slice(0, start) + tag + html.slice(end);
};
