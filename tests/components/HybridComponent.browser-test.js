import HybridComponent from '../../src/components/HybridComponent.js';
import { html } from '../../src/lit-all.min.js';

class TestHybridComponent extends HybridComponent {
	render() {
		return html`<p>Shadow content</p>`;
	}
	
	renderLightDom() {
		return html`<span>Light content</span>`;
	}
}

customElements.define('test-hybrid-component', TestHybridComponent);

export default {
	'should inherit shadow root with stylesheet from ShadowComponent': async ({pass, fail, log}) => {
		const component = new TestHybridComponent();
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
		
		log('✓ Inherited shadow root with stylesheet from ShadowComponent');
		document.body.removeChild(component);
		pass('HybridComponent inherits ShadowComponent functionality');
	},

	'should create light root for light DOM rendering': async ({pass, fail, log}) => {
		const component = new TestHybridComponent();
		document.body.appendChild(component);
		
		await new Promise(resolve => setTimeout(resolve, 0));
		
		if(!component.lightRoot) {
			document.body.removeChild(component);
			fail('Component should have lightRoot property');
			return;
		}
		
		if(component.lightRoot.tagName !== 'DIV') {
			document.body.removeChild(component);
			fail('lightRoot should be a div element');
			return;
		}
		
		if(component.lightRoot.style.display !== 'contents') {
			document.body.removeChild(component);
			fail('lightRoot should have display: contents');
			return;
		}
		
		if(component.lightRoot.slot !== 'lightRoot') {
			document.body.removeChild(component);
			fail('lightRoot should have slot="lightRoot"');
			return;
		}
		
		log('✓ Light root properly configured for hybrid rendering');
		document.body.removeChild(component);
		pass('HybridComponent creates proper light root');
	},

	'should render shadow DOM content': async ({pass, fail, log}) => {
		const component = new TestHybridComponent();
		document.body.appendChild(component);
		
		await new Promise(resolve => setTimeout(resolve, 10));
		
		const shadowParagraph = component.renderRoot.querySelector('p');
		if(!shadowParagraph) {
			document.body.removeChild(component);
			fail('Shadow DOM should contain paragraph element');
			return;
		}
		
		if(shadowParagraph.textContent !== 'Shadow content') {
			document.body.removeChild(component);
			fail(`Expected "Shadow content", got "${shadowParagraph.textContent}"`);
			return;
		}
		
		log('✓ Shadow DOM content rendered correctly');
		document.body.removeChild(component);
		pass('HybridComponent renders shadow DOM content');
	},

	'should render light DOM content': async ({pass, fail, log}) => {
		const component = new TestHybridComponent();
		document.body.appendChild(component);
		
		await new Promise(resolve => setTimeout(resolve, 10));
		
		const lightSpan = component.lightRoot.querySelector('span');
		if(!lightSpan) {
			document.body.removeChild(component);
			fail('Light DOM should contain span element');
			return;
		}
		
		if(lightSpan.textContent !== 'Light content') {
			document.body.removeChild(component);
			fail(`Expected "Light content", got "${lightSpan.textContent}"`);
			return;
		}
		
		log('✓ Light DOM content rendered correctly');
		document.body.removeChild(component);
		pass('HybridComponent renders light DOM content');
	},

	'should render both shadow and light DOM simultaneously': async ({pass, fail, log}) => {
		const component = new TestHybridComponent();
		document.body.appendChild(component);
		
		await new Promise(resolve => setTimeout(resolve, 10));
		
		const shadowContent = component.renderRoot.querySelector('p');
		const lightContent = component.lightRoot.querySelector('span');
		
		if(!shadowContent || shadowContent.textContent !== 'Shadow content') {
			document.body.removeChild(component);
			fail('Shadow content should be present');
			return;
		}
		
		if(!lightContent || lightContent.textContent !== 'Light content') {
			document.body.removeChild(component);
			fail('Light content should be present');
			return;
		}
		
		log('✓ Both shadow and light content rendered simultaneously');
		document.body.removeChild(component);
		pass('HybridComponent renders both DOM types');
	},

	'should preserve natural children alongside hybrid content': async ({pass, fail, log}) => {
		const component = new TestHybridComponent();
		const naturalChild = document.createElement('div');
		naturalChild.textContent = 'Natural child';
		component.appendChild(naturalChild);
		document.body.appendChild(component);
		
		await new Promise(resolve => setTimeout(resolve, 10));
		
		const foundNaturalChild = component.querySelector('div');
		if(!foundNaturalChild || foundNaturalChild.textContent !== 'Natural child') {
			document.body.removeChild(component);
			fail('Natural child should be preserved');
			return;
		}
		
		const shadowContent = component.renderRoot.querySelector('p');
		const lightContent = component.lightRoot.querySelector('span');
		
		if(!shadowContent || !lightContent) {
			document.body.removeChild(component);
			fail('Both rendered contents should be present with natural children');
			return;
		}
		
		log('✓ Natural children preserved alongside hybrid rendering');
		document.body.removeChild(component);
		pass('HybridComponent preserves natural children');
	},

	'should handle slot system for light root': async ({pass, fail, log}) => {
		const component = new TestHybridComponent();
		document.body.appendChild(component);
		
		await new Promise(resolve => setTimeout(resolve, 10));
		await component.updateComplete;
		
		// The slot should be in the render root (which is the div container)
		const slot = component.renderRoot.querySelector('slot[name="lightRoot"]');
		const lightContent = component.lightRoot.querySelector('span');
		
		if(!slot && !lightContent) {
			document.body.removeChild(component);
			fail('Either slot should exist or light content should be rendered via slotting');
			return;
		}
		
		if(component.lightRoot.slot !== 'lightRoot') {
			document.body.removeChild(component);
			fail('lightRoot should be assigned to lightRoot slot');
			return;
		}
		
		// Check that light content is actually rendered
		if(!lightContent || lightContent.textContent !== 'Light content') {
			document.body.removeChild(component);
			fail('Light content should be rendered through slot system');
			return;
		}
		
		log('✓ Slot system working - light content rendered');
		document.body.removeChild(component);
		pass('HybridComponent implements proper slot system');
	}
};
