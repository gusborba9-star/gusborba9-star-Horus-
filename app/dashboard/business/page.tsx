'use client';
import { 
  Building2, ArrowLeft, Network, Users, Briefcase, Zap, 
  Settings, FolderKanban, Activity, BarChart
} from 'lucide-react';
import Link from 'next/link';

export default function BusinessHome() {
  return (
    <div className="h-full flex flex-col bg-[#050508] relative font-sans">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] mix-blend-overlay pointer-events-none"></div>
      
      <div className="h-24 px-6 sm:px-10 border-b border-white/5 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-20">
         <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500" />
              Hórus Business™
            </h1>
            <p className="text-xs sm:text-sm text-white/50 mt-1 font-light">Gestão de Equipes, Hubs e Operações Corporativas.</p>
         </div>
         <div className="flex items-center gap-3">
            <Link href="/dashboard/plans" className="px-4 py-2 bg-amber-500 text-black font-bold rounded-xl text-xs hover:bg-amber-400 transition-colors shadow-[0_0_20px_rgba(245,158,11,0.3)]">
            </Link>
         </div>
      </div>

      <div className="flex-1 p-6 sm:p-10 overflow-y-auto custom-scrollbar relative z-10">
         <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Business Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-[#090A0F] border border-white/5 rounded-3xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400"><Network className="w-5 h-5"/></div>
                     <div>
                        <div className="text-sm font-bold text-white">Hubs Ativos</div>
                        <div className="text-[10px] text-white/50 uppercase tracking-widest">Departamentos</div>
                     </div>
                  </div>
                  <div className="text-4xl font-black text-white">3<span className="text-lg text-white/30 font-medium">/5 permitidos</span></div>
               </div>
               <div className="bg-[#090A0F] border border-white/5 rounded-3xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400"><Users className="w-5 h-5"/></div>
                     <div>
                        <div className="text-sm font-bold text-white">Membroes</div>
                        <div className="text-[10px] text-white/50 uppercase tracking-widest">Equipes Cognitivas Nexus</div>
                     </div>
                  </div>
                  <div className="text-4xl font-black text-white">12<span className="text-lg text-white/30 font-medium">/15 contratados</span></div>
               </div>
               <div className="bg-[#090A0F] border border-white/5 rounded-3xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400"><BarChart className="w-5 h-5"/></div>
                     <div>
                        <div className="text-sm font-bold text-white">Consumo Operacional</div>
                        <div className="text-[10px] text-white/50 uppercase tracking-widest">Franquia Mensal</div>
                     </div>
                  </div>
                  <div className="text-4xl font-black text-white">68%</div>
                  <div className="w-full h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
                     <div className="w-[68%] h-full bg-amber-500 rounded-full"></div>
                  </div>
               </div>
            </div>

            {/* Hubs / Departamentos */}
            <div>
               <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2"><Briefcase className="w-5 h-5 text-amber-500"/> Hubs Operacionais (Departamentos)</h2>
                  <button className="text-xs text-amber-500 hover:underline font-bold">+ Criar Novo Hub</button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Hub Comercial */}
                  <div className="bg-[#090A0F] border border-white/5 rounded-3xl p-6 hover:border-white/20 transition-colors group">
                     <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                           <Activity className="w-6 h-6 text-emerald-400" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded uppercase">Operante</span>
                     </div>
                     <h3 className="text-lg font-bold text-white mb-2">Hub Comercial</h3>
                     <p className="text-xs text-white/50 mb-6">Equipe focada em qualificação de leads, negociação e fechamento B2B.</p>
                     
                     <div className="space-y-2 mb-6">
                        <div className="flex items-center justify-between text-xs">
                           <span className="text-white/40">Membroes</span>
                           <span className="text-white font-bold">4 Equipes Cognitivas</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                           <span className="text-white/40">Integrações</span>
                           <span className="text-white font-bold">Hubspot, WhatsApp</span>
                        </div>
                     </div>
                     
                     <button className="w-full py-2.5 bg-white/5 text-white text-xs font-bold rounded-xl group-hover:bg-white/10 transition-colors">Gerenciar Hub</button>
                  </div>

                  {/* Hub Financeiro */}
                  <div className="bg-[#090A0F] border border-white/5 rounded-3xl p-6 hover:border-white/20 transition-colors group">
                     <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                           <BarChart className="w-6 h-6 text-blue-400" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded uppercase">Operante</span>
                     </div>
                     <h3 className="text-lg font-bold text-white mb-2">Hub Financeiro</h3>
                     <p className="text-xs text-white/50 mb-6">Contas a pagar/receber, conciliação bancária e relatórios DRE.</p>
                     
                     <div className="space-y-2 mb-6">
                        <div className="flex items-center justify-between text-xs">
                           <span className="text-white/40">Membroes</span>
                           <span className="text-white font-bold">2 Equipes Cognitivas</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                           <span className="text-white/40">Integrações</span>
                           <span className="text-white font-bold">Conta Azul, Stripe</span>
                        </div>
                     </div>
                     
                     <button className="w-full py-2.5 bg-white/5 text-white text-xs font-bold rounded-xl group-hover:bg-white/10 transition-colors">Gerenciar Hub</button>
                  </div>

                  {/* Hub Marketing */}
                  <div className="bg-[#090A0F] border border-white/5 rounded-3xl p-6 hover:border-white/20 transition-colors group">
                     <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                           <Zap className="w-6 h-6 text-orange-400" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded uppercase">Operante</span>
                     </div>
                     <h3 className="text-lg font-bold text-white mb-2">Hub Marketing</h3>
                     <p className="text-xs text-white/50 mb-6">Geração de conteúdo, copy para ads e disparo de campanhas.</p>
                     
                     <div className="space-y-2 mb-6">
                        <div className="flex items-center justify-between text-xs">
                           <span className="text-white/40">Membroes</span>
                           <span className="text-white font-bold">3 Equipes Cognitivas</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                           <span className="text-white/40">Integrações</span>
                           <span className="text-white font-bold">Meta Ads, Mailchimp</span>
                        </div>
                     </div>
                     
                     <button className="w-full py-2.5 bg-white/5 text-white text-xs font-bold rounded-xl group-hover:bg-white/10 transition-colors">Gerenciar Hub</button>
                  </div>
               </div>
            </div>

         </div>
      </div>
    </div>
  );
}
