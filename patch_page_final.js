const fs = require('fs');

let code = fs.readFileSync('app/page.tsx', 'utf8');

// 1. Replace ecosystemGroups with coreCapabilities
const oldGroups = /const ecosystemGroups = \[[\s\S]*?\];/;
const newGroups = `  const coreCapabilities = [
    { category: 'Fundamento', items: ['Autonomia Cognitiva', 'Orquestração Assíncrona', 'Modularidade Extrema'] },
    { category: 'Processamento', items: ['Roteamento Neural Dinâmico', 'Inferência Multimodal', 'Execução em Sandboxes'] },
    { category: 'Contexto', items: ['Memória Vetorial Absoluta', 'Consciência de Estado', 'RAG Contínuo'] },
    { category: 'Integração', items: ['Agnóstico a APIs', 'Conexões Zero-Friction', 'Deploy Instantâneo'] },
    { category: 'Segurança', items: ['Governança Enterprise', 'Isolamento de Tarefas', 'Auditoria Neural'] }
  ];`;
code = code.replace(oldGroups, newGroups);

// 2. Update Carousel Call
code = code.replace(/<Carousel3D groups={ecosystemGroups} \/>/, '<Carousel3D groups={coreCapabilities} />');

// 3. Update Carousel3D logic
const carouselOld = /function Carousel3D[\s\S]*?return \([\s\S]*?<\/div>\s*\);\s*\}/;
const carouselNew = `function Carousel3D({ groups }: { groups: { category: string, items: string[] }[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let animationFrameId: number;
    const updateItems = () => {
      if (!containerRef.current) return;
      const items = containerRef.current.querySelectorAll('.carousel-item');
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;
      const radius = containerRect.width * 0.4;
      
      items.forEach((item) => {
        const el = item as HTMLElement;
        const rect = el.getBoundingClientRect();
        const itemCenter = rect.left + rect.width / 2;
        const distanceFromCenter = itemCenter - containerCenter;
        
        const normalizedDistance = Math.max(-1, Math.min(1, distanceFromCenter / (containerRect.width / 1.5)));
        const angle = normalizedDistance * 60; // Less extreme rotation
        const z = radius * Math.cos(angle * Math.PI / 180) - radius;
        const scale = 1 - Math.abs(normalizedDistance) * 0.15; // Keep it larger
        const opacity = 1 - Math.abs(normalizedDistance) * 0.5; // Brighter at edges
        
        el.style.transform = \`perspective(1200px) rotateY(\${angle}deg) translateZ(\${z}px) scale(\${scale})\`;
        el.style.opacity = Math.max(0.1, opacity).toString();
      });
      animationFrameId = requestAnimationFrame(updateItems);
    };
    updateItems();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="w-full overflow-hidden flex relative py-32 bg-[#08090E]/50 border-y border-amber-500/10 shadow-[0_0_50px_rgba(190,158,108,0.03)]" ref={containerRef} style={{ transformStyle: 'preserve-3d' }}>
      <div className="absolute left-0 top-0 bottom-0 w-32 md:w-80 bg-gradient-to-r from-[#08090E] via-[#08090E]/80 to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-32 md:w-80 bg-gradient-to-l from-[#08090E] via-[#08090E]/80 to-transparent z-10 pointer-events-none"></div>
      
      <div className="flex animate-[marquee_180s_linear_infinite] whitespace-nowrap items-center hover:[animation-play-state:paused] w-max">
         {[1, 2, 3].map((loopIdx) => (
           <div key={\`loop-\${loopIdx}\`} className="flex items-center">
             {groups.map((group, gIdx) => (
                <div key={\`g\${loopIdx}-\${gIdx}\`} className="flex items-center mx-16">
                   <div className="flex flex-col gap-3 items-center mr-16 opacity-70 carousel-item transition-transform duration-75 origin-center">
                      <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-amber-500">{group.category}</span>
                      <div className="h-px w-16 bg-amber-500/40"></div>
                   </div>
                   {group.items.map((item, iIdx) => (
                      <div key={\`i\${loopIdx}-\${gIdx}-\${iIdx}\`} className="carousel-item mx-12 flex items-center gap-6 transition-transform duration-75 cursor-default group origin-center">
                         <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 group-hover:bg-amber-500 shadow-[0_0_10px_rgba(190,158,108,0)] group-hover:shadow-[0_0_20px_rgba(190,158,108,1)] transition-all"></div>
                         <span className="text-3xl md:text-5xl font-light tracking-wide text-white drop-shadow-lg group-hover:text-amber-100 transition-colors">{item}</span>
                      </div>
                   ))}
                </div>
             ))}
           </div>
         ))}
      </div>
    </div>
  );
}`;
code = code.replace(carouselOld, carouselNew);

// 4. Update the Marquee speed definition if it's there
code = code.replace(/animation: marquee 80s linear infinite;/, 'animation: marquee 180s linear infinite;');

// 5. Update Header to prevent overlap and center it correctly
const headerOld = /<nav className="fixed top-0 left-0 right-0 z-50 pt-6 pb-4 bg-gradient-to-b from-\[#08090E\] to-transparent">[\s\S]*?<\/nav>/;
const headerNew = `<nav className="fixed top-0 left-0 right-0 z-50 pt-6 pb-4 bg-gradient-to-b from-[#08090E] via-[#08090E]/80 to-transparent">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          <div className="hidden md:flex flex-1 items-center gap-8 text-xs font-bold tracking-widest text-white/40 uppercase">
            <a href="#infrastructure" className="hover:text-amber-400 transition-colors">Infraestrutura</a>
            <a href="#ecosystem" className="hover:text-amber-400 transition-colors">Capacidades</a>
          </div>

          <div className="flex justify-start md:justify-center items-center relative md:flex-1">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-20 bg-amber-500/20 blur-[40px] rounded-full pointer-events-none hidden md:block"></div>
            <Link href="/" className="flex items-center gap-3 group relative z-10">
               <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-tr from-amber-600/20 to-amber-400/5 flex items-center justify-center border border-amber-500/30 shadow-[0_0_30px_rgba(190,158,108,0.3)] group-hover:shadow-[0_0_40px_rgba(190,158,108,0.5)] transition-all">
                 <BrainCircuit className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
               </div>
               <span className="font-black text-xl md:text-2xl tracking-widest text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                 HÓRUS
               </span>
            </Link>
          </div>
          
          <div className="flex flex-1 justify-end">
            <Link href="/dashboard" className="px-4 py-2 md:px-6 md:py-2.5 backdrop-blur-md bg-white/[0.03] border border-amber-500/20 text-white font-bold rounded-full text-[10px] md:text-xs uppercase tracking-widest hover:bg-white/[0.08] hover:border-amber-500/40 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(190,158,108,0.1)] hover:shadow-[0_0_30px_rgba(190,158,108,0.2)]">
              Console
            </Link>
          </div>
        </div>
      </nav>`;
code = code.replace(headerOld, headerNew);


fs.writeFileSync('app/page.tsx', code);
