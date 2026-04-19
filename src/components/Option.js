export default class Option extends HTMLElement {
	static get observedAttributes() {
		return ['value'];
	}

	get value() {
		return this.getAttribute('value') ?? this.textContent.trim();
	}

	set value(v) {
		this.setAttribute('value', v);
	}

	get label() {
		return this.textContent.trim();
	}
}

customElements.define('k-option', Option);
