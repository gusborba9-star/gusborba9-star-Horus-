const fs = require('fs');
let code = fs.readFileSync('app/dashboard/layout.tsx', 'utf8');

const oldStr = `              <div className="flex-1 overflow-hidden">
                 <h4 className="font-bold text-sm truncate text-[#FAFAFA]">Nexus Corp</h4>
                 <p className="text-[9px] text-[#C9A55C] font-bold uppercase tracking-[0.2em]">Enterprise Plan</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#FAFAFA]/30 group-hover:text-[#D4AF37] transition-colors" />
           </div>
        </div>`;

code = code.replace(oldStr, "");
fs.writeFileSync('app/dashboard/layout.tsx', code);
