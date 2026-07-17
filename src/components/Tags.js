import { html, css } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';

const debounceTimer = Symbol('debounceTimer');
const suggestion = Symbol('suggestion');
const suggestionSuppressed = Symbol('suggestionSuppressed');

/*
	Tags Component
*/
export default class Tags extends ShadowComponent {
	static properties = {
		value: { type: String, reflect: true },
		allowedTags: { type: String, reflect: true, attribute: 'allowed-tags' },
		disallowedTags: { type: String, reflect: true, attribute: 'disallowed-tags' },
		suggestionDebounce: { type: Number, reflect: true, attribute: 'suggestion-debounce' },
		disabled: { type: Boolean, reflect: true }
	};

	constructor() {
		super();
		this.value = '';
		this.allowedTags = '';
		this.disallowedTags = '';
		this.suggestionDebounce = 300;
		this.disabled = false;
		// A user-provided function called as getSuggestions(query, callback).
		// It may either invoke the callback with an array of suggestions, or
		// return an array / a Promise that resolves to an array.
		this.getSuggestions = null;
		this[suggestion] = '';
		this[suggestionSuppressed] = false;
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		clearTimeout(this[debounceTimer]);
	}

	/*
		Lifecycle Callbacks
	*/
	firstUpdated() {
		super.firstUpdated();
		this.renderTags();
	}

	updated(changedProperties) {
		super.updated(changedProperties);
		
		if(changedProperties.has('value')) {
			const oldValue = changedProperties.get('value');
			const validTags = this.validateTags();
			if(validTags !== this.value) {
				this.value = validTags;
			} else {
				this.dispatchEvent(new CustomEvent('change', {
					detail: { oldValue, newValue: this.value },
					bubbles: true
				}));
				this.renderTags();
			}
		}
		
		if(changedProperties.has('allowedTags') || changedProperties.has('disallowedTags')) {
			const oldValue = changedProperties.get('allowedTags') || changedProperties.get('disallowedTags');
			const newValue = this.allowedTags || this.disallowedTags;
			const validTags = this.validateTags();
			if(validTags !== this.value) {
				this.value = validTags;
			} else {
				const eventName = changedProperties.has('allowedTags') ? 'allowedtagschange' : 'disallowedtagschange';
				this.dispatchEvent(new CustomEvent(eventName, {
					detail: { oldValue, newValue },
					bubbles: true
				}));
				this.renderTags();
			}
		}
	}

	/*
		Event Handlers
	*/
	handleInputChange = () => {
		if(this.disabled) return;
		const tagsInput = this.shadowRoot.getElementById('tagsInput');
		const tag = tagsInput.value.trim();
		if(tag) {
			this.addTag(tag);
			tagsInput.value = '';
		}
	};

	handleInputInput = (event) => {
		if(this.disabled) return;
		const tagsInput = this.shadowRoot.getElementById('tagsInput');
		if(event.data === ',' || event.inputType === 'insertFromPaste') {
			const tags = tagsInput.value.split(',').filter(tag => !!tag.trim());
			if(tags.length) {
				tags.forEach(tag => this.addTag(tag.trim()));
				tagsInput.value = '';
			}
			this.clearSuggestion();
			return;
		}
		// The typed text changed, so any existing suggestion is stale. Typing
		// also lifts a previous cancel, allowing suggestions to appear again.
		this.clearSuggestion();
		this[suggestionSuppressed] = false;
		this.requestSuggestions(tagsInput.value);
	};

	handleInputKeydown = (event) => {
		if(this.disabled) return;
		const tagsInput = this.shadowRoot.getElementById('tagsInput');
		const hasSuggestion = !!this[suggestion];
		if(event.key === 'Enter' || event.key === 'Tab') {
			const tag = (hasSuggestion ? this[suggestion] : tagsInput.value).trim();
			if(tag) {
				event.preventDefault();
				this.addTag(tag);
				tagsInput.value = '';
				this.clearSuggestion();
				this[suggestionSuppressed] = false;
			}
		} else if((event.key === 'Backspace' || event.key === 'Escape') && hasSuggestion) {
			// Cancel the suggested completion without deleting typed characters,
			// so the user can keep exactly what they typed and then save it.
			event.preventDefault();
			this.clearSuggestion();
			this[suggestionSuppressed] = true;
		}
	};

	/*
		Public Methods
	*/
	async renderTags() {
		await this.updateComplete;
		const tagsContainer = this.shadowRoot.getElementById('tags');
		tagsContainer.innerHTML = '';
		
		if(this.value) {
			this.value.split(',').forEach(tag => {
				const tagElement = new Tag(tag.trim(), this);
				tagsContainer.appendChild(tagElement);
			});
		}
	}

	requestSuggestions(query) {
		clearTimeout(this[debounceTimer]);
		if(!this.getSuggestions || !query.trim() || this[suggestionSuppressed]) return;
		this[debounceTimer] = setTimeout(() => {
			const result = this.getSuggestions(query, results => this.applySuggestions(query, results));
			if(result && typeof result.then === 'function') {
				result.then(results => this.applySuggestions(query, results));
			} else if(Array.isArray(result)) {
				this.applySuggestions(query, result);
			}
		}, this.suggestionDebounce);
	}

