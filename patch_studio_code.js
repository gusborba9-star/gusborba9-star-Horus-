const fs = require('fs');
let code = fs.readFileSync('app/dashboard/studio/code/page.tsx', 'utf8');

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
code = code.replace(/border-amber-500\/40/g, 'border-[#D4AF37]/40');
code = code.replace(/text-emerald-400/g, 'text-[#D4AF37]');

// Text and logic changes
code = code.replace('Roteando para o Modelo Ideal...', 'Compreendendo objetivos');
code = code.replace('Nexus Routing...', 'Compreendendo objetivos...');
code = code.replace('Orquestrando Capacidade Cognitiva', 'Compreendendo objetivos');
code = code.replace('Escrevendo Arquitetura (Next.js + Tailwind)', 'Arquitetando solução');
code = code.replace('Codificando Lógica...', 'Arquitetando solução...');
code = code.replace('Provisionando E2B Sandbox', 'Preparando ambiente operacional');
code = code.replace('Iniciando E2B Container...', 'Preparando ambiente operacional...');
code = code.replace('Construindo Aplicação...', 'Orquestrando recursos...');
code = code.replace('Deploy no Sandbox concluído. Veja o resultado ao lado.', 'Solução inicializada com sucesso. Veja o resultado ao lado.');
code = code.replace('Seu código foi escrito pelo motor de engenharia avançada do Hórus, compilado, e está sendo servido ao vivo de um container E2B Sandbox isolado.', 'Sua solução foi arquitetada pelo Nexus Cognitive Engine™, compilada, e está operando em um ambiente computacional isolado.');
code = code.replace('Aplicação Rodando Sucesso!', 'Solução Inicializada com Sucesso!');
code = code.replace('Publicar na Vercel', 'Publicar Operação™');

fs.writeFileSync('app/dashboard/studio/code/page.tsx', code);
