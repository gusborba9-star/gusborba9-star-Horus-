const fs = require('fs');
let code = fs.readFileSync('app/dashboard/layout.tsx', 'utf8');

const workspaceHTML = `        {/* User Workspace Info */}
        <div className="p-4 border-b border-[#1C1C1C] shrink-0 relative">
           <div className="text-[10px] text-[#FAFAFA]/40 font-bold uppercase tracking-[0.2em] mb-2 px-1">Hórus Workspaces™</div>
           
           <div className="group relative">
               <div className="bg-[#141414] border border-[#1C1C1C] rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:bg-[#181818] hover:border-[#D4AF37]/20 transition-all peer">
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
               
               {/* Dropdown menu */}
               <div className="absolute top-full left-0 mt-2 w-full bg-[#101010] border border-[#1C1C1C] rounded-xl shadow-2xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all z-50 overflow-hidden">
                   <div className="p-2 space-y-1">
                      <button className="w-full flex items-center gap-3 p-2 rounded-lg bg-[#141414] border border-[#D4AF37]/30 text-left">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#E5D2A0] p-[1px] shrink-0">
                             <div className="w-full h-full bg-[#080808] rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-[#D4AF37]">NC</span>
                             </div>
                          </div>
                          <div>
                             <p className="text-xs font-bold text-[#FAFAFA]">Nexus Corp</p>
                             <p className="text-[8px] text-[#D4AF37] uppercase tracking-wider">Enterprise</p>
                          </div>
                      </button>
                      <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#141414] border border-transparent transition-colors text-left text-white/50 hover:text-white">
                          <div className="w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center shrink-0">
                             <span className="text-xs font-bold">MP</span>
                          </div>
                          <div>
                             <p className="text-xs font-bold">Minha Operação Pessoal</p>
                             <p className="text-[8px] uppercase tracking-wider">Pro</p>
                          </div>
                      </button>
                   </div>
                   <div className="p-2 border-t border-[#1C1C1C]">
                      <button className="w-full flex items-center justify-center gap-2 p-2 rounded-lg text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors text-xs font-bold uppercase tracking-widest">
                         <Plus className="w-3 h-3" />
                         Novo Workspace
                      </button>
                   </div>
               </div>
           </div>
        </div>`;

code = code.replace(/\{\/\* User Workspace Info \*\/\}.*?<\/div>(\s*<nav)/s, workspaceHTML + '\n$1');

fs.writeFileSync('app/dashboard/layout.tsx', code);
