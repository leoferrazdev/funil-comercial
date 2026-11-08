import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const origin = process.argv[2] || 'http://127.0.0.1:4187';
let checks = 0;
async function request(path, accept = '*/*', method = 'GET') {
  const response = await fetch(new URL(path, origin), { method, headers: { Accept: accept }, signal: AbortSignal.timeout(15000) });
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

for (const path of ['/', '/crm', '/consultoria', '/contato']) {
  const browserPage = await request(path, 'text/html');
  assert.equal(browserPage.response.status, 200, path);
  assert.match(browserPage.response.headers.get('content-type'), /text\/html/, path);
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

const refused = await request('/', 'text/markdown;q=0, text/html');
assert.match(refused.response.headers.get('content-type'), /text\/html/);
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

for (const path of ['/.well-known/not-implemented.json', '/.well-known/api-catalog', '/.well-known/oauth-authorization-server', '/.well-known/mcp/server-card.json', '/.well-known/http-message-signatures-directory', '/mcp']) {
  assert.equal((await request(path)).response.status, 404, path);
}
assert.match((await request('/login', 'text/markdown')).response.headers.get('content-type'), /text\/html/);
const tools = await request('/agent-tools.js');
assert.doesNotMatch(tools.response.headers.get('cache-control'), /immutable/);
const skills = JSON.parse((await request('/.well-known/agent-skills/index.json')).text);
const skillUrl = new URL(skills.skills[0].url);
const skill = await fetch(new URL(skillUrl.pathname, origin));
const digest = createHash('sha256').update(Buffer.from(await skill.arrayBuffer())).digest('hex');
assert.equal(skills.skills[0].digest, `sha256:${digest}`);
console.log(`${checks} verificações HTTP de agentes passaram em ${origin}.`);
