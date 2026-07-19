'use client';

import { Activity, BrainCircuit, CheckCircle2, AlertTriangle, Users, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardOverview() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>
          <p className="text-white/50 mt-1">Status do Hórus Cognitive OS e seus funcionários digitais.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            Sistema Operacional Online
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard 
          title="Funcionários Ativos" 
          value="4" 
          icon={<Users className="w-5 h-5 text-cyan-400" />} 
          trend="+1 este mês"
        />
        <MetricCard 
          title="Nós de Memória" 
          value="1.2M" 
          icon={<BrainCircuit className="w-5 h-5 text-purple-400" />} 
          trend="+150k indexados"
        />
        <MetricCard 
          title="Execuções (24h)" 
          value="84,392" 
          icon={<Activity className="w-5 h-5 text-emerald-400" />} 
          trend="99.9% taxa de sucesso"
        />
        <MetricCard 
          title="Intervenções" 
          value="12" 
          icon={<AlertTriangle className="w-5 h-5 text-amber-400" />} 
          trend="Aguardando humano"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Agents */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Funcionários Digitais em Execução</h2>
            <Link href="/dashboard/agents" className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              Ver todos <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-white/60">
                <tr>
                  <th className="px-6 py-4 font-medium">Funcionário</th>
                  <th className="px-6 py-4 font-medium">Função</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Carga (CPU/Mem)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AgentRow name="Maria" role="Atendente MVP" status="online" load="12%" />
                <AgentRow name="Caleb" role="SDR Outbound" status="online" load="24%" />
                <AgentRow name="Sophia" role="Customer Success" status="online" load="8%" />
                <AgentRow name="Nexus" role="Gerente IA (Orquestrador)" status="online" load="45%" />
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Logs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Trilha de Execução</h2>
            <Link href="/dashboard/logs" className="text-sm text-white/50 hover:text-white">
              Ver logs
            </Link>
          </div>
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-4 font-mono text-xs space-y-3 h-[300px] overflow-y-auto">
            <LogEntry time="08:42:12" agent="Maria" action="Agendamento Confirmado" status="success" />
            <LogEntry time="08:41:55" agent="Nexus" action="Context Semantic Pruning" status="success" />
            <LogEntry time="08:40:30" agent="Caleb" action="Outbound Email Batch (50)" status="success" />
            <LogEntry time="08:38:12" agent="Maria" action="Intent Recognition (Lead)" status="success" />
            <LogEntry time="08:35:01" agent="Sophia" action="Churn Risk Detected" status="warning" />
            <LogEntry time="08:32:44" agent="Nexus" action="Memory Graph Sync" status="success" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-xl relative overflow-hidden group hover:border-white/20 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-white/5 rounded-lg border border-white/10">
          {icon}
        </div>
      </div>
      <div>
        <div className="text-3xl font-bold mb-1">{value}</div>
        <div className="text-sm text-white/50">{title}</div>
      </div>
      <div className="mt-4 text-xs font-medium text-white/40">{trend}</div>
    </div>
  );
}

function AgentRow({ name, role, status, load }: { name: string, role: string, status: 'online' | 'offline', load: string }) {
  return (
    <tr className="hover:bg-white/[0.02] transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center font-bold text-cyan-400">
            {name[0]}
          </div>
          <span className="font-medium">{name}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-white/60">{role}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
          <span className="capitalize">{status}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-white/60">{load}</td>
    </tr>
  );
}

function LogEntry({ time, agent, action, status }: { time: string, agent: string, action: string, status: 'success' | 'warning' | 'error' }) {
  const colors = {
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    error: 'text-red-400'
  };
  return (
    <div className="flex items-start gap-3">
      <span className="text-white/30 shrink-0">[{time}]</span>
      <span className="text-cyan-400 shrink-0">[{agent}]</span>
      <span className={`flex-1 ${colors[status]}`}>{action}</span>
    </div>
  );
}
