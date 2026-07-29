'use client';

import { 
  Music, Video, Code, Megaphone, Zap, ArrowLeft, Target
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function StudioHome() {
  const router = useRouter();
  
  const modules = [
     { name: 'Studio Dev', desc: 'SaaS, Aplicativos, APIs e Dashboards.', icon: Code, link: '/dashboard/studio/dev' },
     { name: 'Studio Música', desc: 'Composição algorítmica e produção.', icon: Music, link: '/dashboard/studio/music' },
     { name: 'Studio Vídeo', desc: 'Produção audiovisual e renderização.', icon: Video, link: '/dashboard/studio/video' },
     { name: 'Studio Campanhas', desc: 'Estratégia, copy e orquestração.', icon: Megaphone, link: '/dashboard/studio/campaigns' },
     { name: 'Equipes Cognitivas', desc: 'Configuração de equipes cognitivas.', icon: Zap, link: '/dashboard/agents' },
  ];

  return (
    <div className="h-full flex flex-col bg-[#080808] relative font-sans">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none"></div>
      
      {/* Header */}
      <div className="h-20 border-b border-[#1C1C1C] shrink-0 flex items-center justify-between px-6 sm:px-10 relative z-20">
         <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-[#D4AF37]" />
            <h1 className="text-xl font-extrabold tracking-[0.2em] text-[#FAFAFA] uppercase">
              Studio Hórus™
            </h1>
         </div>
         <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-[#FAFAFA]/50 hover:text-[#FAFAFA] transition-colors text-xs font-bold uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Voltar
         </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 sm:p-10 overflow-y-auto custom-scrollbar relative z-10">
         <div className="max-w-7xl mx-auto">
            <div className="mb-12">
               <h2 className="text-sm font-bold text-[#D4AF37] mb-2 uppercase tracking-[0.3em]">Arquitetura de Criação</h2>
               <h3 className="text-3xl md:text-5xl font-light text-[#FAFAFA] mb-4">Arquitetar com Nexus™</h3>
               <p className="text-sm md:text-base text-[#FAFAFA]/40 font-light max-w-2xl leading-relaxed">
                  Não utilize o Studio Hórus como um gerador de conteúdo genérico. Informe sua intenção. O Nexus conduzirá a descoberta inteligente, arquitetará a solução e estimará a operação.
               </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
               {modules.map((mod, i) => {
                  const Icon = mod.icon;
                  return (
                     <Link href={mod.link} key={i} className="bg-[#141414]/50 p-8 rounded-3xl border border-[#1C1C1C] hover:border-[#D4AF37]/30 transition-all block group relative overflow-hidden">
                        <div className="w-12 h-12 rounded-xl bg-[#101010] flex items-center justify-center mb-6 border border-[#1C1C1C] group-hover:border-[#D4AF37]/30 group-hover:bg-[#D4AF37]/10 transition-colors shadow-[0_0_15px_rgba(212,175,55,0.0)] group-hover:shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                           <Icon className="w-5 h-5 text-[#FAFAFA]/50 group-hover:text-[#D4AF37] transition-colors" />
                        </div>
                        <h3 className="text-sm font-bold text-[#FAFAFA] mb-2 uppercase tracking-wide group-hover:text-[#D4AF37] transition-colors">{mod.name}</h3>
                        <p className="text-xs text-[#FAFAFA]/40 leading-relaxed font-light">{mod.desc}</p>
                     </Link>
                  )
               })}
            </div>
         </div>
      </div>
    </div>
  );
}
