const fs = require('fs');

const code = `'use client';
import { 
  BrainCircuit, ChevronRight, Sparkles, Activity, 
  Server, Network, Shield, ArrowRight, MessageSquare, X, Check
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const carouselPhrases = [
  "Construa operações completas.",
  "Crie colaboradores digitais especializados.",
  "Transforme ideias em projetos reais.",
  "Implante seu próprio Workspace Cognitivo.",
  "Integre qualquer tecnologia existente.",
  "CRM, ERP e Inteligência em uma única infraestrutura.",
  "Do primeiro cliente à operação enterprise.",
  "Arquitete softwares, negócios e experiências.",
  "Automatize processos invisivelmente.",
  "Conecte pessoas, dados e inteligência.",
  "Lance aplicativos, plataformas e operações completas.",
  "Adapte-se ao futuro sem trocar de tecnologia.",
  "Uma infraestrutura concebida para qualquer nicho, setor ou mercado.",
  "Seu próximo projeto começa com um objetivo.",
  "O Nexus cuida do restante."
];

function Carousel3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let animationFrameId: number;
    let currentAngle = 0;
    
    const updateItems = () => {
      if (!containerRef.current) return;
      
      const radius = 600; // Large radius for subtle curvature
      currentAngle -= 0.05; // Extremely slow rotation
      
      const items = containerRef.current.querySelectorAll('.carousel-item');
      const totalItems = items.length;
      const anglePerItem = 360 / totalItems;
      
      items.forEach((item, index) => {
        const el = item as HTMLElement;
        const itemAngle = currentAngle + (index * anglePerItem);
        
        // Convert angle to radians
        const radians = itemAngle * (Math.PI / 180);
        
        const x = Math.sin(radians) * radius;
        const z = Math.cos(radians) * radius;
        
        // Calculate visibility and opacity based on z position (depth)
        // Items in front (z > 0) are more visible
        const normalizedZ = (z + radius) / (radius * 2); // 0 (back) to 1 (front)
        const opacity = Math.max(0.05, Math.pow(normalizedZ, 2));
        const scale = 0.8 + (normalizedZ * 0.2);
        
        el.style.transform = \`translate(-50%, -50%) translate3d(\${x}px, 0, \${z}px) rotateY(\${itemAngle}deg) scale(\${scale})\`;
        el.style.opacity = opacity.toString();
        // Hide items completely in the back to improve performance
        el.style.visibility = normalizedZ < 0.2 ? 'hidden' : 'visible';
      });
      
      animationFrameId = requestAnimationFrame(updateItems);
    };
    
    updateItems();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="w-full h-[500px] overflow-hidden relative bg-transparent flex items-center justify-center" style={{ perspective: '1200px' }}>
      <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-transparent to-[#080808] z-20 pointer-events-none"></div>
      
      {/* 3D Container */}
      <div ref={containerRef} className="relative w-full h-full flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
        {carouselPhrases.map((phrase, idx) => (
          <div 
            key={idx} 
            className="carousel-item absolute top-1/2 left-1/2 whitespace-nowrap text-center transition-opacity duration-100 ease-linear"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <span className="text-3xl md:text-5xl font-light tracking-wide text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all">
              {phrase}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#080808] selection:bg-[#D4AF37]/30 selection:text-white font-sans overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 pt-6 pb-4 bg-gradient-to-b from-[#080808] via-[#080808]/90 to-transparent">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="hidden md:flex flex-1 items-center gap-8 text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">
            <a href="#infrastructure" className="hover:text-[#D4AF37] transition-colors">Infraestrutura</a>
            <a href="#ecosystem" className="hover:text-[#D4AF37] transition-colors">Cognição</a>
          </div>

          <div className="flex justify-start md:justify-center items-center relative md:flex-1">
            <Link href="/" className="flex items-center gap-3 group relative z-10">
               <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-tr from-[#D4AF37]/10 to-[#E5D2A0]/5 flex items-center justify-center border border-[#D4AF37]/20 shadow-[0_0_20px_rgba(212,175,55,0.1)] group-hover:shadow-[0_0_30px_rgba(212,175,55,0.2)] transition-all">
                 <BrainCircuit className="w-4 h-4 md:w-5 md:h-5 text-[#D4AF37]" />
               </div>
               <span className="font-black text-xl md:text-2xl tracking-[0.3em] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                 HÓRUS OS
               </span>
            </Link>
          </div>
          
          <div className="flex flex-1 justify-end">
            <Link href="/dashboard" className="px-5 py-2.5 bg-white/[0.02] backdrop-blur-md border border-[#D4AF37]/20 text-[#FAFAFA] font-bold rounded-full text-[10px] uppercase tracking-[0.2em] hover:bg-white/[0.05] hover:border-[#D4AF37]/40 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.05)]">
              Console
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 px-6 flex flex-col items-center justify-center min-h-[90vh] overflow-hidden">
        {/* Very subtle ambient gold light */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/5 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-5xl mx-auto text-center flex flex-col items-center">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-md mb-8">
             <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse"></div>
             <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#D4AF37]/80">
               Nexus Cognitive Engine™
             </span>
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-light tracking-tight text-[#FAFAFA] mb-4 leading-none">
            HÓRUS OS™
          </h1>
          
          <h2 className="text-xl md:text-2xl font-light tracking-[0.4em] text-[#FAFAFA]/40 uppercase mb-12">
            Infrastructure of Intelligence™
          </h2>
          
          <h3 className="text-2xl md:text-4xl font-light text-[#FAFAFA] mb-8 max-w-3xl leading-snug drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            Compreenda objetivos. Adapte-se à sua realidade. Orquestre resultados.
          </h3>
          
          <p className="text-base md:text-lg text-[#FAFAFA]/50 font-light max-w-3xl mx-auto mb-16 leading-relaxed">
            O Hórus OS é uma Infraestrutura Cognitiva concebida para compreender objetivos complexos e transformá-los em projetos, operações e resultados reais. De pequenas empresas sem qualquer sistema implementado até grandes operações corporativas, o Nexus Cognitive Engine™ adapta-se automaticamente à sua realidade, arquitetando a melhor combinação entre inteligência, recursos e capacidades disponíveis no ecossistema Hórus.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-[#D4AF37] text-[#080808] font-bold rounded-full text-xs uppercase tracking-[0.2em] hover:bg-[#E5D2A0] transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] flex items-center justify-center gap-3 group">
              Conversar com Nexus™ <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/dashboard/studio" className="w-full sm:w-auto px-8 py-4 bg-transparent border border-[#D4AF37]/30 text-[#FAFAFA] font-bold rounded-full text-xs uppercase tracking-[0.2em] hover:bg-white/[0.03] hover:border-[#D4AF37]/60 transition-all flex items-center justify-center gap-3">
              Arquitetar uma Solução™
            </Link>
          </div>
        </div>

        {/* Nexus Cognitive Core™ */}
        <div className="relative w-full max-w-3xl mx-auto h-[500px] flex items-center justify-center mt-32">
           {/* Subtle Gold Pulse */}
           <div className="absolute w-64 h-64 bg-[#D4AF37]/10 blur-[100px] rounded-full"></div>
           
           {/* Neural Rings (Extremely Slow) */}
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-[0.5px] border-[#D4AF37]/20 rounded-full" style={{ animation: 'pulse-ring 6s cubic-bezier(0.215, 0.61, 0.355, 1) infinite' }}></div>
              <div className="w-64 h-64 border-[0.5px] border-[#D4AF37]/10 rounded-full" style={{ animation: 'pulse-ring 6s cubic-bezier(0.215, 0.61, 0.355, 1) infinite 2s' }}></div>
              <div className="w-64 h-64 border-[0.5px] border-[#D4AF37]/5 rounded-full" style={{ animation: 'pulse-ring 6s cubic-bezier(0.215, 0.61, 0.355, 1) infinite 4s' }}></div>
           </div>

           {/* Holographic Neural Connections (Orbit) */}
           <div className="absolute w-[400px] h-[400px] rounded-full border-[0.5px] border-[#FAFAFA]/5" style={{ animation: 'spin-slow 40s linear infinite' }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#D4AF37] rounded-full shadow-[0_0_10px_rgba(212,175,55,0.8)] opacity-60"></div>
           </div>
           <div className="absolute w-[550px] h-[550px] rounded-full border-[0.5px] border-[#FAFAFA]/5" style={{ animation: 'spin-slow-reverse 60s linear infinite' }}>
              <div className="absolute bottom-1/4 right-0 translate-x-1/2 w-1.5 h-1.5 bg-[#E5D2A0] rounded-full shadow-[0_0_10px_rgba(229,210,160,0.5)] opacity-40"></div>
           </div>

           {/* Smoked Glass Core */}
           <div className="relative z-20 w-40 h-40 rounded-full backdrop-blur-2xl bg-[#101010]/60 border border-[#D4AF37]/20 flex items-center justify-center shadow-[0_0_40px_rgba(212,175,55,0.1)] overflow-hidden">
              <div className="absolute inset-0 rounded-full border border-[#D4AF37]/10" style={{ animation: 'spin-slow-reverse 30s linear infinite' }}></div>
              <BrainCircuit className="w-12 h-12 text-[#D4AF37]/80 drop-shadow-[0_0_15px_rgba(212,175,55,0.3)] animate-pulse" />
              {/* Glass reflection */}
              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent rounded-t-full"></div>
           </div>
        </div>
      </section>

      {/* Adaptability Section */}
      <section className="py-24 relative z-10 border-t border-[#141414] bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6 text-center">
           <h2 className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.3em] mb-4">
             O Hórus adapta-se à sua realidade
           </h2>
           <p className="text-2xl md:text-4xl font-light text-[#FAFAFA] mb-16 max-w-4xl mx-auto leading-relaxed">
             Você não precisa adaptar-se ao Hórus. O Hórus foi concebido para adaptar-se à sua realidade operacional.
           </p>
           
           <div className="flex flex-wrap items-center justify-center gap-4 max-w-5xl mx-auto">
             {["Escritórios", "Clínicas", "Startups", "E-commerces", "Restaurantes", "Agências", "Desenvolvedores", "Criadores de Conteúdo", "Empresas Enterprise", "Operações Pessoais", "Pequenos Negócios", "Autônomos"].map((niche, i) => (
                <div key={i} className="px-5 py-2.5 rounded-full border border-[#1C1C1C] bg-[#101010] text-[#FAFAFA]/60 text-xs font-light tracking-wide hover:border-[#D4AF37]/30 hover:text-[#D4AF37] transition-all cursor-default">
                   {niche}
                </div>
             ))}
           </div>
        </div>
      </section>

      {/* Carousel Premium */}
      <section className="py-24 relative z-10 overflow-hidden bg-[#080808]">
         <Carousel3D />
      </section>

      {/* Not About What You Have Section */}
      <section className="py-32 relative z-10 border-t border-[#141414] bg-gradient-to-b from-[#080808] to-[#101010]">
         <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-20">
               <h3 className="text-4xl md:text-6xl font-light text-[#FAFAFA] mb-6">Não é sobre o que você possui hoje.</h3>
               <p className="text-2xl md:text-3xl text-[#FAFAFA]/40 font-light">É sobre o que você deseja construir amanhã.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
               {[
                 "Quero abrir minha primeira empresa.",
                 "Quero criar meu primeiro SaaS.",
                 "Quero automatizar minha operação comercial.",
                 "Quero transformar meu WhatsApp em uma central inteligente de vendas.",
                 "Quero construir um aplicativo.",
                 "Quero criar colaboradores digitais especializados.",
                 "Quero integrar dezenas de sistemas empresariais.",
                 "Quero substituir minhas ferramentas atuais.",
                 "Quero começar do zero."
               ].map((goal, i) => (
                  <div key={i} className="p-8 rounded-2xl bg-[#141414]/50 border border-[#1C1C1C] hover:border-[#D4AF37]/20 transition-all flex items-start gap-4 group">
                     <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/50 mt-2 shrink-0 group-hover:bg-[#D4AF37] transition-colors"></div>
                     <p className="text-[#FAFAFA]/70 font-light text-lg">{goal}</p>
                  </div>
               ))}
            </div>

            <div className="text-center p-10 rounded-3xl border border-[#D4AF37]/20 bg-gradient-to-b from-[#D4AF37]/5 to-transparent relative overflow-hidden">
               <div className="absolute inset-0 bg-[#D4AF37]/5 blur-3xl pointer-events-none"></div>
               <p className="text-2xl md:text-4xl font-light text-[#D4AF37] relative z-10">
                  Se você possui um objetivo, o Nexus possui um ponto de partida.
               </p>
            </div>
         </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 relative z-10 bg-[#080808]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-20">
             <h2 className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.3em] mb-4">Visão & Estrutura</h2>
             <h3 className="text-3xl md:text-5xl font-light text-[#FAFAFA] mb-6">Conhecimento Core</h3>
          </div>

          <div className="space-y-6">
             <div className="p-8 rounded-3xl bg-[#101010] border border-[#1C1C1C] hover:border-[#D4AF37]/20 transition-colors">
                <h3 className="text-xl font-medium text-[#FAFAFA] mb-4">O Hórus pode operar minha empresa inteira?</h3>
                <p className="text-[#FAFAFA]/50 font-light leading-relaxed">
                   SIM. O Hórus pode tornar-se toda a sua infraestrutura operacional ou integrar-se perfeitamente às tecnologias que você já utiliza.
                </p>
             </div>
             
             <div className="p-8 rounded-3xl bg-[#101010] border border-[#1C1C1C] hover:border-[#D4AF37]/20 transition-colors">
                <h3 className="text-xl font-medium text-[#FAFAFA] mb-4">Preciso possuir conhecimentos técnicos?</h3>
                <p className="text-[#FAFAFA]/50 font-light leading-relaxed">
                   NÃO. O Nexus foi concebido para compreender objetivos em linguagem natural e arquitetar automaticamente a melhor solução possível.
                </p>
             </div>
             
             <div className="p-8 rounded-3xl bg-[#101010] border border-[#1C1C1C] hover:border-[#D4AF37]/20 transition-colors">
                <h3 className="text-xl font-medium text-[#FAFAFA] mb-4">O Hórus serve apenas para grandes empresas?</h3>
                <p className="text-[#FAFAFA]/50 font-light leading-relaxed">
                   NÃO. Ele adapta-se desde pequenos negócios até operações corporativas altamente complexas.
                </p>
             </div>
             
             <div className="p-8 rounded-3xl bg-[#101010] border border-[#1C1C1C] hover:border-[#D4AF37]/20 transition-colors">
                <h3 className="text-xl font-medium text-[#FAFAFA] mb-4">Posso contratar apenas um colaborador digital?</h3>
                <p className="text-[#FAFAFA]/50 font-light leading-relaxed">
                   SIM. Você pode implantar desde um único colaborador especializado até operações empresariais completas.
                </p>
             </div>

             <div className="p-8 rounded-3xl bg-[#101010] border border-[#1C1C1C] hover:border-[#D4AF37]/20 transition-colors">
                <h3 className="text-xl font-medium text-[#FAFAFA] mb-4">Posso criar projetos avulsos?</h3>
                <p className="text-[#FAFAFA]/50 font-light leading-relaxed mb-4">
                   SIM. Você poderá desenvolver:
                </p>
                <ul className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 text-[#FAFAFA]/40 font-light text-sm">
                   <li>• músicas</li>
                   <li>• vídeos</li>
                   <li>• Landing Pages</li>
                   <li>• aplicativos</li>
                   <li>• APIs</li>
                   <li>• dashboards</li>
                   <li>• ERPs</li>
                   <li>• SaaS</li>
                   <li>• automações</li>
                   <li>• apresentações</li>
                   <li>• documentos</li>
                   <li>• websites</li>
                   <li>• projetos personalizados</li>
                </ul>
             </div>

             <div className="p-8 rounded-3xl bg-[#101010] border border-[#1C1C1C] hover:border-[#D4AF37]/20 transition-colors">
                <h3 className="text-xl font-medium text-[#FAFAFA] mb-4">O Hórus escolhe automaticamente as tecnologias utilizadas?</h3>
                <p className="text-[#FAFAFA]/50 font-light leading-relaxed">
                   SIM. Toda a complexidade tecnológica permanecerá invisível para o usuário. O Nexus Cognitive Engine™ será responsável por arquitetar automaticamente a melhor combinação entre inteligência, recursos computacionais e capacidades disponíveis no ecossistema Hórus.
                </p>
             </div>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="border-t border-[#1C1C1C] bg-[#080808] pt-32 pb-40 relative z-10 overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-[#D4AF37]/5 blur-[120px] rounded-t-full pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="flex flex-col items-center justify-center mb-12">
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#FAFAFA]/30 mb-6 font-bold">
              Powered by Nexus Cognitive Engine™
            </span>
            <span className="text-sm font-light tracking-[0.2em] text-[#D4AF37] mb-8 uppercase">
              Infrastructure of Intelligence™
            </span>
            <p className="text-lg md:text-xl text-[#FAFAFA]/70 font-light mb-4 max-w-2xl">
              Compreendendo objetivos. Adaptando-se à sua realidade. Orquestrando resultados.
            </p>
            <p className="text-sm text-[#FAFAFA]/40 font-light max-w-2xl">
              Uma Infraestrutura Cognitiva concebida para transformar objetivos em projetos, operações e resultados reais.
            </p>
          </div>
          
          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#1C1C1C] to-transparent my-12"></div>
          
          <div className="flex flex-col items-center justify-center">
            <span className="font-black text-2xl tracking-[0.3em] text-[#FAFAFA] mb-4">HÓRUS OS™</span>
            <span className="text-xs text-[#FAFAFA]/30 font-light tracking-[0.2em] mb-12">The Cognitive Operating System.</span>
            
            <div className="text-[10px] text-[#FAFAFA]/20 font-bold uppercase tracking-[0.2em]">
              &copy; 2026 Nexus Cognitive Architectures™. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
`;

fs.writeFileSync('app/page.tsx', code);
