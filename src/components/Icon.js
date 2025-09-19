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
	const tryDir = async (dir) => getIconByPath(`${dir}/${name}.svg`);

	return new Promise(async (resolve, reject) => {
		let svg;
		for(let i = 0; i < Icon.pathToIcons.length && !svg; i++){
			try {
				svg = await tryDir(Icon.pathToIcons[i]);
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
	/*
		Properties
	*/
	static properties = {
		src: { type: String, reflect: true },
		name: { type: String, reflect: true },
		iconContent: { type: String }
	};

	constructor(name = '') {
		super();
		this.src = '';
		this.name = name;
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

		if (changedProperties.has('iconContent')) {
			this.fixSVG();
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
			this.iconContent = svg;
		} else {
			// Check for slotted fallback content first
			const slottedContent = this.innerHTML.trim();
			if (slottedContent) {
				this.iconContent = slottedContent;
			} else {
				this.iconContent = Icon.fallback;
			}
		}
	}

	fixSVG() {
		// Use setTimeout to ensure DOM is updated
		setTimeout(() => {
			const $svg = this.querySelector('svg');
			if ($svg) {
				$svg.removeAttribute('width');
				$svg.removeAttribute('height');
				$svg.querySelectorAll('path, rect, circle').forEach($path => {
					$path.setAttribute('fill', 'currentColor');
				});
			}
		}, 0);
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
	`;

	/*
		Rendering
	*/
	render() {
		if (!this.iconContent) {
			// Show slotted content while loading
			return html`<slot></slot>`;
		}
		
		return html`${unsafeHTML(this.iconContent)}`;
	}

	/*
		Static Properties
	*/
	static pathToIcons = [
		'/icons'
	];

	static fallback = `
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path fill="currentColor" d="M480-79q-16 0-30.5-6T423-102L102-423q-11-12-17-26.5T79-480q0-16 6-31t17-26l321-321q12-12 26.5-17.5T480-881q16 0 31 5.5t26 17.5l321 321q12 11 17.5 26t5.5 31q0 16-5.5 30.5T858-423L537-102q-11 11-26 17t-31 6Zm0-80 321-321-321-321-321 321 321 321Zm-40-281h80v-240h-80v240Zm40 120q17 0 28.5-11.5T520-360q0-17-11.5-28.5T480-400q-17 0-28.5 11.5T440-360q0 17 11.5 28.5T480-320Zm0-160Z"/></svg>
	`;
}

window.customElements.define('k-icon', Icon);
