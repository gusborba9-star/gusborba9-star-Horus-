'use client';
import { useState } from 'react';
import { 
  ArrowLeft, ChevronRight, Wand2, History,
  Zap, Settings2, Layers, BrainCircuit, MessageSquare, Bot, Shield
} from 'lucide-react';
import Link from 'next/link';

export default function AgentesAutonomosPage() {
  const [activeTab, setActiveTab] = useState('nexus');
  
  return (
    <div className="h-full flex flex-col bg-[#0A0A0C] relative font-sans">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none"></div>
      
      {/* Breadcrumb Header */}
      <div className="h-20 border-b border-white/5 shrink-0 flex items-center justify-between px-6 sm:px-10 relative z-20">
         <div className="flex items-center gap-2 text-xs font-bold text-white/50">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-amber-500">Agentes Autônomos</span>
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
                        <Zap className="w-8 h-8 text-amber-500" /> Agentes Autônomos
                     </h1>
                     <p className="text-sm text-white/50 font-light">
                        Configuração e deploy de agentes cognitivos para seu ecossistema.
                     </p>
                  </div>
                  <div className="flex bg-[#141417] p-1 rounded-xl border border-white/5 shrink-0">
                     <button onClick={() => setActiveTab('nexus')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'nexus' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-lg' : 'text-white/50 hover:text-white/80 border border-transparent'}`}>Criar com Nexus <span className="hidden sm:inline">(Recomendado)</span></button>
                     <button onClick={() => setActiveTab('manual')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'manual' ? 'bg-white/10 text-white shadow-lg border border-white/10' : 'text-white/50 hover:text-white/80 border border-transparent'}`}>Criar Manualmente <span className="hidden sm:inline">(Avançado)</span></button>
                     <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'history' ? 'bg-white/10 text-white shadow-lg border border-white/10' : 'text-white/50 hover:text-white/80 border border-transparent'}`}>Histórico</button>
                  </div>
               </div>

               {activeTab === 'nexus' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto text-center mt-12">
                     <div className="w-20 h-20 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 mx-auto mb-8 shadow-[0_0_30px_rgba(190,158,108,0.15)] relative">
                        <BrainCircuit className="w-10 h-10 text-amber-500" />
                        <div className="absolute inset-0 rounded-2xl border border-amber-500/20 animate-ping opacity-20"></div>
                     </div>
                     
                     <h2 className="text-2xl font-light text-white mb-4">Que tipo de colaborador você precisa?</h2>
                     <p className="text-sm text-white/40 font-light mb-8 max-w-lg mx-auto leading-relaxed">
                        Descreva o problema que deseja resolver. O Nexus irá analisar sua operação, sugerir a arquitetura ideal, escolher os modelos, configurar os acessos e realizar o deploy do agente automaticamente.
                     </p>

                     <div className="relative max-w-2xl mx-auto mb-6">
                        <input 
                           type="text" 
                           placeholder="Ex: Preciso de um SDR para qualificar leads do WhatsApp..." 
                           className="w-full bg-[#141417]/80 backdrop-blur-xl border border-white/10 rounded-2xl pl-6 pr-16 py-5 text-sm text-white outline-none focus:border-amber-500/50 shadow-2xl transition-colors font-light text-left"
                        />
                        <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-amber-500 text-black rounded-xl hover:bg-amber-400 transition-all shadow-[0_0_15px_rgba(190,158,108,0.3)] flex items-center justify-center">
                           <MessageSquare className="w-4 h-4" />
                        </button>
                     </div>

                     <div className="glass-panel p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 inline-flex items-center gap-3">
                        <Shield className="w-4 h-4 text-amber-500" />
                        <span className="text-xs text-amber-500/70 font-medium">Você não conversa com dezenas de IAs. Você conversa apenas com o Nexus, e nós orquestramos todo o resto em segundo plano.</span>
                     </div>
                  </div>
               )}

               {activeTab === 'manual' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-red-500/5 flex items-start gap-4 mb-8">
                        <Settings2 className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <div>
                           <h4 className="text-sm font-bold text-red-400 mb-1">Modo de Engenharia Exposto</h4>
                           <p className="text-xs text-white/50 font-light leading-relaxed">Neste modo, você assume o controle manual sobre a seleção de LLMs base, RAG (Retrieval-Augmented Generation) e permissões de rede. Para 95% dos casos de uso corporativo, recomendamos o uso da orquestração automática do Nexus.</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                           <div className="glass-panel p-6 rounded-3xl">
                              <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3 block">Prompt de Sistema (System Message)</label>
                              <textarea 
                                 className="w-full h-40 bg-[#0A0A0C] border border-white/10 rounded-xl p-4 text-white text-sm outline-none focus:border-amber-500/50 resize-none font-light leading-relaxed"
                                 placeholder="Defina o comportamento exato do agente (Você é um assistente de vendas da empresa X...)"
                              ></textarea>
                           </div>
                           
                           <div className="glass-panel p-6 rounded-3xl">
                              <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3 block">Conhecimento Base (RAG)</label>
                              <select className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-amber-500/50">
                                 <option>Nenhum contexto vetorial</option>
                                 <option>Conectar Notion (Operações)</option>
                                 <option>Upload de PDFs (Manuais)</option>
                                 <option>Conectar Google Drive</option>
                              </select>
                           </div>
                        </div>

                        <div className="space-y-6">
                           <div className="glass-panel p-6 rounded-3xl space-y-5">
                              <div>
                                 <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2 block">Modelo Base (Cérebro)</label>
                                 <select className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-amber-500/50">
                                    <option>Gemini 1.5 Pro</option>
                                    <option>GPT-4o</option>
                                    <option>Claude 3.5 Sonnet</option>
                                    <option>Llama 3</option>
                                 </select>
                              </div>
                              <div>
                                 <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2 block">Ações Permitidas</label>
                                 <select className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-amber-500/50">
                                    <option>Apenas Leitura</option>
                                    <option>Pode enviar emails</option>
                                    <option>Acesso total ao sistema</option>
                                 </select>
                              </div>
                           </div>

                           <button className="w-full py-4 bg-[#141417] border border-white/10 text-white font-bold rounded-2xl text-sm hover:bg-white/5 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.05)] flex items-center justify-center gap-2">
                              <Bot className="w-4 h-4" /> Inicializar Agente
                           </button>
                        </div>
                     </div>
                  </div>
               )}

               {activeTab === 'history' && (
                  <div className="glass-panel rounded-3xl p-12 text-center animate-in fade-in duration-500 border border-white/5">
                     <History className="w-12 h-12 text-white/10 mx-auto mb-4" />
                     <h3 className="text-white/70 font-bold mb-2">Nenhum agente implantado</h3>
                     <p className="text-white/40 text-xs max-w-sm mx-auto font-light">Os colaboradores autônomos criados pela sua equipe aparecerão aqui.</p>
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}


