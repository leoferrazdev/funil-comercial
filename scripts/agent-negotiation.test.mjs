import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createServer } from 'node:http';
import { gzipSync } from 'node:zlib';

test('negociação exige preferência explícita e respeita q=0 e preferência por HTML', async () => {
  const module = await import('./agent-negotiation.mjs').catch(() => ({}));
  assert.equal(typeof module.prefersMarkdown, 'function', 'Negociação por página ainda não implementada');
  assert.equal(module.prefersMarkdown('text/markdown'), true);
  assert.equal(module.prefersMarkdown('text/html, text/markdown;q=0.4'), false);
  assert.equal(module.prefersMarkdown('text/markdown;q=0, text/html'), false);
  assert.equal(module.prefersMarkdown('text/html;q=0.5, text/markdown;q=0.9'), true);
  assert.equal(module.prefersMarkdown('*/*'), false);
});

test('resposta descomprimida pelo fetch não conserva cabeçalhos gzip ou tamanho comprimido', async () => {
  const { markdownResponse } = await import('./agent-negotiation.mjs');
  const compressed = gzipSync('# Conteúdo público');
  const server = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/markdown', 'Content-Encoding': 'gzip', 'Content-Length': compressed.length, ETag: '"compressed"' });
    res.end(compressed);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const url = `http://127.0.0.1:${server.address().port}`;
    const request = new Request('https://funilcomercial.com/', { headers: { Accept: 'text/markdown' } });
    const response = await markdownResponse(request, () => fetch(url));
    assert.equal(await response.text(), '# Conteúdo público');
    assert.equal(response.headers.get('content-encoding'), null);
    assert.equal(response.headers.get('content-length'), null);
    assert.equal(response.headers.get('etag'), null);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});

test('cada página usa seu Markdown e descoberta JSON, arquivos e rotas privadas passam intactos', async () => {
  const { markdownResponse } = await import('./agent-negotiation.mjs');
  let fetched;
  const fetcher = async (url) => {
    fetched = String(url);
    return new Response('# CRM', { headers: { 'Content-Type': 'text/markdown' } });
  };
  const request = (path, method = 'GET') => new Request(`https://funilcomercial.com${path}`, { method, headers: { Accept: 'text/markdown' } });
  const result = await markdownResponse(request('/crm?utm_source=teste'), fetcher);
  assert.equal(fetched, 'https://funilcomercial.com/crm/index.md');
  assert.equal(await result.text(), '# CRM');
  assert.equal(result.headers.get('Vary'), 'Accept');
  for (const path of ['/dashboard', '/.well-known/ai-catalog.json', '/assets/main.js', '/crm/index.md']) {
    assert.equal(await markdownResponse(request(path), () => { throw Error('Não deve buscar estes recursos'); }), null);
  }
  assert.equal(await markdownResponse(request('/crm', 'POST'), fetcher), null);
  assert.equal(await markdownResponse(request('/crm'), async () => new Response('<html>', { headers: { 'Content-Type': 'text/html' } })), null);
});

test('caminhos desconhecidos retornam 404 real com Markdown quando Accept: text/markdown é preferido', async () => {
  const { isKnownAppPath, notFoundResponse } = await import('./agent-negotiation.mjs');
  assert.equal(isKnownAppPath('/about'), true);
  assert.equal(isKnownAppPath('/contact'), true);
  assert.equal(isKnownAppPath('/privacy'), true);
  assert.equal(isKnownAppPath('/some-path-that-does-not-exist'), false);
  assert.equal(isKnownAppPath('/agencia-de-marketing/nicho-invalido/sp/sao-paulo'), false);
  assert.equal(isKnownAppPath('/agencia-de-marketing/dentistas/sp/sao-paulo'), true);

  const mdRequest = new Request('https://funilcomercial.com/some-path-that-does-not-exist', {
    headers: { Accept: 'text/markdown' },
  });
  const md404 = await notFoundResponse(
    mdRequest,
    async () =>
      new Response('# 404 — Recurso não encontrado\n\nConsulte /llms.txt e /sitemap.xml.', {
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
      }),
  );
  assert.equal(md404.status, 404);
  assert.match(md404.headers.get('content-type'), /text\/markdown/i);
  assert.match(md404.headers.get('vary'), /accept/i);
  assert.match(await md404.text(), /llms\.txt/);

  const htmlRequest = new Request('https://funilcomercial.com/some-path-that-does-not-exist', {
    headers: { Accept: 'text/html' },
  });
  const html404 = await notFoundResponse(
    htmlRequest,
    async () =>
      new Response('<html><body><h1>404</h1></body></html>', {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }),
  );
  assert.equal(html404.status, 404);
  assert.match(html404.headers.get('content-type'), /text\/html/i);
});
