/**
 * Oriel — tiny Node backend (no dependencies).
 *
 *   GET  /api/health      → { ok: true }
 *   GET  /api/content     → site content (server/data/content.json)
 *   POST /api/inquiries   → validate + store a project inquiry (server/data/inquiries.json)
 *   *                     → static files from client/dist (production build), SPA fallback
 *
 * Port: --port <n> | PORT env | 5173
 */
import http from 'node:http';
import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateInquiry, rateLimited, newEntry } from './inquiry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'client', 'dist');
const DATA = path.join(__dirname, 'data');
const CONTENT_FILE = path.join(DATA, 'content.json');
const INQUIRIES_FILE = path.join(DATA, 'inquiries.json');

const argPort = (() => {
  const i = process.argv.indexOf('--port');
  return i > -1 ? Number(process.argv[i + 1]) : NaN;
})();
const PORT = Number.isFinite(argPort) ? argPort : Number(process.env.PORT) || 5173;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
};

/* ---------- helpers ---------- */

function sendJSON(res, status, body, extra = {}) {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(data),
    'Cache-Control': 'no-store',
    ...extra,
  });
  res.end(data);
}

function readBody(req, limit = 16 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) {
        reject(Object.assign(new Error('Payload too large'), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

// Serialise writes so concurrent requests never clobber the file.
let writeQueue = Promise.resolve();
function appendInquiry(entry) {
  writeQueue = writeQueue.then(async () => {
    let list = [];
    try {
      list = JSON.parse(await fs.readFile(INQUIRIES_FILE, 'utf8'));
      if (!Array.isArray(list)) list = [];
    } catch {
      /* first write */
    }
    list.push(entry);
    const tmp = INQUIRIES_FILE + '.tmp';
    await fs.writeFile(tmp, JSON.stringify(list, null, 2));
    await fs.rename(tmp, INQUIRIES_FILE);
  });
  return writeQueue;
}

/* ---------- API ---------- */

async function handleApi(req, res, pathname) {
  if (pathname === '/api/health' && req.method === 'GET') {
    return sendJSON(res, 200, { ok: true, time: new Date().toISOString() });
  }

  if (pathname === '/api/content' && req.method === 'GET') {
    const raw = await fs.readFile(CONTENT_FILE, 'utf8');
    return sendJSON(res, 200, JSON.parse(raw), { 'Cache-Control': 'public, max-age=60' });
  }

  if (pathname === '/api/inquiries') {
    if (req.method !== 'POST') return sendJSON(res, 405, { error: 'Method not allowed' }, { Allow: 'POST' });
    if (!String(req.headers['content-type'] || '').includes('application/json')) {
      return sendJSON(res, 415, { error: 'Expected application/json' });
    }
    const ip = req.socket.remoteAddress || 'unknown';
    if (rateLimited(ip)) return sendJSON(res, 429, { error: 'Too many requests — please try again later.' });

    let input;
    try {
      input = JSON.parse(await readBody(req));
    } catch (err) {
      if (err.status === 413) return sendJSON(res, 413, { error: 'Message too long.' });
      return sendJSON(res, 400, { error: 'Invalid JSON.' });
    }
    const { data, errors } = validateInquiry(input || {});
    if (Object.keys(errors).length) return sendJSON(res, 422, { error: 'Please check the form.', fields: errors });

    const entry = newEntry(data);
    await appendInquiry(entry);
    console.log(`[inquiry] ${entry.id} from ${data.name} <${data.email}>`);
    return sendJSON(res, 201, { ok: true, id: entry.id });
  }

  return sendJSON(res, 404, { error: 'Not found' });
}

/* ---------- static ---------- */

async function serveStatic(req, res, pathname) {
  let rel;
  try {
    rel = decodeURIComponent(pathname);
  } catch {
    res.writeHead(400).end('Bad request');
    return;
  }
  let file = path.normalize(path.join(DIST, rel));
  if (!file.startsWith(DIST)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  let stat = await fs.stat(file).catch(() => null);
  if (stat?.isDirectory()) {
    file = path.join(file, 'index.html');
    stat = await fs.stat(file).catch(() => null);
  }
  // SPA fallback for extension-less routes
  if (!stat && !path.extname(rel)) {
    file = path.join(DIST, 'index.html');
    stat = await fs.stat(file).catch(() => null);
  }
  if (!stat) {
    const missingBuild = !(await fs.stat(DIST).catch(() => null));
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(missingBuild ? 'No build found. Run "npm run build" first (or "npm run dev" for development).' : 'Not found');
    return;
  }

  const ext = path.extname(file).toLowerCase();
  const immutable = rel.startsWith('/assets/');
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Content-Length': stat.size,
    'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
    'X-Content-Type-Options': 'nosniff',
  });
  if (req.method === 'HEAD') return res.end();
  createReadStream(file).pipe(res);
}

/* ---------- server ---------- */

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');
  try {
    if (pathname.startsWith('/api/')) return await handleApi(req, res, pathname);
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }
    await serveStatic(req, res, pathname);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) sendJSON(res, 500, { error: 'Something went wrong.' });
    else res.end();
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\nPort ${PORT} is already in use — is another copy of the site (npm run dev / npm start) still running?\nStop it, or pick another port: node server/server.js --port <n>\n`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, () => {
  console.log(`Oriel server → http://localhost:${PORT}`);
});
