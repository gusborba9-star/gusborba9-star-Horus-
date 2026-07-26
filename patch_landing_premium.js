const fs = require('fs');

const code = `'use client';
import { 
  BrainCircuit, ChevronRight, Sparkles, Activity,
  Server, Network, Shield, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

function Carousel3D({ groups }) {
  const containerRef = useRef(null);
  
  useEffect(() => {
    let animationFrameId;
    const updateItems = () => {
      if (!containerRef.current) return;
      const items = containerRef.current.querySelectorAll('.carousel-item');
      const containerCenter = window.innerWidth / 2;
      
      items.forEach(item => {
        const rect = item.getBoundingClientRect();
        const itemCenter = rect.left + rect.width / 2;
        const distanceFromCenter = itemCenter - containerCenter;
        
        // Normalized distance from -1 (left edge) to 1 (right edge)
        const normalizedDistance = Math.min(Math.max(distanceFromCenter / (window.innerWidth / 2.5), -1), 1);
        
        // Rotate up to 50 degrees, scale down to 0.75, lower opacity at edges
        const rotationY = normalizedDistance * 50; 
        const scale = 1 - Math.abs(normalizedDistance) * 0.25;
        const opacity = 1 - Math.abs(normalizedDistance) * 0.7;
        
        item.style.transform = \`perspective(1000px) rotateY(\${rotationY}deg) scale(\${scale}) translateZ(\${-Math.abs(normalizedDistance) * 50}px)\`;
        item.style.opacity = Math.max(0.1, opacity);
      });
      animationFrameId = requestAnimationFrame(updateItems);
    };
    updateItems();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="w-full overflow-hidden flex relative py-20 bg-[#08090E]/50 border-y border-amber-500/10 shadow-[0_0_50px_rgba(190,158,108,0.03)]" ref={containerRef}>
      <div className="absolute left-0 top-0 bottom-0 w-64 bg-gradient-to-r from-[#08090E] to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-64 bg-gradient-to-l from-[#08090E] to-transparent z-10 pointer-events-none"></div>
      
      <div className="flex animate-[marquee_50s_linear_infinite] whitespace-nowrap items-center hover:[animation-play-state:paused]">
         {/* Group 1 */}
         {groups.map((group, gIdx) => (
            <div key={\`g1-\${gIdx}\`} className="flex items-center mx-10">
               <div className="flex flex-col gap-2 items-center mr-10 opacity-40 carousel-item transition-transform duration-75">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-amber-500">{group.category}</span>
                  <div className="h-px w-12 bg-amber-500/30"></div>
               </div>
               {group.items.map((item, iIdx) => (
                  <div key={\`i1-\${gIdx}-\${iIdx}\`} className="carousel-item mx-8 flex items-center gap-4 transition-transform duration-75 cursor-default group">
                     <div className="w-2 h-2 rounded-full bg-amber-500/20 group-hover:bg-amber-500 shadow-[0_0_10px_rgba(190,158,108,0)] group-hover:shadow-[0_0_15px_rgba(190,158,108,0.8)] transition-all"></div>
                     <span className="text-3xl font-light tracking-wide text-white drop-shadow-md">{item}</span>
                  </div>
               ))}
            </div>
         ))}
         {/* Group 2 (Duplicate for seamless scroll) */}
         {groups.map((group, gIdx) => (
            <div key={\`g2-\${gIdx}\`} className="flex items-center mx-10">
               <div className="flex flex-col gap-2 items-center mr-10 opacity-40 carousel-item transition-transform duration-75">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-amber-500">{group.category}</span>
                  <div className="h-px w-12 bg-amber-500/30"></div>
               </div>
               {group.items.map((item, iIdx) => (
                  <div key={\`i2-\${gIdx}-\${iIdx}\`} className="carousel-item mx-8 flex items-center gap-4 transition-transform duration-75 cursor-default group">
                     <div className="w-2 h-2 rounded-full bg-amber-500/20 group-hover:bg-amber-500 shadow-[0_0_10px_rgba(190,158,108,0)] group-hover:shadow-[0_0_15px_rgba(190,158,108,0.8)] transition-all"></div>
                     <span className="text-3xl font-light tracking-wide text-white drop-shadow-md">{item}</span>
                  </div>
               ))}
            </div>
         ))}
      </div>
    </div>
  );
}

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

  return (
    <div className="min-h-screen bg-[#08090E] text-white selection:bg-amber-500/30 selection:text-amber-200 font-sans overflow-x-hidden">
      
      <style dangerouslySetInnerHTML={{__html: \`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-[marquee_50s_linear_infinite] {
          animation: marquee 50s linear infinite;
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes spin-slow {
          100% { transform: rotate(360deg); }
        }
        @keyframes spin-slow-reverse {
          100% { transform: rotate(-360deg); }
        }
      \`}} />

      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
         {/* Subtle corner glows */}
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/5 blur-[150px] rounded-full"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/5 blur-[150px] rounded-full"></div>
      </div>

      {/* Header Executivo */}
      <nav className="fixed top-0 left-0 right-0 z-50 pt-6 pb-4 bg-gradient-to-b from-[#08090E] to-transparent">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          <div className="flex-1 hidden md:flex items-center gap-8 text-xs font-bold tracking-widest text-white/40 uppercase">
            <a href="#infrastructure" className="hover:text-amber-400 transition-colors">Infraestrutura</a>
            <a href="#ecosystem" className="hover:text-amber-400 transition-colors">Ecossistema</a>
          </div>

          <div className="flex-1 flex justify-center items-center relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-20 bg-amber-500/20 blur-[40px] rounded-full pointer-events-none"></div>
            <Link href="/" className="flex items-center gap-4 group relative z-10">
               <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600/20 to-amber-400/5 flex items-center justify-center border border-amber-500/30 shadow-[0_0_30px_rgba(190,158,108,0.3)] group-hover:shadow-[0_0_40px_rgba(190,158,108,0.5)] transition-all">
                 <BrainCircuit className="w-5 h-5 text-amber-400" />
               </div>
               <span className="font-black text-2xl tracking-widest text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                 HÓRUS OS
               </span>
            </Link>
          </div>
          
          <div className="flex-1 flex justify-end">
            <Link href="/dashboard" className="px-6 py-2.5 backdrop-blur-md bg-white/[0.03] border border-amber-500/20 text-white font-bold rounded-full text-xs uppercase tracking-widest hover:bg-white/[0.08] hover:border-amber-500/40 transition-all items-center gap-2 shadow-[0_0_20px_rgba(190,158,108,0.1)] hover:shadow-[0_0_30px_rgba(190,158,108,0.2)]">
              Acessar Console
            </Link>
          </div>
        </div>
      </nav>

      {/* Floating Status Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
         <Link href="/nexus" className="flex items-center gap-4 px-6 py-3 rounded-full backdrop-blur-xl bg-black/40 border border-white/10 shadow-2xl hover:border-amber-500/30 hover:bg-black/60 transition-all group">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
               <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Nexus Engine</span>
            </div>
            <div className="h-4 w-px bg-white/10"></div>
            <div className="flex items-center gap-2 text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
               <Sparkles className="w-3.5 h-3.5" /> Fale com o Nexus
            </div>
         </Link>
      </div>

      {/* Hero Section */}
      <section className="pt-48 pb-24 relative z-10 flex flex-col items-center justify-center min-h-[90vh]">
        <div className="max-w-7xl mx-auto px-6 text-center w-full">
          
          <div className="relative inline-block mb-10">
             <h1 className="text-5xl md:text-[5rem] leading-[1.1] font-black tracking-tight text-white relative z-10 drop-shadow-2xl">
               A Infraestrutura <br className="hidden md:block"/> de Inteligência.
             </h1>
          </div>
          
          <p className="text-lg md:text-xl text-white/50 font-light max-w-3xl mx-auto mb-20 leading-relaxed">
            Hórus OS não é um assistente. É um sistema operacional cognitivo desenhado para orquestrar fluxos, integrar dados e escalar operações em nível enterprise.
          </p>

          {/* O Núcleo Neural em Movimento */}
          <div className="relative w-full max-w-4xl mx-auto h-[400px] flex items-center justify-center mt-10">
             {/* Central Glow */}
             <div className="absolute w-64 h-64 bg-amber-500/20 blur-[100px] rounded-full"></div>
             
             {/* Pulse Rings */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-40 h-40 border border-amber-500/20 rounded-full" style={{ animation: 'pulse-ring 4s cubic-bezier(0.215, 0.61, 0.355, 1) infinite' }}></div>
                <div className="w-40 h-40 border border-amber-500/10 rounded-full" style={{ animation: 'pulse-ring 4s cubic-bezier(0.215, 0.61, 0.355, 1) infinite 1.3s' }}></div>
                <div className="w-40 h-40 border border-amber-500/5 rounded-full" style={{ animation: 'pulse-ring 4s cubic-bezier(0.215, 0.61, 0.355, 1) infinite 2.6s' }}></div>
             </div>

             {/* Orbiting Particles */}
             <div className="absolute w-[300px] h-[300px] rounded-full border border-white/5" style={{ animation: 'spin-slow 20s linear infinite' }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-amber-400 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.8)]"></div>
             </div>
             <div className="absolute w-[450px] h-[450px] rounded-full border border-white/5" style={{ animation: 'spin-slow-reverse 30s linear infinite' }}>
                <div className="absolute bottom-1/4 right-0 translate-x-1/2 w-2 h-2 bg-emerald-400/80 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
                <div className="absolute top-1/4 left-0 -translate-x-1/2 w-2 h-2 bg-blue-400/80 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.8)]"></div>
             </div>

             {/* Core Element */}
             <div className="relative z-20 w-32 h-32 rounded-full backdrop-blur-xl bg-black/40 border border-amber-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(190,158,108,0.2)]">
                <div className="absolute inset-0 rounded-full border border-amber-500/20" style={{ animation: 'spin-slow-reverse 10s linear infinite' }}></div>
                <div className="absolute inset-2 rounded-full border border-amber-500/40 border-dashed" style={{ animation: 'spin-slow 15s linear infinite' }}></div>
                <BrainCircuit className="w-12 h-12 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]" />
             </div>
          </div>

        </div>
      </section>

      {/* Structured Ecosystem Carousel 3D */}
      <section id="ecosystem" className="py-24 relative z-10">
        <div className="text-center mb-16 px-6">
          <h2 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-4 drop-shadow-[0_0_10px_rgba(190,158,108,0.5)]">Ecossistema Agnóstico</h2>
          <p className="text-3xl md:text-4xl font-light text-white max-w-2xl mx-auto">Nós não vendemos tecnologia.<br/>Nós orquestramos as suas.</p>
        </div>
        
        <Carousel3D groups={ecosystemGroups} />
      </section>

      {/* Core Features - Glassmorphism Almofadado */}
      <section id="infrastructure" className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="backdrop-blur-xl bg-white/[0.02] border border-amber-500/15 shadow-2xl rounded-2xl p-10 group hover:bg-white/[0.04] transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[50px] group-hover:bg-amber-500/20 transition-colors"></div>
              <div className="w-14 h-14 rounded-2xl bg-[#141417] flex items-center justify-center border border-white/10 mb-8 group-hover:scale-110 transition-transform shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <Server className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Arquitetura Descentralizada</h3>
              <p className="text-white/50 font-light leading-relaxed text-sm">
                Nós orquestramos agentes independentes através de hubs departamentais, permitindo processamento assíncrono e isolamento de tarefas.
              </p>
            </div>
            
            <div className="backdrop-blur-xl bg-white/[0.02] border border-amber-500/15 shadow-2xl rounded-2xl p-10 group hover:bg-white/[0.04] transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[50px] group-hover:bg-amber-500/20 transition-colors"></div>
              <div className="w-14 h-14 rounded-2xl bg-[#141417] flex items-center justify-center border border-white/10 mb-8 group-hover:scale-110 transition-transform shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <Network className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Memory Graph Centralizado</h3>
              <p className="text-white/50 font-light leading-relaxed text-sm">
                Todo contexto corporativo é persistido vetorialmente. O Hórus lembra de cada reunião, transação e instrução dada no passado.
              </p>
            </div>
            
            <div className="backdrop-blur-xl bg-white/[0.02] border border-amber-500/15 shadow-2xl rounded-2xl p-10 group hover:bg-white/[0.04] transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[50px] group-hover:bg-amber-500/20 transition-colors"></div>
              <div className="w-14 h-14 rounded-2xl bg-[#141417] flex items-center justify-center border border-white/10 mb-8 group-hover:scale-110 transition-transform shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <Shield className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Governança Enterprise</h3>
              <p className="text-white/50 font-light leading-relaxed text-sm">
                Controle granular de acessos, logs de auditoria imutáveis e roteamento seguro garantindo conformidade com padrões globais.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="border-t border-white/5 bg-[#08090E] pt-24 pb-32 relative z-10 overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-amber-500/5 blur-[120px] rounded-t-full pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="flex items-center justify-center gap-4 mb-8">
            <BrainCircuit className="w-8 h-8 text-amber-500" />
            <span className="font-black text-3xl tracking-widest text-white uppercase drop-shadow-md">HÓRUS OS</span>
          </div>
          <p className="text-xl md:text-2xl text-white/80 font-light mb-4">The Cognitive Operating System for Modern Enterprises.</p>
          <p className="text-base text-white/50 font-light mb-16 max-w-2xl mx-auto">Orquestrando pessoas, agentes, dados e inteligência em uma única infraestrutura cognitiva.</p>
          <div className="text-xs text-white/30 font-bold uppercase tracking-widest">
            &copy; 2026 Nexus Cognitive Architectures. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
`

fs.writeFileSync('app/page.tsx', code);
