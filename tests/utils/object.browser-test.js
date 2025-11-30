import {
  toJson,
  flattenObject,
  flattenedObjects,
  objectSummary,
  clone,
  equalObjs,
  prune,
  getAllKeys,
  getDifferencesKeys,
  diff,
  mapObject
} from '../../src/utils/object.js';
import objectDefault from '../../src/utils/object.js';

export default {
  'should export all functions as named exports': ({pass, fail}) => {
    if(typeof toJson === 'function' &&
       typeof flattenObject === 'function' &&
       typeof flattenedObjects === 'function' &&
       typeof objectSummary === 'function' &&
       typeof clone === 'function' &&
       typeof equalObjs === 'function' &&
       typeof prune === 'function' &&
       typeof getAllKeys === 'function' &&
       typeof getDifferencesKeys === 'function' &&
       typeof diff === 'function' &&
       typeof mapObject === 'function'){
      pass('All functions exported correctly');
    } else {
      fail('Not all functions exported correctly');
    }
  },

  'should export default object with all methods': ({pass, fail}) => {
    if(typeof objectDefault.toJson === 'function'){
      pass('Default export contains methods');
    } else {
      fail('Default export missing methods');
    }
  },

  'toJson should stringify simple object': ({pass, fail}) => {
    const obj = {a: 1, b: 'test'};
    const result = toJson(obj);
    if(result === '{"a":1,"b":"test"}'){
      pass('Simple object stringified correctly');
    } else {
      fail(`Expected '{"a":1,"b":"test"}', got '${result}'`);
    }
  },

  'toJson should handle circular references': ({pass, fail}) => {
    const obj = {a: 1};
    obj.self = obj;
    const result = toJson(obj);
    if(result.includes('<<Circular Reference>>')){
      pass('Circular reference handled');
    } else {
      fail(`Expected circular reference marker, got '${result}'`);
    }
  },

  'toJson should handle functions': ({pass, fail}) => {
    const obj = {fn: () => 'test'};
    const result = toJson(obj);
    if(result.includes('<<Function fn>>')){
      pass('Function handled correctly');
    } else {
      fail(`Expected function marker, got '${result}'`);
    }
  },

  'flattenObject should flatten nested object': ({pass, fail}) => {
    const obj = {a: {b: {c: 1}}};
    const result = flattenObject(obj);
    if(result['a.b.c'] === 1){
      pass('Nested object flattened correctly');
    } else {
      fail(`Expected {a.b.c: 1}, got ${JSON.stringify(result)}`);
    }
  },

  'flattenObject should handle null values': ({pass, fail}) => {
    const obj = {a: null};
    const result = flattenObject(obj);
    if(result['a'] === null){
      pass('Null value handled correctly');
    } else {
      fail(`Expected {a: null}, got ${JSON.stringify(result)}`);
    }
  },

  'flattenObject should respect maxDepth': ({pass, fail}) => {
    const obj = {a: {b: {c: {d: 1}}}};
    const result = flattenObject(obj, 2);
    if(result['a.b'] === '<<Max Depth Reached>>'){
      pass('maxDepth respected');
    } else {
      fail(`Expected max depth marker, got ${JSON.stringify(result)}`);
    }
  },

  'flattenObject should return empty object for null': ({pass, fail}) => {
    const result = flattenObject(null);
    if(Object.keys(result).length === 0){
      pass('Null input returns empty object');
    } else {
      fail(`Expected empty object, got ${JSON.stringify(result)}`);
    }
  },

  'flattenedObjects should flatten multiple objects': ({pass, fail}) => {
    const obj1 = {a: {b: 1}};
    const obj2 = {c: {d: 2}};
    const result = flattenedObjects(obj1, obj2);
    if(result.length === 2 && result[0]['a.b'] === 1 && result[1]['c.d'] === 2){
      pass('Multiple objects flattened');
    } else {
      fail(`Got ${JSON.stringify(result)}`);
    }
  },

  'objectSummary should create summary string': ({pass, fail}) => {
    const obj = {name: 'test', value: 42};
    const result = objectSummary(obj);
    if(result.includes('name = test') && result.includes('value = 42')){
      pass('Object summary created correctly');
    } else {
      fail(`Got '${result}'`);
    }
  },

  'objectSummary should respect maxLength': ({pass, fail}) => {
    const obj = {a: 'very long string that should be truncated'};
    const result = objectSummary(obj, 20);
    if(result.length <= 20){
      pass('maxLength respected');
    } else {
      fail(`Expected length <= 20, got ${result.length}`);
    }
  },

  'clone should deep clone object': ({pass, fail}) => {
    const obj = {a: {b: [1, 2, 3]}};
    const cloned = clone(obj);
    if(cloned.a.b[0] === 1 && cloned !== obj && cloned.a !== obj.a){
      pass('Object deep cloned correctly');
    } else {
      fail('Deep clone failed');
    }
  },

  'clone should handle primitives': ({pass, fail}) => {
    if(clone('string') === 'string' &&
       clone(42) === 42 &&
       clone(true) === true &&
       clone(null) === null &&
       clone(undefined) === undefined){
      pass('Primitives handled correctly');
    } else {
      fail('Primitive cloning failed');
    }
  },

  'clone should handle arrays': ({pass, fail}) => {
    const arr = [1, {a: 2}, [3, 4]];
    const cloned = clone(arr);
    if(cloned[0] === 1 && cloned[1].a === 2 && cloned[2][0] === 3 && cloned !== arr){
      pass('Array cloned correctly');
    } else {
      fail('Array cloning failed');
    }
  },

  'clone should handle symbol': ({pass, fail}) => {
    const result = clone(Symbol('test'));
    if(result === '<<SYMBOL>>'){
      pass('Symbol handled correctly');
    } else {
      fail(`Expected '<<SYMBOL>>', got '${result}'`);
    }
  },

  'clone should handle function': ({pass, fail}) => {
    const result = clone(() => {});
    if(result === '<<function>>'){
      pass('Function handled correctly');
    } else {
      fail(`Expected '<<function>>', got '${result}'`);
    }
  },

  'equalObjs should return true for equal objects': ({pass, fail}) => {
    const obj1 = {a: 1, b: {c: 2}};
    const obj2 = {a: 1, b: {c: 2}};
    if(equalObjs(obj1, obj2)){
      pass('Equal objects detected correctly');
    } else {
      fail('Equal objects not detected');
    }
  },

  'equalObjs should return false for unequal objects': ({pass, fail}) => {
    const obj1 = {a: 1};
    const obj2 = {a: 2};
    if(!equalObjs(obj1, obj2)){
      pass('Unequal objects detected correctly');
    } else {
      fail('Unequal objects not detected');
    }
  },

  'equalObjs should handle multiple objects': ({pass, fail}) => {
    const obj1 = {a: 1};
    const obj2 = {a: 1};
    const obj3 = {a: 1};
    if(equalObjs(obj1, obj2, obj3)){
      pass('Multiple equal objects detected');
    } else {
      fail('Multiple equal objects not detected');
    }
  },

  'equalObjs should return true for single object': ({pass, fail}) => {
    if(equalObjs({a: 1})){
      pass('Single object returns true');
    } else {
      fail('Single object should return true');
    }
  },

  'prune should remove undefined values': ({pass, fail}) => {
    const obj = {a: 1, b: undefined};
    const result = prune(obj);
    if(result.a === 1 && !('b' in result)){
      pass('Undefined values removed');
    } else {
      fail(`Got ${JSON.stringify(result)}`);
    }
  },

  'prune should remove empty strings': ({pass, fail}) => {
    const obj = {a: 'test', b: ''};
    const result = prune(obj);
    if(result.a === 'test' && !('b' in result)){
      pass('Empty strings removed');
    } else {
      fail(`Got ${JSON.stringify(result)}`);
    }
  },

  'prune should remove empty arrays': ({pass, fail}) => {
    const obj = {a: [1, 2], b: []};
    const result = prune(obj);
    if(result.a.length === 2 && !('b' in result)){
      pass('Empty arrays removed');
    } else {
      fail(`Got ${JSON.stringify(result)}`);
    }
  },

  'prune should keep null values': ({pass, fail}) => {
    const obj = {a: null};
    const result = prune(obj);
    if(result.a === null){
      pass('Null values kept');
    } else {
      fail(`Got ${JSON.stringify(result)}`);
    }
  },

  'prune should recursively prune nested objects': ({pass, fail}) => {
    const obj = {a: {b: '', c: 1}};
    const result = prune(obj);
    if(result.a && result.a.c === 1 && !('b' in result.a)){
      pass('Nested objects pruned correctly');
    } else {
      fail(`Got ${JSON.stringify(result)}`);
    }
  },

  'getAllKeys should get unique keys from multiple objects': ({pass, fail}) => {
    const obj1 = {a: 1, b: 2};
    const obj2 = {b: 3, c: 4};
    const keys = getAllKeys(obj1, obj2);
    if(keys.includes('a') && keys.includes('b') && keys.includes('c') && keys.length === 3){
      pass('All unique keys retrieved');
    } else {
      fail(`Got ${JSON.stringify(keys)}`);
    }
  },

  'getDifferencesKeys should find keys with different values': ({pass, fail}) => {
    const obj1 = {a: 1, b: 2, c: 3};
    const obj2 = {a: 1, b: 5, c: 3};
    const keys = getDifferencesKeys(obj1, obj2);
    if(keys.length === 1 && keys[0] === 'b'){
      pass('Different keys found correctly');
    } else {
      fail(`Got ${JSON.stringify(keys)}`);
    }
  },

  'getDifferencesKeys should handle missing keys': ({pass, fail}) => {
    const obj1 = {a: 1, b: 2};
    const obj2 = {a: 1};
    const keys = getDifferencesKeys(obj1, obj2);
    if(keys.includes('b')){
      pass('Missing key detected as difference');
    } else {
      fail(`Got ${JSON.stringify(keys)}`);
    }
  },

  'diff should find differences between objects': ({pass, fail}) => {
    const obj1 = {a: 1, b: 2};
    const obj2 = {a: 1, b: 3};
    const result = diff(obj1, obj2);
    if(result.b && result.b.newValue === 2 && result.b.oldValue === 3){
      pass('Differences found correctly');
    } else {
      fail(`Got ${JSON.stringify(result)}`);
    }
  },

  'diff should handle nested objects': ({pass, fail}) => {
    const obj1 = {a: {b: 1}};
    const obj2 = {a: {b: 2}};
    const result = diff(obj1, obj2);
    if(result['a.b'] && result['a.b'].newValue === 1 && result['a.b'].oldValue === 2){
      pass('Nested differences found correctly');
    } else {
      fail(`Got ${JSON.stringify(result)}`);
    }
  },

  'diff should handle arrays': ({pass, fail}) => {
    const obj1 = {arr: [1, 2, 3]};
    const obj2 = {arr: [1, 2, 4]};
    const result = diff(obj1, obj2);
    if(result.arr){
      pass('Array differences detected');
    } else {
      fail(`Got ${JSON.stringify(result)}`);
    }
  },

  'diff should return empty object for equal objects': ({pass, fail}) => {
    const obj1 = {a: 1, b: 2};
    const obj2 = {a: 1, b: 2};
    const result = diff(obj1, obj2);
    if(Object.keys(result).length === 0){
      pass('Equal objects return empty diff');
    } else {
      fail(`Got ${JSON.stringify(result)}`);
    }
  },

  'mapObject should transform object entries': ({pass, fail}) => {
    const obj = {a: 1, b: 2};
    const result = mapObject(obj, (key, value) => [key.toUpperCase(), value * 2]);
    if(result.A === 2 && result.B === 4){
      pass('Object mapped correctly');
    } else {
      fail(`Got ${JSON.stringify(result)}`);
    }
  },

  'mapObject should handle empty object': ({pass, fail}) => {
    const result = mapObject({}, (k, v) => [k, v]);
    if(Object.keys(result).length === 0){
      pass('Empty object mapped correctly');
    } else {
      fail(`Got ${JSON.stringify(result)}`);
    }
  }
};
