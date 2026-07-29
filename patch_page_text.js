const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

const oldText = 'Hórus OS não é um assistente. É um sistema operacional cognitivo desenhado para orquestrar fluxos, integrar dados e escalar operações em nível enterprise.';
const newText = 'Hórus OS não é um assistente. É um sistema operacional cognitivo desenhado para orquestrar agentes e escalar operações. Do RH, Financeiro e Estoque até Vendas e Assistentes Pessoais (Casa Inteligente, Agenda, Redes Sociais) — agentes autônomos para qualquer nicho, setor, mercado ou empresa.';

code = code.replace(oldText, newText);

fs.writeFileSync('app/page.tsx', code);
