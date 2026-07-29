const fs = require('fs');
let code = fs.readFileSync('app/dashboard/studio/code/page.tsx', 'utf8');

code = code.replace(
  'Descreva o que deseja construir. O Nexus utilizará OpenRouter (DeepSeek V4 Pro / Qwen3) para arquitetar e escrever o código, levantando uma sandbox isolada via E2B para visualização imediata.',
  'Descreva o que deseja construir. O motor cognitivo do Hórus irá arquitetar e escrever o código, levantando uma sandbox isolada via E2B para visualização imediata.'
);

code = code.replace(
  'Orquestrando Modelos (DeepSeek V4 Pro)',
  'Orquestrando Capacidade Cognitiva'
);

code = code.replace(
  'Seu código foi escrito pelo DeepSeek V4 Pro através do roteamento do Nexus, compilado, e está sendo servido ao vivo de um container E2B Sandbox isolado.',
  'Seu código foi escrito pelo motor de engenharia avançada do Hórus, compilado, e está sendo servido ao vivo de um container E2B Sandbox isolado.'
);

code = code.replace(
  '// Escrevendo código (DeepSeek/Qwen)',
  '// Escrevendo código'
);

fs.writeFileSync('app/dashboard/studio/code/page.tsx', code);
