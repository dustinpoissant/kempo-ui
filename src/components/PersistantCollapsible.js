import Collapsible from './Collapsible.js';

export default class PersistantCollapsible extends Collapsible {
	constructor() {
		super();
		this.storageKey = '';
	}

	/*
		Lifecycle Callbacks
	*/
	connectedCallback() {
		super.connectedCallback();
		this.updateStorageKey();
		this.loadFromStorage();
		window.addEventListener('storage', this.handleStorageChange);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		window.removeEventListener('storage', this.handleStorageChange);
	}

	updated(changedProperties) {
		super.updated(changedProperties);
		
		if(changedProperties.has('opened')) {
			this.saveToStorage();
		}
		
		if(changedProperties.has('id')) {
			this.updateStorageKey();
			this.loadFromStorage();
		}
	}

	/*
		Event Handlers
	*/
	handleStorageChange = event => {
		if(event.key === this.storageKey) {
			this.loadFromStorage();
		}
	}

	/*
		Private Methods
	*/
	updateStorageKey() {
		this.storageKey = this.id ? `PersistantCollapsible-${this.id}` : '';
	}

	loadFromStorage() {
		if(this.storageKey) {
			const stored = localStorage.getItem(this.storageKey);
			if(stored !== null) {
				this.opened = stored === 'true';
			}
		}
	}

	saveToStorage() {
		if(this.storageKey) {
			localStorage.setItem(this.storageKey, this.opened.toString());
		}
	}
}

customElements.define('k-p-collapsible', PersistantCollapsible);
