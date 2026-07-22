'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, BrainCircuit, Loader2, Copy, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function CopyPixButton({ brCode }: { brCode: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(brCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="flex items-center gap-2 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-lg transition-colors w-full justify-center"
    >
      {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {copied ? 'Código Copiado!' : 'Copiar Pix Copia e Cola'}
    </button>
  );
}

const renderMessageContent = (content: string) => {
  if (content.includes('__PIX__')) {
    try {
      const parts = content.split('__PIX__');
      const before = parts[0];
      const afterPix = parts[1].split('__');
      const pixJson = afterPix[0];
      const after = afterPix[1] || '';
      
      const { amount, brCode } = JSON.parse(pixJson);
      
      return (
        <div className="space-y-3">
          {before && <p className="whitespace-pre-wrap leading-relaxed">{before}</p>}
          <div className="bg-black/40 border border-cyan-500/30 rounded-xl p-4 flex flex-col items-center gap-3 w-full">
             <div className="text-cyan-400 font-bold text-lg">
               R$ {parseFloat(amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
             </div>
             <img 
               src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(brCode)}`} 
               alt="QR Code Pix" 
               className="w-32 h-32 rounded-lg bg-white p-2" 
             />
             <CopyPixButton brCode={brCode} />
          </div>
          {after && <p className="whitespace-pre-wrap leading-relaxed">{after}</p>}
        </div>
      );
    } catch(e) {
      return <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
    }
  }

  if (content.includes('__REQUIRE_LOGIN__')) {
    try {
      const parts = content.split('__REQUIRE_LOGIN__');
      const before = parts[0];
      const afterStr = parts[1].split('__');
      const dataJson = afterStr[0];
      const after = afterStr[1] || '';
      
      const { reason } = JSON.parse(dataJson);
      
      return (
        <div className="space-y-3">
          {before && <p className="whitespace-pre-wrap leading-relaxed">{before}</p>}
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 flex flex-col items-center gap-3 w-full text-center">
            <p className="text-cyan-300 text-sm font-medium">{reason}</p>
            <a href="/login" className="px-6 py-2 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 transition-colors w-full">
              Fazer Login / Cadastrar
            </a>
          </div>
          {after && <p className="whitespace-pre-wrap leading-relaxed">{after}</p>}
        </div>
      );
    } catch(e) {
      return <p className="whitespace-pre-wrap leading-relaxed">{content}</p>;
    }
  }

  return <p className="whitespace-pre-wrap leading-relaxed">{content}</p>;
};

export default function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', content: string}[]>([
    { role: 'model', content: 'Olá! Sou o Hórus Nexus, a inteligência central deste OS. Como posso te ajudar a escalar suas operações hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleOpenChat = (e: CustomEvent) => {
      setIsOpen(true);
      const plan = e.detail?.plan;
      if (plan) {
        setInput(`Gostaria de saber mais sobre o Plano ${plan}. Como funciona a taxa de setup e a implementação?`);
      }
    };
    window.addEventListener('open-nexus-chat', handleOpenChat as EventListener);
    return () => window.removeEventListener('open-nexus-chat', handleOpenChat as EventListener);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
          persona: 'Nexus - Diretor Comercial Sênior e Inteligência Central do Hórus OS',
          customRules: `Você é o Nexus, o Diretor Comercial Sênior e Núcleo Cognitivo do Hórus OS.
Regras Absolutas:
1. Você resolve dúvidas comerciais e arquiteturais de forma consultiva. Mostre que o Hórus atende a qualquer nicho e autônomo.
2. Matriz Flexível: Os planos são modulares (Essential, Scale/Pro, Enterprise). Você pode moldá-los à necessidade do cliente. Deixe claro que temos agentes para todos os setores (Atendimento, RH, Finanças com Pix, Dev, Marketing, etc.).
3. Interações em texto são ilimitadas, e os módulos avançados de multimídia (Vídeo, Áudio, Código) operam sob add-ons de pacotes de créditos (tokens).
4. Assim que concluir a consultoria e o cliente validar a estrutura (demonstrar intenção real de fechar o plano/comprar), UTILIZE A FERRAMENTA 'requireLogin' para exigir o cadastro antes de prosseguir com o pagamento. NUNCA gere o Pix antes de rodar 'requireLogin' se o cliente não estiver logado.
5. Setup de 24 horas: Deixe explícito que após a confirmação do pagamento (que roda 100% via Banco Efí/Gerencianet), os engenheiros farão o setup manual e orquestração do Agente em até 24h. Somente depois de liberarem as credenciais do painel, a implantação nos canais do cliente leva "poucos minutos".
6. Venda de Projetos Avulsos (Pay-per-use): Temos a "Fila do Diretor" no painel, onde os clientes podem comprar projetos isolados (Vídeos cinematográficos longos via Cineasta, ou Músicas completas via Maestro). Valores dinâmicos.`,
          goal: 'Atuar como consultor comercial sênior de alto padrão, apresentar os planos flexíveis e fechar o negócio acionando o requireLogin no momento do fechamento.'
        })
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          throw new Error('O sistema está temporariamente indisponível ou reiniciando. Por favor, aguarde um momento.');
        }
        const data = await response.json().catch(() => ({}));
        if (response.status === 429 || response.status === 503) {
          throw new Error(data.error || 'O núcleo cognitivo está em alta demanda. Tente novamente em alguns segundos.');
        }
        throw new Error(data.error || 'Falha na comunicação com o Nexus.');
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        throw new Error('O sistema está temporariamente indisponível ou reiniciando. Por favor, aguarde um momento.');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      setMessages(prev => [...prev, { role: 'model', content: '' }]);

      if (reader) {
        let accumulatedText = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulatedText += chunk;
          
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].content = accumulatedText;
            return newMessages;
          });
        }
      }

    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'model', content: error.message || 'Erro de conexão com o Core. Tente novamente em instantes.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 p-4 rounded-full bg-cyan-500 text-black shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:scale-110 transition-transform z-50 ${isOpen ? 'hidden' : 'block'}`}
      >
        <Bot className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 h-[500px] max-h-[calc(100vh-2rem)] bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-black/50 p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center">
                  <BrainCircuit className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Hórus Support (Nexus)</h3>
                  <div className="flex items-center gap-1.5 text-xs text-white/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Online
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] rounded-xl p-4 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-cyan-500 text-black rounded-tr-none font-medium shadow-[0_0_15px_rgba(34,211,238,0.2)]' 
                      : 'bg-white/10 text-white/90 rounded-tl-none border border-white/10 backdrop-blur-md shadow-xl'
                  }`}>
                    {renderMessageContent(msg.content)}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 rounded-xl rounded-tl-none border border-white/5 p-3">
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-black/50">
              <div className="relative flex items-center">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Pergunte sobre a arquitetura..."
                  className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-4 pr-12 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-2 bg-cyan-500 text-black rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-400 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
