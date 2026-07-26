const fs = require('fs');
const glob = require('glob');

function replaceColors(content) {
  let modified = content;
  
  // Backgrounds
  modified = modified.replace(/bg-\[#030303\]/g, 'bg-[#090A0F]');
  modified = modified.replace(/bg-\[#050505\]/g, 'bg-[#090A0F]/80');
  modified = modified.replace(/bg-\[#0A0A0A\]/g, 'bg-white/[0.03]');
  modified = modified.replace(/bg-black(\/)?(\d+)?/g, (match, p1, p2) => {
      if (p2 === '50' || p2 === '80' || !p2) {
         return 'bg-[#090A0F]/90';
      }
      return match;
  });

  // Soft Elevation Glassmorphism everywhere
  modified = modified.replace(/bg-white\/5/g, 'bg-white/[0.03] backdrop-blur-xl');
  modified = modified.replace(/bg-white\/\[0\.02\]/g, 'bg-white/[0.03] backdrop-blur-xl');

  // Change all colors to Amber/Gold theme
  modified = modified.replace(/emerald-500/g, 'amber-500');
  modified = modified.replace(/emerald-400/g, 'amber-400');
  modified = modified.replace(/emerald-300/g, 'amber-300');
  
  modified = modified.replace(/cyan-500/g, 'amber-500');
  modified = modified.replace(/cyan-400/g, 'amber-400');
  modified = modified.replace(/cyan-900/g, 'amber-900');
  
  modified = modified.replace(/purple-500/g, 'amber-500');
  modified = modified.replace(/purple-400/g, 'amber-400');
  
  modified = modified.replace(/blue-500/g, 'amber-600');
  modified = modified.replace(/blue-900/g, 'amber-900');

  // Specific shadow adjustment for depth
  modified = modified.replace(/shadow-\[0_0_15px_rgba\([^)]+\)\]/g, 'shadow-[0_0_15px_rgba(245,158,11,0.2)]');
  modified = modified.replace(/shadow-\[0_0_8px_rgba\([^)]+\)\]/g, 'shadow-[0_0_8px_rgba(245,158,11,0.5)]');
  modified = modified.replace(/shadow-\[0_0_50px_rgba\([^)]+\)\]/g, 'shadow-[0_0_50px_rgba(245,158,11,0.15)]');
  modified = modified.replace(/shadow-2xl/g, 'shadow-2xl shadow-black/60');
  
  // Specific borders
  modified = modified.replace(/border-white\/10/g, 'border-white/10');
  
  return modified;
}

const files = glob.sync('app/**/*.{tsx,ts}');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let newContent = replaceColors(content);
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log(`Updated ${file}`);
  }
});
