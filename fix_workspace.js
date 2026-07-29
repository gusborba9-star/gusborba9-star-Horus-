const fs = require('fs');
let code = fs.readFileSync('app/dashboard/layout.tsx', 'utf8');

const newWorkspace = `
        {/* User Workspace Info */}
        <div className="p-4 border-b border-[#1C1C1C] shrink-0 relative" x-data="{ open: false }">
           <div className="text-[10px] text-[#FAFAFA]/40 font-bold uppercase tracking-[0.2em] mb-2 px-1">Hórus Workspaces™</div>
           <div className="bg-[#141414] border border-[#1C1C1C] rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:bg-[#181818] hover:border-[#D4AF37]/20 transition-all group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#E5D2A0] p-[1px] shrink-0">
                 <div className="w-full h-full bg-[#080808] rounded-full flex items-center justify-center overflow-hidden">
                    <span className="text-sm font-bold text-[#D4AF37]">NC</span>
                 </div>
              </div>
              <div className="flex-1 overflow-hidden">
                 <h4 className="font-bold text-sm truncate text-[#FAFAFA]">Nexus Corp</h4>
                 <p className="text-[9px] text-[#C9A55C] font-bold uppercase tracking-[0.2em]">Enterprise Plan</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#FAFAFA]/30 group-hover:text-[#D4AF37] transition-colors shrink-0" />
           </div>
        </div>
`;

code = code.replace(/\{\/\* User Workspace Info \*\/\}.*?<\/div>\s*<\/div>/s, newWorkspace);

// replace specific items in nav
code = code.replace(/\{ name: 'Workspace Cognitivo', href: '\/dashboard', icon: Target \},/g, "{ name: 'Hórus Operations™', href: '/dashboard', icon: Target },");
code = code.replace(/\{ name: 'CRM & Vendas', href: '\/dashboard\/crm', icon: Kanban \},/g, ""); // Remove CRM specific, now it's all horus operations
code = code.replace(/\{ name: 'Tarefas & Fluxos', href: '\/dashboard\/tasks', icon: Layers \},/g, "");

fs.writeFileSync('app/dashboard/layout.tsx', code);
