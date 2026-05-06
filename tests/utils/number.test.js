import { bound, closest } from '../../src/utils/number.js';

export default {
  /* bound */
  'bound: clamps n within [min, max]': ({pass, fail}) => {
    if(bound(5, 1, 10) === 5) pass('5 within [1,10] returns 5');
    else fail(`Expected 5, got ${bound(5, 1, 10)}`);
  },

  'bound: returns min when n is below range': ({pass, fail}) => {
    if(bound(-5, 0, 100) === 0) pass('returns min');
    else fail(`Expected 0, got ${bound(-5, 0, 100)}`);
  },

  'bound: returns max when n is above range': ({pass, fail}) => {
    if(bound(200, 0, 100) === 100) pass('returns max');
    else fail(`Expected 100, got ${bound(200, 0, 100)}`);
  },

  'bound: returns min when n equals min': ({pass, fail}) => {
    if(bound(1, 1, 10) === 1) pass('returns min');
    else fail(`Expected 1, got ${bound(1, 1, 10)}`);
  },

  'bound: returns max when n equals max': ({pass, fail}) => {
    if(bound(10, 1, 10) === 10) pass('returns max');
    else fail(`Expected 10, got ${bound(10, 1, 10)}`);
  },

  'bound: works when min equals max': ({pass, fail}) => {
    if(bound(0, 5, 5) === 5 && bound(10, 5, 5) === 5) pass('collapses to the single point');
    else fail('Failed collapsed range');
  },

  'bound: works with negative ranges': ({pass, fail}) => {
    if(bound(-3, -10, -1) === -3) pass('negative range works');
    else fail(`Expected -3, got ${bound(-3, -10, -1)}`);
  },

  'bound: works with floats': ({pass, fail}) => {
    if(bound(0.5, 0, 1) === 0.5) pass('float within range');
    else fail(`Expected 0.5, got ${bound(0.5, 0, 1)}`);
  },

  /* closest */
  'closest: returns n when array is empty': ({pass, fail}) => {
    if(closest(7, []) === 7) pass('empty array returns n');
    else fail(`Expected 7, got ${closest(7, [])}`);
  },

  'closest: returns n when array is null': ({pass, fail}) => {
    if(closest(7, null) === 7) pass('null array returns n');
    else fail(`Expected 7, got ${closest(7, null)}`);
  },

  'closest: returns n when array is undefined': ({pass, fail}) => {
    if(closest(7, undefined) === 7) pass('undefined array returns n');
    else fail(`Expected 7, got ${closest(7, undefined)}`);
  },

  'closest: returns single element regardless of distance': ({pass, fail}) => {
    if(closest(99, [5]) === 5) pass('single element returned');
    else fail(`Expected 5, got ${closest(99, [5])}`);
  },

  'closest: returns exact match': ({pass, fail}) => {
    if(closest(10, [5, 10, 25]) === 10) pass('exact match returned');
    else fail(`Expected 10, got ${closest(10, [5, 10, 25])}`);
  },

  'closest: returns closer of two candidates': ({pass, fail}) => {
    if(closest(8, [5, 10, 25]) === 10) pass('10 is closer than 5');
    else fail(`Expected 10, got ${closest(8, [5, 10, 25])}`);
  },

  'closest: returns higher value when two are equidistant': ({pass, fail}) => {
    if(closest(7, [4, 10]) === 10) pass('chose higher on tie (10 vs 4, both dist 3... wait no 7-4=3, 10-7=3)');
    else fail(`Expected 10, got ${closest(7, [4, 10])}`);
  },

  'closest: returns higher when equidistant with more candidates': ({pass, fail}) => {
    if(closest(15, [10, 20]) === 20) pass('equidistant tie broken by higher');
    else fail(`Expected 20, got ${closest(15, [10, 20])}`);
  },

  'closest: returns smallest when all options are above n': ({pass, fail}) => {
    if(closest(1, [10, 20, 30]) === 10) pass('smallest of all-above options returned');
    else fail(`Expected 10, got ${closest(1, [10, 20, 30])}`);
  },

  'closest: returns largest when all options are below n': ({pass, fail}) => {
    if(closest(100, [10, 20, 30]) === 30) pass('largest of all-below options returned');
    else fail(`Expected 30, got ${closest(100, [10, 20, 30])}`);
  },

  'closest: works with negative numbers': ({pass, fail}) => {
    if(closest(-3, [-10, -5, 0]) === -5) pass('-3 closest to -5');
    else fail(`Expected -5, got ${closest(-3, [-10, -5, 0])}`);
  },

  'closest: tie between negative and positive goes to higher (positive)': ({pass, fail}) => {
    if(closest(0, [-5, 5]) === 5) pass('tie goes to 5 over -5');
    else fail(`Expected 5, got ${closest(0, [-5, 5])}`);
  },

  'closest: works with unsorted array': ({pass, fail}) => {
    if(closest(12, [25, 5, 10]) === 10) pass('works with unsorted array');
    else fail(`Expected 10, got ${closest(12, [25, 5, 10])}`);
  }
};
