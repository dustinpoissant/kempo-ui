import ShadowComponent from './ShadowComponent.js';
import { html, css, unsafeHTML } from '../lit-all.min.js';

const cache = {};

const getIconByPath = async (path) => {
	if (!cache[path]) {
		cache[path] = new Promise(async (resolve, reject) => {
			const controller = new AbortController();
			const signal = controller.signal;
			try {
				const response = await fetch(path, { signal });
				if (response.status === 200) {
					resolve(await response.text());
				} else if (response.status === 404) {
					resolve(null);
				}
			} catch (e) {
				if (e.name !== 'AbortError') {
					reject(e);
				}
			}
		}).catch(() => null);
	}
	return await cache[path];
};

const getIconByName = (name) => {
	const tryDir = async (dir) => {
		// Ensure single slash between dir and filename
		const normalizedDir = dir.endsWith('/') ? dir.slice(0, -1) : dir;
		return getIconByPath(`${normalizedDir}/${name}.svg`);
	};

	return new Promise(async (resolve, reject) => {
		let svg;
		const pathsToCheck = window.kempo?.pathsToIcons || ['/icons', '../../icons', 'https://cdn.jsdelivr.net/npm/kempo-ui@0.0.32/icons/'];
		for(let i = 0; i < pathsToCheck.length && !svg; i++){
			try {
				svg = await tryDir(pathsToCheck[i]);
			} catch(e){}
		}
		if(svg){
			resolve(svg);
		} else {
			resolve(null);
		}
	});
};

export default class Icon extends ShadowComponent {
	/* Properties */
	static properties = {
		src: { type: String, reflect: true },
		name: { type: String, reflect: true },
		rotation: { type: String, reflect: true },
		direction: { type: String, reflect: true },
		animation: { type: String, reflect: true },
		iconContent: { type: String }
	};

	constructor(name = '') {
		super();
		this.src = '';
		this.name = name;
		this.rotation = '';
		this.direction = '';
		this.animation = '';
		this.iconContent = '';
	}

	/*
		Lifecycle Callbacks
	*/
	updated(changedProperties) {
		super.updated();
		
		if (changedProperties.has('src') || changedProperties.has('name')) {
			this.loadIcon();
		}
	}

	/*
		Methods
	*/
	async loadIcon() {
		let svg;
		
		if (this.src) {
			svg = await getIconByPath(this.src);
		} else if (this.name) {
			svg = await getIconByName(this.name);
		}
		
		if (svg) {
			this.iconContent = this.fixSVG(svg);
		} else {
			const slottedContent = this.innerHTML.trim();
			if (slottedContent) {
				this.iconContent = this.fixSVG(slottedContent);
			} else {
				this.iconContent = window.kempo?.fallbackIcon || `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path fill="currentColor" d="M480-79q-16 0-30.5-6T423-102L102-423q-11-12-17-26.5T79-480q0-16 6-31t17-26l321-321q12-12 26.5-17.5T480-881q16 0 31 5.5t26 17.5l321 321q12 11 17.5 26t5.5 31q0 16-5.5 30.5T858-423L537-102q-11 11-26 17t-31 6Zm0-80 321-321-321-321-321 321 321 321Zm-40-281h80v-240h-80v240Zm40 120q17 0 28.5-11.5T520-360q0-17-11.5-28.5T480-400q-17 0-28.5 11.5T440-360q0 17 11.5 28.5T480-320Zm0-160Z"/></svg>`;;
			}
		}
	}

	fixSVG(svgString) {
		if(!svgString) return svgString;
		
		// Parse the SVG string and fix attributes
		const parser = new DOMParser();
		const doc = parser.parseFromString(svgString, 'image/svg+xml');
		const $svg = doc.querySelector('svg');
		
		if($svg) {
			// Remove width and height attributes
			$svg.removeAttribute('width');
			$svg.removeAttribute('height');
			
			// Set fill to currentColor on all paths, rects, and circles
			$svg.querySelectorAll('path, rect, circle').forEach($el => {
				$el.setAttribute('fill', 'currentColor');
			});
			
			// Return the fixed SVG as a string
			return new XMLSerializer().serializeToString($svg);
		}
		
		return svgString;
	}

	/*
		Utility Methods
	*/
	getRotationDegrees() {
		if(this.rotation) return this.rotation;
		
		const directionMap = {
			'down': '90',
			'left': '180',
			'up': '270'
		};
		
		return directionMap[this.direction] || '0';
	}

	/*
		Styles
	*/
	static styles = css`
		:host {
			display: inline-block;
			vertical-align: bottom;
		}
		::slotted(svg), svg {
			height: 1.35em;
			vertical-align: middle;
		}
		
		/* Rotation */
		:host([rotation]) svg,
		:host([direction]) svg {
			transform: rotate(var(--icon-rotation, 0deg));
		}
		
		/* Animations */
		:host([animation="spin"]) svg {
			animation: icon-spin 2s linear infinite;
		}
		:host([animation="blink"]) svg {
			animation: icon-blink 1s ease-in-out infinite;
		}
		:host([animation="pulse"]) svg {
			animation: icon-pulse 1.5s ease-in-out infinite;
		}
		
		@keyframes icon-spin {
			from { transform: rotate(0deg); }
			to { transform: rotate(360deg); }
		}
		
		@keyframes icon-blink {
			0%, 100% { opacity: 1; }
			50% { opacity: 0.2; }
		}
		
		@keyframes icon-pulse {
			0%, 100% { transform: scale(1); }
			50% { transform: scale(1.2); }
		}
	`;

	/*
		Rendering
	*/
	render() {
		const rotationDegrees = this.getRotationDegrees();
		const style = rotationDegrees !== '0' ? `--icon-rotation: ${rotationDegrees}deg;` : '';
		
		if (!this.iconContent) {
			// Show slotted content while loading
			return html`<div style="${style}"><slot></slot></div>`;
		}
		
		return html`<div style="${style}">${unsafeHTML(this.iconContent)}</div>`;
	}
}

window.customElements.define('k-icon', Icon);
