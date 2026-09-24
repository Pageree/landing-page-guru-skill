import http from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isMain } from '../skills/landing-page-guru-skill/scripts/lib/common.mjs';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.md': 'text/markdown; charset=utf-8', '.png': 'image/png' };

export function createPreviewServer({ root = resolve(project, 'examples') } = {}) {
  const identities = new Map();
  return http.createServer(async (request, response) => {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Robots-Tag', 'noindex, nofollow');
    try {
      const url = new URL(request.url, 'http://localhost');
      if (url.pathname === '/demo/submit') {
        response.setHeader('Content-Type', 'application/json');
        if (request.method !== 'POST') { response.writeHead(405).end('{"accepted":false}'); return; }
        const origin = request.headers.origin;
        if (origin && origin !== `http://${request.headers.host}`) { response.writeHead(403).end('{"accepted":false}'); return; }
        if (!(request.headers['content-type'] ?? '').startsWith('application/json')) { response.writeHead(415).end('{"accepted":false}'); return; }
        let body = '', size = 0;
        for await (const chunk of request) {
          size += chunk.length;
          if (size > 8192) { response.writeHead(413).end('{"accepted":false}'); return; }
          body += chunk;
        }
        let data;
        try { data = JSON.parse(body); } catch { response.writeHead(400).end('{"accepted":false}'); return; }
        if (!data || typeof data.email !== 'string' || data.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) { response.writeHead(422).end('{"accepted":false}'); return; }
        const identity = request.headers['idempotency-key'];
        if (typeof identity !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(identity)) { response.writeHead(400).end('{"accepted":false}'); return; }
        const now = Date.now();
        for (const [key, time] of identities) if (now - time > 600000) identities.delete(key);
        if (identities.has(identity)) { response.writeHead(409).end('{"accepted":false,"duplicate":true}'); return; }
        if (identities.size >= 1000) identities.delete(identities.keys().next().value);
        identities.set(identity, now);
        response.end('{"accepted":true,"demo":true}');
        return;
      }
      if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405).end('Method not allowed'); return; }
      let relative = decodeURIComponent(url.pathname);
      if (relative.startsWith('/examples/')) relative = relative.slice('/examples'.length);
      let target = resolve(root, `.${relative}`);
      const boundary = `${resolve(root)}${sep}`;
      if (target !== resolve(root) && !target.startsWith(boundary)) { response.writeHead(403).end('Forbidden'); return; }
      if ((await stat(target)).isDirectory()) {
        if (!url.pathname.endsWith('/')) { response.writeHead(301, { Location: `${url.pathname}/` }).end(); return; }
        target = resolve(target, 'index.html');
      }
      const canonical = await realpath(target);
      if (!canonical.startsWith(await realpath(root) + sep)) { response.writeHead(403).end('Forbidden'); return; }
      response.setHeader('Content-Type', mime[extname(target)] ?? 'application/octet-stream');
      response.end(request.method === 'HEAD' ? undefined : await readFile(target));
    } catch { response.writeHead(404).end('Not found'); }
  });
}

export async function startPreview(options = {}) {
  const server = createPreviewServer(options);
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(options.port ?? 0, '127.0.0.1', resolve); });
  return { server, url: `http://127.0.0.1:${server.address().port}`, close: () => new Promise(resolve => { server.close(resolve); server.closeIdleConnections(); }) };
}

if (isMain(import.meta.url)) {
  startPreview({ port: Number(process.env.PORT ?? 4173) }).then(({ url, close }) => {
    console.log(`Examples: ${url}\nLocal simulation only. No leads or emails are delivered.`);
    for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, async () => { await close(); process.exit(0); });
  }).catch(() => { console.error('Could not start local preview; check PORT availability.'); process.exitCode = 1; });
}
