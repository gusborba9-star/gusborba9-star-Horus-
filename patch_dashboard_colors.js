const fs = require('fs');
let code = fs.readFileSync('app/dashboard/page.tsx', 'utf8');

// Replace amber colors to match Titanium Black / Champagne Gold theme
code = code.replace(/bg-amber-500\/10/g, 'bg-[#D4AF37]/10');
code = code.replace(/text-amber-500/g, 'text-[#D4AF37]');
code = code.replace(/text-amber-400/g, 'text-[#E5D2A0]');
code = code.replace(/border-amber-500\/10/g, 'border-[#D4AF37]/10');
code = code.replace(/border-amber-500\/20/g, 'border-[#D4AF37]/20');
code = code.replace(/border-amber-500\/50/g, 'border-[#D4AF37]/50');
code = code.replace(/bg-amber-500/g, 'bg-[#D4AF37]');
code = code.replace(/hover:bg-amber-400/g, 'hover:bg-[#E5D2A0]');
code = code.replace(/shadow-\[0_0_20px_rgba\(245,158,11,0\.2\)\]/g, 'shadow-[0_0_20px_rgba(212,175,55,0.2)]');

// Emerald to neutral or soft gold where appropriate
code = code.replace(/text-emerald-400/g, 'text-[#FAFAFA]/70');
code = code.replace(/bg-emerald-400\/10/g, 'bg-white/5');
code = code.replace(/bg-emerald-500\/10/g, 'bg-white/5');
code = code.replace(/bg-emerald-500/g, 'bg-[#D4AF37]');

// Blue to neutral
code = code.replace(/bg-blue-500\/10/g, 'bg-white/5');
code = code.replace(/text-blue-400/g, 'text-[#FAFAFA]/70');

fs.writeFileSync('app/dashboard/page.tsx', code);
