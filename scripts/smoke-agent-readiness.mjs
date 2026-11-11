import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { extractVisibleTextLength, validateHeadingHierarchy } from './agent-content.mjs';

const origin = process.argv[2] || 'http://127.0.0.1:4187';
let checks = 0;

async function request(path, accept = '*/*', method = 'GET') {
  const response = await fetch(new URL(path, origin), {
    method,
    headers: { Accept: accept },
    redirect: 'manual',
    signal: AbortSignal.timeout(15000),
  });
  const text = await response.text();
  checks++;
  return { response, text };
}

const html = await request('/', 'text/html');
assert.equal(html.response.status, 200);
assert.match(html.response.headers.get('content-type'), /text\/html/);
assert.match(html.response.headers.get('link'), /rel="ai-catalog"/);
for (const link of html.response.headers.get('link').matchAll(/<([^>]+)>/g)) {
  assert.equal((await request(link[1])).response.status, 200, `Link sem recurso: ${link[1]}`);
}

// 1 & 4 & 5 & 6: SSR HTML sem JavaScript, confiança (/about, /contact, /privacy), metadata e Organization JSON-LD
const ssrPages = [
  '/',
  '/blog',
  '/cidades-atendidas',
  '/diagnostico-estrutura-de-vendas',
  '/about',
  '/contact',
  '/privacy',
  '/crm',
  '/consultoria',
  '/contato',
];

