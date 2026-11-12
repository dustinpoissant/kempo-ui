import { html, css, ref, createRef, nothing } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';
import './Icon.js';
import './Dialog.js';
import './FilterList.js';
import './FilterItem.js';
import { boolExists } from '../utils/propConverters.js';

export default class IconSelector extends ShadowComponent {
	static formAssociated = true;

	/*
		Reactive Properties / Attributes
	*/
	static properties = {
		value: { type: String, reflect: true },
		name: { type: String, reflect: true },
		icons: { type: String },
		dialogTitle: { type: String, attribute: 'dialog-title' },
		placeholder: { type: String },
		iconOnly: { type: Boolean, reflect: true, attribute: 'icon-only', converter: boolExists },
		allowClear: { type: Boolean, reflect: true, attribute: 'allow-clear', converter: boolExists },
		autoChoose: { type: Boolean, reflect: true, attribute: 'auto-choose', converter: boolExists },
		readonly: { type: Boolean, reflect: true },
		disabled: { type: Boolean, reflect: true },
		dialogOpen: { type: Boolean, state: true },
		pendingValue: { type: String, state: true }
	};

	/*
		Private Members
	*/
	#dialogRef = createRef();
	#listRef = createRef();
	#searchRef = createRef();
	#initialValue = '';

	/*
		Constructor
	*/
	constructor() {
		super();
		this.internals = this.attachInternals();

		/*
			Init Props
		*/
		this.value = '';
		this.name = '';
		this.icons = '';
		this.dialogTitle = 'Choose an Icon';
		this.placeholder = 'Choose an Icon';
		this.iconOnly = false;
		this.allowClear = false;
		this.dialogOpen = false;
		this.pendingValue = '';
		this.autoChoose = false;
		this.readonly = false;
		this.disabled = false;
	}

	/*
		Lifecycle Callbacks
	*/
	firstUpdated() {
		super.firstUpdated();
		this.#initialValue = this.value;
	}

	updated(changedProperties) {
		super.updated(changedProperties);
		if(changedProperties.has('value')) {
			this.internals.setFormValue(this.value);
		}
	}

	formResetCallback() {
		this.value = this.#initialValue;
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
	#handleTriggerClick = async () => {
		if(this.disabled || this.readonly) return;
		this.pendingValue = this.value;
		this.dialogOpen = true;
		await this.updateComplete;
		this.#dialogRef.value.open();
		setTimeout(() => this.#searchRef.value?.focus());
	};

	#handleClose = () => {
		this.dialogOpen = false;
	};

