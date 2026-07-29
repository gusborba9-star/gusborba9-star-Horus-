const fs = require('fs');
let code = fs.readFileSync('app/nexus/page.tsx', 'utf8');

code = code.replace(/Criar um Agente/g, 'Criar Colaborador Digital');
code = code.replace(/Criar um projeto/g, 'Iniciar Projeto');
code = code.replace(/Explorar o Studio/g, 'Arquitetar no Studio');

fs.writeFileSync('app/nexus/page.tsx', code);
