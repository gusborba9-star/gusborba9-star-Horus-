'use client';
import { Sparkles, Search, Plus, Filter, Briefcase } from 'lucide-react';
import Link from 'next/link';

export default function ProjetosAvulsosPage() {
  return (
    <div className="h-full flex flex-col bg-[#0A0A0C] relative font-sans">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none"></div>
      
      {/* Header */}
      <div className="h-24 px-6 sm:px-10 border-b border-white/5 shrink-0 flex items-center justify-between relative z-20 bg-[#0A0A0C]/50 backdrop-blur-xl">
         <div>
            <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-[0_0_15px_rgba(190,158,108,0.15)]">
                 <Briefcase className="w-5 h-5 text-amber-500" />
              </div>
              Projetos (Avulsos)
            </h1>
            <p className="text-xs sm:text-sm text-white/40 mt-2 font-light max-w-2xl">Workspaces isolados para iniciativas temporárias, lançamentos ou experimentação.</p>
         </div>
         <div className="hidden sm:flex gap-3">
            <Link href="/dashboard/studio" className="px-5 py-2.5 bg-amber-500 text-black font-bold rounded-xl text-xs hover:bg-amber-400 transition-colors shadow-[0_0_20px_rgba(190,158,108,0.3)] flex items-center gap-2">
               <Sparkles className="w-4 h-4" /> Criar no Studio
            </Link>
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
                     placeholder="Buscar em Projetos (Avulsos)..." 
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
                  <Briefcase className="w-8 h-8 text-amber-500/50" />
               </div>
               <h2 className="text-xl font-light text-white mb-3">Nenhum projeto encontrado</h2>
               <p className="text-sm text-white/40 font-light max-w-md mx-auto mb-8">
                  No Hórus, projetos são criados através do Studio. O Nexus orquestra recursos, cria equipes cognitivas, web apps e automações para você em instantes.
               </p>
               <Link href="/dashboard/studio" className="px-6 py-3 bg-amber-500 text-black font-bold rounded-xl text-sm hover:bg-amber-400 transition-all shadow-[0_0_20px_rgba(190,158,108,0.3)] inline-flex items-center gap-2 group">
                  <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" /> Ir para o Studio Premium
               </Link>
            </div>
         </div>
      </div>
    </div>
  );
}
