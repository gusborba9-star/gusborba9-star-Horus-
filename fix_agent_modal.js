const fs = require('fs');
let code = fs.readFileSync('app/dashboard/agents/new/page.tsx', 'utf-8');

// Fix modal max-height and scrolling
code = code.replace(
  /className="bg-\[#090A0F\]\/95 backdrop-blur-xl border border-amber-500\/20 p-8 rounded-3xl max-w-lg w-full relative shadow-\[0_0_50px_rgba\(245,158,11,0\.15\)\]"/,
  'className="bg-[#090A0F]/95 backdrop-blur-xl border border-amber-500/20 p-6 sm:p-8 rounded-3xl max-w-lg w-full relative shadow-[0_0_50px_rgba(245,158,11,0.15)] max-h-[90vh] overflow-y-auto custom-scrollbar"'
);

// Also remove hardcoded heights on mobile for the options
code = code.replace(
  /className="w-full p-5 rounded-xl border border-white\/10 bg-black\/40 flex flex-col hover:border-amber-500\/30 transition-all"/g,
  'className="w-full p-4 sm:p-5 rounded-xl border border-white/10 bg-black/40 flex flex-col hover:border-amber-500/30 transition-all"'
);

code = code.replace(
  /className="w-full p-5 rounded-xl border border-amber-500\/30 bg-amber-500\/10 flex flex-col hover:bg-amber-500\/20 transition-all relative overflow-hidden"/g,
  'className="w-full p-4 sm:p-5 rounded-xl border border-amber-500/30 bg-amber-500/10 flex flex-col hover:bg-amber-500/20 transition-all relative overflow-hidden"'
);

code = code.replace(
  /className="flex-\[2\] py-3\.5 px-4 rounded-xl/g,
  'className="flex-[2] py-3 px-3 sm:py-3.5 sm:px-4 rounded-xl'
);

code = code.replace(
  /className="flex-1 py-3\.5 px-4 rounded-xl/g,
  'className="flex-1 py-3 px-3 sm:py-3.5 sm:px-4 rounded-xl'
);

fs.writeFileSync('app/dashboard/agents/new/page.tsx', code);
