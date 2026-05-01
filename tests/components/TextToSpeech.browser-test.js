import TextToSpeech from '../../src/components/TextToSpeech.js';
import { setVoice } from '../../src/utils/voice.js';

const createTextToSpeech = async (attrs = {}, slot = '') => {
  const container = document.createElement('div');
  const parts = [];
  if(attrs.text !== undefined) parts.push(`text="${attrs.text}"`);
  if(attrs.voice !== undefined) parts.push(`voice="${attrs.voice}"`);
  if(attrs.language !== undefined) parts.push(`language="${attrs.language}"`);
  if(attrs.rate !== undefined) parts.push(`rate="${attrs.rate}"`);
  if(attrs.pitch !== undefined) parts.push(`pitch="${attrs.pitch}"`);
  if(attrs.volume !== undefined) parts.push(`volume="${attrs.volume}"`);
  if(attrs.disabled) parts.push('disabled');
  container.innerHTML = `<k-text-to-speech ${parts.join(' ')}>${slot}</k-text-to-speech>`;
  document.body.appendChild(container);
  const el = container.querySelector('k-text-to-speech');
  await el.updateComplete;
  return { container, el };
};

const cleanup = (container) => {
  if(container && container.parentNode){
    container.parentNode.removeChild(container);
  }
};

// Stub window.speechSynthesis (which is a read-only getter in Chrome) by
// patching its methods on the live object. SpeechSynthesisUtterance is a
// constructor, swapped via Object.defineProperty.
const installSynthesisStub = (voicesList = []) => {
  const captured = {
    spoken: [],
    cancelled: 0
  };
  const synth = window.speechSynthesis;
  const originalSpeak = synth.speak.bind(synth);
  const originalCancel = synth.cancel.bind(synth);
  const originalGetVoices = synth.getVoices.bind(synth);
  synth.speak = (utterance) => {
    captured.spoken.push(utterance);
    queueMicrotask(() => {
      if(typeof utterance.onstart === 'function') utterance.onstart();
    });
  };
  synth.cancel = () => { captured.cancelled++; };
  synth.getVoices = () => voicesList;

  const OriginalUtterance = window.SpeechSynthesisUtterance;
  function StubUtterance(text){
    this.text = text;
    this.rate = 1;
    this.pitch = 1;
    this.volume = 1;
    this.lang = '';
    this.voice = null;
    this.onstart = null;
    this.onend = null;
    this.onerror = null;
  }
  Object.defineProperty(window, 'SpeechSynthesisUtterance', {
    value: StubUtterance,
    configurable: true,
    writable: true
  });

  return {
    captured,
    restore: () => {
      synth.speak = originalSpeak;
      synth.cancel = originalCancel;
      synth.getVoices = originalGetVoices;
      Object.defineProperty(window, 'SpeechSynthesisUtterance', {
        value: OriginalUtterance,
        configurable: true,
        writable: true
      });
    }
  };
};

