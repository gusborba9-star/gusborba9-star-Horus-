const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

// Fix the header button
code = code.replace(
  '<Link href="/nexus" className="px-6 py-2.5 bg-amber-500 text-black font-bold rounded-full text-sm hover:bg-amber-400 transition-all shadow-[0_0_20px_rgba(190,158,108,0.3)] flex items-center gap-2">',
  '<Link href="/nexus" className="px-5 py-2 border border-white/10 text-white/80 font-medium rounded-full text-sm hover:bg-white/5 hover:text-white transition-all flex items-center gap-2">'
);

// We should also make the carousel more premium
const oldCarousel = `            {integrations.map((item, idx) => (
              <div key={\`first-\${idx}\`} className="mx-4 px-6 py-3 glass-panel rounded-full text-sm font-bold text-white/70">
                {item}
              </div>
            ))}
            {/* Second Set for seamless loop */}
            {integrations.map((item, idx) => (
              <div key={\`second-\${idx}\`} className="mx-4 px-6 py-3 glass-panel rounded-full text-sm font-bold text-white/70">
                {item}
              </div>
            ))}`;

const newCarousel = `            {integrations.map((item, idx) => (
              <div key={\`first-\${idx}\`} className="mx-6 flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity cursor-default">
                <div className="w-2 h-2 rounded-full bg-amber-500/50"></div>
                <span className="text-xl font-light tracking-wide text-white">{item}</span>
              </div>
            ))}
            {/* Second Set for seamless loop */}
            {integrations.map((item, idx) => (
              <div key={\`second-\${idx}\`} className="mx-6 flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity cursor-default">
                <div className="w-2 h-2 rounded-full bg-amber-500/50"></div>
                <span className="text-xl font-light tracking-wide text-white">{item}</span>
              </div>
            ))}`;

code = code.replace(oldCarousel, newCarousel);

fs.writeFileSync('app/page.tsx', code);
