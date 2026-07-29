const fs = require('fs');
let code = fs.readFileSync('app/nexus/page.tsx', 'utf8');

code = code.replace(/bg-amber-500\/10/g, 'bg-[#D4AF37]/10');
code = code.replace(/bg-amber-500\/5/g, 'bg-[#D4AF37]/5');
code = code.replace(/border-amber-500\/20/g, 'border-[#D4AF37]/20');
code = code.replace(/text-amber-500/g, 'text-[#D4AF37]');
code = code.replace(/bg-amber-500/g, 'bg-[#D4AF37]');
code = code.replace(/hover:bg-amber-400/g, 'hover:bg-[#E5D2A0]');
code = code.replace(/border-amber-500\/30/g, 'border-[#D4AF37]/30');
code = code.replace(/border-amber-500\/50/g, 'border-[#D4AF37]/50');
code = code.replace(/rgba\(245,158,11/g, 'rgba(212,175,55');

code = code.replace(/bg-\[#141417\]/g, 'bg-[#141414]');
code = code.replace(/bg-\[#0A0A0C\]/g, 'bg-[#080808]');
code = code.replace(/bg-\[#050508\]/g, 'bg-[#101010]');
code = code.replace(/text-white/g, 'text-[#FAFAFA]');

code = code.replace(/\/dashboard\/studio\/audio/g, '/dashboard/studio/music');

fs.writeFileSync('app/nexus/page.tsx', code);
