const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

// Replace lucide-react imports
const importMatch = /import {([\s\S]*?)} from 'lucide-react';/;
if (code.match(importMatch)) {
  code = code.replace(importMatch, "import { BrainCircuit, ChevronRight, Sparkles, Activity, Server, Network, Shield, ArrowRight, MessageSquare, X, Check } from 'lucide-react';");
}

const sections = `      {/* Sovereignty / Comparison Section */}
      <section className="py-32 relative z-10 border-t border-white/5 bg-[#050508]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
             <h2 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-4 drop-shadow-[0_0_10px_rgba(190,158,108,0.5)]">Soberania Hórus</h2>
             <h3 className="text-3xl md:text-5xl font-light text-white mb-6">Assistentes reagem. <br/> O Hórus orquestra.</h3>
             <p className="text-white/50 max-w-2xl mx-auto font-light leading-relaxed">Chatbots convencionais aguardam seus comandos. O ecossistema Hórus é proativo, tomando decisões complexas baseadas no histórico completo da sua operação corporativa.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
             {/* Chatbot Column */}
             <div className="bg-[#0A0A0C] p-12 border-b lg:border-b-0 lg:border-r border-white/5">
                <div className="flex items-center gap-4 mb-10">
                   <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                      <MessageSquare className="w-6 h-6 text-white/40" />
                   </div>
                   <h4 className="text-2xl font-light text-white/50">Chatbots Comuns</h4>
                </div>
                <ul className="space-y-6">
                   <li className="flex items-start gap-4 opacity-50">
                      <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-0.5"><X className="w-3 h-3 text-white/40" /></div>
                      <div>
                         <p className="text-white font-medium mb-1">Totalmente Reativos</p>
                         <p className="text-white/60 text-sm font-light">Só executam ações quando você os provoca através de prompts textuais manuais repetitivos.</p>
                      </div>
                   </li>
                   <li className="flex items-start gap-4 opacity-50">
                      <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-0.5"><X className="w-3 h-3 text-white/40" /></div>
                      <div>
                         <p className="text-white font-medium mb-1">Amnésia de Contexto</p>
                         <p className="text-white/60 text-sm font-light">Esquecem informações passadas ao iniciar um novo chat. Não entendem a estrutura da sua empresa.</p>
                      </div>
                   </li>
                   <li className="flex items-start gap-4 opacity-50">
                      <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-0.5"><X className="w-3 h-3 text-white/40" /></div>
                      <div>
                         <p className="text-white font-medium mb-1">Ferramenta Isolada</p>
                         <p className="text-white/60 text-sm font-light">Eles não conectam departamentos. São apenas caixas de texto soltas no navegador do usuário.</p>
                      </div>
                   </li>
                </ul>
             </div>

             {/* Horus Column */}
             <div className="bg-gradient-to-br from-amber-500/5 to-transparent p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none"></div>
                <div className="flex items-center gap-4 mb-10 relative z-10">
                   <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/30 shadow-[0_0_20px_rgba(190,158,108,0.2)]">
                      <BrainCircuit className="w-6 h-6 text-amber-500" />
                   </div>
                   <h4 className="text-2xl font-bold text-amber-500 drop-shadow-[0_0_10px_rgba(190,158,108,0.3)]">Hórus OS</h4>
                </div>
                <ul className="space-y-6 relative z-10">
                   <li className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5"><Check className="w-3 h-3 text-amber-400" /></div>
                      <div>
                         <p className="text-amber-100 font-medium mb-1">Agentes Autônomos em Rede</p>
                         <p className="text-white/50 text-sm font-light">Departamentos inteiros operando 24/7 de forma colaborativa, despachando tarefas, e-mails e integrações de forma autônoma.</p>
                      </div>
                   </li>
                   <li className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5"><Check className="w-3 h-3 text-amber-400" /></div>
                      <div>
                         <p className="text-amber-100 font-medium mb-1">Memória Vetorial Absoluta</p>
                         <p className="text-white/50 text-sm font-light">O Hórus unifica todos os dados. Ele lembra da reunião de ontem e utiliza esse contexto para prever e executar o fluxo de amanhã.</p>
                      </div>
                   </li>
                   <li className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5"><Check className="w-3 h-3 text-amber-400" /></div>
                      <div>
                         <p className="text-amber-100 font-medium mb-1">Infraestrutura Escalonável</p>
                         <p className="text-white/50 text-sm font-light">Muito além de gerar texto. O Hórus compila softwares, provisiona bancos de dados, cria designs e domina ecossistemas inteiros.</p>
                      </div>
                   </li>
                </ul>
             </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 relative z-10 bg-[#0A0A0C]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-20">
             <h2 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-4 drop-shadow-[0_0_10px_rgba(190,158,108,0.5)]">Conhecimento Core</h2>
             <h3 className="text-3xl md:text-5xl font-light text-white mb-6">Visão & Estrutura</h3>
             <p className="text-white/50 font-light max-w-2xl mx-auto">Compreenda a filosofia e o motor por trás do Sistema Operacional Cognitivo Hórus.</p>
          </div>

          <div className="space-y-6">
             <div className="glass-panel p-8 rounded-3xl border border-white/5 hover:border-amber-500/30 transition-colors">
                <h3 className="text-xl font-medium text-white mb-3">Qual a diferença entre o Hórus e ferramentas como o ChatGPT?</h3>
                <p className="text-white/50 font-light leading-relaxed">
                   Enquanto a maioria das IA conversacionais funciona como uma interface reativa isolada, o Hórus OS é uma <strong>infraestrutura de agentes autônomos</strong>. No Hórus, você provisiona funcionários digitais (Agente de Vendas, Consultor Financeiro, Engenheiro de Software) que operam em background, com acesso direto a bancos de dados corporativos e integrações profundas com seus sistemas atuais.
                </p>
             </div>
             <div className="glass-panel p-8 rounded-3xl border border-white/5 hover:border-amber-500/30 transition-colors">
                <h3 className="text-xl font-medium text-white mb-3">Como funciona a privacidade de dados da minha empresa?</h3>
                <p className="text-white/50 font-light leading-relaxed">
                   Nossa arquitetura prioriza a Governança Enterprise absoluta. Cada instância possui um silo de memória vetorial privada (Memory Graph). Os dados são indexados e utilizados exclusivamente para a <em>sua</em> operação. Nossas rigorosas diretrizes garantem que suas informações corporativas jamais serão utilizadas para treinar modelos de inteligência artificiais abertos.
                </p>
             </div>
             <div className="glass-panel p-8 rounded-3xl border border-white/5 hover:border-amber-500/30 transition-colors">
                <h3 className="text-xl font-medium text-white mb-3">O Hórus pode criar aplicações de software reais?</h3>
                <p className="text-white/50 font-light leading-relaxed">
                   Sim. Diferente de plataformas que apenas geram blocos de código estáticos, o módulo <strong>Studio Hórus</strong> atua como um laboratório de engenharia autônomo end-to-end. O orquestrador Nexus arquitetará sua aplicação, alocará a capacidade computacional ideal, compilará o código de forma isolada e entregará seu software rodando perfeitamente online.
                </p>
             </div>
             <div className="glass-panel p-8 rounded-3xl border border-white/5 hover:border-amber-500/30 transition-colors">
                <h3 className="text-xl font-medium text-white mb-3">O que significa "Orquestração Agnóstica"?</h3>
                <p className="text-white/50 font-light leading-relaxed">
                   Significa que sua empresa nunca ficará refém de uma tecnologia obsoleta. O motor cognitivo avalia a complexidade de cada instrução em tempo real e roteia a carga de processamento para o modelo fundacional mais potente e eficiente disponível no mercado, otimizando velocidade e precisão de forma invisível para o usuário final.
                </p>
             </div>
          </div>
        </div>
      </section>
`;

code = code.replace(/\{\/\* Premium Footer \*\/\}/, sections + '\n\n      {/* Premium Footer */}');

fs.writeFileSync('app/page.tsx', code);
