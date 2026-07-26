'use client';
import { useState, useEffect } from 'react';
import { MessageSquare, X, Send, BrainCircuit, Sparkles, Phone, ShieldCheck } from 'lucide-react';

export default function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'agent', text: string}[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-nexus-chat', handleOpen);
    return () => window.removeEventListener('open-nexus-chat', handleOpen);
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: 'user', text: input }]);
    setInput('');
    
    // Fake response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'agent', 
        text: 'Excelente. Como Especialista Nexus, minha missão é entender a sua operação e desenhar a arquitetura cognitiva ideal para escalar seus resultados. Não vendemos ferramentas, implantamos infraestrutura. Qual o principal gargalo operacional da sua empresa hoje?' 
      }]);
    }, 1500);
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 p-4 bg-amber-500 text-black rounded-full shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:bg-amber-400 transition-all hover:scale-105 ${isOpen ? 'opacity-0 scale-0 pointer-events-none' : 'opacity-100 scale-100'}`}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-0 sm:bottom-6 right-0 sm:right-6 z-50 w-full sm:w-[380px] h-[100dvh] sm:h-[600px] sm:max-h-[85vh] bg-[#090A0F]/95 backdrop-blur-2xl border-t sm:border border-white/10 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-black/40 flex items-center justify-between shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <BrainCircuit className="w-5 h-5 text-amber-400" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#090A0F] rounded-full"></div>
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Consultor Nexus</h3>
              <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest flex items-center gap-1">
                 <ShieldCheck className="w-3 h-3"/> Especialista Enterprise
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition-colors relative z-10 bg-white/5 p-1.5 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-5 overflow-y-auto custom-scrollbar flex flex-col gap-4">
          {messages.length === 0 && (
            <div className="flex flex-col gap-3">
              <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-4 text-sm text-white/90 shadow-sm">
                Olá. Eu sou o Consultor Nexus responsável por desenhar a implantação do <strong>Hórus OS</strong> na sua empresa.
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-4 text-sm text-white/90 shadow-sm">
                Nós não fornecemos chatbots ou automações simples. Nós implantamos uma <strong>Infraestrutura Cognitiva Completa</strong>, governada pelo Nexus Core, capaz de criar e gerenciar colaboradores digitais especializados (Vendas, RH, Financeiro) em tempo real.
              </div>
              <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-2xl rounded-tl-sm p-4 text-sm text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
                Para sugerir a arquitetura ideal, me fale um pouco sobre a sua operação atual ou os desafios que deseja resolver.
              </div>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3.5 text-sm rounded-2xl ${msg.role === 'user' ? 'bg-amber-500 text-black font-medium rounded-tr-sm' : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-sm'}`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10 bg-black/40 shrink-0">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1.5 focus-within:border-amber-500/50 transition-colors">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Descreva sua operação..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-white px-3 placeholder:text-white/30"
            />
            <button 
              onClick={handleSend}
              className="p-2.5 bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition-colors shadow-[0_0_10px_rgba(245,158,11,0.2)]"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="text-center mt-3">
             <span className="text-[9px] text-white/30 uppercase tracking-widest font-bold">Powered by Nexus Cognitive Core</span>
          </div>
        </div>
      </div>
    </>
  );
}
