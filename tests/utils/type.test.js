import { typeOf, isType } from '../../src/utils/type.js';
import typeDefault from '../../src/utils/type.js';

export default {
  'should export typeOf function': ({pass, fail}) => {
    if(typeof typeOf === 'function'){
      pass('typeOf exported correctly');
    } else {
      fail(`Expected function, got ${typeof typeOf}`);
    }
  },

  'should export isType function': ({pass, fail}) => {
    if(typeof isType === 'function'){
      pass('isType exported correctly');
    } else {
      fail(`Expected function, got ${typeof isType}`);
    }
  },

  'should export default object with methods': ({pass, fail}) => {
    if(typeof typeDefault.typeOf === 'function' &&
       typeof typeDefault.isType === 'function'){
      pass('Default export contains all methods');
    } else {
      fail('Default export missing methods');
    }
  },

  'typeOf should return "null" for null': ({pass, fail}) => {
    const result = typeOf(null);
    if(result === 'null'){
      pass('null detected correctly');
    } else {
      fail(`Expected 'null', got '${result}'`);
    }
  },

  'typeOf should return "array" for arrays': ({pass, fail}) => {
    const result = typeOf([1, 2, 3]);
    if(result === 'array'){
      pass('array detected correctly');
    } else {
      fail(`Expected 'array', got '${result}'`);
    }
  },

  'typeOf should return "array" for empty array': ({pass, fail}) => {
    const result = typeOf([]);
    if(result === 'array'){
      pass('empty array detected correctly');
    } else {
      fail(`Expected 'array', got '${result}'`);
    }
  },

  'typeOf should return "string" for strings': ({pass, fail}) => {
    const result = typeOf('hello');
    if(result === 'string'){
      pass('string detected correctly');
    } else {
      fail(`Expected 'string', got '${result}'`);
    }
  },

  'typeOf should return "number" for numbers': ({pass, fail}) => {
    const result = typeOf(42);
    if(result === 'number'){
      pass('number detected correctly');
    } else {
      fail(`Expected 'number', got '${result}'`);
    }
  },

  'typeOf should return "number" for NaN': ({pass, fail}) => {
    const result = typeOf(NaN);
    if(result === 'number'){
      pass('NaN detected as number');
    } else {
      fail(`Expected 'number', got '${result}'`);
    }
  },

  'typeOf should return "boolean" for booleans': ({pass, fail}) => {
    if(typeOf(true) === 'boolean' && typeOf(false) === 'boolean'){
      pass('boolean detected correctly');
    } else {
      fail('boolean not detected correctly');
    }
  },

  'typeOf should return "undefined" for undefined': ({pass, fail}) => {
    const result = typeOf(undefined);
    if(result === 'undefined'){
      pass('undefined detected correctly');
    } else {
      fail(`Expected 'undefined', got '${result}'`);
    }
  },

  'typeOf should return "function" for functions': ({pass, fail}) => {
    const result = typeOf(() => {});
    if(result === 'function'){
      pass('function detected correctly');
    } else {
      fail(`Expected 'function', got '${result}'`);
    }
  },

  'typeOf should return "function" for arrow functions': ({pass, fail}) => {
    const fn = x => x;
    const result = typeOf(fn);
    if(result === 'function'){
      pass('arrow function detected correctly');
    } else {
      fail(`Expected 'function', got '${result}'`);
    }
  },

  'typeOf should return "object" for plain objects': ({pass, fail}) => {
    const result = typeOf({a: 1});
    if(result === 'object'){
      pass('object detected correctly');
    } else {
      fail(`Expected 'object', got '${result}'`);
    }
  },

  'typeOf should return "object" for empty object': ({pass, fail}) => {
    const result = typeOf({});
    if(result === 'object'){
      pass('empty object detected correctly');
    } else {
      fail(`Expected 'object', got '${result}'`);
    }
  },

  'typeOf should return "symbol" for symbols': ({pass, fail}) => {
    const result = typeOf(Symbol('test'));
    if(result === 'symbol'){
      pass('symbol detected correctly');
    } else {
      fail(`Expected 'symbol', got '${result}'`);
    }
  },

  'typeOf should return "bigint" for BigInt': ({pass, fail}) => {
    const result = typeOf(BigInt(123));
    if(result === 'bigint'){
      pass('bigint detected correctly');
    } else {
      fail(`Expected 'bigint', got '${result}'`);
    }
  },

  'isType should return true for matching type': ({pass, fail}) => {
    if(isType('hello', 'string')){
      pass('isType returns true for matching type');
    } else {
      fail('isType should return true for matching type');
    }
  },

  'isType should return false for non-matching type': ({pass, fail}) => {
    if(!isType('hello', 'number')){
      pass('isType returns false for non-matching type');
    } else {
      fail('isType should return false for non-matching type');
    }
  },

  'isType should work with null': ({pass, fail}) => {
    if(isType(null, 'null')){
      pass('isType works with null');
    } else {
      fail('isType should work with null');
    }
  },

  'isType should work with array': ({pass, fail}) => {
    if(isType([1, 2], 'array')){
      pass('isType works with array');
    } else {
      fail('isType should work with array');
    }
  },

  'isType should work with object': ({pass, fail}) => {
    if(isType({}, 'object')){
      pass('isType works with object');
    } else {
      fail('isType should work with object');
    }
  },

  'isType should distinguish array from object': ({pass, fail}) => {
    if(!isType([], 'object') && isType([], 'array')){
      pass('isType distinguishes array from object');
    } else {
      fail('isType should distinguish array from object');
    }
  },

  'isType should distinguish null from object': ({pass, fail}) => {
    if(!isType(null, 'object') && isType(null, 'null')){
      pass('isType distinguishes null from object');
    } else {
      fail('isType should distinguish null from object');
    }
  }
};
