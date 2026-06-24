import ShadowComponent from './ShadowComponent.js';
import { html, css, render } from '../lit-all.min.js';
import { boolExists } from '../utils/propConverters.js';
import './Icon.js';

export default class PhotoViewer extends ShadowComponent {
	/* Properties */
	static properties = {
		src: { type: String, reflect: true },
		alt: { type: String, reflect: true },
		fullscreen: { type: Boolean, reflect: true, converter: boolExists },
		keyboardControls: { type: Boolean, reflect: true, attribute: 'keyboard-controls', converter: boolExists },
		global: { type: Boolean, reflect: true, converter: boolExists }
	};

	constructor() {
		super();
		this.src = '';
		this.alt = '';
		this.fullscreen = false;
		this.keyboardControls = true;
		this.global = false;
	}

	/*
		Event Handlers
	*/
	handleImageClick = () => {
		this.open();
	}

	handleImageKeydown = event => {
		if(event.key === 'Enter' && !this.fullscreen) {
			this.open();
		}
	}

	handleCloseClick = () => {
		this.close();
	}

	handleOverlayClick = event => {
		if(event.target === event.currentTarget) {
			this.close();
		}
	}

	handlePrevClick = event => {
		event.stopPropagation();
		const prev = this.getPrevSibling();
		if(prev) {
			this.close();
			prev.open();
		}
	}

	handleNextClick = event => {
		event.stopPropagation();
		const next = this.getNextSibling();
		if(next) {
			this.close();
			next.open();
		}
	}

	handleKeydown = event => {
		if(event.key === 'Escape') {
			this.close();
		} else if(event.key === 'ArrowLeft') {
			const prev = this.getPrevSibling();
			if(prev) {
				this.close();
				prev.open();
			}
		} else if(event.key === 'ArrowRight') {
			const next = this.getNextSibling();
			if(next) {
				this.close();
				next.open();
			}
		}
	}

	/*
		Lifecycle Callbacks
	*/
	connectedCallback() {
		super.connectedCallback();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		if(this.keyboardControls) {
			document.removeEventListener('keydown', this.handleKeydown);
		}
	}

	updated(changedProperties) {
		super.updated(changedProperties);
		
		if(changedProperties.has('fullscreen')) {
			this.dispatchEvent(new CustomEvent(`fullscreenchange`, {
				detail: { fullscreen: this.fullscreen }
			}));
			this.dispatchEvent(new CustomEvent(this.fullscreen ? 'fullscreen' : 'fullscreenclose'));
			this.updateNavigationState();
			
			if(this.keyboardControls) {
				if(this.fullscreen) {
					document.addEventListener('keydown', this.handleKeydown);
				} else {
					document.removeEventListener('keydown', this.handleKeydown);
				}
			}
		}

		if(changedProperties.has('src') || changedProperties.has('alt')) {
			this.handleFullscreenCaption();
		}
	}

	firstUpdated() {
		this.handleFullscreenCaption();
	}

	/*
		Public Methods
	*/
	open() {
		this.fullscreen = true;
	}

	close() {
		this.fullscreen = false;
	}

	toggle() {
		this.fullscreen = !this.fullscreen;
	}

	/*
		Static Methods
	*/
	static open(content, openIndex = 0, options = {}) {
		const { keyboardControls = true, onClose } = options;

		const container = document.createElement('div');
		container.style.position = 'fixed';
		container.style.top = '0';
		container.style.left = '0';
		container.style.width = '0';
		container.style.height = '0';
		container.style.overflow = 'hidden';
		container.style.zIndex = '80';

		const viewers = content.map(item => {
			const viewer = document.createElement('k-photo-viewer');
			viewer.src = item.src;
			viewer.alt = item.alt || '';
			viewer.keyboardControls = keyboardControls;
			if(item.caption !== undefined) {
				if(typeof item.caption === 'string') {
					viewer.innerHTML = item.caption;
				} else {
					render(item.caption, viewer);
				}
			}
			container.appendChild(viewer);
			return viewer;
		});

		const mountRoot = document.querySelector('[data-overlay-root]') || document.body;
		mountRoot.appendChild(container);

		const handleClose = () => {
			if(!viewers.some(viewer => viewer.fullscreen)) {
				viewers.forEach(viewer => viewer.removeEventListener('fullscreenclose', handleClose));
				container.remove();
				onClose?.();
			}
		};
		viewers.forEach(viewer => viewer.addEventListener('fullscreenclose', handleClose));

		const startIndex = Math.min(Math.max(openIndex, 0), viewers.length - 1);
		viewers[startIndex].open();

		return viewers[startIndex];
	}

	/*
		Private Methods
	*/
	getPrevSibling() {
		if(this.global) {
			const viewers = Array.from(document.getElementsByTagName('k-photo-viewer'));
			const index = viewers.indexOf(this);
			if(index === -1) return null;
			return viewers[index === 0 ? viewers.length - 1 : index - 1];
		} else {
			let prev = this.previousElementSibling;
			while(prev && prev.tagName !== 'K-PHOTO-VIEWER') {
				prev = prev.previousElementSibling;
			}
			if(!prev && this.hasPhotoSiblings()) {
				prev = this.parentElement.lastElementChild;
				while(prev && prev.tagName !== 'K-PHOTO-VIEWER') {
					prev = prev.previousElementSibling;
				}
			}
			return prev;
		}
	}

