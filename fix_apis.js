const fs = require('fs');
let code = fs.readFileSync('app/dashboard/apis/page.tsx', 'utf-8');
code = code.replace(/<Edit3, Plus/g, '<Edit3');
fs.writeFileSync('app/dashboard/apis/page.tsx', code);
