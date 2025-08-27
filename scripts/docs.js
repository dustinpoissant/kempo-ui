import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { getArgs, runChildNodeProcess } from '../src/utils/cli.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const options = getArgs({
  p: 'port',
  b: 'build',
  s: 'src',
  'no-build': 'noBuild'
});

const {
  port = 8083,
  build = true,
  noBuild = false,
  src = false
} = options;

if(build && !noBuild){
  await runChildNodeProcess(join(__dirname, 'build.js'));
}

const rootDir = src ? '.' : 'docs';
const configFile = src ? 
  join(__dirname, '../config/development.json') : 
  join(__dirname, '../config/production.json');

console.log(`Starting kempo-server on port ${port}`);
console.log(`Root: ${rootDir}`);
console.log(`Config: ${configFile}`);

const serverArgs = [
  'kempo-server', 
  '--root', rootDir, 
  '--port', port.toString(),
  '--config', configFile
];

const serverProcess = spawn('npx', serverArgs, {
  stdio: 'inherit',
  shell: true
});

serverProcess.on('error', err => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});

process.on('SIGINT', () => {
  serverProcess.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  serverProcess.kill();
  process.exit(0);
});