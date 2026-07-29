const fs = require('fs');

const content = `
'use client';
import { Bot, MessageSquare } from 'lucide-react';
import NexusDiscoveryFlow, { Question } from '../studio/components/NexusDiscoveryFlow';

export default function AgentsDiscovery() {
  const questions: Question[] = [
    {
      id: 'role',
      title: 'Qual o papel principal do seu novo colaborador digital?',
      options: [
        { label: 'SDR / Qualificação de Leads', value: 'sdr' },
        { label: 'Suporte Técnico Nível 1', value: 'suporte' },
        { label: 'Análise de Dados e Relatórios', value: 'dados' },
        { label: 'Assistente Executivo Pessoal', value: 'executivo' },
      ],
      allowOther: true
    },
    {
      id: 'channel',
      title: 'Onde ele irá operar prioritariamente?',
      options: [
        { label: 'WhatsApp / Canais de Mensageria', value: 'whatsapp' },
        { label: 'E-mail Corporativo', value: 'email' },
        { label: 'Plataforma Interna (Slack/Teams)', value: 'interna' },
        { label: 'Chat em Site / Landing Page', value: 'site' },
      ],
      allowOther: true
    },
    {
      id: 'autonomy',
      title: 'Qual o nível de autonomia operacional?',
      options: [
        { label: 'Rascunhos (Prepara mas não envia)', value: 'rascunho' },
        { label: 'Aprovação Humana (Copiloto)', value: 'copiloto' },
        { label: 'Autonomia Total (Regras de Negócio)', value: 'total' },
        { label: 'Apenas Leitura / Alertas', value: 'alertas' },
      ],
      allowOther: true
    },
    {
      id: 'systems',
      title: 'Qual o contexto de conhecimento necessário?',
      options: [
        { label: 'CRM / Histórico de Vendas', value: 'crm' },
        { label: 'ERP / Estoque e Finanças', value: 'erp' },
        { label: 'Base de Conhecimento / PDFs', value: 'rag' },
        { label: 'Integração Aberta (Várias Fontes)', value: 'omni' },
      ],
      allowOther: true
    }
  ];

  const renderPreview = () => (
    <div className="flex flex-col items-center justify-center h-full p-4 md:p-10 relative z-10">
       <div className="w-full max-w-2xl bg-[#101010] border border-[#1C1C1C] rounded-3xl shadow-2xl flex flex-col overflow-hidden h-[500px]">
          <div className="h-16 bg-[#141414] border-b border-[#1C1C1C] flex items-center px-6 gap-4 shrink-0">
             <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                <Bot className="w-4 h-4 text-[#D4AF37]" />
             </div>
             <div>
                <h4 className="text-sm font-bold text-[#FAFAFA]">Nexus Operacional</h4>
                <p className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-widest">Sandbox Ativo</p>
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
                   Identifiquei o Memory Graph ativo da organização. O acesso às políticas internas já está sincronizado. Para conexões externas (CRM/ERP), o guia de integração manual será liberado após a ativação definitiva.
                </div>
             </div>
          </div>

          <div className="p-4 bg-[#141414] border-t border-[#1C1C1C]">
             <div className="relative">
                <input 
                  type="text" 
                  disabled
                  placeholder="Simule uma interação com o agente..." 
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
       moduleName="Criar Colaborador Digital" 
       moduleIcon={Bot} 
       questions={questions}
       renderPreview={renderPreview}
       isSubscriptionMode={true}
    />
  );
}
`;

fs.writeFileSync('app/dashboard/agents/page.tsx', content);
