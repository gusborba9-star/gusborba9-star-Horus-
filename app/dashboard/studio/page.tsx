'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, BrainCircuit, CheckCircle2, GitBranch, Layers3, Plus, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Project { id: string; name: string; objective: string; status: string; environment: string; capabilities: string[]; updated_at: string; }
interface Revision { id: string; version: number; change_class: string; approval_state: string; optimized_spec: Record<string, unknown>; preview?: { status?: string; url?: string | null; verified?: boolean }; deployment?: Record<string, unknown>; created_at: string; }

export default function StudioHome() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<Project | null>(null);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [name, setName] = useState('');
  const [objective, setObjective] = useState('');
  const [request, setRequest] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [executingRevisionId, setExecutingRevisionId] = useState<string | null>(null);
  const [verifyingRevisionId, setVerifyingRevisionId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const selectedIdRef = useRef<string | null>(null);

  const selectProject = useCallback((project: Project | null) => {
    selectedIdRef.current = project?.id ?? null;
    setSelected(project);
  }, []);

  const authFetch = useCallback(async (path: string, init?: RequestInit) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error('AUTHENTICATION_REQUIRED');
    return fetch(path, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}), Authorization: `Bearer ${token}` } });
  }, []);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authFetch('/api/studio/projects');
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? 'PROJECT_LOAD_FAILED');
      const nextProjects = payload.projects ?? [];
      setProjects(nextProjects);
      if (!selectedIdRef.current && nextProjects[0]) selectProject(nextProjects[0]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'PROJECT_LOAD_FAILED');
    } finally {
      setLoading(false);
    }
  }, [authFetch, selectProject]);

  const loadRevisions = useCallback(async (projectId: string) => {
    try {
      const response = await authFetch(`/api/studio/projects/${projectId}`);
      const payload = await response.json();
      if (response.ok) selectProject(payload.project);
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return;
      const revisionsResponse = await fetch(`/api/studio/projects/${projectId}/revisions`, { headers: { Authorization: `Bearer ${token}` } });
      if (revisionsResponse.ok) {
        const revisionsPayload = await revisionsResponse.json();
        setRevisions(revisionsPayload.revisions ?? []);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'PROJECT_LOAD_FAILED');
    }
  }, [authFetch, selectProject]);

  async function createProject() {
    if (!name.trim() || !objective.trim()) return;
    setBusy(true); setMessage('');
    try {
      const response = await authFetch('/api/studio/projects', { method: 'POST', body: JSON.stringify({ name, objective }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? 'PROJECT_CREATE_FAILED');
      setName(''); setObjective(''); selectProject(payload.project);
      await loadProjects();
      selectProject(payload.project);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'PROJECT_CREATE_FAILED');
    } finally {
      setBusy(false);
    }
  }

  async function planRevision() {
    if (!selected || !request.trim()) return;
    setBusy(true); setMessage('');
    try {
      const response = await authFetch(`/api/studio/projects/${selected.id}/revisions`, { method: 'POST', body: JSON.stringify({ prompt: request }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? 'REVISION_PLAN_FAILED');
      setRequest('');
      setMessage(`Revision ${payload.revision.version} planejada: ${payload.revision.change_class}.`);
      await loadRevisions(selected.id);
      await loadProjects();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'REVISION_PLAN_FAILED');
    } finally {
      setBusy(false);
    }
  }

  async function executePreview(revision: Revision) {
    if (!selected) return;
    setExecutingRevisionId(revision.id); setMessage('');
    try {
      const response = await authFetch(`/api/studio/projects/${selected.id}/revisions/${revision.id}/execute`, { method: 'POST', body: JSON.stringify({ environment: 'PREVIEW' }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? 'PREVIEW_EXECUTION_FAILED');
      setMessage(`Preview criada: ${payload.preview?.deploymentId ?? 'deployment confirmado'}.`);
      await loadRevisions(selected.id);
      await loadProjects();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'PREVIEW_EXECUTION_FAILED');
    } finally {
      setExecutingRevisionId(null);
    }
  }

  async function verifyPreview(revision: Revision) {
    if (!selected) return;
    setVerifyingRevisionId(revision.id); setMessage('');
    try {
      const response = await authFetch(`/api/studio/projects/${selected.id}/revisions/${revision.id}/preview/verify`, { method: 'POST', body: JSON.stringify({}) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? 'PREVIEW_VERIFICATION_FAILED');
      setMessage(`Preview verificado: ${payload.preview?.deploymentId ?? 'deployment confirmado'}.`);
      await loadRevisions(selected.id);
      await loadProjects();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'PREVIEW_VERIFICATION_FAILED');
    } finally {
      setVerifyingRevisionId(null);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadProjects(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadProjects]);

  useEffect(() => {
    if (!selected?.id) return;
    const projectId = selected.id;
    const timer = window.setTimeout(() => { void loadRevisions(projectId); }, 0);
    return () => window.clearTimeout(timer);
  }, [selected?.id, loadRevisions]);

  return (
    <div className="h-full overflow-y-auto bg-[#080808] text-[#FAFAFA]">
      <div className="max-w-[1500px] mx-auto p-6 lg:p-10 space-y-8">
        <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-[#D4AF37] text-[10px] font-bold tracking-[0.3em] uppercase mb-3"><BrainCircuit className="w-4 h-4" /> Nexus Project Execution</div>
            <h1 className="text-4xl md:text-6xl font-light tracking-tight">Studio Hórus™</h1>
            <p className="text-sm text-white/40 max-w-3xl mt-4 leading-relaxed">Um workspace universal. Você declara a intenção; o Nexus contextualiza, classifica a mudança, compõe capabilities e prepara a execução sem expor providers ou complexidade interna.</p>
          </div>
          <button onClick={() => void loadProjects()} className="px-4 py-2.5 rounded-xl border border-white/10 text-xs uppercase tracking-widest text-white/60 hover:text-white hover:border-[#D4AF37]/30 flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Atualizar</button>
        </header>

        <section className="grid grid-cols-1 xl:grid-cols-[340px_minmax(0,1fr)] gap-6">
          <aside className="rounded-3xl border border-white/10 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-4"><span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">Projetos</span><span className="text-[10px] text-[#D4AF37]">{projects.length}</span></div>
            <div className="space-y-2 max-h-[520px] overflow-y-auto">
              {loading && <div className="text-xs text-white/30 p-4">Carregando workspace…</div>}
              {!loading && projects.length === 0 && <div className="text-xs text-white/30 p-4">Nenhum projeto ainda.</div>}
              {projects.map((project) => <button key={project.id} onClick={() => selectProject(project)} className={`w-full text-left p-4 rounded-2xl border transition-all ${selected?.id === project.id ? 'border-[#D4AF37]/30 bg-[#D4AF37]/[0.06]' : 'border-white/5 bg-white/[0.015] hover:border-white/10'}`}><div className="text-sm font-semibold truncate">{project.name}</div><div className="text-[11px] text-white/35 mt-1 line-clamp-2">{project.objective}</div><div className="flex gap-2 mt-3 text-[9px] uppercase tracking-widest text-white/30"><span>{project.status}</span><span>·</span><span>{project.environment}</span></div></button>)}
            </div>
            <div className="border-t border-white/10 mt-5 pt-5 space-y-3">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do projeto" className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/40" />
              <textarea value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="O que você quer construir?" rows={3} className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/40 resize-none" />
              <button disabled={busy || !name.trim() || !objective.trim()} onClick={() => void createProject()} className="w-full rounded-xl bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-widest py-3 disabled:opacity-40 flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Novo projeto</button>
            </div>
          </aside>

          <main className="space-y-6">
            {!selected ? <div className="min-h-[520px] rounded-3xl border border-white/10 flex items-center justify-center text-white/30 text-sm">Crie ou selecione um projeto para iniciar.</div> : <>
              <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.035] to-transparent p-6 lg:p-8">
                <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
                  <div><div className="text-[9px] uppercase tracking-[0.3em] text-[#D4AF37] mb-2">Projeto ativo</div><h2 className="text-2xl md:text-3xl font-light">{selected.name}</h2><p className="text-sm text-white/40 mt-3 max-w-3xl">{selected.objective}</p></div>
                  <div className="flex gap-2 text-[9px] uppercase tracking-widest"><span className="px-3 py-2 rounded-full border border-white/10 text-white/40">{selected.status}</span><span className="px-3 py-2 rounded-full border border-[#D4AF37]/20 text-[#D4AF37]">{selected.environment}</span></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8"><Metric icon={Layers3} label="Capabilities" value={String(selected.capabilities?.length ?? 0)} /><Metric icon={GitBranch} label="Revisions" value={String(revisions.length)} /><Metric icon={ShieldCheck} label="Economic gate" value="Required" /><Metric icon={Sparkles} label="Nexus" value="Active" /></div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
                <div className="flex items-center gap-2 mb-3"><Sparkles className="w-4 h-4 text-[#D4AF37]" /><span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/50">Nexus Intake</span></div>
                <textarea value={request} onChange={(e) => setRequest(e.target.value)} placeholder="Ex.: Adicione autenticação e uma página de preços, preservando a arquitetura atual." rows={4} className="w-full rounded-2xl bg-black/30 border border-white/10 p-4 text-sm outline-none focus:border-[#D4AF37]/40 resize-none" />
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-4"><p className="text-[11px] text-white/30">O Nexus classifica MICRO → REBUILD e gera uma especificação contextual antes da execução.</p><button disabled={busy || !request.trim()} onClick={() => void planRevision()} className="px-5 py-3 rounded-xl bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-widest disabled:opacity-40 flex items-center justify-center gap-2">Planejar revisão <ArrowRight className="w-4 h-4" /></button></div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
                <div className="flex items-center justify-between mb-5"><span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">Revision Engine</span><span className="text-[10px] text-white/25">PREVIEW → APPROVAL → STAGING → PRODUCTION</span></div>
                <div className="space-y-3">
                  {revisions.length === 0 ? <div className="text-xs text-white/30">Nenhuma revisão planejada.</div> : revisions.map((revision) => {
                    const previewReady = revision.preview?.status === 'READY';
                    const previewVerified = previewReady && revision.preview?.verified === true;
                    return <div key={revision.id} className="p-4 rounded-2xl border border-white/5 bg-black/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div><div className="text-sm">Revision {revision.version} <span className="text-white/30">· {revision.change_class}</span></div><div className="text-[10px] text-white/30 mt-1">{new Date(revision.created_at).toLocaleString('pt-BR')} · {revision.approval_state}</div><div className="text-[9px] uppercase tracking-widest text-white/25 mt-2">Preview · {revision.preview?.status ?? 'NOT_CREATED'}{previewVerified ? ' · VERIFIED' : ''}</div></div>
                      <div className="flex items-center gap-2">
                        {previewReady && revision.preview?.url ? <a href={`https://${revision.preview.url.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer" className="px-4 py-2.5 rounded-xl border border-white/10 text-[9px] uppercase tracking-widest text-white/60 hover:text-white">Abrir Preview</a> : null}
                        {!previewReady ? <button disabled={executingRevisionId === revision.id} onClick={() => void executePreview(revision)} className="px-4 py-2.5 rounded-xl bg-[#D4AF37] text-black font-bold text-[9px] uppercase tracking-widest disabled:opacity-40">{executingRevisionId === revision.id ? 'Executando…' : 'Criar Preview'}</button> : !previewVerified ? <button disabled={verifyingRevisionId === revision.id} onClick={() => void verifyPreview(revision)} className="px-4 py-2.5 rounded-xl bg-[#D4AF37] text-black font-bold text-[9px] uppercase tracking-widest disabled:opacity-40 flex items-center gap-2"><ShieldCheck className="w-3 h-3" />{verifyingRevisionId === revision.id ? 'Verificando…' : 'Verificar Preview'}</button> : <span className="text-[9px] uppercase tracking-widest text-[#D4AF37] flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Preview VERIFIED</span>}
                      </div>
                    </div>;
                  })}
                </div>
              </section>
            </>}
          </main>
        </section>
        {message && <div className="fixed bottom-6 right-6 max-w-md rounded-2xl border border-white/10 bg-[#111]/95 backdrop-blur-xl px-5 py-4 text-xs text-white/70 shadow-2xl">{message}</div>}
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Layers3; label: string; value: string }) {
  return <div className="rounded-2xl border border-white/5 bg-black/20 p-4"><Icon className="w-4 h-4 text-[#D4AF37]/70" /><div className="text-[9px] uppercase tracking-widest text-white/25 mt-3">{label}</div><div className="text-sm font-semibold mt-1">{value}</div></div>;
}