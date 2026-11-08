import ShadowComponent from '../ShadowComponent.js';

/*
  The base of a widget's editor element: the element the builder shows in the page instead of the widget's page element,
  for a widget that must be edited where it is drawn (a text, say). `selected` is true while the widget is the only one
  selected, so the editing controls show only then. emitChange({ attribute: value }) tells the builder the widget changed;
  the builder records it as one undo step. The element is not defined here: a module extends this class and defines it.
*/
export default class WidgetEditor extends ShadowComponent {
  static properties = {
    selected: { type: Boolean, reflect: true }
  };

  constructor() {
    super();
    this.selected = false;
  }

  /*
    Lifecycle Callbacks
  */
  connectedCallback() {
    super.connectedCallback();
    this.selected = this.classList.contains('pb-selected');
    this.addEventListener('pb-selected', this.handleSelected);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('pb-selected', this.handleSelected);
  }

  /*
    Public Methods
  */
  emitChange(changes) {
    this.dispatchEvent(new CustomEvent('pb-change', { bubbles: true, composed: true, detail: { id: this.dataset.pbId, changes } }));
  }

  /*
    Event Handlers
  */
  handleSelected = event => {
    this.selected = event.detail.selected;
  };
}
