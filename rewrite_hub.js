const fs = require('fs');

const code = `'use client';
import { ShoppingBag, ArrowRight, Star, Download, Search, Briefcase, Bot, LayoutTemplate, Network, Box } from 'lucide-react';
import Link from 'next/link';

export default function HubPage() {
  const categories = [
    { id: 'agents', name: 'Agentes Prontos', icon: Bot, count: 42 },
    { id: 'integrations', name: 'Integrações', icon: Network, count: 18 },
    { id: 'templates', name: 'Templates de Operação', icon: LayoutTemplate, count: 25 },
    { id: 'kits', name: 'Kits por Segmento', icon: Briefcase, count: 12 },
    { id: 'dna', name: 'DNA Cognitivos', icon: Box, count: 8 },
  ];

  return (
    <div className="h-full flex flex-col bg-[#050508] relative font-sans">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] mix-blend-overlay pointer-events-none"></div>
      
      <div className="h-24 px-6 sm:px-10 border-b border-white/5 shrink-0 flex items-center justify-between relative z-20">
         <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 text-rose-500" />
              Hórus Hub
            </h1>
            <p className="text-xs sm:text-sm text-white/50 mt-1 font-light">A loja oficial do ecossistema Hórus OS.</p>
         </div>
         <div className="hidden sm:flex bg-black/40 border border-white/10 rounded-xl px-4 py-2 w-64 items-center">
            <Search className="w-4 h-4 text-white/40" />
            <input type="text" placeholder="Buscar no Hub..." className="bg-transparent border-none outline-none text-white text-sm ml-2 w-full" />
         </div>
      </div>

      <div className="flex-1 p-6 sm:p-10 overflow-y-auto custom-scrollbar relative z-10">
         <div className="max-w-6xl mx-auto space-y-12">
            
            {/* Highlight Banner */}
            <div className="bg-gradient-to-r from-rose-900/30 to-[#090A0F] border border-rose-500/30 rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="flex-1 relative z-10">
                  <div className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span> Lançamento Exclusivo
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Kit Completo para Clínicas de Estética</h2>
                  <p className="text-white/60 font-light leading-relaxed max-w-lg mb-8">
                     Adquira um ambiente Hórus 100% pré-configurado. Inclui agente de agendamento (WhatsApp), fluxos de CRM de saúde, políticas de LGPD e 5 templates de campanhas.
                  </p>
                  <button className="px-6 py-3 bg-rose-500 text-black font-bold rounded-xl hover:bg-rose-400 transition-colors shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                    Ver Detalhes do Kit
                  </button>
               </div>
               <div className="hidden md:block w-48 h-48 bg-rose-500/20 rounded-full blur-[80px]"></div>
            </div>

            {/* Categories */}
            <div>
               <h3 className="text-xl font-bold text-white mb-6">Categorias Oficiais</h3>
               <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                 {categories.map(c => {
                   const Icon = c.icon;
                   return (
                     <div key={c.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center hover:bg-white/10 hover:border-rose-500/30 transition-all cursor-pointer group">
                        <Icon className="w-6 h-6 text-white/50 group-hover:text-rose-400 mx-auto mb-3 transition-colors" />
                        <h4 className="text-sm font-bold text-white mb-1">{c.name}</h4>
                        <span className="text-[10px] text-white/40">{c.count} itens</span>
                     </div>
                   )
                 })}
               </div>
            </div>

            {/* Top Items */}
            <div>
               <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Star className="w-5 h-5 text-amber-400"/> Mais Adquiridos</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 
                 {[
                   { name: 'SDR Outbound (LinkedIn)', price: 'R$ 1.297', type: 'Agente Pronto', color: 'blue' },
                   { name: 'Dashboard Financeiro Pro', price: 'R$ 597', type: 'Template', color: 'emerald' },
                   { name: 'Integração Shopify Av.', price: 'R$ 397', type: 'Integração', color: 'purple' },
                 ].map((item, i) => (
                   <div key={i} className="bg-[#090A0F] border border-white/10 rounded-2xl p-6 group hover:border-rose-500/30 transition-colors">
                      <div className={\`text-[10px] font-bold text-\${item.color}-400 bg-\${item.color}-500/10 px-2 py-1 rounded inline-block uppercase tracking-widest mb-4\`}>
                        {item.type}
                      </div>
                      <h4 className="text-lg font-bold text-white mb-2">{item.name}</h4>
                      <div className="text-xl font-black text-white mb-6">{item.price}</div>
                      
                      <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white hover:bg-white/10 flex items-center justify-center gap-2 transition-colors">
                        <Download className="w-4 h-4" /> Adquirir
                      </button>
                   </div>
                 ))}
                 
               </div>
            </div>

         </div>
      </div>
    </div>
  );
}
`

fs.writeFileSync('app/dashboard/hub/page.tsx', code);

