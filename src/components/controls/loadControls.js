/*
  Helper for loading control modules referenced in a Lit template.

  Given one or more Lit TemplateResult objects (or null/undefined which
  are ignored), this walks each template's static `strings` array,
  extracts every `<kc-*>` tag name, and dynamic-imports the matching
  module from src/components/controls/.

  Tag → module path mapping:
    <kc-bold>           → ./controls/Bold.js
    <kc-font-size>      → ./controls/FontSize.js
    <kc-fold-all>       → ./controls/FoldAll.js
    <k-control-group>   → ./ControlGroup.js  (special-cased; lives outside controls/)

  Tags resolve to PascalCase filenames: kebab segments after the prefix
  are joined and uppercased. Already-loaded modules are skipped so the
  helper is safe to call repeatedly.
*/

const TAG_RE = /<(kc-[a-z][a-z0-9-]*|k-control-group)\b/g;
const loaded = new Set();

const tagToModulePath = (tag) => {
  if(tag === 'k-control-group') return '../ControlGroup.js';
  const segments = tag.slice('kc-'.length).split('-');
  const pascal = segments.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
  return `./${pascal}.js`;
};

const collectTags = (templates) => {
  const tags = new Set();
  const visit = (t) => {
    if(!t) return;
    if(Array.isArray(t)){ t.forEach(visit); return; }
    if(t.strings){
      for(const s of t.strings){
        let m;
        TAG_RE.lastIndex = 0;
        while((m = TAG_RE.exec(s)) !== null) tags.add(m[1]);
      }
    }
    if(typeof t === 'object'){
      for(const v of Object.values(t)){
        if(v && (Array.isArray(v) || v.strings)) visit(v);
      }
    }
  };
  visit(templates);
  return tags;
};

const loadControls = async (templates) => {
  const tags = collectTags(templates);
  const base = new URL('./', import.meta.url).href;
  const imports = [];
  for(const tag of tags){
    if(loaded.has(tag)) continue;
    loaded.add(tag);
    const path = tagToModulePath(tag);
    imports.push(import(/* @vite-ignore */ new URL(path, base).href));
  }
  if(imports.length) await Promise.all(imports);
};

export default loadControls;
export { collectTags, tagToModulePath };
