'use client';

import { motion } from 'motion/react';
import { Check, Shield, Zap, Infinity, QrCode, Link as LinkIcon, Database } from 'lucide-react';
import Link from 'next/link';

export default function Pricing() {
  return (
    <section id="precos" className="py-24 bg-[#050505] relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Pre-Checkout Onboarding Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20 bg-gradient-to-r from-cyan-500/10 via-black to-cyan-500/5 border border-cyan-500/20 rounded-3xl p-8 md:p-12"
        >
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 font-display text-white">Integração Ultra-Rápida em 30 Minutos</h3>
            <p className="text-white/60">
              Logo após a confirmação do pagamento, você é direcionado para nosso painel 1-Click. Sem dependência de TI, sem código. O Hórus OS assume imediatamente.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-6 border border-cyan-500/30">
                <QrCode className="w-8 h-8 text-cyan-400" />
              </div>
              <h4 className="font-bold text-lg mb-2">1. Conexão Imediata</h4>
              <p className="text-sm text-white/50">Escaneie o QR Code dinâmico do WhatsApp ou copie o link do Webchat. Seu canal fica ativo na hora.</p>
            </div>
            <div className="flex flex-col items-center text-center relative">
              <div className="hidden md:block absolute top-8 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent -z-10"></div>
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-6 border border-cyan-500/30">
                <Database className="w-8 h-8 text-cyan-400" />
              </div>
              <h4 className="font-bold text-lg mb-2">2. Injeção de DNA</h4>
              <p className="text-sm text-white/50">Defina seu Nicho, Tom de Voz e Regras via painel no-code ou sincronize com seu sistema atual.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-6 border border-cyan-500/30">
                <Zap className="w-8 h-8 text-cyan-400" />
              </div>
              <h4 className="font-bold text-lg mb-2">3. Orquestração Ativa</h4>
              <p className="text-sm text-white/50">O agente assume o atendimento, captação e vendas em piloto automático, 24 horas por dia.</p>
            </div>
          </div>
        </motion.div>

        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-6"
          >
            <Zap className="w-4 h-4" />
            Monetização Escalonável
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold font-display tracking-tight mb-6"
          >
            Invista na Evolução do seu Negócio
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/60"
          >
            Planos transparentes para empresas que exigem performance máxima e agentes inteligentes de alta disponibilidade.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Starter Plan */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm flex flex-col"
          >
            <div className="text-white/50 font-bold tracking-wider uppercase text-sm mb-2">Essential</div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-4xl font-bold">R$ 497,00</span>
              <span className="text-white/50">/mês</span>
            </div>
            <div className="text-sm font-medium text-cyan-400/80 mb-6">+ R$ 599,00 (Taxa de Setup por Agente)</div>
            <p className="text-white/60 text-sm mb-8">Para pequenos negócios automatizando o primeiro canal.</p>
            
            <ul className="space-y-4 mb-8 flex-1">
              <FeatureItem text="Exatamente 1 Agente Digital Hórus" />
              <FeatureItem text="1 Canal (WhatsApp ou Web)" />
              <FeatureItem text="Interações Ilimitadas" highlight />
              <FeatureItem text="Configuração Manual (No-Code)" />
              <FeatureItem text="Motor Financeiro (Pix Integrado)" />
              <FeatureItem text="Suporte Especializado" />
            </ul>
            
            <div className="space-y-3 mt-auto">
              <Link href="/login" className="block w-full py-3 px-4 rounded-xl border border-cyan-500/50 bg-cyan-500/10 text-cyan-400 text-center font-bold hover:bg-cyan-500/20 transition-colors">
                Assinar Agora (Checkout Rápido)
              </Link>
              <button onClick={() => window.dispatchEvent(new CustomEvent('open-nexus-chat', { detail: { plan: 'Essential' } }))} className="block w-full py-3 px-4 rounded-xl border border-white/10 text-white/70 text-center font-bold hover:bg-white/5 transition-colors">
                Tirar Dúvidas com o Nexus (IA)
              </button>
            </div>
          </motion.div>

          {/* Pro Plan (Highlighted) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-b from-cyan-500/20 to-black border-2 border-cyan-500 rounded-2xl p-8 backdrop-blur-sm relative flex flex-col"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-cyan-500 text-black text-xs font-bold uppercase tracking-wider rounded-full">
              Mais Popular
            </div>
            <div className="text-cyan-400 font-bold tracking-wider uppercase text-sm mb-2">Scale (Pro)</div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-5xl font-bold">R$ 1.297,00</span>
              <span className="text-white/50">/mês</span>
            </div>
            <div className="text-sm font-medium text-cyan-400 mb-6">+ R$ 599,00 (Taxa de Setup por Agente)</div>
            <p className="text-white/80 text-sm mb-8">Para operações em escala que exigem orquestração complexa.</p>
            
            <ul className="space-y-4 mb-8 flex-1">
              <FeatureItem text="Até 4 Agentes Digitais" highlight />
              <FeatureItem text="Omnichannel (WhatsApp, Web, IG)" />
              <FeatureItem text="Interações Ilimitadas" highlight />
              <FeatureItem text="Hórus Orchestrator (Nexus)" />
              <FeatureItem text="Integração ERP/CRM (1-Click)" />
              <FeatureItem text="CRM Interno & Memory Graph" />
            </ul>
            
            <div className="space-y-3 mt-auto">
              <Link href="/login" className="block w-full py-4 px-4 bg-cyan-500 hover:bg-cyan-400 text-black text-center rounded-xl font-bold shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all">
                Assinar Plano Scale
              </Link>
              <button onClick={() => window.dispatchEvent(new CustomEvent('open-nexus-chat', { detail: { plan: 'Scale' } }))} className="block w-full py-3 px-4 rounded-xl border border-cyan-500/30 text-cyan-300 text-center font-bold hover:bg-cyan-500/10 transition-colors">
                Tirar Dúvidas com o Nexus (IA)
              </button>
            </div>
          </motion.div>

          {/* Enterprise Plan */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm flex flex-col"
          >
            <div className="text-white/50 font-bold tracking-wider uppercase text-sm mb-2">Enterprise</div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-4xl font-bold">Sob Demanda</span>
            </div>
            <div className="text-sm font-medium text-white/40 mb-6">Proposta Dinâmica (Via Nexus)</div>
            <p className="text-white/60 text-sm mb-8">Arquitetura dedicada para corporações e infraestrutura Palantir-like.</p>
            
            <ul className="space-y-4 mb-8 flex-1">
              <FeatureItem text="Agentes Infinitos" highlight />
              <FeatureItem text="Cluster Privado" />
              <FeatureItem text="Interações Ilimitadas" />
              <FeatureItem text="Cognição Adaptativa Nível Palantir" />
              <FeatureItem text="SLA de 99.99% & Account Manager" />
              <FeatureItem text="Integrações Ilimitadas (APIs, Webhooks)" />
              <FeatureItem text="Add-ons: Agentes Multimodais" />
            </ul>
            
            <div className="space-y-3 mt-auto">
              <button onClick={() => window.dispatchEvent(new CustomEvent('open-nexus-chat', { detail: { plan: 'Enterprise' } }))} className="block w-full py-3 px-4 rounded-xl bg-white text-black text-center font-bold hover:bg-gray-200 transition-colors">
                Falar com Consultor
              </button>
              <button onClick={() => window.dispatchEvent(new CustomEvent('open-nexus-chat', { detail: { plan: 'Enterprise' } }))} className="block w-full py-3 px-4 rounded-xl border border-white/10 text-white/70 text-center font-bold hover:bg-white/5 transition-colors">
                Tirar Dúvidas com o Nexus (IA)
              </button>
            </div>
          </motion.div>
        </div>
        
        <div className="mt-12 text-center text-white/40 text-sm">
          <p>Módulos avançados de Vídeo, Áudio e Código operam sob Add-ons de Pacotes de Créditos (Tokens).</p>
        </div>
      </div>
    </section>
  );
}

function FeatureItem({ text, highlight = false }: { text: string; highlight?: boolean }) {
  return (
    <li className="flex items-start gap-3">
      {highlight ? (
        <Infinity className="w-5 h-5 text-cyan-400 shrink-0" />
      ) : (
        <Check className="w-5 h-5 text-cyan-400 shrink-0" />
      )}
      <span className={highlight ? "text-white font-bold" : "text-white/80 text-sm"}>{text}</span>
    </li>
  );
}

