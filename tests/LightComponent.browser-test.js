import LightComponent from '/src/components/LightComponent.js';
import { html } from '/src/lit-all.min.js';

class TestLightComponent extends LightComponent {
	renderLightDom() {
		return html`<p>Test light content</p>`;
	}
}

customElements.define('test-light-component', TestLightComponent);

export default {
	'should not create shadow root': async ({pass, fail, log}) => {
		const component = new TestLightComponent();
		document.body.appendChild(component);
		
		await new Promise(resolve => setTimeout(resolve, 0));
		
		if(component.shadowRoot) {
			document.body.removeChild(component);
			fail('LightComponent should not have shadow root');
			return;
		}
		
		log('✓ No shadow root created as expected');
		document.body.removeChild(component);
		pass('LightComponent does not create shadow root');
	},

	'should have itself as render root': async ({pass, fail, log}) => {
		const component = new TestLightComponent();
		document.body.appendChild(component);
		
		await new Promise(resolve => setTimeout(resolve, 0));
		
		if(component.renderRoot !== component) {
			document.body.removeChild(component);
			fail('Render root should be the component itself');
			return;
		}
		
		log('✓ Component is its own render root');
		document.body.removeChild(component);
		pass('LightComponent uses itself as render root');
	},

	'should create light root container': async ({pass, fail, log}) => {
		const component = new TestLightComponent();
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
		
		if(component.lightRoot.parentNode !== component) {
			document.body.removeChild(component);
			fail('lightRoot should be child of component');
			return;
		}
		
		log('✓ Light root container properly configured');
		document.body.removeChild(component);
		pass('LightComponent creates proper light root container');
	},

	'should render content in light root': async ({pass, fail, log}) => {
		const component = new TestLightComponent();
		document.body.appendChild(component);
		
		await new Promise(resolve => setTimeout(resolve, 10));
		
		const paragraph = component.lightRoot.querySelector('p');
		if(!paragraph) {
			document.body.removeChild(component);
			fail('Component should render paragraph in light root');
			return;
		}
		
		if(paragraph.textContent !== 'Test light content') {
			document.body.removeChild(component);
			fail(`Expected "Test light content", got "${paragraph.textContent}"`);
			return;
		}
		
		log('✓ Content rendered properly in light root');
		document.body.removeChild(component);
		pass('LightComponent renders content in light DOM');
	},

	'should preserve natural children': async ({pass, fail, log}) => {
		const component = new TestLightComponent();
		const naturalChild = document.createElement('span');
		naturalChild.textContent = 'Natural child';
		component.appendChild(naturalChild);
		document.body.appendChild(component);
		
		await new Promise(resolve => setTimeout(resolve, 10));
		
		const foundNaturalChild = component.querySelector('span');
		if(!foundNaturalChild) {
			document.body.removeChild(component);
			fail('Natural child should be preserved');
			return;
		}
		
		if(foundNaturalChild.textContent !== 'Natural child') {
			document.body.removeChild(component);
			fail('Natural child content should be preserved');
			return;
		}
		
		const renderedContent = component.lightRoot.querySelector('p');
		if(!renderedContent) {
			document.body.removeChild(component);
			fail('Rendered content should also be present');
			return;
		}
		
		log('✓ Natural children preserved alongside rendered content');
		document.body.removeChild(component);
		pass('LightComponent preserves natural children');
	},

	'should call super.updated() requirement': async ({pass, fail, log}) => {
		class BadLightComponent extends LightComponent {
			updated() {
				// Intentionally not calling super.updated()
			}
			
			renderLightDom() {
				return html`<p>Should not render</p>`;
			}
		}
		
		customElements.define('bad-light-component', BadLightComponent);
		
		const component = new BadLightComponent();
		document.body.appendChild(component);
		
		await new Promise(resolve => setTimeout(resolve, 10));
		
		const paragraph = component.lightRoot?.querySelector('p');
		if(paragraph) {
			document.body.removeChild(component);
			fail('Content should not render without super.updated() call');
			return;
		}
		
		log('✓ Content does not render without super.updated()');
		document.body.removeChild(component);
		pass('LightComponent requires super.updated() to function');
	}
};
