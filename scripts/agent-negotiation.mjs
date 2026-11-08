import { CORE_ROUTES } from './core-routes.mjs';

// Adaptadores legados de edge. Na Hostinger a negociação é feita pelo .htaccess.
export function prefersMarkdown(accept = '') {
  const types = accept.toLowerCase().split(',').map((entry) => {
    const [type, ...parameters] = entry.trim().split(';');
    const quality = parameters.map((p) => p.trim()).find((p) => p.startsWith('q='));
    const q = quality ? Number(quality.slice(2)) : 1;
    return { type: type.trim(), q: Number.isFinite(q) && q >= 0 && q <= 1 ? q : 0 };
  });
  const markdown = Math.max(0, ...types.filter((t) => t.type === 'text/markdown').map((t) => t.q));
  const html = Math.max(0, ...types.filter((t) => t.type === 'text/html').map((t) => t.q));
  return markdown > 0 && markdown >= html;
}

export async function markdownResponse(request, fetcher = fetch) {
  if (!['GET', 'HEAD'].includes(request.method) || !prefersMarkdown(request.headers.get('accept') || '')) return null;
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/$/, '') || '/';
  if (!CORE_ROUTES.includes(pathname)) return null;
  url.pathname = `${pathname === '/' ? '' : pathname}/index.md`;
  url.search = '';
  const response = await fetcher(url, { signal: request.signal });
  if (!response.ok || !/^text\/(markdown|plain)(;|$)/i.test(response.headers.get('content-type') || '')) return null;
  const headers = new Headers(response.headers);
  // fetch pode descomprimir o corpo, conservando os headers da transferência.
  headers.delete('Content-Encoding');
  headers.delete('Content-Length');
  headers.delete('ETag');
  headers.set('Content-Type', 'text/markdown; charset=utf-8');
  headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  const vary = headers.get('Vary');
  if (!vary) headers.set('Vary', 'Accept');
  else if (vary !== '*' && !vary.toLowerCase().split(',').map((v) => v.trim()).includes('accept')) headers.append('Vary', 'Accept');
  return new Response(request.method === 'HEAD' ? null : response.body, { status: response.status, headers });
}
