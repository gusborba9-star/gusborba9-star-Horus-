'use client';
import { 
  Music, Video, Image as ImageIcon, Code, Smartphone, 
  Megaphone, FileText, Zap, Sparkles, LayoutTemplate,
  PieChart, Server, Layers, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function StudioHome() {
  const router = useRouter();
  
  const modules = [
     { name: 'Música', desc: 'Composição algorítmica e vocal.', icon: Music, link: '/dashboard/studio/audio' },
     { name: 'Vídeo', desc: 'Geração de vídeos e avatares.', icon: Video, link: '/dashboard/studio/video' },
     { name: 'Imagem', desc: 'Assets gráficos e fotografia.', icon: ImageIcon, link: '/dashboard/studio/image' },
     { name: 'Código', desc: 'Workspace para engenharia de software.', icon: Code, link: '/dashboard/studio/code' },
     { name: 'Aplicativos', desc: 'Geração de interfaces e mobile apps.', icon: Smartphone, link: '/dashboard/studio/apps' },
     { name: 'Websites', desc: 'Criação de landing pages e e-commerces.', icon: LayoutTemplate, link: '/dashboard/studio/websites' },
     { name: 'Dashboards', desc: 'Data visualization e analytics.', icon: PieChart, link: '/dashboard/studio/dashboards' },
     { name: 'Documentos', desc: 'Contratos, planilhas e reports.', icon: FileText, link: '/dashboard/studio/docs' },
     { name: 'Apresentações', desc: 'Slides e pitch decks automatizados.', icon: Layers, link: '/dashboard/studio/presentations' },
     { name: 'APIs', desc: 'Geração de endpoints e servidores.', icon: Server, link: '/dashboard/studio/apis' },
     { name: 'Agentes', desc: 'Configuração de agentes autônomos.', icon: Zap, link: '/dashboard/agents' },
     { name: 'Automações', desc: 'Fluxos de orquestração.', icon: Megaphone, link: '/dashboard/studio/automations' },
  ];

  return (
    <div className="h-full flex flex-col bg-[#0A0A0C] relative font-sans">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none"></div>
      
      {/* Header */}
      <div className="h-20 border-b border-white/5 shrink-0 flex items-center justify-between px-6 sm:px-10 relative z-20">
         <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-amber-500" />
            <h1 className="text-xl font-extrabold tracking-tight text-white uppercase">
              Studio Hórus™
            </h1>
         </div>
         <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-xs font-bold">
            <ArrowLeft className="w-4 h-4" /> Voltar
         </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 sm:p-10 overflow-y-auto custom-scrollbar relative z-10">
         <div className="max-w-7xl mx-auto">
            <div className="mb-10 text-center md:text-left">
               <h2 className="text-2xl md:text-4xl font-light text-white mb-3">Orquestração Multimodal</h2>
               <p className="text-sm md:text-base text-white/40 font-light max-w-2xl">
                  Selecione um motor cognitivo para iniciar a geração. Todo o conteúdo gerado é automaticamente associado ao seu Memory Graph corporativo.
               </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
               {modules.map((mod, i) => {
                  const Icon = mod.icon;
                  return (
                     <Link href={mod.link} key={i} className="glass-panel p-6 rounded-3xl hover:border-amber-500/30 transition-all block group relative overflow-hidden">
                        <div className="w-12 h-12 rounded-xl bg-[#141417] flex items-center justify-center mb-6 border border-white/5 group-hover:border-amber-500/30 group-hover:bg-amber-500/10 transition-colors shadow-[0_0_15px_rgba(190,158,108,0.0)] group-hover:shadow-[0_0_15px_rgba(190,158,108,0.2)]">
                           <Icon className="w-6 h-6 text-white/50 group-hover:text-amber-500 transition-colors" />
                        </div>
                        <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">{mod.name}</h3>
                        <p className="text-xs text-white/40 leading-relaxed font-light">{mod.desc}</p>
                     </Link>
                  )
               })}
            </div>
         </div>
      </div>
    </div>
  );
}
