const fs = require('fs');

let code = fs.readFileSync('app/dashboard/agents/page.tsx', 'utf8');

// Fix the import issue
code = code.replace(/import {([^}]+)} from 'lucide-react';/, (match, group1) => {
  if (!group1.includes('Shield')) {
    return `import {${group1}, Shield} from 'lucide-react';`;
  }
  return match;
});

// Restore the Bot component that got corrupted
code = code.replace(/<Bot, Shield/g, '<Bot');

fs.writeFileSync('app/dashboard/agents/page.tsx', code);
