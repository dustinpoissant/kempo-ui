import sanitizeHtml from '../../src/utils/sanitizeHtml.js';

export default {
  /*
    Basic safety
  */
  'should remove <script> tags entirely': async ({pass, fail}) => {
    const out = sanitizeHtml('Hello<script>alert(1)</script>world');
    if(/script/i.test(out) || out.includes('alert')){
      return fail(`Expected scripts removed, got "${out}"`);
    }
    if(!out.includes('Hello') || !out.includes('world')){
      return fail(`Expected user text preserved, got "${out}"`);
    }
    pass('<script> removed and surrounding text preserved');
  },

  'should remove <style> tags entirely': async ({pass, fail}) => {
    const out = sanitizeHtml('text<style>body{display:none}</style>more');
    if(/style/i.test(out) || out.includes('display')){
      return fail(`Expected style removed, got "${out}"`);
    }
    pass('<style> removed');
  },

  'should remove <iframe> tags entirely': async ({pass, fail}) => {
    const out = sanitizeHtml('<iframe src="evil.com"></iframe>safe');
    if(/iframe/i.test(out) || out.includes('evil')){
      return fail(`Expected iframe removed, got "${out}"`);
    }
    if(!out.includes('safe')){
      return fail(`Expected following text preserved, got "${out}"`);
    }
    pass('<iframe> removed');
  },

  'should strip event-handler attributes': async ({pass, fail}) => {
    const out = sanitizeHtml('<p onclick="alert(1)" onmouseover="x">hi</p>');
    if(/onclick|onmouseover/i.test(out)){
      return fail(`Expected event handlers stripped, got "${out}"`);
    }
    if(!out.includes('hi')){
      return fail(`Expected text preserved, got "${out}"`);
    }
    pass('Event-handler attributes stripped');
  },

  'should reject javascript: URLs in href': async ({pass, fail}) => {
    const out = sanitizeHtml('<a href="javascript:alert(1)">click</a>');
    if(/javascript:/i.test(out)){
      return fail(`Expected javascript: scheme rejected, got "${out}"`);
    }
    pass('javascript: URL stripped from href');
  },

  'should reject data: URLs in href': async ({pass, fail}) => {
    const out = sanitizeHtml('<a href="data:text/html,<script>alert(1)</script>">click</a>');
    if(/data:/i.test(out)){
      return fail(`Expected data: scheme rejected, got "${out}"`);
    }
    pass('data: URL stripped from href');
  },

  /*
    Allowed content
  */
  'should preserve common formatting tags': async ({pass, fail}) => {
    const out = sanitizeHtml('<p><b>bold</b> <i>italic</i> <u>under</u></p>');
    if(!out.includes('<b>') || !out.includes('<i>') || !out.includes('<u>') || !out.includes('<p>')){
      return fail(`Expected b/i/u/p preserved, got "${out}"`);
    }
    pass('Common formatting tags preserved');
  },

  'should preserve safe https links': async ({pass, fail}) => {
    const out = sanitizeHtml('<a href="https://example.com">link</a>');
    if(!out.includes('href="https://example.com"')){
      return fail(`Expected https link preserved, got "${out}"`);
    }
    pass('https link preserved');
  },

  'should preserve mailto: links': async ({pass, fail}) => {
    const out = sanitizeHtml('<a href="mailto:hi@example.com">email</a>');
    if(!out.includes('mailto:hi@example.com')){
      return fail(`Expected mailto preserved, got "${out}"`);
    }
    pass('mailto: link preserved');
  },

  'should preserve relative URLs': async ({pass, fail}) => {
    const out = sanitizeHtml('<a href="/about">about</a>');
    if(!out.includes('href="/about"')){
      return fail(`Expected relative URL preserved, got "${out}"`);
    }
    pass('Relative URL preserved');
  },

  /*
    target=_blank rel-noopener auto-fix
  */
  'should add rel="noopener noreferrer" to target="_blank" links': async ({pass, fail}) => {
    const out = sanitizeHtml('<a href="https://example.com" target="_blank">x</a>');
    if(!out.includes('target="_blank"') || !out.includes('rel="noopener noreferrer"')){
      return fail(`Expected target+rel auto-fixed, got "${out}"`);
    }
    pass('rel="noopener noreferrer" forced on target="_blank" links');
  },

  /*
    Disallowed-tag fallback (preserve children)
  */
  'should unwrap unknown tags but keep their text': async ({pass, fail}) => {
    const out = sanitizeHtml('<custom>hello <b>world</b></custom>');
    if(/custom/i.test(out)){
      return fail(`Expected <custom> unwrapped, got "${out}"`);
    }
    if(!out.includes('hello') || !out.includes('<b>world</b>')){
      return fail(`Expected children preserved, got "${out}"`);
    }
    pass('Disallowed tag unwrapped, children kept');
  },

  /*
    Comments
  */
  'should remove HTML comments': async ({pass, fail}) => {
    const out = sanitizeHtml('hi<!-- evil --><b>there</b>');
    if(out.includes('evil')){
      return fail(`Expected comment removed, got "${out}"`);
    }
    pass('HTML comments removed');
  },

  /*
    Edge cases
  */
  'should handle null/undefined/empty input': async ({pass, fail}) => {
    if(sanitizeHtml(null) !== '') return fail('null should produce ""');
    if(sanitizeHtml(undefined) !== '') return fail('undefined should produce ""');
    if(sanitizeHtml('') !== '') return fail('empty string should produce ""');
    pass('null/undefined/empty all produce ""');
  },

  'should preserve plain text': async ({pass, fail}) => {
    const out = sanitizeHtml('just some text');
    if(out !== 'just some text'){
      return fail(`Expected pass-through plain text, got "${out}"`);
    }
    pass('Plain text untouched');
  },

  'should keep data-* attributes': async ({pass, fail}) => {
    const out = sanitizeHtml('<span data-id="42">x</span>');
    if(!out.includes('data-id="42"')){
      return fail(`Expected data-id preserved, got "${out}"`);
    }
    pass('data-* attributes preserved');
  },

  /*
    Custom whitelist
  */
  'should respect a custom allowedTags whitelist': async ({pass, fail}) => {
    const out = sanitizeHtml('<b>bold</b><i>italic</i>', {
      allowedTags: new Set(['B'])
    });
    if(!out.includes('<b>bold</b>')){
      return fail(`Expected <b> kept, got "${out}"`);
    }
    if(out.includes('<i>')){
      return fail(`Expected <i> stripped, got "${out}"`);
    }
    if(!out.includes('italic')){
      return fail(`Expected italic text preserved (unwrapped), got "${out}"`);
    }
    pass('Custom whitelist honored');
  }
};
