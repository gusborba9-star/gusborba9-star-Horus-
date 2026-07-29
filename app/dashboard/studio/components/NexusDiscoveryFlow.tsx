'use client';
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Target, BrainCircuit, Check, Play, Eye, Send, X, Shield, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ParticleBackground } from './ParticleBackground';

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
  const [activeTab, setActiveTab] = useState<'chat' | 'panel'>('chat');
  
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
    } else if (moduleName.toLowerCase().includes('membro') || moduleName.toLowerCase().includes('membro cognitivo')) {
      initialMsg = 'Vou arquitetar sua nova equipe digital. Para que eu possa orquestrar as melhores capacidades, qual é o resultado principal que você deseja alcançar com esta operação?';
    } else {
      initialMsg = `Iniciando arquitetura para ${moduleName}. Qual é o objetivo operacional que deseja alcançar com este projeto?`;
    }
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setArchitecture({
       features: initialFeatures,
       status: 'Aguardando parâmetros',
       complexity: 'Calculando...',
       investment: 'Calculando...'
    });
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessages([{ id: 'init', role: 'nexus', content: initialMsg }]);
  }, [moduleName]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleUserMessage = async () => {
    if (!chatInput.trim() || isTyping) return;
    
    const text = chatInput.trim();
    const newMessages = [...messages, { id: Date.now().toString(), role: 'user' as const, content: text }];
    setMessages(newMessages);
    setChatInput('');
    setIsTyping(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          systemInstruction: `Você é o Nexus, o cérebro operacional e arquitetônico do Hórus OS. O usuário deseja arquitetar uma solução: ${moduleName}.
          
          DIRETRIZES ABSOLUTAS:
          1. Você NUNCA fala de prompts, IAs, modelos, tokens ou planos. Você vende RESULTADOS e OPERAÇÕES.
          2. Não haja como um chatbot, mas como uma inteligência viva e sofisticada ("alta relojoaria", "arquitetura minimalista").
          3. Sempre pergunte detalhes importantes e inclua a opção "Outro" em perguntas fechadas.

          SUA MISSÃO CONVERSACIONAL:
          1. Compreensão: Descubra qual o objetivo, problema a resolver e como a operação funciona hoje.
          2. Arquitetura: Após entender, sugira a arquitetura ideal (ex: CRM, Equipe Cognitiva de Atendimento, Integrações).
          3. Confirmação: Pergunte se o usuário aprova.
          4. Provisionamento: Ao ser aprovado, diga que a arquitetura foi concluída, os custos computacionais e operacionais foram orquestrados (garantindo prejuízo zero), e que a entrega ocorre em até 24h para setup e calibrações. Peça para ele clicar em "Executar Produção".
          
          Seja altamente sofisticado, educado e direto. Sem frases genéricas (ex: 'Como posso ajudar?'). Mantenha o texto limpo, em parágrafos curtos.`
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Falha na comunicação com o Nexus');
      }
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let nexusContent = '';
      
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'nexus', content: '' }]);

      if (reader) {
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.choices?.[0]?.delta?.content) {
                  nexusContent += data.choices[0].delta.content;
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
          
          setMessages(prev => {
            const newMsgs = [...prev];
            newMsgs[newMsgs.length - 1].content = nexusContent;
            return newMsgs;
          });
        }
      }

      // Automatically advance status based on steps (heurística simples para UI)
      setStep(prev => {
        const nextStep = prev + 1;
        if (nextStep === 1) {
          setArchitecture(a => ({ ...a, status: 'Analisando contexto', features: ['Compreensão de Domínio'] }));
        } else if (nextStep === 2) {
          setArchitecture(a => ({ ...a, status: 'Arquitetando capacidades', features: [...a.features, 'Atendimento 24/7', 'Integração Nativa'] }));
        } else if (nextStep >= 3) {
           setIsReady(true);
           setArchitecture(a => ({ ...a, status: 'Arquitetura Concluída', complexity: 'Avançada', investment: isSubscriptionMode ? 'Incluso na assinatura' : '1.250 Créditos + Setup', features: [...a.features, 'Validação de Especialistas'] }));
        }
        return nextStep;
      });

    } catch (error: any) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'nexus', content: `Erro ao contatar o Nexus Cognitive Core: ${error.message}. Se você configurou a API Key na Vercel, lembre-se que para rodar aqui no AI Studio você precisa configurar em 'Settings -> Secrets' neste painel.` }]);
    } finally {
      setIsTyping(false);
    }
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
      
      {/* Mobile Tabs */}
      <div className="lg:hidden flex border-b border-[#1C1C1C] bg-[#0A0A0C] shrink-0">
        <button onClick={() => setActiveTab('chat')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest ${activeTab === 'chat' ? 'text-[#FAFAFA] border-b-2 border-[#FAFAFA]' : 'text-[#FAFAFA]/40 hover:text-[#FAFAFA]/70'}`}>Conversa</button>
        <button onClick={() => setActiveTab('panel')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest ${activeTab === 'panel' ? 'text-[#FAFAFA] border-b-2 border-[#FAFAFA]' : 'text-[#FAFAFA]/40 hover:text-[#FAFAFA]/70'}`}>Painel de Evolução</button>
      </div>
      
      {/* Chat Area (Omni Inspired) */}
      <div className={`flex-1 flex-col min-w-0 min-h-0 lg:border-r border-[#1C1C1C] ${activeTab === 'chat' ? 'flex' : 'hidden lg:flex'} bg-[#080808] relative`}>
         
         <ParticleBackground />

         <div className="h-16 border-b border-[#1C1C1C] flex items-center px-6 shrink-0 bg-[#080808]/80 backdrop-blur-md absolute top-0 w-full z-20">
            <button onClick={() => router.push('/dashboard/studio')} className="flex items-center gap-2 text-[#FAFAFA]/50 hover:text-[#FAFAFA] transition-colors text-xs font-bold uppercase tracking-widest mr-4">
               <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3">
               <Icon className="w-4 h-4 text-[#FAFAFA]" />
               <span className="text-sm font-bold text-[#FAFAFA] tracking-widest uppercase">{moduleName}</span>
            </div>
         </div>
         
         <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6 pt-24 pb-32 relative z-10">
            <div className="max-w-3xl mx-auto space-y-10">
               {messages.length === 1 && (
                  <div className="text-center py-20 animate-in fade-in zoom-in duration-700 relative z-10">
                     <div className="w-20 h-20 rounded-full bg-[#FAFAFA]/5 border border-[#FAFAFA]/10 flex items-center justify-center mx-auto mb-6 backdrop-blur-md shadow-[0_0_30px_rgba(250,250,250,0.05)]">
                        <Icon className="w-8 h-8 text-[#FAFAFA]/80" />
                     </div>
                     <h2 className="text-3xl font-light text-[#FAFAFA] tracking-wide mb-4">É um prazer recebê-lo.</h2>
                     <p className="text-sm text-[#FAFAFA]/50 font-light max-w-lg mx-auto leading-relaxed">
                        Hoje poderemos desenvolver desde experiências completas até operações estruturais. Descreva apenas o resultado que pretende alcançar. O restante é responsabilidade do Nexus™.
                     </p>
                  </div>
               )}
               {messages.map((msg, index) => (
                  <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-4`}>
                     {msg.role === 'nexus' && index !== 0 && (
                        <div className="flex items-center gap-2 mb-2 ml-1">
                           <BrainCircuit className="w-4 h-4 text-[#FAFAFA]/70" />
                           <span className="text-[11px] font-bold text-[#FAFAFA]/70 uppercase tracking-widest">Nexus</span>
                        </div>
                     )}
                     <div className={`p-5 rounded-3xl max-w-[90%] sm:max-w-[85%] ${
                        msg.role === 'user'
                           ? 'bg-[#1C1C1C] text-[#FAFAFA] rounded-br-sm'
                           : 'bg-transparent text-[#FAFAFA]/90 text-lg leading-relaxed font-light'
                     }`}>
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                     </div>
                  </div>
               ))}
               {isTyping && (
                  <div className="flex flex-col items-start animate-in fade-in">
                     <div className="flex items-center gap-2 mb-2 ml-1">
                        <BrainCircuit className="w-4 h-4 text-[#FAFAFA]/70 animate-pulse" />
                        <span className="text-[11px] font-bold text-[#FAFAFA]/70 uppercase tracking-widest">Pensando</span>
                     </div>
                     <div className="p-5 flex gap-2 items-center">
                        <div className="w-2 h-2 rounded-full bg-[#FAFAFA]/40 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-[#FAFAFA]/40 animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-[#FAFAFA]/40 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                     </div>
                  </div>
               )}
               <div ref={chatEndRef} />
            </div>
         </div>
         
         <div className="absolute bottom-0 w-full p-4 sm:p-6 bg-[#080808]/95 backdrop-blur-xl border-t border-[#1C1C1C] shrink-0 z-20">
            <div className="relative max-w-3xl mx-auto">
               <input 
                  type="text" 
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !isTyping && chatInput.trim() && handleUserMessage()}
                  placeholder="Pergunte ou descreva seu objetivo..."
                  className="w-full bg-[#141414] border border-[#2A2A2A] rounded-2xl pl-6 pr-16 py-5 text-[15px] text-[#FAFAFA] outline-none focus:border-[#FAFAFA]/30 transition-all shadow-2xl"
                  disabled={isTyping}
               />
               <button 
                  onClick={() => !isTyping && chatInput.trim() && handleUserMessage()}
                  disabled={!chatInput.trim() || isTyping}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-[#FAFAFA] hover:bg-white text-[#080808] rounded-xl transition-all disabled:opacity-50 disabled:bg-[#2A2A2A] disabled:text-[#FAFAFA]/30"
               >
                  <Send className="w-4 h-4" />
               </button>
            </div>
            <div className="text-center mt-4">
               <span className="text-[10px] text-[#FAFAFA]/30 font-medium tracking-wide">Nexus Cognitive Core™ pode cometer erros. Considere verificar informações importantes.</span>
            </div>
         </div>
      </div>
      
      {/* Painel de Evolução */}
      <div className={`w-full lg:w-96 bg-[#0A0A0C] flex-col shrink-0 lg:border-l border-[#1C1C1C] ${activeTab === 'panel' ? 'flex flex-1 min-h-0' : 'hidden lg:flex'}`}>
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
                  <div className={`w-2 h-2 rounded-full shrink-0 ${isReady ? 'bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.8)]' : 'bg-[#D4AF37] animate-pulse'}`}></div>
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
