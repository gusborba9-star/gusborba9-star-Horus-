const fs = require('fs');
let code = fs.readFileSync('app/dashboard/studio/page.tsx', 'utf-8');

// Replace state
code = code.replace("useState<'video' | 'audio' | 'campaign'>('video')", "useState<'sandbox' | 'crm' | 'media'>('sandbox')");

// Replace tabs
code = code.replace(/<div className="flex bg-white\/5 backdrop-blur-md p-1\.5 rounded-2xl border border-white\/10 self-start xl:self-auto overflow-x-auto max-w-full custom-scrollbar">[\s\S]*?<\/div>/, `<div className="flex bg-white/5 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 self-start xl:self-auto overflow-x-auto max-w-full custom-scrollbar">
          <button 
            onClick={() => setActiveTab('sandbox')}
            className={\`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap \${activeTab === 'sandbox' ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] border border-emerald-500/30' : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'}\`}
          >
            <Code className="w-4 h-4" /> Ambiente Sandbox
          </button>
          <button 
            onClick={() => setActiveTab('crm')}
            className={\`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap \${activeTab === 'crm' ? 'bg-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)] border border-purple-500/30' : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'}\`}
          >
            <Kanban className="w-4 h-4" /> Pipeline CRM
          </button>
          <button 
            onClick={() => setActiveTab('media')}
            className={\`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap \${activeTab === 'media' ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)] border border-cyan-500/30' : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'}\`}
          >
            <Video className="w-4 h-4" /> Criativos & Mídia
          </button>
        </div>`);

// Update pane content
code = code.replace(/<div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-white\/20 to-transparent" \/>[\s\S]*?<\/div>/, `<div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
             {activeTab === 'sandbox' && <SandboxInputs />}
             {activeTab === 'crm' && <CRMInputs />}
             {activeTab === 'media' && <VideoInputs />}
          </div>`);

code = code.replace(/<div className="bg-\[#0A0A0A\]\/80 backdrop-blur-xl border border-white\/10 rounded-3xl flex flex-col h-full overflow-hidden relative shadow-2xl">[\s\S]*?<\/div>/, `<div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 rounded-3xl flex flex-col h-full overflow-hidden relative shadow-2xl">
              {activeTab === 'sandbox' && <SandboxExecution />}
              {activeTab === 'crm' && <CRMExecution />}
              {activeTab === 'media' && <VideoExecution />}
           </div>`);

// Replace Hard Cap Monitor section
const hardCapReplacement = `{/* Hard Cap Monitor */}
           <div className={\`rounded-3xl border backdrop-blur-xl p-6 flex-1 flex flex-col shadow-2xl \${isNearCap ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5 border-white/10'}\`}>
              <div className="flex justify-between items-start mb-6">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Quota de Processamento
                </h3>
                <div className="text-right">
                  <span className="text-2xl font-bold font-mono tracking-tighter">8.500</span>
                  <p className="text-xs text-white/50">/ 10.000 Créditos</p>
                </div>
              </div>
              
              <div className="w-full bg-black/50 rounded-full h-2 border border-white/5 overflow-hidden mb-6">
                <div className={\`h-full rounded-full transition-all duration-1000 \${isCapped ? 'bg-red-500' : isNearCap ? 'bg-amber-500' : 'bg-emerald-500'}\`} style={{ width: \`85%\` }} />
              </div>
              
              <div className="mt-auto space-y-4">
                <p className="text-xs text-white/60 leading-relaxed font-light">Sua franquia de processamento cobre execuções em força bruta, agentes e sandbox.</p>
                
                <button className="w-full py-3 bg-white border border-white/10 text-black font-bold rounded-xl text-sm hover:bg-emerald-400 transition-colors shadow-lg shadow-white/10 flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4" /> Expandir Quota
                </button>
              </div>
           </div>`;
code = code.replace(/\{\/\* Hard Cap Monitor \*\/\}[\s\S]*?<\/div>\s*<\/div>/, hardCapReplacement);

// Imports missing
code = code.replace("import { useState } from 'react';", "import { useState } from 'react';\nimport { Code, Kanban } from 'lucide-react';");

fs.writeFileSync('app/dashboard/studio/page.tsx', code);
