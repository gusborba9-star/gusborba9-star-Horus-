'use client';

import { Users, Plus, BrainCircuit, Activity, Settings2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function AgentsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Funcionários Digitais</h1>
          <p className="text-white/50 mt-1">Gerencie a força de trabalho da sua Agência de Empregos Digitais Universal.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          Contratar Novo Funcionário
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AgentCard 
          id="maria"
          name="Maria"
          role="Atendente MVP"
          status="online"
          tasksCompleted={1420}
          confidenceScore={98.5}
          description="Especialista em agendamentos, pagamentos via Stripe e suporte inicial via WhatsApp."
          tags={['WhatsApp', 'Stripe', 'Agendamento']}
        />
        <AgentCard 
          id="caleb"
          name="Caleb"
          role="SDR Outbound"
          status="online"
          tasksCompleted={8392}
          confidenceScore={94.2}
          description="Geração de leads frios, qualificação e marcação de reuniões de vendas."
          tags={['Email', 'LinkedIn', 'CRM']}
        />
        <AgentCard 
          id="sophia"
          name="Sophia"
          role="Customer Success"
          status="online"
          tasksCompleted={530}
          confidenceScore={99.1}
          description="Monitoramento de saúde do cliente, onboarding e prevenção de churn."
          tags={['NPS', 'Onboarding', 'Retenção']}
        />
        <AgentCard 
          id="nexus"
          name="Nexus"
          role="Gerente IA"
          status="online"
          tasksCompleted={102340}
          confidenceScore={99.9}
          description="Orquestrador central (Human-in-the-loop). Avalia confiança e audita outros agentes."
          tags={['LangGraph', 'Circuit Breaker', 'Auditoria']}
          isManager
        />
      </div>
    </div>
  );
}

function AgentCard({ id, name, role, status, tasksCompleted, confidenceScore, description, tags, isManager }: any) {
  return (
    <Link href={`/dashboard/agents/${id}`} className="group block">
      <div className={`bg-white/5 border ${isManager ? 'border-cyan-500/30' : 'border-white/10'} p-6 rounded-xl relative hover:bg-white/10 transition-colors h-full flex flex-col`}>
        {isManager && (
          <div className="absolute top-4 right-4 px-2 py-1 bg-cyan-500/20 text-cyan-400 text-[10px] uppercase font-bold tracking-wider rounded border border-cyan-500/30">
            Orquestrador
          </div>
        )}
        
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl ${isManager ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-white/10 border border-white/20'}`}>
            {name[0]}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{name}</h3>
            <p className="text-sm text-white/50">{role}</p>
          </div>
        </div>
        
        <p className="text-sm text-white/70 mb-6 flex-1">
          {description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map((tag: string) => (
            <span key={tag} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white/60">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
          <div>
            <div className="text-xs text-white/40 mb-1 flex items-center gap-1">
              <Activity className="w-3 h-3" /> Execuções
            </div>
            <div className="font-mono text-sm">{tasksCompleted.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-white/40 mb-1 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Confiança
            </div>
            <div className="font-mono text-sm text-emerald-400">{confidenceScore}%</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
