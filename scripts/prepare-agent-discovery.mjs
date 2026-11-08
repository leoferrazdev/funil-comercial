import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const publicDir = new URL('../public/', import.meta.url);
const read = (name) => readFileSync(new URL(name, publicDir));
const write = (name, contents) => writeFileSync(new URL(name, publicDir), contents);

// Uma única fonte para o índice e um digest calculado a partir dos bytes servidos.
write('.well-known/llms.txt', read('llms.txt'));
// Caminho atual do ARD e caminho de compatibilidade usam as mesmas entradas.
write('.well-known/ard.json', read('.well-known/ai-catalog.json'));
const index = JSON.parse(read('.well-known/agent-skills/index.json'));
index.skills[0].description = 'Consultar os serviços públicos, o CRM e os canais de contato da Funil Comercial.';
index.skills[0].digest = `sha256:${createHash('sha256').update(read('.well-known/agent-skills/funil-skill/SKILL.md')).digest('hex')}`;
write('.well-known/agent-skills/index.json', `${JSON.stringify(index, null, 2)}\n`);
console.log('Índice de agentes e integridade da skill atualizados.');
