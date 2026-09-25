import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const host = '127.0.0.1';
const apiPort = 3100;
const sites = [
  { name: 'Customer UI', dir: join(root, 'apps/client/build'), port: 4173 },
  { name: 'Admin UI', dir: join(root, 'apps/admin/build'), port: 4174 },
];
const apiUrl = `http://${host}:${apiPort}/api/v1`;
const mime = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
};

function build() {
  const result = spawnSync('npm run build', {
    cwd: root,
    env: { ...process.env, REACT_APP_API_URL: apiUrl },
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) throw new Error(`Build failed (${result.status ?? result.error?.message})`);
}

async function serveFile(dir, request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405).end();
    return;
  }
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, `http://${host}`).pathname);
  } catch {
    response.writeHead(400).end();
    return;
  }
  let file = resolve(dir, `.${pathname}`);
  if (file !== dir && !file.startsWith(`${dir}${sep}`)) {
    response.writeHead(403).end();
    return;
  }
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
  } catch {
    if (extname(pathname)) {
      response.writeHead(404).end();
      return;
    }
    file = join(dir, 'index.html');
  }
  try {
    const body = await readFile(file);
    response.writeHead(200, {
      'Content-Type': mime[extname(file)] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch {
    response.writeHead(404).end();
  }
}

async function main() {
  if (process.argv.includes('--skip-build')) {
    for (const site of sites) await stat(join(site.dir, 'index.html'));
    await stat(join(root, 'apps/api/dist/main.js'));
  } else {
    build();
  }
  const servers = [];
  let api;
  let stopping = false;
  const stop = () => {
    if (stopping) return;
    stopping = true;
    for (const server of servers) server.close();
    api?.kill();
  };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
  try {
    for (const site of sites) {
      const server = createServer((request, response) => {
        void serveFile(site.dir, request, response);
      });
      await new Promise((done, fail) => {
        server.once('error', fail);
        server.listen(site.port, host, done);
      });
      servers.push(server);
      console.log(`${site.name}: http://${host}:${site.port}`);
    }
    api = spawn(process.execPath, [join(root, 'apps/api/dist/main.js')], {
      cwd: root,
      env: {
        ...process.env,
        NODE_ENV: 'production',
        HOST: host,
        PORT: String(apiPort),
        CORS_ORIGIN: sites.map((site) => `http://${host}:${site.port}`).join(','),
        LOCAL_STAGING_READ_ONLY: 'true',
      },
      stdio: 'inherit',
    });
    api.once('exit', (code) => {
      if (!stopping) {
        console.error(`API stopped (${code ?? 'unknown'}).`);
        stop();
        process.exitCode = code || 1;
      }
    });
    for (let attempt = 0; attempt < 60; attempt += 1) {
      try {
        const health = await fetch(`${apiUrl}/health`);
        if (health.ok) {
          console.log(`API: ${apiUrl} (ready)`);
          console.log('Press Ctrl+C to stop local staging.');
          return;
        }
      } catch { /* API is still starting. */ }
      await new Promise((done) => setTimeout(done, 500));
    }
    throw new Error('API did not become ready within 30 seconds');
  } catch (error) {
    stop();
    throw error;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
