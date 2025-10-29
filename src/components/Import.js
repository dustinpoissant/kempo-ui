import LightComponent from './LightComponent.js';
import { html, render, unsafeHTML } from '../lit-all.min.js';

export default class Import extends LightComponent {
	/* Properties */
	static properties = {
		src: {
			type: String,
			reflect: true
		},
		content: {
			type: String
		},
		scripts: {
			type: Array
		}
	}

	static replacements = {}
	constructor(){
		super();
		this.src = '';
		this.content = '';
		this.scripts = [];
	}

	/*
		Lifecycle Callbacks
	*/
	updated(changedProperties){
		super.updated(); // Important: call super for LightComponent
		
		if(changedProperties.has('src')){
			this.fetch();
		}
		
		if(changedProperties.has('content') && this.scripts.length > 0){
			// Execute scripts after DOM content is rendered
			setTimeout(() => this.executeScripts(), 0);
		}
	}

	/*
		Methods
	*/
	async fetch(){
		let contents = await (await fetch(this.src)).text();
		for (const [name, value] of Object.entries(Import.replacements)) {
			contents = contents.replace(new RegExp(`%%${name}%%`, 'g'), value);
		}
		
		// Parse the HTML to extract scripts
		const parser = new DOMParser();
		const doc = parser.parseFromString(contents, 'text/html');
		const scriptElements = doc.querySelectorAll('script');
		
		// Extract script sources and inline code
		this.scripts = Array.from(scriptElements).map(script => ({
			src: script.src,
			text: script.textContent,
			type: script.type || 'text/javascript'
		}));
		
		// Remove script tags from the content
		scriptElements.forEach(script => script.remove());
		
		// Serialize back to string without scripts - use the entire body content
		this.content = doc.body ? doc.body.innerHTML : contents;
	}

	executeScripts(){
		this.scripts.forEach(script => {
			const scriptElement = document.createElement('script');
			scriptElement.type = script.type;
			
			if (script.src) {
				scriptElement.src = script.src;
			} else if (script.text) {
				scriptElement.textContent = script.text;
			}
			
			// Append to head to execute
			document.head.appendChild(scriptElement);
		});
		
		// Clear scripts after execution to avoid re-execution
		this.scripts = [];
	}

	/*
		Rendering
	*/
	renderLightDom() {
		if (!this.content) {
			return html``;
		}
		
		// Use unsafeHTML to render the actual HTML content
		return html`${unsafeHTML(this.content)}`;
	}
}
window.customElements.define('k-import', Import);
