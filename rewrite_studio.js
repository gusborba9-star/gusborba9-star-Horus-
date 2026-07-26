const fs = require('fs');

const code = `'use client';
import { useState } from 'react';
import { Sparkles, Search, Clock, Video, FileText, Music, Code, PenTool, Database, Box, Play, ArrowRight, Download, CheckCircle2, ShoppingBag, Target, Users, LayoutTemplate, Briefcase, Zap } from 'lucide-react';
import Link from 'next/link';

export default function StudioPage() {
  const [activeTab, setActiveTab] = useState('overview'); // overview, queue, library, hub

  const modules = [
    {
      id: 'agents',
      title: 'Colaboradores Digitais',
      desc: 'Fábrica cognitiva para criar, treinar e gerenciar funcionários autônomos.',
      icon: Users,
      color: 'amber',
      link: '/dashboard/agents'
    },
    {
      id: 'projects',
      title: 'Studio Projects',
      desc: 'Criação multimídia: Vídeos, sites, campanhas, design e aplicações.',
      icon: PenTool,
      color: 'purple',
      link: '#'
    },
    {
      id: 'missions',
      title: 'Missões',
      desc: 'Objetivos complexos orquestrados. Ex: "Quero abrir uma empresa".',
      icon: Target,
      color: 'emerald',
      link: '#'
    },
    {
      id: 'library',
      title: 'Biblioteca Cognitiva',
      desc: 'Acervo central com todos os seus ativos, DNAs, campanhas e workflows.',
      icon: Database,
      color: 'blue',
      link: '/dashboard/library'
    },
    {
      id: 'hub',
      title: 'Hórus Hub',
      desc: 'Loja oficial: Templates, integrações, agentes prontos e workflows.',
      icon: ShoppingBag,
      color: 'rose',
      link: '#'
    }
  ];

  return (
    <div className="h-full overflow-y-auto custom-scrollbar bg-[#050508] relative font-sans">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] mix-blend-overlay pointer-events-none"></div>
      
      {/* Header */}
      <div className="p-6 md:p-10 border-b border-white/5 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-amber-500" /> Studio Hórus
          </h1>
          <p className="text-white/50 text-sm md:text-base font-light">Laboratório Cognitivo para criação de agentes, projetos e operações inteligentes.</p>
          <div className="mt-3 text-[10px] text-amber-500 font-bold uppercase tracking-widest flex items-center gap-1">
             <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Powered by Nexus Cognitive Core™
          </div>
        </div>
        
        <div className="w-full md:w-auto flex items-center bg-black/40 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-amber-500/50 transition-colors shadow-inner">
          <Search className="w-5 h-5 text-white/40" />
          <input type="text" placeholder="Pesquisar projetos, agentes..." className="bg-transparent border-none outline-none text-white ml-3 w-full md:w-64 placeholder:text-white/30 text-sm" />
        </div>
      </div>

      <div className="p-6 md:p-10 max-w-7xl mx-auto relative z-10">
        
        {/* Navigation */}
        <div className="flex overflow-x-auto custom-scrollbar gap-2 mb-10 pb-2">
          {['overview', 'queue', 'library', 'hub'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={\`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap \${activeTab === tab ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10'}\`}
            >
              {tab === 'overview' ? 'Laboratório' : tab === 'queue' ? 'Fila do Diretor' : tab === 'library' ? 'Biblioteca' : 'Hórus Hub'}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-12">
            
            {/* Primary Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Highlight Card: Colaboradores */}
              <div className="lg:col-span-2 bg-gradient-to-br from-[#090A0F] to-amber-900/10 border border-amber-500/20 rounded-3xl p-8 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-700">
                    <Users className="w-48 h-48 text-amber-500" />
                 </div>
                 <div className="relative z-10 w-full md:w-2/3">
                    <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Módulo Principal
                    </div>
                    <h2 className="text-3xl font-black text-white mb-4">Fábrica de Colaboradores Digitais</h2>
                    <p className="text-white/60 font-light mb-8 leading-relaxed">
                       Crie, edite e gerencie especialistas cognitivos. Defina identidade, conhecimentos, integrações e implante uma força de trabalho escalável e autônoma na sua operação.
                    </p>
                    <div className="flex flex-wrap gap-4">
                       <Link href="/dashboard/agents/new" className="px-6 py-3 bg-amber-500 text-black font-bold rounded-xl flex items-center gap-2 hover:bg-amber-400 transition-colors shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                          Contratar Novo Agente <ArrowRight className="w-4 h-4" />
                       </Link>
                       <Link href="/dashboard/agents" className="px-6 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-white/10 transition-colors">
                          Gerenciar Equipe
                       </Link>
                    </div>
                 </div>
              </div>

              {/* Other Modules */}
              {modules.filter(m => m.id !== 'agents').map(mod => {
                const Icon = mod.icon;
                return (
                  <Link key={mod.id} href={mod.link} className="bg-[#090A0F] border border-white/10 rounded-3xl p-6 hover:border-white/30 transition-all group flex flex-col justify-between">
                     <div>
                        <div className={\`w-12 h-12 rounded-xl bg-\${mod.color}-500/10 border border-\${mod.color}-500/20 flex items-center justify-center mb-6 group-hover:bg-\${mod.color}-500/20 transition-colors\`}>
                           <Icon className={\`w-6 h-6 text-\${mod.color}-400\`} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{mod.title}</h3>
                        <p className="text-sm text-white/50 font-light leading-relaxed mb-6">{mod.desc}</p>
                     </div>
                     <div className="flex items-center text-xs font-bold text-white/40 uppercase tracking-widest group-hover:text-white transition-colors">
                        Acessar Módulo <ArrowRight className="w-4 h-4 ml-2" />
                     </div>
                  </Link>
                )
              })}
            </div>

            {/* Recents Section */}
            <div>
               <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                 <Clock className="w-5 h-5 text-amber-500" /> Histórico Recente
               </h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Recent Items */}
                  <div className="bg-[#090A0F] border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer">
                     <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/20">
                       V
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-white">Agente de Vendas</h4>
                        <p className="text-xs text-white/40 mt-0.5">Editado há 2h</p>
                     </div>
                  </div>

                  <div className="bg-[#090A0F] border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer">
                     <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold border border-purple-500/20">
                       <Video className="w-5 h-5" />
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-white">Vídeo Institucional</h4>
                        <p className="text-xs text-white/40 mt-0.5">Renderizado ontem</p>
                     </div>
                  </div>
                  
                  <div className="bg-[#090A0F] border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer">
                     <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold border border-blue-500/20">
                       <Briefcase className="w-5 h-5" />
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-white">Campanha Black Friday</h4>
                        <p className="text-xs text-white/40 mt-0.5">Criado há 3 dias</p>
                     </div>
                  </div>

                  <div className="bg-[#090A0F] border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer">
                     <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 font-bold border border-rose-500/20">
                       <LayoutTemplate className="w-5 h-5" />
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-white">Site Corporativo</h4>
                        <p className="text-xs text-white/40 mt-0.5">Criado há 1 semana</p>
                     </div>
                  </div>

               </div>
            </div>

          </div>
        )}

        {activeTab === 'queue' && (
          <div className="max-w-4xl mx-auto space-y-6">
             <div className="mb-8">
                <h2 className="text-2xl font-bold text-white">Fila do Diretor (Processamento)</h2>
                <p className="text-sm text-white/50 mt-2">Acompanhe a engenharia, planejamento, renderização e implantação autônoma dos seus projetos em tempo real.</p>
             </div>

             {/* Rendering Item */}
             <div className="bg-[#090A0F] border border-amber-500/30 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.05)]">
                <div className="absolute top-0 left-0 w-1.5 bg-amber-500 h-full"></div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                   <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 relative shrink-0">
                        <Video className="w-7 h-7 text-amber-400" />
                        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-500 rounded-full animate-ping"></div>
                      </div>
                      <div>
                         <h3 className="font-bold text-lg text-white">Vídeo Promocional (Black Friday)</h3>
                         <div className="flex flex-wrap items-center gap-2 mt-2">
                           <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1">
                             <Clock className="w-3 h-3"/> Renderizando
                           </span>
                           <span className="text-xs text-white/40 font-mono">1080p Cinematic</span>
                           <span className="text-xs text-white/40 font-mono border-l border-white/10 pl-2">Engine: Nexus VideoGen</span>
                         </div>
                      </div>
                   </div>
                   
                   <div className="w-full md:w-64 shrink-0 bg-black/40 p-4 rounded-xl border border-white/5">
                       <div className="flex justify-between text-[10px] font-bold text-white/70 uppercase tracking-widest mb-2">
                          <span>Progresso</span>
                          <span className="text-amber-400">74%</span>
                       </div>
                       <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 w-[74%] rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                       </div>
                       <p className="text-[10px] text-white/40 mt-2 text-right">Estimativa: 2min restantes</p>
                   </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                   <div className="flex flex-col gap-1">
                     <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Planejamento Concluído</span>
                     <span className="text-xs text-white/50">Roteiro e Storyboard validados.</span>
                   </div>
                   <div className="flex flex-col gap-1">
                     <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest flex items-center gap-1"><Zap className="w-3 h-3"/> Renderização em Andamento</span>
                     <span className="text-xs text-white/50">Gerando assets e motion design.</span>
                   </div>
                   <div className="flex flex-col gap-1 opacity-50">
                     <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest flex items-center gap-1">Aguardando</span>
                     <span className="text-xs text-white/50">Montagem e exportação final.</span>
                   </div>
                </div>
             </div>

             {/* Finished Item */}
             <div className="bg-[#090A0F] border border-emerald-500/30 rounded-3xl p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 bg-emerald-500 h-full"></div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                   <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                        <Code className="w-7 h-7 text-emerald-400" />
                      </div>
                      <div>
                         <h3 className="font-bold text-lg text-white">Landing Page Vendas 2026</h3>
                         <div className="flex flex-wrap items-center gap-2 mt-2">
                           <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1">
                             <CheckCircle2 className="w-3 h-3"/> Implantação Concluída
                           </span>
                           <span className="text-xs text-white/40 font-mono">React / Tailwind</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-2">
                      <button className="px-5 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl text-sm flex items-center gap-2 hover:bg-white/10 transition-colors">
                         <Download className="w-4 h-4" /> Exportar Code
                      </button>
                      <button className="px-5 py-3 bg-white text-black font-bold rounded-xl text-sm flex items-center gap-2 hover:bg-gray-200 transition-colors shadow-lg">
                         <ArrowRight className="w-4 h-4" /> Ver Preview Vivo
                      </button>
                   </div>
                </div>
             </div>
          </div>
        )}
        
        {/* Mock for other tabs */}
        {(activeTab === 'library' || activeTab === 'hub') && (
           <div className="flex flex-col items-center justify-center h-64 text-center">
              <Database className="w-12 h-12 text-white/20 mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">
                 {activeTab === 'library' ? 'Biblioteca Cognitiva' : 'Hórus Hub'}
              </h2>
              <p className="text-white/50 max-w-md">
                 Acesse {activeTab === 'library' ? '/dashboard/library' : 'o marketplace oficial'} para explorar. Módulo sendo sincronizado com o Nexus Core.
              </p>
              {activeTab === 'library' && (
                 <Link href="/dashboard/library" className="mt-6 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors">
                    Ir para Biblioteca Completa
                 </Link>
              )}
           </div>
        )}

      </div>
    </div>
  );
}
`

fs.writeFileSync('app/dashboard/studio/page.tsx', code);
