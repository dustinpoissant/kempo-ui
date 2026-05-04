import { html, css } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';
import debounce from '../utils/debounce.js';
import './Option.js';

export default class Combobox extends ShadowComponent {
	static formAssociated = true;

	static properties = {
		value: { type: String, reflect: true },
		name: { type: String, reflect: true },
		placeholder: { type: String },
		opened: { type: Boolean, reflect: true },
		searching: { type: Boolean, reflect: true },
		required: { type: Boolean, reflect: true },
		requireMatch: { type: Boolean, reflect: true, attribute: 'require-match' },
		disabled: { type: Boolean, reflect: true },
		debounceMs: { type: Number, attribute: 'debounce-ms' },
		maxVisible: { type: Number, attribute: 'max-visible' },
		noResultsMessage: { type: String, attribute: 'no-results-message' },
		emptyMessage: { type: String, attribute: 'empty-message' }
	};

	#focusedIndex = -1;
	#options = [];

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
		this.requireMatch = false;
		this.disabled = false;
		this.debounceMs = 300;
		this.maxVisible = 8;
		this.noResultsMessage = 'No Matches';
		this.emptyMessage = 'Type to search...';
		this.#setupDebounce(300);
	}

	connectedCallback() {
		super.connectedCallback();
		document.addEventListener('click', this.handleDocumentClick);
		this.#syncOptions();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		document.removeEventListener('click', this.handleDocumentClick);
	}

	childrenUpdated() {
		this.#syncOptions();
	}

	updated(changedProperties) {
		super.updated(changedProperties);
		if(changedProperties.has('debounceMs')) {
			this.#setupDebounce(this.debounceMs);
		}
		if(changedProperties.has('value') || changedProperties.has('required') || changedProperties.has('requireMatch')) {
			this.#updateFormState();
		}
	}

	formResetCallback() {
		this.value = '';
		this.#updateFormState();
	}

	formStateRestoreCallback(state) {
		this.value = state;
	}

	/*
		Event Handlers
	*/
	handleInput = e => {
		this.value = e.target.value;
		this.opened = true;
		this.#focusedIndex = -1;
		this.#debouncedSearch(this.value);
	};

	handleKeydown = e => {
		const items = this.#visibleOptions;
		if(e.key === 'ArrowDown') {
			e.preventDefault();
			if(!this.opened) {
				this.opened = true;
				return;
			}
			this.#focusedIndex = Math.min(this.#focusedIndex + 1, items.length - 1);
			this.requestUpdate();
			this.#scrollFocusedIntoView();
		} else if(e.key === 'ArrowUp') {
			e.preventDefault();
			this.#focusedIndex = Math.max(this.#focusedIndex - 1, 0);
			this.requestUpdate();
			this.#scrollFocusedIntoView();
		} else if(e.key === 'Enter') {
			e.preventDefault();
			if(this.#focusedIndex >= 0 && this.#focusedIndex < items.length) {
				this.#selectOption(items[this.#focusedIndex]);
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

	handleDocumentClick = e => {
		if(!e.composedPath().includes(this)) {
			this.opened = false;
			this.#focusedIndex = -1;
		}
	};

	handleFocus = () => {
		this.opened = true;
	};

	handleOptionClick = e => {
		const index = Number(e.currentTarget.dataset.index);
		this.#selectOption(this.#visibleOptions[index]);
	};

	/*
		Public Methods
	*/
	setOptions(options) {
		[...this.querySelectorAll('k-option')].forEach(o => o.remove());
		options.forEach(opt => {
			const el = document.createElement('k-option');
			if(typeof opt === 'object') {
				el.setAttribute('value', opt.value ?? opt.label);
				el.textContent = opt.label;
			} else {
				el.textContent = opt;
			}
			this.appendChild(el);
		});
		return this;
	}

	clear() {
		this.value = '';
		this.opened = false;
		this.#focusedIndex = -1;
		this.#updateFormState();
		return this;
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

	#debouncedSearch = () => {};

	#syncOptions() {
		this.#options = [...this.querySelectorAll('k-option')].map(el => ({
			label: el.label,
			value: el.value
		}));
		this.requestUpdate();
	}

	#selectOption(option) {
		this.value = option.label;
		this.opened = false;
		this.#focusedIndex = -1;
		this.#updateFormState();
		this.dispatchEvent(new CustomEvent('select', {
			detail: { value: option.value, label: option.label },
			bubbles: true,
			composed: true
		}));
		this.dispatchEvent(new CustomEvent('change', {
			bubbles: true
		}));
	}

	#updateFormState() {
		const matchedOption = this.#options.find(o => o.label === this.value);
		this.internals.setFormValue(matchedOption ? matchedOption.value : this.value);
		if(this.required && !this.value) {
			this.internals.setValidity({ valueMissing: true }, 'Please select a value.', this.shadowRoot?.querySelector('input'));
		} else if(this.requireMatch && this.value && !matchedOption) {
			this.internals.setValidity({ customError: true }, 'Please select a valid option.', this.shadowRoot?.querySelector('input'));
		} else {
			this.internals.setValidity({});
		}
	}

	#scrollFocusedIntoView() {
		this.updateComplete.then(() => {
			this.shadowRoot?.querySelector('.option.focused')?.scrollIntoView({ block: 'nearest' });
		});
	}

	get #filteredOptions() {
		const term = (this.value || '').toLowerCase();
		if(!term) return this.#options;
		return this.#options.filter(opt => opt.label.toLowerCase().includes(term));
	}

	get #visibleOptions() {
		return this.#filteredOptions.slice(0, this.maxVisible);
	}

	/*
		Rendering
	*/
	render() {
		const visible = this.#visibleOptions;
		const hasMore = this.#filteredOptions.length > this.maxVisible;
		return html`
			<slot style="display:none"></slot>
			<input
				type="text"
				.value=${this.value}
				placeholder=${this.placeholder}
				?disabled=${this.disabled}
				@input=${this.handleInput}
				@keydown=${this.handleKeydown}
				@focus=${this.handleFocus}
				autocomplete="off"
			/>
			${this.opened ? html`
				<div id="menu">
					${visible.map((opt, i) => html`
						<div
							class="option ${i === this.#focusedIndex ? 'focused' : ''}"
							data-index=${i}
							@click=${this.handleOptionClick}
						>${opt.label}</div>
					`)}
					${hasMore && !this.searching ? html`
						<div class="more">${this.#filteredOptions.length - this.maxVisible} more...</div>
					` : ''}
					${visible.length === 0 && !this.searching ? html`
						<div class="no-results">${this.value ? this.noResultsMessage : this.emptyMessage}</div>
					` : ''}
					${this.searching ? html`
						<div class="searching">
							<k-spinner size="xs"></k-spinner>
							<span>Searching...</span>
						</div>
					` : ''}
				</div>
			` : ''}
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
		input {
			width: 100%;
			box-sizing: border-box;
			padding: var(--spacer_h) var(--spacer);
			border: 1px solid var(--c_border);
			border-radius: var(--radius);
			background: var(--c_bg);
			color: var(--tc);
			font: inherit;
			outline: none;
			transition: border-color var(--animation_ms);
		}
		input:focus {
			border-color: var(--c_primary);
		}
		#menu {
			position: absolute;
			top: 100%;
			left: 0;
			right: 0;
			z-index: 70;
			max-height: 20rem;
			overflow-y: auto;
			background: var(--c_bg);
			border: 1px solid var(--c_border);
			border-radius: var(--radius);
			box-shadow: var(--drop_shadow);
			margin-top: 0.25rem;
		}
		.option {
			padding: var(--spacer_h) var(--spacer);
			cursor: pointer;
			transition: background var(--animation_ms);
		}
		.option:hover,
		.option.focused {
			background: var(--c_bg__alt);
		}
		.no-results,
		.more {
			padding: var(--spacer_h) var(--spacer);
			color: var(--tc_muted);
			font-style: italic;
		}
		.searching {
			display: flex;
			align-items: center;
			gap: 0.5rem;
			padding: var(--spacer_h) var(--spacer);
			color: var(--tc_muted);
			border-top: 1px solid var(--c_border);
		}
	`;
}

customElements.define('k-combobox', Combobox);
