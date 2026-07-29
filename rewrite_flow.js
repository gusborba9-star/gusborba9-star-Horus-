const fs = require('fs');

const code = `'use client';
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Target, Sparkles, BrainCircuit, Check, Play, Eye, Send, Loader2, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface QuestionOption {
  label: string;
  value: string;
}

export interface Question {
  id: string;
  title: string;
  description?: string;
  options: QuestionOption[];
  allowOther?: boolean;
}

export interface NexusDiscoveryFlowProps {
  moduleName: string;
  moduleIcon: any;
  questions?: Question[];
  onFinish?: (answers: Record<string, string>) => void;
  renderPreview?: () => React.ReactNode;
  isSubscriptionMode?: boolean;
}

type FlowPhase = 'intent' | 'chat' | 'architecting' | 'ready';

type ChatMessage = {
  id: string;
  role: 'user' | 'nexus';
  content: string;
};

export default function NexusDiscoveryFlow({ moduleName, moduleIcon: Icon, onFinish, renderPreview, isSubscriptionMode }: NexusDiscoveryFlowProps) {
  const router = useRouter();
  
  const [phase, setPhase] = useState<FlowPhase>('intent');
  const [intention, setIntention] = useState('');
  const [chatInput, setChatInput] = useState('');
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const [showPreview, setShowPreview] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, phase]);

  const simulateNexusResponse = (userInput: string) => {
    const lowerInput = userInput.toLowerCase();
    
    let analysis = "";
    if (lowerInput.includes('pix') || lowerInput.includes('pagamento') || lowerInput.includes('cobrar') || lowerInput.includes('financeiro') || lowerInput.includes('vender')) {
       analysis += "Identifiquei a necessidade de inteligência financeira. Arquitetarei a integração direta com gateways de pagamento para processamento autônomo. ";
    }
    if (lowerInput.includes('agenda') || lowerInput.includes('consulta') || lowerInput.includes('marcar') || lowerInput.includes('reunião')) {
       analysis += "Sua operação também requer gestão temporal. Adicionarei conectores bidirecionais de calendário com regras de disponibilidade. ";
    }
    if (lowerInput.includes('cliente') || lowerInput.includes('atenda') || lowerInput.includes('whatsapp') || lowerInput.includes('suporte')) {
       analysis += "A interface de atendimento será orquestrada para interações humanizadas e fluidas via canais de mensageria. ";
    }
    if (lowerInput.includes('relatório') || lowerInput.includes('dados') || lowerInput.includes('análise')) {
       analysis += "Estruturarei dashboards dinâmicos no Memory Graph™ para análise contínua de dados em tempo real. ";
    }
    if (lowerInput.includes('música') || lowerInput.includes('vídeo') || lowerInput.includes('imagem') || lowerInput.includes('design')) {
       analysis += "A alocação de capacidades generativas multimodais será ativada para garantir alta fidelidade criativa. ";
    }
    
    if (!analysis) {
       analysis = \`Compreendi perfeitamente o contexto para o módulo \${moduleName}. O Nexus adaptará a infraestrutura cognitiva para resolver este gargalo operacional. \`;
    }

    return \`\${analysis}Como o cérebro cognitivo da sua operação, estruturarei essa arquitetura para que ela escale organicamente. Podemos confirmar e gerar o escopo computacional definitivo?\`;
  };

  const processIntent = () => {
    if (!intention.trim()) return;
    
    setPhase('chat');
    setMessages([
      { id: Date.now().toString(), role: 'user', content: intention }
    ]);
    
    const userIntent = intention;
    
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(),
        role: 'nexus', 
        content: simulateNexusResponse(userIntent)
      }]);
      setIsTyping(false);
    }, 1500);
  };

  const handleChatInput = () => {
    if (!chatInput.trim()) return;
    
    const userMsg = chatInput;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMsg }]);
    setChatInput('');
    
    setIsTyping(true);
    
    const lowerMsg = userMsg.toLowerCase();
    
    if (lowerMsg.includes('sim') || lowerMsg.includes('pode') || lowerMsg.includes('ok') || lowerMsg.includes('confirm') || lowerMsg.includes('gerar') || lowerMsg.includes('bora') || lowerMsg.includes('manda') || lowerMsg.includes('iniciar')) {
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            id: (Date.now() + 1).toString(),
            role: 'nexus', 
            content: \`Arquitetura operacional validada. Iniciando provisionamento das capacidades cognitivas no Nexus Engine™...\`
          }]);
          setIsTyping(false);
          
          setTimeout(() => {
            setPhase('architecting');
            setTimeout(() => {
                setPhase('ready');
                if (onFinish) onFinish({ context: intention });
            }, 3000);
          }, 1500);
        }, 1000);
    } else {
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            id: (Date.now() + 1).toString(),
            role: 'nexus', 
            content: \`Entendido. Atualizei o escopo operacional com estas novas variáveis. Podemos prosseguir com a implementação desta arquitetura?\`
          }]);
          setIsTyping(false);
        }, 1500);
    }
  };

  const calculateCredits = () => {
    return isSubscriptionMode ? 0 : 750; 
  };

  if (showPreview && renderPreview) {
    return (
      <div className="h-full flex flex-col bg-[#080808]">
        <div className="h-16 border-b border-[#1C1C1C] flex items-center justify-between px-6 shrink-0 z-20 bg-[#0A0A0C]">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-sm font-bold text-[#FAFAFA] tracking-widest uppercase">Preview Ambiente Isolado</span>
          </div>
          <button onClick={() => setShowPreview(false)} className="text-xs font-bold text-[#FAFAFA]/50 hover:text-[#FAFAFA] transition-colors uppercase tracking-widest">
             Fechar Preview
          </button>
        </div>
        <div className="flex-1 overflow-hidden relative">
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none z-0"></div>
           {renderPreview()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col bg-[#080808] relative font-sans text-[#FAFAFA]">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none z-0"></div>
      
      {/* Header */}
      <div className="h-16 border-b border-[#1C1C1C] flex items-center px-6 shrink-0 z-20 sticky top-0 bg-[#0A0A0C]">
         <button onClick={() => router.push('/dashboard/studio')} className="flex items-center gap-2 text-[#FAFAFA]/50 hover:text-[#FAFAFA] transition-colors text-xs font-bold uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Voltar
         </button>
         <div className="mx-auto flex items-center gap-3">
            <Icon className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-sm font-bold text-[#FAFAFA] tracking-widest uppercase">{moduleName}</span>
         </div>
         <div className="w-32"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 p-4 md:p-8">
         <div className="max-w-4xl mx-auto h-full flex flex-col">
            
            {phase === 'intent' && (
              <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto w-full py-20">
                 <div className="text-center mb-10">
                    <div className="w-20 h-20 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/30 mx-auto mb-6 shadow-[0_0_30px_rgba(212,175,55,0.15)] relative overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/20 to-transparent opacity-50 mix-blend-overlay"></div>
                       <BrainCircuit className="w-10 h-10 text-[#D4AF37] relative z-10" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-light text-[#FAFAFA] mb-4 tracking-wide">Qual operação inteligente deseja orquestrar?</h2>
                    <p className="text-sm text-[#FAFAFA]/60 font-light leading-relaxed max-w-lg mx-auto">
                       Descreva o resultado que deseja alcançar, o problema a ser resolvido ou o objetivo operacional. O Nexus arquitetará a infraestrutura cognitiva ideal para você.
                    </p>
                 </div>
                 
                 <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                    <textarea 
                       value={intention}
                       onChange={(e) => setIntention(e.target.value)}
                       placeholder="Ex: Quero um colaborador digital que atenda meus clientes, gere cobranças via Pix e agende consultas..."
                       className="relative w-full h-48 bg-[#0C0C0C]/80 backdrop-blur-xl border border-[#1C1C1C] rounded-3xl p-6 text-[15px] text-[#FAFAFA] outline-none focus:border-[#D4AF37]/40 transition-all resize-none custom-scrollbar shadow-2xl leading-relaxed placeholder:text-[#FAFAFA]/20"
                    />
                    <button 
                       onClick={processIntent}
                       disabled={!intention.trim()}
                       className="absolute bottom-6 right-6 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#C9A55C] text-black font-bold text-xs uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none transition-all flex items-center gap-2"
                    >
                       Orquestrar Operação <Send className="w-4 h-4" />
                    </button>
                 </div>
                 
                 <div className="mt-8 text-center flex items-center justify-center gap-2 text-[#FAFAFA]/30">
                    <BrainCircuit className="w-4 h-4" />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Powered by Nexus Cognitive Core™</span>
                 </div>
              </div>
            )}

            {phase === 'chat' && (
              <div className="flex flex-col h-[calc(100vh-8rem)]">
                 <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                    {messages.map((msg) => (
                       <div key={msg.id} className={\`flex \${msg.role === 'user' ? 'justify-end' : 'justify-start'}\`}>
                          <div className={\`max-w-[80%] md:max-w-[70%] p-5 rounded-3xl \${
                             msg.role === 'user' 
                               ? 'bg-[#1C1C1C] border border-[#2A2A2A] rounded-tr-sm text-[#FAFAFA]' 
                               : 'bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-tl-sm text-[#FAFAFA]/90'
                          }\`}>
                             {msg.role === 'nexus' && (
                                <div className="flex items-center gap-2 mb-3">
                                   <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 flex items-center justify-center border border-[#D4AF37]/30">
                                      <BrainCircuit className="w-3 h-3 text-[#D4AF37]" />
                                   </div>
                                   <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">Nexus Engine™</span>
                                </div>
                             )}
                             <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          </div>
                       </div>
                    ))}
                    
                    {isTyping && (
                       <div className="flex justify-start">
                          <div className="max-w-[80%] md:max-w-[70%] p-5 rounded-3xl bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-tl-sm text-[#FAFAFA]/90">
                             <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 flex items-center justify-center border border-[#D4AF37]/30">
                                   <BrainCircuit className="w-3 h-3 text-[#D4AF37]" />
                                </div>
                                <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">Nexus Engine™</span>
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
                 
                 <div className="pt-4 mt-auto">
                    <div className="relative">
                       <input 
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleChatInput()}
                          placeholder="Fale com o Nexus..."
                          className="w-full bg-[#101010] border border-[#1C1C1C] rounded-2xl pl-6 pr-14 py-4 text-sm text-[#FAFAFA] outline-none focus:border-[#D4AF37]/40 transition-colors shadow-lg"
                       />
                       <button 
                          onClick={handleChatInput}
                          disabled={!chatInput.trim() || isTyping}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#1C1C1C] hover:bg-[#D4AF37]/20 border border-[#2A2A2A] hover:border-[#D4AF37]/40 text-[#FAFAFA] hover:text-[#D4AF37] rounded-xl flex items-center justify-center transition-all disabled:opacity-50"
                       >
                          <Send className="w-4 h-4" />
                       </button>
                    </div>
                 </div>
              </div>
            )}

            {phase === 'architecting' && (
               <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in duration-500">
                  <div className="w-32 h-32 relative mb-10">
                     <div className="absolute inset-0 border-[2px] border-[#D4AF37]/10 rounded-full animate-[spin_4s_linear_infinite]"></div>
                     <div className="absolute inset-2 border-[2px] border-[#D4AF37]/30 rounded-full border-dashed animate-[spin_3s_linear_infinite_reverse]"></div>
                     <div className="absolute inset-6 border-[1px] border-[#D4AF37]/50 rounded-full animate-[spin_2s_linear_infinite]"></div>
                     <div className="absolute inset-0 flex items-center justify-center">
                        <BrainCircuit className="w-10 h-10 text-[#D4AF37] animate-pulse drop-shadow-[0_0_15px_rgba(212,175,55,0.8)]" />
                     </div>
                  </div>
                  <h3 className="text-3xl font-light text-[#FAFAFA] mb-3 tracking-wide">Arquitetando Solução...</h3>
                  <p className="text-[11px] text-[#D4AF37] font-bold uppercase tracking-[0.3em] animate-pulse">
                     Nexus Cognitive Engine™ operando
                  </p>
               </div>
            )}

            {phase === 'ready' && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 py-10">
                  <div className="text-center mb-12">
                     <div className="w-20 h-20 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/30 mx-auto mb-6 shadow-[0_0_30px_rgba(212,175,55,0.15)] relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/20 to-transparent opacity-50 mix-blend-overlay"></div>
                        <Check className="w-10 h-10 text-[#D4AF37] relative z-10" />
                     </div>
                     <h2 className="text-3xl md:text-4xl font-light text-[#FAFAFA] mb-4 tracking-wide">Arquitetura Concluída</h2>
                     <p className="text-sm text-[#FAFAFA]/50 font-light max-w-lg mx-auto leading-relaxed">
                        O Nexus processou seus objetivos e definiu a infraestrutura ideal. Revise os detalhes técnicos e operacionais antes da implantação final.
                     </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                     <div className="space-y-4">
                        <div className="p-8 bg-[#101010] border border-[#1C1C1C] rounded-3xl">
                           <h4 className="text-[10px] font-bold text-[#FAFAFA]/40 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                              <Target className="w-4 h-4 text-[#FAFAFA]/30" />
                              Escopo Operacional
                           </h4>
                           <div className="space-y-6">
                              <div>
                                 <span className="text-[11px] text-[#D4AF37] font-bold uppercase tracking-widest block mb-2">Contexto Inicial</span>
                                 <p className="text-sm text-[#FAFAFA]/80 font-light italic leading-relaxed border-l-2 border-[#1C1C1C] pl-4 py-1">"{intention}"</p>
                              </div>
                              
                              <div>
                                 <span className="text-[11px] text-[#D4AF37] font-bold uppercase tracking-widest block mb-2">Capacidades Orquestradas</span>
                                 <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                       <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-1.5 shrink-0 shadow-[0_0_8px_rgba(212,175,55,0.8)]"></div>
                                       <span className="text-sm text-[#FAFAFA]/70">Integração Contínua com Memory Graph™</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                       <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-1.5 shrink-0 shadow-[0_0_8px_rgba(212,175,55,0.8)]"></div>
                                       <span className="text-sm text-[#FAFAFA]/70">Motor Cognitivo Especializado para {moduleName}</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                       <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-1.5 shrink-0 shadow-[0_0_8px_rgba(212,175,55,0.8)]"></div>
                                       <span className="text-sm text-[#FAFAFA]/70">Conectores Universais Hórus Operations™</span>
                                    </li>
                                 </ul>
                              </div>
                           </div>
                        </div>
                     </div>
                     
                     <div className="space-y-4">
                        <div className="p-8 bg-[#141414] border border-[#D4AF37]/30 rounded-3xl relative overflow-hidden group hover:border-[#D4AF37]/50 transition-colors">
                           <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/10 blur-[60px] group-hover:bg-[#D4AF37]/20 transition-colors"></div>
                           
                           <div className="flex justify-between items-start mb-8 relative z-10">
                              <h4 className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em] flex items-center gap-2">
                                 <BrainCircuit className="w-4 h-4" />
                                 Inteligência Financeira
                              </h4>
                              <div className="px-3 py-1 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full">
                                 <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-widest">Otimizado</span>
                              </div>
                           </div>
                           
                           <div className="space-y-6 relative z-10">
                              <div className="flex justify-between items-end border-b border-[#1C1C1C] pb-4">
                                 <div>
                                    <span className="text-[11px] text-[#FAFAFA]/40 block mb-1 uppercase tracking-widest font-bold">Complexidade Inferida</span>
                                    <span className="text-sm font-light text-[#FAFAFA]">Alta (Motor Especializado)</span>
                                 </div>
                              </div>
                              <div className="flex justify-between items-end border-b border-[#1C1C1C] pb-4">
                                 <div>
                                    <span className="text-[11px] text-[#FAFAFA]/40 block mb-1 uppercase tracking-widest font-bold">Recursos Computacionais</span>
                                    <span className="text-sm font-light text-[#FAFAFA]">Nexus Compute + Generative Ops</span>
                                 </div>
                              </div>
                              <div className="flex justify-between items-end pt-4">
                                 <div>
                                    <span className="text-[11px] text-[#FAFAFA]/40 block mb-2 uppercase tracking-widest font-bold">Investimento Estimado</span>
                                    <span className="text-3xl font-light text-[#D4AF37] tracking-tight">
                                       {isSubscriptionMode ? 'Incluso' : calculateCredits()} 
                                       {!isSubscriptionMode && <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]/50 ml-2">Créditos Hórus™</span>}
                                    </span>
                                 </div>
                              </div>
                              
                              <div className="pt-2 flex items-center gap-2 text-[#FAFAFA]/30">
                                 <Sparkles className="w-3 h-3" />
                                 <span className="text-[9px] uppercase tracking-[0.2em] font-bold">Orçamento calculado pelo Nexus Cognitive Core™</span>
                              </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <button 
                              onClick={() => setShowPreview(true)}
                             className="p-5 bg-[#101010] border border-[#1C1C1C] text-[#FAFAFA] font-bold text-[11px] uppercase tracking-widest rounded-2xl hover:bg-[#141414] hover:border-[#D4AF37]/30 transition-all flex flex-col items-center justify-center gap-3 group"
                           >
                              <div className="w-10 h-10 rounded-full bg-[#1C1C1C] group-hover:bg-[#D4AF37]/10 flex items-center justify-center transition-colors">
                                 <Eye className="w-5 h-5 text-[#FAFAFA]/70 group-hover:text-[#D4AF37] transition-colors" />
                              </div>
                              Visualizar Operação
                           </button>
                           
                           <button 
                              onClick={() => setShowPayment(true)} 
                              className="p-5 bg-gradient-to-tr from-[#D4AF37] to-[#C9A55C] text-black font-bold text-[11px] uppercase tracking-widest rounded-2xl hover:shadow-[0_0_25px_rgba(212,175,55,0.3)] transition-all flex flex-col items-center justify-center gap-3 relative overflow-hidden group"
                           >
                              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center">
                                 <Play className="w-5 h-5 text-black ml-1" />
                              </div>
                              Executar Produção
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {/* Payment Modal */}
            {showPayment && (
              <div className="fixed inset-0 bg-[#080808]/90 z-50 flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in duration-300">
                 <div className="bg-[#101010] border border-[#1C1C1C] rounded-3xl p-10 max-w-md w-full relative shadow-2xl">
                    <button onClick={() => setShowPayment(false)} className="absolute top-6 right-6 text-[#FAFAFA]/30 hover:text-[#FAFAFA] text-[10px] font-bold uppercase tracking-widest transition-colors">Fechar</button>
                    
                    <div className="text-center mb-10">
                       <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-6">
                          <Target className="w-8 h-8 text-[#D4AF37]" />
                       </div>
                       <h2 className="text-2xl font-light text-[#FAFAFA] tracking-wide mb-3">Liberação de Recursos</h2>
                       <p className="text-xs text-[#FAFAFA]/50 font-light leading-relaxed">
                          {isSubscriptionMode 
                            ? 'Sua operação utilizará a capacidade da sua assinatura corporativa. Confirme para iniciar o provisionamento.' 
                            : 'Este é um projeto pontual e utilizará Hórus Credits™. Escaneie o QR Code via Pix para adicionar créditos e iniciar a produção imediatamente.'}
                       </p>
                    </div>

                    {!isSubscriptionMode && (
                       <div className="bg-[#FAFAFA] p-4 rounded-2xl mx-auto w-56 h-56 flex items-center justify-center mb-8 shadow-inner relative overflow-hidden group hover:scale-105 transition-transform cursor-pointer">
                          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <span className="text-black font-bold text-xs uppercase tracking-widest bg-white/90 px-4 py-2 rounded-full shadow-lg">Copiar Código</span>
                          </div>
                          <div className="w-full h-full border-[3px] border-dashed border-[#1C1C1C]/10 rounded-xl flex items-center justify-center">
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
                          <span className="text-xl font-light text-[#D4AF37]">
                             {isSubscriptionMode ? 'Incluso' : calculateCredits()} 
                             {!isSubscriptionMode && <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]/50 ml-1">Créditos</span>}
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
      </div>
    </div>
  );
}
`;

fs.writeFileSync('app/dashboard/studio/components/NexusDiscoveryFlow.tsx', code);
