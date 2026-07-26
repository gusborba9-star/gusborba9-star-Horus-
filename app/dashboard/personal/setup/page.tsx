'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, CheckCircle2, ArrowRight, ArrowLeft, Shield, 
  Settings, Clock, Monitor, Smartphone, Headphones, 
  Zap, CreditCard, Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function PersonalSetupWizard() {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const router = useRouter();

  const handleNext = () => setStep(s => Math.min(5, s + 1));
  const handlePrev = () => setStep(s => Math.max(1, s - 1));

  const handleApprove = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsDone(true);
      setTimeout(() => {
        router.push('/dashboard/personal');
      }, 3000);
    }, 4000);
  };

  if (isProcessing || isDone) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#050508] relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[150px] pointer-events-none animate-pulse"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center p-4">
           {isProcessing ? (
             <>
               <div className="w-24 h-24 rounded-full bg-black border border-blue-500/50 flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.5)] mb-8 relative">
                 <Loader2 className="w-10 h-10 text-blue-400 animate-spin absolute" />
                 <Zap className="w-8 h-8 text-blue-500/50" />
               </div>
               <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">Processando Contratação</h2>
               <p className="text-blue-400/80 font-mono text-xs md:text-sm tracking-widest uppercase">Iniciando Curadoria Técnica Nexus...</p>
             </>
           ) : (
             <div className="animate-in zoom-in duration-500 flex flex-col items-center">
               <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.5)] mb-8">
                 <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-emerald-400" />
               </div>
               <h2 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tight text-white mb-4">CONTRATAÇÃO CONCLUÍDA.</h2>
               <p className="text-emerald-400 font-mono text-xs md:text-sm tracking-widest uppercase mb-4">Seu colaborador estará online em até 24 horas.</p>
               <p className="text-white/50 text-xs max-w-sm text-center">Nossa equipe realizará a Curadoria Técnica para garantir a segurança e integração perfeita antes da liberação operacional.</p>
             </div>
           )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#050508] relative font-sans">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] mix-blend-overlay pointer-events-none"></div>
      
      <div className="h-16 md:h-20 border-b border-white/5 bg-[#090A0F]/80 backdrop-blur-xl shrink-0 flex items-center justify-between px-4 sm:px-10 relative z-20">
         <div className="flex items-center gap-4">
            <Link href="/dashboard/personal" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
               <ArrowLeft className="w-4 h-4 text-white/50" />
            </Link>
            <span className="font-bold text-white text-sm">Configuração: Hórus Personal™</span>
         </div>
         <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
            Passo {step} de 5
         </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 relative z-10 flex justify-center">
         <div className="w-full max-w-3xl py-8">
            
            {step === 1 && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                  <div className="text-center mb-12">
                     <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                        <User className="w-8 h-8 text-blue-400" />
                     </div>
                     <h2 className="text-3xl font-black text-white mb-4">Perfil do Colaborador</h2>
                     <p className="text-white/50 font-light max-w-lg mx-auto">Defina a identidade do profissional digital que trabalhará lado a lado com você diariamente.</p>
                  </div>
                  
                  <div className="bg-[#090A0F] border border-white/10 rounded-3xl p-8 space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Nome do Colaborador</label>
                           <input type="text" placeholder="Ex: Arthur, Sarah..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50 transition-colors text-sm" />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Idioma Base</label>
                           <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50 transition-colors text-sm appearance-none">
                              <option value="pt">Português (Brasil)</option>
                              <option value="en">Inglês (US)</option>
                           </select>
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Personalidade & Tom</label>
                           <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50 transition-colors text-sm appearance-none">
                              <option>Formal & Direto (Executivo)</option>
                              <option>Empático & Consultivo</option>
                              <option>Proativo & Dinâmico</option>
                           </select>
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Sua Profissão / Cargo</label>
                           <input type="text" placeholder="Ex: CEO, Advogado, Médico..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50 transition-colors text-sm" />
                        </div>
                     </div>
                     
                     <div>
                        <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Sua Rotina Principal (Briefing)</label>
                        <textarea placeholder="Resuma como é o seu dia a dia e quais os seus principais objetivos com o colaborador..." className="w-full h-32 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50 transition-colors resize-none text-sm custom-scrollbar"></textarea>
                     </div>
                  </div>
               </div>
            )}

            {step === 2 && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                  <div className="text-center mb-12">
                     <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
                        <Settings className="w-8 h-8 text-amber-400" />
                     </div>
                     <h2 className="text-3xl font-black text-white mb-4">Modo de Operação</h2>
                     <p className="text-white/50 font-light max-w-lg mx-auto">Escolha o nível de capacidade intelectual e abrangência das funções que seu colaborador irá exercer.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {[
                        { title: 'Assistente', desc: 'Gerencia agenda, lê emails, cria rascunhos básicos e lembretes.', price: 'R$ 297/mês', icon: Clock },
                        { title: 'Sec. Executivo', desc: 'Integrações complexas, gestão proativa de rotina, automações de CRM.', price: 'R$ 597/mês', icon: User, active: true },
                        { title: 'Chief of Staff', desc: 'Análise de relatórios, tomada de decisão delegada, memória profunda multi-projetos.', price: 'R$ 997/mês', icon: Shield }
                     ].map((plan, i) => {
                        const Icon = plan.icon;
                        return (
                           <div key={i} className={`bg-[#090A0F] border rounded-3xl p-6 cursor-pointer transition-all ${plan.active ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.1)] relative' : 'border-white/10 hover:border-white/30'}`}>
                              {plan.active && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Recomendado</div>}
                              <Icon className={`w-8 h-8 mb-4 ${plan.active ? 'text-amber-400' : 'text-white/30'}`} />
                              <h3 className="text-lg font-bold text-white mb-2">{plan.title}</h3>
                              <p className="text-xs text-white/50 font-light leading-relaxed mb-6">{plan.desc}</p>
                              <div className="text-lg font-black text-white">{plan.price}</div>
                           </div>
                        )
                     })}
                  </div>
               </div>
            )}

            {step === 3 && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                  <div className="text-center mb-12">
                     <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-8 h-8 text-purple-400" />
                     </div>
                     <h2 className="text-3xl font-black text-white mb-4">Segurança & Autonomia</h2>
                     <p className="text-white/50 font-light max-w-lg mx-auto">Defina exatamente o que o Hórus Personal tem autoridade para realizar na sua ausência.</p>
                  </div>
                  
                  <div className="bg-[#090A0F] border border-white/10 rounded-3xl p-8 space-y-6">
                     
                     <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex gap-4">
                        <Zap className="w-6 h-6 text-rose-400 shrink-0" />
                        <div>
                           <h4 className="text-sm font-bold text-white mb-1">Atenção: Transações Financeiras</h4>
                           <p className="text-xs text-white/70 font-light">O colaborador nunca fará pagamentos ou transferências (PIX/Cartão) automaticamente. Ele sempre gerará as guias e solicitará sua aprovação biométrica via aplicativo.</p>
                        </div>
                     </div>

                     {[
                        { name: 'Caixa de Entrada (Leitura)', current: 'Executar Auto' },
                        { name: 'Responder Emails / Mensagens', current: 'Sugerir (Rascunho)' },
                        { name: 'Gerenciar Agenda & Compromissos', current: 'Executar Auto' },
                        { name: 'Atualizar CRM e Tarefas', current: 'Executar Auto' },
                        { name: 'Automações Inteligentes IoT (Casa)', current: 'Informar' }
                     ].map((perm, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b border-white/5 last:border-0">
                           <div>
                              <div className="text-sm font-bold text-white mb-1">{perm.name}</div>
                           </div>
                           <select defaultValue={perm.current} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-purple-500/50">
                              <option value="Informar">Apenas Informar</option>
                              <option value="Sugerir (Rascunho)">Sugerir (Aguardar Aprovação)</option>
                              <option value="Executar Auto">Executar Automaticamente</option>
                           </select>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {step === 4 && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                  <div className="text-center mb-12">
                     <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                        <Monitor className="w-8 h-8 text-emerald-400" />
                     </div>
                     <h2 className="text-3xl font-black text-white mb-4">Presença & Dispositivos</h2>
                     <p className="text-white/50 font-light max-w-lg mx-auto">Selecione onde seu colaborador deverá estar presente e aguardando chamados.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {[
                        { name: 'Painel Web (Hórus OS)', desc: 'Dashboard completo e gestão visual', icon: Monitor, req: true },
                        { name: 'Desktop Companion', desc: 'Atalho flutuante no Mac/Windows', icon: Monitor },
                        { name: 'Aplicativo iOS / Android', desc: 'App nativo com aprovações em 1-click', icon: Smartphone, req: true },
                        { name: 'Hórus Voice Runtime™', desc: 'Comandos de voz no carro e celular', icon: Headphones },
                        { name: 'WhatsApp', desc: 'Converse via áudio ou texto', icon: Zap }
                     ].map((dev, i) => {
                        const Icon = dev.icon;
                        return (
                           <div key={i} className={`p-5 rounded-2xl border flex gap-4 items-center cursor-pointer transition-colors ${dev.req || i === 1 || i === 3 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-[#090A0F] border-white/10 hover:border-white/30'}`}>
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${dev.req || i === 1 || i === 3 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/50'}`}>
                                 <Icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                 <h4 className="text-sm font-bold text-white">{dev.name}</h4>
                                 <p className="text-[10px] text-white/50 mt-1">{dev.desc}</p>
                              </div>
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${dev.req || i === 1 || i === 3 ? 'border-emerald-500 bg-emerald-500' : 'border-white/20'}`}>
                                 {(dev.req || i === 1 || i === 3) && <CheckCircle2 className="w-3 h-3 text-black" />}
                              </div>
                           </div>
                        )
                     })}
                  </div>
               </div>
            )}

            {step === 5 && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                  <div className="text-center mb-12">
                     <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-6">
                        <CreditCard className="w-8 h-8 text-blue-400" />
                     </div>
                     <h2 className="text-3xl font-black text-white mb-4">Revisão & Contratação</h2>
                     <p className="text-white/50 font-light max-w-lg mx-auto">Confira os valores e aprove a implantação pela equipe de curadoria.</p>
                  </div>
                  
                  <div className="bg-[#090A0F] border border-blue-500/30 rounded-3xl p-8 max-w-xl mx-auto relative overflow-hidden">
                     
                     <div className="space-y-4 mb-8">
                        <div className="flex justify-between items-center pb-4 border-b border-white/5">
                           <span className="text-sm text-white/70">Plano (Secretário Executivo)</span>
                           <span className="text-sm font-bold text-white">R$ 597/mês</span>
                        </div>
                        <div className="flex justify-between items-start pb-4 border-b border-white/5">
                           <div>
                              <div className="text-sm text-white/70">Curadoria Técnica Nexus (Setup)</div>
                              <div className="text-[10px] text-white/40 mt-1 max-w-[200px]">Auditoria, calibragem do modelo, setup de integrações e segurança antes da liberação operacional. Prazo: 24h.</div>
                           </div>
                           <span className="text-sm font-bold text-white">R$ 497 (Único)</span>
                        </div>
                     </div>
                     
                     <div className="flex justify-between items-center mb-8">
                        <span className="text-lg font-bold text-white">Total (Hoje)</span>
                        <span className="text-3xl font-black text-white">R$ 1.094</span>
                     </div>
                     
                     <button onClick={handleApprove} className="w-full py-4 bg-blue-500 text-black font-black rounded-xl hover:bg-blue-400 transition-colors shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                        CONTRATAR COLABORADOR
                     </button>
                  </div>
               </div>
            )}

            {/* Navigation */}
            <div className="mt-12 flex items-center justify-between">
               {step > 1 ? (
                  <button onClick={handlePrev} className="px-6 py-3 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-colors text-sm">
                     Voltar
                  </button>
               ) : <div></div>}
               
               {step < 5 && (
                  <button onClick={handleNext} className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm flex items-center gap-2">
                     Avançar <ArrowRight className="w-4 h-4" />
                  </button>
               )}
            </div>

         </div>
      </div>
    </div>
  );
}
