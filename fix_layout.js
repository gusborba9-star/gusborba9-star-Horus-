const fs = require('fs');
let code = fs.readFileSync('app/dashboard/layout.tsx', 'utf-8');
code = code.replace(
  /<main className="flex-1 relative z-10 flex flex-col bg-\[#050508\]">/,
  '<main className="flex-1 relative z-10 flex flex-col bg-[#050508] min-w-0 min-h-0 overflow-hidden">'
);
fs.writeFileSync('app/dashboard/layout.tsx', code);
