import { LitElement } from '../lit-all.min.js';

export default class ShadowComponent extends LitElement {

    #childrenObserver;

    connectedCallback() {
        super.connectedCallback();

        this.#childrenObserver = new MutationObserver(() => {
            this.childrenUpdated();
            this.requestUpdate();
        });

        this.#childrenObserver.observe(this, {
            childList: true,
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.#childrenObserver?.disconnect();
    }

    childrenUpdated() {}

    createRenderRoot() {
        const shadowRoot = this.attachShadow({ mode: 'open' });
        
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = window.kempo?.pathToStylesheet || 'https://cdn.jsdelivr.net/npm/kempo-css@2/dist/kempo.min.css';
        shadowRoot.appendChild(link);
        
        // Inject component styles if they exist
        const styles = this.constructor.styles;
        if (styles) {
            const styleEl = document.createElement('style');
            if (Array.isArray(styles)) {
                styleEl.textContent = styles.map(s => s.cssText || s).join('\n');
            } else {
                styleEl.textContent = styles.cssText || styles;
            }
            shadowRoot.appendChild(styleEl);
        }
        
        const renderContainer = document.createElement('div');
        renderContainer.style.display = 'contents';
        shadowRoot.appendChild(renderContainer);
        
        return renderContainer;
    }
}
