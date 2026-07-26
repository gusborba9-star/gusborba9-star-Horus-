const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf-8');

// Update value proposition and add the 5 pillars
const featuresHTML = `
        {/* Core Pillars */}
        <section className="py-32 relative z-10" id="features">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-24">
              <h2 className="text-xs font-bold tracking-widest text-emerald-400 uppercase mb-4">A Infraestrutura Definitiva</h2>
              <h3 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Os 5 Pilares de Alta Performance</h3>
              <p className="text-lg text-white/50 max-w-2xl mx-auto font-light">
                O Hórus unifica todas as ferramentas de operação, pesquisa, orquestração e interface em um único ecossistema corporativo.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/[0.07] transition-colors group">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6 text-emerald-400" />
                </div>
                <h4 className="text-xl font-bold mb-3">Modo de Voz Full Duplex</h4>
                <p className="text-white/60 font-light leading-relaxed text-sm">Comunicação em tempo real de altíssima velocidade. Interrompa a fala naturalmente e comande a operação por voz, direto do seu painel, como se estivesse conversando com um diretor humano.</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/[0.07] transition-colors group">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Database className="w-6 h-6 text-emerald-400" />
                </div>
                <h4 className="text-xl font-bold mb-3">Sincronização de Documentos Vivos</h4>
                <p className="text-white/60 font-light leading-relaxed text-sm">O Grafo de Memória conecta-se nativamente a planilhas e editores corporativos via OAuth. Ele lê, cruza e atualiza dados em real-time, eliminando o upload manual de PDFs desatualizados.</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/[0.07] transition-colors group">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Search className="w-6 h-6 text-emerald-400" />
                </div>
                <h4 className="text-xl font-bold mb-3">Deep Research Preditivo</h4>
                <p className="text-white/60 font-light leading-relaxed text-sm">Módulo de varredura profunda de mercado. Mapeie concorrentes, analise tendências, sintetize documentos e receba dossiês executivos estruturados para tomada de decisão imediata.</p>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/[0.07] transition-colors group">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-emerald-400" />
                </div>
                <h4 className="text-xl font-bold mb-3">Orquestração de Força Bruta</h4>
                <p className="text-white/60 font-light leading-relaxed text-sm">O Nexus Core atua invisivelmente. Ele recebe suas instruções, divide projetos em micro-tarefas, aloca os agentes especializados (CRM, Dev, Copy) e executa pipelines inteiros em segundos.</p>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/[0.07] transition-colors group md:col-span-2 lg:col-span-1">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <LayoutTemplate className="w-6 h-6 text-emerald-400" />
                </div>
                <h4 className="text-xl font-bold mb-3">Interface de Elite</h4>
                <p className="text-white/60 font-light leading-relaxed text-sm">Design system focado em operações executivas. Sem botões amadores ou blocos poluídos. Apenas controle total, painéis Kanban nativos e renderização de projetos ao vivo (Sandbox).</p>
              </div>
            </div>
          </div>
        </section>
`;

code = code.replace(/<section className="py-32 bg-white\/\[0\.02\]">.*?<\/section>/s, featuresHTML);

code = code.replace(/text-cyan-/g, 'text-emerald-');
code = code.replace(/bg-cyan-/g, 'bg-emerald-');
code = code.replace(/from-cyan-/g, 'from-emerald-');
code = code.replace(/via-cyan-/g, 'via-emerald-');
code = code.replace(/to-cyan-/g, 'to-emerald-');
code = code.replace(/border-cyan-/g, 'border-emerald-');
code = code.replace(/ring-cyan-/g, 'ring-emerald-');

code = code.replace(/import \{ \n  BrainCircuit,.*?\} from 'lucide-react';/s, `import { \n  BrainCircuit, Menu, X, ArrowRight, Check, Users, Database, Zap, Lock, Globe, MessageSquare, Bot, Activity, Search, LayoutTemplate, Layers \n} from 'lucide-react';`);

fs.writeFileSync('app/page.tsx', code);
