import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\x1b[32m%s\x1b[0m', '==================================================');
console.log('\x1b[32m%s\x1b[0m', '  🚀 Starting WhatsApp Web Pro (Server + Client)  ');
console.log('\x1b[32m%s\x1b[0m', '==================================================\n');

// 1. Start Server
const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

const serverProcess = spawn(npmCmd, ['start'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'pipe',
  shell: true
});

serverProcess.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[36m[SERVER]\x1b[0m ${data}`);
});
serverProcess.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[31m[SERVER ERR]\x1b[0m ${data}`);
});

// 2. Start Client
const clientProcess = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'pipe',
  shell: true
});

clientProcess.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[32m[CLIENT]\x1b[0m ${data}`);
});
clientProcess.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[33m[CLIENT ERR]\x1b[0m ${data}`);
});

process.on('SIGINT', () => {
  serverProcess.kill();
  clientProcess.kill();
  process.exit();
});
