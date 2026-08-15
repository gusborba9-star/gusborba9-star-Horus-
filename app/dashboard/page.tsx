import { 
  BarChart3, Users, Zap, BrainCircuit, Activity,
  ArrowRight, Shield, Database, Network, Search, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function DashboardOverview() {
  return (
    <div className="h-full flex flex-col bg-[#0A0A0C] relative font-sans">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none"></div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 relative z-10">
         <div className="max-w-7xl mx-auto space-y-8">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
               <div>
                  <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs font-bold mb-4">
                     <ArrowLeft className="w-4 h-4" /> Voltar para o Site
                  </Link>
                  <h1 className="text-3xl font-black tracking-tight text-white mb-2">Visão Geral</h1>
                  <p className="text-sm text-white/50 font-light">Monitoramento em tempo real do ecossistema Hórus OS.</p>
               </div>
               <div className="flex items-center gap-3">
                  <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                     <input type="text" placeholder="Buscar no workspace..." className="bg-[#141417] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-[#D4AF37]/50 transition-colors w-full sm:w-64 font-light" />
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               <div className="glass-panel border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors group">
                  <div className="flex justify-between items-start mb-4">
                     <div className="p-2.5 bg-[#D4AF37]/10 rounded-xl text-[#D4AF37] group-hover:scale-110 transition-transform">
                        <Users className="w-5 h-5" />
                     </div>
                     <span className="text-[10px] font-bold text-[#FAFAFA]/70 uppercase bg-white/5 px-2 py-1 rounded-md">Online</span>
                  </div>
                  <h3 className="text-3xl font-black text-white mb-1">12</h3>
                  <p className="text-xs text-white/40 font-medium">Equipes Cognitivas Operacionais</p>
               </div>

               <div className="glass-panel border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors group">
                  <div className="flex justify-between items-start mb-4">
                     <div className="p-2.5 bg-white/5 rounded-xl text-[#FAFAFA]/70 group-hover:scale-110 transition-transform">
                        <Activity className="w-5 h-5" />
                     </div>
                     <span className="text-[10px] font-bold text-white/40 uppercase">Hoje</span>
                  </div>
                  <h3 className="text-3xl font-black text-white mb-1">4.281</h3>
                  <p className="text-xs text-white/40 font-medium">Tarefas Executadas</p>
               </div>

               <div className="glass-panel border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors group">
                  <div className="flex justify-between items-start mb-4">
                     <div className="p-2.5 bg-[#D4AF37]/10 rounded-xl text-[#E5D2A0] group-hover:scale-110 transition-transform">
                        <BarChart3 className="w-5 h-5" />
                     </div>
                     <span className="text-[10px] font-bold text-white/40 uppercase">Este Mês</span>
                  </div>
                  <h3 className="text-3xl font-black text-white mb-1">R$ 142<span className="text-sm text-white/30">,50</span></h3>
                  <p className="text-xs text-white/40 font-medium">Nexus Cost Intelligence™</p>
               </div>

               <div className="glass-panel border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors group">
                  <div className="flex justify-between items-start mb-4">
                     <div className="p-2.5 bg-white/5 rounded-xl text-[#FAFAFA]/70 group-hover:scale-110 transition-transform">
                        <Zap className="w-5 h-5" />
                     </div>
                     <span className="text-[10px] font-bold text-white/40 uppercase">Franquia</span>
                  </div>
                  <h3 className="text-3xl font-black text-white mb-1">85k</h3>
                  <p className="text-xs text-white/40 font-medium">Créditos Restantes</p>
                  <div className="w-full h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                     <div className="w-[60%] h-full bg-[#D4AF37] rounded-full"></div>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 space-y-8">
                  <div className="glass-panel border-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-3xl p-8 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-[80px] pointer-events-none"></div>
                     <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                           <BrainCircuit className="w-6 h-6 text-[#D4AF37]" />
                           <h2 className="text-lg font-bold text-white">Consultor Nexus</h2>
                        </div>
                        <p className="text-white/70 font-light leading-relaxed mb-6">
                           &quot;A infraestrutura está estável. A equipe de Marketing concluiu a campanha de Q3. Notei um pico de latência no Hub Financeiro e redirecionei as rotas de inferência. Deseja que eu inicie a geração de relatórios consolidados no Studio Docs?&quot;
                        </p>
                        <div className="flex gap-3">
                           <Link href="/nexus" className="px-5 py-2.5 bg-[#D4AF37] text-black font-bold rounded-xl text-xs hover:bg-[#E5D2A0] transition-colors shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                              Iniciar Nexus Engine
                           </Link>
                           <button className="px-5 py-2.5 bg-white/5 text-white font-bold rounded-xl text-xs hover:bg-white/10 transition-colors border border-white/10">
                              Gerar Relatórios
                           </button>
                        </div>
                     </div>
                  </div>

                  <div className="glass-panel border border-white/5 rounded-3xl p-6">
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="font-bold text-white">Memory Graph • Registro de Eventos</h2>
                        <button className="text-xs text-[#D4AF37] hover:underline font-bold">Ver Tudo</button>
                     </div>
                     <div className="space-y-4">
                        {[
                           { action: 'Projeto de Vídeo: Renderização Concluída', agent: 'Nexus Engine', time: 'Há 5 min', type: 'success' },
                           { action: 'Membro (Financeiro) processou 45 NFs', agent: 'Clara (Financeiro)', time: 'Há 12 min', type: 'info' },
                           { action: 'Automação Hubspot -> CRM finalizada', agent: 'Nexus Integrator', time: 'Há 1 hora', type: 'info' },
                           { action: 'Novo modelo ajustado para campanha', agent: 'Marcos (Marketing)', time: 'Há 2 horas', type: 'info' }
                        ].map((log, i) => (
                           <div key={i} className="flex gap-4 items-start p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                              <div className="text-xs font-bold text-white/40 mt-1 w-20 shrink-0">{log.time}</div>
                              <div>
                                 <div className="text-sm font-bold text-white/80">{log.action}</div>
                                 <div className="text-[10px] text-white/50">{log.agent}</div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="space-y-8">
                  <div className="glass-panel border border-white/5 rounded-3xl p-6">
                     <h2 className="font-bold text-white mb-4">Saúde do Ecossistema</h2>
                     <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm p-2 rounded-lg bg-white/5">
                           <span className="text-white/60 flex items-center gap-2"><Database className="w-4 h-4"/> Memory Graph</span>
                           <span className="text-[#FAFAFA]/70 font-bold text-xs">Sincronizado</span>
                        </div>
                        <div className="flex justify-between items-center text-sm p-2 rounded-lg bg-white/5">
                           <span className="text-white/60 flex items-center gap-2"><Network className="w-4 h-4"/> Integrações</span>
                           <span className="text-[#FAFAFA]/70 font-bold text-xs">9 Ativas</span>
                        </div>
                        <div className="flex justify-between items-center text-sm p-2 rounded-lg bg-white/5">
                           <span className="text-white/60 flex items-center gap-2"><Shield className="w-4 h-4"/> Permissões</span>
                           <span className="text-[#FAFAFA]/70 font-bold text-xs">Seguro</span>
                        </div>
                     </div>
                  </div>

                  <div className="glass-panel border border-white/5 rounded-3xl p-6">
                     <h2 className="font-bold text-white mb-4">Atalhos Rápidos</h2>
                     <div className="grid grid-cols-2 gap-3">
                        <Link href="/dashboard/studio/audio" className="p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors text-center">
                           <div className="text-xs font-bold text-white/70">Projeto Musical</div>
                        </Link>
                        <Link href="/dashboard/studio/video" className="p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors text-center">
                           <div className="text-xs font-bold text-white/70">Projeto de Vídeo</div>
                        </Link>
                        <Link href="/dashboard/agents" className="p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors text-center">
                           <div className="text-xs font-bold text-white/70">Novo Membro</div>
                        </Link>
                        <Link href="/nexus" className="p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors text-center">
                           <div className="text-xs font-bold text-[#D4AF37]">Nexus Engine</div>
                        </Link>
                     </div>
                  </div>

               </div>
            </div>

         </div>
      </div>
    </div>
  );
}
