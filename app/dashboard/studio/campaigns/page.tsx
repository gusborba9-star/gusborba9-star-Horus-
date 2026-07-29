'use client';
import { Megaphone, Target } from 'lucide-react';
import NexusDiscoveryFlow from '../components/NexusDiscoveryFlow';

export default function StudioCampaigns() {
  const renderPreview = () => (
    <div className="flex flex-col items-center justify-center h-full p-10 relative z-10 text-center">
       <div className="w-full max-w-4xl bg-[#101010] border border-[#1C1C1C] rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden text-left">
          <div className="flex items-center gap-3 mb-8 border-b border-[#1C1C1C] pb-6">
             <Target className="w-6 h-6 text-[#D4AF37]" />
             <div>
                <h3 className="text-lg font-light text-[#FAFAFA]">Estratégia Orquestrada</h3>
                <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">Nexus Campaign Engine™</span>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-[#141414] border border-[#1C1C1C] p-5 rounded-2xl">
                <h4 className="text-[10px] font-bold text-[#FAFAFA]/50 uppercase tracking-widest mb-3">Ângulo Criativo 1</h4>
                <p className="text-sm text-[#FAFAFA] font-light leading-relaxed mb-4">&quot;A dor da ineficiência&quot;. Foco em como a operação atual drena recursos sem que o gestor perceba.</p>
                <div className="text-xs text-[#D4AF37] border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-3 py-1.5 rounded-lg inline-block">Criativo de Vídeo Sugerido</div>
             </div>
             <div className="bg-[#141414] border border-[#1C1C1C] p-5 rounded-2xl">
                <h4 className="text-[10px] font-bold text-[#FAFAFA]/50 uppercase tracking-widest mb-3">Copy Principal</h4>
                <p className="text-xs text-[#FAFAFA]/70 font-light leading-relaxed italic">&quot;Você não precisa de mais ferramentas. Você precisa de uma infraestrutura que converse entre si. Assuma o controle hoje.&quot;</p>
             </div>
             <div className="bg-[#141414] border border-[#1C1C1C] p-5 rounded-2xl">
                <h4 className="text-[10px] font-bold text-[#FAFAFA]/50 uppercase tracking-widest mb-3">Estrutura Funil</h4>
                <ul className="text-xs text-[#FAFAFA]/70 font-light space-y-2">
                   <li>1. Anúncio Topo (Vídeo)</li>
                   <li>2. Landing Page (Gatilho)</li>
                   <li>3. Captura + Redirecionamento</li>
                   <li>4. Sequência Email (5 dias)</li>
                </ul>
             </div>
          </div>
       </div>
    </div>
  );

  return (
    <NexusDiscoveryFlow 
       moduleName="Studio Campanhas" 
       moduleIcon={Megaphone} 
       
       renderPreview={renderPreview}
    />
  );
}
