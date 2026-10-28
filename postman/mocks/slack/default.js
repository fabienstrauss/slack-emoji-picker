// Contract-shaped local fixtures. No live workspace data or real credentials.
const http = require('http');
http.createServer((req, res) => {
  if (req.url !== '/api/emoji.list' || req.method !== 'GET') { res.writeHead(501); res.end(); return; }
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (token === 'slow') return setTimeout(() => res.end('{}'), 200);
  if (token === 'rate-limit') { res.writeHead(429, { 'Retry-After': '30' }); res.end(); return; }
  if (token === 'server-error') { res.writeHead(502, { 'Content-Type': 'text/html' }); res.end('<html>Bad Gateway</html>'); return; }
  res.setHeader('Content-Type', 'application/json');
  if (token === 'missing-scope') { res.end(JSON.stringify({ ok: false, error: 'missing_scope' })); return; }
  if (token !== 'fixture-token') { res.end(JSON.stringify({ ok: false, error: 'invalid_auth' })); return; }
  res.end(JSON.stringify({ ok: true, emoji: { party: 'https://example.com/party.gif', celebrate: 'alias:party', more: 'alias:celebrate', broken: 'alias:missing', loop: 'alias:loop' } }));
}).listen(process.env.PORT || 4500);
