const fs = require('fs');

const code = `'use client';
import { Target, ArrowRight, Zap, CheckCircle2, Cog, TrendingUp, Building, LineChart } from 'lucide-react';
import Link from 'next/link';

export default function MissionsPage() {
  const missions = [
    { id: 'startup', name: 'Abrir uma Empresa', icon: Building, desc: 'O Hórus orquestra abertura de CNPJ, logo, site e agentes de atendimento em um único fluxo.' },
    { id: 'sales', name: 'Atingir R$ 100k em Vendas', icon: TrendingUp, desc: 'Configuração de agentes SDR, automação de e-mails, anúncios e landing page de alta conversão.' },
    { id: 'launch', name: 'Lançar um Curso', icon: Zap, desc: 'Criação de eixos de conteúdo, vídeo-aulas sintetizadas, área de membros e funil de vendas.' },
    { id: 'saas', name: 'Criar um SaaS (Micro-SaaS)', icon: Cog, desc: 'Engenharia completa: back-end, front-end, banco de dados, billing Stripe e implantação.' }
  ];

  return (
    <div className="h-full flex flex-col bg-[#050508] relative font-sans">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] mix-blend-overlay pointer-events-none"></div>
      
      <div className="h-24 px-6 sm:px-10 border-b border-white/5 shrink-0 flex items-center justify-between relative z-20">
         <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Target className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500" />
              Missões
            </h1>
            <p className="text-xs sm:text-sm text-white/50 mt-1 font-light">Orquestração de objetivos complexos do início ao fim.</p>
         </div>
      </div>

      <div className="flex-1 p-6 sm:p-10 overflow-y-auto custom-scrollbar relative z-10">
         <div className="max-w-6xl mx-auto">
            
            <div className="bg-[#090A0F] border border-emerald-500/30 rounded-3xl p-8 md:p-12 mb-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>
               <div className="flex-1 relative z-10">
                  <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Inteligência de Alto Nível
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Diga ao Hórus o que você quer alcançar.</h2>
                  <p className="text-white/60 font-light leading-relaxed max-w-xl mb-8">
                     Missões são os fluxos mais avançados do Nexus Core. Em vez de criar um agente ou um vídeo, você define um objetivo final de negócio. O sistema desdobra o objetivo em centenas de tarefas autônomas.
                  </p>
                  <div className="flex items-center gap-2 bg-black/50 border border-white/10 rounded-2xl p-2 max-w-lg">
                    <input type="text" placeholder="Ex: Quero estruturar o RH da minha empresa..." className="bg-transparent border-none outline-none text-white px-4 py-2 flex-1 text-sm" />
                    <button className="px-6 py-2 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-colors">
                      Gerar Missão
                    </button>
                  </div>
               </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-6">Templates de Missões</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {missions.map(m => {
                 const Icon = m.icon;
                 return (
                   <div key={m.id} className="bg-[#090A0F] border border-white/10 hover:border-emerald-500/30 transition-all rounded-3xl p-8 group cursor-pointer flex flex-col justify-between">
                      <div className="flex items-start gap-6">
                         <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                           <Icon className="w-7 h-7 text-emerald-400" />
                         </div>
                         <div>
                           <h4 className="text-xl font-bold text-white mb-2">{m.name}</h4>
                           <p className="text-sm text-white/50 leading-relaxed font-light mb-6">{m.desc}</p>
                           <div className="flex items-center gap-2 text-xs text-white/40">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500/50" /> Planejamento Autônomo
                           </div>
                         </div>
                      </div>
                      <div className="mt-6 pt-6 border-t border-white/5 flex justify-end">
                         <button className="text-xs font-bold text-white/40 uppercase tracking-widest group-hover:text-emerald-400 transition-colors flex items-center">
                            Iniciar Orquestração <ArrowRight className="w-4 h-4 ml-2" />
                         </button>
                      </div>
                   </div>
                 )
               })}
            </div>

         </div>
      </div>
    </div>
  );
}
`

fs.writeFileSync('app/dashboard/missions/page.tsx', code);

