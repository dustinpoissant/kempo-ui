import closestAcrossShadow, { closestAcrossShadow as named } from '../../src/utils/closestAcrossShadow.js';

const cleanup = (el) => {
  if(el && el.parentNode){
    el.parentNode.removeChild(el);
  }
};

export default {
  'exports the function as default and named export': ({pass, fail}) => {
    if(typeof closestAcrossShadow === 'function' && typeof named === 'function'){
      pass('exported correctly as both default and named export');
    } else {
      fail('not exported correctly');
    }
  },

  'finds an ancestor within the same tree (like closest)': ({pass, fail}) => {
    const root = document.createElement('div');
    root.className = 'target';
    root.innerHTML = '<section><span id="leaf"></span></section>';
    document.body.appendChild(root);
    const found = closestAcrossShadow(root.querySelector('#leaf'), '.target');
    cleanup(root);
    if(found === root){
      pass('found ancestor in the same tree');
    } else {
      fail('did not find ancestor in the same tree');
    }
  },

  'returns the element itself when it matches': ({pass, fail}) => {
    const el = document.createElement('div');
    el.className = 'me';
    document.body.appendChild(el);
    const found = closestAcrossShadow(el, '.me');
    cleanup(el);
    if(found === el){
      pass('returned the element itself');
    } else {
      fail('did not return the element itself');
    }
  },

  'crosses a shadow boundary to find an ancestor': ({pass, fail}) => {
    const host = document.createElement('div');
    host.className = 'target';
    document.body.appendChild(host);
    const inner = document.createElement('span');
    host.attachShadow({ mode: 'open' }).appendChild(inner);
    const found = closestAcrossShadow(inner, '.target');
    cleanup(host);
    if(found === host){
      pass('crossed a shadow boundary');
    } else {
      fail('did not cross the shadow boundary');
    }
  },

  'crosses multiple nested shadow boundaries': ({pass, fail}) => {
    const host = document.createElement('div');
    host.className = 'target';
    document.body.appendChild(host);
    const mid = document.createElement('div');
    host.attachShadow({ mode: 'open' }).appendChild(mid);
    const leaf = document.createElement('span');
    mid.attachShadow({ mode: 'open' }).appendChild(leaf);
    const found = closestAcrossShadow(leaf, '.target');
    cleanup(host);
    if(found === host){
      pass('crossed multiple nested shadow boundaries');
    } else {
      fail('did not cross multiple nested shadow boundaries');
    }
  },

  'returns null when there is no match anywhere': ({pass, fail}) => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const inner = document.createElement('span');
    host.attachShadow({ mode: 'open' }).appendChild(inner);
    const found = closestAcrossShadow(inner, '.nope');
    cleanup(host);
    if(found === null){
      pass('returned null when no match');
    } else {
      fail(`expected null, got ${found}`);
    }
  }
};