	getNextSibling() {
		if(this.global) {
			const viewers = Array.from(document.getElementsByTagName('k-photo-viewer'));
			const index = viewers.indexOf(this);
			if(index === -1) return null;
			return viewers[index === viewers.length - 1 ? 0 : index + 1];
		} else {
			let next = this.nextElementSibling;
			while(next && next.tagName !== 'K-PHOTO-VIEWER') {
				next = next.nextElementSibling;
			}
			if(!next && this.hasPhotoSiblings()) {
				next = this.parentElement.firstElementChild;
				while(next && next.tagName !== 'K-PHOTO-VIEWER') {
					next = next.nextElementSibling;
				}
			}
			return next;
		}
	}

	hasPhotoSiblings() {
		if(this.global) {
			return document.getElementsByTagName('k-photo-viewer').length > 1;
		}
		return Array.from(this.parentElement.children)
			.filter(el => el !== this && el.tagName === 'K-PHOTO-VIEWER')
			.length > 0;
	}

	updateNavigationState() {
		const hasNavigation = this.fullscreen && this.hasPhotoSiblings();
		const navButtons = this.shadowRoot.querySelectorAll('.nav-btn');
		navButtons.forEach(btn => {
			btn.style.display = hasNavigation ? '' : 'none';
		});
	}

	async handleFullscreenCaption() {
		await this.updateComplete;
		const fullscreenSlot = this.shadowRoot.querySelector('slot[name="fullscreen-caption"]');
		if(fullscreenSlot && !fullscreenSlot.assignedNodes().length) {
			const defaultSlot = this.shadowRoot.querySelector('slot:not([name])');
			const contents = defaultSlot ? defaultSlot.assignedNodes() : [];
			contents.forEach(node => {
				if(node.nodeType === Node.ELEMENT_NODE) {
					const clone = node.cloneNode(true);
					clone.slot = 'fullscreen-caption';
					this.appendChild(clone);
				}
			});
		}
	}

	/*
		Styles
	*/
	static styles = css`
		:host {
			display: block;
		}
		#wrapper {
			position: relative;
			width: 100%;
			height: 100%;
		}
		#img {
			max-width: 100%;
			height: auto;
			cursor: pointer;
			outline: none;
			border-radius: var(--img_radius, 0);
		}
		#img:focus {
			box-shadow: var(--focus_shadow);
		}
		#fullscreen-overlay {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			z-index: 80;
			background: rgba(0,0,0,0.9);
			padding: 2rem;
			display: none;
		}
		:host([fullscreen]) #fullscreen-overlay {
			display: flex;
			align-items: center;
			justify-content: center;
		}
		.content {
			position: relative;
			max-width: 100%;
			max-height: 90vh;
		}
		#fullscreen-img {
			max-height: 75vh;
			max-width: 100%;
			object-fit: contain;
			cursor: default;
		}
		#close {
			position: absolute;
			top: 1rem;
			right: 1rem;
			z-index: 1;
			background: none;
			border: none;
			color: white;
			cursor: pointer;
		}
		.nav-btn {
			position: fixed;
			top: 50%;
			transform: translateY(-50%);
			z-index: 1;
			background: none;
			border: none;
			color: white;
			cursor: pointer;
			padding: 1rem;
			opacity: 0.7;
			font-size: 3rem;
			-webkit-text-stroke: 1px black;
			text-stroke: 1px black;
			text-shadow: 0 0 3px rgba(0,0,0,0.8);
		}
		.nav-btn::slotted(*),
		.nav-btn k-icon {
			filter: drop-shadow(0 0 2px rgba(0,0,0,1)) drop-shadow(0 0 2px rgba(0,0,0,1));
		}
		.nav-btn:hover {
			opacity: 1;
		}
		#prev {
			left: 1rem;
		}
		#next {
			right: 1rem;
		}
		.caption {
			text-align: center;
			max-width: 600px;
			width: fit-content;
			margin: 1rem auto 0;
		}
		#fullscreen-overlay .caption {
			color: white;
		}
		:host([fullscreen]) .caption {
			color: white;
		}
	`;

	/*
		Rendering
	*/
	render() {
		return html`
			<div id="wrapper">
				<img 
					id="img" 
					src="${this.src}" 
					alt="${this.alt}" 
					tabindex="0"
					@click=${this.handleImageClick}
					@keydown=${this.handleImageKeydown}
				/>
				<div class="caption">
					<slot></slot>
				</div>
				<div id="fullscreen-overlay" @click=${this.handleOverlayClick}>
					<button id="close" class="no-btn" @click=${this.handleCloseClick}>
						<slot name="close">
							<k-icon name="close"></k-icon>
						</slot>
					</button>
					<button id="prev" class="nav-btn no-btn" @click=${this.handlePrevClick}>
						<slot name="prev">
							<k-icon name="chevron" direction="left"></k-icon>
						</slot>
					</button>
					<button id="next" class="nav-btn no-btn" @click=${this.handleNextClick}>
						<slot name="next">
							<k-icon name="chevron"></k-icon>
						</slot>
					</button>
					<div class="content">
						<img id="fullscreen-img" src="${this.src}" alt="${this.alt}" />
						<div class="caption">
							<slot name="fullscreen-caption"></slot>
						</div>
					</div>
				</div>
			</div>
		`;
	}
}

customElements.define('k-photo-viewer', PhotoViewer);
