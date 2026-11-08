import ShadowComponent from '../ShadowComponent.js';
import { html, css } from '../../lit-all.min.js';
import { ALIGNS, BACKGROUNDS, TEXT_COLOURS, cleanSides } from '../../utils/styles.js';
import '../Slider.js';

/*
  The styles of a widget (the Styles tab): the space around the widget and inside it, its corners and sides, a background
  with its opacity, a text colour, the text alignment, and its id and extra classes. Each change is one step, kept on the widget as `styles`.
*/
const SPACES = [['', '0'], ['q', '¼'], ['h', '½'], ['f', '1']];

const COLOUR_LABELS = { default: 'Default', alt: 'Alternate', inv: 'Inverse', primary: 'Primary', secondary: 'Secondary', success: 'Success', warning: 'Warning', danger: 'Danger', muted: 'Muted' };

const CORNER_LABELS = { tl: 'Top left corner', tr: 'Top right corner', bl: 'Bottom left corner', br: 'Bottom right corner' };

const SIDE_LABELS = { top: 'Top border', right: 'Right border', bottom: 'Bottom border', left: 'Left border' };

/* The opacity box looks like text until it is clicked into: kempo-css has no class for a bare number box. */
const PLAIN_NUMBER = 'width: 4ch; padding: 0; border: 0; background: transparent; color: inherit; font: inherit; text-align: right; -moz-appearance: textfield;';

export default class StyleFields extends ShadowComponent {
  /*
    Reactive Properties / Attributes
  */
  static properties = {
    node: { attribute: false },
    host: { attribute: false },
    hide: { attribute: false },
    version: { type: Number }
  };

  /*
    Protected Members
  */
  get styles() {
    return this.node.attrs?.styles || {};
  }

  /*
    Public Methods
  */
  /* Whether a part of the tab is shown: a widget can hide parts it has its own setting for (see `hideStyles`). */
  shows(part) {
    return !this.hide?.includes(part);
  }

  /* Changes one part of the styles. `coalesce` joins a row of typing into one step. */
  setStyle(name, value, coalesce = false) {
    this.host.setWidgetAttribute(this.node.id, 'styles', { ...this.styles, [name]: value }, coalesce);
  }

  setSide(name, side, value) {
    this.setStyle(name, { ...cleanSides(this.styles[name]), [side]: value });
  }

  /* Adds or removes one corner or side from a list of them. */
  toggleIn(name, key, on) {
    const current = Array.isArray(this.styles[name]) ? this.styles[name] : [];
    this.setStyle(name, on ? [...current.filter(item => item !== key), key] : current.filter(item => item !== key));
  }

  /*
    Rendering
  */
  /*
    One box: the margin outside it, the padding inside it, and the widget in the middle. The eight buttons on the box are
    transparent, so its border shows behind them: a corner button rounds that corner, a side button draws that side.
  */
  renderModel() {
    const margin = cleanSides(this.styles.margin);
    const padding = cleanSides(this.styles.padding);
    const corners = Array.isArray(this.styles.corners) ? this.styles.corners : [];
    const sides = Array.isArray(this.styles.sides) ? this.styles.sides : [];
    const space = (name, values, side, title) => html`
      <select class="space ${name}-${side}" aria-label="${title} ${side}" title="${title} ${side}" @change="${event => this.setSide(name, side, event.target.value)}">
        ${SPACES.map(([value, text]) => html`<option value="${value}" ?selected="${values[side] === value}">${text}</option>`)}
      </select>`;
    const pick = (list, key, label) => {
      const on = (list === 'corners' ? corners : sides).includes(key);
      return html`<button type="button" class="pick ${list}-${key}${on ? ' on' : ''}" aria-pressed="${on}" title="${label}" aria-label="${label}" @click="${() => this.toggleIn(list, key, !on)}"></button>`;
    };
    return html`
      <div class="model">
        ${['top', 'left', 'right', 'bottom'].map(side => space('margin', margin, side, 'Margin'))}
        <div class="box ${corners.map(corner => `round-${corner}`).join(' ')} ${sides.map(side => `on-${side}`).join(' ')}">
          ${pick('corners', 'tl', CORNER_LABELS.tl)}
          ${pick('sides', 'top', SIDE_LABELS.top)}
          ${pick('corners', 'tr', CORNER_LABELS.tr)}
          ${pick('sides', 'left', SIDE_LABELS.left)}
          <div class="inner">
            ${['top', 'left', 'right', 'bottom'].map(side => space('padding', padding, side, 'Padding'))}
            <span class="widget tc-muted">Widget</span>
          </div>
          ${pick('sides', 'right', SIDE_LABELS.right)}
          ${pick('corners', 'bl', CORNER_LABELS.bl)}
          ${pick('sides', 'bottom', SIDE_LABELS.bottom)}
          ${pick('corners', 'br', CORNER_LABELS.br)}
        </div>
      </div>`;
  }

