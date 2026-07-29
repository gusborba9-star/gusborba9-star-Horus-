const fs = require('fs');
let code = fs.readFileSync('app/dashboard/agents/page.tsx', 'utf8');

code = code.replace(/Identifiquei o Memory Graph.*guia inteligente\./, 'Identifiquei o Memory Graph ativo da organização. O acesso às políticas internas já está sincronizado. A configuração manual será disponibilizada apenas quando você receber seu colaborador definitivo em até 24 horas. Nesse momento, em poucos minutos, você terá a opção de integrar a qualquer sistema ou configurar manualmente auxiliado por um guia que o próprio sistema disponibiliza.');

fs.writeFileSync('app/dashboard/agents/page.tsx', code);
