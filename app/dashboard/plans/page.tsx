'use client';
import { 
  Building2, ArrowLeft, CheckCircle2, Zap, BrainCircuit, Shield
} from 'lucide-react';
import Link from 'next/link';

export default function PlansPage() {
  return (
    <div className="h-full flex flex-col bg-[#050508] relative font-sans">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] mix-blend-overlay pointer-events-none"></div>
      
      <div className="h-20 border-b border-white/5 shrink-0 flex items-center justify-between px-6 sm:px-10 relative z-20">
         <div className="flex items-center gap-4">
            <Link href="/dashboard" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
               <ArrowLeft className="w-4 h-4 text-white/50" />
            </Link>
            <h1 className="font-bold text-white text-lg flex items-center gap-3">
               Nexus Pricing Engine™
            </h1>
         </div>
      </div>

      <div className="flex-1 p-6 sm:p-10 overflow-y-auto custom-scrollbar relative z-10">
         <div className="max-w-6xl mx-auto space-y-12">
            
            <div className="text-center space-y-4">
               <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">O tamanho exato da sua operação.</h2>
               <p className="text-white/50 text-lg max-w-2xl mx-auto font-light">
                  Nenhuma licença vitalícia. Inteligência de ponta custa processamento. Assine o ecossistema e escale seus colaboradores digitais de forma sustentável e previsível.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               
               {/* Personal Plan */}
               <div className="bg-[#090A0F] border border-white/10 rounded-3xl p-8 relative flex flex-col">
                  <div className="mb-8">
                     <h3 className="text-xl font-black text-white mb-2">Hórus Personal</h3>
                     <p className="text-sm text-white/50 font-light">Para profissionais autônomos e produtividade individual extrema.</p>
                  </div>
                  <div className="mb-8">
                     <div className="text-4xl font-black text-white">R$ 197<span className="text-lg text-white/30 font-medium">/mês</span></div>
                  </div>
                  <div className="space-y-4 mb-8 flex-1">
                     <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span className="text-sm text-white/70">1 Colaborador Ativo (Chief of Staff)</span>
                     </div>
                     <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span className="text-sm text-white/70">Texto ilimitado (Política de uso justo)</span>
                     </div>
                     <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span className="text-sm text-white/70">10k Créditos/mês para Studio Hórus</span>
                     </div>
                     <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span className="text-sm text-white/70">Integração Desktop e Voice (Carro)</span>
                     </div>
                  </div>
                  <button className="w-full py-4 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-colors border border-white/10">
                     Assinar Personal
                  </button>
               </div>

               {/* Business Plan */}
               <div className="bg-gradient-to-b from-[#090A0F] to-[#0A0B10] border-2 border-amber-500/50 rounded-3xl p-8 relative flex flex-col shadow-[0_0_50px_rgba(245,158,11,0.1)] transform md:-translate-y-4">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-500 text-black text-xs font-black rounded-full uppercase tracking-widest shadow-lg">
                     Recomendado
                  </div>
                  <div className="mb-8 relative z-10">
                     <h3 className="text-xl font-black text-amber-500 mb-2">Hórus Business</h3>
                     <p className="text-sm text-white/50 font-light">Para PMEs estruturarem Hubs Operacionais automatizados.</p>
                  </div>
                  <div className="mb-8 relative z-10">
                     <div className="text-4xl font-black text-white">R$ 997<span className="text-lg text-white/30 font-medium">/mês</span></div>
                  </div>
                  <div className="space-y-4 mb-8 flex-1 relative z-10">
                     <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />
                        <span className="text-sm text-white/90 font-medium">Até 5 Hubs Operacionais</span>
                     </div>
                     <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />
                        <span className="text-sm text-white/90 font-medium">Até 15 Colaboradores Nexus</span>
                     </div>
                     <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />
                        <span className="text-sm text-white/70">100k Créditos/mês para Studio Hórus</span>
                     </div>
                     <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />
                        <span className="text-sm text-white/70">Memory Graph Corporativo Centralizado</span>
                     </div>
                  </div>
                  <button className="w-full py-4 bg-amber-500 text-black font-black rounded-xl hover:bg-amber-400 transition-colors shadow-[0_0_20px_rgba(245,158,11,0.2)] relative z-10">
                     Assinar Business
                  </button>
               </div>

               {/* Enterprise Plan */}
               <div className="bg-[#090A0F] border border-white/10 rounded-3xl p-8 relative flex flex-col">
                  <div className="mb-8">
                     <h3 className="text-xl font-black text-white mb-2">Hórus Enterprise</h3>
                     <p className="text-sm text-white/50 font-light">Infraestrutura cognitiva dedicada para grandes corporações.</p>
                  </div>
                  <div className="mb-8">
                     <div className="text-4xl font-black text-white">Sob Medida</div>
                  </div>
                  <div className="space-y-4 mb-8 flex-1">
                     <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                        <span className="text-sm text-white/70">Hubs e Colaboradores Ilimitados</span>
                     </div>
                     <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                        <span className="text-sm text-white/70">Roteamento Privado / VPC</span>
                     </div>
                     <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                        <span className="text-sm text-white/70">SLA de 99.9% (Nexus SLA)</span>
                     </div>
                     <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                        <span className="text-sm text-white/70">Integrações ERP Legacy Sob Demanda</span>
                     </div>
                  </div>
                  <button className="w-full py-4 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-colors border border-white/10 flex items-center justify-center gap-2">
                     <BrainCircuit className="w-4 h-4" /> Falar com Arquiteto
                  </button>
               </div>

            </div>
            
            <div className="bg-[#090A0F] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                     <Shield className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                     <h4 className="font-bold text-white">Projetos Studio Hórus sob demanda</h4>
                     <p className="text-xs text-white/50">Gerações avulsas no Studio (vídeo, música, código) podem ser pagas unitariamente após aprovação do orçamento, sem alterar o plano base.</p>
                  </div>
               </div>
            </div>

         </div>
      </div>
    </div>
  );
}
