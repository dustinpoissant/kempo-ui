import { setTheme, getTheme, subscribeToTheme, getCalculatedTheme } from '../../src/utils/theme.js';
import themeDefault from '../../src/utils/theme.js';

export const beforeEach = () => {
  localStorage.removeItem('theme');
  document.documentElement.removeAttribute('theme');
};

export const afterAll = () => {
  localStorage.removeItem('theme');
  document.documentElement.removeAttribute('theme');
};

export default {
  'should export setTheme function': ({pass, fail}) => {
    if(typeof setTheme === 'function'){
      pass('setTheme exported correctly');
    } else {
      fail(`Expected function, got ${typeof setTheme}`);
    }
  },

  'should export getTheme function': ({pass, fail}) => {
    if(typeof getTheme === 'function'){
      pass('getTheme exported correctly');
    } else {
      fail(`Expected function, got ${typeof getTheme}`);
    }
  },

  'should export subscribeToTheme function': ({pass, fail}) => {
    if(typeof subscribeToTheme === 'function'){
      pass('subscribeToTheme exported correctly');
    } else {
      fail(`Expected function, got ${typeof subscribeToTheme}`);
    }
  },

  'should export getCalculatedTheme function': ({pass, fail}) => {
    if(typeof getCalculatedTheme === 'function'){
      pass('getCalculatedTheme exported correctly');
    } else {
      fail(`Expected function, got ${typeof getCalculatedTheme}`);
    }
  },

  'should export default object with methods': ({pass, fail}) => {
    if(typeof themeDefault.get === 'function' &&
       typeof themeDefault.set === 'function' &&
       typeof themeDefault.subscribe === 'function' &&
       typeof themeDefault.getCalculated === 'function'){
      pass('Default export contains all methods');
    } else {
      fail('Default export missing methods');
    }
  },

  'should set and get theme': ({pass, fail}) => {
    setTheme('dark');
    const theme = getTheme();
    if(theme === 'dark'){
      pass('Theme set and retrieved correctly');
    } else {
      fail(`Expected 'dark', got '${theme}'`);
    }
  },

  'should persist theme to localStorage': ({pass, fail}) => {
    setTheme('light');
    const stored = localStorage.getItem('theme');
    if(stored === 'light'){
      pass('Theme persisted to localStorage');
    } else {
      fail(`Expected 'light' in localStorage, got '${stored}'`);
    }
  },

  'should set theme attribute on document': ({pass, fail}) => {
    setTheme('dark');
    const attr = document.documentElement.getAttribute('theme');
    if(attr === 'dark'){
      pass('Theme attribute set on document');
    } else {
      fail(`Expected 'dark' attribute, got '${attr}'`);
    }
  },

  'should notify subscribers on theme change': ({pass, fail}) => {
    const values = [];
    const unsubscribe = subscribeToTheme(val => values.push(val));
    setTheme('light');
    setTheme('dark');
    unsubscribe();
    if(values.length >= 2 && values.includes('light') && values.includes('dark')){
      pass('Subscribers notified on change');
    } else {
      fail(`Expected light and dark in values, got ${JSON.stringify(values)}`);
    }
  },

  'should call subscriber immediately with current value': ({pass, fail}) => {
    setTheme('dark');
    let receivedValue = null;
    const unsubscribe = subscribeToTheme(val => {
      receivedValue = val;
    });
    unsubscribe();
    if(receivedValue === 'dark'){
      pass('Subscriber called immediately with current value');
    } else {
      fail(`Expected 'dark', got '${receivedValue}'`);
    }
  },

  'getCalculatedTheme should return theme when not auto': ({pass, fail}) => {
    setTheme('dark');
    const calculated = getCalculatedTheme();
    if(calculated === 'dark'){
      pass('Returns theme when not auto');
    } else {
      fail(`Expected 'dark', got '${calculated}'`);
    }
  },

  'getCalculatedTheme should return light or dark for auto': ({pass, fail}) => {
    setTheme('auto');
    const calculated = getCalculatedTheme();
    if(calculated === 'light' || calculated === 'dark'){
      pass(`Returns '${calculated}' for auto theme`);
    } else {
      fail(`Expected 'light' or 'dark', got '${calculated}'`);
    }
  },

  'should handle setting auto theme': ({pass, fail}) => {
    setTheme('auto');
    const theme = getTheme();
    if(theme === 'auto'){
      pass('Auto theme set correctly');
    } else {
      fail(`Expected 'auto', got '${theme}'`);
    }
  },

  'should return unsubscribe function from subscribeToTheme': ({pass, fail}) => {
    const unsubscribe = subscribeToTheme(() => {});
    if(typeof unsubscribe === 'function'){
      unsubscribe();
      pass('Returns unsubscribe function');
    } else {
      fail(`Expected function, got ${typeof unsubscribe}`);
    }
  },

  'should stop notifying after unsubscribe': ({pass, fail}) => {
    let callCount = 0;
    const unsubscribe = subscribeToTheme(() => callCount++);
    unsubscribe();
    const countAfterUnsubscribe = callCount;
    setTheme('light');
    setTheme('dark');
    if(callCount === countAfterUnsubscribe){
      pass('Stopped notifying after unsubscribe');
    } else {
      fail(`Expected ${countAfterUnsubscribe} calls, got ${callCount}`);
    }
  },

  'should set auto-theme attribute based on system preference': ({pass, fail}) => {
    const autoTheme = document.documentElement.getAttribute('auto-theme');
    if(autoTheme === 'light' || autoTheme === 'dark'){
      pass(`Auto-theme attribute set to '${autoTheme}'`);
    } else {
      fail(`Expected 'light' or 'dark', got '${autoTheme}'`);
    }
  }
};
