import fs from 'fs';

/*
  Utility Functions
*/
const read = path => fs.readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

const installed = 'node_modules/kempo-css/dist/kempo.min.css';

/*
  Tests
*/
export default {
  'kempo-css is a dev dependency, so a site that installs only kempo-ui falls back to the CDN': async ({ pass, fail }) => {
    const pkg = JSON.parse(read('package.json'));
    if(!pkg.devDependencies?.['kempo-css']) return fail('kempo-css should be a dev dependency');
    if(pkg.dependencies?.['kempo-css']) return fail('kempo-css should not be a dependency of the package');
    pass('kempo-css is a dev dependency');
  },

  'the docs stylesheet is a copy of the installed kempo-css, with the new table classes': async ({ pass, fail }) => {
    const copy = read('docs/kempo.min.css');
    if(copy !== read(installed)) return fail('docs/kempo.min.css should be the installed kempo-css, run the build to copy it');
    if(!copy.includes('left-headers') || !copy.includes('no-headers')) return fail('The installed kempo-css should have the left-headers and no-headers table classes');
    pass('the docs use the installed kempo-css');
  },

  'docs/init.js sets pathToStylesheet to the local copy beside it': async ({ pass, fail }) => {
    const init = read('docs/init.js');
    if(!/window\.kempo\s*=\s*\{\s*\.\.\.window\.kempo/.test(init)) return fail(`init.js should add to window.kempo, got ${init}`);
    if(!/pathToStylesheet:\s*new URL\('kempo\.min\.css', document\.currentScript\.src\)\.href/.test(init)) return fail(`init.js should point pathToStylesheet at the kempo.min.css beside it, got ${init}`);
    if(init.includes('jsdelivr')) return fail('With kempo-css installed init.js should not use the CDN');
    pass('init.js uses the local copy');
  },

  'both docs templates load init.js after the local stylesheet and before any component': async ({ pass, fail }) => {
    for(const template of ['docs-src/default.template.html', 'docs-src/bare.template.html']){
      const html = read(template);
      const stylesheet = html.indexOf('{{pathToRoot}}kempo.min.css');
      const init = html.indexOf('{{pathToRoot}}init.js');
      const firstModule = html.indexOf('type="module"');
      if(stylesheet === -1) return fail(`${template} should link the local kempo.min.css`);
      if(init === -1 || init < stylesheet) return fail(`${template} should load init.js after the stylesheet`);
      if(firstModule !== -1 && init > firstModule) return fail(`${template} should load init.js before the modules`);
      if(html.includes('cdn.jsdelivr.net/npm/kempo-css')) return fail(`${template} should not link kempo-css from the CDN`);
    }
    pass('the templates load init.js');
  },

  'the dev server rewrites kempo.min.css to the installed kempo-css and serves init.js from docs': async ({ pass, fail }) => {
    const config = (await import(new URL('../../docs-src/.config.js', import.meta.url))).default;
    const routes = config.customRoutes;
    if(routes['kempo.min.css'] !== '../node_modules/kempo-css/dist/kempo.min.css') return fail(`kempo.min.css should come from node_modules, got ${routes['kempo.min.css']}`);
    if(routes['init.js'] !== '../docs/init.js') return fail(`init.js should come from docs, got ${routes['init.js']}`);
    const dev = JSON.parse(read('package.json')).scripts.dev;
    if(/--config/.test(dev)) return fail(`The dev server finds docs-src/.config.js on its own, and --config is resolved from the root, got ${dev}`);
    pass('the dev routes are set');
  },

  'the build copies the installed kempo-css to docs and writes init.js, falling back to the CDN when it is not installed': async ({ pass, fail }) => {
    const build = read('scripts/build.js');
    if(!build.includes("node_modules/kempo-css/dist/kempo.min.css") || !build.includes("'./docs/kempo.min.css'")) return fail('The build should copy the installed kempo.min.css to docs');
    if(!build.includes("'./docs/init.js'")) return fail('The build should write docs/init.js');
    if(!/kempo-css@2\/dist\/kempo\.min\.css/.test(build)) return fail('Without kempo-css installed, init.js should use the kempo-css@2 CDN');
    pass('the build sets up the stylesheet');
  },

  'every icon the icon selector lists has a file in the icons folder': async ({ pass, fail }) => {
    const source = read('src/components/IconSelector.js');
    const list = /static icons = \[([\s\S]*?)\];/.exec(source)?.[1] || '';
    const names = [...list.matchAll(/'([^']+)'/g)].map(match => match[1]);
    if(names.length < 100) return fail(`The list should be found, got ${names.length} names`);
    const missing = names.filter(name => !fs.existsSync(new URL(`../../icons/${name}.svg`, import.meta.url)));
    if(missing.length) return fail(`These icons are listed but have no file: ${missing.join(', ')}`);
    if(new Set(names).size !== names.length) return fail('An icon is listed twice');
    pass('the listed icons exist');
  }
};
