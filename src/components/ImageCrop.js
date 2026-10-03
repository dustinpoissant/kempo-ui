import { html, css } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';
import { bound } from '../utils/number.js';
import './Icon.js';

const MIN_DISPLAY_SIZE = 24;
const HANDLES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
const EXTENSIONS = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };

/*
  Parses "1", "1.5", "16/9" or "16:9" into a number. Anything else (including "" and "free") is null.
*/
const parseRatio = (value) => {
	if(!value) return null;
	const [a, b = 1] = String(value).split(/[:/]/).map(Number);
	const ratio = a / b;
	return Number.isFinite(ratio) && ratio > 0 ? ratio : null;
};

export default class ImageCrop extends ShadowComponent {
	static formAssociated = true;

	static properties = {
		src: { type: String, reflect: true },
		name: { type: String, reflect: true },
		aspectRatio: { type: String, reflect: true, attribute: 'aspect-ratio' },
		maxWidth: { type: Number, reflect: true, attribute: 'max-width' },
		maxHeight: { type: Number, reflect: true, attribute: 'max-height' },
		type: { type: String, reflect: true },
		quality: { type: Number, reflect: true },
		label: { type: String, reflect: true },
		placeholder: { type: String, reflect: true },
		disabled: { type: Boolean, reflect: true },
		required: { type: Boolean, reflect: true },
		image: { state: true },
		cropRect: { state: true },
		scale: { state: true },
		dragging: { state: true }
	};

	#objectUrl = null;
	#fileName = '';
	#formToken = 0;
	#resizeObserver = null;
	#drag = null;

	constructor() {
		super();
		this.internals = this.attachInternals();
		this.src = '';
		this.name = '';
		this.aspectRatio = '';
		this.maxWidth = 0;
		this.maxHeight = 0;
		this.type = 'image/png';
		this.quality = 0.92;
		this.label = 'Upload Image';
		this.placeholder = 'or drop an image here';
		this.disabled = false;
		this.required = false;
		this.image = null;
		this.cropRect = null;
		this.scale = 1;
		this.dragging = false;
	}

	/*
		Lifecycle Callbacks
	*/
	connectedCallback() {
		super.connectedCallback();
		this.#resizeObserver = new ResizeObserver(() => this.fitStage());
		this.#resizeObserver.observe(this);
		this.syncFormValue();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.#resizeObserver?.disconnect();
		this.revokeObjectUrl();
	}

	firstUpdated() {
		if(this.src && !this.image) this.loadImage(this.src);
	}

	updated(changedProperties) {
		super.updated(changedProperties);
		if(changedProperties.has('src') && changedProperties.get('src') !== undefined && this.src){
			this.loadImage(this.src);
		}
		if(changedProperties.has('aspectRatio') && this.image){
			this.cropRect = this.fitCrop(this.cropRect);
			this.commit();
		}
		if(['maxWidth', 'maxHeight', 'type', 'quality'].some(prop => changedProperties.has(prop))){
			this.syncFormValue();
		}
		if(changedProperties.has('required')){
			this.updateValidity();
		}
		if(changedProperties.has('image') || changedProperties.has('scale')){
			this.drawStage();
		}
	}

	/*
		Form Callbacks
	*/
	formResetCallback() {
		if(this.src){
			this.loadImage(this.src);
		} else {
			this.clear();
		}
	}

	formDisabledCallback(disabled) {
		this.disabled = disabled;
	}

	/*
		Public API
	*/
	get hasImage() {
		return !!this.image;
	}

	get ratio() {
		return parseRatio(this.aspectRatio);
	}

	get crop() {
		if(!this.cropRect) return null;
		const { x, y, width, height } = this.cropRect;
		return { x: Math.round(x), y: Math.round(y), width: Math.round(width), height: Math.round(height) };
	}

	set crop(rect) {
		if(!this.image || !rect) return;
		this.cropRect = this.fitCrop({ x: rect.x, y: rect.y, width: rect.width, height: rect.height });
		this.commit();
	}