export default {
  /*
    Element Creation
  */
  'should create text-to-speech element': async ({pass, fail}) => {
    const { container, el } = await createTextToSpeech();
    if(!(el instanceof TextToSpeech)){
      cleanup(container);
      return fail('Element should be instance of TextToSpeech');
    }
    cleanup(container);
    pass('TextToSpeech element created correctly');
  },

  'should have shadow root': async ({pass, fail}) => {
    const { container, el } = await createTextToSpeech();
    if(!el.shadowRoot){
      cleanup(container);
      return fail('TextToSpeech should have shadow root');
    }
    cleanup(container);
    pass('TextToSpeech has shadow root');
  },

  'should render a button': async ({pass, fail}) => {
    const { container, el } = await createTextToSpeech();
    if(!el.shadowRoot.querySelector('button')){
      cleanup(container);
      return fail('Should render a button');
    }
    cleanup(container);
    pass('Button rendered');
  },

  'should render record_voice_over k-icon when idle': async ({pass, fail}) => {
    const { container, el } = await createTextToSpeech();
    const icon = el.shadowRoot.querySelector('button k-icon');
    if(icon.getAttribute('name') !== 'record_voice_over'){
      cleanup(container);
      return fail(`Idle icon should be "record_voice_over", got "${icon.getAttribute('name')}"`);
    }
    cleanup(container);
    pass('Idle k-icon is record_voice_over');
  },

  'should render stop k-icon when speaking': async ({pass, fail}) => {
    const { container, el } = await createTextToSpeech();
    el.speaking = true;
    await el.updateComplete;
    const icon = el.shadowRoot.querySelector('button k-icon');
    if(icon.getAttribute('name') !== 'stop'){
      cleanup(container);
      return fail(`Speaking icon should be "stop", got "${icon.getAttribute('name')}"`);
    }
    cleanup(container);
    pass('Speaking k-icon is stop');
  },

  /*
    Default Properties
  */
  'should default text to empty string': async ({pass, fail}) => {
    const { container, el } = await createTextToSpeech();
    if(el.text !== ''){
      cleanup(container);
      return fail(`Expected text to be "", got "${el.text}"`);
    }
    cleanup(container);
    pass('Default text is empty');
  },

  'should default rate to 1': async ({pass, fail}) => {
    const { container, el } = await createTextToSpeech();
    if(el.rate !== 1){
      cleanup(container);
      return fail(`Expected rate to be 1, got ${el.rate}`);
    }
    cleanup(container);
    pass('Default rate is 1');
  },

  'should default pitch to 1': async ({pass, fail}) => {
    const { container, el } = await createTextToSpeech();
    if(el.pitch !== 1){
      cleanup(container);
      return fail(`Expected pitch to be 1, got ${el.pitch}`);
    }
    cleanup(container);
    pass('Default pitch is 1');
  },

  'should default volume to 1': async ({pass, fail}) => {
    const { container, el } = await createTextToSpeech();
    if(el.volume !== 1){
      cleanup(container);
      return fail(`Expected volume to be 1, got ${el.volume}`);
    }
    cleanup(container);
    pass('Default volume is 1');
  },

  'should default speaking to false': async ({pass, fail}) => {
    const { container, el } = await createTextToSpeech();
    if(el.speaking !== false){
      cleanup(container);
      return fail(`Expected speaking to be false, got ${el.speaking}`);
    }
    cleanup(container);
    pass('Default speaking is false');
  },

  /*
    Attribute Reflection
  */
  'should reflect text attribute': async ({pass, fail}) => {
    const { container, el } = await createTextToSpeech({ text: 'Hello' });
    if(el.text !== 'Hello'){
      cleanup(container);
      return fail(`Expected text to be "Hello", got "${el.text}"`);
    }
    cleanup(container);
    pass('text attribute reflects to property');
  },

  'should reflect rate, pitch, volume as numbers': async ({pass, fail}) => {
    const { container, el } = await createTextToSpeech({ rate: 1.5, pitch: 0.8, volume: 0.5 });
    if(el.rate !== 1.5 || el.pitch !== 0.8 || el.volume !== 0.5){
      cleanup(container);
      return fail(`Expected rate=1.5/pitch=0.8/volume=0.5, got rate=${el.rate}/pitch=${el.pitch}/volume=${el.volume}`);
    }
    cleanup(container);
    pass('Numeric attrs reflect correctly');
  },

  /*
    Effective Text Resolution
  */
  'should prefer text attribute over slot content': async ({pass, fail}) => {
    const { container, el } = await createTextToSpeech({ text: 'attr text' }, 'slot text');
    if(el.effectiveText !== 'attr text'){
      cleanup(container);
      return fail(`Expected effectiveText to be "attr text", got "${el.effectiveText}"`);
    }
    cleanup(container);
    pass('text attribute takes priority');
  },

  'should fall back to slotted text when text attr is empty': async ({pass, fail}) => {
    const { container, el } = await createTextToSpeech({}, 'slot only');
    if(el.effectiveText !== 'slot only'){
      cleanup(container);
      return fail(`Expected effectiveText to be "slot only", got "${el.effectiveText}"`);
    }
    cleanup(container);
    pass('falls back to slot when text attr empty');
  },

  /*
    Disabled
  */
  'should disable the button when disabled attribute is set': async ({pass, fail}) => {
    const { container, el } = await createTextToSpeech({ disabled: true });
    const btn = el.shadowRoot.querySelector('button');
    if(!btn.disabled){
      cleanup(container);
      return fail('Button should be disabled when disabled attribute is set');
    }
    cleanup(container);
    pass('Button is disabled when disabled attribute is set');
  },

  /*
    Public Methods
  */
  'should expose speak, stop, and toggle methods': async ({pass, fail}) => {
    const { container, el } = await createTextToSpeech();
    for(const m of ['speak', 'stop', 'toggle']){
      if(typeof el[m] !== 'function'){
        cleanup(container);
        return fail(`TextToSpeech should have a ${m}() method`);
      }
    }
    cleanup(container);
    pass('speak, stop, toggle methods exist');
  },

  /*
    Speak / Stop behavior (with stub)
  */
  'should call speechSynthesis.speak with an utterance when speak() is called': async ({pass, fail}) => {
    const stub = installSynthesisStub();
    const { container, el } = await createTextToSpeech({ text: 'hello there' });
    el.speak();
    if(stub.captured.spoken.length !== 1){
      stub.restore();
      cleanup(container);
      return fail(`Expected 1 utterance spoken, got ${stub.captured.spoken.length}`);
    }
    if(stub.captured.spoken[0].text !== 'hello there'){
      stub.restore();
      cleanup(container);
      return fail(`Expected utterance text "hello there", got "${stub.captured.spoken[0].text}"`);
    }
    stub.restore();
    cleanup(container);
    pass('speak() queues an utterance with the right text');
  },

  'should pass rate/pitch/volume/lang to the utterance': async ({pass, fail}) => {
    const stub = installSynthesisStub();
    const { container, el } = await createTextToSpeech({
      text: 'x', rate: 1.5, pitch: 1.2, volume: 0.4, language: 'fr-FR'
    });
    el.speak();
    const u = stub.captured.spoken[0];
    if(u.rate !== 1.5 || u.pitch !== 1.2 || u.volume !== 0.4 || u.lang !== 'fr-FR'){
      stub.restore();
      cleanup(container);
      return fail(`Utterance properties wrong: rate=${u.rate}, pitch=${u.pitch}, volume=${u.volume}, lang=${u.lang}`);
    }
    stub.restore();
    cleanup(container);
    pass('Utterance properties match component config');
  },

  'should accept an override text on speak()': async ({pass, fail}) => {
    const stub = installSynthesisStub();
    const { container, el } = await createTextToSpeech({ text: 'attr' });
    el.speak('override');
    const u = stub.captured.spoken[0];
    if(u.text !== 'override'){
      stub.restore();
      cleanup(container);
      return fail(`Expected override text, got "${u.text}"`);
    }
    stub.restore();
    cleanup(container);
    pass('speak(override) uses the override text');
  },

  'should not speak when text and slot are both empty': async ({pass, fail}) => {
    const stub = installSynthesisStub();
    const { container, el } = await createTextToSpeech();
    el.speak();
    if(stub.captured.spoken.length !== 0){
      stub.restore();
      cleanup(container);
      return fail('Should not speak when there is no text');
    }
    stub.restore();
    cleanup(container);
    pass('speak() is a no-op when text is empty');
  },

  'should call cancel before speaking new utterance': async ({pass, fail}) => {
    const stub = installSynthesisStub();
    const { container, el } = await createTextToSpeech({ text: 'one' });
    el.speak();
    el.speak('two');
    if(stub.captured.cancelled < 2){
      stub.restore();
      cleanup(container);
      return fail(`Expected cancel to be called before each speak, got ${stub.captured.cancelled} cancels`);
    }
    stub.restore();
    cleanup(container);
    pass('cancel runs before each new utterance');
  },

  'should set speaking to true on start and false on end': async ({pass, fail}) => {
    const stub = installSynthesisStub();
    const { container, el } = await createTextToSpeech({ text: 'hi' });
    el.speak();
    // Wait for the queued onstart microtask
    await Promise.resolve();
    if(el.speaking !== true){
      stub.restore();
      cleanup(container);
      return fail('speaking should be true after start');
    }
    el.handleEnd();
    if(el.speaking !== false){
      stub.restore();
      cleanup(container);
      return fail('speaking should be false after end');
    }
    stub.restore();
    cleanup(container);
    pass('speaking flips on start/end');
  },

  /*
    Events
  */
  'should fire start event on handleStart': async ({pass, fail}) => {
    const { container, el } = await createTextToSpeech();
    let fired = false;
    el.addEventListener('start', () => { fired = true; });
    el.handleStart();
    if(!fired){
      cleanup(container);
      return fail('start event should fire');
    }
    cleanup(container);
    pass('start event fires');
  },

  'should fire end event on handleEnd': async ({pass, fail}) => {
    const { container, el } = await createTextToSpeech();
    let fired = false;
    el.addEventListener('end', () => { fired = true; });
    el.handleEnd();
    if(!fired){
      cleanup(container);
      return fail('end event should fire');
    }
    cleanup(container);
    pass('end event fires');
  },

  'should fire error event with detail.error': async ({pass, fail}) => {
    const { container, el } = await createTextToSpeech();
    let received = null;
    el.addEventListener('error', (e) => { received = e.detail; });
    el.handleError({ error: 'audio-busy' });
    if(!received || received.error !== 'audio-busy'){
      cleanup(container);
      return fail(`Expected detail.error="audio-busy", got ${JSON.stringify(received)}`);
    }
    cleanup(container);
    pass('error event fires with detail.error');
  },

  /*
    Voice Fallback Chain
  */
  'should pick first matching voice from a fallback chain': async ({pass, fail}) => {
    const stub = installSynthesisStub([
      { name: 'Google US English' },
      { name: 'Microsoft Zira' }
    ]);
    const { container, el } = await createTextToSpeech({
      text: 'hi',
      voice: 'Samantha, Google US English, Microsoft Zira'
    });
    el.speak();
    const u = stub.captured.spoken[0];
    if(!u.voice || u.voice.name !== 'Google US English'){
      stub.restore();
      cleanup(container);
      return fail(`Expected voice "Google US English", got ${u.voice ? u.voice.name : 'null'}`);
    }
    stub.restore();
    cleanup(container);
    pass('First installed voice in chain is selected');
  },

  'should fall through earlier missing entries in the chain': async ({pass, fail}) => {
    const stub = installSynthesisStub([
      { name: 'Microsoft Zira' }
    ]);
    const { container, el } = await createTextToSpeech({
      text: 'hi',
      voice: 'Samantha, Google US English, Microsoft Zira'
    });
    el.speak();
    const u = stub.captured.spoken[0];
    if(!u.voice || u.voice.name !== 'Microsoft Zira'){
      stub.restore();
      cleanup(container);
      return fail(`Expected voice "Microsoft Zira", got ${u.voice ? u.voice.name : 'null'}`);
    }
    stub.restore();
    cleanup(container);
    pass('Falls through to a later installed voice');
  },

  'should not set voice when no candidate matches': async ({pass, fail}) => {
    const stub = installSynthesisStub([
      { name: 'Karen' }
    ]);
    const { container, el } = await createTextToSpeech({
      text: 'hi',
      voice: 'Samantha, Google US English'
    });
    el.speak();
    const u = stub.captured.spoken[0];
    if(u.voice !== null){
      stub.restore();
      cleanup(container);
      return fail(`Expected voice null when no chain entry matches, got ${u.voice && u.voice.name}`);
    }
    stub.restore();
    cleanup(container);
    pass('voice stays null when no chain entry is installed');
  },

  'should ignore extra whitespace around chain entries': async ({pass, fail}) => {
    const stub = installSynthesisStub([
      { name: 'Google US English' }
    ]);
    const { container, el } = await createTextToSpeech({
      text: 'hi',
      voice: '  Samantha ,   Google US English  '
    });
    el.speak();
    const u = stub.captured.spoken[0];
    if(!u.voice || u.voice.name !== 'Google US English'){
      stub.restore();
      cleanup(container);
      return fail(`Expected voice "Google US English" after trim, got ${u.voice && u.voice.name}`);
    }
    stub.restore();
    cleanup(container);
    pass('Whitespace around comma-separated entries is ignored');
  },

  'should fall back to saved voice preference when no voice attr is set': async ({pass, fail}) => {
    const stub = installSynthesisStub([
      { name: 'Karen', lang: 'en-AU' }
    ]);
    setVoice('Karen');
    const { container, el } = await createTextToSpeech({ text: 'hi' });
    el.speak();
    const u = stub.captured.spoken[0];
    if(!u.voice || u.voice.name !== 'Karen'){
      stub.restore();
      setVoice('');
      cleanup(container);
      return fail(`Expected fallback to saved voice "Karen", got ${u.voice && u.voice.name}`);
    }
    stub.restore();
    setVoice('');
    cleanup(container);
    pass('Saved voice preference is used when voice attr is empty');
  },

  'should ignore saved voice preference when voice attr is set': async ({pass, fail}) => {
    const stub = installSynthesisStub([
      { name: 'Karen', lang: 'en-AU' },
      { name: 'Samantha', lang: 'en-US' }
    ]);
    setVoice('Karen');
    const { container, el } = await createTextToSpeech({ text: 'hi', voice: 'Samantha' });
    el.speak();
    const u = stub.captured.spoken[0];
    if(!u.voice || u.voice.name !== 'Samantha'){
      stub.restore();
      setVoice('');
      cleanup(container);
      return fail(`Expected explicit voice "Samantha" to win over saved "Karen", got ${u.voice && u.voice.name}`);
    }
    stub.restore();
    setVoice('');
    cleanup(container);
    pass('Explicit voice attr overrides saved preference');
  },

  'should still match a single voice name with no commas': async ({pass, fail}) => {
    const stub = installSynthesisStub([
      { name: 'Samantha' }
    ]);
    const { container, el } = await createTextToSpeech({
      text: 'hi',
      voice: 'Samantha'
    });
    el.speak();
    const u = stub.captured.spoken[0];
    if(!u.voice || u.voice.name !== 'Samantha'){
      stub.restore();
      cleanup(container);
      return fail(`Expected voice "Samantha", got ${u.voice && u.voice.name}`);
    }
    stub.restore();
    cleanup(container);
    pass('Single voice name still works');
  },

  /*
    Browser support detection
  */
  'should disable button when speechSynthesis is unsupported': async ({pass, fail}) => {
    const original = {
      speechSynthesis: window.speechSynthesis,
      SpeechSynthesisUtterance: window.SpeechSynthesisUtterance
    };
    delete window.speechSynthesis;
    delete window.SpeechSynthesisUtterance;
    const { container, el } = await createTextToSpeech();
    const btn = el.shadowRoot.querySelector('button');
    const wasDisabled = btn.disabled;
    if(original.speechSynthesis) window.speechSynthesis = original.speechSynthesis;
    if(original.SpeechSynthesisUtterance) window.SpeechSynthesisUtterance = original.SpeechSynthesisUtterance;
    if(!wasDisabled){
      cleanup(container);
      return fail('Button should be disabled when speechSynthesis is unsupported');
    }
    cleanup(container);
    pass('Button auto-disables when SpeechSynthesis API is missing');
  }
};
