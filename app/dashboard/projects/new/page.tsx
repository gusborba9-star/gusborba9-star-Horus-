'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  PenTool, ArrowRight, ArrowLeft, Zap, CheckCircle2, 
  Loader2, Play, FileText, Code, Video, Music, Target, Clock, CreditCard
} from 'lucide-react';

export default function NewProjectWizard() {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const router = useRouter();

  const handleNext = () => {
    if (step === 1) {
      // Simulate Engenharia Cognitiva
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setStep(2);
      }, 4000);
    } else {
      setStep(s => Math.min(3, s + 1));
    }
  };
  
  const handleApprove = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsDone(true);
      setTimeout(() => {
        router.push('/dashboard/studio');
      }, 3000);
    }, 3000);
  };

  if (isProcessing && step === 1) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#050508] relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[150px] pointer-events-none animate-pulse"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center p-4">
           <div className="w-24 h-24 rounded-full bg-black border border-purple-500/50 flex items-center justify-center shadow-[0_0_50px_rgba(168,85,247,0.5)] mb-8 relative">
             <Loader2 className="w-10 h-10 text-purple-400 animate-spin absolute" />
             <Zap className="w-8 h-8 text-purple-500/50" />
           </div>
           <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">Engenharia Cognitiva</h2>
           <p className="text-purple-400/80 font-mono text-xs md:text-sm tracking-widest uppercase">Gerando Planejamento, Mega Objetivo e Orçamento Dinâmico...</p>
           
           <div className="w-48 md:w-64 h-1.5 bg-white/10 mt-8 rounded-full overflow-hidden">
             <div className="h-full bg-purple-500 animate-[fillUp_4s_ease-in-out_forwards]" style={{ width: '0%' }}></div>
           </div>
        </div>
      </div>
    );
  }

  if (isProcessing || isDone) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#050508] relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-[150px] pointer-events-none animate-pulse"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center p-4">
           {isProcessing ? (
             <>
               <div className="w-24 h-24 rounded-full bg-black border border-amber-500/50 flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.5)] mb-8 relative">
                 <Loader2 className="w-10 h-10 text-amber-400 animate-spin absolute" />
                 <CreditCard className="w-8 h-8 text-amber-500/50" />
               </div>
               <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">Processando Pagamento</h2>
               <p className="text-amber-400/80 font-mono text-xs md:text-sm tracking-widest uppercase">Iniciando alocação de infraestrutura...</p>
             </>
           ) : (
             <div className="animate-in zoom-in duration-500 flex flex-col items-center">
               <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.5)] mb-8">
                 <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-emerald-400" />
               </div>
               <h2 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tight text-white mb-4">PROJETO APROVADO.</h2>
               <p className="text-emerald-400 font-mono text-xs md:text-sm tracking-widest uppercase">Enviado para a Fila do Diretor.</p>
             </div>
           )}
        </div>
      </div>
    );
  }

  const steps = [
    { id: 1, title: 'O Pedido', desc: 'Descreva o que deseja construir.' },
    { id: 2, title: 'Prévia & Planejamento', desc: 'Estrutura gerada gratuitamente pelo Nexus.' },
  ];

  return (
    <div className="h-full flex flex-col bg-[#050508] relative font-sans">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] mix-blend-overlay pointer-events-none"></div>
      
      {/* Dynamic Background Glow based on step */}
      <div className={`absolute top-0 right-0 w-[50vw] h-[50vw] rounded-full blur-[150px] pointer-events-none transition-colors duration-1000 ${step === 2 ? 'bg-amber-900/10' : 'bg-purple-900/10'}`}></div>

      {/* Header */}
      <div className="h-16 md:h-20 border-b border-white/5 bg-[#090A0F]/80 backdrop-blur-xl shrink-0 flex items-center justify-between px-4 sm:px-10 relative z-20">
         <button onClick={() => router.push('/dashboard/projects')} className="text-white/50 hover:text-white transition-colors flex items-center gap-1 md:gap-2 text-xs md:text-sm font-bold uppercase tracking-widest">
           <XIcon className="w-4 h-4" /> Cancelar
         </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center justify-start p-4 sm:p-6 lg:p-10 relative z-10">
         <div className="w-full max-w-4xl animate-in slide-in-from-bottom-8 duration-700 fade-in py-8 sm:py-0">
            
            <div className="mb-8 md:mb-12 text-center">
               <div className="w-12 h-12 md:w-16 md:h-16 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 md:mb-6 shadow-xl backdrop-blur-md">
                 <PenTool className="w-6 h-6 md:w-8 md:h-8 text-white" />
               </div>
               <h2 className="text-[10px] md:text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Etapa 0{step} de 02</h2>
               <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-tight">{steps[step-1].title}</h1>
               <p className="text-white/50 mt-2 md:mt-4 text-sm md:text-lg font-light px-4">{steps[step-1].desc}</p>
            </div>

            <div className="bg-[#090A0F]/80 sm:bg-black/40 border border-white/10 rounded-3xl p-5 sm:p-8 md:p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
               {step === 1 && (
                 <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-3">Detalhe o seu Projeto</label>
                      <textarea placeholder="Ex: Quero um vídeo institucional de 2 minutos para minha clínica de estética, tom elegante, focando em rejuvenescimento facial..." className="w-full h-48 bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-purple-500/50 transition-colors resize-none text-base custom-scrollbar"></textarea>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-3">Anexos (Opcional)</label>
                      <div className="w-full border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-purple-500/50 hover:bg-purple-500/5 transition-colors cursor-pointer">
                         <FileText className="w-8 h-8 text-white/30 mx-auto mb-3" />
                         <p className="text-sm text-white/50">Arraste arquivos de referência (Imagens, roteiros, brandbook)</p>
                      </div>
                    </div>
                 </div>
               )}

               {step === 2 && (
                 <div className="space-y-8 animate-in fade-in duration-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-6">
                          <h3 className="text-lg font-bold text-white flex items-center gap-2"><FileText className="w-5 h-5 text-purple-400"/> Planejamento Gerado</h3>
                          
                          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3 text-sm text-white/70">
                             <p><strong>Formato:</strong> Vídeo Institucional Cinematic</p>
                             <p><strong>Duração Estimada:</strong> 2:15 min</p>
                             <p><strong>Estrutura:</strong> 1. Introdução (Gatilho) &gt; 2. Problema &gt; 3. Solução &gt; 4. Autoridade &gt; 5. CTA</p>
                             <p><strong>Engine(s):</strong> Nexus VideoGen, Nexus Voice (PT-BR Elegante), Auto-Audio Mix</p>
                          </div>

                          <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                             <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Storyboard Resumido</h4>
                             <ul className="space-y-2 text-xs text-white/60">
                               <li>• Cena 1: Fachada da clínica (Slow motion)</li>
                               <li>• Cena 2: Detalhe equipamento high-tech</li>
                               <li>• Cena 3: Cliente sorrindo, resultado natural</li>
                             </ul>
                          </div>
                       </div>
                       
                       <div className="space-y-6">
                          <h3 className="text-lg font-bold text-white flex items-center gap-2"><CreditCard className="w-5 h-5 text-amber-400"/> Orçamento Dinâmico (Nexus Pricing Engine™)</h3>
                          
                          <div className="bg-[#090A0F] border border-amber-500/30 rounded-2xl p-6 relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-2"><span className="text-[9px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded uppercase tracking-widest font-bold">Único</span></div>
                             <div className="text-sm text-white/50 mb-1">Valor do Projeto</div>
                             <div className="text-4xl font-black text-white mb-6">R$ 1.850</div>
                             
                             <div className="space-y-3 text-xs text-white/60 mb-6 pb-6 border-b border-white/10">
                                <div className="flex justify-between"><span>Complexidade / Nexus</span><span>Alto (VideoGen)</span></div>
                                <div className="flex justify-between"><span>Tempo de Processamento</span><span>~45 min GPU</span></div>
                                <div className="flex justify-between"><span>Prazo de Entrega</span><span className="text-emerald-400 font-bold">Hoje (Fila Diretor)</span></div>
                             </div>

                             <button onClick={handleApprove} className="w-full py-4 bg-amber-500 text-black font-black rounded-xl hover:bg-amber-400 transition-colors shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                                APROVAR PROJETO
                             </button>
                          </div>
                       </div>
                    </div>
                 </div>
               )}
            </div>
            
            {/* Navigation Actions */}
            {step === 1 && (
              <div className="mt-6 md:mt-8 flex justify-end">
                 <button 
                   onClick={handleNext}
                   className="w-full sm:w-auto px-8 py-3 md:py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors shadow-lg text-sm md:text-base"
                 >
                   Solicitar Engenharia <ArrowRight className="w-4 h-4" />
                 </button>
              </div>
            )}

         </div>
      </div>
    </div>
  );
}

function XIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
}
