import ShadowComponent from '../ShadowComponent.js';
import { html } from '../../lit-all.min.js';
import { titleOf, widgetIcon } from '../../utils/pageLabels.js';
import { supportsStyles } from '../../utils/styles.js';
import './PageBuilderFields.js';
import './StyleFields.js';
import '../Tabs.js';
import '../Toggle.js';
import '../Icon.js';

/*
  The right panel. With a widget selected it shows the widget's name and description, then its settings: the generic
  fields of its declared settings, or, when the widget has a settings element (`settings` and `settingsTag`), that
  element instead. With nothing selected it is the page's own settings (title and description). Several selected: a note.
*/
export default class PageBuilderSettings extends ShadowComponent {
  static properties = {
    node: { attribute: false },
    widget: { attribute: false },
    count: { type: Number },
    registry: { attribute: false },
    host: { attribute: false },
    page: { attribute: false },
    editorSettings: { attribute: false },
    version: { type: Number }
  };

  constructor() {
    super();
    this.node = null;
    this.count = 0;
  }

  /*
    Lifecycle Callbacks
  */
  async updated() {
    const container = this.renderRoot.querySelector('.custom');
    if(!container || !this.widget?.settings) return;
    if(!customElements.get(this.widget.settingsTag)) await import(this.widget.settings);
    if(container.firstElementChild?.localName !== this.widget.settingsTag) container.replaceChildren(document.createElement(this.widget.settingsTag));
    Object.assign(container.firstElementChild, { node: this.node, widget: this.widget, host: this.host, registry: this.registry, version: this.version });
  }

  /*
    Rendering
  */
  renderPage() {
    const title = this.page?.attrs?.title ?? '';
    const description = this.page?.attrs?.description ?? '';
    return html`
      <div class="p">
        <h5 class="mb"><k-icon name="settings"></k-icon> Page settings</h5>
        <p class="tc-muted">Select a widget on the page to edit its settings.</p>
        <div class="mb">
          <label class="d-b mbq" for="pb-page-title">Title</label>
          <input id="pb-page-title" type="text" class="full" .value="${title}" @input="${event => this.host.setPageAttr('title', event.target.value)}">
        </div>
        <div class="mb">
          <label class="d-b mbq" for="pb-page-description">Description</label>
          <textarea id="pb-page-description" class="full" rows="3" .value="${description}" @input="${event => this.host.setPageAttr('description', event.target.value)}"></textarea>
        </div>
        <k-toggle id="pb-setting-confirm" .value="${!!this.editorSettings?.confirmDeletion}" @change="${event => event.detail.value !== !!this.editorSettings?.confirmDeletion && this.host.setEditorSetting('confirmDeletion', event.detail.value)}">Confirm deletion<small class="d-b tc-muted">Ask before the Delete key or the delete button removes a widget. Kept in this browser, not in the page.</small></k-toggle>
      </div>
    `;
  }

  render() {
    if(this.count > 1) return html`<div class="p tc-muted">${this.count} widgets are selected. Select one to edit its settings.</div>`;
    if(!this.node) return this.renderPage();
    const definition = this.widget;
    const widgetSettings = definition?.settings
      ? html`<div class="custom"></div>`
      : html`<k-page-builder-fields .node="${this.node}" .widget="${definition}" .host="${this.host}" .version="${this.version}"></k-page-builder-fields>`;
    return html`
      <div class="p">
        <h5 class="mb">${widgetIcon(definition)} ${titleOf(this.registry, this.node)}</h5>
        ${definition?.description ? html`<p class="tc-muted">${definition.description}</p>` : ''}
        ${supportsStyles(definition) ? html`
          <k-tabs>
            <k-tab for="pb-widget">Widget</k-tab>
            <k-tab for="pb-styles">Styles</k-tab>
            <k-tab-content name="pb-widget">${widgetSettings}</k-tab-content>
            <k-tab-content name="pb-styles"><k-page-builder-styles .node="${this.node}" .host="${this.host}" .hide="${definition.hideStyles}" .version="${this.version}"></k-page-builder-styles></k-tab-content>
          </k-tabs>` : widgetSettings}
      </div>
    `;
  }
}

customElements.define('k-page-builder-settings', PageBuilderSettings);
