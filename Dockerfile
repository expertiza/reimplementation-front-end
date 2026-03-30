# Multi-stage build for Vite React application

# Stage 1: Build the application
# Use Debian-based Node (not Alpine): Vite/Rollup native optional deps often break on musl
# ("Cannot find module @rollup/rollup-linux-x64-musl") when npm omits optional packages.
FROM node:20-bookworm-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files. Rollup helper is inlined below so the image builds even if `docker/*.cjs`
# was never committed (common gap when cloning on VCL).
COPY package.json package-lock.json ./

RUN mkdir -p docker && cat > docker/ensure-rollup-linux-gnu.cjs << 'END_ROLLUP_HELPER'
#!/usr/bin/env node
/**
 * Vite nests rollup under node_modules/vite/node_modules/rollup, so
 * require.resolve('rollup/package.json') from /app often fails. Ensures
 * @rollup/rollup-linux-x64-gnu is installed for the Rollup version in use.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = process.cwd();

try {
  require('@rollup/rollup-linux-x64-gnu');
  process.exit(0);
} catch (_) {
  /* continue */
}

function findRollupPackageJson() {
  const candidates = [
    path.join(root, 'node_modules', 'rollup', 'package.json'),
    path.join(root, 'node_modules', 'vite', 'node_modules', 'rollup', 'package.json'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  const out = execSync('find node_modules -path "*/rollup/package.json" 2>/dev/null | head -1', {
    encoding: 'utf8',
    cwd: root,
  }).trim();
  return out ? path.resolve(root, out) : null;
}

const rollupJson = findRollupPackageJson();
if (!rollupJson) {
  console.error('ensure-rollup-linux-gnu: could not find rollup/package.json under node_modules');
  process.exit(1);
}

const pkg = require(rollupJson);
const v = pkg.optionalDependencies && pkg.optionalDependencies['@rollup/rollup-linux-x64-gnu'];
if (!v) {
  console.error('ensure-rollup-linux-gnu: rollup has no optionalDependencies[@rollup/rollup-linux-x64-gnu]');
  process.exit(1);
}

execSync(`npm install --no-save @rollup/rollup-linux-x64-gnu@${v}`, {
  stdio: 'inherit',
  cwd: root,
});
END_ROLLUP_HELPER

# Lockfiles from macOS + npm optional-deps bugs often skip `@rollup/rollup-linux-x64-gnu`.
RUN npm install --no-audit --no-fund && node docker/ensure-rollup-linux-gnu.cjs

# Copy source code. `node_modules` must be in `.dockerignore`; if it is not, macOS
# artifacts land here and break Rollup — detect and reinstall.
COPY . .

RUN if [ -d node_modules/@rollup/rollup-darwin-arm64 ] || [ -d node_modules/@rollup/rollup-darwin-x64 ]; then \
      echo 'WARNING: host node_modules detected; reinstalling for Linux'; \
      rm -rf node_modules && npm install --no-audit --no-fund; \
    fi && \
    node docker/ensure-rollup-linux-gnu.cjs

# Build the application
RUN npm run build

# Stage 2: Serve the application with nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration (optional - for SPA routing)
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

