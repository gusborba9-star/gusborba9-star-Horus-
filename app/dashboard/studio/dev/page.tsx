'use client';
import { Code, Monitor, Smartphone, Server } from 'lucide-react';
import NexusDiscoveryFlow from '../components/NexusDiscoveryFlow';

export default function StudioDev() {
  const renderPreview = () => (
    <div className="flex flex-col items-center justify-center h-full p-10 relative z-10 text-center">
       <div className="w-full h-full max-w-5xl bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col text-left">
          <div className="h-10 bg-zinc-100 border-b border-zinc-200 flex items-center px-4 gap-4 shrink-0">
             <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
             </div>
             <div className="flex-1 bg-white rounded-md h-6 border border-zinc-200 flex items-center justify-center px-3 text-[10px] text-zinc-500 font-mono">
                <Monitor className="w-3 h-3 mr-2 text-emerald-500" />
                https://nexus-sandbox-deployment.horus.dev
             </div>
          </div>
          <div className="flex-1 bg-zinc-50 flex items-center justify-center p-8">
             <div className="bg-white border border-zinc-200 rounded-2xl p-10 max-w-lg text-center shadow-sm">
                <div className="w-16 h-16 bg-[#D4AF37]/10 text-[#D4AF37] rounded-2xl flex items-center justify-center mx-auto mb-6">
                   <Code className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-800 mb-2">Ambiente Isolado Iniciado</h3>
                <p className="text-zinc-500 text-sm mb-6">Sua solução foi arquitetada pelo Nexus, o código foi gerado e está rodando em um Simulação Seguro.</p>
                <div className="text-xs text-zinc-400 font-mono bg-zinc-100 p-3 rounded-lg border border-zinc-200 text-left">
                   &gt; nexus deploy --sandbox<br/>
                   &gt; Provisioning container...<br/>
                   &gt; Starting application on port 3000...<br/>
                   &gt; Live preview ready.
                </div>
             </div>
          </div>
       </div>
    </div>
  );

  return (
    <NexusDiscoveryFlow 
       moduleName="Studio Dev" 
       moduleIcon={Code} 
       
       renderPreview={renderPreview}
    />
  );
}
