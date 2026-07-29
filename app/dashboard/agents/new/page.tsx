'use client';
import { useState } from 'react';
import { 
  BrainCircuit, ArrowRight, ArrowLeft, Users, Zap, Database, 
  ShieldAlert, Cog, CheckCircle2, Loader2, Play, MessageSquare, 
  FileText, Briefcase, Globe, Cpu, CreditCard, Lock, Building, Tag,
  Headphones, ListChecks, Smartphone, Clock
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewAgentCinematic() {
  const [step, setStep] = useState(1);
  const [isInjecting, setIsInjecting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const router = useRouter();

  // Simulation chat state
  const [simMessages, setSimMessages] = useState([
    { role: 'agent', text: 'Olá! Estou pronto para iniciar os testes. Mande uma solicitação.' }
  ]);
  const [simInput, setSimInput] = useState('');

  const handleNext = () => setStep(s => Math.min(7, s + 1));
  const handlePrev = () => setStep(s => Math.max(1, s - 1));
  
  const handleCreate = () => {
    setIsInjecting(true);
    setTimeout(() => {
      setIsInjecting(false);
      setIsDone(true);
      setTimeout(() => {
        router.push('/dashboard/studio');
      }, 3000);
    }, 4000);
  };

  const handleSimSend = () => {
    if (!simInput.trim()) return;
    setSimMessages(prev => [...prev, { role: 'user', text: simInput }]);
    setSimInput('');
    setTimeout(() => {
       setSimMessages(prev => [...prev, { role: 'agent', text: 'Simulação: Nexus interceptou o contexto e estruturou uma resposta baseada nas suas diretrizes e documentos. Confiança: 98%.' }]);
    }, 1000);
  };

  if (isInjecting || isDone) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#050508] relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-[150px] pointer-events-none animate-pulse"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center p-4">
           {isInjecting ? (
             <>
               <div className="w-24 h-24 rounded-full bg-black border border-amber-500/50 flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.5)] mb-8 relative">
                 <Loader2 className="w-10 h-10 text-amber-400 animate-spin absolute" />
                 <BrainCircuit className="w-8 h-8 text-amber-500/50" />
               </div>
               <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">Processando no Nexus Core</h2>
               <p className="text-amber-400/80 font-mono text-xs md:text-sm tracking-widest uppercase">Injetando DNA Cognitivo e preparando ambiente...</p>
               
               <div className="w-48 md:w-64 h-1.5 bg-white/10 mt-8 rounded-full overflow-hidden">
                 <div className="h-full bg-amber-500 animate-[fillUp_4s_ease-in-out_forwards]" style={{ width: '0%' }}></div>
               </div>
             </>
           ) : (
             <div className="animate-in zoom-in duration-500 flex flex-col items-center">
               <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.5)] mb-8">
                 <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-emerald-400" />
               </div>
               <h2 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tight text-white mb-4">OPERAÇÃO IMPLANTADA.</h2>
               <p className="text-emerald-400 font-mono text-xs md:text-sm tracking-widest uppercase">Projeto enviado para Fila do Diretor.</p>
             </div>
           )}
        </div>
      </div>
    );
  }

  const steps = [
    { id: 1, title: 'Identidade', icon: Users, desc: 'Perfil do Membro' },
    { id: 2, title: 'Conhecimentos', icon: Database, desc: 'O que ele sabe' },
    { id: 3, title: 'Capacidades', icon: Zap, desc: 'O que ele faz' },
    { id: 4, title: 'Ferramentas', icon: Cog, desc: 'Onde ele atua' },
    { id: 5, title: 'Regras', icon: ShieldAlert, desc: 'Fronteiras e LGPD' },
    { id: 6, title: 'Simulação', icon: Play, desc: 'Teste Cognitivo' },
    { id: 7, title: 'Resumo & Checkout', icon: CheckCircle2, desc: 'Orçamento Hórus' },
  ];

  return (
    <div className="h-full flex flex-col bg-[#050508] relative font-sans">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] mix-blend-overlay pointer-events-none"></div>
      
      {/* Dynamic Background Glow based on step */}
      <div className={`absolute top-0 right-0 w-[50vw] h-[50vw] rounded-full blur-[150px] pointer-events-none transition-colors duration-1000 ${step === 7 ? 'bg-emerald-900/10' : step % 2 === 0 ? 'bg-amber-900/10' : 'bg-blue-900/10'}`}></div>

      {/* Header Progress */}
      <div className="h-16 md:h-20 border-b border-white/5 bg-[#090A0F]/80 backdrop-blur-xl shrink-0 flex items-center justify-between px-4 sm:px-10 relative z-20">
         <button onClick={() => router.push('/dashboard/studio')} className="text-white/50 hover:text-white transition-colors flex items-center gap-1 md:gap-2 text-xs md:text-sm font-bold uppercase tracking-widest">
           <XIcon className="w-4 h-4" /> <span className="hidden sm:inline">Cancelar Criação</span>
         </button>
         
         <div className="flex items-center gap-1 sm:gap-2">
           {steps.map(s => (
             <div key={s.id} className={`w-6 sm:w-12 md:w-16 h-1.5 rounded-full transition-all duration-500 ${step >= s.id ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-white/10'}`}></div>
           ))}
         </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center justify-start p-4 sm:p-6 lg:p-10 relative z-10">
         <div className="w-full max-w-4xl animate-in slide-in-from-bottom-8 duration-700 fade-in py-8 sm:py-0">
            
            <div className="mb-8 md:mb-12 text-center">
               <div className="w-12 h-12 md:w-16 md:h-16 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 md:mb-6 shadow-xl backdrop-blur-md">
                 {(() => {
                   const Icon = steps[step-1].icon;
                   return <Icon className="w-6 h-6 md:w-8 md:h-8 text-amber-500" />;
                 })()}
               </div>
               <h2 className="text-[10px] md:text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">Etapa 0{step} de 07</h2>
               <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-tight">{steps[step-1].title}</h1>
               <p className="text-white/50 mt-2 md:mt-4 text-sm md:text-lg font-light px-4">{steps[step-1].desc}</p>
            </div>

            <div className="bg-[#090A0F]/80 sm:bg-black/40 border border-white/10 rounded-3xl p-5 sm:p-8 md:p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
               
               {/* Decorative subtle border top */}
               <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>

               {step === 1 && (
                 <div className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                       <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-3">Nome do Membro</label>
                       <input type="text" placeholder="Ex: Hórus Financeiro" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 md:py-4 text-white outline-none focus:border-amber-500/50 transition-colors text-base md:text-lg" />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-3">Cargo Principal</label>
                       <input type="text" placeholder="Ex: Assistente de Relacionamento" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 md:py-4 text-white outline-none focus:border-amber-500/50 transition-colors text-base md:text-lg" />
                     </div>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div>
                       <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-3">Departamento</label>
                       <input type="text" placeholder="Ex: RH, Jurídico..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500/50 transition-colors text-sm" />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-3">Nicho de Mercado</label>
                       <input type="text" placeholder="Ex: Advocacia, Varejo..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500/50 transition-colors text-sm" />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-3">Idioma Principal</label>
                       <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500/50 transition-colors text-sm appearance-none">
                         <option value="pt-br" className="bg-[#090A0F]">Português (BR)</option>
                         <option value="en" className="bg-[#090A0F]">Inglês (US)</option>
                         <option value="es" className="bg-[#090A0F]">Espanhol</option>
                       </select>
                     </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                       <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-3">Tom de Voz</label>
                       <input type="text" placeholder="Ex: Analítico e Direto" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500/50 transition-colors text-sm" />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-3">Personalidade</label>
                       <input type="text" placeholder="Ex: Empático, prestativo..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500/50 transition-colors text-sm" />
                     </div>
                   </div>

                   <div>
                     <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-3">Objetivo Geral da Operação</label>
                     <textarea placeholder="Ex: Qualificar leads rapidamente e agendar reuniões com o time comercial." className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-amber-500/50 transition-colors resize-none text-sm md:text-base custom-scrollbar"></textarea>
                   </div>
                 </div>
               )}

               {step === 2 && (
                 <div className="space-y-6">
                    <p className="text-white/60 text-sm mb-6">Alimente o <strong>Memory Graph</strong>. Conecte dados para que o membro da equipe cognitiva atue com precisão corporativa.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="border border-white/10 rounded-2xl p-6 bg-white/5 hover:border-amber-500/50 hover:bg-amber-500/5 transition-colors cursor-pointer text-center group">
                          <FileText className="w-8 h-8 text-white/30 mb-3 mx-auto group-hover:text-amber-400 transition-colors" />
                          <h3 className="font-bold text-sm text-white mb-1">Upload de Arquivos</h3>
                          <p className="text-xs text-white/50">PDFs, Manuais, Planilhas</p>
                       </div>
                       <div className="border border-white/10 rounded-2xl p-6 bg-white/5 hover:border-amber-500/50 hover:bg-amber-500/5 transition-colors cursor-pointer text-center group">
                          <Globe className="w-8 h-8 text-white/30 mb-3 mx-auto group-hover:text-amber-400 transition-colors" />
                          <h3 className="font-bold text-sm text-white mb-1">Vincular Site / Links</h3>
                          <p className="text-xs text-white/50">Scraping de domínio ou FAQ</p>
                       </div>
                    </div>
                    
                    <div className="border-t border-white/10 pt-6 mt-6">
                       <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Conhecimento Estruturado</h4>
                       <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Produtos e Serviços (Resumo)</label>
                            <textarea placeholder="Liste o que sua empresa oferece. Ex: Mentoria Premium R$999..." className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-amber-500/50 transition-colors resize-none text-sm custom-scrollbar"></textarea>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Políticas de Atendimento</label>
                            <textarea placeholder="Ex: Devolução em 7 dias, prazo de entrega 5 úteis." className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-amber-500/50 transition-colors resize-none text-sm custom-scrollbar"></textarea>
                          </div>
                       </div>
                    </div>
                 </div>
               )}

               {step === 3 && (
                 <div className="space-y-6">
                    <p className="text-white/60 text-sm mb-6">Selecione os superpoderes. O que este membro está autorizado a fazer de forma autônoma?</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                       {[
                         'Atender e Conversar', 'Vender / Fechar', 'Negociar Valores', 
                         'Cobrar Inadimplentes', 'Agendar Reuniões', 'Pesquisar Dados', 
                         'Consultar Sistemas', 'Gerar Documentos', 'Enviar Propostas', 
                         'Executar Automações', 'Criar Conteúdos', 'Analisar Métricas'
                       ].map((cap, i) => (
                         <label key={i} className="flex items-center gap-3 p-3 md:p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors has-[:checked]:border-amber-500/50 has-[:checked]:bg-amber-500/5">
                           <input type="checkbox" className="w-4 h-4 accent-amber-500 shrink-0" />
                           <span className="font-medium text-xs md:text-sm text-white">{cap}</span>
                         </label>
                       ))}
                    </div>
                 </div>
               )}

               {step === 4 && (
                 <div className="space-y-6">
                    <p className="text-white/60 text-sm mb-6">Selecione onde o membro cognitivo irá operar e de onde ele extrairá dados em tempo real.</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                       {['WhatsApp', 'Email (Gmail)', 'Google Calendar', 'Zendesk', 'Stripe', 'HubSpot CRM', 'Bling ERP', 'Slack', 'Banco de Dados SQL', 'Shopify', 'Webhooks Custom', 'Plugins Hórus'].map((tool, i) => (
                         <label key={i} className="flex flex-col items-center justify-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors has-[:checked]:border-amber-500/50 has-[:checked]:bg-amber-500/5 text-center">
                           <input type="checkbox" className="absolute opacity-0" />
                           <div className="w-8 h-8 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center">
                              <Cpu className="w-4 h-4 text-white/50" />
                           </div>
                           <span className="font-medium text-xs text-white">{tool}</span>
                         </label>
                       ))}
                    </div>
                    <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-4">
                       <Zap className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                       <p className="text-xs text-blue-100/70">A integração oficial com ERPs e ferramentas de terceiros ocorre após a implantação pela equipe de Curadoria Nexus, garantindo máxima segurança de credenciais.</p>
                    </div>
                 </div>
               )}

               {step === 5 && (
                 <div className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                       <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-3 flex items-center gap-2"><Lock className="w-4 h-4 text-red-400"/> Limitações Estritas</label>
                       <textarea placeholder="Ex: NUNCA conceda desconto acima de 10%. Nunca prometa entregas imediatas." className="w-full h-32 bg-white/5 border border-red-500/20 rounded-xl p-4 text-white outline-none focus:border-red-500/50 transition-colors resize-none text-sm custom-scrollbar"></textarea>
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-3 flex items-center gap-2"><Headphones className="w-4 h-4 text-emerald-400"/> Escalação Humana</label>
                       <textarea placeholder="Ex: Acione um humano se o cliente ficar irritado ou se a compra for maior que R$ 10.000." className="w-full h-32 bg-white/5 border border-emerald-500/20 rounded-xl p-4 text-white outline-none focus:border-emerald-500/50 transition-colors resize-none text-sm custom-scrollbar"></textarea>
                     </div>
                   </div>

                   <div className="pt-6 border-t border-white/10">
                      <label className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                        <input type="checkbox" className="w-5 h-5 accent-amber-500 shrink-0" defaultChecked />
                        <span className="font-medium text-sm text-white leading-snug">Modo de Segurança LGPD Rigoroso (Mascarar dados sensíveis, não armazenar PII sem consentimento).</span>
                      </label>
                   </div>
                 </div>
               )}

               {step === 6 && (
                 <div className="flex flex-col h-[400px]">
                    <div className="text-center mb-6">
                       <h3 className="text-lg font-bold text-white">Simulação Cognitiva</h3>
                       <p className="text-xs text-white/50">Converse com o membro cognitivo antes de aprovar a arquitetura.</p>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-black/40 border border-white/5 rounded-2xl flex flex-col gap-4 mb-4">
                       {simMessages.map((msg, i) => (
                         <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                           <div className={`max-w-[80%] p-3 text-sm rounded-xl ${msg.role === 'user' ? 'bg-amber-500 text-black font-medium' : 'bg-white/10 border border-white/10 text-white/90'}`}>
                             {msg.text}
                           </div>
                         </div>
                       ))}
                    </div>
                    
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1.5 focus-within:border-amber-500/50 transition-colors shrink-0">
                      <input 
                        type="text" 
                        value={simInput}
                        onChange={(e) => setSimInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSimSend()}
                        placeholder="Envie uma mensagem de teste..."
                        className="flex-1 bg-transparent border-none outline-none text-sm text-white px-3"
                      />
                      <button onClick={handleSimSend} className="p-2 bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition-colors">
                        <Zap className="w-4 h-4" />
                      </button>
                    </div>
                 </div>
               )}

               {step === 7 && (
                 <div className="space-y-8 animate-in fade-in duration-700">
                    <div className="text-center">
                       <div className="inline-flex items-center justify-center p-3 bg-amber-500/10 border border-amber-500/30 rounded-full mb-4">
                          <CheckCircle2 className="w-8 h-8 text-amber-500" />
                       </div>
                       <h3 className="text-2xl font-black text-white">Arquitetura Validada</h3>
                       <p className="text-sm text-white/50 mt-2 max-w-lg mx-auto">O Nexus Core calculou o peso cognitivo, integrações e complexidade da operação.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                       {/* Assinatura */}
                       <div className="bg-[#090A0F] border border-white/10 rounded-2xl p-6 hover:border-amber-500/50 transition-all cursor-pointer group flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-4">
                               <div className="p-2 bg-white/5 rounded-lg group-hover:bg-amber-500/10 transition-colors">
                                 <Clock className="w-5 h-5 text-white/70 group-hover:text-amber-400" />
                               </div>
                               <span className="text-[10px] font-bold bg-white/10 px-2 py-1 rounded text-white/60 uppercase">Mensal</span>
                            </div>
                            <h4 className="text-lg font-bold text-white mb-2">Assinatura Operacional</h4>
                            <div className="text-3xl font-black text-white mb-4">R$ 497<span className="text-sm text-white/40 font-medium">/mês</span></div>
                            <ul className="space-y-2 mb-6 text-sm text-white/60">
                               <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Suporte Contínuo</li>
                               <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Atualizações do Nexus Core</li>
                               <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Hospedagem e Tráfego</li>
                            </ul>
                          </div>
                          <div className="pt-4 border-t border-white/10">
                             <div className="flex items-center justify-between text-xs mb-1">
                               <span className="text-white/50">Curadoria Técnica Nexus</span>
                               <span className="text-white font-bold">+ R$ 1.500 (Único)</span>
                             </div>
                             <p className="text-[10px] text-white/40 leading-tight">Taxa de implantação, calibração estrutural e homologação em até 24 horas.</p>
                          </div>
                       </div>

                       {/* Vitalício */}
                       <div className="bg-gradient-to-br from-amber-900/20 to-[#090A0F] border border-amber-500/30 rounded-2xl p-6 hover:border-amber-500/80 transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-2"><span className="text-[9px] bg-amber-500 text-black px-2 py-0.5 rounded uppercase tracking-widest font-bold shadow-lg">Recomendado</span></div>
                          <div>
                            <div className="flex justify-between items-start mb-4">
                               <div className="p-2 bg-amber-500/10 rounded-lg group-hover:bg-amber-500/20 transition-colors">
                                 <Briefcase className="w-5 h-5 text-amber-500 group-hover:text-amber-400" />
                               </div>
                               <span className="text-[10px] font-bold bg-amber-500/20 px-2 py-1 rounded text-amber-400 uppercase mt-4">Lifetime</span>
                            </div>
                            <h4 className="text-lg font-bold text-white mb-2">Compra Vitalícia</h4>
                            <div className="text-3xl font-black text-white mb-4">R$ 5.997<span className="text-sm text-white/40 font-medium">/único</span></div>
                            <ul className="space-y-2 mb-6 text-sm text-white/60">
                               <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Membro Cognitivo é 100% seu ativo</li>
                               <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Sem mensalidades do Studio</li>
                               <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Integração em infra própria</li>
                            </ul>
                          </div>
                          <div className="pt-4 border-t border-amber-500/20">
                             <div className="flex items-center justify-between text-xs mb-1">
                               <span className="text-white/50">Curadoria Técnica Nexus</span>
                               <span className="text-amber-400 font-bold">Inclusa</span>
                             </div>
                             <p className="text-[10px] text-white/40 leading-tight">Implantação, calibração e entrega do Workspace garantidas em até 24h.</p>
                          </div>
                       </div>
                    </div>
                 </div>
               )}

            </div>
            
            {/* Navigation Actions */}
            <div className="mt-6 md:mt-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
               <button 
                 onClick={handlePrev} 
                 disabled={step === 1}
                 className={`w-full sm:w-auto px-6 py-3 md:py-4 font-bold rounded-xl flex items-center justify-center gap-2 transition-all text-sm md:text-base ${step === 1 ? 'opacity-0 pointer-events-none' : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'}`}
               >
                 <ArrowLeft className="w-4 h-4" /> Voltar
               </button>

               {step < 7 ? (
                 <button 
                   onClick={handleNext}
                   className="w-full sm:w-auto px-8 py-3 md:py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors shadow-lg text-sm md:text-base"
                 >
                   Próximo Passo <ArrowRight className="w-4 h-4" />
                 </button>
               ) : (
                 <button 
                   onClick={handleCreate}
                   className="w-full sm:w-auto px-8 md:px-10 py-3 md:py-4 bg-amber-500 text-black font-black rounded-xl flex items-center justify-center gap-2 hover:bg-amber-400 transition-all shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:scale-105 text-sm md:text-base"
                 >
                   <span className="truncate">APROVAR & IMPLANTAR</span> <Zap className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                 </button>
               )}
            </div>

         </div>
      </div>
    </div>
  );
}

function XIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
}
