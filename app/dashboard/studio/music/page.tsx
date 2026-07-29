'use client';
import { Music, Play } from 'lucide-react';
import NexusDiscoveryFlow from '../components/NexusDiscoveryFlow';

export default function StudioMusic() {
  const renderPreview = () => (
    <div className="flex flex-col items-center justify-center h-full p-10 relative z-10 text-center">
       <div className="w-48 h-48 bg-[#141414] border border-[#1C1C1C] rounded-3xl mb-8 shadow-2xl flex items-center justify-center relative overflow-hidden group cursor-pointer hover:border-[#D4AF37]/50 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Play className="w-12 h-12 text-[#FAFAFA]/50 group-hover:text-[#D4AF37] transition-colors relative z-10 ml-2" />
       </div>
       <h2 className="text-2xl font-light text-[#FAFAFA] mb-2">Composição Arquitetada</h2>
       <p className="text-sm text-[#FAFAFA]/50 font-light mb-8 max-w-md">Ouvir trecho renderizado pelo Nexus Cognitive Engine™. A versão final em alta fidelidade será gerada após a execução da produção.</p>
       
       <div className="w-full max-w-md bg-[#101010] p-6 border border-[#1C1C1C] rounded-2xl text-left">
          <h3 className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest mb-3">Estrutura Analisada</h3>
          <p className="text-xs text-[#FAFAFA]/60 font-light leading-relaxed mb-4">
             Verso 1: Introdução suave com progressão acústica.<br/>
             Pré-refrão: Elevação de dinâmica, adição de percussão.<br/>
             Refrão: Ponto focal emocional.
          </p>
       </div>
    </div>
  );

  return (
    <NexusDiscoveryFlow 
       moduleName="Studio Música" 
       moduleIcon={Music} 
       
       renderPreview={renderPreview}
    />
  );
}
