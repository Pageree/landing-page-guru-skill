import http from 'node:http';
import { createHash } from 'node:crypto';

const handler = endpoint => `
const form = document.getElementById('lead-form'), status = document.getElementById('form-status');
let key = crypto.randomUUID();
form.addEventListener('submit', async event => {
  event.preventDefault();
  try {
    const response = await fetch(${JSON.stringify(endpoint)}, { method: 'POST', headers: { 'content-type': 'application/json', 'idempotency-key': key }, body: JSON.stringify({ email: form.email.value }) });
    if (response.status === 200) { status.textContent = 'Request accepted'; key = crypto.randomUUID(); }
    else if (response.status === 409) status.textContent = 'already received';
    else status.textContent = 'Please try again';
  } catch { status.textContent = 'Please try again'; }
});`;

const shell = (attributes, extra) => `<!doctype html><meta charset="utf-8"><title>Form fixture</title>
<form id="lead-form" ${attributes}><label>Email <input name="email" type="email" required></label><button type="submit">Send</button></form>
<p id="form-status" role="status"></p>${extra}`;

// Synthetic pages for what the examples cannot show: other traffic around the form.
export async function startFormFixtures() {
  const seen = { posts: 0, sockets: 0 };
  let main, other;
  const origin = server => `http://127.0.0.1:${server.address().port}`;
  const pages = () => ({
    '/same-origin/': shell('', `<script>${handler('/submit')}</script>`),
    '/cross-origin/': shell('', `<script>${handler(`${origin(other)}/submit`)}</script>`),
    '/analytics/': shell('', `<script>${handler('/submit')}</script><script>navigator.sendBeacon('/collect', 'view')</script>`),
    '/form-copy/': shell('', `<script>${handler('/submit')}
form.addEventListener('submit', () => navigator.sendBeacon('/undeclared', form.email.value));</script>`),
    '/websocket/': shell('', `<script>${handler('/submit')}
form.addEventListener('submit', () => { const socket = new WebSocket('ws://127.0.0.1:${main.address().port}/live'); socket.onopen = () => socket.send(form.email.value); });</script>`),
    '/native/': shell('method="post" action="/submit"', ''),
    '/cdn-script/': shell('', `<script src="${origin(other)}/form.js"></script>`)
  });
  const respond = (request, response) => {
    const { pathname } = new URL(request.url, 'http://localhost');
    if (request.method === 'POST') { seen.posts++; response.writeHead(200).end(); return; }
    if (pathname === '/form.js') { response.writeHead(200, { 'content-type': 'text/javascript' }).end(handler('/submit')); return; }
    const body = pages()[pathname];
    response.writeHead(body ? 200 : 404, { 'content-type': 'text/html; charset=utf-8' }).end(body ?? 'Not found');
  };
  main = http.createServer(respond);
  other = http.createServer(respond);
  main.on('upgrade', (request, socket) => {
    seen.sockets++;
    const accept = createHash('sha1').update(`${request.headers['sec-websocket-key']}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`).digest('base64');
    socket.on('error', () => {});
    socket.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`);
  });
  await Promise.all([main, other].map(server => new Promise(ready => server.listen(0, '127.0.0.1', ready))));
  return {
    seen,
    url: path => `${origin(main)}${path}`,
    contract(base, path) {
      const contract = structuredClone(base);
      contract.form.fields = [contract.form.fields[0]];
      contract.form.destination.endpoint = path === '/cross-origin/' ? `${origin(other)}/submit` : '/submit';
      contract.form.destination.permittedOrigin = path === '/cross-origin/' ? origin(other) : origin(main);
      contract.verification.target = `${origin(main)}${path}`;
      contract.verification.browser.values = { email: 'visitor@example.test' };
      contract.verification.browser.timeoutMs = 1500;
      return contract;
    },
    async close() {
      for (const server of [main, other]) { server.closeAllConnections(); await new Promise(done => server.close(done)); }
    }
  };
}
