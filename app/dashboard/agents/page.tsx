
'use client';
import { Bot, MessageSquare } from 'lucide-react';
import NexusDiscoveryFlow from '../studio/components/NexusDiscoveryFlow';

export default function AgentsDiscovery() {
  const renderPreview = () => (
    <div className="flex flex-col items-center justify-center h-full p-4 md:p-10 relative z-10">
       <div className="w-full max-w-2xl bg-[#101010] border border-[#1C1C1C] rounded-3xl shadow-2xl flex flex-col overflow-hidden h-[500px]">
          <div className="h-16 bg-[#141414] border-b border-[#1C1C1C] flex items-center px-6 gap-4 shrink-0">
             <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                <Bot className="w-4 h-4 text-[#D4AF37]" />
             </div>
             <div>
                <h4 className="text-sm font-bold text-[#FAFAFA]">Nexus Operacional</h4>
                <p className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-widest">Operação Ativa</p>
             </div>
          </div>
          
          <div className="flex-1 bg-[#080808] p-6 overflow-y-auto space-y-4">
             <div className="flex gap-3 max-w-[80%]">
                <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 shrink-0 flex items-center justify-center mt-1">
                   <Bot className="w-3 h-3 text-[#D4AF37]" />
                </div>
                <div className="bg-[#141414] border border-[#1C1C1C] p-3 rounded-2xl rounded-tl-sm text-sm text-[#FAFAFA]/70 font-light leading-relaxed">
                   Olá. Minha arquitetura neural foi provisionada. Analisei as permissões e estou pronto para assumir as rotinas operacionais solicitadas. Podemos iniciar os testes de fluxo?
                </div>
             </div>
             <div className="flex justify-end gap-3 max-w-[80%] ml-auto">
                <div className="bg-[#D4AF37] p-3 rounded-2xl rounded-tr-sm text-sm text-black font-medium">
                   Quais sistemas você já conectou?
                </div>
             </div>
             <div className="flex gap-3 max-w-[80%]">
                <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 shrink-0 flex items-center justify-center mt-1">
                   <Bot className="w-3 h-3 text-[#D4AF37]" />
                </div>
                <div className="bg-[#141414] border border-[#1C1C1C] p-3 rounded-2xl rounded-tl-sm text-sm text-[#FAFAFA]/70 font-light leading-relaxed">
                   Identifiquei o Memory Graph ativo da organização. O acesso às políticas internas já está sincronizado. A configuração manual será disponibilizada apenas quando você receber seu membro definitivo em até 24 horas. Nesse momento, em poucos minutos, você terá a opção de integrar a qualquer sistema ou configurar manualmente auxiliado por um guia que o próprio sistema disponibiliza.
                </div>
             </div>
          </div>

          <div className="p-4 bg-[#141414] border-t border-[#1C1C1C]">
             <div className="relative">
                <input 
                  type="text" 
                  disabled
                  placeholder="Simule uma interação com o membro cognitivo..." 
                  className="w-full bg-[#080808] border border-[#1C1C1C] rounded-xl pl-4 pr-12 py-3 text-sm text-[#FAFAFA]/50 outline-none cursor-not-allowed"
                />
                <button disabled className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#D4AF37]/50 text-black rounded-lg cursor-not-allowed">
                   <MessageSquare className="w-4 h-4" />
                </button>
             </div>
          </div>
       </div>
    </div>
  );

  return (
    <NexusDiscoveryFlow 
       moduleName="Criar Membro da Equipe Cognitiva" 
       moduleIcon={Bot} 
       
       renderPreview={renderPreview}
       isSubscriptionMode={true}
    />
  );
}
