import VoiceSelector from '../../src/components/VoiceSelector.js';
import { setVoice } from '../../src/utils/voice.js';

const FAKE_VOICES = [
  { name: 'Samantha', lang: 'en-US' },
  { name: 'Alex', lang: 'en-US' },
  { name: 'Daniel', lang: 'en-GB' },
  { name: 'Amelie', lang: 'fr-FR' },
  { name: 'Thomas', lang: 'fr-FR' },
  { name: 'Monica', lang: 'es-ES' }
];

const installVoicesStub = (voiceList = FAKE_VOICES) => {
  const synth = window.speechSynthesis;
  const original = synth.getVoices.bind(synth);
  synth.getVoices = () => voiceList;
  return {
    restore: () => { synth.getVoices = original; }
  };
};

const createVoiceSelector = async (attrs = {}) => {
  const container = document.createElement('div');
  const parts = [];
  if(attrs.language !== undefined) parts.push(`language="${attrs.language}"`);
  if(attrs.placeholder !== undefined) parts.push(`placeholder="${attrs.placeholder}"`);
  if(attrs.disabled) parts.push('disabled');
  container.innerHTML = `<k-voice-selector ${parts.join(' ')}></k-voice-selector>`;
  document.body.appendChild(container);
  const el = container.querySelector('k-voice-selector');
  await el.updateComplete;
  return { container, el };
};

const langSelect = (el) => el.shadowRoot.querySelector('select.lang');
const voiceSelect = (el) => el.shadowRoot.querySelector('select.voice');
const optionValues = (sel) => [...sel.querySelectorAll('option')].map(o => o.value);

const cleanup = (container) => {
  if(container && container.parentNode){
    container.parentNode.removeChild(container);
  }
};

const reset = () => setVoice('');

