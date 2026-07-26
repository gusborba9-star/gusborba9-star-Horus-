const fs = require('fs');
let code = fs.readFileSync('app/dashboard/studio/page.tsx', 'utf-8');

// 1. Add 'agents' to activeTab state check/defaults
// We don't need to change the state definition if it's just a string, but let's check.
code = code.replace(/const \[activeTab, setActiveTab\] = useState\('sandbox'\);/, "const [activeTab, setActiveTab] = useState('agents');");

// 2. Add the button to the tabs
const tabsInsertion = `          <button 
            onClick={() => setActiveTab('agents')}
            className={\`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap \${activeTab === 'agents' ? 'bg-amber-500/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)] border border-amber-500/20' : 'text-white/50 hover:text-white hover:bg-white/[0.05] border border-transparent'}\`}
          >
            <Users className="w-4 h-4" /> Criar Agente
          </button>
          <button`;
code = code.replace(/<button\s*onClick=\{\(\) => setActiveTab\('sandbox'\)\}/, tabsInsertion);

// 3. Import Users icon if not present
if (!code.includes('Users')) {
  code = code.replace(/import {([^}]+)} from 'lucide-react';/, "import { Users, $1 } from 'lucide-react';");
}

// 4. Add the component placeholders in the panes
const leftPaneInsertion = `             {activeTab === 'agents' && <AgentInputs />}
             {activeTab === 'sandbox' && <SandboxInputs />}`;
code = code.replace(/\{activeTab === 'sandbox' && <SandboxInputs \/>\}/, leftPaneInsertion);

const centerPaneInsertion = `              {activeTab === 'agents' && <AgentExecution />}
              {activeTab === 'sandbox' && <SandboxExecution />}`;
code = code.replace(/\{activeTab === 'sandbox' && <SandboxExecution \/>\}/, centerPaneInsertion);

// 5. Create the AgentInputs and AgentExecution components at the end
const componentsCode = `

// ----------------------------------------------------------------------
// MODULE: AGENT CREATION
// ----------------------------------------------------------------------

function AgentInputs() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
          <Users className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Fábrica de Agentes</h2>
          <p className="text-xs text-amber-400 font-mono mt-0.5">Engine: Nexus Architect</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
           <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Nome do Agente</label>
           <input type="text" placeholder="Ex: Assistente Financeiro" className="w-full bg-[#090A0F] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50" />
        </div>
        <div className="space-y-2">
           <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Função Core</label>
           <select className="w-full bg-[#090A0F] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50 appearance-none">
             <option>Atendimento / Suporte (RAG)</option>
             <option>Vendas (CRM Integrado)</option>
             <option>Análise de Dados Avançada</option>
             <option>Criativo / Geração de Mídia</option>
           </select>
        </div>
        <div className="space-y-2">
           <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Tom de Voz (System Prompt)</label>
           <textarea placeholder="Descreva a personalidade..." className="w-full h-24 bg-[#090A0F] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50 custom-scrollbar resize-none"></textarea>
        </div>
      </div>
      
      <button className="mt-auto w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 border border-amber-400/20 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:brightness-110 transition-all flex items-center justify-center gap-2">
        <Zap className="w-4 h-4" /> Sintetizar Agente
      </button>
    </div>
  );
}

function AgentExecution() {
  return (
    <div className="flex-1 p-6 md:p-10 flex flex-col items-center justify-center relative bg-[#090A0F]">
       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
       
       <div className="w-full max-w-md bg-white/[0.02] border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-black/60 relative z-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <Lock className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Ativação Necessária</h3>
          <p className="text-white/50 text-sm mb-8 leading-relaxed">
            Para implantar um novo Agente Autônomo na sua infraestrutura, é necessário adquirir a licença de operação ou vinculá-lo ao seu plano Enterprise.
          </p>
          
          <div className="w-full space-y-3 mb-6">
            <div className="w-full p-4 rounded-xl border border-white/5 bg-black/40 flex justify-between items-center">
              <span className="font-bold text-white text-sm">Licença Perpétua (Avulso)</span>
              <span className="font-bold font-mono text-amber-400">R$ 499</span>
            </div>
            <div className="w-full p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex justify-between items-center">
              <span className="font-bold text-white text-sm flex items-center gap-2"><CreditCard className="w-4 h-4 text-amber-500" /> Plano Scale/Enterprise</span>
              <span className="font-bold text-amber-500 text-xs uppercase tracking-widest">Incluído</span>
            </div>
          </div>
          
          <button className="w-full py-3.5 bg-amber-500 text-black font-bold rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:bg-amber-400 transition-colors text-sm">
            Proceder para Checkout Segura
          </button>
       </div>
    </div>
  );
}
`;

code += componentsCode;
fs.writeFileSync('app/dashboard/studio/page.tsx', code);
