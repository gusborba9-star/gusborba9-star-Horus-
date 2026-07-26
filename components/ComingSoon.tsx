'use client';
import { ArrowLeft, BrainCircuit, Grip } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function ComingSoon({ title = 'Funcionalidade' }: { title?: string }) {
  const router = useRouter();
  
  return (
    <div className="h-full w-full flex flex-col bg-[#0A0A0C] relative font-sans items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none"></div>
      
      <div className="relative z-10 glass-panel p-12 rounded-3xl max-w-lg w-full">
         <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 mx-auto mb-8 shadow-[0_0_30px_rgba(190,158,108,0.15)]">
            <BrainCircuit className="w-8 h-8 text-amber-500" />
         </div>
         
         <div className="inline-block px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
            Em breve
         </div>
         
         <h2 className="text-2xl font-light text-white mb-4">
            Esta funcionalidade está sendo integrada ao Hórus OS.
         </h2>
         
         <p className="text-sm text-white/40 font-light mb-10">
            A infraestrutura para {title} encontra-se em fase de orquestração no Nexus Cognitive Engine.
         </p>

         <div className="flex flex-col gap-3">
            <button onClick={() => router.back()} className="w-full py-4 bg-amber-500 text-black font-black rounded-xl text-sm hover:bg-amber-400 transition-colors shadow-[0_0_15px_rgba(190,158,108,0.3)] flex items-center justify-center gap-2">
               <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <Link href="/dashboard/studio" className="w-full py-4 bg-[#141417] border border-white/5 text-white font-bold rounded-xl text-sm hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
               <Grip className="w-4 h-4" /> Explorar outras funcionalidades
            </Link>
         </div>
      </div>
    </div>
  );
}
