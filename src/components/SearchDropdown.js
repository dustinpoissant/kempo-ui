import { html, css, nothing } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';
import debounce from '../utils/debounce.js';
import './Spinner.js';

/*
	The results are a top-layer popover anchored to the input, so they are never clipped by an ancestor's overflow (a nav, a dialog).
	Popovers flatten anchor-name across the document, so each instance needs its own.
*/
let anchorNameCounter = 0;

export default class SearchDropdown extends ShadowComponent {
	static formAssociated = true;

	static properties = {
		value: { type: String, reflect: true },
		name: { type: String, reflect: true },
		placeholder: { type: String },
		opened: { type: Boolean, reflect: true },
		searching: { type: Boolean, reflect: true },
		required: { type: Boolean, reflect: true },
		disabled: { type: Boolean, reflect: true },
		readonly: { type: Boolean, reflect: true },
		debounceMs: { type: Number, attribute: 'debounce-ms' },
		minLength: { type: Number, attribute: 'min-length' },
		noResultsMessage: { type: String, attribute: 'no-results-message' },
		results: { state: true },
		message: { state: true }
	};

	#anchorName = `--search-dropdown-${anchorNameCounter++}`;
	#debouncedSearch = () => {};
	#focusedIndex = -1;
	#initialValue = '';

	/*
		Lifecycle Callbacks
	*/
	constructor() {
		super();
		this.internals = this.attachInternals();
		this.value = '';
		this.name = '';
		this.placeholder = '';
		this.opened = false;
		this.searching = false;
		this.required = false;
		this.disabled = false;
		this.readonly = false;
		this.debounceMs = 300;
		this.minLength = 2;
		this.noResultsMessage = 'No results';
		this.results = null;
		this.message = '';
		this.#setupDebounce(300);
	}

	connectedCallback() {
		super.connectedCallback();
		this.#initialValue = this.value;
		document.addEventListener('click', this.handleDocumentClick);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		document.removeEventListener('click', this.handleDocumentClick);
	}

	updated(changedProperties) {
		super.updated(changedProperties);
		const menu = this.shadowRoot?.querySelector('#menu');
		if(menu && !menu.matches(':popover-open')) menu.showPopover();
		if(changedProperties.has('debounceMs')) this.#setupDebounce(this.debounceMs);
		if(changedProperties.has('value') || changedProperties.has('required')) this.#updateFormState();
	}

	formResetCallback() {
		this.clear();
		this.value = this.#initialValue;
		this.#updateFormState();
	}

	formStateRestoreCallback(state) {
		this.value = state;
	}

	formDisabledCallback(disabled) {
		this.disabled = disabled;
	}

	/*
		Event Handlers
	*/
	handleInput = e => {
		if(this.readonly) return;
		this.value = e.target.value;
		this.#focusedIndex = -1;
		this.message = '';
		if(this.value.trim().length < this.minLength) {
			this.results = null;
			this.searching = false;
			this.opened = false;
			return;
		}
		this.opened = true;
		this.searching = true;
		this.#debouncedSearch(this.value.trim());
	};

	handleKeydown = e => {
		if(this.readonly) return;
		const count = this.#items.length;
		if(e.key === 'ArrowDown') {
			e.preventDefault();
			if(!this.opened && this.#hasContent) {
				this.opened = true;
				return;
			}
			this.#focusedIndex = Math.min(this.#focusedIndex + 1, count - 1);
			this.requestUpdate();
			this.#scrollFocusedIntoView();
		} else if(e.key === 'ArrowUp') {
			e.preventDefault();
			this.#focusedIndex = Math.max(this.#focusedIndex - 1, -1);
			this.requestUpdate();
			this.#scrollFocusedIntoView();
		} else if(e.key === 'Enter') {
			e.preventDefault();
			if(this.opened && this.#focusedIndex >= 0 && this.#focusedIndex < count) {
				this.#activate(this.#items[this.#focusedIndex], true);
			} else {
				this.opened = false;
				this.internals.form?.requestSubmit();
			}
		} else if(e.key === 'Escape') {
			e.preventDefault();
			this.opened = false;
			this.#focusedIndex = -1;
		} else if(e.key === 'Tab') {
			this.opened = false;
			this.#focusedIndex = -1;
		}
	};

