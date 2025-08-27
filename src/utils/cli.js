import { spawn } from 'child_process';

export const getArgs = mapping => {
  const args = {};
  const argv = process.argv.slice(2);
  
  for(let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if(arg.startsWith('-')) {
      const key = arg.replace(/^-+/, '');
      const mappedKey = mapping[key] || key;
      const nextArg = argv[i + 1];
      
      if(nextArg && !nextArg.startsWith('-')) {
        args[mappedKey] = nextArg;
        i++;
      } else {
        args[mappedKey] = true;
      }
    }
  }
  
  return args;
};

export const runChildNodeProcess = scriptPath => {
  const child = spawn('node', [scriptPath], {
    stdio: 'inherit',
    shell: true
  });
  
  return new Promise((resolve, reject) => {
    child.on('close', code => {
      if(code === 0) {
        resolve();
      } else {
        reject(new Error(`Process exited with code ${code}`));
      }
    });
    
    child.on('error', reject);
  });
};