  renderBackground() {
    const background = this.styles.background || '';
    const alpha = Number(this.styles.alpha ?? 100);
    return html`
      <div class="mb">
        <label class="d-b mbq" for="pb-style-background">Background</label>
        <select id="pb-style-background" class="full" @change="${event => this.setStyle('background', event.target.value)}">
          <option value="" ?selected="${!background}">None</option>
          ${BACKGROUNDS.map(name => html`<option value="${name}" ?selected="${background === name}">${COLOUR_LABELS[name]}</option>`)}
        </select>
        <div class="alpha">
          <k-slider class="slider" aria-label="Background opacity" min="0" max="100" format="0" ?disabled="${!background}" .value="${String(alpha)}" @change="${event => Number(event.detail.value) !== alpha && this.setStyle('alpha', Number(event.detail.value), true)}"></k-slider>
          <span class="amount">
            <input type="number" aria-label="Background opacity (%)" min="0" max="100" ?disabled="${!background}" .value="${String(alpha)}" style="${PLAIN_NUMBER}" @input="${event => this.setStyle('alpha', Math.min(100, Math.max(0, Number(event.target.value) || 0)), true)}">%</span>
        </div>
      </div>`;
  }

  renderTextColour() {
    const textColour = this.styles.textColour || '';
    return html`
      <div class="mb">
        <label class="d-b mbq" for="pb-style-text">Text colour</label>
        <select id="pb-style-text" class="full" @change="${event => this.setStyle('textColour', event.target.value)}">
          <option value="" ?selected="${!textColour}">Theme default</option>
          ${TEXT_COLOURS.map(name => html`<option value="${name}" ?selected="${textColour === name}">${COLOUR_LABELS[name]}</option>`)}
        </select>
      </div>`;
  }

  renderAlign() {
    const align = this.styles.align || '';
    return html`
      <div class="mb">
        <label class="d-b mbq" for="pb-style-align">Text alignment</label>
        <select id="pb-style-align" class="full" @change="${event => this.setStyle('align', event.target.value)}">
          <option value="" ?selected="${!align}">Default</option>
          ${ALIGNS.map(name => html`<option value="${name}" ?selected="${align === name}">${name[0].toUpperCase() + name.slice(1)}</option>`)}
        </select>
      </div>`;
  }

  render() {
    if(!this.node) return '';
    return html`
      ${this.shows('box') ? this.renderModel() : ''}
      ${this.shows('background') ? this.renderBackground() : ''}
      ${this.shows('textColour') ? this.renderTextColour() : ''}
      ${this.shows('align') ? this.renderAlign() : ''}
      ${this.shows('id') ? html`
        <div class="mb">
          <label class="d-b mbq">ID</label>
          <input type="text" class="full" .value="${this.styles.id ?? ''}" @input="${event => this.setStyle('id', event.target.value, true)}">
        </div>` : ''}
      ${this.shows('classes') ? html`
        <div class="mb">
          <label class="d-b mbq">Classes</label>
          <input type="text" class="full" .value="${this.styles.classes ?? ''}" @input="${event => this.setStyle('classes', event.target.value, true)}">
        </div>` : ''}
    `;
  }

