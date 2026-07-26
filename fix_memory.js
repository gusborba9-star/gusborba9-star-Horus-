const fs = require('fs');
let code = fs.readFileSync('app/dashboard/memory/page.tsx', 'utf-8');

// Ensure abstract look and proper colors
code = code.replace(/text-emerald-400/g, 'text-amber-400');
code = code.replace(/bg-emerald-500\/10/g, 'bg-amber-500/10');
code = code.replace(/bg-emerald-500\/20/g, 'bg-amber-500/10');
code = code.replace(/border-emerald-500\/30/g, 'border-amber-500/20');
code = code.replace(/rgba\(16, 185, 129/g, 'rgba(245, 158, 11');
code = code.replace(/bg-emerald-400/g, 'bg-amber-400');

fs.writeFileSync('app/dashboard/memory/page.tsx', code);