	#handleClear = () => {
		if(!this.allowClear) return;
		this.pendingValue = '';
		if(this.value === '') return;
		this.value = '';
		this.dispatchEvent(new CustomEvent('change', {
			detail: { value: this.value },
			bubbles: true
		}));
	};

	#handleConfirm = () => {
		if(this.pendingValue === this.value) return;
		this.value = this.pendingValue;
		this.dispatchEvent(new CustomEvent('change', {
			detail: { value: this.value },
			bubbles: true
		}));
	};

	#handleSearch = event => {
		this.#listRef.value?.filter(event.target.value);
	};

	#handleSearchKeydown = event => {
		this.#listRef.value?.handleKeydown(event);
	};

	#handleOptionClick = (event, option) => {
		event.preventDefault();
		this.pendingValue = option.value;
		if(this.autoChoose) {
			this.#handleConfirm();
			this.#dialogRef.value.close();
		}
	};

	/*
		Private Methods
	*/
	#options = () => {
		const names = this.icons ? this.icons.split(',').map(name => name.trim()).filter(Boolean) : IconSelector.icons;
		const options = new Map(names.map(name => [name, { name, src: '' }]));
		IconSelector.#added.forEach((src, name) => options.set(name, { name, src }));
		return [...options.values()].map(option => ({ ...option, value: option.src ? `src:${option.src}` : option.name }));
	};

	/*
		Rendering
	*/
	render() {
		const value = this.value || '';
		const options = this.#options();
		const isSrc = value.startsWith('src:');
		const current = options.find(option => option.value === value) || {
			name: isSrc ? value.slice(4).split('/').pop().replace(/\.svg$/, '') : value,
			src: isSrc ? value.slice(4) : ''
		};

		return html`
			<button
				id="trigger"
				type="button"
				?disabled=${this.disabled}
				title=${this.iconOnly ? (current.name || this.placeholder) : nothing}
				aria-label=${this.iconOnly ? (current.name || this.placeholder) : nothing}
				@click=${this.#handleTriggerClick}
			>
				${current.name ? html`
					${current.src ? html`<k-icon src=${current.src}></k-icon>` : html`<k-icon name=${current.name}></k-icon>`}
					${this.iconOnly ? '' : html`<span>${current.name}</span>`}
				` : this.iconOnly ? html`<k-icon></k-icon>` : html`<span class="tc-muted">${this.placeholder}</span>`}
			</button>
			<k-dialog
				${ref(this.#dialogRef)}
				cancel-text=${this.allowClear ? 'Clear' : 'Cancel'}
				confirm-text=${this.autoChoose ? '' : 'Choose Icon'}
				.confirmAction=${this.#handleConfirm}
				.cancelAction=${this.#handleClear}
				@close=${this.#handleClose}
			>
				<h5 slot="title" class="pyh px m0">${this.dialogTitle}</h5>
				${this.dialogOpen ? html`
					<div class="p">
						<input
							${ref(this.#searchRef)}
							type="search"
							class="mb"
							placeholder="Filter icons..."
							autocomplete="off"
							@input=${this.#handleSearch}
							@keydown=${this.#handleSearchKeydown}
						/>
						<k-filter-list ${ref(this.#listRef)}>
						${options.map(option => html`
							<k-filter-item filter-keywords=${option.name}>
								<a
									href="#"
									class="icon-option ph r${option.value === this.pendingValue ? ' bg-primary' : ''}"
									title=${option.name}
									aria-label=${option.name}
									@click=${event => this.#handleOptionClick(event, option)}
								>${option.src ? html`<k-icon src=${option.src}></k-icon>` : html`<k-icon name=${option.name}></k-icon>`}</a>
							</k-filter-item>
						`)}
					</k-filter-list>
					</div>
				` : ''}
			</k-dialog>
		`;
	}

	static styles = css`
		:host {
			display: block;
		}
		:host([icon-only]) {
			display: inline-block;
		}
		:host([icon-only]) #trigger {
			width: auto;
		}
		:host([disabled]) {
			opacity: 0.5;
			pointer-events: none;
		}
		:host([readonly]) {
			opacity: 0.75;
		}
		:host([readonly]) #trigger {
			pointer-events: none;
		}
		#trigger {
			display: flex;
			align-items: center;
			gap: var(--spacer_h);
			width: 100%;
			box-sizing: border-box;
			padding: var(--spacer_h) var(--spacer);
			border: 1px solid var(--c_border);
			border-radius: var(--radius);
			background: var(--c_bg);
			color: var(--tc);
			font: inherit;
			text-align: left;
			cursor: pointer;
			transition: border-color var(--animation_ms);
		}
		#trigger:focus-visible {
			outline: none;
			border-color: var(--c_primary);
		}
		k-dialog {
			--width: 32rem;
		}
		k-filter-list {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(4.5rem, 1fr));
			gap: var(--spacer_h);
		}
		.icon-option {
			color: var(--tc);
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 1.25rem;
			transition: background var(--animation_ms);
		}
		.icon-option.bg-primary {
			color: var(--tc_light);
		}
		.icon-option:hover:not(.bg-primary) {
			background: var(--c_bg__alt);
		}
	`;

	/*
		Static Methods
	*/
	static #added = new Map();

	static add(name, src = '') {
		IconSelector.#added.set(name, src);
	}

	static icons = [
		'account-circle', 'account_tree', 'add', 'arrow', 'arrow-circle', 'arrow-line', 'arrow_drop_down', 'arrows-outward', 'attach_file', 'auto_fix_high',
		'bookmark_add', 'button', 'call', 'cancel', 'card', 'cards', 'chat_bubble', 'check', 'check_circle', 'chevron', 'chevron-double',
		'chevron-line', 'close', 'code', 'code_blocks', 'comment', 'content_copy', 'contrast', 'copy', 'dashboard_customize',
		'delete', 'delete_sweep', 'desktop_windows', 'done_all', 'dot', 'download', 'drag-handle', 'edit', 'error',
		'expand_circle', 'export-file', 'expansion_panels', 'fast_forward', 'fast_rewind', 'file', 'file-text', 'filter', 'fit_screen', 'folder', 'folder-open',
		'format_align_center', 'format_align_justify', 'format_align_left', 'format_align_right', 'format_bold',
		'format_clear', 'format_color_fill', 'format_color_text', 'format_h1', 'format_h2', 'format_h3', 'format_h4',
		'format_h5', 'format_h6', 'format_italic', 'format_list_bulleted', 'format_list_numbered', 'format_paragraph',
		'format_quote', 'format_strikethrough', 'format_underlined', 'frame_source', 'fullscreen', 'fullscreen_exit',
		'gallery-thumbnail', 'github-mark', 'help', 'hide', 'iframe', 'image', 'content_slider', 'keyboard', 'label', 'library_add', 'license', 'link', 'mail', 'map',
		'mark_chat_unread', 'menu', 'mic', 'mode-auto', 'mode-dark', 'mode-light', 'more_vert', 'npm', 'open_in_browser',
		'panorama', 'pause', 'photo_library', 'pip', 'play', 'public', 'public_off', 'queue_music', 'record_voice_over', 'redo', 'repeat', 'repeat_one',
		'replay', 'restore_page', 'save', 'search', 'send', 'settings', 'show', 'shuffle', 'skip_next', 'skip_previous',
		'smartphone', 'star', 'star_filled', 'stop', 'strikethrough_s', 'tab', 'table', 'table-visibility', 'tablet',
		'text_decrease', 'text_fields', 'text_increase', 'undo', 'unfold_less', 'unfold_more', 'upload', 'view_column', 'visibility',
		'volume_off', 'volume_up', 'warning', 'width_full', 'wrap_text', 'wysiwyg'
	];
}

window.customElements.define('k-icon-selector', IconSelector);
