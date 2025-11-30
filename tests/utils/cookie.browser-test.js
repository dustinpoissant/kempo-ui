import { saveCookie, getCookie, deleteCookie } from '../../src/utils/cookie.js';
import cookieDefault from '../../src/utils/cookie.js';

export const afterEach = () => {
  document.cookie.split(';').forEach(cookie => {
    const name = cookie.split('=')[0].trim();
    if(name){
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    }
  });
};

export default {
  'should export saveCookie, getCookie, deleteCookie as named exports': ({pass, fail}) => {
    if(typeof saveCookie === 'function' && 
       typeof getCookie === 'function' && 
       typeof deleteCookie === 'function'){
      pass('All functions exported correctly');
    } else {
      fail('Not all functions exported correctly');
    }
  },

  'should export default object with all methods': ({pass, fail}) => {
    if(typeof cookieDefault.saveCookie === 'function' && 
       typeof cookieDefault.getCookie === 'function' && 
       typeof cookieDefault.deleteCookie === 'function'){
      pass('Default export contains all methods');
    } else {
      fail('Default export missing methods');
    }
  },

  'should save and retrieve a cookie': ({pass, fail}) => {
    saveCookie('test-cookie', 'test-value');
    const value = getCookie('test-cookie');
    if(value === 'test-value'){
      pass('Cookie saved and retrieved correctly');
    } else {
      fail(`Expected 'test-value', got '${value}'`);
    }
  },

  'should return null for non-existent cookie': ({pass, fail}) => {
    const value = getCookie('non-existent-cookie');
    if(value === null){
      pass('Non-existent cookie returns null');
    } else {
      fail(`Expected null, got '${value}'`);
    }
  },

  'should delete a cookie': ({pass, fail}) => {
    saveCookie('delete-test', 'value');
    deleteCookie('delete-test');
    const value = getCookie('delete-test');
    if(value === null){
      pass('Cookie deleted successfully');
    } else {
      fail(`Expected null after delete, got '${value}'`);
    }
  },

  'should overwrite existing cookie with same name': ({pass, fail}) => {
    saveCookie('overwrite-test', 'original');
    saveCookie('overwrite-test', 'updated');
    const value = getCookie('overwrite-test');
    if(value === 'updated'){
      pass('Cookie overwritten correctly');
    } else {
      fail(`Expected 'updated', got '${value}'`);
    }
  },

  'should handle numeric values': ({pass, fail}) => {
    saveCookie('numeric-cookie', '12345');
    const value = getCookie('numeric-cookie');
    if(value === '12345'){
      pass('Numeric value handled correctly');
    } else {
      fail(`Expected '12345', got '${value}'`);
    }
  },

  'should handle empty string value': ({pass, fail}) => {
    saveCookie('empty-cookie', '');
    const value = getCookie('empty-cookie');
    if(value === ''){
      pass('Empty string value handled correctly');
    } else {
      fail(`Expected empty string, got '${value}'`);
    }
  },

  'should handle multiple cookies independently': ({pass, fail}) => {
    saveCookie('cookie-a', 'value-a');
    saveCookie('cookie-b', 'value-b');
    saveCookie('cookie-c', 'value-c');
    const a = getCookie('cookie-a');
    const b = getCookie('cookie-b');
    const c = getCookie('cookie-c');
    if(a === 'value-a' && b === 'value-b' && c === 'value-c'){
      pass('Multiple cookies handled independently');
    } else {
      fail(`Expected separate values, got a: '${a}', b: '${b}', c: '${c}'`);
    }
  },

  'should delete only specified cookie': ({pass, fail}) => {
    saveCookie('keep-cookie', 'keep-value');
    saveCookie('delete-cookie', 'delete-value');
    deleteCookie('delete-cookie');
    const keepValue = getCookie('keep-cookie');
    const deleteValue = getCookie('delete-cookie');
    if(keepValue === 'keep-value' && deleteValue === null){
      pass('Only specified cookie deleted');
    } else {
      fail(`Expected keep: 'keep-value', delete: null. Got keep: '${keepValue}', delete: '${deleteValue}'`);
    }
  },

  'should handle special characters in value': ({pass, fail}) => {
    const specialValue = 'hello%20world';
    saveCookie('special-cookie', specialValue);
    const value = getCookie('special-cookie');
    if(value === specialValue){
      pass('Special characters in value handled correctly');
    } else {
      fail(`Expected '${specialValue}', got '${value}'`);
    }
  },

  'should handle cookie names with similar prefixes': ({pass, fail}) => {
    saveCookie('test', 'value1');
    saveCookie('test-extended', 'value2');
    saveCookie('testing', 'value3');
    const val1 = getCookie('test');
    const val2 = getCookie('test-extended');
    const val3 = getCookie('testing');
    if(val1 === 'value1' && val2 === 'value2' && val3 === 'value3'){
      pass('Similar cookie names handled correctly');
    } else {
      fail(`Got test: '${val1}', test-extended: '${val2}', testing: '${val3}'`);
    }
  }
};
