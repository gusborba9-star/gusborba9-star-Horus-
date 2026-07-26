const fs = require('fs');
let code = fs.readFileSync('app/dashboard/agents/new/page.tsx', 'utf-8');

// I also need to make sure I import FileText
if (!code.includes('FileText')) {
  code = code.replace("import { BrainCircuit", "import { FileText, BrainCircuit");
}

code = code.replace(
  /\{step === 4 && \([\s\S]*?\}\)\}/,
  `{step === 4 && (
                 <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                       <div className="border border-white/10 rounded-2xl p-6 md:p-8 bg-white/5 hover:border-amber-500/50 hover:bg-amber-500/5 transition-colors cursor-pointer text-center flex flex-col items-center justify-center group">
                          <Database className="w-8 h-8 md:w-10 md:h-10 text-white/30 mb-3 group-hover:text-amber-400 transition-colors" />
                          <h3 className="font-bold text-sm md:text-base text-white mb-1">Upload de Arquivos</h3>
                          <p className="text-xs md:text-sm text-white/50">PDFs, planilhas, documentações corporativas</p>
                       </div>
                       <div className="border border-amber-500/50 rounded-2xl p-6 md:p-8 bg-amber-500/5 transition-colors cursor-pointer text-center flex flex-col items-center justify-center relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-2"><span className="text-[9px] bg-amber-500 text-black px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">Recomendado</span></div>
                          <FileText className="w-8 h-8 md:w-10 md:h-10 text-amber-500 mb-3" />
                          <h3 className="font-bold text-sm md:text-base text-amber-100 mb-1">Configuração Manual</h3>
                          <p className="text-xs md:text-sm text-white/60">Preencher base de conhecimento manualmente</p>
                       </div>
                    </div>
                    
                    <div className="space-y-4 border-t border-white/10 pt-6">
                       <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Base de Conhecimento Rápida</h4>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Horário de Atendimento</label>
                            <input type="text" placeholder="Ex: Seg a Sex, 09h às 18h" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500/50 transition-colors text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Tabela de Preços (URL ou Resumo)</label>
                            <input type="text" placeholder="Ex: Plano Básico R$99..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500/50 transition-colors text-sm" />
                          </div>
                       </div>
                       <div>
                         <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Regras de Negócio e FAQ</label>
                         <textarea placeholder="Ex: Aceitamos devolução até 7 dias. Não cobrimos frete de troca. Desconto máximo permitido: 15%." className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-amber-500/50 transition-colors resize-none text-sm custom-scrollbar"></textarea>
                       </div>
                    </div>
                 </div>
               )}`
);

fs.writeFileSync('app/dashboard/agents/new/page.tsx', code);