	get outputSize() {
		if(!this.cropRect) return null;
		const { width, height } = this.cropRect;
		const factor = Math.min(
			1,
			this.maxWidth > 0 ? this.maxWidth / width : Infinity,
			this.maxHeight > 0 ? this.maxHeight / height : Infinity
		);
		return { width: Math.max(1, Math.round(width * factor)), height: Math.max(1, Math.round(height * factor)) };
	}

	loadImage = async (source) => {
		if(!source) return this.clear();
		const img = new Image();
		let url = source;
		if(source instanceof Blob){
			url = URL.createObjectURL(source);
		} else if(!/^(blob|data):/.test(source)){
			img.crossOrigin = 'anonymous';
		}
		img.src = url;
		try {
			await img.decode();
		} catch(error) {
			if(source instanceof Blob) URL.revokeObjectURL(url);
			this.dispatchEvent(new CustomEvent('error', { detail: { message: 'The file could not be loaded as an image.' }, bubbles: true }));
			return false;
		}
		this.revokeObjectUrl();
		if(source instanceof Blob) this.#objectUrl = url;
		this.#fileName = source instanceof File ? source.name : '';
		this.image = img;
		this.fitStage();
		this.cropRect = this.fitCrop(null);
		this.dispatchEvent(new CustomEvent('load', { detail: { width: img.naturalWidth, height: img.naturalHeight }, bubbles: true }));
		this.commit();
		return true;
	};

	clear = () => {
		this.revokeObjectUrl();
		this.#fileName = '';
		this.image = null;
		this.cropRect = null;
		this.commit();
	};

	openFilePicker = () => {
		if(!this.disabled) this.shadowRoot.getElementById('file').click();
	};

	getCroppedCanvas = () => {
		if(!this.image) return null;
		const { x, y, width, height } = this.cropRect;
		const size = this.outputSize;
		const canvas = document.createElement('canvas');
		canvas.width = size.width;
		canvas.height = size.height;
		const ctx = canvas.getContext('2d');
		ctx.imageSmoothingQuality = 'high';
		if(this.type === 'image/jpeg'){
			ctx.fillStyle = '#fff';
			ctx.fillRect(0, 0, size.width, size.height);
		}
		ctx.drawImage(this.image, x, y, width, height, 0, 0, size.width, size.height);
		return canvas;
	};

	toBlob = (type = this.type, quality = this.quality) => new Promise(resolve => {
		const canvas = this.getCroppedCanvas();
		if(!canvas) return resolve(null);
		canvas.toBlob(resolve, type, quality);
	});

	toDataURL = (type = this.type, quality = this.quality) => this.getCroppedCanvas()?.toDataURL(type, quality) ?? null;

