const fs = require('fs');

let code = fs.readFileSync('app/dashboard/agents/page.tsx', 'utf8');

code = code.replace(
  'escolhendo automaticamente o melhor modelo fundacional (DeepSeek, GPT-4o, Claude)',
  'escolhendo automaticamente o modelo fundacional mais potente e custo-efetivo'
);

code = code.replace(
  'O Hórus alocará a IA mais capaz em tempo real (Claude, GPT, etc.) de acordo com a tarefa exigida.',
  'O Hórus alocará a capacidade computacional ideal em tempo real de acordo com a complexidade da tarefa exigida.'
);

fs.writeFileSync('app/dashboard/agents/page.tsx', code);
