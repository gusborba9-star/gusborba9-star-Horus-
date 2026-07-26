const fs = require('fs');
let code = fs.readFileSync('app/dashboard/studio/page.tsx', 'utf-8');

// 1. Rewrite Hard Cap Monitor
const hardCapReplacement = `{/* Usage Metrics Monitor */}
           <div className="rounded-3xl border border-white/10 backdrop-blur-xl bg-white/[0.03] p-6 lg:p-8 flex-1 flex flex-col shadow-2xl shadow-black/60 relative overflow-hidden">
              {/* Subtle Gold Glow Background */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-amber-500/5 blur-[100px] pointer-events-none rounded-full" />
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <h3 className="font-bold text-sm flex items-center gap-2 text-white/80">
                  <Activity className="w-4 h-4 text-amber-500" /> Quota de Processamento
                </h3>
                <div className="text-right">
                  <span className="text-2xl font-bold font-mono tracking-tighter text-white">8.500</span>
                  <p className="text-xs text-white/40">/ 10.000 Créditos</p>
                </div>
              </div>
              
              <div className="w-full bg-[#090A0F] rounded-full h-1.5 border border-white/5 overflow-hidden mb-6 relative z-10">
                <div className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]" style={{ width: \`85%\` }} />
              </div>
              
              <div className="mt-auto space-y-5 relative z-10">
                <p className="text-xs text-white/50 leading-relaxed font-light">
                  Sua franquia de processamento garante alta disponibilidade para os motores multimodais do Nexus e Sandbox.
                </p>
                
                <button className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 border border-amber-400/20 text-black font-bold rounded-xl text-sm hover:brightness-110 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4" /> Expandir Quota
                </button>
              </div>
           </div>`;

code = code.replace(/\{\/\* Hard Cap Monitor \*\/\}[\s\S]*?<\/div> \s*<\/div>/, hardCapReplacement + '\n        </div>');

// 2. Fix the Tabs wrapper for better mobile scrolling
const tabsRegex = /<div className="flex bg-white\/\[0\.03\] backdrop-blur-xl p-1\.5 rounded-2xl border border-white\/10 self-start xl:self-auto overflow-x-auto max-w-full custom-scrollbar">/;
code = code.replace(tabsRegex, '<div className="flex flex-nowrap bg-white/[0.03] backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 self-start xl:self-auto overflow-x-auto max-w-full custom-scrollbar">');

// 3. Fix colors on active/inactive tabs
code = code.replace(/'text-white\/60 hover:text-white hover:bg-white\/\[0\.05\] border border-transparent'/g, "'text-white/50 hover:text-white hover:bg-white/[0.05] border border-transparent'");
code = code.replace(/bg-amber-500\/20 text-amber-400/g, 'bg-amber-500/10 text-amber-400'); // make active tab softer

// 4. Update the "Gerar Artifact" button
code = code.replace(/bg-amber-500 hover:bg-amber-400 text-black/g, 'bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black border border-amber-400/20');
code = code.replace(/bg-amber-500 hover:bg-amber-400 text-white/g, 'bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black border border-amber-400/20');

// 5. Update CRM pipeline button
code = code.replace(/Otimizar Pipeline \[ 30 Créditos \]/g, 'Otimizar Pipeline [ 30 Créditos ]');

// 6. Fix "border-amber-500/30" to "border-amber-500/10" in tabs and elsewhere for more luxury
code = code.replace(/border-amber-500\/30/g, 'border-amber-500/20');

// 7. Update the main background glows
code = code.replace(/bg-amber-900\/10 rounded-full blur-\[120px\]/g, 'bg-amber-500/5 rounded-full blur-[150px]');

// 8. Fix "bg-[#090A0F]/80" -> "bg-[#090A0F]/90" in execution panes
code = code.replace(/bg-\[#090A0F\]\/80/g, 'bg-white/[0.02]');

fs.writeFileSync('app/dashboard/studio/page.tsx', code);
