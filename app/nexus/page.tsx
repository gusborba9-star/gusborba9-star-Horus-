'use client';
import { useState } from 'react';
import { 
  BrainCircuit, ArrowLeft, Send, Sparkles, Code, Image as ImageIcon,
  Music, Layers, Workflow, Bot, FileText, LayoutTemplate, Briefcase
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NexusCognitiveEngine() {
  const router = useRouter();
  const [input, setInput] = useState('');

  const quickActions = [
    { label: 'Criar um projeto', icon: Briefcase, href: '/dashboard/projects' },
    { label: 'Criar um Agente', icon: Bot, href: '/dashboard/agents' },
    { label: 'Automatizar processos', icon: Workflow, href: '/dashboard/studio/automations' },
    { label: 'Construir um SaaS', icon: Code, href: '/dashboard/studio/code' },
    { label: 'Criar uma música', icon: Music, href: '/dashboard/studio/audio' },
    { label: 'Criar um App', icon: LayoutTemplate, href: '/dashboard/studio/apps' },
    { label: 'Criar um vídeo', icon: ImageIcon, href: '/dashboard/studio/video' },
    { label: 'Analisar documentos', icon: FileText, href: '/dashboard/studio/docs' },
    { label: 'Explorar o Studio', icon: Sparkles, href: '/dashboard/studio' },
  ];

  return (
    <div className="h-screen w-full flex flex-col bg-[#0A0A0C] text-white relative font-sans overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
         <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] bg-amber-500/5 blur-[150px] rounded-full"></div>
      </div>

      {/* Header */}
      <div className="h-20 flex items-center justify-between px-6 sm:px-10 relative z-20 shrink-0">
         <button onClick={() => router.push('/')} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-bold">
            <ArrowLeft className="w-4 h-4" /> Voltar
         </button>
         
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
               <BrainCircuit className="w-4 h-4 text-amber-500" />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-white/70 uppercase">
               Nexus Engine
            </span>
         </div>
         
         <div className="w-16"></div> {/* Spacer for symmetry */}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 flex flex-col py-10">
         <div className="w-full max-w-3xl mx-auto px-6">
            
            <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
               <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 mx-auto mb-6 shadow-[0_0_30px_rgba(190,158,108,0.15)]">
                  <BrainCircuit className="w-8 h-8 text-amber-500" />
               </div>
               <h1 className="text-2xl md:text-3xl font-light text-white mb-2">
                  Em que posso ajudar hoje?
               </h1>
               <p className="text-sm text-white/40 font-light">
                  Orquestrador Central Hórus OS
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150 fill-mode-both">
               {quickActions.map((action, idx) => (
                  <button 
                     key={idx}
                     onClick={() => router.push(action.href)}
                     className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-amber-500/30 hover:bg-white/5 transition-all group text-center"
                  >
                     <action.icon className="w-5 h-5 text-amber-500/70 group-hover:text-amber-400 transition-colors" />
                     <span className="text-xs text-white/70 font-medium">{action.label}</span>
                  </button>
               ))}
            </div>

         </div>
      </div>

      {/* Input Area */}
      <div className="p-6 pb-20 sm:pb-6 relative z-20 shrink-0">
         <div className="w-full max-w-3xl mx-auto relative">
            <input 
               type="text"
               value={input}
               onChange={(e) => setInput(e.target.value)}
               placeholder="Ou apenas converse livremente com o Nexus..."
               className="w-full bg-[#141417]/80 backdrop-blur-xl border border-white/10 rounded-2xl pl-6 pr-16 py-5 text-sm text-white outline-none focus:border-amber-500/50 shadow-2xl transition-colors font-light"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-amber-500 text-black rounded-xl hover:bg-amber-400 transition-all shadow-[0_0_15px_rgba(190,158,108,0.3)] disabled:opacity-50 disabled:cursor-not-allowed">
               <Send className="w-4 h-4" />
            </button>
         </div>
      </div>
    </div>
  );
}
