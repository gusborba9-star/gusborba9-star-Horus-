import Link from 'next/link';
import { ArrowLeft, Database, Key, Copy, Eye, Zap, ShieldCheck, Edit3, Plus } from 'lucide-react';

export default function APIsPage() {
  return (
    <div className="h-full flex flex-col bg-[#090A0F] text-white">
      {/* Header */}
      <div className="h-20 border-b border-white/10 flex items-center justify-between px-4 lg:px-8 bg-white/[0.02] backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-4">
           <Link href="/dashboard" className="text-white/50 hover:text-white transition-colors lg:hidden">
              <ArrowLeft className="w-5 h-5" />
           </Link>
           <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
             <Database className="w-5 h-5 text-blue-400" />
           </div>
           <div>
             <h1 className="text-xl font-bold tracking-tight">APIs & Endpoints</h1>
             <p className="text-xs text-white/50 hidden sm:block">Gerencie chaves de acesso e Webhooks para o Nexus Core.</p>
           </div>
        </div>
        
        <button className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-sm hover:bg-blue-500 transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
           <Key className="w-4 h-4" /> <span className="hidden sm:inline">Gerar Nova Chave</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8">
         <div className="max-w-4xl mx-auto space-y-8">
            
            {/* API Keys */}
            <section>
               <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Key className="w-5 h-5 text-blue-400"/> Chaves de Autenticação (Bearer)</h2>
               <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                       <thead className="bg-white/5 border-b border-white/10">
                         <tr>
                           <th className="px-6 py-4 font-semibold text-white/70">Nome da Chave</th>
                           <th className="px-6 py-4 font-semibold text-white/70">Ambiente</th>
                           <th className="px-6 py-4 font-semibold text-white/70">Token (Parcial)</th>
                           <th className="px-6 py-4 font-semibold text-white/70 text-right">Ações</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                         <tr className="hover:bg-white/[0.02] transition-colors">
                           <td className="px-6 py-4 font-bold">Produção - ERP Integrador</td>
                           <td className="px-6 py-4"><span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs font-bold uppercase">Produção</span></td>
                           <td className="px-6 py-4 font-mono text-white/50">hx_prod_8f92...a1b2</td>
                           <td className="px-6 py-4 flex justify-end gap-2">
                             <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"><Copy className="w-4 h-4"/></button>
                             <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"><Eye className="w-4 h-4"/></button>
                           </td>
                         </tr>
                         <tr className="hover:bg-white/[0.02] transition-colors">
                           <td className="px-6 py-4 font-bold">Desenvolvimento Local</td>
                           <td className="px-6 py-4"><span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-xs font-bold uppercase">Simulação</span></td>
                           <td className="px-6 py-4 font-mono text-white/50">hx_test_4f21...c9d0</td>
                           <td className="px-6 py-4 flex justify-end gap-2">
                             <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"><Copy className="w-4 h-4"/></button>
                             <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"><Eye className="w-4 h-4"/></button>
                           </td>
                         </tr>
                       </tbody>
                    </table>
                 </div>
               </div>
            </section>

            {/* Endpoints & Webhooks */}
            <section>
               <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-blue-400"/> Webhooks e Eventos</h2>
               <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                     <div className="flex justify-between items-start mb-4">
                        <div>
                           <h3 className="font-bold mb-1">agent.message.received</h3>
                           <p className="text-xs text-white/50">Disparado quando um membro cognitivo recebe uma mensagem do cliente.</p>
                        </div>
                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-[10px] font-bold uppercase flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Ativo</span>
                     </div>
                     <div className="bg-black/50 border border-white/5 rounded-xl p-3 flex justify-between items-center group">
                        <span className="font-mono text-xs text-white/60 truncate">https://api.meusistema.com/webhook/nexus</span>
                        <button className="text-white/30 group-hover:text-white transition-colors ml-2 shrink-0"><Edit3 className="w-4 h-4"/></button>
                     </div>
                  </div>
                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 border-dashed">
                     <div className="h-full flex flex-col items-center justify-center text-center opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3">
                           <Plus className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-sm">Adicionar Novo Webhook</span>
                     </div>
                  </div>
               </div>
            </section>

         </div>
      </div>
    </div>
  );
}
