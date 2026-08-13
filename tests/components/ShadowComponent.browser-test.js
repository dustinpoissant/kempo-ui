import ShadowComponent from '../../src/components/ShadowComponent.js';
import { html, css } from '../../src/lit-all.min.js';

class TestShadowComponent extends ShadowComponent {
	render() {
		return html`<p>Test shadow content</p>`;
	}
}

customElements.define('test-shadow-component', TestShadowComponent);

/*
  Reproduces the real shape a subclass chain produces: a base class's `static styles` is itself an
  array (e.g. ButtonControl.styles = [Control.styles, css`...`]), and a subclass that forgets to
  spread it — `[ButtonControl.styles, css`...`]` instead of `[...ButtonControl.styles, css`...`]` —
  ends up with an array nested one level deep. Without flattening, that inner array has no .cssText
  of its own, so it gets left as a raw array and stringified by plain Array.prototype.join's default
  comma separator — landing a bare `,` between two closed `}` blocks, which is invalid anywhere a
  CSS rule is expected. The browser drops the whole malformed rule rather than just misreading it,
  so every property inside it — not just one — silently stops applying.
*/
const nestedBaseStyles = [
	css`:host { color: rgb(1, 2, 3); }`,
	css`:host { background-color: rgb(4, 5, 6); }`
];

class TestNestedStylesComponent extends ShadowComponent {
	render() { return html`<p>nested styles</p>`; }
	static styles = [
		nestedBaseStyles, // deliberately not spread — the mistake this test guards against
		css`:host { border: 1px solid rgb(7, 8, 9); }`
	];
}

customElements.define('test-nested-styles-component', TestNestedStylesComponent);

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
		
		const stylesheetLink = component.shadowRoot.querySelector('link[rel="stylesheet"]');
		if(!stylesheetLink) {
			document.body.removeChild(component);
			fail('Shadow root should contain stylesheet link');
			return;
		}
		
		if(!stylesheetLink.href.includes('kempo')) {
			document.body.removeChild(component);
			fail('Stylesheet should reference kempo css');
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
		
		const stylesheetBefore = component.shadowRoot.querySelector('link[rel="stylesheet"]');
		if(!stylesheetBefore) {
			document.body.removeChild(component);
			fail('Stylesheet should exist before re-render');
			return;
		}
		
		component.requestUpdate();
		await component.updateComplete;
		
		const stylesheetAfter = component.shadowRoot.querySelector('link[rel="stylesheet"]');
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
	},

	'should apply every rule from a nested (unspread) styles array': async ({pass, fail, log}) => {
		const component = new TestNestedStylesComponent();
		document.body.appendChild(component);

		await new Promise(resolve => setTimeout(resolve, 0));

		const cs = getComputedStyle(component);
		const color = cs.color;
		const background = cs.backgroundColor;
		const border = cs.borderTopColor;
		document.body.removeChild(component);

		if(color !== 'rgb(1, 2, 3)') return fail(`color from the nested array's first rule did not apply, got ${color}`);
		if(background !== 'rgb(4, 5, 6)') return fail(`background from the nested array's second rule did not apply, got ${background}`);
		if(border !== 'rgb(7, 8, 9)') return fail(`border from the outer array's own rule did not apply, got ${border}`);
		log('✓ all three rules across the nesting boundary applied');
		pass('nested styles array flattened and applied correctly');
	}
};