	handleFocus = () => {
		if(this.readonly || this.value.trim().length < this.minLength) return;
		if(this.#hasContent) this.opened = true;
	};

	handleDocumentClick = e => {
		if(!e.composedPath().includes(this)) {
			this.opened = false;
			this.#focusedIndex = -1;
		}
	};

	handleResultClick = e => {
		const result = this.#items[Number(e.currentTarget.dataset.index)];
		if(!this.#activate(result, false)) e.preventDefault();
	};

	/*
		Public Methods
	*/
	setResults(results) {
		this.results = Array.isArray(results) ? results.filter(result => result && typeof result === 'object') : [];
		this.message = '';
		this.searching = false;
		this.#focusedIndex = -1;
		return this;
	}

	setError(message) {
		this.results = null;
		this.message = String(message || 'The search failed.');
		this.searching = false;
		this.#focusedIndex = -1;
		return this;
	}

	clear() {
		this.value = '';
		this.results = null;
		this.message = '';
		this.searching = false;
		this.opened = false;
		this.#focusedIndex = -1;
		this.#updateFormState();
		return this;
	}

	focus(options) {
		this.shadowRoot?.querySelector('input')?.focus(options);
	}

	/*
		Private Methods
	*/
	#setupDebounce(ms) {
		this.#debouncedSearch = debounce(value => {
			this.dispatchEvent(new CustomEvent('search', {
				detail: { value },
				bubbles: true,
				composed: true
			}));
		}, ms);
	}

	/* Fires `select`, then follows the result's address unless that was cancelled. Returns whether it was cancelled (false) or not. */
	#activate(result, follow) {
		const proceed = this.dispatchEvent(new CustomEvent('select', {
			detail: { result },
			bubbles: true,
			composed: true,
			cancelable: true
		}));
		this.opened = false;
		if(proceed && follow && result.url) location.assign(result.url);
		return proceed;
	}

	#updateFormState() {
		this.internals.setFormValue(this.value);
		if(this.required && !this.value.trim()) {
			this.internals.setValidity({ valueMissing: true }, 'Please fill out this field.', this.shadowRoot?.querySelector('input'));
		} else {
			this.internals.setValidity({});
		}
	}

	#scrollFocusedIntoView() {
		this.updateComplete.then(() => {
			this.shadowRoot?.querySelector('.result.focused')?.scrollIntoView({ block: 'nearest' });
		});
	}

	get #items() {
		return this.results ?? [];
	}

	get #hasContent() {
		return this.searching || this.results !== null || Boolean(this.message);
	}

	/*
		Rendering
	*/
	renderResult(result, index, previous) {
		const focused = index === this.#focusedIndex;
		const body = html`
			<span class="title">${result.title || result.url || 'Untitled'}</span>
			${result.description ? html`<span class="description">${result.description}</span>` : nothing}
		`;
		return html`
			${result.group && result.group !== previous?.group ? html`<div class="group">${result.group}</div>` : nothing}
			${result.url ? html`
				<a id="result-${index}" role="option" aria-selected=${focused} class="result ${focused ? 'focused' : ''}" href=${result.url} data-index=${index} @click=${this.handleResultClick}>${body}</a>
			` : html`
				<div id="result-${index}" role="option" aria-selected=${focused} class="result ${focused ? 'focused' : ''}" data-index=${index} @click=${this.handleResultClick}>${body}</div>
			`}
		`;
	}

	render() {
		const items = this.#items;
		return html`
			<input
				type="search"
				class="full"
				role="combobox"
				aria-expanded=${this.opened ? 'true' : 'false'}
				aria-autocomplete="list"
				aria-controls="menu"
				aria-activedescendant=${this.opened && this.#focusedIndex >= 0 ? `result-${this.#focusedIndex}` : nothing}
				.value=${this.value}
				placeholder=${this.placeholder}
				?disabled=${this.disabled}
				?readonly=${this.readonly}
				@input=${this.handleInput}
				@keydown=${this.handleKeydown}
				@focus=${this.handleFocus}
				autocomplete="off"
				style="anchor-name: ${this.#anchorName}"
			/>
			${this.opened && this.#hasContent ? html`
				<div id="menu" role="listbox" popover="manual" style="position-anchor: ${this.#anchorName}">
					${items.map((result, index) => this.renderResult(result, index, items[index - 1]))}
					${this.message ? html`<div class="message error">${this.message}</div>` : nothing}
					${this.results?.length === 0 && !this.searching ? html`<div class="message">${this.noResultsMessage}</div>` : nothing}
					${this.searching ? html`
						<div class="message searching">
							<k-spinner size="xs"></k-spinner>
							<span>Searching...</span>
						</div>
					` : nothing}
				</div>
			` : nothing}
		`;
	}

	/*
		Styles
	*/
	static styles = css`
		:host {
			display: block;
			position: relative;
		}
		:host([disabled]) {
			opacity: 0.5;
			pointer-events: none;
		}
		#menu {
			position: fixed;
			position-area: bottom span-right;
			position-try-fallbacks: flip-inline, flip-block, flip-block flip-inline;
			width: max(anchor-size(width), var(--min-width, 22rem));
			max-width: 90vw;
			max-height: 24rem;
			margin: 0.25rem 0;
			padding: 0;
			overflow-y: auto;
			color: inherit;
			background: var(--c_bg);
			border: 1px solid var(--c_border);
			border-radius: var(--radius);
			box-shadow: var(--drop_shadow);
		}
		.group {
			padding: var(--spacer_h) var(--spacer) var(--spacer_q);
			font-weight: bold;
			color: var(--tc_muted);
		}
		.result {
			display: block;
			padding: var(--spacer_h) var(--spacer);
			color: inherit;
			text-decoration: none;
			cursor: pointer;
			transition: background var(--animation_ms);
		}
		.result:hover,
		.result.focused {
			background: var(--c_bg__alt);
		}
		.title,
		.description {
			display: block;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.description {
			color: var(--tc_muted);
		}
		.message {
			padding: var(--spacer_h) var(--spacer);
			color: var(--tc_muted);
		}
		.message.error {
			color: var(--tc_danger);
		}
		.searching {
			display: flex;
			align-items: center;
			gap: 0.5rem;
		}
	`;
}

customElements.define('k-search-dropdown', SearchDropdown);
