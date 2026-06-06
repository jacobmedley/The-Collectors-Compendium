#!/usr/bin/env node
/**
 * dev.mjs — local dev server with watch + livereload
 *
 * Zero extra dependencies (Node built-ins only).
 *
 * What it does:
 *  1. Rebuilds index.html on start
 *  2. Serves the repo root on http://localhost:3000
 *  3. Injects development React builds (full error messages) into the served HTML
 *  4. Injects an SSE livereload snippet so the browser auto-refreshes on save
 *  5. Watches collection.jsx; rebuilds + notifies clients on change
 *
 * Usage: node dev.mjs
 */

import { watch, readFileSync, statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { join, extname } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript',
  '.mjs':  'text/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
};

// SSE clients waiting for reload events
const clients = new Set();

function notifyClients() {
  for (const res of clients) {
    try { res.write('data: reload\n\n'); } catch {}
  }
}

// Run build.mjs as a subprocess; returns a Promise that resolves when done.
function rebuild() {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ['build.mjs'], {
      cwd: __dirname,
      stdio: 'inherit',
    });
    child.on('close', (code) => {
      if (code !== 0) console.error(`build.mjs exited with code ${code}`);
      resolve(code);
    });
  });
}

// Swap production React for development builds so DevTools show full errors.
// Also inject the SSE livereload snippet before </body>.
function transformIndexHtml(html) {
  return html
    .replace(/react@18\/umd\/react\.production\.min\.js/g,      'react@18/umd/react.development.js')
    .replace(/react-dom@18\/umd\/react-dom\.production\.min\.js/g, 'react-dom@18/umd/react-dom.development.js')
    .replace(
      '</body>',
      `  <script>new EventSource('/__reload').onmessage=()=>location.reload()</script>\n</body>`,
    );
}

// Static file server
const server = createServer(async (req, res) => {
  const url = req.url.split('?')[0];

  // SSE livereload endpoint
  if (url === '/__reload') {
    res.writeHead(200, {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.write(': connected\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  const pathname = url === '/' ? '/index.html' : url;
  const filePath = join(__dirname, pathname);

  // Block path traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  try {
    statSync(filePath); // throws if not found
    const ext = extname(filePath).toLowerCase();
    let data = await readFile(filePath);

    if (pathname === '/index.html') {
      data = Buffer.from(transformIndexHtml(data.toString('utf8')), 'utf8');
    }

    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

// Initial build then start serving
console.log('Building…');
await rebuild();

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\nDev server ready → http://localhost:${PORT}`);
  console.log('Watching collection.jsx for changes (Ctrl+C to stop)\n');
});

// Watch collection.jsx with debounce
let debounce = null;
watch(join(__dirname, 'collection.jsx'), () => {
  clearTimeout(debounce);
  debounce = setTimeout(async () => {
    process.stdout.write('collection.jsx changed — rebuilding… ');
    const code = await rebuild();
    if (code === 0) {
      notifyClients();
      console.log('browser refreshed.');
    }
  }, 200);
});
