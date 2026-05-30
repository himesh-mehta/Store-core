/**
 * Vercel Build Script
 * 
 * The `react-router build` command evaluates the SSR bundle after compilation,
 * which triggers `createHonoServer()` from react-router-hono-server. In production
 * mode, this starts a persistent HTTP server via @hono/node-server's `serve()`,
 * preventing the build process from ever exiting.
 * 
 * This wrapper monitors for the build output files and force-exits once they exist,
 * since the actual compilation is complete at that point.
 */

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const BUILD_SERVER_INDEX = resolve('build/server/index.js');
const BUILD_CLIENT_DIR = resolve('build/client');

console.log('🔨 Starting react-router build...');

const child = spawn('npx', ['react-router', 'build'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env },
});

let buildComplete = false;

// Poll for build output files
const checker = setInterval(() => {
  if (buildComplete) return;

  const serverExists = existsSync(BUILD_SERVER_INDEX);
  const clientExists = existsSync(BUILD_CLIENT_DIR);

  if (serverExists && clientExists) {
    buildComplete = true;
    console.log('\n✅ Build output detected. Waiting 5s for any final writes...');
    setTimeout(() => {
      console.log('✅ Force-exiting build process (server was kept alive by createHonoServer).');
      child.kill('SIGTERM');
      setTimeout(() => process.exit(0), 1000);
    }, 5000);
  }
}, 2000);

// If the process exits naturally, just pass through the exit code
child.on('exit', (code) => {
  clearInterval(checker);
  if (!buildComplete) {
    console.log(`Build process exited with code ${code}`);
    process.exit(code || 0);
  }
});

child.on('error', (err) => {
  clearInterval(checker);
  console.error('Build process error:', err);
  process.exit(1);
});
