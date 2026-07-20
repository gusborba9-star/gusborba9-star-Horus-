'use client';

import { use } from 'react';
import { BrainCircuit, Activity, Settings, ArrowLeft, MessageSquare, Webhook, Zap, Clock, ShieldCheck } from 'lucide-react';
import BackButton from '@/components/BackButton';

const agentsData: Record<string, any> = {
  maria: {
    name: 'Maria',
    role: 'Atendente MVP',
    status: 'online',
    description: 'Especialista em agendamentos, pagamentos via Stripe e suporte inicial via WhatsApp.',
    confidence: 98.5,
    memoryNodes: 15420,
    uptime: '99.9%',
    avgResponseTime: '1.2s'
  },
  nexus: {
    name: 'Nexus',
    role: 'Gerente IA',
    status: 'online',
    description: 'Orquestrador central. Avalia confiança e audita outros agentes.',
    confidence: 99.9,
    memoryNodes: 1024500,
    uptime: '100%',
    avgResponseTime: '0.4s'
  }
};

export default function AgentDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const agent = agentsData[resolvedParams.id] || agentsData['maria'];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <BackButton label="Voltar para Funcionários" fallbackHref="/dashboard/agents" />
      
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Profile Sidebar */}
        <div className="w-full md:w-80 space-y-6 shrink-0">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
            <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center font-bold text-4xl text-cyan-400 mb-4">
              {agent.name[0]}
            </div>
            <h1 className="text-2xl font-bold">{agent.name}</h1>
            <p className="text-white/50">{agent.role}</p>
            
            <div className="mt-6 flex justify-center gap-2">
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {agent.status}
              </span>
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
            <h3 className="font-semibold border-b border-white/10 pb-2 text-sm uppercase tracking-wider text-white/40">Métricas Principais</h3>
            
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Confiança</span>
              <span className="font-mono text-emerald-400">{agent.confidence}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm flex items-center gap-2"><BrainCircuit className="w-4 h-4" /> Nós de Memória</span>
              <span className="font-mono">{agent.memoryNodes.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm flex items-center gap-2"><Clock className="w-4 h-4" /> Uptime</span>
              <span className="font-mono">{agent.uptime}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm flex items-center gap-2"><Zap className="w-4 h-4" /> Resposta</span>
              <span className="font-mono">{agent.avgResponseTime}</span>
            </div>
          </div>
        </div>
        
        {/* Main Workspace */}
        <div className="flex-1 space-y-6 w-full">
          {/* Tabs - mock visually */}
          <div className="flex gap-1 border-b border-white/10">
            <button className="px-4 py-2 border-b-2 border-cyan-400 text-cyan-400 font-medium">Fluxo de Trabalho</button>
            <button className="px-4 py-2 text-white/50 hover:text-white font-medium">Memória (Graph)</button>
            <button className="px-4 py-2 text-white/50 hover:text-white font-medium">Logs de Execução</button>
            <button className="px-4 py-2 text-white/50 hover:text-white font-medium">Configurações</button>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Pipeline de Execução Atual</h2>
            
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
              {/* Timeline Items */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-cyan-500/50 bg-cyan-500/10 text-cyan-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_10px_rgba(34,211,238,0.2)] z-10">
                  <Webhook className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/10 bg-white/5">
                  <div className="text-xs text-cyan-400 font-bold tracking-wider uppercase mb-1">Gatilho</div>
                  <div className="font-medium">Mensagem via WhatsApp</div>
                  <div className="text-sm text-white/50 mt-1">Conector genérico recebeu payload do cliente.</div>
                </div>
              </div>
              
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 bg-black text-white/60 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/10 bg-black/50">
                  <div className="text-xs text-white/40 font-bold tracking-wider uppercase mb-1">Análise</div>
                  <div className="font-medium text-white/80">Recuperação de Contexto (pg_vector)</div>
                  <div className="text-sm text-white/50 mt-1">Aguardando gatilho para buscar histórico do cliente.</div>
                </div>
              </div>
              
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 bg-black text-white/60 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/10 bg-black/50">
                  <div className="text-xs text-white/40 font-bold tracking-wider uppercase mb-1">Decisão (LangGraph)</div>
                  <div className="font-medium text-white/80">Roteamento de Intenção</div>
                  <div className="text-sm text-white/50 mt-1">Aguardando contexto para acionar Agent node.</div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
