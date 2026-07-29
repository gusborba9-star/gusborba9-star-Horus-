const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

// Update carousel items
const oldCarousel = `const carouselPhrases = [
  "Agentes Autônomos",
  "CRM Inteligente",
  "Automação Empresarial",
  "Desenvolvimento de Software",
  "Produção Multimídia",
  "Integração Universal",
  "Memory Graph",
  "Operações Cognitivas"
];`;
const newCarousel = `const carouselPhrases = [
  "Operações Inteligentes",
  "Equipes Digitais",
  "Automações Invisíveis",
  "Integração Universal",
  "Crescimento Contínuo",
  "Inteligência Operacional",
  "Projetos Multimodais",
  "Escalabilidade Enterprise",
  "Infraestrutura Cognitiva"
];`;

if (code.includes(oldCarousel)) {
  code = code.replace(oldCarousel, newCarousel);
} else {
  code = code.replace(/const carouselPhrases = \[\s*([\s\S]*?)\s*\];/, newCarousel);
}

// Update Carousel3D radius and design
code = code.replace(/const radius = 450;/g, 'const radius = 650;');
code = code.replace(/className="carousel-item absolute top-1\/2 left-1\/2 text-center w-\[600px\]"/g, 'className="carousel-item absolute top-1/2 left-1/2 text-center flex justify-center w-[600px]"');
code = code.replace(/<h2 className="text-2xl md:text-4xl font-light text-\[\#FAFAFA\] tracking-wide" style={{ textShadow: '0 0 40px rgba\(212,175,55,0\.2\)' }}>/g, '<div className="px-10 py-5 rounded-3xl bg-white/[0.02] backdrop-blur-md border border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_20px_rgba(212,175,55,0.05)] transition-all"><h2 className="text-2xl md:text-3xl font-light text-[#FAFAFA] tracking-widest whitespace-nowrap" style={{ textShadow: \'0 0 20px rgba(212,175,55,0.3)\' }}>');
code = code.replace(/<\/h2>\s*<\/div>/g, '</h2></div></div>');

fs.writeFileSync('app/page.tsx', code);
