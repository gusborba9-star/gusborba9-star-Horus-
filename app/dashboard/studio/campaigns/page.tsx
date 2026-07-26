'use client';
import { useState } from 'react';
import { 
  Megaphone, ArrowLeft, Target, Users, Layout, Mail,
  PenTool, Calendar, Zap, CheckCircle2, FileText
} from 'lucide-react';
import Link from 'next/link';

export default function StudioCampaigns() {
  const [costEstimated, setCostEstimated] = useState(false);
  return (
    <div className="h-full flex flex-col bg-[#050508] relative font-sans">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] mix-blend-overlay pointer-events-none"></div>
      
      {/* Header */}
      <div className="h-20 border-b border-white/5 shrink-0 flex items-center justify-between px-6 sm:px-10 relative z-20">
         <div className="flex items-center gap-4">
            <Link href="/dashboard/studio" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
               <ArrowLeft className="w-4 h-4 text-white/50" />
            </Link>
            <h1 className="font-bold text-white text-lg flex items-center gap-3">
               <Megaphone className="w-5 h-5 text-orange-400"/> 
               Studio Campaigns™
            </h1>
         </div>
         
      </div>

      <div className="flex-1 flex overflow-hidden relative z-10">
         
         {/* Main Config Area */}
         <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            <div className="max-w-5xl mx-auto space-y-6">
               
               {/* Core Strategy */}
               <div className="bg-[#090A0F] border border-white/5 rounded-3xl p-6">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Target className="w-4 h-4 text-orange-400"/> Estratégia Principal</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                     <div>
                        <label className="block text-[10px] font-bold text-white/50 uppercase mb-2">Objetivo da Campanha</label>
                        <select className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-orange-500/50">
                           <option>Geração de Leads (B2B)</option><option>Venda Direta (E-commerce)</option>
                           <option>Lançamento de Produto</option><option>Brand Awareness</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-[10px] font-bold text-white/50 uppercase mb-2">Tom de Voz</label>
                        <select className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-orange-500/50">
                           <option>Profissional & Direto</option><option>Descontraído & Humor</option>
                           <option>Urgência & Escassez</option><option>Inspirador & Emocional</option>
                        </select>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div>
                        <label className="block text-[10px] font-bold text-white/50 uppercase mb-2 flex items-center gap-2"><FileText className="w-3 h-3"/> Produto / Oferta</label>
                        <textarea 
                           className="w-full h-24 bg-black/50 border border-white/10 rounded-xl p-4 text-white text-sm outline-none focus:border-orange-500/50 resize-none"
                           placeholder="Descreva o que estamos vendendo ou promovendo. Quais os diferenciais?"
                        ></textarea>
                     </div>
                     <div>
                        <label className="block text-[10px] font-bold text-white/50 uppercase mb-2 flex items-center gap-2"><Users className="w-3 h-3"/> Público Alvo (Persona)</label>
                        <textarea 
                           className="w-full h-20 bg-black/50 border border-white/10 rounded-xl p-4 text-white text-sm outline-none focus:border-orange-500/50 resize-none"
                           placeholder="Descreva as dores, desejos e perfil demográfico do seu público..."
                        ></textarea>
                     </div>
                  </div>
               </div>

               {/* Deliverables Checklist */}
               <div className="bg-[#090A0F] border border-white/5 rounded-3xl p-6">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Layout className="w-4 h-4 text-orange-400"/> Entregáveis Requeridos</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {/* Ads & Copy */}
                     <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                        <h4 className="text-xs font-bold text-white/70 uppercase tracking-widest mb-3">Anúncios & Criativos</h4>
                        <label className="flex items-center gap-3 text-sm text-white">
                           <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-white/20 bg-black accent-orange-500" />
                           Copies para Meta Ads (Facebook/IG)
                        </label>
                        <label className="flex items-center gap-3 text-sm text-white">
                           <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-white/20 bg-black accent-orange-500" />
                           Copies para Google Ads (Search/Display)
                        </label>
                        <label className="flex items-center gap-3 text-sm text-white">
                           <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-white/20 bg-black accent-orange-500" />
                           Roteiros de Vídeo (TikTok/Reels)
                        </label>
                        <label className="flex items-center gap-3 text-sm text-white">
                           <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-black accent-orange-500" />
                           Geração de Imagens (Studio Image)
                        </label>
                     </div>
                     
                     {/* Funnel & Web */}
                     <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                        <h4 className="text-xs font-bold text-white/70 uppercase tracking-widest mb-3">Funil & Conversão</h4>
                        <label className="flex items-center gap-3 text-sm text-white">
                           <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-white/20 bg-black accent-orange-500" />
                           Copy Landing Page (Sales Letter)
                        </label>
                        <label className="flex items-center gap-3 text-sm text-white">
                           <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-white/20 bg-black accent-orange-500" />
                           Sequência de Email Marketing (5 dias)
                        </label>
                        <label className="flex items-center gap-3 text-sm text-white">
                           <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-black accent-orange-500" />
                           Mensagens de Automação (WhatsApp)
                        </label>
                     </div>
                  </div>
               </div>

            
               {/* Cost & Execution */}
               <div className="bg-[#090A0F] border border-orange-500/20 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-center gap-6 mt-6">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                        <Zap className="w-6 h-6 text-orange-400" />
                     </div>
                     <div>
                        {costEstimated ? (
                           <>
                              <div className="text-sm font-bold text-white">Custo Estimado: 450 Créditos</div>
                              <div className="text-xs text-white/50">Tempo: ~2 min • Geração Multicanal</div>
                           </>
                        ) : (
                           <>
                              <div className="text-sm font-bold text-white">Pronto para gerar orçamento</div>
                              <div className="text-xs text-white/50">Nexus Cost Intelligence™ ativo</div>
                           </>
                        )}
                     </div>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                     {!costEstimated ? (
                        <button onClick={() => setCostEstimated(true)} className="flex-1 sm:flex-none px-6 py-3 bg-white/5 text-white font-bold rounded-xl text-sm hover:bg-white/10 transition-colors border border-white/10">
                           Estimar Custo
                        </button>
                     ) : (
                        <button className="flex-1 sm:flex-none px-6 py-3 bg-orange-500 text-black font-black rounded-xl text-sm hover:bg-orange-400 transition-colors shadow-[0_0_20px_rgba(249,115,22,0.3)] flex items-center justify-center gap-2">
                           <CheckCircle2 className="w-4 h-4" /> Gerar Campanha
                        </button>
                     )}
                  </div>
               </div>

            </div>
         </div>

         {/* Sidebar: Output / Preview */}
         <div className="w-96 border-l border-white/5 bg-[#090A0F] shrink-0 overflow-y-auto hidden xl:flex flex-col">
            <div className="p-6 border-b border-white/5">
               <h3 className="font-bold text-white text-sm flex items-center gap-2"><PenTool className="w-4 h-4 text-white/50"/> Preview de Entregáveis</h3>
            </div>
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center opacity-50">
               <Megaphone className="w-12 h-12 text-white/20 mb-4" />
               <p className="text-sm text-white/50 font-bold">Aguardando Geração</p>
               <p className="text-xs text-white/30 max-w-[200px] mt-2">Os copies, roteiros e textos da landing page aparecerão aqui organizados em abas.</p>
            </div>
         </div>

      </div>
    </div>
  );
}
