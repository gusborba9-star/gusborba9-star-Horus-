'use client';
import { Video, Play } from 'lucide-react';
import NexusDiscoveryFlow from '../components/NexusDiscoveryFlow';

export default function StudioVideo() {
  const renderPreview = () => (
    <div className="flex flex-col items-center justify-center h-full p-10 relative z-10 text-center">
       <div className="w-full max-w-2xl aspect-video bg-[#101010] border border-[#1C1C1C] rounded-3xl mb-8 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:border-[#D4AF37]/50 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 pointer-events-none"></div>
          <Play className="w-16 h-16 text-[#FAFAFA]/50 group-hover:text-[#D4AF37] transition-colors relative z-20" />
          <div className="absolute bottom-4 left-6 z-20 text-left">
             <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">Renderização Baixa Resolução</span>
             <p className="text-xs text-[#FAFAFA]/70 font-light mt-1">Clique para visualizar a estrutura das cenas elaboradas.</p>
          </div>
       </div>
    </div>
  );

  return (
    <NexusDiscoveryFlow 
       moduleName="Studio Vídeo" 
       moduleIcon={Video} 
       
       renderPreview={renderPreview}
    />
  );
}