export default {
  /*
    Element Creation
  */
  'should create voice-selector element': async ({pass, fail}) => {
    reset();
    const stub = installVoicesStub();
    const { container, el } = await createVoiceSelector();
    if(!(el instanceof VoiceSelector)){
      stub.restore();
      cleanup(container);
      return fail('Element should be instance of VoiceSelector');
    }
    stub.restore();
    cleanup(container);
    pass('VoiceSelector created');
  },

  'should render two select elements (language + voice)': async ({pass, fail}) => {
    reset();
    const stub = installVoicesStub();
    const { container, el } = await createVoiceSelector();
    if(!langSelect(el) || !voiceSelect(el)){
      stub.restore();
      cleanup(container);
      return fail('Should render both .lang and .voice selects');
    }
    stub.restore();
    cleanup(container);
    pass('Both selects rendered');
  },

  /*
    Language Dropdown Population
  */
  'should populate language dropdown with distinct primary languages': async ({pass, fail}) => {
    reset();
    const stub = installVoicesStub();
    const { container, el } = await createVoiceSelector();
    el.refresh();
    await el.updateComplete;
    const langs = optionValues(langSelect(el));
    if(!langs.includes('en') || !langs.includes('fr') || !langs.includes('es')){
      stub.restore();
      cleanup(container);
      return fail(`Expected en/fr/es in language list, got ${JSON.stringify(langs)}`);
    }
    // Should de-dupe en-US + en-GB → "en"
    const enCount = langs.filter(l => l === 'en').length;
    if(enCount !== 1){
      stub.restore();
      cleanup(container);
      return fail(`Expected 'en' only once, got ${enCount}`);
    }
    stub.restore();
    cleanup(container);
    pass('Language dropdown shows distinct primary languages');
  },

  /*
    Language Display (localized + native names)
  */
  'should display each language name with its native name appended': async ({pass, fail}) => {
    reset();
    const stub = installVoicesStub();
    const { container, el } = await createVoiceSelector();
    el.refresh();
    await el.updateComplete;
    const options = [...langSelect(el).querySelectorAll('option')];
    const spanishOption = options.find(o => o.value === 'es');
    const frenchOption = options.find(o => o.value === 'fr');
    if(!spanishOption || !spanishOption.textContent.includes('Español')){
      stub.restore();
      cleanup(container);
      return fail(`Expected Spanish option to include "Español", got "${spanishOption && spanishOption.textContent}"`);
    }
    if(!frenchOption || !frenchOption.textContent.toLowerCase().includes('français')){
      stub.restore();
      cleanup(container);
      return fail(`Expected French option to include "Français", got "${frenchOption && frenchOption.textContent}"`);
    }
    stub.restore();
    cleanup(container);
    pass('Language options include native names');
  },

  'should not duplicate when localized and native names match': async ({pass, fail}) => {
    reset();
    const stub = installVoicesStub([{ name: 'EN Voice', lang: 'en-US' }]);
    const { container, el } = await createVoiceSelector();
    el.refresh();
    await el.updateComplete;
    const enOption = [...langSelect(el).querySelectorAll('option')].find(o => o.value === 'en');
    if(!enOption){
      stub.restore();
      cleanup(container);
      return fail('Should have an English option');
    }
    // If user's locale is English, "English (English)" would be silly — verify we drop the duplicate.
    const userLocale = (navigator.language || '').toLowerCase();
    if(userLocale.startsWith('en')){
      if(enOption.textContent.includes('(English)')){
        stub.restore();
        cleanup(container);
        return fail(`Expected "English" without duplicate parenthetical, got "${enOption.textContent}"`);
      }
    }
    stub.restore();
    cleanup(container);
    pass('Localized and native names are deduplicated when identical');
  },

  /*
    Voice Dropdown Filtering
  */
  'should populate voice dropdown for current language': async ({pass, fail}) => {
    reset();
    const stub = installVoicesStub();
    const { container, el } = await createVoiceSelector({ language: 'en' });
    el.refresh();
    await el.updateComplete;
    const voices = optionValues(voiceSelect(el)).filter(Boolean);
    if(!voices.includes('Samantha') || !voices.includes('Daniel') || voices.includes('Amelie')){
      stub.restore();
      cleanup(container);
      return fail(`Expected en-* voices only, got ${JSON.stringify(voices)}`);
    }
    stub.restore();
    cleanup(container);
    pass('Voice dropdown filtered by current language');
  },

  'should switch voice list when language dropdown changes': async ({pass, fail}) => {
    reset();
    const stub = installVoicesStub();
    const { container, el } = await createVoiceSelector({ language: 'en' });
    el.refresh();
    await el.updateComplete;
    const lang = langSelect(el);
    lang.value = 'fr';
    lang.dispatchEvent(new Event('change', { bubbles: true }));
    await el.updateComplete;
    const voices = optionValues(voiceSelect(el)).filter(Boolean);
    if(!voices.includes('Amelie') || !voices.includes('Thomas') || voices.includes('Samantha')){
      stub.restore();
      cleanup(container);
      return fail(`Expected fr-* voices after change, got ${JSON.stringify(voices)}`);
    }
    stub.restore();
    cleanup(container);
    pass('Voice list reflows when language changes');
  },

  'should include placeholder option in voice dropdown': async ({pass, fail}) => {
    reset();
    const stub = installVoicesStub();
    const { container, el } = await createVoiceSelector({ language: 'en' });
    el.refresh();
    await el.updateComplete;
    const first = voiceSelect(el).querySelector('option');
    if(first.value !== '' || !first.textContent.includes('Browser default')){
      stub.restore();
      cleanup(container);
      return fail(`First voice option should be the placeholder, got value="${first.value}" text="${first.textContent}"`);
    }
    stub.restore();
    cleanup(container);
    pass('Placeholder option present in voice dropdown');
  },

  /*
    Default language from navigator
  */
  'should default current language from navigator.language when no attr': async ({pass, fail}) => {
    reset();
    const stub = installVoicesStub();
    // Confine test to languages that exist in the fake list
    const expected = (navigator.language || 'en').split('-')[0].toLowerCase();
    const fallback = ['en', 'fr', 'es'].includes(expected) ? expected : 'en';
    const { container, el } = await createVoiceSelector();
    el.refresh();
    await el.updateComplete;
    if(el.currentLang !== fallback){
      stub.restore();
      cleanup(container);
      return fail(`Expected currentLang "${fallback}" (from navigator), got "${el.currentLang}"`);
    }
    stub.restore();
    cleanup(container);
    pass('Default language picked from navigator');
  },

  /*
    Persistence
  */
  'should persist voice via voice utility on change': async ({pass, fail}) => {
    reset();
    const stub = installVoicesStub();
    const { container, el } = await createVoiceSelector({ language: 'en' });
    el.refresh();
    await el.updateComplete;
    const sel = voiceSelect(el);
    sel.value = 'Alex';
    sel.dispatchEvent(new Event('change', { bubbles: true }));
    await el.updateComplete;
    if(localStorage.getItem('k-voice') !== 'Alex'){
      stub.restore();
      cleanup(container);
      reset();
      return fail(`Expected localStorage k-voice="Alex", got "${localStorage.getItem('k-voice')}"`);
    }
    stub.restore();
    cleanup(container);
    reset();
    pass('Selecting a voice persists via voice util');
  },

  'should clear voice selection when changing to a language without that voice': async ({pass, fail}) => {
    reset();
    const stub = installVoicesStub();
    const { container, el } = await createVoiceSelector({ language: 'en' });
    el.refresh();
    await el.updateComplete;
    const v = voiceSelect(el);
    v.value = 'Alex';
    v.dispatchEvent(new Event('change', { bubbles: true }));
    await el.updateComplete;
    const lang = langSelect(el);
    lang.value = 'fr';
    lang.dispatchEvent(new Event('change', { bubbles: true }));
    await el.updateComplete;
    if(localStorage.getItem('k-voice') !== null){
      stub.restore();
      cleanup(container);
      reset();
      return fail(`Expected k-voice cleared after switching language, got "${localStorage.getItem('k-voice')}"`);
    }
    stub.restore();
    cleanup(container);
    reset();
    pass('Switching to a language that does not contain the selected voice clears it');
  },

  'should reflect external voice changes in the voice dropdown': async ({pass, fail}) => {
    reset();
    const stub = installVoicesStub();
    const { container, el } = await createVoiceSelector({ language: 'en' });
    el.refresh();
    await el.updateComplete;
    setVoice('Daniel');
    await el.updateComplete;
    if(voiceSelect(el).value !== 'Daniel'){
      stub.restore();
      cleanup(container);
      reset();
      return fail(`Expected voice select.value "Daniel", got "${voiceSelect(el).value}"`);
    }
    stub.restore();
    cleanup(container);
    reset();
    pass('External voice updates reflect in voice dropdown');
  },

  'should sync currentLang when external voice is in a different language': async ({pass, fail}) => {
    reset();
    const stub = installVoicesStub();
    const { container, el } = await createVoiceSelector({ language: 'en' });
    el.refresh();
    await el.updateComplete;
    setVoice('Amelie');
    await el.updateComplete;
    if(el.currentLang !== 'fr'){
      stub.restore();
      cleanup(container);
      reset();
      return fail(`Expected currentLang to switch to "fr", got "${el.currentLang}"`);
    }
    stub.restore();
    cleanup(container);
    reset();
    pass('External voice in different language updates language dropdown');
  },

  /*
    Events
  */
  'should fire change event with detail.voice and detail.language': async ({pass, fail}) => {
    reset();
    const stub = installVoicesStub();
    const { container, el } = await createVoiceSelector({ language: 'en' });
    el.refresh();
    await el.updateComplete;
    let received = null;
    el.addEventListener('change', (e) => { received = e.detail; });
    const sel = voiceSelect(el);
    sel.value = 'Samantha';
    sel.dispatchEvent(new Event('change', { bubbles: true }));
    if(!received || received.voice !== 'Samantha' || received.language !== 'en'){
      stub.restore();
      cleanup(container);
      reset();
      return fail(`Expected detail {voice:"Samantha", language:"en"}, got ${JSON.stringify(received)}`);
    }
    stub.restore();
    cleanup(container);
    reset();
    pass('change event fires with detail.voice and detail.language');
  },

  /*
    Disabled
  */
  'should disable both selects when disabled attribute is set': async ({pass, fail}) => {
    reset();
    const stub = installVoicesStub();
    const { container, el } = await createVoiceSelector({ disabled: true, language: 'en' });
    el.refresh();
    await el.updateComplete;
    if(!langSelect(el).disabled || !voiceSelect(el).disabled){
      stub.restore();
      cleanup(container);
      return fail('Both selects should be disabled');
    }
    stub.restore();
    cleanup(container);
    pass('Both selects honor disabled attribute');
  }
};
