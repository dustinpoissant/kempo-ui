import { LitElement } from '../lit-all.min.js';

export default class ShadowComponent extends LitElement {
    createRenderRoot() {
        const shadowRoot = this.attachShadow({ mode: 'open' });
        
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/kempo.min.css';
        shadowRoot.appendChild(link);
        
        const renderContainer = document.createElement('div');
        shadowRoot.appendChild(renderContainer);
        
        return renderContainer;
    }
}
