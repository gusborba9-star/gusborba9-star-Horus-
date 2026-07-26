const fs = require('fs');

const landingCode = `import Link from 'next/link';
import { ArrowRight, BrainCircuit, Activity, Database, Shield, Zap } from 'lucide-react';
import Navbar from '@/components/Navbar';
import SupportChat from '@/components/SupportChat';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#090A0F] text-white flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      <Navbar />
      <SupportChat />
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-900/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-amber-900/10 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        
        {/* Clean Hero Section */}
        <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-32 md:py-48 max-w-5xl mx-auto w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 mb-8 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
             <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
             <span className="text-xs font-bold tracking-widest text-amber-500 uppercase">Hórus OS 2.0 • Enterprise Edition</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150">
            A infraestrutura <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">
              definitiva de IA.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/50 font-light max-w-2xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            Orquestração cognitiva avançada, CRMs autônomos e estúdios multimodais em um único ecossistema seguro e de altíssima performance.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
            <Link 
              href="/login" 
              className="px-8 py-4 w-full sm:w-auto bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-all shadow-[0_0_30px_rgba(245,158,11,0.2)] flex items-center justify-center gap-2 group"
            >
              Acessar Workspace <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/dashboard/about" 
              className="px-8 py-4 w-full sm:w-auto bg-white/[0.03] backdrop-blur-xl border border-white/10 text-white font-medium rounded-xl hover:bg-white/[0.05] transition-all flex items-center justify-center"
            >
              Conheça a Arquitetura
            </Link>
          </div>
        </section>

        {/* Minimal Features Grid */}
        <section className="py-24 border-t border-white/5 bg-[#090A0F]/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { icon: BrainCircuit, title: "Nexus Core", desc: "Orquestração LLM sem lock-in e fallback automático." },
                { icon: Activity, title: "Alta Performance", desc: "Arquitetura distribuída para baixa latência global." },
                { icon: Database, title: "Memória Vetorial", desc: "RAG profundo com isolamento corporativo absoluto." },
                { icon: Shield, title: "Enterprise Grade", desc: "Conformidade LGPD, criptografia e auditoria rigorosa." }
              ].map((Feature, i) => (
                <div key={i} className="flex flex-col items-center text-center p-6 bg-white/[0.02] backdrop-blur-sm rounded-3xl border border-white/5 hover:border-amber-500/20 hover:bg-white/[0.04] transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
                    <Feature.icon className="w-5 h-5 text-amber-500" />
                  </div>
                  <h3 className="text-white font-bold mb-2">{Feature.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{Feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Minimal Footer */}
        <footer className="py-8 border-t border-white/10 text-center bg-[#090A0F]">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
             <div className="inline-flex items-center gap-2">
               <BrainCircuit className="w-4 h-4 text-amber-500" />
               <span className="text-xs font-bold tracking-widest uppercase text-amber-500">Hórus OS</span>
             </div>
             <p className="text-white/30 font-light text-xs">© 2026 Nexus Corp. Todos os direitos reservados.</p>
             <div className="flex gap-4">
               <Link href="/dashboard/terms" className="text-xs text-white/40 hover:text-white transition-colors">Termos</Link>
               <Link href="/dashboard/lgpd" className="text-xs text-white/40 hover:text-white transition-colors">Privacidade</Link>
             </div>
          </div>
        </footer>

      </div>
    </main>
  );
}
`;

fs.writeFileSync('app/page.tsx', landingCode);
console.log("Landing page rewritten!");
