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
  const [architecture, setArchitecture] = useState<Architecture>({ features: [], status: 'Iniciando análise...', complexity: 'Calculando...', investment: 'Calculando...' });
  const [showPayment, setShowPayment] = useState(false);
  const [showPreviewScreen, setShowPreviewScreen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let initialMsg = '';
    const initialFeatures = ['Integração Memory Graph™'];
    if (moduleName.toLowerCase().includes('música')) initialMsg = 'Bem-vindo ao Studio Música. Vou orquestrar sua produção musical. Você já possui algum direcionamento inicial (como letra, instrumental ou referência) ou começaremos do zero?';
    else if (moduleName.toLowerCase().includes('vídeo')) initialMsg = 'Bem-vindo ao Studio Vídeo. Vou orquestrar sua produção audiovisual. Qual é o objetivo principal deste vídeo (Venda, Institucional, Treinamento, Publicidade, Outro)?';
    else if (moduleName.toLowerCase().includes('membro') || moduleName.toLowerCase().includes('membro cognitivo')) initialMsg = 'Vou arquitetar sua nova equipe digital. Para que eu possa orquestrar as melhores capacidades, qual é o resultado principal que você deseja alcançar com esta operação?';
    else initialMsg = `Iniciando arquitetura para ${moduleName}. Qual é o objetivo operacional que deseja alcançar com este projeto?`;
    setArchitecture({ features: initialFeatures, status: 'Aguardando parâmetros', complexity: 'Calculando...', investment: 'Calculando...' });
    setMessages([{ id: 'init', role: 'nexus', content: initialMsg }]);
  }, [moduleName]);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
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
        body: JSON.stringify({ messages: newMessages, systemInstruction: `Você é o Nexus, o cérebro operacional e arquitetônico do Hórus OS. O usuário deseja arquitetar uma solução: ${moduleName}.\n\nDIRETRIZES ABSOLUTAS:\n1. Você NUNCA fala de prompts, IAs, modelos, tokens ou planos. Você vende RESULTADOS e OPERAÇÕES.\n2. Não haja como um chatbot, mas como uma inteligência viva e sofisticada ("alta relojoaria", "arquitetura minimalista").\n3. Sempre pergunte detalhes importantes e inclua a opção "Outro" em perguntas fechadas.\n\nSUA MISSÃO CONVERSACIONAL:\n1. Compreensão: Descubra qual o objetivo, problema a resolver e como a operação funciona hoje.\n2. Arquitetura: Após entender, sugira a arquitetura ideal (ex: CRM, Equipe Cognitiva de Atendimento, Integrações).\n3. Confirmação: Pergunte se o usuário aprova.\n4. Provisionamento: Ao ser aprovado, diga que a arquitetura foi concluída, os custos computacionais e operacionais foram orquestrados (garantindo prejuízo zero), e que a entrega ocorre em até 24h para setup e calibrações. Peça para ele clicar em "Executar Produção".\n\nSeja altamente sofisticado, educado e direto. Sem frases genéricas (ex: 'Como posso ajudar?'). Mantenha o texto limpo, em parágrafos curtos.` })
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
                if (data.choices?.[0]?.delta?.content) nexusContent += data.choices[0].delta.content;
              } catch (e) {
                void e;
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
      setStep(prev => {
        const nextStep = prev + 1;
        if (nextStep === 1) setArchitecture(a => ({ ...a, status: 'Analisando contexto', features: ['Compreensão de Domínio'] }));
        else if (nextStep === 2) setArchitecture(a => ({ ...a, status: 'Arquitetando capacidades', features: [...a.features, 'Atendimento 24/7', 'Integração Nativa'] }));
        else if (nextStep >= 3) {
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

  if (showPreviewScreen && renderPreview) return (
    <div className="fixed inset-0 z-50 bg-[#080808] flex flex-col">
      <div className="h-16 border-b border-[#1C1C1C] flex items-center justify-between px-6 shrink-0 bg-[#0A0A0C]">
        <div className="flex items-center gap-3"><Icon className="w-5 h-5 text-[#D4AF37]" /><span className="text-sm font-bold text-[#FAFAFA] tracking-widest uppercase">Preview: {moduleName}</span></div>
        <button onClick={() => setShowPreviewScreen(false)} className="px-4 py-2 bg-[#1C1C1C] hover:bg-[#2A2A2A] rounded-lg text-xs font-bold text-[#FAFAFA] transition-colors uppercase tracking-widest flex items-center gap-2"><X className="w-4 h-4" /> Fechar</button>
      </div>
      <div className="flex-1 overflow-hidden relative">{renderPreview()}</div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-[#080808] font-sans overflow-hidden">
      <div className="lg:hidden flex border-b border-[#1C1C1C] bg-[#0A0A0C] shrink-0">
        <button onClick={() => setActiveTab('chat')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest ${activeTab === 'chat' ? 'text-[#FAFAFA] border-b-2 border-[#FAFAFA]' : 'text-[#FAFAFA]/40 hover:text-[#FAFAFA]/70'}`}>Conversa</button>
        <button onClick={() => setActiveTab('panel')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest ${activeTab === 'panel' ? 'text-[#FAFAFA] border-b-2 border-[#FAFAFA]' : 'text-[#FAFAFA]/40 hover:text-[#FAFAFA]/70'}`}>Painel de Evolução</button>
      </div>
      <div className={`flex-1 flex-col min-w-0 min-h-0 lg:border-r border-[#1C1C1C] ${activeTab === 'chat' ? 'flex' : 'hidden lg:flex'} bg-[#080808] relative`}>
        <ParticleBackground />
        <div className="h-16 border-b border-[#1C1C1C] flex items-center px-6 shrink-0 bg-[#080808]/80 backdrop-blur-md absolute top-0 w-full z-20">
          <button onClick={() => router.push('/dashboard/studio')} className="flex items-center gap-2 text-[#FAFAFA]/50 hover:text-[#FAFAFA] transition-colors text-xs font-bold uppercase tracking-widest mr-4"><ArrowLeft className="w-4 h-4" /></button>
          <div className="flex items-center gap-3"><Icon className="w-4 h-4 text-[#FAFAFA]" /><span className="text-sm font-bold text-[#FAFAFA] tracking-widest uppercase">{moduleName}</span></div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6 pt-24 pb-32 relative z-10">
          <div className="max-w-3xl mx-auto space-y-10">
            {messages.length === 1 && (
              <div className="text-center py-20 animate-in fade-in zoom-in duration-700 relative z-10">
                <div className="w-20 h-20 rounded-full bg-[#FAFAFA]/5 border border-[#FAFAFA]/10 flex items-center justify-center mx-auto mb-6 backdrop-blur-md shadow-[0_0_30px_rgba(250,250,250,0.05)]"><Icon className="w-8 h-8 text-[#FAFAFA]/80" /></div>
                <h2 className="text-2xl font-bold text-[#FAFAFA]">{moduleName}</h2>
              </div>
            )}
            {messages.map(message => <div key={message.id} className="text-sm text-[#FAFAFA]/80">{message.content}</div>)}
            <div ref={chatEndRef} />
          </div>
        </div>
        <form onSubmit={e => { e.preventDefault(); void handleUserMessage(); }} className="absolute bottom-0 left-0 right-0 p-4 z-20"><div className="max-w-3xl mx-auto flex gap-2"><input value={chatInput} onChange={e => setChatInput(e.target.value)} className="flex-1 bg-[#111] border border-[#222] rounded-lg px-4 py-3 text-sm text-white" placeholder="Digite sua mensagem..." /><button type="submit" disabled={isTyping} className="px-4 rounded-lg bg-[#FAFAFA] text-black"><Send className="w-4 h-4" /></button></div></form>
      </div>
      <aside className={`${activeTab === 'panel' ? 'flex' : 'hidden lg:flex'} w-full lg:w-96 flex-col bg-[#0A0A0C] border-l border-[#1C1C1C] p-6`}>
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/60 mb-6">Painel de Evolução</h3>
        <div className="space-y-4 text-sm text-white/70"><div>Status: {architecture.status}</div><div>Complexidade: {architecture.complexity}</div><div>Investimento: {architecture.investment}</div><div>Recursos: {architecture.features.join(', ')}</div><div>Pronto: {isReady ? 'Sim' : 'Não'}</div></div>
      </aside>
    </div>
  );
}