  static styles = css`
    .model {
      display: grid;
      grid-template-columns: 3.25rem 1fr 3.25rem;
      grid-template-rows: auto 11rem auto;
      grid-template-areas:
        ". margin-top ."
        "margin-left box margin-right"
        ". margin-bottom .";
      gap: var(--spacer_q);
      margin-bottom: var(--spacer_h);
    }
    .model select.space {
      box-sizing: border-box;
      width: 2rem;
      height: 1.35rem;
      min-width: 0;
      justify-self: center;
      align-self: center;
      padding: 0;
      text-align: center;
      text-align-last: center;
      font-size: 0.9rem;
      appearance: none;
      -webkit-appearance: none;
      background-image: none;
    }
    .space.margin-top { grid-area: margin-top; }
    .space.margin-left { grid-area: margin-left; }
    .space.margin-right { grid-area: margin-right; }
    .space.margin-bottom { grid-area: margin-bottom; }
    .box {
      grid-area: box;
      display: grid;
      grid-template-columns: 1.25rem 1fr 1.25rem;
      grid-template-rows: 1.25rem 1fr 1.25rem;
      grid-template-areas:
        "corners-tl sides-top corners-tr"
        "sides-left inner sides-right"
        "corners-bl sides-bottom corners-br";
      border: 2px solid oklch(from var(--c_border) l c h / 0.35);
    }
    .box.round-tl { border-top-left-radius: 1.5rem; }
    .box.round-tr { border-top-right-radius: 1.5rem; }
    .box.round-bl { border-bottom-left-radius: 1.5rem; }
    .box.round-br { border-bottom-right-radius: 1.5rem; }
    .box.on-top { border-top-color: var(--c_primary); }
    .box.on-right { border-right-color: var(--c_primary); }
    .box.on-bottom { border-bottom-color: var(--c_primary); }
    .box.on-left { border-left-color: var(--c_primary); }
    .box button.pick {
      min-width: 0;
      min-height: 0;
      margin: 0;
      padding: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      cursor: pointer;
    }
    .box button.pick:hover { background: oklch(from var(--c_primary) l c h / 0.12); }
    .box button.pick:focus-visible { outline: 2px solid var(--c_primary); outline-offset: -2px; }
    .pick.corners-tl { grid-area: corners-tl; }
    .pick.corners-tr { grid-area: corners-tr; }
    .pick.corners-bl { grid-area: corners-bl; }
    .pick.corners-br { grid-area: corners-br; }
    .pick.sides-top { grid-area: sides-top; }
    .pick.sides-right { grid-area: sides-right; }
    .pick.sides-bottom { grid-area: sides-bottom; }
    .pick.sides-left { grid-area: sides-left; }
    .inner {
      grid-area: inner;
      display: grid;
      grid-template-columns: 3rem 1fr 3rem;
      grid-template-rows: auto 1fr auto;
      grid-template-areas:
        "padding-top padding-top padding-top"
        "padding-left widget padding-right"
        "padding-bottom padding-bottom padding-bottom";
      min-width: 0;
    }
    .inner .space.padding-top { grid-area: padding-top; }
    .inner .space.padding-left { grid-area: padding-left; }
    .inner .space.padding-right { grid-area: padding-right; }
    .inner .space.padding-bottom { grid-area: padding-bottom; }
    .widget {
      grid-area: widget;
      align-self: center;
      text-align: center;
      font-size: 0.75rem;
    }
    .alpha {
      display: flex;
      align-items: center;
      gap: var(--spacer_h);
      margin-top: var(--spacer_q);
    }
    .alpha .slider {
      flex: 1 1 auto;
      min-width: 0;
    }
    .amount {
      display: inline-flex;
      align-items: center;
      flex: 0 0 auto;
    }
  `;
}

customElements.define('k-page-builder-styles', StyleFields);
