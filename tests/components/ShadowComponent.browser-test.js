import ShadowComponent from '../../src/components/ShadowComponent.js';
import { html } from '../../src/lit-all.min.js';

class TestShadowComponent extends ShadowComponent {
	render() {
		return html`<p>Test shadow content</p>`;
	}
}

customElements.define('test-shadow-component', TestShadowComponent);

export default {
	'should create shadow root with stylesheet': async ({pass, fail, log}) => {
		const component = new TestShadowComponent();
		document.body.appendChild(component);
		
		await new Promise(resolve => setTimeout(resolve, 0));
		
		if(!component.shadowRoot) {
			document.body.removeChild(component);
			fail('Component should have shadow root');
			return;
		}
		
		const stylesheetLink = component.shadowRoot.querySelector('link[href="./kempo.min.css"]');
		if(!stylesheetLink) {
			document.body.removeChild(component);
			fail('Shadow root should contain kempo.min.css link');
			return;
		}
		
		if(stylesheetLink.rel !== 'stylesheet') {
			document.body.removeChild(component);
			fail('Link should have rel="stylesheet"');
			return;
		}
		
		log('✓ Shadow root created with proper stylesheet');
		document.body.removeChild(component);
		pass('ShadowComponent creates shadow root with stylesheet injection');
	},

	'should have render container as render root': async ({pass, fail, log}) => {
		const component = new TestShadowComponent();
		document.body.appendChild(component);
		
		await new Promise(resolve => setTimeout(resolve, 0));
		
		const renderRoot = component.renderRoot;
		if(!renderRoot) {
			document.body.removeChild(component);
			fail('Component should have render root');
			return;
		}
		
		if(renderRoot.tagName !== 'DIV') {
			document.body.removeChild(component);
			fail('Render root should be a div element');
			return;
		}
		
		if(renderRoot.parentNode !== component.shadowRoot) {
			document.body.removeChild(component);
			fail('Render root should be child of shadow root');
			return;
		}
		
		log('✓ Render root is properly configured div element');
		document.body.removeChild(component);
		pass('ShadowComponent has proper render container setup');
	},

	'should render content inside render container': async ({pass, fail, log}) => {
		const component = new TestShadowComponent();
		document.body.appendChild(component);
		
		await new Promise(resolve => setTimeout(resolve, 10));
		
		const paragraph = component.renderRoot.querySelector('p');
		if(!paragraph) {
			document.body.removeChild(component);
			fail('Component should render paragraph element');
			return;
		}
		
		if(paragraph.textContent !== 'Test shadow content') {
			document.body.removeChild(component);
			fail(`Expected "Test shadow content", got "${paragraph.textContent}"`);
			return;
		}
		
		log('✓ Content rendered properly inside render container');
		document.body.removeChild(component);
		pass('ShadowComponent renders content correctly');
	},

	'should maintain stylesheet after re-rendering': async ({pass, fail, log}) => {
		const component = new TestShadowComponent();
		document.body.appendChild(component);
		
		await new Promise(resolve => setTimeout(resolve, 0));
		
		const stylesheetBefore = component.shadowRoot.querySelector('link[href="./kempo.min.css"]');
		if(!stylesheetBefore) {
			document.body.removeChild(component);
			fail('Stylesheet should exist before re-render');
			return;
		}
		
		component.requestUpdate();
		await component.updateComplete;
		
		const stylesheetAfter = component.shadowRoot.querySelector('link[href="./kempo.min.css"]');
		if(!stylesheetAfter) {
			document.body.removeChild(component);
			fail('Stylesheet should persist after re-render');
			return;
		}
		
		if(stylesheetBefore !== stylesheetAfter) {
			document.body.removeChild(component);
			fail('Stylesheet should be the same element after re-render');
			return;
		}
		
		log('✓ Stylesheet persists through re-renders');
		document.body.removeChild(component);
		pass('ShadowComponent maintains stylesheet across updates');
	}
};
