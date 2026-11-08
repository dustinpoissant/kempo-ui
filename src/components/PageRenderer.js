import { renderPage, collectModules } from '../utils/renderPage.js';
import { widgets, registryOf } from '../utils/pageWidgets.js';
import sanitizeHtml from '../utils/sanitizeHtml.js';

/*
  Renders a page's JSON (what PageBuilder emits) as the page. The page is plain HTML, so the element writes it into
  itself, loads the modules its widgets need, and the widgets upgrade as usual. It is not Lit, so the same markup can be
  written on a server: PageRenderer.toHTML(value) gives the HTML as a string.

  Text written in the builder is sanitized here; on a server, sanitize it there too (see docs).
*/

const valueKey = Symbol('value');
const countKey = Symbol('count');
const renderKey = Symbol('render');

/* A script the browser was given with innerHTML does not run; a fresh copy of it does. */
const activateScripts = element => {
  for(const script of element.querySelectorAll('script')){
    const fresh = document.createElement('script');
    for(const { name, value } of script.attributes) fresh.setAttribute(name, value);
    fresh.textContent = script.textContent;
    script.replaceWith(fresh);
  }
};

export default class PageRenderer extends HTMLElement {
  /*
    Static Methods
  */
  /* The HTML of a page value, with no DOM: for a server. Text is not sanitized here (the server must do it). */
  static toHTML(value, list = widgets){
    return renderPage(value?.slots?.default || [], registryOf(list));
  }

  /*
    Lifecycle Callbacks
  */
  constructor(){
    super();
    this[valueKey] = null;
    this[countKey] = 0;
  }

  connectedCallback(){
    this[renderKey]();
  }

  /*
    Protected Members
  */
  get value(){
    return this[valueKey];
  }

  set value(next){
    this[valueKey] = next;
    this[renderKey]();
  }

  /*
    Private Methods
  */
  [renderKey] = async () => {
    const value = this[valueKey];
    if(!this.isConnected || !value) return;
    const token = ++this[countKey];
    const nodes = value.slots?.default || [];
    const registry = registryOf(widgets);
    await Promise.all(collectModules(nodes, registry).map(url => import(url)));
    if(token !== this[countKey]) return;
    this.innerHTML = renderPage(nodes, registry, { sanitize: sanitizeHtml });
    activateScripts(this);
    this.dispatchEvent(new CustomEvent('render', { detail: { value } }));
  };
}

customElements.define('k-page-renderer', PageRenderer);