	toFile = async (fileName) => {
		const blob = await this.toBlob();
		if(!blob) return null;
		const base = (this.#fileName || 'image').replace(/\.[^.]+$/, '');
		return new File([blob], fileName || `${base}-cropped.${EXTENSIONS[blob.type] || 'png'}`, { type: blob.type });
	};

	/*
		Utility Functions
	*/
	revokeObjectUrl = () => {
		if(this.#objectUrl) URL.revokeObjectURL(this.#objectUrl);
		this.#objectUrl = null;
	};

	/*
		Clamps a rect to the image and applies the aspect ratio. With no rect, returns the
		largest centered crop. Coordinates are in natural image pixels.
	*/
	fitCrop = (rect) => {
		const W = this.image.naturalWidth;
		const H = this.image.naturalHeight;
		const ratio = this.ratio;
		let { x, y, width, height } = rect || { x: 0, y: 0, width: W, height: H };
		if(ratio){
			if(rect){
				const cx = x + width / 2;
				const cy = y + height / 2;
				width = Math.min(width, height * ratio);
				height = width / ratio;
				x = cx - width / 2;
				y = cy - height / 2;
			}
			if(width / height > W / H){
				width = Math.min(width, W);
				height = width / ratio;
			} else {
				height = Math.min(height, H);
				width = height * ratio;
			}
			if(width > W){
				width = W;
				height = width / ratio;
			}
			if(height > H){
				height = H;
				width = height * ratio;
			}
			if(!rect){
				x = (W - width) / 2;
				y = (H - height) / 2;
			}
		}
		width = bound(width, 1, W);
		height = bound(height, 1, H);
		return { x: bound(x, 0, W - width), y: bound(y, 0, H - height), width, height };
	};

	fitStage = () => {
		if(!this.image) return;
		const maxHeight = parseFloat(getComputedStyle(this).getPropertyValue('--crop_max_height')) || 480;
		const available = this.clientWidth || this.image.naturalWidth;
		this.scale = Math.min(available / this.image.naturalWidth, maxHeight / this.image.naturalHeight);
	};

	drawStage = () => {
		const canvas = this.shadowRoot.getElementById('canvas');
		if(!canvas || !this.image) return;
		const dpr = window.devicePixelRatio || 1;
		canvas.width = Math.round(this.image.naturalWidth * this.scale * dpr);
		canvas.height = Math.round(this.image.naturalHeight * this.scale * dpr);
		canvas.getContext('2d').drawImage(this.image, 0, 0, canvas.width, canvas.height);
	};

	updateValidity = () => {
		if(this.required && !this.image){
			this.internals.setValidity({ valueMissing: true }, 'Please select an image.', this.shadowRoot.getElementById('upload') || undefined);
		} else {
			this.internals.setValidity({});
		}
	};

	syncFormValue = async () => {
		const token = ++this.#formToken;
		this.updateValidity();
		const file = await this.toFile();
		if(token === this.#formToken) this.internals.setFormValue(file);
	};

	commit = () => {
		this.syncFormValue();
		this.dispatchEvent(new CustomEvent('change', {
			detail: { crop: this.crop, ...(this.outputSize || { width: 0, height: 0 }) },
			bubbles: true
		}));
	};

	/*
		Event Handlers
	*/
	handleFileChange = (e) => {
		const [file] = e.target.files;
		e.target.value = '';
		if(file) this.acceptFile(file);
	};

	acceptFile = (file) => {
		if(!file.type.startsWith('image/')){
			return this.dispatchEvent(new CustomEvent('error', { detail: { message: 'Please choose an image file.' }, bubbles: true }));
		}
		this.loadImage(file);
	};

	handleDragOver = (e) => {
		if(this.disabled || !e.dataTransfer?.types.includes('Files')) return;
		e.preventDefault();
		this.setAttribute('dragover', '');
	};

	handleDragLeave = () => this.removeAttribute('dragover');

	handleDrop = (e) => {
		this.removeAttribute('dragover');
		if(this.disabled || !e.dataTransfer?.files.length) return;
		e.preventDefault();
		this.acceptFile(e.dataTransfer.files[0]);
	};

	handlePointerDown = (e) => {
		if(this.disabled || e.button > 0) return;
		e.preventDefault();
		e.currentTarget.setPointerCapture(e.pointerId);
		this.#drag = { handle: e.target.dataset.handle || 'move', startX: e.clientX, startY: e.clientY, rect: { ...this.cropRect } };
		this.dragging = true;
	};

	handlePointerMove = (e) => {
		if(!this.#drag) return;
		const { handle, startX, startY, rect } = this.#drag;
		const dx = (e.clientX - startX) / this.scale;
		const dy = (e.clientY - startY) / this.scale;
		const W = this.image.naturalWidth;
		const H = this.image.naturalHeight;
		if(handle === 'move'){
			this.cropRect = { ...rect, x: bound(rect.x + dx, 0, W - rect.width), y: bound(rect.y + dy, 0, H - rect.height) };
		} else {
			this.cropRect = this.resizeRect(handle, rect, (handle.includes('w') ? rect.x : rect.x + rect.width) + dx, (handle.includes('n') ? rect.y : rect.y + rect.height) + dy);
		}
	};

	handlePointerUp = () => {
		if(!this.#drag) return;
		this.#drag = null;
		this.dragging = false;
		this.commit();
	};

	handleKeyDown = (e) => {
		const delta = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
		if(!delta || this.disabled) return;
		e.preventDefault();
		const step = (e.ctrlKey || e.metaKey ? 10 : 1) / this.scale;
		const { x, y, width, height } = this.cropRect;
		const W = this.image.naturalWidth;
		const H = this.image.naturalHeight;
		if(e.shiftKey){
			const grown = width + delta[0] * step + delta[1] * step * (this.ratio || width / height);
			const next = this.ratio ? { width: grown, height: grown / this.ratio } : { width: width + delta[0] * step, height: height + delta[1] * step };
			this.cropRect = this.fitCrop({ x, y, ...next });
		} else {
			this.cropRect = { x: bound(x + delta[0] * step, 0, W - width), y: bound(y + delta[1] * step, 0, H - height), width, height };
		}
		this.commit();
	};

	/*
		Resizes `rect` by dragging `handle` to the pointer position (px, py) in natural pixels,
		respecting the image bounds, a minimum size and the aspect ratio when one is set.
	*/
	resizeRect = (handle, rect, px, py) => {
		const W = this.image.naturalWidth;
		const H = this.image.naturalHeight;
		const ratio = this.ratio;
		const min = MIN_DISPLAY_SIZE / this.scale;
		const left = handle.includes('w');
		const right = handle.includes('e');
		const top = handle.includes('n');
		const bottom = handle.includes('s');
		const x2 = rect.x + rect.width;
		const y2 = rect.y + rect.height;
		if(!ratio){
			const nx1 = left ? bound(px, 0, x2 - min) : rect.x;
			const nx2 = right ? bound(px, rect.x + min, W) : x2;
			const ny1 = top ? bound(py, 0, y2 - min) : rect.y;
			const ny2 = bottom ? bound(py, rect.y + min, H) : y2;
			return { x: nx1, y: ny1, width: nx2 - nx1, height: ny2 - ny1 };
		}
		const ax = left ? x2 : right ? rect.x : rect.x + rect.width / 2;
		const ay = top ? y2 : bottom ? rect.y : rect.y + rect.height / 2;
		const horizontal = left || right;
		const vertical = top || bottom;
		const roomX = horizontal ? (left ? ax : W - ax) : 2 * Math.min(ax, W - ax);
		const roomY = vertical ? (top ? ay : H - ay) : 2 * Math.min(ay, H - ay);
		const wantW = horizontal ? Math.abs(px - ax) : 0;
		const wantH = vertical ? Math.abs(py - ay) : 0;
		const width = bound(Math.max(wantW, wantH * ratio), min, Math.max(min, Math.min(roomX, roomY * ratio)));
		const height = width / ratio;
		return {
			x: left ? ax - width : right ? ax : ax - width / 2,
			y: top ? ay - height : bottom ? ay : ay - height / 2,
			width,
			height
		};
	};

	/*
		Rendering
	*/
	renderEmpty() {
		return html`
			<div id="dropzone">
				<k-icon name="image" class="dropzone-icon"></k-icon>
				<button id="upload" type="button" ?disabled=${this.disabled} @click=${this.openFilePicker}>${this.label}</button>
				<span class="placeholder">${this.placeholder}</span>
			</div>
		`;
	}

	renderCropper() {
		const { x, y, width, height } = this.cropRect;
		const s = this.scale;
		return html`
			<div id="stage" style="width:${this.image.naturalWidth * s}px;height:${this.image.naturalHeight * s}px">
				<canvas id="canvas"></canvas>
				<div
					id="box"
					class=${this.dragging ? 'dragging' : ''}
					tabindex=${this.disabled ? -1 : 0}
					role="group"
					aria-label="Crop area"
					style="left:${x * s}px;top:${y * s}px;width:${width * s}px;height:${height * s}px"
					@pointerdown=${this.handlePointerDown}
					@pointermove=${this.handlePointerMove}
					@pointerup=${this.handlePointerUp}
					@pointercancel=${this.handlePointerUp}
					@keydown=${this.handleKeyDown}
				>
					${HANDLES.map(handle => html`<span class="handle ${handle}" data-handle=${handle}></span>`)}
				</div>
			</div>
			<div id="bar">
				<span id="size">${this.outputSize.width} &times; ${this.outputSize.height}</span>
				<span class="spacer"></span>
				<button type="button" class="mr" ?disabled=${this.disabled} @click=${this.openFilePicker}>Change</button>
				<button type="button" class="danger" ?disabled=${this.disabled} @click=${this.clear}>Remove</button>
			</div>
		`;
	}

	render() {
		return html`
			<div
				id="root"
				@dragover=${this.handleDragOver}
				@dragleave=${this.handleDragLeave}
				@drop=${this.handleDrop}
			>
				<input id="file" type="file" accept="image/*" hidden @change=${this.handleFileChange} />
				${this.image && this.cropRect ? this.renderCropper() : this.renderEmpty()}
			</div>
		`;
	}

	static styles = css`
		:host {
			--crop_max_height: 480;
			--crop_color: var(--c_primary);
			--crop_handle_size: 0.875rem;
			display: block;
		}
		:host([disabled]) {
			opacity: 0.5;
			pointer-events: none;
		}
		#file {
			display: none;
		}
		#dropzone {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: var(--spacer_h);
			padding: calc(var(--spacer) * 2) var(--spacer);
			border: 2px dashed var(--c_border);
			border-radius: var(--radius);
			text-align: center;
		}
		:host([dragover]) #dropzone {
			border-color: var(--crop_color);
			background: color-mix(in srgb, var(--crop_color) 10%, transparent);
		}
		.dropzone-icon {
			font-size: 2.5rem;
			color: var(--tc_muted);
		}
		.placeholder {
			color: var(--tc_muted);
		}
		#stage {
			position: relative;
			overflow: hidden;
			max-width: 100%;
			margin: 0 auto;
			border-radius: var(--radius);
			background: repeating-conic-gradient(var(--c_border) 0% 25%, transparent 0% 50%) 0 0 / 16px 16px;
			user-select: none;
			-webkit-user-select: none;
		}
		#canvas {
			display: block;
			width: 100%;
			height: 100%;
		}
		#box {
			position: absolute;
			box-sizing: border-box;
			border: 2px solid var(--crop_color);
			box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.55);
			cursor: move;
			touch-action: none;
			outline: none;
			background:
				linear-gradient(to right, transparent calc(33.33% - 0.5px), rgba(255, 255, 255, 0.4) calc(33.33% - 0.5px) calc(33.33% + 0.5px), transparent calc(33.33% + 0.5px) calc(66.66% - 0.5px), rgba(255, 255, 255, 0.4) calc(66.66% - 0.5px) calc(66.66% + 0.5px), transparent calc(66.66% + 0.5px)),
				linear-gradient(to bottom, transparent calc(33.33% - 0.5px), rgba(255, 255, 255, 0.4) calc(33.33% - 0.5px) calc(33.33% + 0.5px), transparent calc(33.33% + 0.5px) calc(66.66% - 0.5px), rgba(255, 255, 255, 0.4) calc(66.66% - 0.5px) calc(66.66% + 0.5px), transparent calc(66.66% + 0.5px));
		}
		#box:focus-visible {
			box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.55), 0 0 0 2px var(--c_bg), 0 0 0 4px var(--crop_color);
		}
		.handle {
			position: absolute;
			width: var(--crop_handle_size);
			height: var(--crop_handle_size);
			box-sizing: border-box;
			border: 2px solid var(--crop_color);
			border-radius: 50%;
			background: var(--c_bg);
			touch-action: none;
		}
		.handle.nw { left: 0; top: 0; cursor: nwse-resize; transform: translate(0, 0); }
		.handle.n { left: 50%; top: 0; cursor: ns-resize; transform: translate(-50%, 0); }
		.handle.ne { left: 100%; top: 0; cursor: nesw-resize; transform: translate(-100%, 0); }
		.handle.e { left: 100%; top: 50%; cursor: ew-resize; transform: translate(-100%, -50%); }
		.handle.se { left: 100%; top: 100%; cursor: nwse-resize; transform: translate(-100%, -100%); }
		.handle.s { left: 50%; top: 100%; cursor: ns-resize; transform: translate(-50%, -100%); }
		.handle.sw { left: 0; top: 100%; cursor: nesw-resize; transform: translate(0, -100%); }
		.handle.w { left: 0; top: 50%; cursor: ew-resize; transform: translate(0, -50%); }
		#bar {
			display: flex;
			align-items: center;
			margin-top: var(--spacer_h);
		}
		#size {
			color: var(--tc_muted);
			font-variant-numeric: tabular-nums;
		}
		.spacer {
			flex: 1;
		}
	`;
}

window.customElements.define('k-image-crop', ImageCrop);