for (const path of ssrPages) {
  const browserPage = await request(path, 'text/html');
  assert.equal(browserPage.response.status, 200, path);
  assert.match(browserPage.response.headers.get('content-type'), /text\/html/, path);
  assert.match(browserPage.text, /<html[^>]*\blang="pt-BR"/i, `${path} sem lang`);
  assert.match(browserPage.text, /<meta[^>]*property="og:type"/i, `${path} sem og:type`);
  assert.match(browserPage.text, /<meta[^>]*property="og:image"/i, `${path} sem og:image`);
  const canonicals = browserPage.text.match(/<link\b[^>]*rel=["']canonical["']/gi) || [];
  assert.equal(canonicals.length, 1, `${path} deve possuir exatamente 1 link canonical (encontrou ${canonicals.length})`);

  const visibleChars = extractVisibleTextLength(browserPage.text);
  assert.ok(visibleChars >= 500, `${path} possui apenas ${visibleChars} caracteres visíveis sem JS (esperado >= 500)`);
  const headings = validateHeadingHierarchy(browserPage.text);
  assert.equal(headings.valid, true, `${path} possui headings inválidos: ${headings.errors.join(' | ')}`);

  const { response, text } = await request(path, 'text/markdown');
  assert.equal(response.status, 200, path);
  assert.match(response.headers.get('content-type'), /text\/markdown;\s*charset=utf-8/i, path);
  assert.match(response.headers.get('vary'), /accept/i, path);
  assert.match(text, /^# /, path);
  assert.doesNotMatch(text, /<!doctype|<html/i, path);
  assert.match(text, new RegExp(`Fonte: https://funilcomercial.com${path === '/' ? '/' : path}`), path);

  const direct = await request(`${path === '/' ? '' : path}/index.md`);
  assert.match(direct.response.headers.get('content-type'), /text\/markdown/i);
  assert.equal(direct.text, text);
}

// 3 & 6: Organization JSON-LD com contactPoint + PostalAddress + termos de produto
const ldMatch = html.text.match(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
assert.ok(ldMatch, 'Homepage sem JSON-LD');
const ldJson = JSON.parse(ldMatch[1]);
const graphNodes = ldJson['@graph'] || [ldJson];
const orgNode = graphNodes.find((n) => Array.isArray(n['@type']) ? n['@type'].includes('Organization') : n['@type'] === 'Organization');
assert.ok(orgNode, 'Organization schema ausente na homepage');
assert.equal(orgNode.address?.['@type'], 'PostalAddress', 'PostalAddress ausente');
assert.ok(Array.isArray(orgNode.contactPoint) && orgNode.contactPoint[0]?.telephone && orgNode.contactPoint[0]?.email && orgNode.contactPoint[0]?.contactType, 'contactPoint incompleto no Organization schema');
assert.ok(Array.isArray(orgNode.knowsAbout) && orgNode.knowsAbout.some((k) => /CRM Funil Comercial/i.test(k)), 'knowsAbout sem termos claros na homepage');

// Negociação q-value
const refused = await request('/', 'text/markdown;q=0, text/html');
assert.match(refused.response.headers.get('content-type'), /text\/html/);
const lowerPriorityMd = await request('/', 'text/html, text/markdown;q=0.4');
assert.match(lowerPriorityMd.response.headers.get('content-type'), /text\/html/, 'text/html explícito sem q deve vencer text/markdown;q=0.4');
const higherPriorityMd = await request('/', 'text/html;q=0.5, text/markdown;q=0.9');
assert.match(higherPriorityMd.response.headers.get('content-type'), /text\/markdown/i, 'text/markdown;q=0.9 deve vencer text/html;q=0.5');

const head = await request('/', 'text/markdown', 'HEAD');
assert.match(head.response.headers.get('content-type'), /text\/markdown/i);
assert.equal(head.text, '');

for (const path of ['/.well-known/ai-catalog.json', '/.well-known/ard.json', '/.well-known/poppy.json', '/.well-known/oauth-protected-resource']) {
  const { response, text } = await request(path, 'text/markdown');
  assert.equal(response.status, 200, path);
  assert.match(response.headers.get('content-type'), /application\/json/, path);
  assert.equal(response.headers.get('access-control-allow-origin'), '*', path);
  JSON.parse(text);
}

// 2: Agent-friendly 404s (HTML padrão + Markdown via Accept: text/markdown sem redirect)
for (const path of [
  '/some-path-that-does-not-exist',
  '/rota-inexistente-teste',
  '/blog/artigo-inexistente',
  '/.well-known/not-implemented.json',
  '/.well-known/api-catalog',
  '/.well-known/oauth-authorization-server',
  '/.well-known/mcp/server-card.json',
  '/.well-known/http-message-signatures-directory',
  '/mcp',
]) {
  const html404 = await request(path, 'text/html');
  assert.equal(html404.response.status, 404, `${path} HTML 404`);
  const md404 = await request(path, 'text/markdown');
  assert.equal(md404.response.status, 404, `${path} Markdown 404`);
  assert.match(md404.response.headers.get('content-type'), /text\/markdown/i, `${path} 404 deve responder text/markdown`);
  assert.match(md404.response.headers.get('vary'), /accept/i, `${path} 404 deve incluir Vary: Accept`);
  assert.ok(md404.text.trim().length >= 20, `${path} corpo 404 curto demais`);
  assert.match(md404.text, /llms\.txt/i, `${path} 404 Markdown deve apontar llms.txt`);
  assert.match(md404.text, /sitemap\.xml/i, `${path} 404 Markdown deve apontar sitemap.xml`);
}

assert.match((await request('/login', 'text/markdown')).response.headers.get('content-type'), /text\/html/);
const tools = await request('/agent-tools.js');
assert.doesNotMatch(tools.response.headers.get('cache-control'), /immutable/);

// 7: Agent instructions / when-to-use em llms.txt, index.json e SKILL.md
const llmsRes = await request('/llms.txt', 'text/plain');
assert.equal(llmsRes.response.status, 200);
assert.match(llmsRes.text, /Quando usar|When to use/i);

const skills = JSON.parse((await request('/.well-known/agent-skills/index.json')).text);
assert.match(skills.skills[0].description, /when to use|quando usar/i);
const skillUrl = new URL(skills.skills[0].url);
const skill = await fetch(new URL(skillUrl.pathname, origin));
const skillBytes = Buffer.from(await skill.arrayBuffer());
const skillText = skillBytes.toString('utf8');
assert.match(skillText, /Quando usar|When to use/i);
const digest = createHash('sha256').update(skillBytes).digest('hex');
assert.equal(skills.skills[0].digest, `sha256:${digest}`);

console.log(`${checks} verificações HTTP de agentes passaram em ${origin}.`);
