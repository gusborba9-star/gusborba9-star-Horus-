const fs = require('fs');
let code = fs.readFileSync('app/dashboard/studio/page.tsx', 'utf-8');

// Remove unused state
code = code.replace(/  const hardCap = 1000;\n  const eliteApiCost = 850;\n  const isNearCap = eliteApiCost > hardCap \* 0\.8;\n  const isCapped = eliteApiCost >= hardCap;\n/g, '');

// Fix tabs wrapper
const tabsRegex = /<div className="flex bg-white\/\[0\.03\] backdrop-blur-xl backdrop-blur-md p-1\.5 rounded-2xl border border-white\/10 self-start xl:self-auto overflow-x-auto max-w-full custom-scrollbar">/;
code = code.replace(tabsRegex, '<div className="flex flex-nowrap bg-white/[0.03] backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 self-start xl:self-auto overflow-x-auto max-w-full custom-scrollbar">');

const tabsRegex2 = /<div className="flex bg-white\/\[0\.03\] backdrop-blur-xl p-1\.5 rounded-2xl border border-white\/10 self-start xl:self-auto overflow-x-auto max-w-full custom-scrollbar">/;
code = code.replace(tabsRegex2, '<div className="flex flex-nowrap bg-white/[0.03] backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 self-start xl:self-auto overflow-x-auto max-w-full custom-scrollbar">');

// Active Tab Color (from amber-500/20 -> amber-500/10 with amber-400 text)
code = code.replace(/bg-amber-500\/20 text-amber-400/g, 'bg-amber-500/10 text-amber-400');

// Fix button styling for "Gerar Artifact" and "Otimizar Pipeline"
code = code.replace(/bg-amber-500 hover:bg-amber-400 text-black/g, 'bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black border border-amber-400/20');
code = code.replace(/bg-amber-500 hover:bg-amber-400 text-white/g, 'bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black border border-amber-400/20');
code = code.replace(/Otimizar Pipeline \[ 30 Créditos \]/g, 'Otimizar Pipeline [ 30 Créditos ]');

// Make panels glassmorphic and softer
code = code.replace(/bg-\[#090A0F\]\/80/g, 'bg-white/[0.02]');
code = code.replace(/bg-\[#090A0F\]\/90/g, 'bg-[#090A0F]');

fs.writeFileSync('app/dashboard/studio/page.tsx', code);
