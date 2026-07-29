const fs = require('fs');
let code = fs.readFileSync('app/dashboard/layout.tsx', 'utf8');

const newDropdown = `{/* Dropdown menu */}
               <div className="absolute top-full left-0 mt-2 w-full bg-[#101010] border border-[#1C1C1C] rounded-xl shadow-2xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all z-50 overflow-hidden">
                   <div className="p-3 border-b border-[#1C1C1C]">
                      <p className="text-[9px] font-bold text-[#FAFAFA]/40 uppercase tracking-[0.2em] mb-1">Hórus Workspaces™</p>
                   </div>
                   <div className="p-2 space-y-1">
                      <button className="w-full flex items-center gap-3 p-2 rounded-lg bg-[#141414] border border-[#D4AF37]/30 text-left">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#E5D2A0] p-[1px] shrink-0">
                             <div className="w-full h-full bg-[#080808] rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-[#D4AF37]">NC</span>
                             </div>
                          </div>
                          <div>
                             <p className="text-xs font-bold text-[#FAFAFA]">Nexus Corp</p>
                             <p className="text-[8px] text-[#D4AF37] uppercase tracking-wider">Operação Enterprise</p>
                          </div>
                      </button>
                      <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#141414] border border-transparent transition-colors text-left text-white/50 hover:text-white">
                          <div className="w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center shrink-0">
                             <span className="text-xs font-bold">OP</span>
                          </div>
                          <div>
                             <p className="text-xs font-bold">Minha Operação Pessoal</p>
                             <p className="text-[8px] uppercase tracking-wider">Pro</p>
                          </div>
                      </button>
                      <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#141414] border border-transparent transition-colors text-left text-white/50 hover:text-white">
                          <div className="w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center shrink-0">
                             <span className="text-xs font-bold">MC</span>
                          </div>
                          <div>
                             <p className="text-xs font-bold">Minha Clínica</p>
                             <p className="text-[8px] uppercase tracking-wider">Business</p>
                          </div>
                      </button>
                      <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#141414] border border-transparent transition-colors text-left text-white/50 hover:text-white">
                          <div className="w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center shrink-0">
                             <span className="text-xs font-bold">RI</span>
                          </div>
                          <div>
                             <p className="text-xs font-bold">Restaurante Imperial</p>
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
               </div>`;

code = code.replace(/{\/\* Dropdown menu \*\/}[\s\S]*?<\/div>\s*<\/div>/, newDropdown);

fs.writeFileSync('app/dashboard/layout.tsx', code);
