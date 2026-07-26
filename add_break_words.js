const fs = require('fs');
let code = fs.readFileSync('app/layout.tsx', 'utf-8');
code = code.replace(/<body className="(.*?)"/g, '<body className="$1 break-words"');
fs.writeFileSync('app/layout.tsx', code);
