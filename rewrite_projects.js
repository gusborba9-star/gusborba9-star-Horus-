const fs = require('fs');

const code = `'use client';
import Link from 'next/link';
import { PenTool, Video, Code, Music, Target, FileText, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

export default function ProjectsPage() {
  const projectTypes = [
    { id: 'video', name: 'Vídeos & Filmes', icon: Video, color: 'purple', desc: 'Produção audiovisual, comerciais e institucionais.' },
    { id: 'code', name: 'Aplicações & Sites', icon: Code, color: 'emerald', desc: 'Sistemas, landing pages e plataformas proprietárias.' },
    { id: 'music', name: 'Músicas & Áudio', icon: Music, color: 'blue', desc: 'Trilhas, spots de rádio e podcasts sintetizados.' },
    { id: 'campaign', name: 'Campanhas', icon: Target, color: 'rose', desc: 'Estratégia, copy e peças visuais para mídia.' },
    { id: 'doc', name: 'Apresentações & Docs', icon: FileText, color: 'amber', desc: 'Pitch decks, e-books e documentação técnica.' },
    { id: 'custom', name: 'Projeto Especial', icon: PenTool, color: 'gray', desc: 'Demandas customizadas e workflows específicos.' },
  ];

  return (
    <div className="h-full flex flex-col bg-[#050508] relative font-sans">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] mix-blend-overlay pointer-events-none"></div>
      
      <div className="h-24 px-6 sm:px-10 border-b border-white/5 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-20">
         <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <PenTool className="w-6 h-6 sm:w-8 sm:h-8 text-white/70" />
              Studio Projects
            </h1>
            <p className="text-xs sm:text-sm text-white/50 mt-1 font-light">Transforme ideias em ativos digitais permanentes. Precificação dinâmica pelo Nexus Core.</p>
         </div>
      </div>

      <div className="flex-1 p-6 sm:p-10 overflow-y-auto custom-scrollbar relative z-10">
         <div className="max-w-6xl mx-auto space-y-12">
            
            <div className="text-center max-w-2xl mx-auto mb-12">
               <h2 className="text-xl md:text-2xl font-bold text-white mb-4">O que vamos criar hoje?</h2>
               <p className="text-white/50 text-sm">O Hórus realizará toda a Engenharia Cognitiva gratuitamente para estruturar planejamento, prévias e orçamento antes de qualquer pagamento.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {projectTypes.map(p => {
                 const Icon = p.icon;
                 return (
                   <Link key={p.id} href={\`/dashboard/projects/new?type=\${p.id}\`} className="bg-[#090A0F] border border-white/10 hover:border-white/30 transition-all rounded-3xl p-6 group cursor-pointer flex flex-col justify-between h-64">
                      <div>
                         <div className={\`w-12 h-12 rounded-xl bg-\${p.color}-500/10 flex items-center justify-center border border-\${p.color}-500/20 mb-6 group-hover:bg-\${p.color}-500/20 transition-colors\`}>
                           <Icon className={\`w-6 h-6 text-\${p.color}-400\`} />
                         </div>
                         <h3 className="text-lg font-bold text-white mb-2">{p.name}</h3>
                         <p className="text-sm text-white/50 leading-relaxed font-light">{p.desc}</p>
                      </div>
                      <div className="flex items-center text-xs font-bold text-white/40 uppercase tracking-widest group-hover:text-white transition-colors mt-4">
                         Iniciar Engenharia <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                   </Link>
                 )
               })}
            </div>

            <div className="mt-16 bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><Zap className="w-5 h-5 text-amber-500"/> Workflow de Produção</h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-white/40 font-mono">
                    <span>Pedido</span> <ArrowRight className="w-3 h-3"/>
                    <span>Engenharia</span> <ArrowRight className="w-3 h-3"/>
                    <span>Prévia & Orçamento (Grátis)</span> <ArrowRight className="w-3 h-3"/>
                    <span className="text-amber-400">Pagamento</span> <ArrowRight className="w-3 h-3"/>
                    <span>Fila do Diretor</span> <ArrowRight className="w-3 h-3"/>
                    <span className="text-emerald-400">Entrega</span>
                  </div>
               </div>
            </div>

         </div>
      </div>
    </div>
  );
}
`

fs.writeFileSync('app/dashboard/projects/page.tsx', code);
