'use client';

import { useState } from 'react';
import { ArrowLeft, BrainCircuit, CheckCircle2, GitBranch, Layers3, Play, ShieldCheck, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Plan = { objective: string; complexity: string; capabilities: string[]; integrations: string[]; execution_graph: Array<{ id: string; capability: string; depends_on: string[] }>; approval_required: boolean; environment: string };
type Project = { id: string; name: string; objective: string; status: string; environment: string; capabilities: string[]; integrations: string[]; architecture: Plan };

export default function StudioHome() {
  const router = useRouter();
  const [objective, setObjective] = useState('');
  const [name, setName] = useState('');
  const [environment, setEnvironment] = useState('PREVIEW');
  const [plan, setPlan] = useState<Plan | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadProjects = async () => {
    const response = await fetch('/api/studio/projects');
    if (!response.ok) return;
    const body = await response.json();
    setProjects(body.data ?? []);
  };

  const architect = async () => {
    if (!objective.trim()) return;
    setLoading(true); setMessage('Nexus está arquitetando o projeto...');
    try {
      const response = await fetch('/api/studio/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim() || 'Projeto sem título', objective, environment }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? 'Falha ao criar projeto');
      setPlan(body.data.plan); setSelected(body.data.project); setMessage('Arquitetura persistida. O próximo passo é executar a capacidade autorizada.'); await loadProjects();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Falha ao arquitetar'); } finally { setLoading(false); }
  };

  const execute = async () => {
    if (!selected) return;
    setLoading(true); setMessage('Executando pelo Core econômico e registrando a execução...');
    try {
      const response = await fetch(`/api/studio/projects/${selected.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ objective: selected.objective, environment: selected.environment }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? 'Execução rejeitada');
      setMessage('Execução concluída e registrada. Preview/revisão permanece vinculada ao projeto.'); await loadProjects();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Falha na execução'); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-full bg-[#080808] text-[#FAFAFA] font-sans">
      <header className="h-20 border-b border-[#1C1C1C] flex items-center justify-between px-6 sm:px-10"><div className="flex items-center gap-3"><BrainCircuit className="w-5 h-5 text-[#D4AF37]" /><h1 className="text-xl font-extrabold tracking-[0.2em] uppercase">Studio Hórus</h1></div><button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/50 hover:text-white"><ArrowLeft className="w-4 h-4" /> Voltar</button></header>
      <main className="max-w-7xl mx-auto p-6 sm:p-10 grid grid-cols-1 xl:grid-cols-[1.25fr_.75fr] gap-8">
        <section className="rounded-3xl border border-[#1C1C1C] bg-[#0D0D0D] p-7 sm:p-10">
          <div className="flex items-center gap-2 text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.3em] mb-4"><Sparkles className="w-4 h-4" /> Nexus Project Engine</div>
          <h2 className="text-3xl sm:text-5xl font-light mb-4">Diga o que quer criar.</h2>
          <p className="text-white/45 max-w-2xl leading-relaxed mb-8">O Nexus transforma a intenção em projeto persistente, seleciona capacidades, identifica integrações e monta um grafo de execução. Providers permanecem invisíveis.</p>
          <div className="space-y-4">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do projeto (opcional)" className="w-full bg-[#141414] border border-[#242424] rounded-2xl px-5 py-4 outline-none focus:border-[#D4AF37]/50" />
            <textarea value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="Ex.: crie um SaaS para uma clínica, com site, painel, API, banco e automações de atendimento." className="w-full min-h-40 bg-[#141414] border border-[#242424] rounded-2xl px-5 py-4 outline-none focus:border-[#D4AF37]/50 resize-y" />
            <div className="flex flex-wrap gap-3 items-center"><select value={environment} onChange={(e) => setEnvironment(e.target.value)} className="bg-[#141414] border border-[#242424] rounded-xl px-4 py-3 text-sm"><option value="PREVIEW">Preview</option><option value="STAGING">Staging</option><option value="PRODUCTION">Production</option></select><button disabled={loading || !objective.trim()} onClick={architect} className="px-6 py-3 rounded-xl bg-[#D4AF37] text-black font-bold uppercase tracking-widest text-xs disabled:opacity-40">Arquitetar</button>{selected && <button disabled={loading} onClick={execute} className="px-6 py-3 rounded-xl border border-[#D4AF37]/40 text-[#D4AF37] font-bold uppercase tracking-widest text-xs disabled:opacity-40"><Play className="w-4 h-4 inline mr-2" /> Executar</button>}</div>
          </div>
          {message && <div className="mt-6 p-4 rounded-xl border border-[#1C1C1C] text-sm text-white/60">{message}</div>}
          {plan && <div className="mt-8 border-t border-[#1C1C1C] pt-8"><div className="grid sm:grid-cols-3 gap-4 mb-6"><Metric label="Complexidade" value={plan.complexity} /><Metric label="Ambiente" value={plan.environment} /><Metric label="Aprovação" value={plan.approval_required ? 'Necessária' : 'Autônoma'} /></div><div className="grid md:grid-cols-2 gap-6"><Panel title="Capabilities" icon={<Layers3 className="w-4 h-4" />} items={plan.capabilities} /><Panel title="Connectors" icon={<GitBranch className="w-4 h-4" />} items={plan.integrations} /></div><div className="mt-6 p-5 rounded-2xl bg-[#111] border border-[#1C1C1C]"><div className="text-[10px] uppercase tracking-widest text-white/35 mb-4">Execution Graph</div>{plan.execution_graph.map((node) => <div key={node.id} className="flex items-center gap-3 py-2 text-sm"><CheckCircle2 className="w-4 h-4 text-[#D4AF37]" /><span>{node.capability}</span>{node.depends_on.length > 0 && <span className="text-white/25">← {node.depends_on.join(', ')}</span>}</div>)}</div></div>}
        </section>
        <aside className="space-y-6"><section className="rounded-3xl border border-[#1C1C1C] bg-[#0D0D0D] p-7"><div className="flex items-center gap-2 text-white/45 text-[10px] uppercase tracking-widest mb-5"><ShieldCheck className="w-4 h-4" /> Controle operacional</div><div className="space-y-4 text-sm text-white/55"><Row a="User → Workspace → Project" b="BOUND" /><Row a="Capability → Permission" b="BOUND" /><Row a="Economic Authorization" b="CORE" /><Row a="Execution Log" b="CORE" /><Row a="Preview / Staging / Production" b="ISOLATED" /></div></section><section className="rounded-3xl border border-[#1C1C1C] bg-[#0D0D0D] p-7"><h3 className="text-sm font-bold uppercase tracking-widest mb-5">Projetos recentes</h3><button onClick={() => void loadProjects()} className="mb-4 text-[10px] uppercase tracking-widest text-[#D4AF37]">Atualizar</button><div className="space-y-3">{projects.length === 0 ? <p className="text-sm text-white/30">Nenhum projeto carregado.</p> : projects.slice(0, 8).map((project) => <button key={project.id} onClick={() => { setSelected(project); setPlan(project.architecture); }} className="w-full text-left p-4 rounded-xl bg-[#111] border border-[#1C1C1C] hover:border-[#D4AF37]/30"><div className="font-semibold text-sm">{project.name}</div><div className="text-xs text-white/35 mt-1">{project.status} · {project.environment}</div></button>)}</div></section></aside>
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl bg-[#111] border border-[#1C1C1C] p-4"><div className="text-[9px] uppercase tracking-widest text-white/30">{label}</div><div className="mt-2 text-sm font-semibold">{value}</div></div>; }
function Panel({ title, icon, items }: { title: string; icon: React.ReactNode; items: string[] }) { return <div className="rounded-2xl bg-[#111] border border-[#1C1C1C] p-5"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4">{icon}{title}</div><div className="flex flex-wrap gap-2">{items.map((item) => <span key={item} className="px-3 py-1.5 rounded-full bg-[#181818] text-xs text-white/55">{item}</span>)}</div></div>; }
function Row({ a, b }: { a: string; b: string }) { return <div className="flex items-center justify-between gap-4"><span>{a}</span><span className="text-[9px] tracking-widest text-[#D4AF37]">{b}</span></div>; }
