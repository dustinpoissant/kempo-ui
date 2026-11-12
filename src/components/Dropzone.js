import { html, css } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';
import { boolExists } from '../utils/propConverters.js';
import './Icon.js';

/*
	Utility Functions
*/
const accepts = (file, accept) => {
	const tokens = accept.split(',').map(token => token.trim().toLowerCase()).filter(Boolean);
	if(!tokens.length) return true;
	const name = file.name.toLowerCase();
	const type = (file.type || '').toLowerCase();
	return tokens.some(token => {
		if(token.startsWith('.')) return name.endsWith(token);
		if(token.endsWith('/*')) return type.startsWith(token.slice(0, -1));
		return type === token;
	});
};

/*
	An area to drop files on, or to click to open the file picker. It reports the accepted files in a `files` event and keeps
	them as its form value (a file input's behaviour: a new accepted drop replaces the previous files).
*/
export default class Dropzone extends ShadowComponent {
	static formAssociated = true;

	static properties = {
		accept: { type: String, reflect: true },
		multiple: { type: Boolean, reflect: true, converter: boolExists },
		disabled: { type: Boolean, reflect: true, converter: boolExists },
		readonly: { type: Boolean, reflect: true, converter: boolExists },
		required: { type: Boolean, reflect: true, converter: boolExists },
		name: { type: String, reflect: true },
		label: { type: String },
		dragging: { type: Boolean, reflect: true, converter: boolExists }
	};

	#files = [];

	/*
		Constructor
	*/
	constructor() {
		super();
		this.internals = this.attachInternals();
		this.accept = '';
		this.multiple = false;
		this.disabled = false;
		this.readonly = false;
		this.required = false;
		this.name = '';
		this.label = '';
		this.dragging = false;
		this.dragDepth = 0;
	}

	/*
		Lifecycle Callbacks
	*/
	updated(changedProperties) {
		super.updated(changedProperties);
		if(changedProperties.has('name') || changedProperties.has('required')) this.updateFormValue();
	}

	/*
		Form Callbacks
	*/
	formResetCallback() {
		this.#files = [];
		this.updateFormValue();
	}

	formDisabledCallback(disabled) {
		this.disabled = disabled;
	}

	/*
		Public Methods
	*/
	get files() {
		return [...this.#files];
	}

	open() {
		if(this.disabled || this.readonly) return;
		this.renderRoot.querySelector('#input')?.click();
	}

	/*
		Event Handlers
	*/
	handleKeydown = event => {
		if(event.key !== 'Enter' && event.key !== ' ') return;
		event.preventDefault();
		this.open();
	};

	handleDragEnter = event => {
		event.preventDefault();
		if(this.disabled || this.readonly) return;
		this.dragDepth++;
		this.dragging = true;
	};

	handleDragOver = event => {
		event.preventDefault();
		if(event.dataTransfer) event.dataTransfer.dropEffect = this.disabled || this.readonly ? 'none' : 'copy';
	};

	handleDragLeave = () => {
		this.dragDepth = Math.max(0, this.dragDepth - 1);
		if(!this.dragDepth) this.dragging = false;
	};

	handleDrop = event => {
		event.preventDefault();
		this.dragDepth = 0;
		this.dragging = false;
		if(this.disabled || this.readonly) return;
		this.collect([...(event.dataTransfer?.files ?? [])]);
	};

	handleInput = event => {
		this.collect([...event.target.files]);
		event.target.value = '';
	};

	/*
		Private Methods
	*/
	collect(dropped) {
		const files = [];
		const rejected = [];
		dropped.forEach(file => {
			if(accepts(file, this.accept) && (this.multiple || !files.length)) files.push(file);
			else rejected.push(file);
		});
		if(files.length) {
			this.#files = files;
			this.updateFormValue();
		}
		this.dispatchEvent(new CustomEvent('files', {
			detail: { files, rejected },
			bubbles: true,
			composed: true
		}));
	}

	updateFormValue() {
		const data = new FormData();
		this.#files.forEach(file => data.append(this.name, file));
		this.internals.setFormValue(this.name && this.#files.length ? data : null);
		this.internals.setValidity(
			this.required && !this.#files.length ? { valueMissing: true } : {},
			'Please choose a file.',
			this.renderRoot.querySelector('#zone')
		);
	}

	get defaultLabel() {
		return this.multiple ? 'Drag and drop files here, or click to choose them' : 'Drag and drop a file here, or click to choose one';
	}

	/*
		Rendering
	*/
	render() {
		return html`
			<div
				id="zone"
				part="zone"
				role="button"
				tabindex=${this.disabled ? '-1' : '0'}
				aria-disabled=${this.disabled ? 'true' : 'false'}
				@click=${() => this.open()}
				@keydown=${this.handleKeydown}
				@dragenter=${this.handleDragEnter}
				@dragover=${this.handleDragOver}
				@dragleave=${this.handleDragLeave}
				@drop=${this.handleDrop}
			>
				<slot>
					<k-icon name="upload"></k-icon>
					<span>${this.label || this.defaultLabel}</span>
				</slot>
			</div>
			<input id="input" type="file" accept=${this.accept} ?multiple=${this.multiple} tabindex="-1" style="display: none" @change=${this.handleInput} />
		`;
	}

	static styles = css`
		:host {
			display: block;
		}
		:host([disabled]) {
			opacity: 0.5;
			pointer-events: none;
		}
		:host([readonly]) {
			opacity: 0.75;
		}
		:host([readonly]) #zone {
			pointer-events: none;
		}
		#zone {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: var(--spacer_h);
			padding: calc(var(--spacer) * 2) var(--spacer);
			border: 2px dashed var(--c_border);
			border-radius: var(--radius);
			color: var(--tc_muted);
			text-align: center;
			cursor: pointer;
			transition: border-color var(--animation_ms), background var(--animation_ms), color var(--animation_ms);
		}
		#zone:hover,
		#zone:focus-visible {
			outline: none;
			border-color: var(--c_primary);
			color: var(--tc);
		}
		:host([dragging]) #zone {
			border-color: var(--c_primary);
			background: var(--c_bg__alt);
			color: var(--tc);
		}
	`;
}

window.customElements.define('k-dropzone', Dropzone);
