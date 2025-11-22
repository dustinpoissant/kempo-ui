/*
  Context Utility
  - Create global or named shared state
  - Subscribe/unsubscribe to changes
  - Set/get context values
*/

const contexts = {};

const getContext = name => {
  if(!contexts[name]){
    contexts[name] = {
      value: undefined,
      subscribers: new Set()
    };
  }
  return contexts[name];
};

export const createContext = (name = 'global', initialValue) => {
  const ctx = getContext(name);
  if(initialValue !== undefined && ctx.value === undefined){
    ctx.value = initialValue;
  }
  return {
    get: () => ctx.value,
    set: val => {
      ctx.value = val;
      ctx.subscribers.forEach(fn => fn(val));
    },
    subscribe: fn => {
      ctx.subscribers.add(fn);
      fn(ctx.value);
      return () => ctx.subscribers.delete(fn);
    },
    unsubscribe: fn => ctx.subscribers.delete(fn)
  };
};

export default createContext;
