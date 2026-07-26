const fs = require('fs');

const newLanding = `'use client';
import { 
  BrainCircuit, ChevronRight, Sparkles, Terminal, Activity,
  Server, Network, Shield, Workflow, Layers, Zap
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const ecosystemGroups = [
    {
      category: 'CRM & Vendas',
      items: ['Salesforce', 'HubSpot', 'Pipedrive', 'RD Station']
    },
    {
      category: 'Cloud & Infra',
      items: ['AWS', 'Google Cloud', 'Azure', 'Vercel']
    },
    {
      category: 'Comunicação',
      items: ['WhatsApp', 'Telegram', 'Slack', 'Discord']
    },
    {
      category: 'Inteligência Artificial',
      items: ['OpenAI', 'Anthropic', 'Google', 'Mistral']
    },
    {
      category: 'Desenvolvimento',
      items: ['GitHub', 'Supabase', 'PostgreSQL', 'Docker']
    }
  ];

  // Flatten for marquee
  const allIntegrations = ecosystemGroups.flatMap(g => [g.category.toUpperCase(), ...g.items]);

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white selection:bg-amber-500/30 selection:text-amber-200 font-sans overflow-x-hidden">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.08] mix-blend-overlay"></div>
         <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 blur-[120px] rounded-full"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[50%] bg-amber-500/5 blur-[150px] rounded-full"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0A0A0C]/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex-1 flex items-center gap-6 text-sm font-medium text-white/50">
            <a href="#infrastructure" className="hover:text-white transition-colors hidden md:block">Infraestrutura</a>
            <a href="#ecosystem" className="hover:text-white transition-colors hidden md:block">Ecossistema</a>
          </div>

          <div className="flex-1 flex justify-center items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-[0_0_20px_rgba(190,158,108,0.15)] group-hover:bg-amber-500/20 transition-all">
              <BrainCircuit className="w-5 h-5 text-amber-500" />
            </div>
            <span className="font-extrabold text-lg tracking-widest text-white group-hover:text-amber-400 transition-colors uppercase">
              Hórus OS
            </span>
          </div>
          
          <div className="flex-1 flex items-center justify-end gap-6">
            <Link href="/nexus" className="text-sm font-medium text-white/70 hover:text-amber-400 transition-colors flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Nexus Engine
            </Link>
            <Link href="/dashboard" className="hidden md:flex px-5 py-2 border border-white/10 text-white font-medium rounded-full text-sm hover:bg-white/5 transition-all items-center gap-2">
              Console <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-amber-500 text-xs font-bold uppercase tracking-widest mb-8 shadow-[0_0_30px_rgba(190,158,108,0.1)]">
            <Sparkles className="w-3 h-3" /> Cognitive Operating System
          </div>
          
          <div className="relative inline-block">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[150%] bg-amber-500/20 blur-[100px] pointer-events-none rounded-full"></div>
             <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tight text-white relative z-10">
               A Infraestrutura <br className="hidden md:block"/> de Inteligência.
             </h1>
          </div>
          
          <p className="text-lg md:text-xl text-white/50 font-light max-w-3xl mx-auto mb-12 leading-relaxed">
            Hórus OS não é um assistente. É um sistema operacional cognitivo desenhado para orquestrar fluxos, integrar dados e escalar operações em nível enterprise através do Nexus Cognitive Engine.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/nexus" className="w-full sm:w-auto px-8 py-4 bg-amber-500 text-black font-black rounded-full text-sm hover:bg-amber-400 transition-all shadow-[0_0_30px_rgba(190,158,108,0.2)] hover:shadow-[0_0_40px_rgba(190,158,108,0.4)] hover:-translate-y-0.5 flex items-center justify-center gap-2">
              Iniciar Nexus Engine <Activity className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Abstract Visualization Premium */}
      <section className="py-12 relative z-10 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
           <div className="glass-panel rounded-[2.5rem] p-px relative overflow-hidden aspect-[21/9] flex items-center justify-center bg-gradient-to-b from-white/10 to-transparent">
              <div className="absolute inset-0 bg-[#0A0A0C] rounded-[2.5rem] overflow-hidden">
                 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(190,158,108,0.12)_0%,transparent_70%)]"></div>
                 
                 {/* Moving particles & Nodes */}
                 <div className="relative w-full h-full flex items-center justify-center">
                    
                    {/* Central Nexus Core */}
                    <div className="absolute z-20 w-40 h-40 rounded-full border border-amber-500/20 flex items-center justify-center animate-[pulse-glow_4s_ease-in-out_infinite] bg-black/40 backdrop-blur-md">
                       <div className="absolute inset-0 rounded-full border border-amber-500/10 animate-[spin_10s_linear_infinite]"></div>
                       <div className="absolute inset-2 rounded-full border border-amber-500/20 animate-[spin_15s_linear_infinite_reverse]"></div>
                       <div className="w-20 h-20 rounded-full bg-amber-500/10 blur-xl absolute"></div>
                       <BrainCircuit className="w-10 h-10 text-amber-400 relative z-10" />
                    </div>

                    {/* Orbiting Elements */}
                    <div className="absolute w-[600px] h-[600px] border border-white/5 rounded-full animate-[spin_40s_linear_infinite]">
                       <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-amber-500/80 rounded-full shadow-[0_0_20px_rgba(190,158,108,0.8)]"></div>
                       <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-white/50 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
                    </div>
                    
                    <div className="absolute w-[800px] h-[800px] border border-white/5 rounded-full animate-[spin_60s_linear_infinite_reverse]">
                       <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-amber-500/60 rounded-full shadow-[0_0_15px_rgba(190,158,108,0.5)]"></div>
                       <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-500/50 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                    </div>

                    {/* SVG Connections */}
                    <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                       <path d="M 10% 20% Q 30% 50% 50% 50%" fill="transparent" stroke="url(#gold-grad)" strokeWidth="1" strokeDasharray="4 4" className="animate-[dash_20s_linear_infinite]" />
                       <path d="M 90% 80% Q 70% 50% 50% 50%" fill="transparent" stroke="url(#gold-grad)" strokeWidth="1" strokeDasharray="4 4" className="animate-[dash_20s_linear_infinite]" />
                       <path d="M 10% 80% Q 30% 50% 50% 50%" fill="transparent" stroke="url(#gold-grad)" strokeWidth="1" strokeDasharray="4 4" className="animate-[dash_20s_linear_infinite_reverse]" />
                       <path d="M 90% 20% Q 70% 50% 50% 50%" fill="transparent" stroke="url(#gold-grad)" strokeWidth="1" strokeDasharray="4 4" className="animate-[dash_20s_linear_infinite_reverse]" />
                       
                       <defs>
                          <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                             <stop offset="0%" stopColor="rgba(190,158,108,0)" />
                             <stop offset="50%" stopColor="rgba(190,158,108,0.8)" />
                             <stop offset="100%" stopColor="rgba(190,158,108,0)" />
                          </linearGradient>
                       </defs>
                    </svg>

                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Structured Ecosystem Carousel */}
      <section id="ecosystem" className="py-32 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3">Ecossistema Agnóstico</h2>
          <p className="text-3xl font-light text-white max-w-2xl mx-auto">Nós não vendemos tecnologia.<br/>Nós orquestramos as suas.</p>
        </div>
        
        <div className="w-full overflow-hidden flex relative bg-[#0A0A0C]/50 border-y border-white/5 py-12">
          <div className="absolute left-0 top-0 bottom-0 w-48 bg-gradient-to-r from-[#0A0A0C] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l from-[#0A0A0C] to-transparent z-10 pointer-events-none"></div>
          
          <div className="flex animate-marquee whitespace-nowrap items-center">
             {ecosystemGroups.map((group, gIdx) => (
                <div key={\`g1-\${gIdx}\`} className="flex items-center mx-8">
                   <div className="flex flex-col gap-2 items-center mr-8 opacity-40">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-amber-500">{group.category}</span>
                      <div className="h-px w-12 bg-amber-500/30"></div>
                   </div>
                   {group.items.map((item, iIdx) => (
                      <div key={\`i1-\${gIdx}-\${iIdx}\`} className="mx-6 flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity cursor-default group">
                         <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-amber-500 transition-colors"></div>
                         <span className="text-2xl font-light tracking-wide text-white">{item}</span>
                      </div>
                   ))}
                </div>
             ))}
             {/* Duplicate for seamless marquee */}
             {ecosystemGroups.map((group, gIdx) => (
                <div key={\`g2-\${gIdx}\`} className="flex items-center mx-8">
                   <div className="flex flex-col gap-2 items-center mr-8 opacity-40">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-amber-500">{group.category}</span>
                      <div className="h-px w-12 bg-amber-500/30"></div>
                   </div>
                   {group.items.map((item, iIdx) => (
                      <div key={\`i2-\${gIdx}-\${iIdx}\`} className="mx-6 flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity cursor-default group">
                         <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-amber-500 transition-colors"></div>
                         <span className="text-2xl font-light tracking-wide text-white">{item}</span>
                      </div>
                   ))}
                </div>
             ))}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section id="infrastructure" className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-10 rounded-[2rem] group hover:border-amber-500/30 transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[40px] group-hover:bg-amber-500/10 transition-colors"></div>
              <div className="w-12 h-12 rounded-2xl bg-[#141417] flex items-center justify-center border border-white/5 mb-8 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(190,158,108,0.1)]">
                <Server className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-xl font-light text-white mb-4">Arquitetura Descentralizada</h3>
              <p className="text-white/40 font-light leading-relaxed text-sm">
                Nós orquestramos agentes independentes através de hubs departamentais, permitindo processamento assíncrono e isolamento de tarefas.
              </p>
            </div>
            
            <div className="glass-panel p-10 rounded-[2rem] group hover:border-amber-500/30 transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[40px] group-hover:bg-amber-500/10 transition-colors"></div>
              <div className="w-12 h-12 rounded-2xl bg-[#141417] flex items-center justify-center border border-white/5 mb-8 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(190,158,108,0.1)]">
                <Network className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-xl font-light text-white mb-4">Memory Graph Centralizado</h3>
              <p className="text-white/40 font-light leading-relaxed text-sm">
                Todo contexto corporativo é persistido vetorialmente. O Hórus lembra de cada reunião, transação e instrução dada no passado.
              </p>
            </div>
            
            <div className="glass-panel p-10 rounded-[2rem] group hover:border-amber-500/30 transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[40px] group-hover:bg-amber-500/10 transition-colors"></div>
              <div className="w-12 h-12 rounded-2xl bg-[#141417] flex items-center justify-center border border-white/5 mb-8 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(190,158,108,0.1)]">
                <Shield className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-xl font-light text-white mb-4">Governança Enterprise</h3>
              <p className="text-white/40 font-light leading-relaxed text-sm">
                Controle granular de acessos, logs de auditoria imutáveis e roteamento seguro garantindo conformidade com padrões globais.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#0A0A0C] py-20 relative z-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <BrainCircuit className="w-6 h-6 text-amber-500" />
            <span className="font-extrabold text-xl tracking-widest text-white uppercase">HÓRUS OS</span>
          </div>
          <p className="text-lg text-white/70 font-light mb-2">The Cognitive Operating System for Modern Enterprises.</p>
          <p className="text-sm text-white/40 font-light mb-12">Orquestrando pessoas, agentes, dados e inteligência em uma única infraestrutura cognitiva.</p>
          <div className="text-xs text-white/30 font-bold uppercase tracking-widest">
            &copy; 2026 Nexus Cognitive Architectures. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
`;
fs.writeFileSync('app/page.tsx', newLanding);
console.log('Landing page patched');
