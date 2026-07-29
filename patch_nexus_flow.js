const fs = require('fs');
let code = fs.readFileSync('app/dashboard/studio/components/NexusDiscoveryFlow.tsx', 'utf8');

// Add state for Payment Modal
code = code.replace(/const \[showPreview, setShowPreview\] = useState\(false\);/, 
  'const [showPreview, setShowPreview] = useState(false);\n  const [showPayment, setShowPayment] = useState(false);'
);

// Replace the Executar button to open the modal
code = code.replace(
  /<button className="p-4 bg-\[#D4AF37\] text-black font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-\[#E5D2A0\] transition-all shadow-\[0_0_20px_rgba\(212,175,55,0\.2\)\] flex flex-col items-center justify-center gap-2">[\s\S]*?<\/button>/,
  `<button onClick={() => setShowPayment(true)} className="p-4 bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-[#E5D2A0] transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] flex flex-col items-center justify-center gap-2">
      <Sparkles className="w-5 h-5" />
      Executar Produção
   </button>`
);

// Add the Modal rendering
const modalJSX = `
            {showPayment && (
              <div className="fixed inset-0 bg-[#080808]/90 z-50 flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in duration-300">
                 <div className="bg-[#101010] border border-[#1C1C1C] rounded-3xl p-8 max-w-md w-full relative">
                    <button onClick={() => setShowPayment(false)} className="absolute top-6 right-6 text-[#FAFAFA]/40 hover:text-[#FAFAFA] text-xs font-bold uppercase tracking-widest">Fechar</button>
                    
                    <div className="text-center mb-8">
                       <Target className="w-8 h-8 text-[#D4AF37] mx-auto mb-4" />
                       <h2 className="text-xl font-light text-[#FAFAFA] tracking-wide mb-2">Liberação de Recursos</h2>
                       <p className="text-xs text-[#FAFAFA]/50 font-light">Este é um projeto pontual e utilizará Hórus Credits™. Escaneie o QR Code via Pix para adicionar créditos e iniciar a produção imediatamente.</p>
                    </div>

                    <div className="bg-[#FAFAFA] p-4 rounded-xl mx-auto w-48 h-48 flex items-center justify-center mb-8">
                       {/* Placeholder for QR Code */}
                       <div className="w-full h-full border-4 border-dashed border-[#1C1C1C]/20 rounded-lg flex items-center justify-center">
                          <span className="text-[#101010] font-bold text-xs uppercase tracking-widest">QR Code Pix</span>
                       </div>
                    </div>

                    <div className="flex justify-between items-center bg-[#141414] p-4 rounded-2xl border border-[#1C1C1C]">
                       <div>
                          <span className="text-[10px] font-bold text-[#FAFAFA]/40 uppercase tracking-widest block mb-1">Custo Estimado</span>
                          <span className="text-lg font-light text-[#D4AF37]">{calculateCredits()} <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]/50">Créditos</span></span>
                       </div>
                       <button className="px-4 py-2 bg-[#D4AF37]/10 text-[#D4AF37] font-bold text-[10px] uppercase tracking-widest rounded-lg border border-[#D4AF37]/20">
                          Pagar Valor Integral
                       </button>
                    </div>
                 </div>
              </div>
            )}
`;

code = code.replace(/<\/div>\n      <\/div>\n    <\/div>/, `${modalJSX}         </div>\n      </div>\n    </div>`);

fs.writeFileSync('app/dashboard/studio/components/NexusDiscoveryFlow.tsx', code);
