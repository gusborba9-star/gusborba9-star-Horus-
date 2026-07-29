const fs = require('fs');

let code = fs.readFileSync('app/dashboard/agents/page.tsx', 'utf8');

const newManualTab = `               {activeTab === 'manual' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-amber-500/5 flex items-start gap-4 mb-8">
                        <Settings2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                           <h4 className="text-sm font-bold text-amber-500 mb-1">Criação Estruturada</h4>
                           <p className="text-xs text-white/50 font-light leading-relaxed">Defina o escopo, conhecimento e área de atuação do agente. O Nexus fará o roteamento neural escolhendo automaticamente o melhor modelo fundacional (DeepSeek, GPT-4o, Claude) e inferirá as permissões de acesso baseadas na descrição.</p>                        </div>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                           <div className="glass-panel p-6 rounded-3xl">
                              <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3 block">Objetivo / System Prompt</label>
                              <textarea 
                                 className="w-full h-40 bg-[#0A0A0C] border border-white/10 rounded-xl p-4 text-white text-sm outline-none focus:border-amber-500/50 resize-none font-light leading-relaxed transition-colors"
                                 placeholder="Ex: Preciso de um assistente de RH para ler currículos e agendar entrevistas..."
                              ></textarea>
                           </div>
                           
                           <div className="glass-panel p-6 rounded-3xl">
                              <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3 block">Conhecimento Base (RAG)</label>
                              <select className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-amber-500/50">
                                 <option>Nenhum contexto vetorial</option>
                                 <option>Conectar CRM (HubSpot / Salesforce)</option>
                                 <option>Conectar ERP (SAP / Totvs)</option>
                                 <option>Upload de Documentos / PDFs</option>
                                 <option>Acesso à Casa Inteligente (Pessoal)</option>
                                 <option>Conectar E-mail / Agenda</option>
                              </select>                           </div>
                        </div>

                        <div className="space-y-6">
                           <div className="glass-panel p-6 rounded-3xl space-y-5">
                              <div>
                                 <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2 flex items-center justify-between">
                                    <span>Motor Cognitivo</span>
                                    <span className="text-emerald-400">Automático</span>
                                 </label>
                                 <div className="w-full bg-[#050508] border border-white/5 rounded-xl px-4 py-2.5 text-white/40 text-sm flex items-center gap-2">
                                    <BrainCircuit className="w-4 h-4" /> Nexus Routing Engine
                                 </div>
                                 <p className="text-[9px] text-white/30 mt-2">O Hórus alocará a IA mais capaz em tempo real (Claude, GPT, etc.) de acordo com a tarefa exigida.</p>
                              </div>
                              
                              <div>
                                 <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2 flex items-center justify-between">
                                    <span>Ações Inferidas</span>
                                    <span className="text-amber-500 animate-pulse">Aguardando Escopo...</span>
                                 </label>
                                 <div className="w-full min-h-20 bg-[#050508] border border-white/5 rounded-xl p-3 text-white/30 text-xs font-light italic flex items-center justify-center text-center">
                                    Descreva o objetivo do agente para que o Nexus gere a matriz de permissões (ex: Escrita no CRM, Disparo de Emails, Edição de Estoque).
                                 </div>
                              </div>
                           </div>

                           <button className="w-full py-4 bg-[#141417] border border-amber-500/20 text-amber-500 font-bold rounded-2xl text-sm hover:bg-amber-500 hover:text-black transition-all shadow-[0_0_20px_rgba(190,158,108,0.1)] hover:shadow-[0_0_30px_rgba(190,158,108,0.3)] flex items-center justify-center gap-2 group">
                              <Bot className="w-4 h-4 group-hover:scale-110 transition-transform" /> Inicializar Agente
                           </button>                        </div>                     </div>                  </div>               )}`;

code = code.replace(/\{activeTab === 'manual' && \([\s\S]*?\n               \)\}/, newManualTab);

fs.writeFileSync('app/dashboard/agents/page.tsx', code);
