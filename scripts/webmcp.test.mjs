import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

test('WebMCP registra uma ferramenta de consulta pública com a assinatura atual', async () => {
  let tool;
  const file = new URL('../public/agent-tools.js', import.meta.url);
  const script = existsSync(file) ? readFileSync(file, 'utf8') : '';
  runInNewContext(script, {
    document: { modelContext: { registerTool(definition) { tool = definition; } } },
    navigator: {},
  });
  assert.equal(typeof tool, 'object', 'Ferramenta pública ainda não implementada');
  assert.equal(tool.annotations.readOnlyHint, true);
  const result = await tool.execute({});
  assert.match(JSON.stringify(result), /https:\/\/wa.me\/5551996737359/);
  assert.match(JSON.stringify(result), /agendamento_confirmado.*false/);
});

test('WebMCP é opcional e não quebra navegadores sem suporte ou com registro recusado', () => {
  const file = new URL('../public/agent-tools.js', import.meta.url);
  const script = existsSync(file) ? readFileSync(file, 'utf8') : '';
  assert.doesNotThrow(() => runInNewContext(script, { document: {}, navigator: {} }));
  assert.doesNotThrow(() => runInNewContext(script, {
    document: { modelContext: { registerTool() { throw Error('API indisponível'); } } }, navigator: {},
  }));
});
