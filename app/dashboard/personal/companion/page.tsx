'use client';
import { Monitor, Download, ArrowLeft, Terminal, Layout } from 'lucide-react';
import Link from 'next/link';

export default function CompanionApp() {
  return (
    <div className="h-full flex flex-col bg-[#050508] relative font-sans">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] mix-blend-overlay pointer-events-none"></div>
      
      <div className="h-16 md:h-20 border-b border-white/5 shrink-0 flex items-center justify-between px-4 sm:px-10 relative z-20">
         <div className="flex items-center gap-4">
            <Link href="/dashboard/personal" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
               <ArrowLeft className="w-4 h-4 text-white/50" />
            </Link>
            <h1 className="font-bold text-white text-sm flex items-center gap-2"><Monitor className="w-4 h-4 text-emerald-400"/> Desktop Companion</h1>
         </div>
      </div>

      <div className="flex-1 p-6 sm:p-10 overflow-y-auto custom-scrollbar relative z-10 flex items-center justify-center">
         <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
               <h2 className="text-4xl font-black text-white">Seu membro no seu sistema operacional.</h2>
               <p className="text-white/50 font-light leading-relaxed">
                  Baixe o Desktop Companion para macOS ou Windows. Ele opera como um assistente invisível que pode analisar sua tela (quando autorizado), redigir emails nativamente, e executar atalhos do sistema.
               </p>
               <div className="flex flex-col gap-3 pt-4">
                  <button className="w-full py-4 bg-emerald-500 text-black font-black rounded-xl hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                     <Download className="w-5 h-5" /> Download para macOS (Silicon)
                  </button>
                  <button className="w-full py-4 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2 border border-white/10">
                     <Download className="w-5 h-5" /> Download para Windows
                  </button>
               </div>
            </div>
            <div className="bg-[#090A0F] border border-white/10 rounded-3xl p-2 shadow-2xl relative">
               <div className="absolute top-4 left-4 flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
               </div>
               <div className="h-64 mt-8 bg-black/50 rounded-2xl border border-white/5 p-4 flex flex-col justify-end">
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl max-w-sm">
                     <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                        <Terminal className="w-4 h-4 text-emerald-400" />
                     </div>
                     <p className="text-xs text-white/70">&quot;Analisei a planilha aberta. A projeção de custos para Q3 está 15% acima da meta. Deseja que eu prepare um email para o financeiro?&quot;</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
