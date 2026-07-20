'use client';

import { BrainCircuit, Search, Database, Layers, GitMerge } from 'lucide-react';
import BackButton from '@/components/BackButton';

export default function MemoryPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 h-full flex flex-col">
      <div className="mb-4">
        <BackButton label="Voltar para Visão Geral" />
      </div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Memória Infinita</h1>
          <p className="text-white/50 mt-1">Gerenciamento do Memory Graph e Poda Semântica.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center gap-3">
            <Database className="w-5 h-5 text-purple-400" />
            <div>
              <div className="text-xs text-white/50">PostgreSQL (pg_vector)</div>
              <div className="font-mono text-sm font-bold">1.2M Nós</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 min-h-[500px] border border-white/10 rounded-xl overflow-hidden relative bg-[#0a0a0a] flex items-center justify-center">
        {/* Mock visualization of a graph network */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.4) 0, transparent 60%)' }}></div>
        
        {/* Connecting lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <line x1="50%" y1="50%" x2="30%" y2="30%" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <line x1="50%" y1="50%" x2="70%" y2="25%" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <line x1="50%" y1="50%" x2="75%" y2="60%" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="2" />
          <line x1="50%" y1="50%" x2="25%" y2="70%" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          
          <line x1="75%" y1="60%" x2="85%" y2="75%" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="2" />
          <line x1="75%" y1="60%" x2="80%" y2="45%" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        </svg>

        {/* Nodes */}
        <div className="absolute top-[30%] left-[30%] -translate-x-1/2 -translate-y-1/2">
          <GraphNode label="Cliente: João Silva" type="entity" size="sm" />
        </div>
        <div className="absolute top-[25%] left-[70%] -translate-x-1/2 -translate-y-1/2">
          <GraphNode label="Interação: WhatsApp" type="event" size="sm" />
        </div>
        
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="relative group cursor-pointer">
            <div className="w-20 h-20 rounded-full bg-purple-500/20 border-2 border-purple-500/50 flex items-center justify-center backdrop-blur-md shadow-[0_0_30px_rgba(168,85,247,0.3)]">
              <BrainCircuit className="w-8 h-8 text-purple-400" />
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 whitespace-nowrap text-center">
              <div className="text-sm font-bold">Contexto Atual</div>
              <div className="text-xs text-white/50">Root Node</div>
            </div>
          </div>
        </div>

        <div className="absolute top-[60%] left-[75%] -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="relative group cursor-pointer">
            <div className="w-16 h-16 rounded-full bg-cyan-500/20 border-2 border-cyan-500/50 flex items-center justify-center backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              <Layers className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap text-center">
              <div className="text-sm font-bold">Agendamento</div>
              <div className="text-xs text-emerald-400 font-mono">Alta Confiança</div>
            </div>
          </div>
        </div>
        
        <div className="absolute top-[75%] left-[85%] -translate-x-1/2 -translate-y-1/2 z-10">
          <GraphNode label="Data: Amanhã 14h" type="data" size="sm" active />
        </div>
        
        <div className="absolute top-[70%] left-[25%] -translate-x-1/2 -translate-y-1/2">
          <GraphNode label="Intent: Dúvida" type="event" size="sm" />
        </div>
        
        {/* Overlay Tools */}
        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none">
          <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-4 w-80 pointer-events-auto">
            <h3 className="font-bold mb-3 text-sm flex items-center gap-2"><GitMerge className="w-4 h-4" /> Poda Semântica (Gemini Flash)</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/60">Compressão de Contexto</span>
                  <span className="text-emerald-400">Ativo</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="w-[65%] h-full bg-emerald-400 rounded-full"></div>
                </div>
              </div>
              <div className="text-xs text-white/40">
                Última poda: há 4 minutos. 342 nós arquivados para Memória Longa.
              </div>
            </div>
          </div>
          
          <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-full flex p-1 pointer-events-auto">
            <div className="px-4 py-2 bg-white/10 rounded-full text-sm font-medium">Grafo Visual</div>
            <div className="px-4 py-2 text-white/50 hover:text-white rounded-full text-sm font-medium cursor-pointer transition-colors">Tabela SQL</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GraphNode({ label, type, size = 'md', active = false }: any) {
  const sizeClasses = size === 'sm' ? 'w-12 h-12' : 'w-16 h-16';
  const colors: Record<string, string> = {
    entity: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    event: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    data: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
  };
  
  return (
    <div className="relative group cursor-pointer">
      <div className={`${sizeClasses} rounded-full border ${active ? 'border-cyan-400 bg-cyan-400/20 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : colors[type] || 'bg-white/5 border-white/20'} flex items-center justify-center backdrop-blur-md transition-all hover:scale-110`}>
        <div className="w-2 h-2 rounded-full bg-current"></div>
      </div>
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap text-center opacity-70 group-hover:opacity-100 transition-opacity">
        <div className="text-xs font-medium">{label}</div>
      </div>
    </div>
  );
}
