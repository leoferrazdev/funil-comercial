import { CORE_ROUTES } from './core-routes.mjs';

const NICHES_RE = /^(dentistas|advogados|psicologas|nutricionistas|arquitetos|contadores|medicos|esteticistas|corretores|fisioterapeutas|engenheiros|personal-trainers|energia-solar|oficinas-mecanicas)$/;
const DYNAMIC_SPA_RE = /^\/(login|cadastro|redefinir-senha|dashboard|inbox|contatos|leads|funil|campanhas|criativos|roteiro|agregadores|pecas|perfil|configuracoes|whatsapp|oauth\/(meta|instagram))$/;
const AGGREGATOR_RE = /^\/l\/[a-zA-Z0-9_-]+$/;
const PREVIEW_RE = /^\/(kns-odontologia|dra-talita-nacamura|brasiliense-odontologia|dra-marcia-yamashita|vilela-odontologia|cidmep-odontologia|dr-alexandre-serrano-lima|calligari-odontologia|flavia-martins-dentista|clins-odontologia)(\/index\.html)?$/;
const STATIC_ASSET_RE = /^\/(assets\/|images\/|brand\/|\.well-known\/|favicon\.|logo|robots\.txt|sitemap|llms\.txt|auth\.md|agent-tools\.js|404\.(html|md))/;

// Adaptadores de edge + negociação para páginas e erros 404 em Markdown.
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

export function isKnownAppPath(pathname) {
  const normalized = pathname.replace(/\/$/, '') || '/';
  if (CORE_ROUTES.includes(normalized)) return true;
  if (DYNAMIC_SPA_RE.test(normalized)) return true;
  if (AGGREGATOR_RE.test(normalized)) return true;
  if (PREVIEW_RE.test(normalized)) return true;
  if (/^\/blog\/[a-z0-9-]+$/.test(normalized)) return true;
  if (/^\/glossario\/[a-z0-9-]+$/.test(normalized)) return true;

  const parts = normalized.slice(1).split('/');
  if (parts.length === 2 && ['agencia-de-marketing', 'empresa-de-captacao', 'melhor-crm', 'google-meu-negocio'].includes(parts[0])) {
    return NICHES_RE.test(parts[1]);
  }
  if (parts.length === 4 && ['local', 'agencia-de-marketing', 'empresa-de-captacao', 'melhor-crm', 'google-meu-negocio'].includes(parts[0])) {
    return NICHES_RE.test(parts[1]) && /^[a-z]{2}$/.test(parts[2]) && /^[a-z0-9-]+$/.test(parts[3]);
  }
  if (parts.length === 5 && parts[0] === 'blog' && parts[1] === 'guia-de-vendas') {
    return NICHES_RE.test(parts[2]) && /^[a-z]{2}$/.test(parts[3]) && /^[a-z0-9-]+$/.test(parts[4]);
  }
  return false;
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

export async function notFoundResponse(request, fetcher = fetch) {
  if (!['GET', 'HEAD'].includes(request.method)) return null;
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/$/, '') || '/';
  if (STATIC_ASSET_RE.test(pathname) || pathname.startsWith('/api/') || isKnownAppPath(pathname)) {
    return null;
  }
  const wantsMarkdown = prefersMarkdown(request.headers.get('accept') || '');
  url.pathname = wantsMarkdown ? '/404.md' : '/404.html';
  url.search = '';
  const response = await fetcher(url, { signal: request.signal });
  const fallbackBody = wantsMarkdown
    ? '# 404 — Recurso não encontrado\n\nConsulte /llms.txt ou /sitemap.xml.\n\nFonte: https://funilcomercial.com/404.md\n'
    : '<!doctype html><html lang="pt-BR"><body><h1>404 - Recurso não encontrado</h1><p>Acesse <a href="/llms.txt">/llms.txt</a> ou <a href="/sitemap.xml">/sitemap.xml</a>.</p></body></html>';
  const headers = new Headers({
    'Content-Type': wantsMarkdown ? 'text/markdown; charset=utf-8' : 'text/html; charset=utf-8',
    'Vary': 'Accept',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'X-Content-Type-Options': 'nosniff',
  });
  const body = request.method === 'HEAD' ? null : response.ok ? response.body : fallbackBody;
  return new Response(body, { status: 404, headers });
}
