const fs = require('fs');
let code = fs.readFileSync('app/dashboard/page.tsx', 'utf8');

// Replace the literal double quotes with &quot;
code = code.replace(
  /"A infraestrutura está estável. A equipe de Marketing concluiu a campanha de Q3. Notei um pico de latência no Hub Financeiro e redirecionei as rotas de inferência. Deseja que eu inicie a geração de relatórios consolidados no Studio Docs\?"/,
  '&quot;A infraestrutura está estável. A equipe de Marketing concluiu a campanha de Q3. Notei um pico de latência no Hub Financeiro e redirecionei as rotas de inferência. Deseja que eu inicie a geração de relatórios consolidados no Studio Docs?&quot;'
);

fs.writeFileSync('app/dashboard/page.tsx', code);
