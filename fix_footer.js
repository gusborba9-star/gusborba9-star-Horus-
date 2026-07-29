const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

code = code.replace(/Powered by Nexus Cognitive Engine™/g, 'Powered by Nexus Cognitive Core™');
fs.writeFileSync('app/page.tsx', code);
