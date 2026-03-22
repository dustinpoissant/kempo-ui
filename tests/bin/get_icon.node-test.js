import { execFile } from 'child_process';

/*
  Utility Functions
*/

const run = (args) => new Promise((resolve) => {
  const proc = execFile('node', ['bin/get_icon.js', ...args], (error, stdout, stderr) => {
    resolve({ code: proc.exitCode ?? error?.code, stdout, stderr });
  });
});

/*
  Tests
*/

export default {
  'should exit with error when no icon name provided': async ({pass, fail}) => {
    const {code, stderr} = await run([]);
    if(code !== 0 && stderr.includes('Usage')){
      pass('Shows usage and exits with error');
    } else {
      fail(`Expected error exit with usage, got code=${code}, stderr="${stderr}"`);
    }
  },
};
