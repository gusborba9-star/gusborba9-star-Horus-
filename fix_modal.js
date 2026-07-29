const fs = require('fs');
let code = fs.readFileSync('app/dashboard/studio/components/NexusDiscoveryFlow.tsx', 'utf8');

const oldText = `{isSubscriptionMode 
                            ? 'Sua operação utilizará a capacidade da sua assinatura corporativa. Confirme para iniciar o provisionamento.' 
                            : 'Este é um projeto pontual e utilizará Hórus Credits™. Escaneie o QR Code via Pix para adicionar créditos e iniciar a produção imediatamente.'}`;

const newText = `{isSubscriptionMode 
                            ? 'Sua operação utilizará a capacidade da sua assinatura corporativa. O Nexus finalizará a configuração estrutural em minutos, porém possuirá até 24 horas para a entrega definitiva e calibração operacional. Confirme para iniciar o provisionamento.' 
                            : 'Este projeto pontual utilizará Hórus Credits™. O Nexus possuirá até 24 horas para a entrega definitiva e calibração operacional. Escaneie o QR Code via Pix para adicionar créditos e iniciar a produção imediatamente.'}`;

code = code.replace(oldText, newText);
fs.writeFileSync('app/dashboard/studio/components/NexusDiscoveryFlow.tsx', code);
