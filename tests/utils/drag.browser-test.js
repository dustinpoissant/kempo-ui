import drag from '../../src/utils/drag.js';

const createMouseEvent = (type, pageX, pageY, button = 0) => {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    button,
    clientX: pageX,
    clientY: pageY,
    view: window
  });
  Object.defineProperty(event, 'pageX', {value: pageX, writable: false});
  Object.defineProperty(event, 'pageY', {value: pageY, writable: false});
  return event;
};

const createTouchEvent = (type, pageX, pageY) => {
  const touchInit = {
    identifier: 0,
    target: document.body,
    clientX: pageX,
    clientY: pageY,
    pageX: pageX,
    pageY: pageY,
    screenX: pageX,
    screenY: pageY
  };
  const touch = new Touch(touchInit);
  return new TouchEvent(type, {
    bubbles: true,
    cancelable: true,
    touches: type === 'touchend' ? [] : [touch],
    changedTouches: [touch],
    targetTouches: type === 'touchend' ? [] : [touch]
  });
};

export const afterEach = () => {
  document.body.innerHTML = '';
};

export default {
  'should export a function': ({pass, fail}) => {
    if(typeof drag === 'function'){
      pass('drag is a function');
    } else {
      fail(`Expected function, got ${typeof drag}`);
    }
  },

  'should return a cleanup function': ({pass, fail}) => {
    const element = document.createElement('div');
    document.body.appendChild(element);
    const cleanup = drag({element});
    if(typeof cleanup === 'function'){
      cleanup();
      pass('Returns cleanup function');
    } else {
      fail(`Expected cleanup function, got ${typeof cleanup}`);
    }
  },

  'should call startCallback on mousedown': ({pass, fail}) => {
    const element = document.createElement('div');
    document.body.appendChild(element);
    let called = false;
    let receivedDiff = null;
    const cleanup = drag({
      element,
      startCallback: diff => {
        called = true;
        receivedDiff = diff;
      }
    });
    element.dispatchEvent(createMouseEvent('mousedown', 100, 200));
    cleanup();
    if(called && receivedDiff.x === 0 && receivedDiff.y === 0){
      pass('startCallback called with initial diff of 0,0');
    } else {
      fail(`Expected called=true, x=0, y=0. Got called=${called}, diff=${JSON.stringify(receivedDiff)}`);
    }
  },

  'should call moveCallback on mousemove': ({pass, fail}) => {
    const element = document.createElement('div');
    document.body.appendChild(element);
    let moveDiff = null;
    const cleanup = drag({
      element,
      moveCallback: diff => {
        moveDiff = diff;
      }
    });
    element.dispatchEvent(createMouseEvent('mousedown', 100, 100));
    window.dispatchEvent(createMouseEvent('mousemove', 150, 120));
    window.dispatchEvent(createMouseEvent('mouseup', 150, 120));
    cleanup();
    if(moveDiff && moveDiff.x === 50 && moveDiff.y === 20){
      pass('moveCallback called with correct diff');
    } else {
      fail(`Expected x=50, y=20. Got ${JSON.stringify(moveDiff)}`);
    }
  },

  'should call endCallback on mouseup': ({pass, fail}) => {
    const element = document.createElement('div');
    document.body.appendChild(element);
    let endDiff = null;
    const cleanup = drag({
      element,
      endCallback: diff => {
        endDiff = diff;
      }
    });
    element.dispatchEvent(createMouseEvent('mousedown', 100, 100));
    window.dispatchEvent(createMouseEvent('mousemove', 200, 150));
    window.dispatchEvent(createMouseEvent('mouseup', 200, 150));
    cleanup();
    if(endDiff && endDiff.x === 100 && endDiff.y === 50){
      pass('endCallback called with correct diff');
    } else {
      fail(`Expected x=100, y=50. Got ${JSON.stringify(endDiff)}`);
    }
  },

  'should call general callback on move': ({pass, fail}) => {
    const element = document.createElement('div');
    document.body.appendChild(element);
    let callbackCalled = false;
    const cleanup = drag({
      element,
      callback: () => {
        callbackCalled = true;
      }
    });
    element.dispatchEvent(createMouseEvent('mousedown', 100, 100));
    window.dispatchEvent(createMouseEvent('mousemove', 150, 120));
    window.dispatchEvent(createMouseEvent('mouseup', 150, 120));
    cleanup();
    if(callbackCalled){
      pass('General callback was called during drag');
    } else {
      fail('General callback was not called');
    }
  },

  'should pass options through to callbacks': ({pass, fail}) => {
    const element = document.createElement('div');
    document.body.appendChild(element);
    let receivedOptions = null;
    const cleanup = drag({
      element,
      customData: 'test-value',
      endCallback: diff => {
        receivedOptions = diff;
      }
    });
    element.dispatchEvent(createMouseEvent('mousedown', 100, 100));
    window.dispatchEvent(createMouseEvent('mouseup', 150, 150));
    cleanup();
    if(receivedOptions && receivedOptions.customData === 'test-value'){
      pass('Custom options passed to callback');
    } else {
      fail(`Expected customData='test-value', got ${JSON.stringify(receivedOptions)}`);
    }
  },

  'should ignore right-click (button !== 0)': ({pass, fail}) => {
    const element = document.createElement('div');
    document.body.appendChild(element);
    let called = false;
    const cleanup = drag({
      element,
      startCallback: () => {
        called = true;
      }
    });
    element.dispatchEvent(createMouseEvent('mousedown', 100, 100, 2));
    cleanup();
    if(!called){
      pass('Right-click ignored');
    } else {
      fail('Right-click should not trigger drag');
    }
  },

  'should handle touchstart': ({pass, fail}) => {
    const element = document.createElement('div');
    document.body.appendChild(element);
    let called = false;
    const cleanup = drag({
      element,
      startCallback: () => {
        called = true;
      }
    });
    element.dispatchEvent(createTouchEvent('touchstart', 100, 100));
    window.dispatchEvent(createTouchEvent('touchend', 100, 100));
    cleanup();
    if(called){
      pass('touchstart triggers drag');
    } else {
      fail('touchstart should trigger drag');
    }
  },

  'should handle touchmove': ({pass, fail}) => {
    const element = document.createElement('div');
    document.body.appendChild(element);
    let moveDiff = null;
    const cleanup = drag({
      element,
      moveCallback: diff => {
        moveDiff = diff;
      }
    });
    element.dispatchEvent(createTouchEvent('touchstart', 100, 100));
    window.dispatchEvent(createTouchEvent('touchmove', 150, 130));
    window.dispatchEvent(createTouchEvent('touchend', 150, 130));
    cleanup();
    if(moveDiff && moveDiff.x === 50 && moveDiff.y === 30){
      pass('touchmove calculates correct diff');
    } else {
      fail(`Expected x=50, y=30. Got ${JSON.stringify(moveDiff)}`);
    }
  },

  'should handle touchend': ({pass, fail}) => {
    const element = document.createElement('div');
    document.body.appendChild(element);
    let endDiff = null;
    const cleanup = drag({
      element,
      endCallback: diff => {
        endDiff = diff;
      }
    });
    element.dispatchEvent(createTouchEvent('touchstart', 0, 0));
    window.dispatchEvent(createTouchEvent('touchmove', 75, 25));
    window.dispatchEvent(createTouchEvent('touchend', 75, 25));
    cleanup();
    if(endDiff && endDiff.x === 75 && endDiff.y === 25){
      pass('touchend calculates correct diff');
    } else {
      fail(`Expected x=75, y=25. Got ${JSON.stringify(endDiff)}`);
    }
  },

  'should remove listeners after cleanup': ({pass, fail}) => {
    const element = document.createElement('div');
    document.body.appendChild(element);
    let callCount = 0;
    const cleanup = drag({
      element,
      startCallback: () => callCount++
    });
    cleanup();
    element.dispatchEvent(createMouseEvent('mousedown', 0, 0));
    if(callCount === 0){
      pass('Listeners removed after cleanup');
    } else {
      fail(`Expected 0 calls after cleanup, got ${callCount}`);
    }
  },

  'should track negative movement': ({pass, fail}) => {
    const element = document.createElement('div');
    document.body.appendChild(element);
    let endDiff = null;
    const cleanup = drag({
      element,
      endCallback: diff => {
        endDiff = diff;
      }
    });
    element.dispatchEvent(createMouseEvent('mousedown', 100, 100));
    window.dispatchEvent(createMouseEvent('mouseup', 50, 30));
    cleanup();
    if(endDiff && endDiff.x === -50 && endDiff.y === -70){
      pass('Negative movement tracked correctly');
    } else {
      fail(`Expected x=-50, y=-70. Got ${JSON.stringify(endDiff)}`);
    }
  },

  'should not start until the pointer has moved the threshold, and report nothing for a click': async ({pass, fail}) => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const seen = { started: 0, ended: 0 };
    const stop = drag({ element: el, threshold: 5, startCallback: () => seen.started++, endCallback: () => seen.ended++ });
    el.dispatchEvent(createMouseEvent('mousedown', 10, 10));
    window.dispatchEvent(createMouseEvent('mousemove', 12, 10));
    window.dispatchEvent(createMouseEvent('mouseup', 12, 10));
    const afterClick = { ...seen };
    el.dispatchEvent(createMouseEvent('mousedown', 10, 10));
    window.dispatchEvent(createMouseEvent('mousemove', 30, 10));
    window.dispatchEvent(createMouseEvent('mouseup', 30, 10));
    stop();
    el.remove();
    if(afterClick.started || afterClick.ended) return fail(`A click should not start or end a drag: ${JSON.stringify(afterClick)}`);
    if(seen.started !== 1 || seen.ended !== 1) return fail(`A real drag should start and end once: ${JSON.stringify(seen)}`);
    pass('The threshold separates a click from a drag');
  },

  'should ignore a press on something inside that matches ignore': async ({pass, fail}) => {
    const el = document.createElement('div');
    el.innerHTML = '<button>Go</button><span>Drag me</span>';
    document.body.appendChild(el);
    let started = 0;
    const stop = drag({ element: el, ignore: 'button', startCallback: () => started++ });
    el.querySelector('button').dispatchEvent(createMouseEvent('mousedown', 5, 5));
    window.dispatchEvent(createMouseEvent('mouseup', 5, 5));
    const fromButton = started;
    el.querySelector('span').dispatchEvent(createMouseEvent('mousedown', 5, 5));
    window.dispatchEvent(createMouseEvent('mouseup', 5, 5));
    stop();
    el.remove();
    if(fromButton) return fail('A press on the button should not start a drag');
    if(started !== 1) return fail('A press on the rest of the element should start one');
    pass('ignore leaves the inner controls alone');
  },

  'should pass the pointer position in the viewport': async ({pass, fail}) => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    let moved;
    const stop = drag({ element: el, moveCallback: diff => { moved = diff; } });
    el.dispatchEvent(createMouseEvent('mousedown', 10, 10));
    window.dispatchEvent(createMouseEvent('mousemove', 40, 60));
    window.dispatchEvent(createMouseEvent('mouseup', 40, 60));
    stop();
    el.remove();
    if(moved?.clientX !== 40 || moved?.clientY !== 60) return fail(`Got ${JSON.stringify({ clientX: moved?.clientX, clientY: moved?.clientY })}`);
    pass('clientX and clientY are passed');
  }
};
