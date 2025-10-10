import debounce from '../../src/utils/debounce.js';

/*
  Utility Functions
*/

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/*
  Tests
*/

export default {
  'should call the function after the specified timeout': async ({pass, fail, log}) => {
    let callCount = 0;
    const debouncedFn = debounce(() => {
      callCount++;
    }, 100);

    debouncedFn();
    
    if(callCount !== 0){
      return fail('Function should not be called immediately');
    }

    await wait(150);
    
    if(callCount === 1){
      log('✓ Function called once after timeout');
      pass('Function was called after the specified timeout');
    } else {
      fail(`Expected 1 call, got ${callCount}`);
    }
  },

  'should cancel previous calls when invoked multiple times': async ({pass, fail, log}) => {
    let callCount = 0;
    const debouncedFn = debounce(() => {
      callCount++;
    }, 100);

    debouncedFn();
    debouncedFn();
    debouncedFn();
    
    if(callCount !== 0){
      return fail('Function should not be called immediately');
    }

    await wait(150);
    
    if(callCount === 1){
      log('✓ Only the last call was executed');
      pass('Previous calls were cancelled, only last call executed');
    } else {
      fail(`Expected 1 call after debouncing 3 invocations, got ${callCount}`);
    }
  },

  'should pass arguments to the debounced function': async ({pass, fail, log}) => {
    let receivedArgs = null;
    const debouncedFn = debounce((...args) => {
      receivedArgs = args;
    }, 100);

    debouncedFn('hello', 42, {key: 'value'});
    
    await wait(150);
    
    if(receivedArgs && 
       receivedArgs[0] === 'hello' && 
       receivedArgs[1] === 42 && 
       receivedArgs[2]?.key === 'value'){
      log('✓ Arguments passed correctly');
      pass('All arguments were passed to the debounced function');
    } else {
      fail(`Arguments not passed correctly. Got: ${JSON.stringify(receivedArgs)}`);
    }
  },

  'should use default timeout of 300ms when not specified': async ({pass, fail, log}) => {
    let callCount = 0;
    const debouncedFn = debounce(() => {
      callCount++;
    });

    debouncedFn();
    
    await wait(250);
    if(callCount !== 0){
      return fail('Function should not be called before 300ms');
    }
    
    await wait(100);
    
    if(callCount === 1){
      log('✓ Default timeout of 300ms works correctly');
      pass('Function was called after default 300ms timeout');
    } else {
      fail(`Expected 1 call after 350ms, got ${callCount}`);
    }
  },

  'should handle rapid successive calls': async ({pass, fail, log}) => {
    let callCount = 0;
    const debouncedFn = debounce(() => {
      callCount++;
    }, 100);

    for(let i = 0; i < 10; i++){
      debouncedFn();
      await wait(20);
    }
    
    if(callCount !== 0){
      return fail('Function should not be called during rapid invocations');
    }

    await wait(150);
    
    if(callCount === 1){
      log('✓ Only called once after 10 rapid invocations');
      pass('Debounce correctly handled rapid successive calls');
    } else {
      fail(`Expected 1 call after rapid invocations, got ${callCount}`);
    }
  },

  'should allow multiple independent debounced functions': async ({pass, fail, log}) => {
    let count1 = 0;
    let count2 = 0;
    
    const debouncedFn1 = debounce(() => {
      count1++;
    }, 100);
    
    const debouncedFn2 = debounce(() => {
      count2++;
    }, 100);

    debouncedFn1();
    debouncedFn2();
    
    await wait(150);
    
    if(count1 === 1 && count2 === 1){
      log('✓ Both independent debounced functions executed');
      pass('Multiple debounced functions work independently');
    } else {
      fail(`Expected both counts to be 1, got count1: ${count1}, count2: ${count2}`);
    }
  },

  'should work with different timeout values': async ({pass, fail, log}) => {
    let shortCount = 0;
    let longCount = 0;
    
    const shortDebounce = debounce(() => {
      shortCount++;
    }, 50);
    
    const longDebounce = debounce(() => {
      longCount++;
    }, 200);

    shortDebounce();
    longDebounce();
    
    await wait(100);
    
    if(shortCount !== 1){
      return fail(`Short debounce should have been called. Got ${shortCount} calls`);
    }
    if(longCount !== 0){
      return fail(`Long debounce should not have been called yet. Got ${longCount} calls`);
    }
    
    await wait(150);
    
    if(longCount === 1){
      log('✓ Different timeout values work correctly');
      pass('Both short and long debounce timeouts worked as expected');
    } else {
      fail(`Long debounce should have been called. Got ${longCount} calls`);
    }
  },

  'should update arguments when called multiple times': async ({pass, fail, log}) => {
    let receivedValue = null;
    const debouncedFn = debounce((value) => {
      receivedValue = value;
    }, 100);

    debouncedFn('first');
    await wait(20);
    debouncedFn('second');
    await wait(20);
    debouncedFn('third');
    
    await wait(150);
    
    if(receivedValue === 'third'){
      log('✓ Most recent arguments were used');
      pass('Debounced function used the last set of arguments');
    } else {
      fail(`Expected 'third', got '${receivedValue}'`);
    }
  }
};
