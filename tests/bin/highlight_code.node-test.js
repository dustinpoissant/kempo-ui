import { execFile } from 'child_process';

/*
  Utility Functions
*/

const run = (args, stdin) => new Promise((resolve) => {
  const proc = execFile('node', ['bin/highlight_code.js', ...args], (error, stdout, stderr) => {
    resolve({ code: proc.exitCode ?? error?.code, stdout, stderr });
  });
  if(stdin !== undefined){
    proc.stdin.write(stdin);
    proc.stdin.end();
  }
});

/*
  Tests
*/

export default {
  'should exit with error when no arguments provided': async ({pass, fail}) => {
    const {code, stderr} = await run([]);
    if(code !== 0 && stderr.includes('Usage')){
      pass('Shows usage and exits with error');
    } else {
      fail(`Expected error exit with usage message, got code=${code}, stderr="${stderr}"`);
    }
  },

  'should exit with error for unknown language': async ({pass, fail}) => {
    const {code, stderr} = await run(['fakeLang', 'code']);
    if(code !== 0 && stderr.includes('Unknown language')){
      pass('Shows unknown language error');
    } else {
      fail(`Expected unknown language error, got code=${code}, stderr="${stderr}"`);
    }
  },

  'should highlight JavaScript passed as argument': async ({pass, fail}) => {
    const {stdout} = await run(['js', 'const x = 1;']);
    if(stdout.includes('<pre><code class="hljs javascript">') &&
       stdout.includes('</code></pre>') &&
       stdout.includes('<span class="hljs-keyword">const</span>')){
      pass('JavaScript highlighted correctly with wrapper');
    } else {
      fail(`Unexpected output: ${stdout}`);
    }
  },

  'should highlight HTML passed as argument': async ({pass, fail}) => {
    const {stdout} = await run(['html', '<div>hello</div>']);
    if(stdout.includes('<pre><code class="hljs html">') &&
       stdout.includes('</code></pre>') &&
       stdout.includes('hljs-name')){
      pass('HTML highlighted correctly with wrapper');
    } else {
      fail(`Unexpected output: ${stdout}`);
    }
  },

  'should accept language aliases': async ({pass, fail}) => {
    const {stdout} = await run(['js', 'let x = 1;']);
    if(stdout.includes('class="hljs javascript"')){
      pass('Alias "js" resolved to "javascript"');
    } else {
      fail(`Alias not resolved: ${stdout}`);
    }
  },

  'should read code from stdin': async ({pass, fail}) => {
    const {stdout} = await run(['css'], 'body { color: red; }');
    if(stdout.includes('<pre><code class="hljs css">') &&
       stdout.includes('</code></pre>')){
      pass('stdin input highlighted correctly');
    } else {
      fail(`Unexpected output: ${stdout}`);
    }
  },

  'should convert newlines to <br> tags': async ({pass, fail}) => {
    const {stdout} = await run(['js'], 'const x = 1;\nconst y = 2;');
    if(stdout.includes('<br>') && !stdout.includes('\n</code>')){
      pass('Newlines converted to <br>');
    } else {
      fail(`Expected <br> tags: ${stdout}`);
    }
  },

  'should output a single line': async ({pass, fail}) => {
    const {stdout} = await run(['html'], '<div>\n  <p>hello</p>\n</div>');
    const lines = stdout.trim().split('\n');
    if(lines.length === 1){
      pass('Output is a single line');
    } else {
      fail(`Expected 1 line, got ${lines.length}`);
    }
  },

  'should beautify code before highlighting': async ({pass, fail}) => {
    const {stdout} = await run(['html', '<div><p>hello</p></div>']);
    if(stdout.includes('<br>')){
      pass('Beautifier added line breaks (converted to <br>)');
    } else {
      fail(`Expected beautified output with <br>: ${stdout}`);
    }
  },
};
