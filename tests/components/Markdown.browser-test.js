import Markdown from '../../src/components/Markdown.js';
import LightComponent from '../../src/components/LightComponent.js';

const createMarkdown = async (innerHTML = '', attrs = {}) => {
  const container = document.createElement('div');
  const el = document.createElement('k-markdown');
  for(const [key, value] of Object.entries(attrs)){
    el.setAttribute(key, value);
  }
  if(innerHTML) el.innerHTML = innerHTML;
  container.appendChild(el);
  document.body.appendChild(container);
  await el.updateComplete;
  return { container, el };
};

const cleanup = (container) => {
  if(container && container.parentNode){
    container.parentNode.removeChild(container);
  }
};

export default {
  /*
    Element Creation
  */
  'should create k-markdown element': async ({pass, fail}) => {
    const { container, el } = await createMarkdown();
    if(!(el instanceof Markdown)){
      cleanup(container);
      return fail('Element should be instance of Markdown');
    }
    cleanup(container);
    pass('k-markdown element created correctly');
  },

  'should extend LightComponent': async ({pass, fail}) => {
    const { container, el } = await createMarkdown();
    if(!(el instanceof LightComponent)){
      cleanup(container);
      return fail('Markdown should extend LightComponent');
    }
    cleanup(container);
    pass('Markdown extends LightComponent');
  },

  /*
    Default Properties
  */
  'should have empty default value': async ({pass, fail}) => {
    const { container, el } = await createMarkdown();
    if(el.value !== ''){
      cleanup(container);
      return fail(`Expected value to be '', got '${el.value}'`);
    }
    cleanup(container);
    pass('Default value is empty string');
  },

  'should have breaks default false': async ({pass, fail}) => {
    const { container, el } = await createMarkdown();
    if(el.breaks !== false){
      cleanup(container);
      return fail(`Expected breaks to be false, got ${el.breaks}`);
    }
    cleanup(container);
    pass('Default breaks is false');
  },

  /*
    Children → value capture
  */
  'should capture markdown from child text content': async ({pass, fail}) => {
    const { container, el } = await createMarkdown('# Hello');
    if(el.value !== '# Hello'){
      cleanup(container);
      return fail(`Expected value '# Hello', got '${el.value}'`);
    }
    cleanup(container);
    pass('Captures markdown from children');
  },

  'should dedent indented child markdown': async ({pass, fail}) => {
    const container = document.createElement('div');
    container.innerHTML = `<k-markdown>
      # Title

      Some text
    </k-markdown>`;
    document.body.appendChild(container);
    const el = container.querySelector('k-markdown');
    await el.updateComplete;
    const expected = '# Title\n\nSome text';
    if(el.value !== expected){
      cleanup(container);
      return fail(`Expected dedented value '${expected}', got '${el.value}'`);
    }
    cleanup(container);
    pass('Indented child markdown is dedented');
  },

  'value attribute takes precedence over children': async ({pass, fail}) => {
    const container = document.createElement('div');
    container.innerHTML = `<k-markdown value="from attr"># From children</k-markdown>`;
    document.body.appendChild(container);
    const el = container.querySelector('k-markdown');
    await el.updateComplete;
    if(el.value !== 'from attr'){
      cleanup(container);
      return fail(`Expected value 'from attr', got '${el.value}'`);
    }
    cleanup(container);
    pass('value attribute beats children');
  },

  /*
    Rendering
  */
  'should render markdown to HTML in light DOM': async ({pass, fail}) => {
    const { container, el } = await createMarkdown('# Heading');
    const heading = el.querySelector('h1');
    if(!heading){
      cleanup(container);
      return fail(`Expected h1 in rendered output, got: ${el.innerHTML}`);
    }
    if(heading.textContent !== 'Heading'){
      cleanup(container);
      return fail(`Expected h1 text 'Heading', got '${heading.textContent}'`);
    }
    cleanup(container);
    pass('Renders markdown heading as h1 in light DOM');
  },

  'should render bold and italic': async ({pass, fail}) => {
    const { container, el } = await createMarkdown('This is **bold** and *italic*.');
    const strong = el.querySelector('strong');
    const em = el.querySelector('em');
    if(!strong || strong.textContent !== 'bold'){
      cleanup(container);
      return fail(`Expected <strong>bold</strong>, got: ${el.innerHTML}`);
    }
    if(!em || em.textContent !== 'italic'){
      cleanup(container);
      return fail(`Expected <em>italic</em>, got: ${el.innerHTML}`);
    }
    cleanup(container);
    pass('Bold and italic render correctly');
  },

  'should render lists': async ({pass, fail}) => {
    const container = document.createElement('div');
    container.innerHTML = `<k-markdown>
      - one
      - two
      - three
    </k-markdown>`;
    document.body.appendChild(container);
    const el = container.querySelector('k-markdown');
    await el.updateComplete;
    const items = el.querySelectorAll('ul > li');
    if(items.length !== 3){
      cleanup(container);
      return fail(`Expected 3 li elements, got ${items.length}: ${el.innerHTML}`);
    }
    cleanup(container);
    pass('Lists render with three items');
  },

  'should clear original child markdown source': async ({pass, fail}) => {
    const { container, el } = await createMarkdown('# Hello');
    if(el.textContent.includes('# Hello')){
      cleanup(container);
      return fail(`Original markdown source should be removed, got textContent: '${el.textContent}'`);
    }
    cleanup(container);
    pass('Original child markdown is cleared');
  },

  /*
    Re-rendering on value change
  */
  'should re-render when value property changes': async ({pass, fail}) => {
    const { container, el } = await createMarkdown('first');
    el.value = '## Updated';
    await el.updateComplete;
    const h2 = el.querySelector('h2');
    if(!h2 || h2.textContent !== 'Updated'){
      cleanup(container);
      return fail(`Expected h2 'Updated' after value change, got: ${el.innerHTML}`);
    }
    cleanup(container);
    pass('Re-renders on value change');
  },

  /*
    breaks attribute
  */
  'breaks=false joins single newlines (CommonMark)': async ({pass, fail}) => {
    const { container, el } = await createMarkdown();
    el.value = 'one\ntwo';
    await el.updateComplete;
    const br = el.querySelector('br');
    if(br){
      cleanup(container);
      return fail(`Expected no <br> when breaks=false, got: ${el.innerHTML}`);
    }
    cleanup(container);
    pass('breaks=false joins single newlines');
  },

  'breaks=true converts single newlines to <br>': async ({pass, fail}) => {
    const { container, el } = await createMarkdown('', { breaks: '' });
    el.value = 'one\ntwo';
    await el.updateComplete;
    const br = el.querySelector('br');
    if(!br){
      cleanup(container);
      return fail(`Expected <br> when breaks=true, got: ${el.innerHTML}`);
    }
    cleanup(container);
    pass('breaks=true converts single newlines to <br>');
  },

  /*
    Sanitization
  */
  'should strip <script> tags by default': async ({pass, fail}) => {
    const { container, el } = await createMarkdown();
    el.value = 'safe <script>alert(1)</script> text';
    await el.updateComplete;
    if(el.querySelector('script')){
      cleanup(container);
      return fail(`Expected no <script>, got: ${el.innerHTML}`);
    }
    if(el.textContent.includes('alert(1)')){
      cleanup(container);
      return fail(`Script content should be stripped completely, got textContent: '${el.textContent}'`);
    }
    cleanup(container);
    pass('Script tags stripped by default');
  },

  'allowed-tags="*" allows everything': async ({pass, fail}) => {
    const { container, el } = await createMarkdown('', { 'allowed-tags': '*' });
    el.value = '<details><summary>open</summary>hi</details>';
    await el.updateComplete;
    if(!el.querySelector('details') || !el.querySelector('summary')){
      cleanup(container);
      return fail(`Expected details+summary preserved, got: ${el.innerHTML}`);
    }
    cleanup(container);
    pass('allowed-tags="*" allows custom tags');
  },

  'disallowed-tags drops listed tags but keeps text': async ({pass, fail}) => {
    const { container, el } = await createMarkdown('', { 'disallowed-tags': 'h1' });
    el.value = '# Heading\n\nA paragraph.';
    await el.updateComplete;
    if(el.querySelector('h1')){
      cleanup(container);
      return fail(`Expected no <h1>, got: ${el.innerHTML}`);
    }
    if(!el.textContent.includes('Heading')){
      cleanup(container);
      return fail(`Expected heading text preserved, got textContent: '${el.textContent}'`);
    }
    if(!el.querySelector('p')){
      cleanup(container);
      return fail(`Expected paragraph preserved, got: ${el.innerHTML}`);
    }
    cleanup(container);
    pass('disallowed-tags drops listed tags but keeps text');
  },

  /*
    renderedHtml getter
  */
  'renderedHtml getter returns sanitized HTML string': async ({pass, fail}) => {
    const { container, el } = await createMarkdown('# Title');
    const out = el.renderedHtml;
    if(typeof out !== 'string'){
      cleanup(container);
      return fail(`Expected string, got ${typeof out}`);
    }
    if(!out.includes('<h1') || !out.includes('Title')){
      cleanup(container);
      return fail(`Expected '<h1...>Title' in renderedHtml, got '${out}'`);
    }
    cleanup(container);
    pass('renderedHtml returns expected HTML string');
  }
};
