import {
  camelToDash,
  dashToCamel,
  isCamelCase,
  getCase,
  escapeHTML,
  unescapeHTML,
  trim,
  compoundKey,
  toTitleCase
} from '../../src/utils/string.js';
import stringDefault from '../../src/utils/string.js';

export default {
  'should export all functions as named exports': ({pass, fail}) => {
    if(typeof camelToDash === 'function' &&
       typeof dashToCamel === 'function' &&
       typeof isCamelCase === 'function' &&
       typeof getCase === 'function' &&
       typeof escapeHTML === 'function' &&
       typeof unescapeHTML === 'function' &&
       typeof trim === 'function' &&
       typeof compoundKey === 'function' &&
       typeof toTitleCase === 'function'){
      pass('All functions exported correctly');
    } else {
      fail('Not all functions exported correctly');
    }
  },

  'should export default object with all methods': ({pass, fail}) => {
    if(typeof stringDefault.camelToDash === 'function'){
      pass('Default export contains methods');
    } else {
      fail('Default export missing methods');
    }
  },

  'camelToDash should convert camelCase to dash-case': ({pass, fail}) => {
    const result = camelToDash('camelCase');
    if(result === 'camel-case'){
      pass('camelCase converted correctly');
    } else {
      fail(`Expected 'camel-case', got '${result}'`);
    }
  },

  'camelToDash should handle multiple capital letters': ({pass, fail}) => {
    const result = camelToDash('myLongVariableName');
    if(result === 'my-long-variable-name'){
      pass('Multiple capitals converted correctly');
    } else {
      fail(`Expected 'my-long-variable-name', got '${result}'`);
    }
  },

  'camelToDash should handle already lowercase': ({pass, fail}) => {
    const result = camelToDash('lowercase');
    if(result === 'lowercase'){
      pass('Lowercase string unchanged');
    } else {
      fail(`Expected 'lowercase', got '${result}'`);
    }
  },

  'dashToCamel should convert dash-case to camelCase': ({pass, fail}) => {
    const result = dashToCamel('dash-case');
    if(result === 'dashCase'){
      pass('dash-case converted correctly');
    } else {
      fail(`Expected 'dashCase', got '${result}'`);
    }
  },

  'dashToCamel should handle multiple dashes': ({pass, fail}) => {
    const result = dashToCamel('my-long-variable-name');
    if(result === 'myLongVariableName'){
      pass('Multiple dashes converted correctly');
    } else {
      fail(`Expected 'myLongVariableName', got '${result}'`);
    }
  },

  'dashToCamel should handle no dashes': ({pass, fail}) => {
    const result = dashToCamel('nodashes');
    if(result === 'nodashes'){
      pass('String without dashes unchanged');
    } else {
      fail(`Expected 'nodashes', got '${result}'`);
    }
  },

  'isCamelCase should return true for camelCase': ({pass, fail}) => {
    if(isCamelCase('camelCase')){
      pass('camelCase detected correctly');
    } else {
      fail('camelCase not detected');
    }
  },

  'isCamelCase should return false for dash-case': ({pass, fail}) => {
    if(!isCamelCase('dash-case')){
      pass('dash-case detected correctly');
    } else {
      fail('dash-case incorrectly detected as camelCase');
    }
  },

  'isCamelCase should return false for lowercase': ({pass, fail}) => {
    if(!isCamelCase('lowercase')){
      pass('lowercase correctly detected as not camelCase');
    } else {
      fail('lowercase incorrectly detected as camelCase');
    }
  },

  'getCase should return both cases for camelCase input': ({pass, fail}) => {
    const result = getCase('myVariable');
    if(result.camel === 'myVariable' && result.dash === 'my-variable'){
      pass('Both cases returned for camelCase input');
    } else {
      fail(`Got ${JSON.stringify(result)}`);
    }
  },

  'getCase should return both cases for dash-case input': ({pass, fail}) => {
    const result = getCase('my-variable');
    if(result.camel === 'myVariable' && result.dash === 'my-variable'){
      pass('Both cases returned for dash-case input');
    } else {
      fail(`Got ${JSON.stringify(result)}`);
    }
  },

  'escapeHTML should escape &': ({pass, fail}) => {
    const result = escapeHTML('&');
    if(result === '&amp;'){
      pass('& escaped correctly');
    } else {
      fail(`Expected '&amp;', got '${result}'`);
    }
  },

  'escapeHTML should escape <': ({pass, fail}) => {
    const result = escapeHTML('<');
    if(result === '&lt;'){
      pass('< escaped correctly');
    } else {
      fail(`Expected '&lt;', got '${result}'`);
    }
  },

  'escapeHTML should escape >': ({pass, fail}) => {
    const result = escapeHTML('>');
    if(result === '&gt;'){
      pass('> escaped correctly');
    } else {
      fail(`Expected '&gt;', got '${result}'`);
    }
  },

  'escapeHTML should escape "': ({pass, fail}) => {
    const result = escapeHTML('"');
    if(result === '&quot;'){
      pass('" escaped correctly');
    } else {
      fail(`Expected '&quot;', got '${result}'`);
    }
  },

  'escapeHTML should escape single quote': ({pass, fail}) => {
    const result = escapeHTML("'");
    if(result === '&#39;'){
      pass("' escaped correctly");
    } else {
      fail(`Expected '&#39;', got '${result}'`);
    }
  },

  'escapeHTML should escape /': ({pass, fail}) => {
    const result = escapeHTML('/');
    if(result === '&#x2F;'){
      pass('/ escaped correctly');
    } else {
      fail(`Expected '&#x2F;', got '${result}'`);
    }
  },

  'escapeHTML should escape full HTML string': ({pass, fail}) => {
    const result = escapeHTML('<script>alert("XSS")</script>');
    if(result === '&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;'){
      pass('Full HTML string escaped correctly');
    } else {
      fail(`Got '${result}'`);
    }
  },

  'unescapeHTML should unescape &amp;': ({pass, fail}) => {
    const result = unescapeHTML('&amp;');
    if(result === '&'){
      pass('&amp; unescaped correctly');
    } else {
      fail(`Expected '&', got '${result}'`);
    }
  },

  'unescapeHTML should unescape &lt;': ({pass, fail}) => {
    const result = unescapeHTML('&lt;');
    if(result === '<'){
      pass('&lt; unescaped correctly');
    } else {
      fail(`Expected '<', got '${result}'`);
    }
  },

  'unescapeHTML should unescape &gt;': ({pass, fail}) => {
    const result = unescapeHTML('&gt;');
    if(result === '>'){
      pass('&gt; unescaped correctly');
    } else {
      fail(`Expected '>', got '${result}'`);
    }
  },

  'unescapeHTML should unescape &quot;': ({pass, fail}) => {
    const result = unescapeHTML('&quot;');
    if(result === '"'){
      pass('&quot; unescaped correctly');
    } else {
      fail(`Expected '"', got '${result}'`);
    }
  },

  'unescapeHTML should unescape &#39;': ({pass, fail}) => {
    const result = unescapeHTML('&#39;');
    if(result === "'"){
      pass("&#39; unescaped correctly");
    } else {
      fail(`Expected "'", got '${result}'`);
    }
  },

  'unescapeHTML should unescape &#x2F;': ({pass, fail}) => {
    const result = unescapeHTML('&#x2F;');
    if(result === '/'){
      pass('&#x2F; unescaped correctly');
    } else {
      fail(`Expected '/', got '${result}'`);
    }
  },

  'escapeHTML and unescapeHTML round trip': ({pass, fail}) => {
    const original = '<div class="test">Hello & Goodbye</div>';
    const escaped = escapeHTML(original);
    const unescaped = unescapeHTML(escaped);
    if(unescaped === original){
      pass('Round trip works correctly');
    } else {
      fail(`Expected '${original}', got '${unescaped}'`);
    }
  },

  'trim should remove specified characters from both ends': ({pass, fail}) => {
    const result = trim('...hello...', '.');
    if(result === 'hello'){
      pass('Specified characters trimmed');
    } else {
      fail(`Expected 'hello', got '${result}'`);
    }
  },

  'trim should handle multiple characters': ({pass, fail}) => {
    const result = trim('.-hello-.', '.-');
    if(result === 'hello'){
      pass('Multiple characters trimmed');
    } else {
      fail(`Expected 'hello', got '${result}'`);
    }
  },

  'trim should not affect middle of string': ({pass, fail}) => {
    const result = trim('...hel.lo...', '.');
    if(result === 'hel.lo'){
      pass('Middle of string preserved');
    } else {
      fail(`Expected 'hel.lo', got '${result}'`);
    }
  },

  'compoundKey should join keys with dot': ({pass, fail}) => {
    const result = compoundKey(['a', 'b', 'c']);
    if(result === 'a.b.c'){
      pass('Keys joined correctly');
    } else {
      fail(`Expected 'a.b.c', got '${result}'`);
    }
  },

  'compoundKey should trim leading/trailing dots': ({pass, fail}) => {
    const result = compoundKey(['.a', 'b', 'c.']);
    if(result === 'a.b.c'){
      pass('Dots trimmed correctly');
    } else {
      fail(`Expected 'a.b.c', got '${result}'`);
    }
  },

  'compoundKey should handle empty strings': ({pass, fail}) => {
    const result = compoundKey(['', 'a', '', 'b', '']);
    if(result === 'a..b'){
      pass('Empty strings handled');
    } else {
      fail(`Expected 'a..b', got '${result}'`);
    }
  },

  'toTitleCase should convert lowercase to title case': ({pass, fail}) => {
    const result = toTitleCase('hello world');
    if(result === 'Hello World'){
      pass('Lowercase converted correctly');
    } else {
      fail(`Expected 'Hello World', got '${result}'`);
    }
  },

  'toTitleCase should handle camelCase': ({pass, fail}) => {
    const result = toTitleCase('camelCaseString');
    if(result === 'Camel Case String'){
      pass('camelCase converted correctly');
    } else {
      fail(`Expected 'Camel Case String', got '${result}'`);
    }
  },

  'toTitleCase should handle snake_case': ({pass, fail}) => {
    const result = toTitleCase('snake_case_string');
    if(result === 'Snake Case String'){
      pass('snake_case converted correctly');
    } else {
      fail(`Expected 'Snake Case String', got '${result}'`);
    }
  },

  'toTitleCase should handle kebab-case': ({pass, fail}) => {
    const result = toTitleCase('kebab-case-string');
    if(result === 'Kebab Case String'){
      pass('kebab-case converted correctly');
    } else {
      fail(`Expected 'Kebab Case String', got '${result}'`);
    }
  },

  'toTitleCase should handle mixed case': ({pass, fail}) => {
    const result = toTitleCase('mixedCase_string-here');
    if(result === 'Mixed Case String Here'){
      pass('Mixed case converted correctly');
    } else {
      fail(`Expected 'Mixed Case String Here', got '${result}'`);
    }
  },

  'toTitleCase should handle single word': ({pass, fail}) => {
    const result = toTitleCase('word');
    if(result === 'Word'){
      pass('Single word converted correctly');
    } else {
      fail(`Expected 'Word', got '${result}'`);
    }
  },

  'toTitleCase should handle empty string': ({pass, fail}) => {
    const result = toTitleCase('');
    if(result === ''){
      pass('Empty string handled correctly');
    } else {
      fail(`Expected '', got '${result}'`);
    }
  }
};
