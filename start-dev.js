const { spawn } = require('child_process');

console.log('\n🚀 Starting Credible Backend & Frontend Dev Servers concurrently...\n');

// Spawn Express server
const backend = spawn('node', ['server.js'], {
  stdio: 'inherit',
  shell: true,
});

// Spawn Vite frontend dev server
const frontend = spawn('npx', ['vite'], {
  stdio: 'inherit',
  shell: true,
});

// If either process exits, kill the other and exit
backend.on('exit', (code) => {
  console.log(`Backend server exited with code ${code}`);
  frontend.kill('SIGINT');
  process.exit(code || 0);
});

frontend.on('exit', (code) => {
  console.log(`Frontend dev server exited with code ${code}`);
  backend.kill('SIGINT');
  process.exit(code || 0);
});

// Handle CTRL+C / terminate signal
process.on('SIGINT', () => {
  backend.kill('SIGINT');
  frontend.kill('SIGINT');
  process.exit(0);
});
process.on('SIGTERM', () => {
  backend.kill('SIGTERM');
  frontend.kill('SIGTERM');
  process.exit(0);
});
