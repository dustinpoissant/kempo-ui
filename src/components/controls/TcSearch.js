import Control from './Control.js';
import { html } from '../../lit-all.min.js';
import debounce from '../../utils/debounce.js';

export default class TcSearch extends Control {
  static properties = {
    ...Control.properties,
    searchTerm: { type: String, state: true }
  };

  constructor() {
    super();
    this.searchTerm = '';
    this.debouncedSearch = debounce(() => this.performSearch(), 200);
  }

  handleInput = (e) => {
    this.searchTerm = e.target.value;
    this.debouncedSearch();
  };

  performSearch() {
    const host = this.host;
    if(!host) return;
    if(!this.searchTerm || this.searchTerm.length < 3) host.showAllRecords();
    else host.search(this.searchTerm);
  }

  render() {
    return html`<input type="search" placeholder="Search" .value=${this.searchTerm || ''} @input=${this.handleInput} />`;
  }
}

customElements.define('kc-tc-search', TcSearch);
