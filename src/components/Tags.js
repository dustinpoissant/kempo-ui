import { html, css } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';

/*
	Tags Component
*/
export default class Tags extends ShadowComponent {
	static properties = {
		value: { type: String, reflect: true },
		allowedTags: { type: String, reflect: true, attribute: 'allowed-tags' },
		disallowedTags: { type: String, reflect: true, attribute: 'disallowed-tags' },
		disabled: { type: Boolean, reflect: true }
	};

	constructor() {
		super();
		this.value = '';
		this.allowedTags = '';
		this.disallowedTags = '';
		this.disabled = false;
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
		if(event.data === ',' || event.inputType === 'insertFromPaste') {
			const tagsInput = this.shadowRoot.getElementById('tagsInput');
			const tags = tagsInput.value.split(',').filter(tag => !!tag.trim());
			if(tags.length) {
				tags.forEach(tag => this.addTag(tag.trim()));
				tagsInput.value = '';
			}
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

		#tagsInput {
			display: inline-block;
			min-width: 5rem;
			width: auto;
			max-width: 100%;
			background-color: transparent;
			color: inherit;
			border: 0 solid transparent;
			margin: var(--spacer_q);
			padding: var(--spacer_q) 0;
			border-radius: 0;
			transition: none;
			box-shadow: 0 0 0 transparent;
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
					<input 
						id="tagsInput"
						?disabled=${this.disabled}
						@change=${this.handleInputChange}
						@input=${this.handleInputInput}
					/>
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
			width: min-content;
			margin: var(--spacer_q);
			padding: var(--spacer_q) var(--spacer_h);
			border: 1px solid var(--c_border);
			border-radius: var(--radius);
			cursor: pointer;
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
