const fs = require('fs');
let code = fs.readFileSync('app/dashboard/studio/page.tsx', 'utf8');

code = code.replace(
  'Não utilize o Studio Hórus como um gerador de conteúdo genérico. Informe sua intenção. O Nexus conduzirá a descoberta inteligente, arquitetará a solução e estimará a operação. Nenhuma execução será realizada antes de sua validação estrutural e financeira.',
  'Não utilize o Studio Hórus como um gerador de conteúdo genérico. Informe sua intenção. O Nexus conduzirá a descoberta inteligente, arquitetará a solução e estimará a operação.'
);

fs.writeFileSync('app/dashboard/studio/page.tsx', code);
