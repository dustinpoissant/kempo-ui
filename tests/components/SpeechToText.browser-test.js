import SpeechToText from '../../src/components/SpeechToText.js';

const createSpeechToText = async (attrs = {}) => {
  const container = document.createElement('div');
  const parts = [];
  if(attrs.language !== undefined) parts.push(`language="${attrs.language}"`);
  if(attrs.continuous) parts.push('continuous');
  if(attrs.interim) parts.push('interim');
  if(attrs.minConfidence !== undefined) parts.push(`min-confidence="${attrs.minConfidence}"`);
  if(attrs.timeout !== undefined) parts.push(`timeout="${attrs.timeout}"`);
  if(attrs.disabled) parts.push('disabled');
  container.innerHTML = `<k-speech-to-text ${parts.join(' ')}></k-speech-to-text>`;
  document.body.appendChild(container);
  const el = container.querySelector('k-speech-to-text');
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
  'should create speech-to-text element': async ({pass, fail}) => {
    const { container, el } = await createSpeechToText();
    if(!el){
      cleanup(container);
      return fail('SpeechToText element should be created');
    }
    if(!(el instanceof SpeechToText)){
      cleanup(container);
      return fail('Element should be instance of SpeechToText');
    }
    cleanup(container);
    pass('SpeechToText element created correctly');
  },

  'should have shadow root': async ({pass, fail}) => {
    const { container, el } = await createSpeechToText();
    if(!el.shadowRoot){
      cleanup(container);
      return fail('SpeechToText should have shadow root');
    }
    cleanup(container);
    pass('SpeechToText has shadow root');
  },

  'should render a button': async ({pass, fail}) => {
    const { container, el } = await createSpeechToText();
    const btn = el.shadowRoot.querySelector('button');
    if(!btn){
      cleanup(container);
      return fail('SpeechToText should render a button');
    }
    cleanup(container);
    pass('Button rendered');
  },

  'should render a mic k-icon when idle': async ({pass, fail}) => {
    const { container, el } = await createSpeechToText();
    const icon = el.shadowRoot.querySelector('button k-icon');
    if(!icon){
      cleanup(container);
      return fail('Button should contain a k-icon');
    }
    if(icon.getAttribute('name') !== 'mic'){
      cleanup(container);
      return fail(`Idle icon should be "mic", got "${icon.getAttribute('name')}"`);
    }
    cleanup(container);
    pass('Idle k-icon is "mic"');
  },

  'should render a stop k-icon when listening': async ({pass, fail}) => {
    const { container, el } = await createSpeechToText();
    el.listening = true;
    await el.updateComplete;
    const icon = el.shadowRoot.querySelector('button k-icon');
    if(icon.getAttribute('name') !== 'stop'){
      cleanup(container);
      return fail(`Listening icon should be "stop", got "${icon.getAttribute('name')}"`);
    }
    cleanup(container);
    pass('Listening k-icon is "stop"');
  },

  /*
    Default Properties
  */
  'should have default language of en-US': async ({pass, fail}) => {
    const { container, el } = await createSpeechToText();
    if(el.language !== 'en-US'){
      cleanup(container);
      return fail(`Expected language to be "en-US", got "${el.language}"`);
    }
    cleanup(container);
    pass('Default language is en-US');
  },

  'should have continuous default of false': async ({pass, fail}) => {
    const { container, el } = await createSpeechToText();
    if(el.continuous !== false){
      cleanup(container);
      return fail(`Expected continuous to be false, got ${el.continuous}`);
    }
    cleanup(container);
    pass('Default continuous is false');
  },

  'should have interim default of false': async ({pass, fail}) => {
    const { container, el } = await createSpeechToText();
    if(el.interim !== false){
      cleanup(container);
      return fail(`Expected interim to be false, got ${el.interim}`);
    }
    cleanup(container);
    pass('Default interim is false');
  },

  'should have disabled default of false': async ({pass, fail}) => {
    const { container, el } = await createSpeechToText();
    if(el.disabled !== false){
      cleanup(container);
      return fail(`Expected disabled to be false, got ${el.disabled}`);
    }
    cleanup(container);
    pass('Default disabled is false');
  },

  'should have listening default of false': async ({pass, fail}) => {
    const { container, el } = await createSpeechToText();
    if(el.listening !== false){
      cleanup(container);
      return fail(`Expected listening to be false, got ${el.listening}`);
    }
    cleanup(container);
    pass('Default listening is false');
  },

  /*
    Attribute Reflection
  */
  'should reflect language attribute': async ({pass, fail}) => {
    const { container, el } = await createSpeechToText({ language: 'es-ES' });
    if(el.language !== 'es-ES'){
      cleanup(container);
      return fail(`Expected language property to be "es-ES", got "${el.language}"`);
    }
    cleanup(container);
    pass('Language attribute reflects to property');
  },

  'should reflect continuous attribute': async ({pass, fail}) => {
    const { container, el } = await createSpeechToText({ continuous: true });
    if(el.continuous !== true){
      cleanup(container);
      return fail(`Expected continuous to be true, got ${el.continuous}`);
    }
    cleanup(container);
    pass('Continuous attribute reflects to property');
  },

  'should reflect interim attribute': async ({pass, fail}) => {
    const { container, el } = await createSpeechToText({ interim: true });
    if(el.interim !== true){
      cleanup(container);
      return fail(`Expected interim to be true, got ${el.interim}`);
    }
    cleanup(container);
    pass('Interim attribute reflects to property');
  },

  /*
    Disabled
  */
  'should disable the button when disabled attribute is set': async ({pass, fail}) => {
    const { container, el } = await createSpeechToText({ disabled: true });
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
  'should expose start, stop, and toggle methods': async ({pass, fail}) => {
    const { container, el } = await createSpeechToText();
    for(const m of ['start', 'stop', 'toggle']){
      if(typeof el[m] !== 'function'){
        cleanup(container);
        return fail(`SpeechToText should have a ${m}() method`);
      }
    }
    cleanup(container);
    pass('start, stop, and toggle methods exist');
  },

  /*
    Browser Support Detection
  */
  'should disable button when SpeechRecognition is unsupported': async ({pass, fail}) => {
    const original = {
      SpeechRecognition: window.SpeechRecognition,
      webkitSpeechRecognition: window.webkitSpeechRecognition
    };
    delete window.SpeechRecognition;
    delete window.webkitSpeechRecognition;
    const { container, el } = await createSpeechToText();
    const btn = el.shadowRoot.querySelector('button');
    const wasDisabled = btn.disabled;
    if(original.SpeechRecognition) window.SpeechRecognition = original.SpeechRecognition;
    if(original.webkitSpeechRecognition) window.webkitSpeechRecognition = original.webkitSpeechRecognition;
    if(!wasDisabled){
      cleanup(container);
      return fail('Button should be disabled when SpeechRecognition is unsupported');
    }
    cleanup(container);
    pass('Button auto-disables when SpeechRecognition API is missing');
  },

  /*
    Listening State Class
  */
  'should apply listening class when listening property is true': async ({pass, fail}) => {
    const { container, el } = await createSpeechToText();
    el.listening = true;
    await el.updateComplete;
    const btn = el.shadowRoot.querySelector('button');
    if(!btn.classList.contains('listening')){
      cleanup(container);
      return fail('Button should have "listening" class when listening is true');
    }
    cleanup(container);
    pass('Listening class applied when listening is true');
  },

  /*
    Events
  */
  'should fire end event with detail.text on handleEnd': async ({pass, fail}) => {
    const { container, el } = await createSpeechToText();
    let received = null;
    el.addEventListener('end', (e) => { received = e.detail; });
    el.handleEnd();
    if(!received){
      cleanup(container);
      return fail('end event should fire');
    }
    if(typeof received.text !== 'string'){
      cleanup(container);
      return fail(`detail.text should be a string, got ${typeof received.text}`);
    }
    cleanup(container);
    pass('end event fires with detail.text string');
  },

  'should fire start event on handleStart': async ({pass, fail}) => {
    const { container, el } = await createSpeechToText();
    let fired = false;
    el.addEventListener('start', () => { fired = true; });
    el.handleStart();
    await el.updateComplete;
    if(!fired){
      cleanup(container);
      return fail('start event should fire');
    }
    if(el.listening !== true){
      cleanup(container);
      return fail('listening should be true after handleStart');
    }
    cleanup(container);
    pass('start event fires and listening becomes true');
  },

  'should fire result event with detail text and isFinal': async ({pass, fail}) => {
    const { container, el } = await createSpeechToText();
    let received = null;
    el.addEventListener('result', (e) => { received = e.detail; });
    const fakeEvent = {
      resultIndex: 0,
      results: [
        Object.assign([{ transcript: 'hello world' }], { isFinal: true })
      ]
    };
    el.handleResult(fakeEvent);
    if(!received){
      cleanup(container);
      return fail('result event should fire');
    }
    if(received.text !== 'hello world'){
      cleanup(container);
      return fail(`detail.text should be "hello world", got "${received.text}"`);
    }
    if(received.isFinal !== true){
      cleanup(container);
      return fail(`detail.isFinal should be true, got ${received.isFinal}`);
    }
    cleanup(container);
    pass('result event fires with correct detail');
  },

  'should NOT fire result event for interim chunks when interim is off': async ({pass, fail}) => {
    const { container, el } = await createSpeechToText();
    let count = 0;
    el.addEventListener('result', () => { count++; });
    const interimEvent = {
      resultIndex: 0,
      results: [
        Object.assign([{ transcript: 'hel' }], { isFinal: false })
      ]
    };
    el.handleResult(interimEvent);
    if(count !== 0){
      cleanup(container);
      return fail(`Should not dispatch result for interim when interim=false, got ${count} events`);
    }
    cleanup(container);
    pass('Interim result events suppressed when interim=false');
  },

  'should fire result event for interim chunks when interim is on': async ({pass, fail}) => {
    const { container, el } = await createSpeechToText({ interim: true });
    let received = null;
    el.addEventListener('result', (e) => { received = e.detail; });
    el.handleResult({
      resultIndex: 0,
      results: [
        Object.assign([{ transcript: 'hel' }], { isFinal: false })
      ]
    });
    if(!received){
      cleanup(container);
      return fail('result event should fire on interim when interim=true');
    }
    if(received.text !== 'hel' || received.isFinal !== false){
      cleanup(container);
      return fail(`Expected text "hel" and isFinal false, got "${received.text}" / ${received.isFinal}`);
    }
    cleanup(container);
    pass('Interim result events fire when interim=true');
  },

  'should include unfinalized interim text in end event': async ({pass, fail}) => {
    const { container, el } = await createSpeechToText();
    let endText = null;
    el.addEventListener('end', (e) => { endText = e.detail.text; });
    el.handleStart();
    // Simulate Chrome firing only an interim result and then ending without finalizing
    el.handleResult({
      resultIndex: 0,
      results: [
        Object.assign([{ transcript: 'hello there' }], { isFinal: false })
      ]
    });
    el.handleEnd();
    if(endText !== 'hello there'){
      cleanup(container);
      return fail(`end event should include interim text, got "${endText}"`);
    }
    cleanup(container);
    pass('end event includes unfinalized interim text');
  },

  /*
    Min Confidence
  */
  'should default minConfidence to 0': async ({pass, fail}) => {
    const { container, el } = await createSpeechToText();
    if(el.minConfidence !== 0){
      cleanup(container);
      return fail(`Expected minConfidence to default to 0, got ${el.minConfidence}`);
    }
    cleanup(container);
    pass('Default minConfidence is 0');
  },

  'should reflect min-confidence attribute': async ({pass, fail}) => {
    const { container, el } = await createSpeechToText({ minConfidence: 0.7 });
    if(el.minConfidence !== 0.7){
      cleanup(container);
      return fail(`Expected minConfidence to be 0.7, got ${el.minConfidence}`);
    }
    cleanup(container);
    pass('min-confidence attribute reflects to minConfidence property');
  },

  'should drop final results below minConfidence': async ({pass, fail}) => {
    const { container, el } = await createSpeechToText({ minConfidence: 0.7 });
    let endText = null;
    el.addEventListener('end', (e) => { endText = e.detail.text; });
    el.handleStart();
    el.handleResult({
      resultIndex: 0,
      results: [
        Object.assign([{ transcript: 'maybe noise', confidence: 0.3 }], { isFinal: true })
      ]
    });
    el.handleEnd();
    if(endText !== ''){
      cleanup(container);
      return fail(`Low-confidence result should be dropped, got "${endText}"`);
    }
    cleanup(container);
    pass('Low-confidence finals are filtered out');
  },

  'should keep final results at or above minConfidence': async ({pass, fail}) => {
    const { container, el } = await createSpeechToText({ minConfidence: 0.7 });
    let endText = null;
    el.addEventListener('end', (e) => { endText = e.detail.text; });
    el.handleStart();
    el.handleResult({
      resultIndex: 0,
      results: [
        Object.assign([{ transcript: 'clear speech', confidence: 0.9 }], { isFinal: true })
      ]
    });
    el.handleEnd();
    if(endText !== 'clear speech'){
      cleanup(container);
      return fail(`High-confidence result should pass, got "${endText}"`);
    }
    cleanup(container);
    pass('High-confidence finals pass through');
  },

  /*
    Timeout
  */
  'should default timeout to 0': async ({pass, fail}) => {
    const { container, el } = await createSpeechToText();
    if(el.timeout !== 0){
      cleanup(container);
      return fail(`Expected timeout to default to 0, got ${el.timeout}`);
    }
    cleanup(container);
    pass('Default timeout is 0');
  },

  'should reflect timeout attribute': async ({pass, fail}) => {
    const { container, el } = await createSpeechToText({ timeout: 5 });
    if(el.timeout !== 5){
      cleanup(container);
      return fail(`Expected timeout to be 5, got ${el.timeout}`);
    }
    cleanup(container);
    pass('timeout attribute reflects to property');
  },

  'should auto-stop after timeout elapses': async ({pass, fail}) => {
    const { container, el } = await createSpeechToText({ timeout: 0.05 });
    let stopCalled = false;
    el.stop = () => { stopCalled = true; };
    el.handleStart();
    await new Promise(r => setTimeout(r, 100));
    if(!stopCalled){
      cleanup(container);
      return fail('stop() should be called automatically after timeout elapses');
    }
    cleanup(container);
    pass('Auto-stop fires after timeout');
  },

  'should not auto-stop when timeout is 0': async ({pass, fail}) => {
    const { container, el } = await createSpeechToText();
    let stopCalled = false;
    el.stop = () => { stopCalled = true; };
    el.handleStart();
    await new Promise(r => setTimeout(r, 100));
    if(stopCalled){
      cleanup(container);
      return fail('stop() should NOT be called when timeout is 0');
    }
    cleanup(container);
    pass('No auto-stop when timeout is 0');
  },

  'should clear pending timeout when end fires before timeout': async ({pass, fail}) => {
    const { container, el } = await createSpeechToText({ timeout: 0.2 });
    let stopCalled = false;
    el.stop = () => { stopCalled = true; };
    el.handleStart();
    el.handleEnd();
    await new Promise(r => setTimeout(r, 250));
    if(stopCalled){
      cleanup(container);
      return fail('Timeout should be cleared when end fires early');
    }
    cleanup(container);
    pass('Pending timeout cleared on early end');
  },

  'should keep last interim when a later empty result event fires': async ({pass, fail}) => {
    const { container, el } = await createSpeechToText();
    let endText = null;
    el.addEventListener('end', (e) => { endText = e.detail.text; });
    el.handleStart();
    // First, an interim transcript
    el.handleResult({
      resultIndex: 0,
      results: [
        Object.assign([{ transcript: 'hello world' }], { isFinal: false })
      ]
    });
    // Then Chrome fires a settling event whose iteration produces nothing
    // (resultIndex past the end of the array — no new content)
    el.handleResult({
      resultIndex: 1,
      results: [
        Object.assign([{ transcript: 'hello world' }], { isFinal: false })
      ]
    });
    el.handleEnd();
    if(endText !== 'hello world'){
      cleanup(container);
      return fail(`end event should preserve last interim across empty events, got "${endText}"`);
    }
    cleanup(container);
    pass('Last interim preserved across empty result events');
  }
};
