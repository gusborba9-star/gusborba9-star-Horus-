const fs = require('fs');
let code = fs.readFileSync('app/dashboard/library/page.tsx', 'utf-8');

// Replace dynamic color classes with a mapping or style, but since it's tailwind we can just use a helper function or map.
code = code.replace(
  /className=\{`w-12 h-12 rounded-xl bg-\$\{item\.color\}-500\/10 border border-\$\{item\.color\}-500\/20 flex items-center justify-center group-hover:bg-\$\{item\.color\}-500\/20 transition-colors`\}/g,
  `className={\`w-12 h-12 rounded-xl flex items-center justify-center transition-colors border \${item.color === 'amber' ? 'bg-amber-500/10 border-amber-500/20 group-hover:bg-amber-500/20' : item.color === 'rose' ? 'bg-rose-500/10 border-rose-500/20 group-hover:bg-rose-500/20' : item.color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/20 group-hover:bg-emerald-500/20' : 'bg-indigo-500/10 border-indigo-500/20 group-hover:bg-indigo-500/20'}\`}`
);

code = code.replace(
  /<Icon className=\{`w-6 h-6 text-\$\{item\.color\}-400`\} \/>/g,
  `<Icon className={\`w-6 h-6 \${item.color === 'amber' ? 'text-amber-400' : item.color === 'rose' ? 'text-rose-400' : item.color === 'emerald' ? 'text-emerald-400' : 'text-indigo-400'}\`} />`
);

fs.writeFileSync('app/dashboard/library/page.tsx', code);
