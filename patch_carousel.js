const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

const newPhrases = [
  "Agentes Autônomos",
  "CRM Inteligente",
  "Automação Empresarial",
  "Desenvolvimento de Software",
  "Produção Multimídia",
  "Integração Universal",
  "Memory Graph",
  "Operações Cognitivas"
];

// Replace the old phrases
code = code.replace(/const carouselPhrases = \[[\s\S]*?\];/, `const carouselPhrases = ${JSON.stringify(newPhrases)};`);

// Update Carousel3D logic
const newCarousel3D = `
function Carousel3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let animationFrameId: number;
    let currentAngle = 0;
    
    const updateItems = () => {
      if (!containerRef.current) return;
      
      const radius = 600; 
      currentAngle -= 0.05; 
      
      const items = containerRef.current.querySelectorAll('.carousel-item');
      const totalItems = items.length;
      const anglePerItem = 360 / totalItems;
      
      items.forEach((item, index) => {
        const el = item as HTMLElement;
        const itemAngle = currentAngle + (index * anglePerItem);
        
        // Em um cilindro onde os itens circulam o usuário (ou onde o centro está perfeitamente de frente para nós)
        const radians = itemAngle * (Math.PI / 180);
        
        const x = Math.sin(radians) * radius;
        const z = Math.cos(radians) * radius;
        
        // Z positivo significa que está mais próximo de quem vê
        const normalizedZ = (z + radius) / (radius * 2); 
        const opacity = Math.max(0.05, Math.pow(normalizedZ, 3));
        const scale = 0.8 + (normalizedZ * 0.2);
        
        // No eixo Y rotacionamos para acompanhar a curvatura, mas mantemos o centro alinhado
        el.style.transform = \`translate(-50%, -50%) translate3d(\${x}px, 0, \${z}px) rotateY(\${itemAngle}deg) scale(\${scale})\`;
        el.style.opacity = opacity.toString();
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
            className="carousel-item absolute top-1/2 left-1/2 text-center w-[800px]"
            style={{ 
              transform: 'translate(-50%, -50%)', // Default before JS kicks in
            }}
          >
            <h2 className="text-4xl md:text-6xl font-light text-[#FAFAFA] tracking-wide" style={{ textShadow: '0 0 40px rgba(212,175,55,0.2)' }}>
              {phrase}
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
}
`;

code = code.replace(/function Carousel3D\(\) \{[\s\S]*?return \([\s\S]*?\);\n\}/, newCarousel3D.trim());

fs.writeFileSync('app/page.tsx', code);
