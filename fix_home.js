const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf-8');
code = code.replace(
  /Financeiro, Comercial, Marketing, Jurídico, RH, Operacional, Atendimento, Cobranças, Inteligência, Criativo, Desenvolvimento, Gestão, Estoque, Compras, Administrativo\.\.\. <strong>Ou crie o seu próprio\.<\/strong><br\/>(?:<br\/>)?\s*O limite não é o Hórus\. O limite é a imaginação operacional da sua empresa\./,
  'O Hórus Core possui base cognitiva para atuar no Financeiro, Comercial, Marketing, Jurídico, RH, Operacional, Atendimento, Compras e muito mais.<br/><br/><strong>Sua necessidade é inédita?</strong> Treine um colaborador digital exclusivo do zero. O limite não é o Hórus. O limite é a imaginação operacional da sua empresa.'
);
fs.writeFileSync('app/page.tsx', code);