	applySuggestions(query, results) {
		const tagsInput = this.shadowRoot?.getElementById('tagsInput');
		// Ignore stale or cancelled responses, or ones for outdated input.
		if(!tagsInput || this[suggestionSuppressed] || tagsInput.value !== query || !Array.isArray(results)) return;
		const match = results.find(r => typeof r === 'string' && r.length > query.length && r.toLowerCase().startsWith(query.toLowerCase()));
		if(!match) {
			this.clearSuggestion();
			return;
		}
		this[suggestion] = match;
		const ghost = this.shadowRoot.getElementById('ghost');
		ghost.innerHTML = '';
		const prefix = document.createElement('span');
		prefix.textContent = query;
		const suffix = document.createElement('span');
		suffix.className = 'suffix';
		suffix.textContent = match.slice(query.length);
		ghost.appendChild(prefix);
		ghost.appendChild(suffix);
	}

	clearSuggestion() {
		clearTimeout(this[debounceTimer]);
		this[suggestion] = '';
		const ghost = this.shadowRoot?.getElementById('ghost');
		if(ghost) ghost.innerHTML = '';
	}

	addTag(tag) {
		const tags = new Set(this.value.split(',').filter(t => !!t.trim()));
		tags.add(tag.trim());
		this.value = [...tags].filter(t => !!t).join(',');
		this.dispatchEvent(new CustomEvent('addtag', {
			detail: { tag },
			bubbles: true
		}));
	}

	removeTag(tag) {
		const tags = new Set(this.value.split(',').filter(t => !!t.trim()));
		tags.delete(tag);
		this.value = [...tags].join(',');
		this.dispatchEvent(new CustomEvent('removetag', {
			detail: { tag },
			bubbles: true
		}));
	}

	validateTags() {
		return this.value
			.split(',')
			.map(t => t.trim())
			.map(tag => {
				const allowed = new Set(this.allowedTags.split(',').filter(t => !!t.trim()));
				if(allowed.size) return allowed.has(tag) ? tag : '';
				const disallowed = new Set(this.disallowedTags.split(',').filter(t => !!t.trim()));
				if(disallowed.size) return disallowed.has(tag) ? '' : tag;
				return tag;
			})
			.filter(t => !!t)
			.join(',');
	}

	/*
		Styles
	*/
	static styles = css`
		:host {
			display: block;
		}
		:host([disabled]) {
			opacity: 0.5;
			cursor: not-allowed;
			pointer-events: none;
		}
		#tagsHolder {
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			width: 100%;
			background-color: var(--input_bg);
			color: var(--input_tc);
			border: var(--input_border_width) solid var(--c_border);
			padding: var(--spacer_q);
			margin-bottom: var(--spacer);
			border-radius: var(--radius);
			outline: none;
			transition: box-shadow var(--animation_ms);
			cursor: default;
		}

		#tagsHolder:focus-within {
			box-shadow: var(--focus_shadow);
		}

		#tags {
			display: contents;
		}

		#inputWrap {
			position: relative;
			display: inline-flex;
			max-width: 100%;
			margin: var(--spacer_q);
		}

		#tagsInput {
			display: inline-block;
			min-width: 5rem;
			width: auto;
			max-width: 100%;
			font: inherit;
			background-color: transparent;
			color: inherit;
			border: 0 solid transparent;
			margin: 0;
			padding: var(--spacer_q) 0;
			border-radius: 0;
			transition: none;
			box-shadow: 0 0 0 transparent;
			position: relative;
			z-index: 1;
		}

		#ghost {
			position: absolute;
			top: 0;
			left: 0;
			padding: var(--spacer_q) 0;
			font: inherit;
			white-space: pre;
			pointer-events: none;
			overflow: hidden;
			max-width: 100%;
			color: transparent;
			z-index: 0;
		}

		#ghost .suffix {
			color: var(--tc_muted, #666);
		}
	`;

	/*
		Rendering
	*/
	render() {
		return html`
			<label for="tagsInput">
				<slot></slot>
				<div id="tagsHolder">
					<span id="tags"></span>
					<span id="inputWrap">
						<span id="ghost"></span>
						<input
							id="tagsInput"
							?disabled=${this.disabled}
							@change=${this.handleInputChange}
							@input=${this.handleInputInput}
							@keydown=${this.handleInputKeydown}
						/>
					</span>
				</div>
			</label>
		`;
	}
}

/*
	Tag Component
*/
class Tag extends ShadowComponent {
	constructor(tag, tagsComponent) {
		super();
		this.tag = tag;
		this.tagsComponent = tagsComponent;
		this.innerHTML = tag;
	}

	/*
		Event Handlers
	*/
	handleClick = () => {
		if(this.tagsComponent.disabled) return;
		this.tagsComponent.removeTag(this.tag);
	};

	/*
		Styles
	*/
	static styles = css`
		:host {
			display: inline-block;
			max-width: 100%;
			margin: var(--spacer_q);
			padding: var(--spacer_q) var(--spacer_h);
			border: 1px solid var(--c_border);
			border-radius: var(--radius);
			cursor: pointer;
			box-sizing: border-box;
		}

		:host(:hover) {
			text-decoration: line-through;
		}
	`;

	/*
		Rendering
	*/
	render() {
		return html`<span @click=${this.handleClick}><slot></slot></span>`;
	}
}

/*
	Define Custom Elements
*/
customElements.define('k-tags', Tags);
customElements.define('k-tag', Tag);
