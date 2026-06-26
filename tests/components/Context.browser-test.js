import Context from '../../src/components/Context.js';
import LightComponent from '../../src/components/LightComponent.js';

const createContext = async () => {
  const container = document.createElement('div');
  container.innerHTML = `<k-context></k-context>`;
  document.body.appendChild(container);
  const el = container.querySelector('k-context');
  await el.updateComplete;
  return { container, el };
};

const createPersistentContext = async (persistentId) => {
  const container = document.createElement('div');
  container.innerHTML = `<k-context persistent-id="${persistentId}"></k-context>`;
  document.body.appendChild(container);
  const el = container.querySelector('k-context');
  await el.updateComplete;
  return { container, el };
};

const storageKey = (id) => `context-persistent-id-${id}`;

const cleanup = (container) => {
  if(container && container.parentNode){
    container.parentNode.removeChild(container);
  }
};

export default {
  /*
    Element Creation
  */
  'should create context element': async ({pass, fail}) => {
    const { container, el } = await createContext();
    if(!(el instanceof Context)){
      cleanup(container);
      return fail('Element should be instance of Context');
    }
    cleanup(container);
    pass('Context element created correctly');
  },

  'should extend LightComponent': async ({pass, fail}) => {
    const { container, el } = await createContext();
    if(!(el instanceof LightComponent)){
      cleanup(container);
      return fail('Context should extend LightComponent');
    }
    cleanup(container);
    pass('Context extends LightComponent');
  },

  'should have display contents': async ({pass, fail}) => {
    const { container, el } = await createContext();
    const display = getComputedStyle(el).display;
    if(display !== 'contents'){
      cleanup(container);
      return fail(`Expected display to be contents, got "${display}"`);
    }
    cleanup(container);
    pass('Context element has display contents');
  },

  'should have default data of \'{}\'': async ({pass, fail}) => {
    const { container, el } = await createContext();
    if(el.data !== '{}'){
      cleanup(container);
      return fail(`Expected data to be '{}', got '${el.data}'`);
    }
    cleanup(container);
    pass('Default data is \'{}\'');
  },

  'data attribute reflects JSON state': async ({pass, fail}) => {
    const { container, el } = await createContext();
    el.set('count', 5);
    await el.updateComplete;
    let parsed;
    try { parsed = JSON.parse(el.getAttribute('data')); } catch(e) {
      cleanup(container);
      return fail('data attribute is not valid JSON');
    }
    if(parsed.count !== 5){
      cleanup(container);
      return fail(`Expected data attribute to contain count:5, got ${el.getAttribute('data')}`);
    }
    cleanup(container);
    pass('data attribute reflects JSON state');
  },

  /*
    set() and get()
  */
  'should set and get a value': async ({pass, fail}) => {
    const { container, el } = await createContext();
    el.set('user', { name: 'Alice' });
    const value = el.get('user');
    if(!value || value.name !== 'Alice'){
      cleanup(container);
      return fail(`Expected {name:'Alice'}, got ${JSON.stringify(value)}`);
    }
    cleanup(container);
    pass('set and get work correctly');
  },

  /*
    has()
  */
  'has() returns true for existing key': async ({pass, fail}) => {
    const { container, el } = await createContext();
    el.set('theme', 'dark');
    if(!el.has('theme')){
      cleanup(container);
      return fail('has() should return true for existing key');
    }
    cleanup(container);
    pass('has() returns true for existing key');
  },

  'has() returns false for missing key': async ({pass, fail}) => {
    const { container, el } = await createContext();
    if(el.has('missing')){
      cleanup(container);
      return fail('has() should return false for missing key');
    }
    cleanup(container);
    pass('has() returns false for missing key');
  },

  /*
    Events
  */
  'set() fires context:create for new key': async ({pass, fail}) => {
    const { container, el } = await createContext();
    let received = null;
    el.addEventListener('context:create', e => { received = e.detail; });
    el.set('count', 0);
    if(!received || received.key !== 'count' || received.value !== 0){
      cleanup(container);
      return fail(`Expected context:create with {key:'count',value:0}, got ${JSON.stringify(received)}`);
    }
    cleanup(container);
    pass('context:create fired for new key');
  },

  'set() fires context:set for existing key': async ({pass, fail}) => {
    const { container, el } = await createContext();
    el.set('count', 0);
    let received = null;
    el.addEventListener('context:set', e => { received = e.detail; });
    el.set('count', 1);
    if(!received || received.key !== 'count' || received.value !== 1 || received.oldValue !== 0){
      cleanup(container);
      return fail(`Expected context:set with {key:'count',value:1,oldValue:0}, got ${JSON.stringify(received)}`);
    }
    cleanup(container);
    pass('context:set fired for existing key update');
  },

  'set() does not fire context:create for second set': async ({pass, fail}) => {
    const { container, el } = await createContext();
    el.set('count', 0);
    let createFired = false;
    el.addEventListener('context:create', () => { createFired = true; });
    el.set('count', 1);
    if(createFired){
      cleanup(container);
      return fail('context:create should not fire when updating existing key');
    }
    cleanup(container);
    pass('context:create not fired on update');
  },

  'delete() removes a key and fires context:delete': async ({pass, fail}) => {
    const { container, el } = await createContext();
    el.set('temp', 42);
    let received = null;
    el.addEventListener('context:delete', e => { received = e.detail; });
    el.delete('temp');
    if(el.has('temp')){
      cleanup(container);
      return fail('Key should be removed after delete()');
    }
    if(!received || received.key !== 'temp' || received.value !== 42){
      cleanup(container);
      return fail(`Expected context:delete with {key:'temp',value:42}, got ${JSON.stringify(received)}`);
    }
    cleanup(container);
    pass('delete() removes key and fires context:delete');
  },

  'delete() on missing key does nothing': async ({pass, fail}) => {
    const { container, el } = await createContext();
    let fired = false;
    el.addEventListener('context:delete', () => { fired = true; });
    el.delete('nonexistent');
    if(fired){
      cleanup(container);
      return fail('context:delete should not fire for missing key');
    }
    cleanup(container);
    pass('delete() on missing key is a no-op');
  },

  /*
    clear()
  */
  'clear() removes all keys and fires context:delete for each': async ({pass, fail}) => {
    const { container, el } = await createContext();
    el.set('a', 1);
    el.set('b', 2);
    const deleted = [];
    el.addEventListener('context:delete', e => deleted.push(e.detail.key));
    el.clear();
    if(Object.keys(el.getData()).length !== 0){
      cleanup(container);
      return fail('getData() should return empty object after clear()');
    }
    if(deleted.length !== 2 || !deleted.includes('a') || !deleted.includes('b')){
      cleanup(container);
      return fail(`Expected context:delete for both keys, got: ${JSON.stringify(deleted)}`);
    }
    cleanup(container);
    pass('clear() removes all keys');
  },

  /*
    getData()
  */
  'getData() returns a copy of all data': async ({pass, fail}) => {
    const { container, el } = await createContext();
    el.set('x', 10);
    el.set('y', 20);
    const data = el.getData();
    if(data.x !== 10 || data.y !== 20){
      cleanup(container);
      return fail(`Expected {x:10,y:20}, got ${JSON.stringify(data)}`);
    }
    // ensure it's a copy
    data.x = 999;
    if(el.get('x') !== 10){
      cleanup(container);
      return fail('getData() should return a copy, not a reference');
    }
    cleanup(container);
    pass('getData() returns a shallow copy of all data');
  },

  /*
    persistent-id (localStorage auto save/load)
  */
  'set() writes data to localStorage when persistent-id is set': async ({pass, fail}) => {
    const id = 'persist-set-' + Date.now();
    window.localStorage.removeItem(storageKey(id));
    const { container, el } = await createPersistentContext(id);
    el.set('theme', 'dark');
    let stored;
    try { stored = JSON.parse(window.localStorage.getItem(storageKey(id))); } catch(e) {
      cleanup(container); window.localStorage.removeItem(storageKey(id));
      return fail('localStorage value is not valid JSON');
    }
    cleanup(container); window.localStorage.removeItem(storageKey(id));
    if(!stored || stored.theme !== 'dark'){
      return fail(`Expected stored {theme:'dark'}, got ${JSON.stringify(stored)}`);
    }
    pass('set() persisted to localStorage');
  },

  'restores data from localStorage on connect': async ({pass, fail}) => {
    const id = 'persist-load-' + Date.now();
    window.localStorage.setItem(storageKey(id), JSON.stringify({ count: 7 }));
    const { container, el } = await createPersistentContext(id);
    const value = el.get('count');
    cleanup(container); window.localStorage.removeItem(storageKey(id));
    if(value !== 7){
      return fail(`Expected restored count to be 7, got ${value}`);
    }
    pass('data restored from localStorage on connect');
  },

  'delete() updates localStorage': async ({pass, fail}) => {
    const id = 'persist-delete-' + Date.now();
    window.localStorage.removeItem(storageKey(id));
    const { container, el } = await createPersistentContext(id);
    el.set('a', 1);
    el.set('b', 2);
    el.delete('a');
    let stored;
    try { stored = JSON.parse(window.localStorage.getItem(storageKey(id))); } catch(e) {
      cleanup(container); window.localStorage.removeItem(storageKey(id));
      return fail('localStorage value is not valid JSON');
    }
    cleanup(container); window.localStorage.removeItem(storageKey(id));
    if(!stored || 'a' in stored || stored.b !== 2){
      return fail(`Expected stored to drop 'a' and keep b:2, got ${JSON.stringify(stored)}`);
    }
    pass('delete() updated localStorage');
  },

  'does not write to localStorage without a persistent-id': async ({pass, fail}) => {
    const before = window.localStorage.length;
    const { container, el } = await createContext();
    el.set('x', 1);
    const after = window.localStorage.length;
    cleanup(container);
    if(after !== before){
      return fail('A context without persistent-id should not touch localStorage');
    }
    pass('no persistent-id means no localStorage writes');
  }
};
