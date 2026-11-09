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
	An area to drop files on, or to click to open the file picker. It only collects files: it reports them in a `files` event
	and leaves what to do with them (upload, read, preview) to whoever listens.
*/
export default class Dropzone extends ShadowComponent {
	static properties = {
		accept: { type: String, reflect: true },
		multiple: { type: Boolean, reflect: true, converter: boolExists },
		disabled: { type: Boolean, reflect: true, converter: boolExists },
		label: { type: String },
		dragging: { type: Boolean, reflect: true, converter: boolExists }
	};

	/*
		Constructor
	*/
	constructor() {
		super();
		this.accept = '';
		this.multiple = false;
		this.disabled = false;
		this.label = '';
		this.dragging = false;
		this.dragDepth = 0;
	}

	/*
		Public Methods
	*/
	open() {
		if(this.disabled) return;
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
		if(this.disabled) return;
		this.dragDepth++;
		this.dragging = true;
	};

	handleDragOver = event => {
		event.preventDefault();
		if(event.dataTransfer) event.dataTransfer.dropEffect = this.disabled ? 'none' : 'copy';
	};

	handleDragLeave = () => {
		this.dragDepth = Math.max(0, this.dragDepth - 1);
		if(!this.dragDepth) this.dragging = false;
	};

	handleDrop = event => {
		event.preventDefault();
		this.dragDepth = 0;
		this.dragging = false;
		if(this.disabled) return;
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
		this.dispatchEvent(new CustomEvent('files', {
			detail: { files, rejected },
			bubbles: true,
			composed: true
		}));
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
