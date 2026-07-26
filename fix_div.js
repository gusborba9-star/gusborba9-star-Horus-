const fs = require('fs');
let code = fs.readFileSync('app/dashboard/studio/page.tsx', 'utf-8');
code = code.replace(/             <\/div>\n           \{\/\* Usage Metrics Monitor \*\/\}/, '             </div>\n           </div>\n           {/* Usage Metrics Monitor */}');
fs.writeFileSync('app/dashboard/studio/page.tsx', code);
