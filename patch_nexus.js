const fs = require('fs');
let code = fs.readFileSync('app/nexus/page.tsx', 'utf8');

// Fix justify-center causing top cutoff on small screens
code = code.replace(
  'flex-1 overflow-y-auto custom-scrollbar relative z-10 flex flex-col justify-center pb-20',
  'flex-1 overflow-y-auto custom-scrollbar relative z-10 flex flex-col py-10'
);

// Add margin at bottom to prevent overlap with floating chat bubble
code = code.replace(
  '<div className="p-6 relative z-20 shrink-0">',
  '<div className="p-6 pb-20 sm:pb-6 relative z-20 shrink-0">'
);

fs.writeFileSync('app/nexus/page.tsx', code);
