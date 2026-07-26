'use client';
import { useState } from 'react';
import { 
  ArrowLeft, ChevronRight, Wand2, History,
  Megaphone, Settings2, Layers
} from 'lucide-react';
import Link from 'next/link';

export default function StudioCampanhasPage() {
  const [activeTab, setActiveTab] = useState('create');
  
  return (
    <div className="h-full flex flex-col bg-[#0A0A0C] relative font-sans">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none"></div>
      
      {/* Breadcrumb Header */}
      <div className="h-20 border-b border-white/5 shrink-0 flex items-center justify-between px-6 sm:px-10 relative z-20">
         <div className="flex items-center gap-2 text-xs font-bold text-white/50">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-amber-500">Studio Campanhas</span>
         </div>
         <Link href="/dashboard" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-xs font-bold">
            <ArrowLeft className="w-4 h-4" /> Voltar
         </Link>
      </div>

      <div className="flex-1 flex overflow-hidden relative z-10">
         
         <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10">
            <div className="max-w-5xl mx-auto space-y-8">
               
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                     <h1 className="text-3xl font-black text-white flex items-center gap-3 mb-2">
                        <Megaphone className="w-8 h-8 text-amber-500" /> Studio Campanhas
                     </h1>
                     <p className="text-sm text-white/50 font-light">
                        Gestão de marketing, criativos, copies e funis de conversão.
                     </p>
                  </div>
                  <div className="flex bg-[#141417] p-1 rounded-xl border border-white/5 shrink-0">
                     <button onClick={() => setActiveTab('create')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'create' ? 'bg-white/10 text-white shadow-lg' : 'text-white/50 hover:text-white/80'}`}>Criação</button>
                     <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'history' ? 'bg-white/10 text-white shadow-lg' : 'text-white/50 hover:text-white/80'}`}>Histórico</button>
                     <button onClick={() => setActiveTab('templates')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'templates' ? 'bg-white/10 text-white shadow-lg' : 'text-white/50 hover:text-white/80'}`}>Templates</button>
                  </div>
               </div>

               {activeTab === 'create' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     
                     <div>
                        <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3 block">Modo de Operação</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                           {["Campanha de E-mail","Anúncio FB/IG","Copy de Landing Page","Roteiro de Vídeo (VSL)","Sequência de Onboarding","Lançamento Meteórico"].map((mode, i) => (
                              <button key={i} className={`p-4 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-2 text-center ${i === 0 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(190,158,108,0.1)]' : 'bg-[#141417] border-white/5 text-white/60 hover:bg-white/5'}`}>
                                 {mode}
                              </button>
                           ))}
                        </div>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                           <div className="glass-panel p-6 rounded-3xl">
                              <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3 block">Instruções / Prompt</label>
                              <textarea 
                                 className="w-full h-40 bg-[#0A0A0C] border border-white/10 rounded-xl p-4 text-white text-sm outline-none focus:border-amber-500/50 resize-none font-light leading-relaxed"
                                 placeholder="Descreva detalhadamente o que você deseja gerar..."
                              ></textarea>
                           </div>
                           
                           <div className="glass-panel p-6 rounded-3xl">
                              <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3 block">Vincular a Projeto</label>
                              <select className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-amber-500/50">
                                 <option>Nenhum (Avulso)</option>
                                 <option>Projeto Alpha</option>
                                 <option>Operação Nexus</option>
                              </select>
                           </div>
                        </div>

                        <div className="space-y-6">
                           <div className="glass-panel p-6 rounded-3xl space-y-5">
                              {[{"label":"Público Alvo","options":["B2B Enterprise","B2C Varejo","Startups","Público Frio"]},{"label":"Tom de Comunicação","options":["Urgência/Escassez","Educacional","Autoridade","Descontraído"]},{"label":"Objetivo","options":["Geração de Leads","Venda Direta","Branding","Retenção"]}].map((setting, i) => (
                                <div key={i}>
                                   <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2 block">{setting.label}</label>
                                   <select className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-amber-500/50">
                                      {setting.options.map((opt, j) => (
                                         <option key={j}>{opt}</option>
                                      ))}
                                   </select>
                                </div>
                              ))}
                           </div>

                           <button className="w-full py-4 bg-amber-500 text-black font-black rounded-2xl text-sm hover:bg-amber-400 transition-colors shadow-[0_0_20px_rgba(190,158,108,0.3)] flex items-center justify-center gap-2 hover:-translate-y-0.5">
                              <Wand2 className="w-4 h-4" /> Iniciar Geração
                           </button>
                        </div>
                     </div>
                  </div>
               )}

               {activeTab === 'history' && (
                  <div className="glass-panel rounded-3xl p-12 text-center animate-in fade-in duration-500 border border-white/5">
                     <History className="w-12 h-12 text-white/10 mx-auto mb-4" />
                     <h3 className="text-white/70 font-bold mb-2">Nenhum histórico encontrado</h3>
                     <p className="text-white/40 text-xs max-w-sm mx-auto font-light">Seus resultados anteriores aparecerão aqui para fácil acesso.</p>
                  </div>
               )}

               {activeTab === 'templates' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in duration-500">
                     {[{"title":"Email de Recuperação","desc":"Carrinho abandonado de alta conversão"},{"title":"Ad Criativo (Carrossel)","desc":"Estrutura para anúncio no Instagram"},{"title":"Cold Email B2B","desc":"Prospecção fria e direta"}].map((tpl, i) => (
                        <div key={i} className="glass-panel p-6 rounded-3xl hover:border-amber-500/30 transition-colors cursor-pointer group border border-white/5">
                           <div className="flex justify-between items-start mb-6">
                              <div className="w-12 h-12 rounded-xl bg-[#141417] flex items-center justify-center border border-white/5 group-hover:bg-amber-500/20 group-hover:border-amber-500/30 transition-colors">
                                 <Layers className="w-5 h-5 text-white/50 group-hover:text-amber-500" />
                              </div>
                           </div>
                           <h4 className="font-bold text-white text-sm mb-2">{tpl.title}</h4>
                           <p className="text-xs text-white/50 font-light">{tpl.desc}</p>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
