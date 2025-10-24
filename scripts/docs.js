import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { getArgs, runChildNodeProcessScript } from 'kempo-server/utils/cli';

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
  build = false,
  noBuild = false,
  src = false
} = options;

if(build && !noBuild){
    console.log('Building component files...');
  await runChildNodeProcessScript(join(__dirname, 'build.js'));
  console.log('Component files built!');
}

const rootDir = 'docs';
const configFile = src ? 
  join(__dirname, '../docs/dev.config.json') : 
  join(__dirname, '../docs/prod.config.json');

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