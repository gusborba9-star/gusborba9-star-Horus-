const fs = require('fs');
let code = fs.readFileSync('app/dashboard/studio/components/NexusDiscoveryFlow.tsx', 'utf8');

// Add to props
code = code.replace(
  /renderPreview\?: \(\) => React\.ReactNode;\n}/,
  'renderPreview?: () => React.ReactNode;\n  isSubscriptionMode?: boolean;\n}'
);

code = code.replace(
  /renderPreview \}: NexusDiscoveryFlowProps\)/,
  'renderPreview, isSubscriptionMode }: NexusDiscoveryFlowProps)'
);

// Modify the calculation and modal based on mode
code = code.replace(
  /const calculateCredits = \(\) => \{[\s\S]*?return Object\.keys\(answers\)\.length \* 150 \+ 500; \n  \};/,
  `const calculateCredits = () => {
    return Object.keys(answers).length * 150 + 500; 
  };
  const calculateSubscription = () => {
    return "149";
  };`
);

// Update investment view
code = code.replace(
  /<span className="text-2xl font-light text-\[#D4AF37\]">\s*\{calculateCredits\(\)\} <span className="text-\[10px\] font-bold uppercase tracking-widest text-\[#D4AF37\]\/50">Créditos Hórus™<\/span>\s*<\/span>/,
  `{isSubscriptionMode ? (
    <span className="text-2xl font-light text-[#D4AF37]">
      R$ {calculateSubscription()} <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]/50">/mês</span>
    </span>
  ) : (
    <span className="text-2xl font-light text-[#D4AF37]">
      {calculateCredits()} <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]/50">Créditos Hórus™</span>
    </span>
  )}`
);

// Update modal
code = code.replace(
  /\{showPayment && \([\s\S]*?Este é um projeto pontual e utilizará Hórus Credits™[\s\S]*?<\/div>\n              <\/div>\n            \)\}/,
  `{showPayment && (
              <div className="fixed inset-0 bg-[#080808]/90 z-50 flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in duration-300">
                 <div className="bg-[#101010] border border-[#1C1C1C] rounded-3xl p-8 max-w-md w-full relative">
                    <button onClick={() => setShowPayment(false)} className="absolute top-6 right-6 text-[#FAFAFA]/40 hover:text-[#FAFAFA] text-xs font-bold uppercase tracking-widest">Fechar</button>
                    
                    <div className="text-center mb-8">
                       <Target className="w-8 h-8 text-[#D4AF37] mx-auto mb-4" />
                       <h2 className="text-xl font-light text-[#FAFAFA] tracking-wide mb-2">
                         {isSubscriptionMode ? 'Operação Contínua' : 'Liberação de Recursos'}
                       </h2>
                       <p className="text-xs text-[#FAFAFA]/50 font-light">
                         {isSubscriptionMode 
                           ? 'Colaboradores Autônomos são infraestruturas persistentes e operam através de Assinaturas Hórus™. Escaneie o QR Code via Pix para ativar a assinatura.' 
                           : 'Este é um projeto pontual e utilizará Hórus Credits™. Escaneie o QR Code via Pix para adicionar créditos e iniciar a produção imediatamente.'}
                       </p>
                    </div>

                    <div className="bg-[#FAFAFA] p-4 rounded-xl mx-auto w-48 h-48 flex items-center justify-center mb-8">
                       <div className="w-full h-full border-4 border-dashed border-[#1C1C1C]/20 rounded-lg flex flex-col items-center justify-center">
                          <span className="text-[#101010] font-bold text-xs uppercase tracking-widest text-center">QR Code Pix</span>
                          {isSubscriptionMode && <span className="text-[#101010]/60 font-bold text-[10px] uppercase tracking-widest text-center mt-1">Assinatura</span>}
                       </div>
                    </div>

                    <div className="flex justify-between items-center bg-[#141414] p-4 rounded-2xl border border-[#1C1C1C]">
                       <div>
                          <span className="text-[10px] font-bold text-[#FAFAFA]/40 uppercase tracking-widest block mb-1">
                             {isSubscriptionMode ? 'Plano Sugerido' : 'Custo Estimado'}
                          </span>
                          {isSubscriptionMode ? (
                            <span className="text-lg font-light text-[#D4AF37]">R$ {calculateSubscription()}<span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]/50">/mês</span></span>
                          ) : (
                            <span className="text-lg font-light text-[#D4AF37]">{calculateCredits()} <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]/50">Créditos</span></span>
                          )}
                       </div>
                       
                       {isSubscriptionMode ? (
                          <div className="text-right">
                             <span className="text-[10px] font-bold text-[#FAFAFA]/40 uppercase tracking-widest block mb-1">Capacidade</span>
                             <span className="text-xs font-bold text-[#FAFAFA]">Nexus Compute</span>
                          </div>
                       ) : (
                          <button className="px-4 py-2 bg-[#D4AF37]/10 text-[#D4AF37] font-bold text-[10px] uppercase tracking-widest rounded-lg border border-[#D4AF37]/20 hover:bg-[#D4AF37]/20 transition-colors">
                             Pagar Valor Integral
                          </button>
                       )}
                    </div>
                 </div>
              </div>
            )}`
);

fs.writeFileSync('app/dashboard/studio/components/NexusDiscoveryFlow.tsx', code);
