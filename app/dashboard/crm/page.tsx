import Link from 'next/link';
import { ArrowLeft, Kanban, Search, Filter, Plus, MoreHorizontal, Zap, TrendingUp, Users, DollarSign, BrainCircuit } from 'lucide-react';

export default function CRMPage() {
  return (
    <div className="h-full flex flex-col bg-[#090A0F] text-white">
      {/* Header */}
      <div className="h-20 border-b border-white/10 flex items-center justify-between px-4 lg:px-8 bg-white/[0.02] backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-4">
           <Link href="/dashboard" className="text-white/50 hover:text-white transition-colors lg:hidden">
              <ArrowLeft className="w-5 h-5" />
           </Link>
           <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
             <Kanban className="w-5 h-5 text-amber-400" />
           </div>
           <div>
             <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">Nexus Pipeline <span className="text-[10px] bg-amber-500 text-black font-bold px-2 py-0.5 rounded-full uppercase">Premium</span></h1>
             <p className="text-xs text-white/50 hidden sm:block">Orquestração autônoma de relacionamento e vendas.</p>
           </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 focus-within:border-amber-500/50">
            <Search className="w-4 h-4 text-white/40" />
            <input type="text" placeholder="Buscar no CRM..." className="bg-transparent border-none outline-none text-sm ml-2 w-48 text-white" />
          </div>
          <button className="p-2 border border-white/10 rounded-lg text-white/70 hover:bg-white/10 transition-colors">
             <Filter className="w-4 h-4" />
          </button>
          <button className="px-4 py-2 bg-amber-500 text-black font-bold rounded-lg text-sm hover:bg-amber-400 transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
             <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Novo Lead</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="p-4 lg:px-8 py-6 shrink-0 grid grid-cols-2 md:grid-cols-4 gap-4 overflow-x-auto custom-scrollbar">
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col justify-between min-w-[140px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/50 font-bold uppercase tracking-wider">Pipeline Total</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl lg:text-3xl font-black">R$ 1.24M</div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-bold"><TrendingUp className="w-3 h-3"/> +12.5%</div>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col justify-between min-w-[140px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/50 font-bold uppercase tracking-wider">Leads Ativos</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl lg:text-3xl font-black">842</div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-bold"><TrendingUp className="w-3 h-3"/> +45 novos hoje</div>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col justify-between min-w-[140px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-amber-500 font-bold uppercase tracking-wider">Ações da Nexus</span>
            <BrainCircuit className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl lg:text-3xl font-black">1.4k</div>
          <div className="text-[10px] text-white/40 mt-1">Interações autônomas 24h</div>
        </div>
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 flex flex-col justify-between min-w-[140px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/90 font-bold uppercase tracking-wider">Fechamentos</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl lg:text-3xl font-black text-amber-400">R$ 142k</div>
          <div className="text-[10px] text-amber-400/60 mt-1 font-bold">Faturado nesta semana</div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar px-4 lg:px-8 pb-8 flex gap-6 snap-x snap-mandatory">
        
        {/* Column 1: Novos Leads */}
        <div className="w-[85vw] sm:w-[320px] shrink-0 flex flex-col h-full snap-center">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="font-bold text-sm text-white/70 uppercase tracking-widest flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-blue-500"></span> Novos Leads
            </h3>
            <span className="text-xs font-bold bg-white/10 px-2 py-0.5 rounded-full">12</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-2 pb-4">
             {/* Card */}
             <div className="bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all rounded-2xl p-4 cursor-pointer group">
               <div className="flex justify-between items-start mb-2">
                 <span className="font-bold text-sm group-hover:text-amber-400 transition-colors">TechCorp S.A.</span>
                 <MoreHorizontal className="w-4 h-4 text-white/30" />
               </div>
               <p className="text-xs text-white/50 mb-3 line-clamp-2">Lead capturado via WhatsApp. Solicitou informações sobre o plano Enterprise.</p>
               <div className="flex items-center justify-between">
                 <div className="flex gap-1">
                   <span className="text-[10px] font-bold bg-white/10 text-white/70 px-1.5 py-0.5 rounded">B2B</span>
                   <span className="text-[10px] font-bold bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">Frio</span>
                 </div>
                 <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-[10px] font-bold">TC</div>
               </div>
             </div>
             {/* Card */}
             <div className="bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all rounded-2xl p-4 cursor-pointer group">
               <div className="flex justify-between items-start mb-2">
                 <span className="font-bold text-sm group-hover:text-amber-400 transition-colors">Ana Silva</span>
                 <MoreHorizontal className="w-4 h-4 text-white/30" />
               </div>
               <p className="text-xs text-white/50 mb-3 line-clamp-2">Inscrição no webinar. Pontuação inicial alta.</p>
               <div className="flex items-center justify-between">
                 <div className="flex gap-1">
                   <span className="text-[10px] font-bold bg-white/10 text-white/70 px-1.5 py-0.5 rounded">B2C</span>
                 </div>
                 <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-600 to-purple-400 flex items-center justify-center text-[10px] font-bold">AS</div>
               </div>
             </div>
          </div>
        </div>

        {/* Column 2: Qualificação Hórus (AI) */}
        <div className="w-[85vw] sm:w-[320px] shrink-0 flex flex-col h-full snap-center">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="font-bold text-sm text-amber-500 uppercase tracking-widest flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Em Qualificação (Nexus)
            </h3>
            <span className="text-xs font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">4</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-2 pb-4">
             {/* Card AI Active */}
             <div className="bg-amber-500/5 border border-amber-500/20 hover:border-amber-500/50 transition-all rounded-2xl p-4 cursor-pointer relative overflow-hidden group shadow-[0_0_15px_rgba(245,158,11,0.05)]">
               <div className="absolute top-0 right-0 bg-amber-500 text-black px-2 py-0.5 rounded-bl-lg text-[9px] font-bold flex items-center gap-1">
                  <BrainCircuit className="w-3 h-3" /> AGENTE ATIVO
               </div>
               <div className="flex justify-between items-start mb-2 mt-2">
                 <span className="font-bold text-sm text-amber-100">Global Logistics</span>
               </div>
               <p className="text-xs text-white/60 mb-3 line-clamp-2">Membro Cognitivo está analisando viabilidade de integração ERP com base nas respostas do cliente no WhatsApp.</p>
               <div className="bg-black/40 rounded-lg p-2 mb-3">
                  <div className="text-[10px] text-white/40 mb-1 flex items-center gap-1"><Zap className="w-3 h-3 text-amber-400" /> Insight Nexus</div>
                  <div className="text-xs font-medium text-amber-200/80">&quot;Alta probabilidade de conversão. Dores focadas em redução de custos.&quot;</div>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-xs font-bold text-emerald-400">R$ 12.500</span>
                 <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-[10px] font-bold">GL</div>
               </div>
             </div>
          </div>
        </div>

        {/* Column 3: Proposta Enviada */}
        <div className="w-[85vw] sm:w-[320px] shrink-0 flex flex-col h-full snap-center">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="font-bold text-sm text-white/70 uppercase tracking-widest flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-purple-500"></span> Proposta
            </h3>
            <span className="text-xs font-bold bg-white/10 px-2 py-0.5 rounded-full">2</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-2 pb-4">
             {/* Card */}
             <div className="bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all rounded-2xl p-4 cursor-pointer group">
               <div className="flex justify-between items-start mb-2">
                 <span className="font-bold text-sm group-hover:text-amber-400 transition-colors">Nexus Labs S.A</span>
                 <MoreHorizontal className="w-4 h-4 text-white/30" />
               </div>
               <p className="text-xs text-white/50 mb-3">Proposta enviada pelo Membro Cognitivo Financeiro. Aguardando assinatura digital.</p>
               <div className="flex items-center justify-between">
                 <span className="text-xs font-bold text-emerald-400">R$ 4.800</span>
                 <span className="text-[10px] font-bold bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">Enviado</span>
               </div>
             </div>
          </div>
        </div>

        {/* Column 4: Fechamento */}
        <div className="w-[85vw] sm:w-[320px] shrink-0 flex flex-col h-full snap-center pr-6 lg:pr-0">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="font-bold text-sm text-emerald-500 uppercase tracking-widest flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> Ganho
            </h3>
            <span className="text-xs font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">1</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-2 pb-4">
             {/* Card Success */}
             <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 cursor-pointer group">
               <div className="flex justify-between items-start mb-2">
                 <span className="font-bold text-sm text-emerald-100">Alpha Trading</span>
                 <span className="text-[10px] bg-emerald-500 text-black px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">FECHADO</span>
               </div>
               <p className="text-xs text-white/50 mb-3">Pix confirmado. Integração ERP concluída com sucesso via orquestrador.</p>
               <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-500/20">
                 <span className="text-sm font-black text-emerald-400">R$ 8.900</span>
               </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
