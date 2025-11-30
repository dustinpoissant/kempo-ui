import createContext, { createContext as namedCreateContext } from '../../src/utils/context.js';

export default {
  'should export createContext as default and named export': ({pass, fail}) => {
    if(typeof createContext === 'function' && typeof namedCreateContext === 'function'){
      pass('createContext exported correctly as both default and named export');
    } else {
      fail('createContext not exported correctly');
    }
  },

  'should create a context with undefined initial value': ({pass, fail}) => {
    const ctx = createContext('test-undefined');
    if(ctx.get() === undefined){
      pass('Context created with undefined initial value');
    } else {
      fail(`Expected undefined, got ${ctx.get()}`);
    }
  },

  'should create a context with provided initial value': ({pass, fail}) => {
    const ctx = createContext('test-initial', 'hello');
    if(ctx.get() === 'hello'){
      pass('Context created with initial value');
    } else {
      fail(`Expected 'hello', got ${ctx.get()}`);
    }
  },

  'should use global as default context name': ({pass, fail}) => {
    const ctx1 = createContext();
    ctx1.set('global-test-value');
    const ctx2 = createContext();
    if(ctx2.get() === 'global-test-value'){
      pass('Default context name is global and shared');
    } else {
      fail(`Expected 'global-test-value', got ${ctx2.get()}`);
    }
  },

  'should set and get context value': ({pass, fail}) => {
    const ctx = createContext('test-set-get');
    ctx.set(42);
    if(ctx.get() === 42){
      pass('Context value set and retrieved correctly');
    } else {
      fail(`Expected 42, got ${ctx.get()}`);
    }
  },

  'should share state between contexts with same name': ({pass, fail}) => {
    const ctx1 = createContext('shared-context');
    const ctx2 = createContext('shared-context');
    ctx1.set('shared-value');
    if(ctx2.get() === 'shared-value'){
      pass('Contexts with same name share state');
    } else {
      fail(`Expected 'shared-value', got ${ctx2.get()}`);
    }
  },

  'should not share state between contexts with different names': ({pass, fail}) => {
    const ctx1 = createContext('context-a', 'value-a');
    const ctx2 = createContext('context-b', 'value-b');
    if(ctx1.get() === 'value-a' && ctx2.get() === 'value-b'){
      pass('Contexts with different names have separate state');
    } else {
      fail(`Expected separate values, got ctx1: ${ctx1.get()}, ctx2: ${ctx2.get()}`);
    }
  },

  'should not overwrite existing value with new initial value': ({pass, fail}) => {
    const ctx1 = createContext('existing-value-context', 'first');
    const ctx2 = createContext('existing-value-context', 'second');
    if(ctx1.get() === 'first' && ctx2.get() === 'first'){
      pass('Existing value not overwritten by second initial value');
    } else {
      fail(`Expected 'first' for both, got ctx1: ${ctx1.get()}, ctx2: ${ctx2.get()}`);
    }
  },

  'should call subscriber immediately with current value on subscribe': ({pass, fail}) => {
    const ctx = createContext('subscribe-immediate', 'initial');
    let receivedValue = null;
    ctx.subscribe(val => {
      receivedValue = val;
    });
    if(receivedValue === 'initial'){
      pass('Subscriber called immediately with current value');
    } else {
      fail(`Expected 'initial', got ${receivedValue}`);
    }
  },

  'should notify subscribers when value changes': ({pass, fail}) => {
    const ctx = createContext('subscribe-notify');
    const values = [];
    ctx.subscribe(val => {
      values.push(val);
    });
    ctx.set('updated');
    if(values.length === 2 && values[0] === undefined && values[1] === 'updated'){
      pass('Subscriber notified on value change');
    } else {
      fail(`Expected [undefined, 'updated'], got ${JSON.stringify(values)}`);
    }
  },

  'should support multiple subscribers': ({pass, fail}) => {
    const ctx = createContext('multi-subscriber');
    let count1 = 0;
    let count2 = 0;
    ctx.subscribe(() => count1++);
    ctx.subscribe(() => count2++);
    ctx.set('trigger');
    if(count1 === 2 && count2 === 2){
      pass('Multiple subscribers notified');
    } else {
      fail(`Expected both counts to be 2, got count1: ${count1}, count2: ${count2}`);
    }
  },

  'should return unsubscribe function from subscribe': ({pass, fail}) => {
    const ctx = createContext('unsubscribe-return');
    let callCount = 0;
    const unsubscribe = ctx.subscribe(() => callCount++);
    if(typeof unsubscribe === 'function'){
      pass('Subscribe returns unsubscribe function');
    } else {
      fail(`Expected function, got ${typeof unsubscribe}`);
    }
  },

  'should unsubscribe using returned function': ({pass, fail}) => {
    const ctx = createContext('unsubscribe-test');
    let callCount = 0;
    const unsubscribe = ctx.subscribe(() => callCount++);
    unsubscribe();
    ctx.set('after-unsubscribe');
    if(callCount === 1){
      pass('Subscriber not called after unsubscribe');
    } else {
      fail(`Expected 1 call (initial), got ${callCount}`);
    }
  },

  'should unsubscribe using unsubscribe method': ({pass, fail}) => {
    const ctx = createContext('unsubscribe-method');
    let callCount = 0;
    const handler = () => callCount++;
    ctx.subscribe(handler);
    ctx.unsubscribe(handler);
    ctx.set('after-unsubscribe');
    if(callCount === 1){
      pass('Subscriber not called after unsubscribe method');
    } else {
      fail(`Expected 1 call (initial), got ${callCount}`);
    }
  },

  'should handle complex values': ({pass, fail}) => {
    const ctx = createContext('complex-value');
    const obj = {nested: {value: [1, 2, 3]}};
    ctx.set(obj);
    const retrieved = ctx.get();
    if(retrieved === obj && retrieved.nested.value[1] === 2){
      pass('Complex object stored and retrieved correctly');
    } else {
      fail('Complex object not handled correctly');
    }
  },

  'should handle null value': ({pass, fail}) => {
    const ctx = createContext('null-value');
    ctx.set(null);
    if(ctx.get() === null){
      pass('Null value handled correctly');
    } else {
      fail(`Expected null, got ${ctx.get()}`);
    }
  },

  'should handle function values': ({pass, fail}) => {
    const ctx = createContext('function-value');
    const fn = () => 'test';
    ctx.set(fn);
    if(ctx.get() === fn && ctx.get()() === 'test'){
      pass('Function value stored and retrieved correctly');
    } else {
      fail('Function value not handled correctly');
    }
  },

  'should notify all subscribers in order': ({pass, fail}) => {
    const ctx = createContext('subscriber-order');
    const order = [];
    ctx.subscribe(() => order.push(1));
    ctx.subscribe(() => order.push(2));
    ctx.subscribe(() => order.push(3));
    order.length = 0;
    ctx.set('trigger');
    if(order.join(',') === '1,2,3'){
      pass('Subscribers called in order');
    } else {
      fail(`Expected '1,2,3', got '${order.join(',')}'`);
    }
  },

  'should allow re-subscribing after unsubscribe': ({pass, fail}) => {
    const ctx = createContext('resubscribe');
    let callCount = 0;
    const handler = () => callCount++;
    ctx.subscribe(handler);
    ctx.unsubscribe(handler);
    callCount = 0;
    ctx.subscribe(handler);
    ctx.set('trigger');
    if(callCount === 2){
      pass('Re-subscribe after unsubscribe works');
    } else {
      fail(`Expected 2 calls after resubscribe, got ${callCount}`);
    }
  }
};
