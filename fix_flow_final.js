const fs = require('fs');

const code = `'use client';
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Target, BrainCircuit, Check, Play, Eye, Send, X, Shield, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface NexusDiscoveryFlowProps {
  moduleName: string;
  moduleIcon: any;
  onFinish?: (answers: Record<string, string>) => void;
  renderPreview?: () => React.ReactNode;
  isSubscriptionMode?: boolean;
}

type Message = { id: string; role: 'user' | 'nexus'; content: string };
type Architecture = {
  features: string[];
  status: string;
  complexity: string;
  investment: string;
};

export default function NexusDiscoveryFlow({ moduleName, moduleIcon: Icon, onFinish, renderPreview, isSubscriptionMode }: NexusDiscoveryFlowProps) {
  const router = useRouter();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [step, setStep] = useState(0);
  const [isReady, setIsReady] = useState(false);
  
  const [architecture, setArchitecture] = useState<Architecture>({
    features: [],
    status: 'Iniciando análise...',
    complexity: 'Calculando...',
    investment: 'Calculando...'
  });
  
  const [showPayment, setShowPayment] = useState(false);
  const [showPreviewScreen, setShowPreviewScreen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let initialMsg = '';
    let initialFeatures = ['Integração Memory Graph™'];
    
    if (moduleName.toLowerCase().includes('música')) {
      initialMsg = 'Bem-vindo ao Studio Música. Vou orquestrar sua produção musical. Você já possui algum direcionamento inicial (como letra, instrumental ou referência) ou começaremos do zero?';
    } else if (moduleName.toLowerCase().includes('vídeo')) {
      initialMsg = 'Bem-vindo ao Studio Vídeo. Vou orquestrar sua produção audiovisual. Qual é o objetivo principal deste vídeo (Venda, Institucional, Treinamento, Publicidade, Outro)?';
    } else if (moduleName.toLowerCase().includes('colaborador') || moduleName.toLowerCase().includes('agente')) {
      initialMsg = 'Vou arquitetar sua nova equipe digital. Para que eu possa orquestrar as melhores capacidades, qual é o resultado principal que você deseja alcançar com esta operação?';
    } else {
      initialMsg = \`Iniciando arquitetura para \${moduleName}. Qual é o objetivo operacional que deseja alcançar com este projeto?\`;
    }
    
    setArchitecture({
       features: initialFeatures,
       status: 'Aguardando parâmetros',
       complexity: 'Calculando...',
       investment: 'Calculando...'
    });
    
    setMessages([{ id: 'init', role: 'nexus', content: initialMsg }]);
  }, [moduleName]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleUserMessage = () => {
    if (!chatInput.trim() || isTyping) return;
    
    const text = chatInput.trim();
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: text }]);
    setChatInput('');
    setIsTyping(true);
    
    setTimeout(() => {
       let nextMsg = '';
       let newFeatures = [...architecture.features];
       const lowerText = text.toLowerCase();
       
       if (moduleName.toLowerCase().includes('música')) {
         if (step === 0) {
           nextMsg = 'Excelente. Com essa base, precisamos definir a identidade sonora. Qual estilo musical melhor representa o objetivo desta faixa? (Sertanejo, Rock, Pop, Gospel, Jazz, Outro)';
           newFeatures.push(lowerText.includes('letra') ? 'Sintetizador Vocal' : 'Geração Instrumental');
           setStep(1);
           setArchitecture(prev => ({ ...prev, status: 'Definindo identidade sonora' }));
         } else if (step === 1) {
           nextMsg = 'Perfeito. Para a atmosfera da música, qual emoção principal queremos transmitir? E onde pretende utilizar essa faixa (Spotify, YouTube, Publicidade, Outro)?';
           newFeatures.push(\`Masterização: \${text}\`);
           setStep(2);
           setArchitecture(prev => ({ ...prev, status: 'Ajustando atmosfera' }));
         } else {
           nextMsg = 'Arquitetura musical concluída. Adaptei a equalização e a estrutura para garantir máxima fidelidade ao seu objetivo. Você pode conferir o escopo final no Painel de Evolução. Podemos iniciar a produção?';
           newFeatures.push('Exportação Multicanal');
           setArchitecture(prev => ({ ...prev, status: 'Arquitetura Concluída', complexity: 'Alta (Geração Multimodal)', investment: isSubscriptionMode ? 'Incluso na assinatura' : '750 Créditos' }));
           setIsReady(true);
         }
       } 
       else if (moduleName.toLowerCase().includes('colaborador') || moduleName.toLowerCase().includes('agente')) {
         if (step === 0) {
           if (lowerText.includes('clínica') || lowerText.includes('consultório') || lowerText.includes('saúde') || lowerText.includes('odonto')) {
              nextMsg = 'Em clínicas, normalmente existem oportunidades de ganho operacional em: confirmação automática, lista de espera, cobrança via Pix, lembretes e campanhas de retorno.\\n\\nEssas funções costumam reduzir faltas e aumentar faturamento. Deseja incluir essas integrações na arquitetura?';
              newFeatures.push('Gestão de Agenda', 'Integração Financeira', 'Automação de Lembretes');
           } else if (lowerText.includes('vender') || lowerText.includes('venda') || lowerText.includes('comercial')) {
              nextMsg = 'Excelente. Analisei seu objetivo. Percebi que você busca crescimento comercial. Antes de arquitetar sua operação, gostaria de compreender melhor seu negócio. Qual é o seu segmento? (Clínica, Escritório, Restaurante, Loja, Imobiliária, Outro)';
              newFeatures.push('Motor de Vendas', 'CRM Cognitivo');
           } else {
              nextMsg = 'Compreendido. Para uma operação inteligente focada neste objetivo, recomendo adicionar: atendimento ativo via WhatsApp, CRM para acompanhamento e painéis de análise de dados.\\n\\nIsso garantirá uma operação previsível. Podemos incluir essas integrações?';
              newFeatures.push('Atendimento Omnichannel', 'CRM Integrado');
           }
           setStep(1);
           setArchitecture(prev => ({ ...prev, status: 'Analisando oportunidades' }));
         } else if (step === 1) {
           if (lowerText.includes('clínica') || lowerText.includes('sim') || lowerText.includes('pode')) {
              nextMsg = 'Perfeito. A orquestração do WhatsApp com a leitura da agenda reduzirá a inadimplência e organizará o fluxo de pacientes automaticamente.\\n\\nO escopo atualizado já está no Painel de Evolução. Podemos validar o projeto e iniciar a implantação desta operação?';
              if (!newFeatures.includes('Gestão de Agenda')) {
                 newFeatures.push('Gestão de Agenda', 'Automação de Lembretes');
              }
           } else {
              nextMsg = 'Ótimo. O Nexus garantirá que este colaborador atue de maneira fluida, utilizando o Memory Graph para manter o contexto de todas as interações. O escopo foi atualizado no Painel de Evolução.\\n\\nPodemos validar o projeto e iniciar a implantação?';
              newFeatures.push('Integração WhatsApp', 'Analytics em Tempo Real');
           }
           setArchitecture(prev => ({ ...prev, status: 'Otimizando Operação' }));
           setStep(2);
         } else {
           nextMsg = 'Arquitetura operacional validada e concluída. O Nexus alocou os melhores recursos para garantir que sua operação escale com segurança.\\n\\nRevise o Painel de Evolução e clique em Executar Produção para finalizar a orquestração.';
           setArchitecture(prev => ({ ...prev, status: 'Arquitetura Concluída', complexity: 'Avançada', investment: isSubscriptionMode ? 'Incluso na assinatura' : '1250 Créditos' }));
           setIsReady(true);
         }
       }
       else {
          if (step === 0) {
             nextMsg = \`Analisando seu pedido. Identifiquei que podemos otimizar este projeto adicionando análises em tempo real e conectando nativamente ao Memory Graph da sua operação.\\n\\nVocê possui alguma preferência específica de formato ou plataforma para esta entrega?\`;
             newFeatures.push('Otimização de Contexto');
             setStep(1);
             setArchitecture(prev => ({ ...prev, status: 'Mapeando requisitos' }));
          } else {
             nextMsg = 'Perfeito. Arquitetura validada. Estruturei a operação para maximizar a eficiência técnica e o retorno funcional. O Painel de Evolução reflete as especificações finais.\\n\\nPodemos prosseguir para a produção?';
             newFeatures.push('Otimização de Entrega', 'Escalabilidade Padrão');
             setArchitecture(prev => ({ ...prev, status: 'Arquitetura Concluída', complexity: 'Média', investment: isSubscriptionMode ? 'Incluso na assinatura' : '500 Créditos' }));
             setIsReady(true);
          }
       }
       
       setArchitecture(prev => ({ ...prev, features: Array.from(new Set(newFeatures)) }));
       setMessages(prev => [...prev, { id: Date.now().toString(), role: 'nexus', content: nextMsg }]);
       setIsTyping(false);
    }, 1500);
  };

  if (showPreviewScreen && renderPreview) {
    return (
      <div className="fixed inset-0 z-50 bg-[#080808] flex flex-col">
        <div className="h-16 border-b border-[#1C1C1C] flex items-center justify-between px-6 shrink-0 bg-[#0A0A0C]">
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-[#D4AF37]" />
            <span className="text-sm font-bold text-[#FAFAFA] tracking-widest uppercase">Preview: {moduleName}</span>
          </div>
          <button onClick={() => setShowPreviewScreen(false)} className="px-4 py-2 bg-[#1C1C1C] hover:bg-[#2A2A2A] rounded-lg text-xs font-bold text-[#FAFAFA] transition-colors uppercase tracking-widest flex items-center gap-2">
             <X className="w-4 h-4" /> Fechar
          </button>
        </div>
        <div className="flex-1 overflow-hidden relative">
           {renderPreview()}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-[#080808] font-sans overflow-hidden">
      
      {/* Header Mobile (Only visible on small screens to replace the dashboard header logic if needed, but handled by layout usually) */}
      
      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-[#1C1C1C]">
         <div className="h-16 border-b border-[#1C1C1C] flex items-center px-6 shrink-0 bg-[#0A0A0C]">
            <button onClick={() => router.push('/dashboard/studio')} className="flex items-center gap-2 text-[#FAFAFA]/50 hover:text-[#FAFAFA] transition-colors text-xs font-bold uppercase tracking-widest mr-4">
               <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3">
               <Icon className="w-4 h-4 text-[#D4AF37]" />
               <span className="text-sm font-bold text-[#FAFAFA] tracking-widest uppercase">{moduleName}</span>
            </div>
         </div>
         
         <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            {messages.map(msg => (
               <div key={msg.id} className={\`flex \${msg.role === 'user' ? 'justify-end' : 'justify-start'}\`}>
                  <div className={\`max-w-[85%] md:max-w-[75%] p-5 rounded-2xl \${
                     msg.role === 'user' 
                       ? 'bg-[#1C1C1C] text-[#FAFAFA] rounded-tr-sm border border-[#2A2A2A]' 
                       : 'bg-[#D4AF37]/5 text-[#FAFAFA]/90 rounded-tl-sm border border-[#D4AF37]/20 shadow-[0_0_15px_rgba(212,175,55,0.03)]'
                  }\`}>
                     {msg.role === 'nexus' && (
                        <div className="flex items-center gap-2 mb-3">
                           <BrainCircuit className="w-4 h-4 text-[#D4AF37]" />
                           <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">Nexus™</span>
                        </div>
                     )}
                     <div className="text-sm font-light leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                  </div>
               </div>
            ))}
            {isTyping && (
               <div className="flex justify-start">
                  <div className="p-5 rounded-2xl bg-[#D4AF37]/5 text-[#FAFAFA]/90 rounded-tl-sm border border-[#D4AF37]/20">
                     <div className="flex items-center gap-2 mb-3">
                        <BrainCircuit className="w-4 h-4 text-[#D4AF37]" />
                        <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">Nexus™</span>
                     </div>
                     <div className="flex gap-1.5 items-center h-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/50 animate-bounce"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/50 animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/50 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                     </div>
                  </div>
               </div>
            )}
            <div ref={chatEndRef} />
         </div>
         
         <div className="p-6 border-t border-[#1C1C1C] bg-[#0A0A0C] shrink-0">
            <div className="relative max-w-4xl mx-auto">
               <input 
                  type="text" 
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !isTyping && chatInput.trim() && handleUserMessage()}
                  placeholder="Descreva seu objetivo para o Nexus..."
                  className="w-full bg-[#141414] border border-[#1C1C1C] rounded-xl pl-5 pr-14 py-4 text-sm text-[#FAFAFA] outline-none focus:border-[#D4AF37]/40 transition-colors shadow-inner"
               />
               <button 
                  onClick={() => !isTyping && chatInput.trim() && handleUserMessage()}
                  disabled={!chatInput.trim() || isTyping}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-[#1C1C1C] hover:bg-[#D4AF37]/20 border border-[#2A2A2A] hover:border-[#D4AF37]/40 rounded-lg text-[#FAFAFA]/50 hover:text-[#D4AF37] transition-all disabled:opacity-50"
               >
                  <Send className="w-4 h-4" />
               </button>
            </div>
            <div className="text-center mt-3">
               <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#FAFAFA]/30">Powered by Nexus Cognitive Core™</span>
            </div>
         </div>
      </div>
      
      {/* Painel de Evolução */}
      <div className="w-full lg:w-96 bg-[#0A0A0C] flex flex-col shrink-0 border-l border-[#1C1C1C]">
         <div className="p-6 border-b border-[#1C1C1C] shrink-0">
            <h3 className="text-sm font-bold text-[#FAFAFA] flex items-center gap-2 uppercase tracking-widest">
               <Target className="w-4 h-4 text-[#D4AF37]" />
               Painel de Evolução
            </h3>
            <p className="text-[10px] text-[#FAFAFA]/40 mt-1 uppercase tracking-wider">Arquitetura Dinâmica</p>
         </div>
         
         <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
            {/* Status */}
            <div className="mb-8">
               <span className="text-[10px] text-[#FAFAFA]/40 font-bold uppercase tracking-widest block mb-3">Status da Operação</span>
               <div className="flex items-center gap-3 bg-[#141414] border border-[#1C1C1C] p-3 rounded-lg">
                  <div className={\`w-2 h-2 rounded-full shrink-0 \${isReady ? 'bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.8)]' : 'bg-[#D4AF37] animate-pulse'}\`}></div>
                  <span className="text-xs font-medium text-[#FAFAFA]">{architecture.status}</span>
               </div>
            </div>
            
            {/* Capacidades */}
            <div className="mb-8">
               <span className="text-[10px] text-[#FAFAFA]/40 font-bold uppercase tracking-widest block mb-4">Capacidades Orquestradas</span>
               <ul className="space-y-4">
                  {architecture.features.map((feat, idx) => (
                     <li key={idx} className="flex items-start gap-3 animate-in fade-in slide-in-from-left-2">
                        <Check className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                        <span className="text-xs text-[#FAFAFA]/80 leading-relaxed font-medium">{feat}</span>
                     </li>
                  ))}
                  {!isReady && (
                     <li className="flex items-center gap-3 opacity-50 mt-4">
                        <div className="w-4 h-4 border-2 border-[#FAFAFA]/30 rounded-full border-t-transparent animate-spin shrink-0"></div>
                        <span className="text-xs text-[#FAFAFA]/50 italic">Analisando oportunidades...</span>
                     </li>
                  )}
               </ul>
            </div>
            
            {/* Inteligencia Financeira */}
            <div className="pt-6 border-t border-[#1C1C1C]">
               <span className="text-[10px] text-[#FAFAFA]/40 font-bold uppercase tracking-widest block mb-4">Escopo Computacional</span>
               
               <div className="space-y-4">
                  <div className="flex justify-between items-center bg-[#141414] p-3 rounded-lg border border-[#1C1C1C]">
                     <span className="text-[11px] text-[#FAFAFA]/60 font-medium">Complexidade</span>
                     <span className="text-[11px] font-bold text-[#FAFAFA]">{architecture.complexity}</span>
                  </div>
                  <div className="flex justify-between items-center bg-[#D4AF37]/5 p-3 rounded-lg border border-[#D4AF37]/20">
                     <span className="text-[11px] text-[#FAFAFA]/60 font-medium">Investimento</span>
                     <span className="text-[11px] font-bold text-[#D4AF37]">{architecture.investment}</span>
                  </div>
               </div>
            </div>
         </div>
         
         {/* Ações */}
         <div className="p-6 border-t border-[#1C1C1C] space-y-3 bg-[#0A0A0C] shrink-0">
            {isReady ? (
               <>
                  {renderPreview && (
                     <button onClick={() => setShowPreviewScreen(true)} className="w-full py-4 bg-[#141414] border border-[#1C1C1C] hover:border-[#D4AF37]/40 text-[#FAFAFA] text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 group">
                        <Eye className="w-4 h-4 text-[#FAFAFA]/50 group-hover:text-[#D4AF37] transition-colors" />
                        Visualizar Operação
                     </button>
                  )}
                  <button onClick={() => setShowPayment(true)} className="w-full py-4 bg-[#D4AF37] text-black text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-[#E5D2A0] transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] flex items-center justify-center gap-2">
                     <Play className="w-4 h-4" />
                     Executar Produção
                  </button>
               </>
            ) : (
               <div className="w-full py-4 bg-[#141414] border border-[#1C1C1C] text-[#FAFAFA]/30 text-[10px] font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                  <Shield className="w-4 h-4" />
                  Aguardando Arquitetura
               </div>
            )}
         </div>
      </div>
      
      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-[#080808]/90 z-50 flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-[#101010] border border-[#1C1C1C] rounded-3xl p-10 max-w-md w-full relative shadow-2xl">
              <button onClick={() => setShowPayment(false)} className="absolute top-6 right-6 text-[#FAFAFA]/30 hover:text-[#FAFAFA] text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1"><X className="w-3 h-3"/> Fechar</button>
              
              <div className="text-center mb-10">
                 <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-6">
                    <Target className="w-8 h-8 text-[#D4AF37]" />
                 </div>
                 <h2 className="text-2xl font-light text-[#FAFAFA] tracking-wide mb-4">Liberação de Recursos</h2>
                 <p className="text-xs text-[#FAFAFA]/60 font-light leading-relaxed">
                    {isSubscriptionMode 
                      ? 'Sua operação utilizará a capacidade da sua assinatura corporativa. O Nexus finalizará a configuração estrutural em minutos, porém possuirá até 24 horas para a entrega definitiva e calibração operacional. Confirme para iniciar o provisionamento.' 
                      : 'Este projeto pontual utilizará Hórus Credits™. O Nexus possuirá até 24 horas para a entrega definitiva e calibração operacional. Escaneie o QR Code via Pix para adicionar créditos e iniciar a produção imediatamente.'}
                 </p>
              </div>

              {!isSubscriptionMode && (
                 <div className="bg-[#FAFAFA] p-4 rounded-2xl mx-auto w-56 h-56 flex items-center justify-center mb-8 shadow-inner relative overflow-hidden group hover:scale-105 transition-transform cursor-pointer">
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <span className="text-black font-bold text-[10px] uppercase tracking-widest bg-white/90 px-4 py-2 rounded-full shadow-lg">Copiar Código</span>
                    </div>
                    <div className="w-full h-full border-[2px] border-dashed border-[#1C1C1C]/20 rounded-xl flex items-center justify-center">
                       <span className="text-[#101010]/40 font-bold text-xs uppercase tracking-widest">QR Code Pix</span>
                    </div>
                 </div>
              )}

              <div className="text-[9px] text-[#D4AF37]/60 uppercase tracking-[0.2em] font-bold text-center mb-6 flex items-center justify-center gap-2">
                 <BrainCircuit className="w-3 h-3" /> Orçamento calculado pelo Nexus Cognitive Core™
              </div>
              
              <div className="flex justify-between items-center bg-[#141414] p-5 rounded-2xl border border-[#1C1C1C]">
                 <div>
                    <span className="text-[10px] font-bold text-[#FAFAFA]/40 uppercase tracking-widest block mb-1">Custo Estimado</span>
                    <span className="text-lg font-light text-[#D4AF37]">
                       {isSubscriptionMode ? 'Incluso' : '750'} 
                       {!isSubscriptionMode && <span className="text-[9px] font-bold uppercase tracking-widest text-[#D4AF37]/50 ml-1">Créditos</span>}
                    </span>
                 </div>
                 <button className="px-5 py-3 bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 hover:text-[#E5D2A0] font-bold text-[10px] uppercase tracking-widest rounded-xl border border-[#D4AF37]/20 transition-colors">
                    {isSubscriptionMode ? 'Confirmar Deploy' : 'Pagar Valor Integral'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync('app/dashboard/studio/components/NexusDiscoveryFlow.tsx', code);
