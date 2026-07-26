const fs = require('fs');

// 1. Add Marquee animation to global CSS
let css = fs.readFileSync('app/globals.css', 'utf-8');
if (!css.includes('keyframes marquee')) {
  css += `
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.animate-marquee {
  animation: marquee 30s linear infinite;
}
`;
  fs.writeFileSync('app/globals.css', css);
}

// 2. Rewrite Landing Page
const landingCode = `import Link from 'next/link';
import { ArrowRight, BrainCircuit, Activity, Database, Shield, Zap, Check, X as XIcon, GitBranch, Layers, Cpu, Globe, Users, MessageSquare } from 'lucide-react';
import Navbar from '@/components/Navbar';
import SupportChat from '@/components/SupportChat';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#090A0F] text-white flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200 overflow-x-hidden">
      <Navbar />
      <SupportChat />
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-amber-900/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-amber-900/10 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        
        {/* HERO SECTION */}
        <section className="flex flex-col items-center justify-center text-center px-4 sm:px-6 py-24 md:py-40 max-w-6xl mx-auto w-full">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-8 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
             <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
             <span className="text-xs font-bold tracking-widest text-amber-500 uppercase">Hórus OS 2.0 • Enterprise Edition</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter mb-8 leading-[1.05] animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150 text-white">
            A inteligência suprema <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">
              do seu negócio.
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-white/60 font-light max-w-3xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            Muito além de chatbots. Um ecossistema orquestrado por um Nexus Cognitivo que integra CRMs, cria agentes autônomos, gera mídias de alta fidelidade e escala sua operação de forma inteligente.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
            <Link 
              href="/login" 
              className="w-full sm:w-auto px-8 py-4 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-all shadow-[0_0_40px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2 group"
            >
              Implantar Hórus OS <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('open-nexus-chat'))}
              className="w-full sm:w-auto px-8 py-4 bg-white/[0.03] backdrop-blur-xl border border-white/10 text-white font-medium rounded-xl hover:bg-white/[0.08] transition-all flex items-center justify-center"
            >
              Falar com o Nexus
            </button>
          </div>
        </section>

        {/* INFINITE CAROUSEL - INTEGRATIONS */}
        <section className="py-12 border-y border-white/5 bg-black/20 overflow-hidden relative">
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#090A0F] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#090A0F] to-transparent z-10 pointer-events-none"></div>
          <div className="text-center mb-8">
             <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Nativamente Integrado aos Maiores Ecossistemas</span>
          </div>
          <div className="flex w-[200%] md:w-[150%] animate-marquee items-center">
            {/* Duplicated list for infinite effect */}
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex justify-around items-center w-1/2 min-w-max gap-12 sm:gap-24 px-12">
                <div className="text-xl font-black text-white/20 tracking-tighter">SALESFORCE</div>
                <div className="text-xl font-black text-white/20 tracking-tighter">HUBSPOT</div>
                <div className="text-xl font-black text-white/20 tracking-tighter">ZENDESK</div>
                <div className="text-xl font-black text-white/20 tracking-tighter">SHOPIFY</div>
                <div className="text-xl font-black text-white/20 tracking-tighter">STRIPE</div>
                <div className="text-xl font-black text-white/20 tracking-tighter">WHATSAPP API</div>
                <div className="text-xl font-black text-white/20 tracking-tighter">OPENAI</div>
                <div className="text-xl font-black text-white/20 tracking-tighter">ANTHROPIC</div>
              </div>
            ))}
          </div>
        </section>

        {/* NEXUS COGNITIVE CORE ORGANOGRAM */}
        <section className="py-24 md:py-32 px-4 sm:px-6 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 md:mb-24">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">A Arquitetura Nexus</h2>
              <p className="text-lg text-white/50 font-light max-w-2xl mx-auto">Um orquestrador central absoluto. Ele delega tarefas, gerencia a memória global e ativa agentes especialistas instantaneamente.</p>
            </div>

            <div className="relative flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 py-12">
              
              {/* Lines (Desktop) */}
              <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-1 border-t-2 border-dashed border-amber-500/20 z-0"></div>
              
              {/* Left Nodes */}
              <div className="flex flex-col gap-6 md:gap-12 z-10 w-full md:w-64">
                <div className="bg-white/[0.02] border border-white/10 backdrop-blur-xl p-5 rounded-2xl flex items-center gap-4 hover:border-amber-500/30 transition-all shadow-lg">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center"><Database className="w-5 h-5 text-blue-400"/></div>
                  <div><h4 className="font-bold text-sm">Memory Graph</h4><p className="text-[10px] text-white/40">RAG & Vetores</p></div>
                </div>
                <div className="bg-white/[0.02] border border-white/10 backdrop-blur-xl p-5 rounded-2xl flex items-center gap-4 hover:border-amber-500/30 transition-all shadow-lg">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center"><Globe className="w-5 h-5 text-emerald-400"/></div>
                  <div><h4 className="font-bold text-sm">Integrações (APIs)</h4><p className="text-[10px] text-white/40">ERP, Webhooks</p></div>
                </div>
              </div>

              {/* Central Core */}
              <div className="z-10 relative">
                <div className="absolute inset-0 bg-amber-500/20 blur-[60px] rounded-full animate-pulse"></div>
                <div className="w-40 h-40 md:w-56 md:h-56 bg-gradient-to-br from-black to-[#1a1500] border border-amber-500/40 rounded-full flex flex-col items-center justify-center relative shadow-[0_0_60px_rgba(245,158,11,0.2)]">
                  <BrainCircuit className="w-12 h-12 md:w-16 md:h-16 text-amber-400 mb-2" />
                  <span className="font-black text-lg md:text-xl text-white tracking-tight">NEXUS CORE</span>
                  <span className="text-[10px] uppercase tracking-widest text-amber-500">Orchestrator</span>
                </div>
              </div>

              {/* Right Nodes */}
              <div className="flex flex-col gap-6 md:gap-12 z-10 w-full md:w-64">
                <div className="bg-white/[0.02] border border-white/10 backdrop-blur-xl p-5 rounded-2xl flex items-center gap-4 hover:border-amber-500/30 transition-all shadow-lg">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center"><Users className="w-5 h-5 text-purple-400"/></div>
                  <div><h4 className="font-bold text-sm">Agentes Autônomos</h4><p className="text-[10px] text-white/40">Atendimento, Vendas</p></div>
                </div>
                <div className="bg-white/[0.02] border border-white/10 backdrop-blur-xl p-5 rounded-2xl flex items-center gap-4 hover:border-amber-500/30 transition-all shadow-lg">
                  <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center"><Layers className="w-5 h-5 text-rose-400"/></div>
                  <div><h4 className="font-bold text-sm">Studio Criativo</h4><p className="text-[10px] text-white/40">Vídeo, Áudio, Design</p></div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* COMPARISON: CHATBOT VS HORUS */}
        <section className="py-24 bg-white/[0.01] border-y border-white/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">A Era dos Chatbots Acabou.</h2>
              <p className="text-lg text-white/50 font-light max-w-2xl mx-auto">Entenda a diferença entre respostas engessadas e inteligência cognitiva de classe Enterprise.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              
              {/* Traditional Chatbot */}
              <div className="bg-[#090A0F] border border-white/5 rounded-3xl p-8 lg:p-12 shadow-xl opacity-80">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center"><MessageSquare className="w-5 h-5 text-red-500" /></div>
                  <h3 className="text-2xl font-bold text-white/80">Chatbots Tradicionais</h3>
                </div>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <XIcon className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-white/90">Árvores de Decisão Engessadas</h4>
                      <p className="text-sm text-white/50 mt-1">O usuário fica preso em menus numéricos ("Digite 1 para..."), gerando atrito e frustração.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <XIcon className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-white/90">Sem Memória de Longo Prazo</h4>
                      <p className="text-sm text-white/50 mt-1">O bot não lembra o que foi falado há 5 minutos. O cliente precisa repetir os dados exaustivamente.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <XIcon className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-white/90">Incapacidade de Resolução</h4>
                      <p className="text-sm text-white/50 mt-1">Apenas transfere para um humano quando o fluxo sai do script básico programado.</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Hórus OS */}
              <div className="bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/30 rounded-3xl p-8 lg:p-12 shadow-[0_0_50px_rgba(245,158,11,0.1)] relative">
                <div className="absolute top-0 right-0 bg-amber-500 text-black text-xs font-bold px-4 py-1.5 rounded-bl-2xl rounded-tr-3xl uppercase tracking-widest">O Padrão Hórus</div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center"><Zap className="w-5 h-5 text-black" /></div>
                  <h3 className="text-2xl font-bold text-amber-400">Hórus OS Enterprise</h3>
                </div>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <Check className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-white">Compreensão Contextual Profunda</h4>
                      <p className="text-sm text-white/60 mt-1">O Nexus entende áudio, imagens e jargões do seu nicho. Diálogos naturais, sem menus robóticos.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <Check className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-white">Memory Graph Global</h4>
                      <p className="text-sm text-white/60 mt-1">Lembra de todo o histórico do cliente através de vetores. Continua a conversa perfeitamente meses depois.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <Check className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-white">Resolução Autônoma & CRM</h4>
                      <p className="text-sm text-white/60 mt-1">Os agentes negociam, geram links de pagamento, consultam estoques no ERP e fecham vendas sozinhos.</p>
                    </div>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </section>

        {/* DATA METRICS & TRUST */}
        <section className="py-24 px-4 sm:px-6 relative">
          <div className="max-w-6xl mx-auto">
             <div className="grid md:grid-cols-3 gap-6">
                <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-md flex flex-col justify-center text-center">
                  <div className="text-4xl md:text-5xl font-black text-white mb-2">99.9%</div>
                  <div className="text-sm text-white/50 uppercase tracking-widest font-bold">Uptime Garantido SLA</div>
                </div>
                <div className="p-8 rounded-3xl bg-white/[0.02] border border-amber-500/20 backdrop-blur-md flex flex-col justify-center text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent"></div>
                  <div className="text-4xl md:text-5xl font-black text-amber-400 mb-2 relative z-10">&lt; 200ms</div>
                  <div className="text-sm text-amber-500/60 uppercase tracking-widest font-bold relative z-10">Latência do Orquestrador</div>
                </div>
                <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-md flex flex-col justify-center text-center">
                  <div className="text-4xl md:text-5xl font-black text-white mb-2">ISO / LGPD</div>
                  <div className="text-sm text-white/50 uppercase tracking-widest font-bold">Conformidade e Segurança</div>
                </div>
             </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-32 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-amber-500/5"></div>
          <div className="max-w-4xl mx-auto px-6 relative z-10">
            <h2 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-white">Domine o seu mercado.</h2>
            <p className="text-xl md:text-2xl text-amber-400 mb-12 font-light">Assuma o controle da tecnologia que está redefinindo o mundo corporativo.</p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/login" className="px-10 py-5 bg-amber-500 text-black rounded-xl font-bold text-lg hover:bg-amber-400 transition-colors shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                Criar Workspace Gratuito
              </Link>
            </div>
          </div>
        </section>

        {/* Minimal Footer */}
        <footer className="py-12 border-t border-white/10 text-center bg-[#090A0F]">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="inline-flex items-center gap-2">
               <BrainCircuit className="w-5 h-5 text-amber-500" />
               <span className="text-sm font-bold tracking-widest uppercase text-amber-500">Hórus OS</span>
             </div>
             <p className="text-white/30 font-light text-xs">© 2026 Nexus Corp. Arquitetura Proprietária. Todos os direitos reservados.</p>
             <div className="flex gap-6">
               <Link href="/dashboard/terms" className="text-xs font-bold text-white/40 hover:text-white transition-colors">Termos</Link>
               <Link href="/dashboard/lgpd" className="text-xs font-bold text-white/40 hover:text-white transition-colors">Privacidade & LGPD</Link>
             </div>
          </div>
        </footer>

      </div>
    </main>
  );
}
`;

fs.writeFileSync('app/page.tsx', landingCode);
