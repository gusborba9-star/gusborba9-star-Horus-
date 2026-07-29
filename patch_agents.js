const fs = require('fs');
let code = fs.readFileSync('app/dashboard/agents/page.tsx', 'utf8');

// Colors
code = code.replace(/bg-amber-500\/10/g, 'bg-[#D4AF37]/10');
code = code.replace(/border-amber-500\/20/g, 'border-[#D4AF37]/20');
code = code.replace(/text-amber-500/g, 'text-[#D4AF37]');
code = code.replace(/border-amber-500\/50/g, 'border-[#D4AF37]/50');
code = code.replace(/bg-amber-500/g, 'bg-[#D4AF37]');
code = code.replace(/text-amber-400/g, 'text-[#E5D2A0]');
code = code.replace(/hover:bg-amber-400/g, 'hover:bg-[#E5D2A0]');
code = code.replace(/bg-amber-500\/5/g, 'bg-[#D4AF37]/5');
code = code.replace(/rgba\(190,158,108/g, 'rgba(212,175,55');
code = code.replace(/bg-\[#141417\]/g, 'bg-[#141414]');
code = code.replace(/bg-\[#0A0A0C\]/g, 'bg-[#080808]');
code = code.replace(/bg-\[#050508\]/g, 'bg-[#101010]');

// Text and logic changes
code = code.replace('Inicializar Agente', 'Implantar Colaborador™');
code = code.replace('Nenhum agente implantado', 'Nenhum colaborador implantado');
code = code.replace('Descreva o problema que deseja resolver. O Nexus irá analisar sua operação, sugerir a arquitetura ideal, escolher os modelos, configurar os acessos e realizar o deploy do agente automaticamente.', 'Descreva o problema que deseja resolver. O Nexus irá analisar sua operação, sugerir a arquitetura ideal, orquestrar os recursos necessários e realizar a implantação do colaborador digital automaticamente.');
code = code.replace('O Nexus fará o roteamento neural escolhendo automaticamente o modelo fundacional mais potente e custo-efetivo e inferirá as permissões de acesso baseadas na descrição.', 'O Nexus fará o roteamento neural selecionando automaticamente a capacidade cognitiva ideal e orquestrando os recursos necessários invisivelmente.');

fs.writeFileSync('app/dashboard/agents/page.tsx', code);
