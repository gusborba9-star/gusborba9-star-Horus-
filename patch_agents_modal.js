const fs = require('fs');
let code = fs.readFileSync('app/dashboard/agents/page.tsx', 'utf8');

// Add state for Subscription Modal
code = code.replace(/const \[activeTab, setActiveTab\] = useState\('nexus'\);/, 
  'const [activeTab, setActiveTab] = useState(\'nexus\');\n  const [showSubscription, setShowSubscription] = useState(false);'
);

// Replace Implantar Colaborador™ button to open the modal
code = code.replace(
  /<button className="w-full py-4 bg-\[#141414\] border border-\[#D4AF37\]\/20 text-\[#D4AF37\] font-bold rounded-2xl text-sm hover:bg-\[#D4AF37\] hover:text-black transition-all shadow-\[0_0_20px_rgba\(212,175,55,0\.1\)\] hover:shadow-\[0_0_30px_rgba\(212,175,55,0\.3\)\] flex items-center justify-center gap-2 group">[\s\S]*?<\/button>/,
  `<button onClick={() => setShowSubscription(true)} className="w-full py-4 bg-[#141414] border border-[#D4AF37]/20 text-[#D4AF37] font-bold rounded-2xl text-sm hover:bg-[#D4AF37] hover:text-black transition-all shadow-[0_0_20px_rgba(212,175,55,0.1)] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] flex items-center justify-center gap-2 group">
      <Bot className="w-4 h-4 group-hover:scale-110 transition-transform" /> Implantar Colaborador™
   </button>`
);

// Add the Modal rendering
const modalJSX = `
            {showSubscription && (
              <div className="fixed inset-0 bg-[#080808]/90 z-50 flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in duration-300">
                 <div className="bg-[#101010] border border-[#1C1C1C] rounded-3xl p-8 max-w-md w-full relative">
                    <button onClick={() => setShowSubscription(false)} className="absolute top-6 right-6 text-[#FAFAFA]/40 hover:text-[#FAFAFA] text-xs font-bold uppercase tracking-widest">Fechar</button>
                    
                    <div className="text-center mb-8">
                       <Bot className="w-8 h-8 text-[#D4AF37] mx-auto mb-4" />
                       <h2 className="text-xl font-light text-[#FAFAFA] tracking-wide mb-2">Operação Contínua</h2>
                       <p className="text-xs text-[#FAFAFA]/50 font-light">Colaboradores Autônomos são infraestruturas persistentes e operam através de Assinaturas Hórus™. Escaneie o QR Code via Pix para ativar a assinatura deste agente.</p>
                    </div>

                    <div className="bg-[#FAFAFA] p-4 rounded-xl mx-auto w-48 h-48 flex items-center justify-center mb-8">
                       <div className="w-full h-full border-4 border-dashed border-[#1C1C1C]/20 rounded-lg flex items-center justify-center">
                          <span className="text-[#101010] font-bold text-xs uppercase tracking-widest text-center">QR Code Pix<br/>Assinatura</span>
                       </div>
                    </div>

                    <div className="flex justify-between items-center bg-[#141414] p-4 rounded-2xl border border-[#1C1C1C]">
                       <div>
                          <span className="text-[10px] font-bold text-[#FAFAFA]/40 uppercase tracking-widest block mb-1">Plano Sugerido</span>
                          <span className="text-lg font-light text-[#D4AF37]">R$ 149<span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]/50">/mês</span></span>
                       </div>
                       <div className="text-right">
                          <span className="text-[10px] font-bold text-[#FAFAFA]/40 uppercase tracking-widest block mb-1">Capacidade</span>
                          <span className="text-xs font-bold text-[#FAFAFA]">Nexus Compute</span>
                       </div>
                    </div>
                 </div>
              </div>
            )}
`;

code = code.replace(/<\/div>\n      <\/div>\n    <\/div>/, `${modalJSX}         </div>\n      </div>\n    </div>`);

fs.writeFileSync('app/dashboard/agents/page.tsx', code);
