const fs = require('fs');
let code = fs.readFileSync('app/dashboard/page.tsx', 'utf8');

code = code.replace(/Novo Agente/g, 'Novo Colaborador');
code = code.replace(/Studio Music/g, 'Projeto Musical');
code = code.replace(/Studio Video/g, 'Projeto de Vídeo');
code = code.replace(/Nexus Auto/g, 'Nexus Engine');

fs.writeFileSync('app/dashboard/page.tsx', code);
