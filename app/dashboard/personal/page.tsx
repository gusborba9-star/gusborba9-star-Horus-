'use client';
import { 
  Smartphone, User, CheckCircle2, AlertCircle, Clock, Calendar, 
  Mail, MessageSquare, ListTodo, Settings, Wifi, Battery, Zap,
  Headphones, Monitor, Shield, CreditCard, Activity, ArrowRight,
  Mic, BrainCircuit, Play
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function PersonalHome() {
  const [hasPersonal, setHasPersonal] = useState(true);

  return (
    <div className="h-full flex flex-col bg-[#050508] relative font-sans">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] mix-blend-overlay pointer-events-none"></div>
      
      <div className="h-24 px-6 sm:px-10 border-b border-white/5 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-20">
         <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <User className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
              Operações de Presença
            </h1>
            <p className="text-xs sm:text-sm text-white/50 mt-1 font-light">Seu membro da equipe cognitiva pessoal, disponível 24 horas por dia (Hórus Personal™).</p>
         </div>
         <div className="flex items-center gap-3">
            <Link href="/dashboard/personal/setup" className="px-4 py-2 bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2">
              <Settings className="w-4 h-4" /> Configurar
            </Link>
         </div>
      </div>

      <div className="flex-1 p-6 sm:p-10 overflow-y-auto custom-scrollbar relative z-10">
         <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-6">
               
               {/* Status & Smart Summary */}
               <div className="bg-[#090A0F] border border-blue-500/30 rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row gap-8 items-start">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                  
                  <div className="flex-shrink-0 flex flex-col items-center gap-4 relative z-10">
                     <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center border-2 border-blue-500 relative">
                        <div className="absolute inset-0 rounded-full border border-blue-400/50 animate-ping opacity-20"></div>
                        <BrainCircuit className="w-10 h-10 text-blue-400" />
                        <div className="absolute bottom-0 right-0 w-6 h-6 bg-black rounded-full flex items-center justify-center">
                           <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                        </div>
                     </div>
                     <div className="text-center">
                        <h3 className="font-bold text-white">Arthur</h3>
                        <p className="text-[10px] text-blue-400 uppercase tracking-widest font-bold">Chief of Staff</p>
                     </div>
                  </div>

                  <div className="flex-1 relative z-10">
                     <div className="flex items-center gap-2 mb-4">
                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                          <Activity className="w-3 h-3" /> Online & Monitorando
                        </span>
                        <span className="text-xs text-white/40 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Última ação: Há 2 min
                        </span>
                     </div>
                     <h4 className="text-xl font-bold text-white mb-2">Resumo Inteligente</h4>
                     <p className="text-white/60 font-light text-sm leading-relaxed mb-4">
                        &quot;Bom dia. Sua agenda hoje está concentrada no período da tarde, com 3 reuniões seguidas. O email do cliente sobre o contrato já foi lido e deixei um rascunho preparado na sua caixa de saída. A temperatura em casa foi ajustada conforme sua preferência.&quot;
                     </p>
                     <div className="flex gap-2">
                        <button className="px-4 py-2 bg-blue-500 text-black font-bold rounded-lg text-xs hover:bg-blue-400 transition-colors flex items-center gap-2">
                           <Mic className="w-4 h-4" /> Falar com Arthur
                        </button>
                        <button className="px-4 py-2 bg-white/5 text-white font-bold rounded-lg text-xs hover:bg-white/10 transition-colors flex items-center gap-2 border border-white/10">
                           <MessageSquare className="w-4 h-4" /> Abrir Chat
                        </button>
                     </div>
                  </div>
               </div>

               {/* Agenda & Tasks */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Agenda */}
                  <div className="bg-[#090A0F] border border-white/10 rounded-3xl p-6">
                     <div className="flex justify-between items-center mb-6">
                        <h4 className="font-bold text-white flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-400" /> Agenda do Dia</h4>
                        <button className="text-xs text-blue-400 hover:text-blue-300">Ver tudo</button>
                     </div>
                     <div className="space-y-4">
                        {[
                           { time: '14:00', title: 'Reunião de Alinhamento', type: 'Meet' },
                           { time: '15:30', title: 'Apresentação Cliente', type: 'Zoom' },
                           { time: '17:00', title: 'Revisão Semanal', type: 'Presencial' }
                        ].map((item, i) => (
                           <div key={i} className="flex gap-4 items-start p-3 bg-white/5 rounded-xl border border-white/5 hover:border-blue-500/30 transition-colors">
                              <div className="text-xs font-bold text-white/40 mt-0.5 w-10">{item.time}</div>
                              <div>
                                 <div className="text-sm font-bold text-white">{item.title}</div>
                                 <div className="text-[10px] text-white/50">{item.type}</div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Tasks */}
                  <div className="bg-[#090A0F] border border-white/10 rounded-3xl p-6">
                     <div className="flex justify-between items-center mb-6">
                        <h4 className="font-bold text-white flex items-center gap-2"><ListTodo className="w-5 h-5 text-emerald-400" /> Pendências (Aprovação)</h4>
                     </div>
                     <div className="space-y-3">
                        {[
                           { title: 'Aprovar rascunho de email', desc: 'Contrato XYZ', icon: Mail, color: 'blue' },
                           { title: 'Confirmar reagendamento', desc: 'Reunião com Pedro', icon: Calendar, color: 'amber' },
                           { title: 'Autorizar pagamento mensal', desc: 'Hospedagem AWS', icon: CreditCard, color: 'rose' }
                        ].map((item, i) => {
                           const Icon = item.icon;
                           return (
                              <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-colors">
                                 <div className="flex items-center gap-3">
                                    <div className={`p-2 bg-${item.color}-500/10 rounded-lg text-${item.color}-400`}>
                                       <Icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                       <div className="text-xs font-bold text-white">{item.title}</div>
                                       <div className="text-[10px] text-white/50">{item.desc}</div>
                                    </div>
                                 </div>
                                 <div className="flex gap-1">
                                    <button className="w-7 h-7 rounded bg-white/5 hover:bg-emerald-500/20 text-white/50 hover:text-emerald-400 flex items-center justify-center transition-colors">
                                       <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                 </div>
                              </div>
                           )
                        })}
                     </div>
                  </div>
               </div>

               {/* Communications */}
               <div className="bg-[#090A0F] border border-white/10 rounded-3xl p-6">
                  <h4 className="font-bold text-white flex items-center gap-2 mb-6"><AlertCircle className="w-5 h-5 text-rose-400" /> Radar de Comunicações</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                           <div className="text-xs font-bold text-white/50 flex items-center gap-2"><Mail className="w-4 h-4" /> Emails Importantes</div>
                           <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-[10px] font-bold">2</span>
                        </div>
                        <div className="space-y-2 mt-4">
                           <div className="text-xs text-white/70 truncate"><span className="text-blue-400 font-bold">•</span> [Urgente] Fechamento da proposta</div>
                           <div className="text-xs text-white/70 truncate"><span className="text-blue-400 font-bold">•</span> NFE emitida com sucesso</div>
                        </div>
                     </div>
                     <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                           <div className="text-xs font-bold text-white/50 flex items-center gap-2"><MessageSquare className="w-4 h-4" /> WhatsApp (Filtro Nexus)</div>
                           <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-[10px] font-bold">1</span>
                        </div>
                        <div className="space-y-2 mt-4">
                           <div className="text-xs text-white/70 truncate"><span className="text-emerald-400 font-bold">•</span> Sócio: &quot;Preciso dos relatórios de DRE&quot;</div>
                        </div>
                     </div>
                  </div>
               </div>
               
            </div>

            {/* Side Column */}
            <div className="space-y-6">
               
               {/* Connected Devices */}
               <div className="bg-[#090A0F] border border-white/10 rounded-3xl p-6">
                  <h4 className="font-bold text-white text-sm mb-4">Presença & Dispositivos</h4>
                  <div className="space-y-3">
                     {[
                        { name: 'Desktop Companion', status: 'Ativo', icon: Monitor, color: 'emerald', link: '/dashboard/personal/companion' },
                        { name: 'Aplicativo iOS', status: 'Sincronizado', icon: Smartphone, color: 'emerald', link: '#' },
                        { name: 'Hórus Voice Runtime', status: 'Pronto', icon: Headphones, color: 'blue-400', link: '/dashboard/personal/voice' },
                        { name: 'WhatsApp Business', status: 'Ativo', icon: MessageSquare, color: 'emerald', link: '#' },
                        { name: 'Integração Alexa', status: 'Ativo', icon: Wifi, color: 'emerald', link: '#' }
                     ].map((dev, i) => {
                        const Icon = dev.icon;
                        return (
                           <Link href={dev.link} key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition-colors">
                              <div className="flex items-center gap-3">
                                 <Icon className={`w-4 h-4 text-${dev.color.split('-')[0]}-400`} />
                                 <span className="text-xs font-bold text-white/70">{dev.name}</span>
                              </div>
                              <div className={`w-2 h-2 rounded-full bg-${dev.color.split('-')[0]}-500`}></div>
                           </Link>
                        )
                     })}
                  </div>
               </div>

               {/* Permissions */}
               <div className="bg-[#090A0F] border border-white/10 rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-4">
                     <h4 className="font-bold text-white text-sm flex items-center gap-2"><Shield className="w-4 h-4 text-purple-400"/> Permissões Ativas</h4>
                     <Link href="/dashboard/personal/setup" className="text-[10px] text-purple-400 hover:underline">Editar</Link>
                  </div>
                  <div className="space-y-2">
                     <div className="flex justify-between items-center text-xs">
                        <span className="text-white/60">Leitura de Emails</span>
                        <span className="text-emerald-400 font-bold">Autorizado</span>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                        <span className="text-white/60">Escrita de Rascunhos</span>
                        <span className="text-emerald-400 font-bold">Autorizado</span>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                        <span className="text-white/60">Envio Automático (Email)</span>
                        <span className="text-rose-400 font-bold">Bloqueado</span>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                        <span className="text-white/60">Gestão de Agenda</span>
                        <span className="text-emerald-400 font-bold">Autônomo</span>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                        <span className="text-white/60">Pagamentos & PIX</span>
                        <span className="text-amber-400 font-bold">Sugerir (Aprovar)</span>
                     </div>
                  </div>
               </div>

               {/* Consumption & Plan */}
               <div className="bg-[#090A0F] border border-white/10 rounded-3xl p-6">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 mb-4">
                     <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-white">Chief of Staff (24/7)</span>
                     </div>
                     <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-white/50">Curadoria Técnica</span>
                        <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded uppercase tracking-widest font-bold">Concluída</span>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">
                        <span>Consumo de Inferência</span>
                        <span>45%</span>
                     </div>
                     <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[45%]"></div>
                     </div>
                     <div className="text-[10px] text-white/40 text-right mt-1">~120k créditos restantes hoje</div>
                  </div>
               </div>

            </div>
         </div>
      </div>
    </div>
  );
}
