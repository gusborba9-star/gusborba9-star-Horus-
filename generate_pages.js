const fs = require('fs');
const path = require('path');

const pages = [
  { path: 'app/dashboard/memory/page.tsx', title: 'Memória Operacional', icon: 'Database', desc: 'Central de conhecimento corporativo (Memory Graph) do Hórus OS. Todo o contexto e arquivos são indexados vetorialmente.' },
  { path: 'app/dashboard/tasks/page.tsx', title: 'Tarefas & Fluxos', icon: 'Layers', desc: 'Gerenciamento ágil de entregas e fluxos de trabalho orquestrados pelos Agentes e equipe.' },
  { path: 'app/dashboard/integrations/page.tsx', title: 'Integrações', icon: 'Zap', desc: 'Conectores ativos no seu ecossistema. O Hórus orquestra dados de qualquer plataforma.' },
  { path: 'app/dashboard/finance/page.tsx', title: 'Inteligência Financeira', icon: 'CreditCard', desc: 'Análise de métricas, forecast financeiro e controle de caixa gerados por IA.' },
  { path: 'app/dashboard/reports/page.tsx', title: 'Relatórios Core', icon: 'PieChart', desc: 'Insights consolidados, BI dinâmico e relatórios gerenciais em tempo real.' },
  { path: 'app/dashboard/notifications/page.tsx', title: 'Notificações', icon: 'Bell', desc: 'Feed de atividades, logs de auditoria e alertas críticos do Nexus Engine.' },
  { path: 'app/dashboard/plugins/page.tsx', title: 'Marketplace', icon: 'Puzzle', desc: 'Descubra e instale novos módulos, habilidades e templates para seus agentes cognitivos.' },
  { path: 'app/dashboard/projects/page.tsx', title: 'Projetos (Avulsos)', icon: 'Briefcase', desc: 'Workspaces isolados para iniciativas temporárias, lançamentos ou experimentação.' },
  { path: 'app/dashboard/library/page.tsx', title: 'Biblioteca Cognitiva', icon: 'FileBox', desc: 'Repositório estruturado de assets, modelos de prompt, guidelines e políticas.' },
  { path: 'app/dashboard/settings/page.tsx', title: 'Configurações Globais', icon: 'Settings', desc: 'Controle de governança, faturamento, chaves de API e gestão de acessos Enterprise.' }
];

pages.forEach(page => {
  const dir = path.dirname(page.path);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const code = `'use client';
import { 
  ArrowLeft, Search, Plus, Filter,
  ${page.icon}
} from 'lucide-react';
import Link from 'next/link';

export default function ${page.title.replace(/\s+/g, '').replace(/[^a-zA-Z]/g, '')}Page() {
  return (
    <div className="h-full flex flex-col bg-[#0A0A0C] relative font-sans">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none"></div>
      
      {/* Header */}
      <div className="h-24 px-6 sm:px-10 border-b border-white/5 shrink-0 flex items-center justify-between relative z-20 bg-[#0A0A0C]/50 backdrop-blur-xl">
         <div>
            <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-[0_0_15px_rgba(190,158,108,0.15)]">
                 <${page.icon} className="w-5 h-5 text-amber-500" />
              </div>
              ${page.title}
            </h1>
            <p className="text-xs sm:text-sm text-white/40 mt-2 font-light max-w-2xl">${page.desc}</p>
         </div>
         <div className="hidden sm:flex gap-3">
            <button className="px-5 py-2.5 bg-amber-500 text-black font-bold rounded-xl text-xs hover:bg-amber-400 transition-colors shadow-[0_0_20px_rgba(190,158,108,0.3)] flex items-center gap-2">
               <Plus className="w-4 h-4" /> Novo Registro
            </button>
         </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 sm:p-10 overflow-y-auto custom-scrollbar relative z-10">
         <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
               <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input 
                     type="text" 
                     placeholder="Buscar em ${page.title}..." 
                     className="w-full bg-[#141417] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:border-amber-500/50 transition-colors font-light"
                  />
               </div>
               <button className="px-5 py-3 bg-[#141417] border border-white/10 text-white font-medium rounded-xl text-sm hover:bg-white/5 transition-colors flex items-center gap-2">
                  <Filter className="w-4 h-4 text-white/60" /> Filtrar
               </button>
            </div>

            {/* Empty State / Module Content */}
            <div className="glass-panel rounded-3xl p-16 text-center border border-white/5 mt-8">
               <div className="w-20 h-20 rounded-3xl bg-[#141417] flex items-center justify-center border border-white/5 mx-auto mb-6 shadow-[0_0_30px_rgba(190,158,108,0.05)]">
                  <${page.icon} className="w-8 h-8 text-white/20" />
               </div>
               <h2 className="text-xl font-light text-white mb-3">Nenhum dado encontrado em ${page.title}</h2>
               <p className="text-sm text-white/40 font-light max-w-md mx-auto mb-8">
                  O módulo ${page.title} está ativo e pronto para receber dados ou ser orquestrado pelo Nexus Cognitive Engine.
               </p>
               <button className="px-6 py-3 bg-amber-500 text-black font-bold rounded-xl text-sm hover:bg-amber-400 transition-all shadow-[0_0_20px_rgba(190,158,108,0.3)] inline-flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Inicializar Módulo
               </button>
            </div>

         </div>
      </div>
    </div>
  );
}
`;
  
  fs.writeFileSync(page.path, code);
});

console.log('Generic pages generated successfully.');
