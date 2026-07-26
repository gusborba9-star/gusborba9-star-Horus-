const fs = require('fs');

let code = fs.readFileSync('app/dashboard/agents/[id]/page.tsx', 'utf-8');
code = code.replace('      </div>    </div></div>  );\n}', '      </div>    </div>\n    </div>\n  );\n}');
fs.writeFileSync('app/dashboard/agents/[id]/page.tsx', code);
