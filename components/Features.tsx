'use client';

import { motion } from 'motion/react';
import { MessageSquare, Clock, TrendingUp, ShieldCheck, Zap, BarChart3 } from 'lucide-react';

const features = [
  {
    title: 'Atendimento Omnichannel',
    description: 'Conecte WhatsApp, Instagram e Site em um só lugar. O agente responde onde o cliente estiver.',
    icon: MessageSquare,
  },
  {
    title: 'Disponibilidade 24/7',
    description: 'Feriados, madrugadas ou finais de semana. Seu negócio nunca para de vender.',
    icon: Clock,
  },
  {
    title: 'Qualificação Automática',
    description: 'O agente faz as perguntas certas e envia para o CRM apenas leads prontos para comprar.',
    icon: TrendingUp,
  },
  {
    title: 'Integração Nativa',
    description: 'Conecta com as principais ferramentas do mercado: Hubspot, RD Station, ActiveCampaign e mais.',
    icon: Zap,
  },
  {
    title: 'Análise de Sentimento',
    description: 'A IA entende o tom do cliente e adapta a resposta, podendo transferir para um humano se houver atrito.',
    icon: BarChart3,
  },
  {
    title: 'Segurança e LGPD',
    description: 'Dados criptografados de ponta a ponta, com total conformidade com a LGPD.',
    icon: ShieldCheck,
  },
];

export default function Features() {
  return (
    <section className="py-24 relative" id="recursos">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold font-display mb-6">
            Uma operação <span className="text-cyan-400">inteligente</span>
          </h2>
          <p className="text-white/40 text-lg max-w-2xl mx-auto">
            Substitua fluxos de chatbot robóticos por uma IA conversacional que entende contexto, resolve problemas e fecha vendas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group flex flex-col gap-3"
            >
              <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="font-bold text-white">{feature.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
