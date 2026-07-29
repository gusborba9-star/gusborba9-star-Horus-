const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

const newPhrases = `const carouselPhrases = [
  "Operações Inteligentes",
  "Equipes Digitais",
  "Automações Invisíveis",
  "Integração Universal",
  "Crescimento Contínuo",
  "Inteligência Operacional",
  "Projetos Multimodais",
  "Escalabilidade Enterprise",
  "Infraestrutura Cognitiva"
];`;

code = code.replace(/const carouselPhrases = \[\s*([\s\S]*?)\s*\];/, newPhrases);

fs.writeFileSync('app/page.tsx', code);
