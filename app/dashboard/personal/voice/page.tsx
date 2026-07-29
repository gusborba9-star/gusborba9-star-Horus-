'use client';
import { Headphones, Mic, Play, Settings, ArrowLeft, Volume2, Radio } from 'lucide-react';
import Link from 'next/link';

export default function VoiceRuntime() {
  return (
    <div className="h-full flex flex-col bg-[#050508] relative font-sans">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] mix-blend-overlay pointer-events-none"></div>
      
      <div className="h-16 md:h-20 border-b border-white/5 shrink-0 flex items-center justify-between px-4 sm:px-10 relative z-20">
         <div className="flex items-center gap-4">
            <Link href="/dashboard/personal" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
               <ArrowLeft className="w-4 h-4 text-white/50" />
            </Link>
            <h1 className="font-bold text-white text-sm flex items-center gap-2"><Headphones className="w-4 h-4 text-blue-400"/> Hórus Voice Runtime™</h1>
         </div>
      </div>

      <div className="flex-1 p-6 sm:p-10 overflow-y-auto custom-scrollbar relative z-10 flex flex-col items-center justify-center">
         <div className="w-full max-w-2xl text-center space-y-8">
            <div className="w-32 h-32 rounded-full bg-blue-500/10 border-2 border-blue-500 mx-auto flex items-center justify-center relative shadow-[0_0_50px_rgba(59,130,246,0.3)]">
               <div className="absolute inset-0 rounded-full border border-blue-400/50 animate-ping opacity-20"></div>
               <Mic className="w-12 h-12 text-blue-400" />
            </div>
            
            <div>
               <h2 className="text-3xl font-black text-white mb-2">Voice Runtime Ativo</h2>
               <p className="text-white/50 font-light max-w-md mx-auto">Comunicação natural habilitada. Seu membro está ouvindo e processando em tempo real.</p>
            </div>

            <div className="bg-[#090A0F] border border-white/10 rounded-3xl p-6 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                     <Volume2 className="w-5 h-5 text-white/50" />
                  </div>
                  <div className="text-left">
                     <div className="text-sm font-bold text-white">Voz: Masculino (Elegante PT-BR)</div>
                     <div className="text-[10px] text-white/40">Latência: 120ms • Modo: Contínuo</div>
                  </div>
               </div>
               <button className="px-4 py-2 bg-blue-500/20 text-blue-400 font-bold rounded-lg text-xs hover:bg-blue-500/30 transition-colors">
                  Ajustar Voz
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
