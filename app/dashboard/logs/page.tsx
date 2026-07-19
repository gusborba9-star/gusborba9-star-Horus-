'use client';

import { Activity, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, Database } from 'lucide-react';

export default function LogsPage() {
  const logs = [
    { id: 'evt_9921', time: '10:42:15', agent: 'Maria', action: 'Roteamento de Intenção', details: 'Identificado: Agendamento. Confiança: 98%.', status: 'success' },
    { id: 'evt_9920', time: '10:42:12', agent: 'System', action: 'Webhook Recebido', details: 'Origem: WhatsApp API (Twilio). Payload parseado.', status: 'success' },
    { id: 'evt_9919', time: '10:40:01', agent: 'Nexus', action: 'Poda Semântica', details: '342 nós arquivados para Memória de Longo Prazo.', status: 'success' },
    { id: 'evt_9918', time: '10:35:44', agent: 'Caleb', action: 'Disparo de Email Batch', details: '50 emails enviados via SendGrid.', status: 'success' },
    { id: 'evt_9917', time: '10:31:12', agent: 'Sophia', action: 'Análise de Risco (Churn)', details: 'Cliente ID #4421 pontuado com alto risco.', status: 'warning' },
    { id: 'evt_9916', time: '10:28:05', agent: 'Nexus', action: 'Intervenção Humana', details: 'Confiança baixa (42%) em estorno Stripe. Aguardando aprovação.', status: 'error' },
    { id: 'evt_9915', time: '10:25:30', agent: 'Maria', action: 'Pagamento Processado', details: 'Stripe Charge ID: ch_3M... Concluído.', status: 'success' },
    { id: 'evt_9914', time: '10:22:10', agent: 'Caleb', action: 'Qualificação de Lead', details: 'Lead atualizado no CRM: BANT aprovado.', status: 'success' },
    { id: 'evt_9913', time: '10:15:00', agent: 'System', action: 'Circuit Breaker', details: 'API externa instável. Estado: HALF_OPEN.', status: 'warning' },
    { id: 'evt_9912', time: '10:10:22', agent: 'Sophia', action: 'Onboarding Step 3', details: 'Cliente completou setup inicial.', status: 'success' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trilha de Auditoria</h1>
          <p className="text-white/50 mt-1">Log imutável de execuções (Event Sourcing).</p>
        </div>
        
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
            Filtrar: Todos
          </button>
          <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
            Exportar CSV
          </button>
        </div>
      </div>
      
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden flex-1 flex flex-col">
        <div className="p-4 border-b border-white/10 bg-black/20 flex items-center gap-4">
          <Database className="w-5 h-5 text-emerald-400" />
          <span className="font-mono text-sm text-emerald-400 font-bold">executions_log</span>
          <span className="text-xs text-white/40 font-mono">APPEND-ONLY</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-black/40 text-white/40 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4 font-bold">Event ID</th>
                <th className="px-6 py-4 font-bold">Time (UTC)</th>
                <th className="px-6 py-4 font-bold">Ator (Agente)</th>
                <th className="px-6 py-4 font-bold">Ação</th>
                <th className="px-6 py-4 font-bold w-full">Payload / Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-xs">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 text-white/30">{log.id}</td>
                  <td className="px-6 py-4 text-white/50">{log.time}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-white/5 rounded text-cyan-400">{log.agent}</span>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    {log.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {log.status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                    {log.status === 'error' && <ShieldAlert className="w-4 h-4 text-red-400" />}
                    <span className={log.status === 'error' ? 'text-red-400' : 'text-white/80'}>{log.action}</span>
                  </td>
                  <td className="px-6 py-4 text-white/50 truncate max-w-md group-hover:text-white/80 transition-colors">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
