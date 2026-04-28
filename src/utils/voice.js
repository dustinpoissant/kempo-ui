/*
  Voice Utility
  - Manage the user's preferred speech-synthesis voice
  - Subscribe to voice changes
  - Persist voice to localStorage
  - Sync across tabs via the storage event
*/

import createContext from './context.js';

const STORAGE_KEY = 'k-voice';

const getInitialVoice = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored || '';
  } catch(e){
    return '';
  }
};

const voiceContext = createContext('voice', getInitialVoice());

const persist = voice => {
  try {
    if(voice) localStorage.setItem(STORAGE_KEY, voice);
    else localStorage.removeItem(STORAGE_KEY);
  } catch(e) {}
};

voiceContext.subscribe(persist);

if(typeof window !== 'undefined'){
  window.addEventListener('storage', event => {
    if(event.key === STORAGE_KEY){
      voiceContext.set(event.newValue || '');
    }
  });
}

export const setVoice = name => voiceContext.set(name || '');

export const getVoice = () => voiceContext.get();

export const subscribeToVoice = callback => voiceContext.subscribe(callback);

/*
  Helpers for enumerating available voices from the browser.
  getVoices() may return [] on the first call; the browser fires a
  `voiceschanged` event when the list is ready. waitForVoices() returns a
  promise that resolves once the list is populated (or after a small timeout
  if the browser never fires the event).
*/
export const getAvailableVoices = () => {
  if(typeof window === 'undefined' || !window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices();
};

export const waitForVoices = (timeoutMs = 2000) => {
  if(typeof window === 'undefined' || !window.speechSynthesis){
    return Promise.resolve([]);
  }
  const synth = window.speechSynthesis;
  const initial = synth.getVoices();
  if(initial.length > 0) return Promise.resolve(initial);
  return new Promise(resolve => {
    let settled = false;
    const handler = () => {
      if(settled) return;
      settled = true;
      synth.removeEventListener('voiceschanged', handler);
      resolve(synth.getVoices());
    };
    synth.addEventListener('voiceschanged', handler);
    setTimeout(() => {
      if(settled) return;
      settled = true;
      synth.removeEventListener('voiceschanged', handler);
      resolve(synth.getVoices());
    }, timeoutMs);
  });
};

export const subscribeToAvailableVoices = callback => {
  if(typeof window === 'undefined' || !window.speechSynthesis){
    callback([]);
    return () => {};
  }
  const synth = window.speechSynthesis;
  const fire = () => callback(synth.getVoices());
  synth.addEventListener('voiceschanged', fire);
  fire();
  return () => synth.removeEventListener('voiceschanged', fire);
};

export default {
  get: getVoice,
  set: setVoice,
  subscribe: subscribeToVoice,
  getAvailable: getAvailableVoices,
  waitForVoices,
  subscribeAvailable: subscribeToAvailableVoices
};
