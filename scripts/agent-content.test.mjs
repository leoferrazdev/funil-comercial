import assert from 'node:assert/strict';
import { test } from 'node:test';
import puppeteer from 'puppeteer';

test('Markdown preserva o conteúdo e links da página sem incluir navegação e formulários', async () => {
  const module = await import('./agent-content.mjs').catch(() => ({}));
  assert.equal(typeof module.documentToMarkdown, 'function', 'Conversor de conteúdo público ainda não implementado');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setContent(`<nav>Menu global</nav><main><span>Contexto introdutório</span><h1>CRM &amp; WhatsApp</h1><p>Organize <strong>contatos</strong> e <a href="/consultoria">conheça a consultoria</a>.</p><ul><li>Leads</li><li>Oportunidades</li></ul><form><label>Segredo</label><input value="privado"></form><script>window.secret = 'não publicar'</script></main><footer>Rodapé</footer>`);
    const markdown = await page.evaluate(module.documentToMarkdown, 'https://funilcomercial.com/crm');
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
