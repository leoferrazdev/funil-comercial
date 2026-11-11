import assert from 'node:assert/strict';
import { test } from 'node:test';
import puppeteer from 'puppeteer';
import {
  documentToMarkdown,
  extractVisibleTextLength,
  htmlToMarkdown,
  validateHeadingHierarchy,
} from './agent-content.mjs';

test('Markdown preserva o conteúdo e links da página sem incluir navegação e formulários', async () => {
  assert.equal(typeof documentToMarkdown, 'function', 'Conversor de conteúdo público ainda não implementado');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setContent(`<nav>Menu global</nav><main><span>Contexto introdutório</span><h1>CRM &amp; WhatsApp</h1><p>Organize <strong>contatos</strong> e <a href="/consultoria">conheça a consultoria</a>.</p><ul><li>Leads</li><li>Oportunidades</li></ul><form><label>Segredo</label><input value="privado"></form><script>window.secret = 'não publicar'</script></main><footer>Rodapé</footer>`);
    const markdown = await page.evaluate(documentToMarkdown, 'https://funilcomercial.com/crm');
    assert.match(markdown, /^# CRM & WhatsApp/);
    assert.match(markdown, /\*\*contatos\*\*/);
    assert.match(markdown, /\[conheça a consultoria\]\(https:\/\/funilcomercial.com\/consultoria\)/);
    assert.match(markdown, /- Leads\n- Oportunidades/);
    assert.doesNotMatch(markdown, /Menu global|Segredo|privado|não publicar|Rodapé/);
    assert.match(markdown, /https:\/\/funilcomercial.com\/crm/);
  } finally {
    await browser.close();
  }
});

test('Conversor Node htmlToMarkdown preserva conteúdo público sem Chromium e valida headings', () => {
  const sampleHtml = `<!doctype html><html lang="pt-BR"><body><div id="root"><header><nav>Menu</nav></header><main><article><header><h1>Artigo &amp; Guia</h1></header><h2>Etapa 1</h2><p>Veja <strong>CRM</strong> e <a href="/about">sobre a empresa</a>.</p><h3>Subitem</h3><ul><li>Item A</li><li>Item B</li></ul><div aria-hidden="true">Decorativo</div><div style="display: none">Oculto</div></article></main><footer>Rodapé</footer></div></body></html>`;
  const markdown = htmlToMarkdown(sampleHtml, 'https://funilcomercial.com/blog/teste');
  assert.match(markdown, /^# Artigo & Guia/);
  assert.match(markdown, /## Etapa 1/);
  assert.match(markdown, /### Subitem/);
  assert.match(markdown, /\*\*CRM\*\*/);
  assert.match(markdown, /\[sobre a empresa\]\(https:\/\/funilcomercial.com\/about\)/);
  assert.match(markdown, /- Item A\n- Item B/);
  assert.doesNotMatch(markdown, /Menu|Decorativo|Oculto|Rodapé/);
  assert.match(markdown, /Fonte: https:\/\/funilcomercial\.com\/blog\/teste/);

  assert.equal(extractVisibleTextLength(sampleHtml) > 20, true);
  assert.equal(validateHeadingHierarchy(sampleHtml).valid, true);

  const skippedHtml = `<div id="root"><main><h1>Título</h1><h3>Pulo</h3></main></div>`;
  const report = validateHeadingHierarchy(skippedHtml);
  assert.equal(report.valid, false);
  assert.match(report.errors[0], /Salto de heading de h1 para h3/);
});
