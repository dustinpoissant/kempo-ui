import { boolTrueFalse, boolExists } from '../../src/utils/propConverters.js';

export default {
  'should export boolTrueFalse converter': ({pass, fail}) => {
    if(typeof boolTrueFalse === 'object' &&
       typeof boolTrueFalse.fromAttribute === 'function' &&
       typeof boolTrueFalse.toAttribute === 'function'){
      pass('boolTrueFalse exported correctly');
    } else {
      fail('boolTrueFalse not exported correctly');
    }
  },

  'should export boolExists converter': ({pass, fail}) => {
    if(typeof boolExists === 'object' &&
       typeof boolExists.fromAttribute === 'function' &&
       typeof boolExists.toAttribute === 'function'){
      pass('boolExists exported correctly');
    } else {
      fail('boolExists not exported correctly');
    }
  },

  'boolTrueFalse.fromAttribute should return true for "true"': ({pass, fail}) => {
    const result = boolTrueFalse.fromAttribute('true');
    if(result === true){
      pass('Returns true for "true"');
    } else {
      fail(`Expected true, got ${result}`);
    }
  },

  'boolTrueFalse.fromAttribute should return true for "TRUE"': ({pass, fail}) => {
    const result = boolTrueFalse.fromAttribute('TRUE');
    if(result === true){
      pass('Returns true for "TRUE" (case insensitive)');
    } else {
      fail(`Expected true, got ${result}`);
    }
  },

  'boolTrueFalse.fromAttribute should return false for "false"': ({pass, fail}) => {
    const result = boolTrueFalse.fromAttribute('false');
    if(result === false){
      pass('Returns false for "false"');
    } else {
      fail(`Expected false, got ${result}`);
    }
  },

  'boolTrueFalse.fromAttribute should return false for other strings': ({pass, fail}) => {
    const result = boolTrueFalse.fromAttribute('other');
    if(result === false){
      pass('Returns false for other strings');
    } else {
      fail(`Expected false, got ${result}`);
    }
  },

  'boolTrueFalse.fromAttribute should return undefined for null': ({pass, fail}) => {
    const result = boolTrueFalse.fromAttribute(null);
    if(result === undefined){
      pass('Returns undefined for null');
    } else {
      fail(`Expected undefined, got ${result}`);
    }
  },

  'boolTrueFalse.toAttribute should return "true" for true': ({pass, fail}) => {
    const result = boolTrueFalse.toAttribute(true);
    if(result === 'true'){
      pass('Returns "true" for true');
    } else {
      fail(`Expected 'true', got '${result}'`);
    }
  },

  'boolTrueFalse.toAttribute should return "false" for false': ({pass, fail}) => {
    const result = boolTrueFalse.toAttribute(false);
    if(result === 'false'){
      pass('Returns "false" for false');
    } else {
      fail(`Expected 'false', got '${result}'`);
    }
  },

  'boolTrueFalse.toAttribute should return "false" for falsy values': ({pass, fail}) => {
    const result = boolTrueFalse.toAttribute(0);
    if(result === 'false'){
      pass('Returns "false" for falsy value');
    } else {
      fail(`Expected 'false', got '${result}'`);
    }
  },

  'boolTrueFalse.toAttribute should return "true" for truthy values': ({pass, fail}) => {
    const result = boolTrueFalse.toAttribute(1);
    if(result === 'true'){
      pass('Returns "true" for truthy value');
    } else {
      fail(`Expected 'true', got '${result}'`);
    }
  },

  'boolExists.fromAttribute should return true for empty string': ({pass, fail}) => {
    const result = boolExists.fromAttribute('');
    if(result === true){
      pass('Returns true for empty string (attribute present)');
    } else {
      fail(`Expected true, got ${result}`);
    }
  },

  'boolExists.fromAttribute should return true for any string': ({pass, fail}) => {
    const result = boolExists.fromAttribute('anything');
    if(result === true){
      pass('Returns true for any string');
    } else {
      fail(`Expected true, got ${result}`);
    }
  },

  'boolExists.fromAttribute should return false for null': ({pass, fail}) => {
    const result = boolExists.fromAttribute(null);
    if(result === false){
      pass('Returns false for null (attribute absent)');
    } else {
      fail(`Expected false, got ${result}`);
    }
  },

  'boolExists.toAttribute should return empty string for true': ({pass, fail}) => {
    const result = boolExists.toAttribute(true);
    if(result === ''){
      pass('Returns empty string for true');
    } else {
      fail(`Expected '', got '${result}'`);
    }
  },

  'boolExists.toAttribute should return null for false': ({pass, fail}) => {
    const result = boolExists.toAttribute(false);
    if(result === null){
      pass('Returns null for false');
    } else {
      fail(`Expected null, got ${result}`);
    }
  },

  'boolExists.toAttribute should return empty string for truthy': ({pass, fail}) => {
    const result = boolExists.toAttribute('truthy');
    if(result === ''){
      pass('Returns empty string for truthy value');
    } else {
      fail(`Expected '', got '${result}'`);
    }
  },

  'boolExists.toAttribute should return null for falsy': ({pass, fail}) => {
    const result = boolExists.toAttribute(0);
    if(result === null){
      pass('Returns null for falsy value');
    } else {
      fail(`Expected null, got ${result}`);
    }
  },

  'boolTrueFalse round trip for true': ({pass, fail}) => {
    const attr = boolTrueFalse.toAttribute(true);
    const value = boolTrueFalse.fromAttribute(attr);
    if(value === true){
      pass('Round trip for true works');
    } else {
      fail(`Expected true, got ${value}`);
    }
  },

  'boolTrueFalse round trip for false': ({pass, fail}) => {
    const attr = boolTrueFalse.toAttribute(false);
    const value = boolTrueFalse.fromAttribute(attr);
    if(value === false){
      pass('Round trip for false works');
    } else {
      fail(`Expected false, got ${value}`);
    }
  },

  'boolExists round trip for true': ({pass, fail}) => {
    const attr = boolExists.toAttribute(true);
    const value = boolExists.fromAttribute(attr);
    if(value === true){
      pass('Round trip for true works');
    } else {
      fail(`Expected true, got ${value}`);
    }
  },

  'boolExists round trip for false': ({pass, fail}) => {
    const attr = boolExists.toAttribute(false);
    const value = boolExists.fromAttribute(attr);
    if(value === false){
      pass('Round trip for false works');
    } else {
      fail(`Expected false, got ${value}`);
    }
  }
};
