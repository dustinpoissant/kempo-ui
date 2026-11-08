import ShadowComponent from './ShadowComponent.js';
import { html, css } from '../lit-all.min.js';
import './controls/Menu.js';
import './Icon.js';

export default class ControlBar extends ShadowComponent {
  /*
    Children matching this selector are never moved into the "more" menu: menus (so they stay usable, unless they are
    split, see below), spacers (no content), and anything marked `no-collapse`.
  */
  static nonCollapsible = 'kc-menu, kc-vid-menu, kc-spacer, k-dropdown, [no-collapse]';

  /*
    A group or a menu with `split` is not moved as one unit: its controls are moved into the "more" menu one at a time,
    each by its own `priority` (or the container's, when it has none), and the ones marked `no-collapse` stay. A split
    menu is hidden once all of its controls have moved, so its items are listed in the "more" menu instead.
  */
  static splitGroup = 'k-control-group[split], kc-menu[split]';

  static properties = {
    collapseOrder: { type: String, reflect: true, attribute: 'collapse-order' }
  };

  constructor() {
    super();
    this.collapseOrder = 'right center left';
    this.moved = [];
    this.origins = new WeakMap();
    this.homes = new WeakMap();
    this.siblings = new Map();
    this.signature = '';
    this.frame = 0;
  }

  /*
    Lifecycle Callbacks
  */
  connectedCallback() {
    super.connectedCallback();
    this.resizeObserver = new ResizeObserver(() => {
      if(this.measure() !== this.signature) this.arrange();
    });
    this.mutationObserver = new MutationObserver(this.schedule);
    this.mutationObserver.observe(this, { childList: true });
    this.addEventListener('control_visibility_change', this.schedule);
    if(this.hasUpdated) this.schedule();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    cancelAnimationFrame(this.frame);
    this.resizeObserver.disconnect();
    this.mutationObserver.disconnect();
    this.removeEventListener('control_visibility_change', this.schedule);
    this.restore();
    if(this.controlHost && !this.controlHost.querySelector('k-control-bar')) this.controlHost.removeAttribute('has-control-bar');
  }

  firstUpdated() {
    this.bar = this.shadowRoot.getElementById('bar');
    this.more = this.shadowRoot.getElementById('more');
    this.schedule();
  }

  updated(changed) {
    if(changed.has('collapseOrder') && this.bar) this.schedule();
  }

  /*
    Collapsing
  */
  schedule = () => {
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(this.arrange);
  };

  /* Controls still laid out in the bar (not in the "more" menu). */
  get barControls() {
    return [...this.children].filter(el => el.getAttribute('slot') !== 'overflow');
  }

  /* Sizes that decide whether the collapse needs to be redone. The "more" button counts: it can grow after the bar was arranged (its icon loads late). */
  measure = () => [this.bar.clientWidth, this.more.offsetWidth, ...this.barControls.map(el => el.offsetWidth)].join('|');

  /*
    The bar has wrapped when the last section starts below the bottom of the
    first one (sections are vertically centered, so on one row they overlap).
    A section wider than the bar cannot wrap, so also check for overflow.
  */
  isOverflowing = () => {
    if(this.bar.scrollWidth > this.bar.clientWidth + 1) return true;
    const rects = [...this.bar.children].map(el => el.getBoundingClientRect()).filter(r => r.width > 0);
    return rects.length > 1 && rects.at(-1).top >= rects[0].bottom - 0.5;
  };

  /*
    Controls with a higher `priority` are moved into the menu later; a bare `priority` counts as 1. A control of a split
    group without a `priority` of its own has the group's.
  */
  priority = el => {
    const source = el.hasAttribute('priority') || !el.parentElement?.matches(this.constructor.splitGroup) ? el : el.parentElement;
    return source.hasAttribute('priority') ? Number(source.getAttribute('priority')) || 1 : 0;
  };

  /* The closest [controlled] element, looking through shadow roots so a bar rendered by a preset finds its widget. */
  findControlHost = () => {
    let node = this;
    while(node){
      const found = node.closest?.('[controlled]');
      if(found) return found;
      const root = node.getRootNode();
      node = root instanceof ShadowRoot ? root.host : null;
    }
    return null;
  };

  /* The controls of a split group or menu: its children, except the ones with a slot of their own (a menu's icon). */
  items = container => [...container.children].filter(child => !child.hasAttribute('slot'));

  /* What a group shows: its children, with a <slot> (a builder's extra controls) standing for the elements it holds. */
  shownChildren = container => [...container.children].flatMap(child => (child.localName === 'slot' ? child.assignedElements({ flatten: true }) : [child]));

  /* Puts everything that was moved back: the slots, and the controls that left a split group, in their places. */
  restore = () => {
    [...this.moved].reverse().forEach(el => {
      const home = this.homes.get(el);
      if(home){
        home.group.insertBefore(el, home.next?.parentNode === home.group ? home.next : null);
        this.homes.delete(el);
      }
      const slot = this.origins.get(el);
      if(slot) el.setAttribute('slot', slot);
      else el.removeAttribute('slot');
      el.removeAttribute('in-menu');
      if(el.matches('k-control-group')) this.shownChildren(el).forEach(child => child.removeAttribute('in-menu'));
    });
    this.moved = [];
    this.siblings.clear();
    [...this.children].filter(el => el.matches(this.constructor.splitGroup)).forEach(group => group.removeAttribute('collapsed'));
  };

