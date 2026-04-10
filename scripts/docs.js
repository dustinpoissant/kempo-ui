import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { getArgs, runChildNodeProcessScript } from 'kempo-server/utils/cli';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const options = getArgs({
  b: 'build'
});

const { build = false } = options;

if(build === 'true' || build === true){
  console.log('Building component files...');
  await runChildNodeProcessScript(join(__dirname, 'build.js'));
  console.log('Build complete!');
}

process.on('SIGTERM', () => {
  serverProcess.kill();
  process.exit(0);
});