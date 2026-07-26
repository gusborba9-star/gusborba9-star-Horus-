const fs = require('fs');
let code = fs.readFileSync('app/dashboard/agents/new/page.tsx', 'utf-8');

// Replace the selects with inputs in step 1
code = code.replace(
  /<select.*?>[\s\S]*?<\/select>/g,
  '<input type="text" placeholder="Ex: Vendas, RH, Jurídico..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:border-amber-500/50 transition-colors text-sm sm:text-base" />'
);

// We have 2 selects, let's just do it manually with a full replace of step 1 to be safe and precise.

