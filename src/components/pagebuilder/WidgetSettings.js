import ShadowComponent from '../ShadowComponent.js';
import { html } from '../../lit-all.min.js';
import './PageBuilderFields.js';

/*
  The base of a widget's settings element: the panel on the right shows it for the selected widget when the widget needs
  more than its declared settings (the columns of Columns, an accordion's sections). The builder gives it `node` (the selected
  widget), `widget` (its definition), `host` (the builder), `registry` and `version` (which changes with every change, so
  the element redraws). Each method changes the page through the builder, as one undo step. The element is defined by
  the module that extends this class.
*/
export default class WidgetSettings extends ShadowComponent {
  static properties = {
    node: { attribute: false },
    widget: { attribute: false },
    host: { attribute: false },
    registry: { attribute: false },
    version: { type: Number }
  };

  /*
    Public Methods
  */

  /* Changes one setting of this widget. */
  set(name, value, coalesce = true) {
    this.host.setWidgetAttribute(this.node.id, name, value, coalesce);
  }

  /*
    Changes the page any way the function likes (it gets this widget's node and the whole list), as one undo step. With
    `coalesce`, changes in a row of typing count as one step.
  */
  edit(mutate, coalesce = false) {
    this.host.editWidget(this.node.id, mutate, coalesce);
  }

  /* Adds a new widget inside this one, without changing the selection. */
  addChild(type, slot = 'default') {
    this.host.addChild(this.node.id, type, slot);
  }

  /* The default fields for the declared settings, without the names in `except`. */
  renderFields(except = []) {
    return html`<k-page-builder-fields .node="${this.node}" .widget="${this.widget}" .host="${this.host}" .version="${this.version}" .exclude="${except}"></k-page-builder-fields>`;
  }
}
