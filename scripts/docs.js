import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { getArgs, runChildNodeProcessScript } from 'kempo-server/utils/cli';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/*
	Configuration
*/
const options = getArgs({
  p: 'port',
  b: 'build',
  s: 'src'
});

const {
  port = 8083,
  build = null,
  src = false
} = options;

/*
	Build Logic
*/
if(build === null ? !src : build === 'true' || build === true){
    console.log('Building component files...');
  await runChildNodeProcessScript(join(__dirname, 'build.js'));
  console.log('Component files built!');
}

/*
	Server Startup
*/
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