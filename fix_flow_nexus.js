const fs = require('fs');
let code = fs.readFileSync('app/dashboard/studio/components/NexusDiscoveryFlow.tsx', 'utf8');

code = code.replace(
  /<div className="flex justify-between items-center bg-\[#141414\] p-4 rounded-2xl border border-\[#1C1C1C\]">/,
  `<div className="text-[10px] text-[#D4AF37]/50 uppercase tracking-[0.2em] font-bold text-center mb-4 flex items-center justify-center gap-2">
     <BrainCircuit className="w-3 h-3" /> Orçamento calculado pelo Nexus Cognitive Core™
   </div>
   <div className="flex justify-between items-center bg-[#141414] p-4 rounded-2xl border border-[#1C1C1C]">`
);

fs.writeFileSync('app/dashboard/studio/components/NexusDiscoveryFlow.tsx', code);
