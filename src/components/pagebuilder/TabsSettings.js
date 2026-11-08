import WidgetSettings from './WidgetSettings.js';
import { html } from '../../lit-all.min.js';
import { defaultNode } from '../../utils/pageTree.js';
import '../Accordion.js';
import '../Icon.js';
import '../IconSelector.js';

/*
  The settings of Tabs: its own settings, then each tab listed in an accordion with its title, name, an optional icon and
  buttons to move it or remove it, and Add tab and Add spacer buttons (a spacer is listed in order with the tabs, with the
  same move and remove buttons). A tab's content is edited on the page.
*/
export default class TabsSettings extends WidgetSettings {
  /*
    Protected Members
  */
  get tabs() {
    return this.node.slots?.default || [];
  }

  /* The tab that opens first: the one chosen, or the first tab. */
  get defaultTab() {
    const tabs = this.tabs.filter(item => item.type === 'tab-item');
    return tabs.find(tab => tab.id === this.node.attrs?.active) || tabs[0];
  }

  /*
    Public Methods
  */
  addTab() {
    this.edit(node => {
      node.slots.default = node.slots.default || [];
      node.slots.default.push(defaultNode(this.registry, 'tab-item'));
      return true;
    });
  }

  addSpacer() {
    this.edit(node => {
      node.slots.default = node.slots.default || [];
      node.slots.default.push(defaultNode(this.registry, 'tab-spacer'));
      return true;
    });
  }

  moveTab(index, step) {
    this.edit(node => {
      const list = node.slots.default;
      const target = index + step;
      if(target < 0 || target >= list.length) return 'That tab cannot move there';
      [list[index], list[target]] = [list[target], list[index]];
      return true;
    });
  }

  removeTab(index) {
    this.edit(node => {
      node.slots.default.splice(index, 1);
      return true;
    });
  }

  setLabel(index, label) {
    this.edit(node => {
      node.slots.default[index].attrs.label = label;
      return true;
    }, true);
  }

  setName(index, name) {
    this.edit(node => {
      node.slots.default[index].attrs.name = name;
      return true;
    }, true);
  }

  setDefault(id) {
    this.edit(node => {
      node.attrs.active = id;
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
  renderMoveButtons(index) {
    return html`
      <div class="btn-grp">
        <button title="Move left" aria-label="Move left" ?disabled="${index === 0}" @click="${() => this.moveTab(index, -1)}"><k-icon name="arrow" direction="left"></k-icon></button>
        <button title="Move right" aria-label="Move right" ?disabled="${index === this.tabs.length - 1}" @click="${() => this.moveTab(index, 1)}"><k-icon name="arrow" direction="right"></k-icon></button>
        <button class="danger" title="Remove" aria-label="Remove" @click="${() => this.removeTab(index)}"><k-icon name="delete"></k-icon></button>
      </div>
    `;
  }

  renderSpacer(index) {
    return html`
      <div class="d-f ai-c jc-sb p b mbq">
        <span>Tab spacer<small class="d-b tc-muted">Pushes the tabs after it to the right.</small></span>
        ${this.renderMoveButtons(index)}
      </div>
    `;
  }

  renderTab(tab, index) {
    const id = `pb-tab-${index}`;
    return html`
      <k-accordion-header for-panel="${id}">${tab.attrs?.label || `Tab ${index + 1}`}</k-accordion-header>
      <k-accordion-panel name="${id}">
        <div class="p">
          <div class="mb">
            <label class="d-b mbq" for="${id}-label">Title</label>
            <input id="${id}-label" type="text" class="full" .value="${tab.attrs?.label ?? ''}" @input="${event => this.setLabel(index, event.target.value)}">
          </div>
          <div class="mb">
            <label class="d-b mbq" for="${id}-name">Name<small class="d-b tc-muted">The tab's name, used by Hash routing and Persistent ID. Letters, numbers and dashes. One is made for you when it is empty.</small></label>
            <input id="${id}-name" type="text" class="full" .value="${tab.attrs?.name ?? ''}" @input="${event => this.setName(index, event.target.value)}">
          </div>
          <div class="mb">
            <label class="d-b mbq" for="${id}-icon">Icon<small class="d-b tc-muted">Shown in front of the title. Leave it empty for no icon.</small></label>
            <k-icon-selector id="${id}-icon" class="full" placeholder="No icon" allow-clear .value="${tab.attrs?.icon ?? ''}" @change="${event => this.setIcon(index, event.detail.value)}"></k-icon-selector>
          </div>
          ${this.renderMoveButtons(index)}
        </div>
      </k-accordion-panel>
    `;
  }

  render() {
    if(!this.node) return '';
    return html`
      ${this.renderFields()}
      <div class="btn-grp full mb">
        <button class="primary" @click="${this.addTab}">Add tab</button>
        <button @click="${this.addSpacer}">Add spacer</button>
      </div>
      ${this.tabs.some(item => item.type === 'tab-item') ? html`
        <div class="mb">
          <label class="d-b mbq" for="pb-tabs-default">Default open tab<small class="d-b tc-muted">The first tab is open unless you pick another.</small></label>
          <select id="pb-tabs-default" class="full" @change="${event => this.setDefault(event.target.value)}">
            ${this.tabs.map((tab, index) => (tab.type === 'tab-item' ? html`<option value="${tab.id}" ?selected="${tab.id === this.defaultTab.id}">${tab.attrs?.label || `Tab ${index + 1}`}</option>` : ''))}
          </select>
        </div>` : ''}
      <k-accordion>
        ${this.tabs.map((tab, index) => (tab.type === 'tab-spacer' ? this.renderSpacer(index) : this.renderTab(tab, index)))}
      </k-accordion>
    `;
  }
}

customElements.define('k-page-builder-tabs-settings', TabsSettings);