  /*
    Moves one control into the "more" menu. A control of a split group leaves its group and is put just after it, in the
    order it had in the group, so the menu lists them as they were. A group or menu left with nothing is marked `collapsed`.
  */
  collapse = el => {
    const group = el.parentElement === this ? null : el.parentElement;
    /* The order the group had is taken before the control is given its slot, which `items` would leave out. */
    if(group && !this.siblings.has(group)) this.siblings.set(group, this.items(group));
    this.origins.set(el, el.getAttribute('slot') || '');
    el.setAttribute('slot', 'overflow');
    el.setAttribute('in-menu', '');
    if(el.matches('k-control-group')) this.shownChildren(el).forEach(child => child.setAttribute('in-menu', ''));
    if(group){
      const original = this.siblings.get(group);
      this.homes.set(el, { group, next: el.nextSibling });
      let after = group;
      while(this.homes.get(after.nextElementSibling)?.group === group && original.indexOf(after.nextElementSibling) < original.indexOf(el)) after = after.nextElementSibling;
      after.after(el);
      group.toggleAttribute('collapsed', !this.items(group).length);
    }
    this.moved.push(el);
    this.more.toggleAttribute('hidden', false);
  };

  arrange = () => {
    if(!this.bar) return;
    /* Moving a control out of a split group changes the bar's children, which must not arrange the bar again. */
    this.mutationObserver.disconnect();
    this.controlHost = this.findControlHost();
    this.controlHost?.setAttribute('has-control-bar', '');
    this.more.updateHostSupport();
    this.restore();
    this.more.toggleAttribute('hidden', true);
    const groups = { default: [], center: [], right: [] };
    [...this.children].forEach(el => groups[el.getAttribute('slot') || 'default']?.push(el));
    const order = this.collapseOrder.split(/\s+/).map(name => name === 'left' ? 'default' : name);
    const { nonCollapsible, splitGroup } = this.constructor;
    const candidates = order
      .flatMap(name => (groups[name] || []).reverse())
      .filter(el => !el.hidden)
      .flatMap(el => el.matches(splitGroup) && !el.hasAttribute('no-collapse') ? this.items(el).reverse() : [el])
      .filter(el => !el.hidden && !el.matches(nonCollapsible))
      .sort((a, b) => this.priority(a) - this.priority(b));
    /*
      A control with `soft-min-width` keeps at least that width while the others are moved into the menu, then is
      let go so that, with nothing left to move, it shrinks instead of overflowing the bar.
    */
    const soft = [...this.children].filter(el => el.hasAttribute('soft-min-width'));
    soft.forEach(el => {
      const width = el.getAttribute('soft-min-width').trim();
      el.style.minWidth = /^[\d.]+$/.test(width) ? `${width}px` : width;
    });
    for(const el of candidates){
      if(!this.isOverflowing()) break;
      this.collapse(el);
    }
    soft.forEach(el => el.style.removeProperty('min-width'));
    if(!this.moved.length) this.more.opened = false;
    this.signature = this.measure();
    this.resizeObserver.disconnect();
    this.resizeObserver.observe(this.bar);
    this.resizeObserver.observe(this.more);
    this.barControls.forEach(el => this.resizeObserver.observe(el));
    if(this.isConnected) this.mutationObserver.observe(this, { childList: true });
  };

  /*
    Rendering
  */
  render() {
    return html`
      <div id="bar">
        <div class="section"><slot></slot></div>
        <div class="section" id="center"><slot name="center"></slot></div>
        <div class="section">
          <slot name="right"></slot>
          <kc-menu id="more" title="More" hidden>
            <k-icon slot="icon" name="more_vert"></k-icon>
            <div><div id="tray"><slot name="overflow"></slot></div></div>
          </kc-menu>
        </div>
      </div>
    `;
  }

  /*
    Styles
  */
  static styles = css`
    :host {
      display: block;
      flex: 1 1 auto;
      min-width: 0;
      --bar_border: var(--c_border);
    }
    /* Some hosts (k-audio, k-video) make --c_border transparent so their buttons are borderless, and the
       menu panel inherits it. Give the panel its own border color and keep the trigger like the host's controls. */
    #more {
      --c_border: oklch(from var(--c_bg__inv) l c h / 0.25);
      border-color: var(--bar_border);
    }
    #bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
    }
    .section {
      display: flex;
      flex: 0 0 auto;
      align-items: center;
    }
    /* Grows so a stretchy control (a seek bar) can fill it; other controls stay centered in the free space. */
    #center {
      flex: 1 1 auto;
      justify-content: center;
    }
    /* Plain links and buttons (a navbar, say) become rows of the menu. !important because the page's own button and
       link styles would otherwise win over a ::slotted rule. */
    #tray ::slotted(a),
    #tray ::slotted(button) {
      display: block !important;
      box-sizing: border-box !important;
      width: 100% !important;
      margin: 0 !important;
      padding: var(--spacer_h) var(--spacer) !important;
      border: 0 !important;
      border-radius: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
      color: var(--tc) !important;
      font: inherit !important;
      text-align: left !important;
      text-decoration: none !important;
      white-space: nowrap !important;
      cursor: pointer;
    }
    #tray ::slotted(a:hover),
    #tray ::slotted(button:hover) {
      background: oklch(from var(--c_bg__inv) l c h / 0.15) !important;
    }
    #tray {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      min-width: 12rem;
      max-width: min(24rem, 90vw);
      max-height: 66vh;
      overflow-y: auto;
    }
  `;
}

customElements.define('k-control-bar', ControlBar);
