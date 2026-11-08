import WidgetSettings from './WidgetSettings.js';
import { html } from '../../lit-all.min.js';
import { defaultNode, sectionOpen } from '../../utils/pageTree.js';
import '../Accordion.js';
import '../Icon.js';
import '../Toggle.js';
import '../IconSelector.js';

/*
  The settings of an Accordion: its own settings, then each section listed in an accordion with its heading, an optional
  icon and buttons to move it or remove it, and an Add section button. A section's content is edited on the page.
*/
export default class AccordionSettings extends WidgetSettings {
  /*
    Protected Members
  */
  get sections() {
    return this.node.slots?.default || [];
  }

  /*
    Public Methods
  */
  addSection() {
    this.edit(node => {
      node.slots.default = node.slots.default || [];
      node.slots.default.push(defaultNode(this.registry, 'accordion-item'));
      return true;
    });
  }

  moveSection(index, step) {
    this.edit(node => {
      const list = node.slots.default;
      const target = index + step;
      if(target < 0 || target >= list.length) return 'That section cannot move there';
      [list[index], list[target]] = [list[target], list[index]];
      return true;
    });
  }

  removeSection(index) {
    this.edit(node => {
      node.slots.default.splice(index, 1);
      return true;
    });
  }

  setTitle(index, title) {
    this.edit(node => {
      node.slots.default[index].attrs.title = title;
      return true;
    }, true);
  }

  /* The section that starts open. Unless several may be open at once, opening one closes the others. */
  setOpen(index, open) {
    this.edit(node => {
      const list = node.slots.default;
      const states = list.map(section => sectionOpen(section, node));
      states[index] = open;
      if(open && !node.attrs?.multiple) states.fill(false).splice(index, 1, true);
      list.forEach((section, position) => {
        section.attrs = section.attrs || {};
        section.attrs.open = states[position];
      });
      return true;
    });
  }

  setIcon(index, icon) {
    this.edit(node => {
      node.slots.default[index].attrs.icon = icon;
      return true;
    });
  }

  /*
    Rendering
  */
  renderSection(section, index) {
    const id = `pb-section-${index}`;
    return html`
      <k-accordion-header for-panel="${id}">${section.attrs?.title || `Section ${index + 1}`}</k-accordion-header>
      <k-accordion-panel name="${id}">
        <div class="p">
          <div class="mb">
            <label class="d-b mbq" for="${id}-title">Heading</label>
            <input id="${id}-title" type="text" class="full" .value="${section.attrs?.title ?? ''}" @input="${event => this.setTitle(index, event.target.value)}">
          </div>
          <div class="mb">
            <label class="d-b mbq" for="${id}-icon">Icon<small class="d-b tc-muted">Shown in front of the heading. Leave it empty for no icon.</small></label>
            <k-icon-selector id="${id}-icon" class="full" placeholder="No icon" allow-clear .value="${section.attrs?.icon ?? ''}" @change="${event => this.setIcon(index, event.detail.value)}"></k-icon-selector>
          </div>
          <div class="mb">
            <k-toggle id="${id}-open" .value="${sectionOpen(section, this.node)}" @change="${event => event.detail.value !== sectionOpen(section, this.node) && this.setOpen(index, event.detail.value)}">Open by default</k-toggle>
          </div>
          <div class="btn-grp">
            <button title="Move up" aria-label="Move up" ?disabled="${index === 0}" @click="${() => this.moveSection(index, -1)}"><k-icon name="arrow" direction="up"></k-icon></button>
            <button title="Move down" aria-label="Move down" ?disabled="${index === this.sections.length - 1}" @click="${() => this.moveSection(index, 1)}"><k-icon name="arrow" direction="down"></k-icon></button>
            <button class="danger" title="Remove" aria-label="Remove" @click="${() => this.removeSection(index)}"><k-icon name="delete"></k-icon></button>
          </div>
        </div>
      </k-accordion-panel>
    `;
  }

  render() {
    if(!this.node) return '';
    return html`
      ${this.renderFields()}
      <div class="mb">
        <button class="primary full" @click="${this.addSection}">Add section</button>
      </div>
      <k-accordion>
        ${this.sections.map((section, index) => this.renderSection(section, index))}
      </k-accordion>
    `;
  }
}

customElements.define('k-page-builder-accordion-settings', AccordionSettings);
