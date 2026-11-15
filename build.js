const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 [Cloudflare Build] Starting automated build for InternMatch AI...');

const clientDir = path.join(__dirname, 'client');
const clientBuild = path.join(clientDir, 'build');
const rootBuild = path.join(__dirname, 'build');

try {
  // 1. Install client dependencies if not already present
  if (!fs.existsSync(path.join(clientDir, 'node_modules'))) {
    console.log('📦 Installing client dependencies in client/...');
    execSync('npm install --include=dev', { cwd: clientDir, stdio: 'inherit' });
  } else {
    console.log('📦 Client node_modules found, proceeding directly to build...');
  }

  // 2. Build React client with CI=false to prevent CI servers treating warnings as errors
  console.log('⚡ Building React production bundle (CI=false)...');
  const buildEnv = {
    ...process.env,
    CI: 'false',
    GENERATE_SOURCEMAP: 'false',
    DISABLE_ESLINT_PLUGIN: 'true'
  };
  execSync('npm run build', { cwd: clientDir, stdio: 'inherit', env: buildEnv });

  // 3. Sync to root /build so Cloudflare finds the output
  if (fs.existsSync(clientBuild)) {
    console.log('📁 Syncing client/build to root ./build for Cloudflare compatibility...');
    fs.cpSync(clientBuild, rootBuild, { recursive: true });

    // Clean up any legacy _redirects to avoid Cloudflare code 100324 loop error
    const rootRedirects = path.join(rootBuild, '_redirects');
    if (fs.existsSync(rootRedirects)) fs.unlinkSync(rootRedirects);
    const clientRedirects = path.join(clientBuild, '_redirects');
    if (fs.existsSync(clientRedirects)) fs.unlinkSync(clientRedirects);
  }

  console.log('🎉 [Cloudflare Build] All assets compiled and ready for deployment!');
} catch (err) {
  console.error('❌ Build failed:', err.message);
  process.exit(1);
}
