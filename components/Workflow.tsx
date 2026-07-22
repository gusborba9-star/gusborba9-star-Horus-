'use client';

import { motion } from 'motion/react';
import { FileText, Cpu, Rocket } from 'lucide-react';

const steps = [
  {
    step: '01',
    title: 'Dois Modos de Configuração',
    description: 'Manual via painel guiado (nicho, tom de voz, escopo) ou Automática/Injeção via APIs, ERPs, uploads de manuais, links e arquivos de apoio.',
    icon: FileText,
  },
  {
    step: '02',
    title: 'Calibração Nexus (Engenharia)',
    description: 'Após a confirmação, nossos engenheiros preparam e orquestram a memória vetorial. Prazo máximo de até 24h para liberação das credenciais.',
    icon: Cpu,
  },
  {
    step: '03',
    title: 'Implantação em Minutos',
    description: 'Com o painel liberado, integre seu agente Hórus OS aos canais (WhatsApp, Webhooks, CRMs) instantaneamente, em poucos cliques.',
    icon: Rocket,
  },
];

export default function Workflow() {
  return (
    <section className="py-24 relative overflow-hidden" id="como-funciona">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-5xl font-bold font-display mb-6">
              Em operação total em <br />
              <span className="text-cyan-400">até 24 horas</span>
            </h2>
            <p className="text-white/50 text-lg mb-8">
              A curadoria técnica dos nossos engenheiros garante que seu agente cognitivo chegue ao painel pronto para operar de forma polimórfica e inteligente.
            </p>
            <div className="space-y-8">
              {steps.map((item, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex gap-6"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center font-mono text-cyan-400 font-bold">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-white/40">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="lg:w-1/2 w-full">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#050505] aspect-square md:aspect-video lg:aspect-square flex items-center justify-center shadow-[0_0_50px_rgba(34,211,238,0.1)]"
            >
              {/* Decorative elements representing the UI */}
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-blue-600/10" />
              <div className="relative w-3/4 h-3/4 flex flex-col gap-4">
                <div className="w-full h-12 bg-white/5 rounded-xl border border-white/10 animate-pulse flex items-center justify-between px-4">
                  <div className="w-1/3 h-3 bg-white/20 rounded-full" />
                  <div className="text-[10px] text-white/30 font-mono uppercase tracking-widest">Nexus_Configurator</div>
                </div>
                <div className="w-full flex-1 bg-white/5 rounded-xl border border-white/10 p-6 flex flex-col gap-4 relative overflow-hidden font-mono text-xs">
                  <div className="w-2/3 h-16 bg-white/5 rounded-2xl rounded-tl-none self-start border border-white/5 p-3 text-cyan-400">&gt; Injetando dados ERP e Memory Graph...</div>
                  <div className="w-2/3 h-12 bg-cyan-500/20 text-cyan-200 rounded-2xl rounded-tr-none self-end border border-cyan-500/20 p-3 text-right">[OK] Calibrado</div>
                  <div className="w-1/2 h-16 bg-white/5 rounded-2xl rounded-tl-none self-start border border-white/5 p-3 text-white/40">&gt; Credenciais do Painel Geradas.</div>
                  <div className="absolute bottom-4 left-6 right-6 h-10 bg-white/5 rounded-full border border-white/10 flex items-center px-4">
                     <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
