const fs = require('fs');

let code1 = fs.readFileSync('app/dashboard/agents/page.tsx', 'utf-8');
code1 = code1.replace('      </div></div>    </Link>\n  );\n}', '      </div>\n    </Link>\n  );\n}');
code1 = code1.replace('      </div>\n    </div>\n  );\n}\n\nfunction AgentCard', '      </div>\n    </div>\n    </div>\n  );\n}\n\nfunction AgentCard');
fs.writeFileSync('app/dashboard/agents/page.tsx', code1);

let code2 = fs.readFileSync('app/dashboard/agents/[id]/page.tsx', 'utf-8');
code2 = code2.replace('      </div>    </div></div>  );\n}', '      </div>    </div>\n    </div>  );\n}');
fs.writeFileSync('app/dashboard/agents/[id]/page.tsx', code2);
