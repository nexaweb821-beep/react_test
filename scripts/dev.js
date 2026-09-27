// Runs the Node API (port 3001) and the Vite dev server (port 5173, proxies /api) together.
import { spawn } from 'node:child_process';

const procs = [
  spawn('node', ['server/server.js', '--port', '3001'], { stdio: 'inherit' }),
  spawn('npx', ['vite'], { stdio: 'inherit', shell: true }),
];

const stop = () => {
  for (const p of procs) if (!p.killed) p.kill();
  process.exit();
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
for (const p of procs) p.on('exit', (code) => code && stop());
