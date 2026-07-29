const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

// Make the text pop more and the container less dark
const carouselOld = /<div className="w-full overflow-hidden flex relative py-32 bg-\[#08090E\]\/50 border-y border-amber-500\/10 shadow-\[0_0_50px_rgba\(190,158,108,0\.03\)\]" ref=\{containerRef\} style=\{\{ transformStyle: 'preserve-3d' \}\}>/;
const carouselNew = `<div className="w-full overflow-hidden flex relative py-40 bg-gradient-to-b from-[#0A0A0C] via-[#050508] to-[#0A0A0C] border-y border-amber-500/10 shadow-[0_0_100px_rgba(190,158,108,0.05)]" ref={containerRef} style={{ transformStyle: 'preserve-3d' }}>`;

code = code.replace(carouselOld, carouselNew);

const textOld = /<span className="text-3xl md:text-5xl font-light tracking-wide text-white drop-shadow-lg group-hover:text-amber-100 transition-colors">\{item\}<\/span>/;
const textNew = `<span className="text-4xl md:text-6xl font-light tracking-wide text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:text-white group-hover:drop-shadow-[0_0_25px_rgba(255,255,255,0.6)] transition-all">{item}</span>`;

code = code.replace(textOld, textNew);

const catOld = /<span className="text-\[11px\] uppercase tracking-\[0\.3em\] font-bold text-amber-500">\{group\.category\}<\/span>/;
const catNew = `<span className="text-[12px] uppercase tracking-[0.4em] font-bold text-amber-500/80 drop-shadow-[0_0_10px_rgba(190,158,108,0.3)]">{group.category}</span>`;
code = code.replace(catOld, catNew);

const lineOld = /<div className="h-px w-16 bg-amber-500\/40"><\/div>/;
const lineNew = `<div className="h-px w-20 bg-amber-500/30"></div>`;
code = code.replace(lineOld, lineNew);

fs.writeFileSync('app/page.tsx', code);
