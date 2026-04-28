import voice, {
  getVoice,
  setVoice,
  subscribeToVoice
} from '../../src/utils/voice.js';

const STORAGE_KEY = 'k-voice';

const reset = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch(e) {}
  setVoice('');
};

export default {
  /*
    Get/Set
  */
  'should default to empty string when nothing stored': async ({pass, fail}) => {
    reset();
    if(getVoice() !== ''){
      return fail(`Expected '' default, got "${getVoice()}"`);
    }
    pass('Default voice is empty string');
  },

  'should set and get a voice name': async ({pass, fail}) => {
    reset();
    setVoice('Samantha');
    if(getVoice() !== 'Samantha'){
      reset();
      return fail(`Expected "Samantha", got "${getVoice()}"`);
    }
    reset();
    pass('Set/get round-trips a voice name');
  },

  'should persist voice to localStorage on set': async ({pass, fail}) => {
    reset();
    setVoice('Karen');
    const stored = localStorage.getItem(STORAGE_KEY);
    if(stored !== 'Karen'){
      reset();
      return fail(`Expected localStorage "${STORAGE_KEY}" = "Karen", got "${stored}"`);
    }
    reset();
    pass('setVoice persists to localStorage');
  },

  'should clear localStorage when set to empty': async ({pass, fail}) => {
    reset();
    setVoice('Karen');
    setVoice('');
    const stored = localStorage.getItem(STORAGE_KEY);
    if(stored !== null){
      reset();
      return fail(`Expected localStorage cleared, got "${stored}"`);
    }
    reset();
    pass('Empty setVoice clears localStorage');
  },

  /*
    Subscribe
  */
  'should fire subscriber immediately with current value': async ({pass, fail}) => {
    reset();
    setVoice('Daniel');
    let received = '__none__';
    const off = subscribeToVoice(name => { received = name; });
    off();
    if(received !== 'Daniel'){
      reset();
      return fail(`Subscriber should fire immediately with "Daniel", got "${received}"`);
    }
    reset();
    pass('Subscriber fires immediately with current value');
  },

  'should fire subscribers when voice changes': async ({pass, fail}) => {
    reset();
    const events = [];
    const off = subscribeToVoice(name => { events.push(name); });
    setVoice('Alex');
    setVoice('Karen');
    off();
    // First event is the initial fire (empty), then the two changes
    if(events[events.length - 2] !== 'Alex' || events[events.length - 1] !== 'Karen'){
      reset();
      return fail(`Expected last two events "Alex", "Karen", got ${JSON.stringify(events)}`);
    }
    reset();
    pass('Subscribers fire on every change');
  },

  'should return an unsubscribe function': async ({pass, fail}) => {
    reset();
    let count = 0;
    const off = subscribeToVoice(() => { count++; });
    const initial = count;
    off();
    setVoice('Alex');
    if(count !== initial){
      reset();
      return fail(`Subscriber should not fire after unsubscribe (initial=${initial}, after=${count})`);
    }
    reset();
    pass('Unsubscribe stops further callbacks');
  },

  /*
    Default export
  */
  'default export exposes get/set/subscribe': async ({pass, fail}) => {
    reset();
    if(typeof voice.get !== 'function' || typeof voice.set !== 'function' || typeof voice.subscribe !== 'function'){
      return fail('Default export missing one of get/set/subscribe');
    }
    voice.set('Tessa');
    if(voice.get() !== 'Tessa'){
      reset();
      return fail(`Default export get/set roundtrip failed, got "${voice.get()}"`);
    }
    reset();
    pass('Default export proxies get/set/subscribe');
  }
};
