const fs = require('fs');

const files = [
  'app/dashboard/agents/page.tsx',
  'app/dashboard/agents/[id]/page.tsx'
];

files.forEach(f => {
  let code = fs.readFileSync(f, 'utf-8');
  // First, revert the change I just made to agents/page.tsx
  if (f === 'app/dashboard/agents/page.tsx') {
     code = code.replace(
       /<div className="h-full overflow-y-auto custom-scrollbar">\s*<div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">/,
       '<div className="p-8 max-w-7xl mx-auto space-y-8">'
     );
  }

  // Now properly wrap everything.
  // We find the first <div className="p-8 max-w-7xl mx-auto space-y-8"> and the last </div> before the function ends
  // Actually, we can just replace the opening and closing tags.
  
  if (code.includes('className="p-8 max-w-7xl mx-auto space-y-8"')) {
    code = code.replace('<div className="p-8 max-w-7xl mx-auto space-y-8">', '<div className="h-full overflow-y-auto custom-scrollbar"><div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">');
    // find the last </div>
    const lastDivIndex = code.lastIndexOf('</div>');
    code = code.substring(0, lastDivIndex) + '</div></div>' + code.substring(lastDivIndex + 6);
  }

  fs.writeFileSync(f, code);
});
