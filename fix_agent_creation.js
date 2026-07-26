const fs = require('fs');
let code = fs.readFileSync('app/dashboard/agents/new/page.tsx', 'utf-8');

// 1. Add showCheckout state
if (!code.includes('showCheckout')) {
  code = code.replace(/const \[isSubmitting, setIsSubmitting\] = useState\(false\);/, "const [isSubmitting, setIsSubmitting] = useState(false);\n  const [showCheckout, setShowCheckout] = useState(false);");
}

// 2. Add CreditCard icon to imports if missing
if (!code.includes('CreditCard')) {
  code = code.replace(/import {([^}]+)} from 'lucide-react';/, "import { CreditCard, $1 } from 'lucide-react';");
}

// 3. Update form submit handler
const submitRegex = /const handleSubmit = async \(e: React\.FormEvent\) => \{[\s\S]*?router\.push\('\/dashboard\/agents'\);[\s\S]*?\};/;
const newSubmit = `const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate generation time
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setShowCheckout(true);
  };`;
code = code.replace(submitRegex, newSubmit);

// 4. Add the Premium Checkout Modal at the end of the return statement
const checkoutModal = `      {showCheckout && (
        <div className="fixed inset-0 bg-[#090A0F]/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#090A0F]/95 backdrop-blur-xl border border-amber-500/20 p-8 rounded-3xl max-w-lg w-full relative shadow-[0_0_50px_rgba(245,158,11,0.15)]"
          >
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(245,158,11,0.2)] mx-auto">
              <Lock className="w-8 h-8 text-amber-400" />
            </div>
            
            <h2 className="text-2xl font-bold mb-2 text-center text-white">Licenciamento de Agente</h2>
            <p className="text-white/50 text-sm mb-8 text-center leading-relaxed">
              O modelo base do <strong>{formData.name || 'seu agente'}</strong> foi sintetizado com sucesso no Nexus Core. Escolha a modalidade de licenciamento para iniciar a operação na infraestrutura Hórus.
            </p>
            
            <div className="space-y-4 mb-8">
              <label className="cursor-pointer group">
                <div className="w-full p-5 rounded-xl border border-white/10 bg-black/40 flex flex-col hover:border-amber-500/30 transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-white text-lg flex items-center gap-2">
                      <input type="radio" name="licenseType" className="text-amber-500 focus:ring-amber-500/50" defaultChecked />
                      Licença Perpétua (Avulsa)
                    </span>
                    <span className="font-bold font-mono text-amber-400 text-xl">R$ 499</span>
                  </div>
                  <p className="text-xs text-white/40 pl-6">Pagamento único. Ideal para agentes estáticos e operações independentes.</p>
                </div>
              </label>

              <label className="cursor-pointer group">
                <div className="w-full p-5 rounded-xl border border-amber-500/30 bg-amber-500/10 flex flex-col hover:bg-amber-500/20 transition-all relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">RECOMENDADO</div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-white text-lg flex items-center gap-2">
                      <input type="radio" name="licenseType" className="text-amber-500 focus:ring-amber-500/50" />
                      Scale Assinatura Mensal
                    </span>
                    <span className="font-bold font-mono text-amber-500 text-xl">R$ 89<span className="text-sm text-white/50">/mês</span></span>
                  </div>
                  <p className="text-xs text-white/40 pl-6">Atualizações contínuas de IA, memória expansiva (RAG) e integrações ERP em tempo real.</p>
                </div>
              </label>
            </div>
            
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowCheckout(false)} className="flex-1 py-3.5 px-4 rounded-xl border border-white/10 hover:bg-white/[0.05] transition-colors font-bold text-sm text-white/60">
                Cancelar
              </button>
              <button 
                onClick={() => router.push('/dashboard/agents')} 
                className="flex-[2] py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:brightness-110 transition-all font-bold text-sm shadow-[0_0_15px_rgba(245,158,11,0.2)] flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" /> Finalizar Pagamento
              </button>
            </div>
          </motion.div>
        </div>
      )}`;

code = code.replace(/    <\/div>\n  \);\n\}/, checkoutModal + '\n    </div>\n  );\n}');

fs.writeFileSync('app/dashboard/agents/new/page.tsx', code);
