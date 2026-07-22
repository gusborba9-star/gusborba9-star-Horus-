'use client';

import { Play, Download, Clock, Image as ImageIcon, Video, Music, Lock, AlertTriangle, ChevronRight, Wand2 } from 'lucide-react';
import { useState } from 'react';

export default function StudioPage() {
  const [showUpsell, setShowUpsell] = useState(false);
  const eliteApiCost = 185.50; // Mock current cost
  const hardCap = 200.00;
  const isNearCap = eliteApiCost >= (hardCap * 0.8);
  const isCapped = eliteApiCost >= hardCap;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estúdio Criativo (Pay-Per-Use)</h1>
          <p className="text-white/50 mt-1">Fila do Diretor, Produção de Alto Nível e Agentes Elite.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl flex items-center gap-2 transition-colors">
            <Wand2 className="w-4 h-4" /> Novo Projeto Avulso
          </button>
        </div>
      </div>

      <div className="bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-xl text-sm text-cyan-300">
        <strong>Blindagem de Projeto:</strong> Cada projeto avulso inclui a renderização primária e <strong>1 rodada de ajustes pontuais</strong> (edição cirúrgica via Inpainting/Stems) para proteger nossa infraestrutura.
      </div>

      {/* Hard Cap Monitor */}
      <div className={`p-6 rounded-2xl border ${isNearCap ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5 border-white/10'}`}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold mb-1 flex items-center gap-2">
              <Lock className="w-4 h-4" /> Hard Cap de Segurança (Agentes Elite)
            </h3>
            <p className="text-sm text-white/60 max-w-2xl">
              Seu plano inclui limite de segurança de consumo de API de elite. Bloqueios evitam cobranças surpresas ao atingir o teto de R$ {hardCap.toFixed(2)}. 
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">R$ {eliteApiCost.toFixed(2)}</div>
            <div className="text-xs text-white/40">consumidos no mês</div>
          </div>
        </div>
        
        <div className="mt-4 w-full bg-black/50 rounded-full h-2 border border-white/5 overflow-hidden">
          <div 
            className={`h-full rounded-full ${isCapped ? 'bg-red-500' : isNearCap ? 'bg-amber-400' : 'bg-cyan-500'}`}
            style={{ width: `${Math.min((eliteApiCost / hardCap) * 100, 100)}%` }}
          />
        </div>

        {isNearCap && (
          <div className="mt-4 flex items-center justify-between bg-black/40 p-3 rounded-lg border border-amber-500/20">
            <div className="flex items-center gap-2 text-sm text-amber-400">
              <AlertTriangle className="w-4 h-4" /> Você está próximo ao limite. Suas gerações Elite serão pausadas em R$ {(hardCap - eliteApiCost).toFixed(2)}.
            </div>
            <button onClick={() => setShowUpsell(true)} className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg text-sm font-bold transition-colors">
              Comprar Recarga
            </button>
          </div>
        )}
      </div>

      {/* Fila do Diretor */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          Fila do Diretor <span className="text-xs font-normal text-white/40 px-2 py-0.5 bg-white/5 rounded-full">Renderizando</span>
        </h2>
        
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden p-6 space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="w-48 h-32 bg-black/50 rounded-xl border border-white/5 flex items-center justify-center relative overflow-hidden group">
              <Video className="w-8 h-8 text-white/20" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                <span className="text-xs font-bold text-white/80">Cinematic B-Roll</span>
              </div>
            </div>
            
            <div className="flex-1 space-y-4 w-full">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-cyan-400">Campanha Institucional - Q4</h3>
                  <p className="text-sm text-white/50">Modelo: O Cineasta (Mega Prompt via Sora 2 Pro)</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-cyan-400">R$ 150,00</span>
                  <div className="text-xs text-white/40">Projeto Avulso (Pago via Efí)</div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-white/60 mb-2">
                  <span>Progresso: Renderização de Frames</span>
                  <span>65%</span>
                </div>
                <div className="w-full bg-black rounded-full h-1.5 border border-white/5 overflow-hidden">
                  <div className="bg-cyan-500 h-full rounded-full relative" style={{ width: '65%' }}>
                    <div className="absolute top-0 right-0 bottom-0 left-0 bg-gradient-to-r from-transparent to-white/50 animate-pulse" />
                  </div>
                </div>
                <p className="text-xs text-white/40 mt-2">Próxima etapa: Masterização e Upscale 4K.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Histórico / Central de Downloads */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">Central de Downloads Permanente</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProjectCard 
            title="Trilha Sonora - Podcast" 
            type="Áudio" 
            icon={<Music className="w-5 h-5 text-purple-400" />} 
            status="Concluído" 
            cost="Incluso no Plano"
          />
          <ProjectCard 
            title="Vinheta de Abertura" 
            type="Vídeo" 
            icon={<Video className="w-5 h-5 text-cyan-400" />} 
            status="Concluído"
            cost="Incluso no Plano"
          />
        </div>
      </div>

      {/* Recarga Modal */}
      {showUpsell && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0A] border border-white/10 p-8 rounded-2xl max-w-md w-full relative">
            <h2 className="text-2xl font-bold mb-2">Recarga Elite (Efí)</h2>
            <p className="text-white/60 text-sm mb-6">Libere mais limite para seus agentes de Alta Performance. A compensação é instantânea via Pix.</p>
            
            <div className="space-y-3 mb-6">
              <button className="w-full p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 flex justify-between items-center hover:bg-cyan-500/20 transition-colors">
                <span className="font-bold text-cyan-400">Pacote Básico Elite</span>
                <span className="font-bold">R$ 50,00</span>
              </button>
              <button className="w-full p-4 rounded-xl border border-white/10 flex justify-between items-center hover:bg-white/5 transition-colors">
                <span className="font-bold text-white">Pacote Avançado Elite</span>
                <span className="font-bold">R$ 150,00</span>
              </button>
            </div>
            
            <div className="flex gap-3">
              <button onClick={() => setShowUpsell(false)} className="flex-1 py-3 px-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors font-bold text-sm">
                Cancelar
              </button>
              <button className="flex-1 py-3 px-4 rounded-xl bg-cyan-500 text-black hover:bg-cyan-400 transition-colors font-bold text-sm">
                Pagar com Pix
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectCard({ title, type, icon, status, cost }: { title: string, type: string, icon: React.ReactNode, status: string, cost: string }) {
  return (
    <div className="bg-white/5 border border-white/10 p-5 rounded-xl hover:border-white/20 transition-colors flex gap-4 items-center">
      <div className="w-12 h-12 rounded-lg bg-black/50 border border-white/5 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-sm truncate">{title}</h4>
        <div className="text-xs text-white/50 mt-1 flex gap-2">
          <span>{type}</span> • <span>{cost}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 shrink-0">
        <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors group relative">
          <Play className="w-4 h-4 text-white" />
        </button>
        <button className="p-2 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 rounded-lg transition-colors">
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
