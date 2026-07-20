'use client';

import { motion } from 'motion/react';
import { Bot, ChevronRight, Zap } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 w-fit mb-8"
          >
            <Zap className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-cyan-400">Powered by Hórus OS & Nexus</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold font-display leading-[1.1] tracking-tight mb-6 max-w-4xl"
          >
            O Sistema Operacional Cognitivo Definitivo.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
              Agentes Polimórficos.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-white/50 leading-relaxed max-w-2xl mb-10"
          >
            Implante uma força de trabalho digital autônoma capaz de operar vendas, atendimento e cobranças (Efí) em qualquer nicho. Governado pela inteligência superior do Nexus.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="/dashboard" className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl font-bold shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all">
              <span>Acessar Painel Hórus</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border border-white/10 hover:bg-white/5 text-white rounded-xl font-bold transition-all">
              <Bot className="w-5 h-5" />
              <span>Ver agente em ação</span>
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
