const fs = require('fs');

let code = fs.readFileSync('app/dashboard/projects/page.tsx', 'utf8');

const newEmptyState = `            <div className="glass-panel rounded-3xl p-16 text-center border border-white/5 mt-8">
               <div className="w-20 h-20 rounded-3xl bg-[#141417] flex items-center justify-center border border-white/5 mx-auto mb-6 shadow-[0_0_30px_rgba(190,158,108,0.05)]">
                  <Briefcase className="w-8 h-8 text-amber-500/50" />
               </div>
               <h2 className="text-xl font-light text-white mb-3">Nenhum projeto encontrado</h2>
               <p className="text-sm text-white/40 font-light max-w-md mx-auto mb-8">
                  No Hórus, projetos são criados através do Studio. O Nexus orquestra recursos, cria agentes, web apps e automações para você em instantes.
               </p>
               <Link href="/dashboard/studio" className="px-6 py-3 bg-amber-500 text-black font-bold rounded-xl text-sm hover:bg-amber-400 transition-all shadow-[0_0_20px_rgba(190,158,108,0.3)] inline-flex items-center gap-2 group">
                  <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" /> Ir para o Studio Premium
               </Link>
            </div>`;

code = code.replace(/<div className="glass-panel rounded-3xl p-16 text-center border border-white\/5 mt-8">[\s\S]*?<\/div>/, newEmptyState);

const topHeaderButton = `<Link href="/dashboard/studio" className="px-5 py-2.5 bg-amber-500 text-black font-bold rounded-xl text-xs hover:bg-amber-400 transition-colors shadow-[0_0_20px_rgba(190,158,108,0.3)] flex items-center gap-2">
               <Sparkles className="w-4 h-4" /> Criar no Studio
            </Link>`;
            
code = code.replace(/<button className="px-5 py-2.5 bg-amber-500.*?<\/button>/, topHeaderButton);

if (!code.includes('Sparkles')) {
  code = code.replace(/import {([\s\S]*?)} from 'lucide-react';/, "import { Sparkles, $1 } from 'lucide-react';");
}

fs.writeFileSync('app/dashboard/projects/page.tsx', code);
