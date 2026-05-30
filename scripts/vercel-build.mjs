/**
 * Vercel Build Script
 * 
 * The `react-router build` command evaluates the SSR bundle after compilation,
 * which triggers `createHonoServer()` from react-router-hono-server. In production
 * mode, this starts a persistent HTTP server via @hono/node-server's `serve()`,
 * preventing the build process from ever exiting.
 * 
 * This wrapper monitors for the build output files, force-exits once they exist,
 * and packages the application using Vercel's Build Output API (v3) in the `.vercel/output` folder.
 */

import { spawn, execSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, rmSync, cpSync } from 'node:fs';
import { resolve } from 'node:path';

const BUILD_SERVER_INDEX = resolve('build/server/index.js');
const BUILD_CLIENT_DIR = resolve('build/client');

// Clean up stale build folders to prevent the file poller from hitting a false positive
if (existsSync(resolve('build'))) {
  console.log('🧹 Cleaning up old build files...');
  rmSync(resolve('build'), { recursive: true, force: true });
}

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
      console.log('✅ Stopping build process (if running/hanging)...');
      child.kill('SIGTERM');
      
      // Let's package the build using Vercel's Build Output API
      try {
        packageForVercel();
        console.log('🎉 Packaging completed successfully!');
        process.exit(0);
      } catch (err) {
        console.error('❌ Error during Vercel packaging:', err);
        process.exit(1);
      }
    }, 5000);
  }
}, 2000);

// If the process exits naturally, just pass through the exit code
child.on('exit', (code) => {
  clearInterval(checker);
  if (!buildComplete) {
    if (code === 0) {
      // Natural success (e.g. on Vercel where process.env.VERCEL is set)
      buildComplete = true;
      try {
        packageForVercel();
        console.log('🎉 Packaging completed successfully!');
        process.exit(0);
      } catch (err) {
        console.error('❌ Error during Vercel packaging:', err);
        process.exit(1);
      }
    } else {
      console.log(`Build process exited with code ${code}`);
      process.exit(code || 0);
    }
  }
});

child.on('error', (err) => {
  clearInterval(checker);
  console.error('Build process error:', err);
  process.exit(1);
});

function packageForVercel() {
  console.log('📦 Packaging for Vercel Build Output API...');

  const outputDir = resolve('.vercel/output');
  
  // Clean up any existing output directory
  if (existsSync(outputDir)) {
    rmSync(outputDir, { recursive: true, force: true });
  }

  // Create directory structures
  const staticDir = resolve(outputDir, 'static');
  const funcDir = resolve(outputDir, 'functions/index.func');
  
  mkdirSync(staticDir, { recursive: true });
  mkdirSync(funcDir, { recursive: true });

  // 1. Copy client-side assets to static directory
  console.log('📁 Copying static assets to .vercel/output/static...');
  cpSync(BUILD_CLIENT_DIR, staticDir, { recursive: true });

  // 2. Copy server-side bundle to the serverless function folder
  console.log('📁 Copying server bundle to .vercel/output/functions/index.func/build/server...');
  const funcBuildServerDir = resolve(funcDir, 'build/server');
  mkdirSync(funcBuildServerDir, { recursive: true });
  cpSync(resolve('build/server'), funcBuildServerDir, { recursive: true });

  // 3. Write Vercel routing configuration
  console.log('📝 Writing .vercel/output/config.json...');
  const config = {
    version: 3,
    routes: [
      {
        handle: 'filesystem'
      },
      {
        src: '/(.*)',
        dest: '/index'
      }
    ]
  };
  writeFileSync(resolve(outputDir, 'config.json'), JSON.stringify(config, null, 2));

  // 4. Write function configuration
  console.log('📝 Writing .vercel/output/functions/index.func/.vc-config.json...');
  const vcConfig = {
    runtime: 'nodejs20.x',
    handler: 'index.js',
    launcherType: 'Nodejs',
    shouldAddHelpers: true
  };
  writeFileSync(resolve(funcDir, '.vc-config.json'), JSON.stringify(vcConfig, null, 2));

  // 5. Write the temporary function entry point index.js
  console.log('📝 Writing temporary .vercel/output/functions/index.func/index.js...');
  const entryCode = `import { handle } from 'hono/vercel';
import app from './build/server/index.js';

export default handle(app);
`;
  writeFileSync(resolve(funcDir, 'index.js'), entryCode);

  // 6. Bundle using esbuild to make the serverless function self-contained and fast
  console.log('⚡ Bundling serverless function with esbuild...');
  execSync(
    'npx esbuild .vercel/output/functions/index.func/index.js --bundle --minify --platform=node --target=node20 --format=esm --outfile=.vercel/output/functions/index.func/index.js --allow-overwrite --external:argon2 --external:fsevents --external:events --external:fs --external:path --external:crypto --external:os --external:http --external:https --external:stream --external:util --external:zlib --external:url --external:net --external:tls --external:dns --external:assert --external:child_process --external:string_decoder --external:timers "--banner:js=import { createRequire } from \'module\'; const require = createRequire(import.meta.url);"',
    { stdio: 'inherit' }
  );

  // 7. Clean up the copied build folder inside the function since it is now bundled in index.js
  console.log('🧹 Cleaning up intermediate build folder inside function...');
  rmSync(resolve(funcDir, 'build'), { recursive: true, force: true });

  // 8. Copy native node_modules dependencies into the function folder
  console.log('📁 Copying native dependencies to function node_modules...');
  const funcNodeModulesDir = resolve(funcDir, 'node_modules');
  mkdirSync(funcNodeModulesDir, { recursive: true });

  const depsToCopy = ['argon2', '@phc/format', 'node-addon-api', 'node-gyp-build'];
  for (const dep of depsToCopy) {
    const srcDepDir = resolve('node_modules', dep);
    const destDepDir = resolve(funcNodeModulesDir, dep);
    if (existsSync(srcDepDir)) {
      mkdirSync(destDepDir, { recursive: true });
      cpSync(srcDepDir, destDepDir, { recursive: true });
    }
  }

  // 9. Write package.json inside functions/index.func to force ES Modules mode and declare external native dependencies
  console.log('📝 Writing .vercel/output/functions/index.func/package.json...');
  const funcPackageJson = {
    type: 'module',
    dependencies: {
      argon2: '^0.43.0'
    }
  };
  writeFileSync(resolve(funcDir, 'package.json'), JSON.stringify(funcPackageJson, null, 2));
}
