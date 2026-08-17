'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Archive, ArrowUp, Check, Code2, FileText, FolderOpen, Image as ImageIcon, Link2, Menu, MoreHorizontal, Music2, Plus, RefreshCw, Settings2, Sparkles, Video, Wand2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Project { id: string; name: string; objective: string; status: string; environment: string; capabilities: string[]; updated_at: string; }
interface Revision { id: string; version: number; approval_state: string; optimized_spec: Record<string, unknown>; preview?: { status?: string; url?: string | null; verified?: boolean; resultId?: string; resultType?: string }; created_at: string; }
interface StudioResult { id: string; project_id?: string; revision_id?: string; capability: string; result_type: string; status: string; content_text: string | null; artifact_url: string | null; provider_response_metadata?: Record<string, unknown> | null; }
interface Message { id: string; role: 'user' | 'nexus'; text: string; }
type NavItem = { label: string; href?: string; icon: typeof Sparkles };

const navItems: NavItem[] = [
  { label: 'Studio', icon: Sparkles }, { label: 'Projetos', href: '/dashboard/projects', icon: FolderOpen },
  { label: 'Arquivos', href: '/dashboard/library', icon: FileText }, { label: 'Codex', href: '/dashboard/studio/code', icon: Code2 },
  { label: 'Conectores', href: '/dashboard/studio/connectors', icon: Link2 }, { label: 'Integrações', href: '/dashboard/integrations', icon: Link2 },
  { label: 'Histórico', href: '/dashboard/logs', icon: Archive }, { label: 'Configurações', href: '/dashboard/settings', icon: Settings2 },
];
const examples = ['Crie uma imagem de uma mulher andando na chuva.', 'Preciso de uma landing page para uma clínica.', 'Analise estes documentos e produza um relatório executivo.', 'Quero criar um jogo mobile.'];

function resultKind(result?: StudioResult | null) {
  const value = String(result?.result_type ?? result?.capability ?? '').toUpperCase();
  if (value.includes('IMAGE')) return 'IMAGE'; if (value.includes('VIDEO')) return 'VIDEO'; if (value.includes('AUDIO') || value.includes('MUSIC')) return 'AUDIO'; if (value.includes('CODE')) return 'CODE'; return 'TEXT';
}

function ResultViewer({ result }: { result: StudioResult }) {
  const kind = resultKind(result);
  if (result.status !== 'READY' && result.status !== 'COMPLETED' && !result.artifact_url && !result.content_text) return <div className="flex min-h-[320px] items-center justify-center text-sm text-white/40">O resultado está sendo preparado…</div>;
  if (kind === 'IMAGE' && result.artifact_url) return <div className="overflow-hidden rounded-2xl bg-black/40"><img src={result.artifact_url} alt="Resultado criado pelo Hórus" className="mx-auto max-h-[68vh] w-auto max-w-full object-contain" /></div>;
  if (kind === 'VIDEO' && result.artifact_url) return <video controls className="mx-auto max-h-[68vh] w-full rounded-2xl bg-black/50" src={result.artifact_url} />;
  if (kind === 'AUDIO' && result.artifact_url) return <div className="rounded-2xl border border-white/10 bg-black/30 p-8"><Music2 className="mb-5 h-8 w-8 text-white/60" /><audio controls className="w-full" src={result.artifact_url} /></div>;
  if (kind === 'CODE') return <pre className="max-h-[68vh] overflow-auto rounded-2xl bg-black/60 p-5 text-sm leading-7 text-white/75">{result.content_text ?? ''}</pre>;
  return <article className="max-h-[68vh] overflow-auto whitespace-pre-wrap rounded-2xl bg-black/30 p-6 text-[15px] leading-7 text-white/80">{result.content_text ?? result.artifact_url ?? 'Resultado sem conteúdo visual.'}</article>;
}

export default function StudioHome() {
  const [projects, setProjects] = useState<Project[]>([]); const [selected, setSelected] = useState<Project | null>(null); const [revisions, setRevisions] = useState<Revision[]>([]); const [result, setResult] = useState<StudioResult | null>(null);
  const [messages, setMessages] = useState<Message[]>([]); const [request, setRequest] = useState(''); const [name, setName] = useState(''); const [objective, setObjective] = useState('');
  const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false); const [notice, setNotice] = useState(''); const [showCreate, setShowCreate] = useState(false); const [showContext, setShowContext] = useState(false); const [mobileNav, setMobileNav] = useState(false); const [mobileProjects, setMobileProjects] = useState(false);
  const selectedIdRef = useRef<string | null>(null); const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const authFetch = useCallback(async (path: string, init?: RequestInit) => {
    const { data } = await supabase.auth.getSession(); const token = data.session?.access_token;
    if (!token) throw new Error('AUTHENTICATION_REQUIRED');
    return fetch(path, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}), Authorization: `Bearer ${token}` } });
  }, []);

  const selectProject = useCallback((project: Project | null) => {
    selectedIdRef.current = project?.id ?? null; setSelected(project); setResult(null); setMessages([]); setNotice(''); setMobileProjects(false);
  }, []);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authFetch('/api/studio/projects'); const payload = await response.json(); if (!response.ok) throw new Error(payload.error ?? 'PROJECT_LOAD_FAILED');
      const list: Project[] = payload.projects ?? []; setProjects(list);
      const current = list.find((project) => project.id === selectedIdRef.current) ?? list[0] ?? null;
      if (current && !selectedIdRef.current) selectProject(current);
    } catch (error) { setNotice(error instanceof Error ? error.message : 'PROJECT_LOAD_FAILED'); }
    finally { setLoading(false); }
  }, [authFetch, selectProject]);

  const loadProjectState = useCallback(async (projectId: string) => {
    try {
      const projectResponse = await authFetch(`/api/studio/projects/${projectId}`); const projectPayload = await projectResponse.json();
      if (projectResponse.ok && projectPayload.project) setSelected(projectPayload.project);
      const revisionsResponse = await authFetch(`/api/studio/projects/${projectId}/revisions`); const revisionsPayload = await revisionsResponse.json();
      if (!revisionsResponse.ok) return; const nextRevisions: Revision[] = revisionsPayload.revisions ?? []; setRevisions(nextRevisions);
      const resultId = nextRevisions[0]?.preview?.resultId;
      if (resultId) { const resultResponse = await authFetch(`/api/studio/results/${resultId}`); const resultPayload = await resultResponse.json(); if (resultResponse.ok && resultPayload.result) setResult(resultPayload.result); }
    } catch (error) { setNotice(error instanceof Error ? error.message : 'PROJECT_STATE_LOAD_FAILED'); }
  }, [authFetch]);

  useEffect(() => { void loadProjects(); }, [loadProjects]);
  useEffect(() => { if (selected?.id) void loadProjectState(selected.id); }, [selected?.id, loadProjectState]);

  async function createProject() {
    if (!name.trim() || !objective.trim()) return; setBusy(true); setNotice('');
    try { const response = await authFetch('/api/studio/projects', { method: 'POST', body: JSON.stringify({ name: name.trim(), objective: objective.trim() }) }); const payload = await response.json(); if (!response.ok) throw new Error(payload.error ?? 'PROJECT_CREATE_FAILED'); setName(''); setObjective(''); setShowCreate(false); setProjects((current) => [payload.project, ...current]); selectProject(payload.project); }
    catch (error) { setNotice(error instanceof Error ? error.message : 'PROJECT_CREATE_FAILED'); } finally { setBusy(false); }
  }

  async function runNexus(text = request) {
    if (!selected || !text.trim() || busy) return; const clean = text.trim(); setBusy(true); setNotice(''); setRequest(''); setMessages((current) => [...current, { id: `u-${Date.now()}`, role: 'user', text: clean }]);
    try {
      const response = await authFetch(`/api/studio/projects/${selected.id}/nexus`, { method: 'POST', body: JSON.stringify({ message: clean }) }); const payload = await response.json(); if (!response.ok) throw new Error(payload.error ?? 'NEXUS_RESULT_FAILED');
      if (payload.result) { setResult(payload.result); setMessages((current) => [...current, { id: `n-${Date.now()}`, role: 'nexus', text: 'Entendido. Preparei uma nova versão do resultado.' }]); }
      else setMessages((current) => [...current, { id: `n-${Date.now()}`, role: 'nexus', text: payload.nexus?.message ?? 'Entendido. Vou continuar preparando o trabalho.' }]);
      await loadProjectState(selected.id); await loadProjects();
    } catch (error) { setNotice(error instanceof Error ? error.message : 'NEXUS_RESULT_FAILED'); setMessages((current) => [...current, { id: `e-${Date.now()}`, role: 'nexus', text: 'Não consegui concluir esta etapa. Tente novamente.' }]); }
    finally { setBusy(false); }
  }

  async function approveLatest() {
    if (!selected || !revisions[0] || busy || revisions[0].approval_state === 'APPROVED') return; setBusy(true); setNotice('');
    try { const response = await authFetch(`/api/studio/projects/${selected.id}/revisions/${revisions[0].id}/approval`, { method: 'POST', body: JSON.stringify({ state: 'APPROVED' }) }); const payload = await response.json(); if (!response.ok) throw new Error(payload.error ?? 'APPROVAL_FAILED'); setNotice('Resultado aprovado. O próximo passo permanece sob o fluxo operacional existente.'); await loadProjectState(selected.id); }
    catch (error) { setNotice(error instanceof Error ? error.message : 'APPROVAL_FAILED'); } finally { setBusy(false); }
  }

  const latestApproved = revisions[0]?.approval_state === 'APPROVED'; const kind = resultKind(result);
  return <div className="min-h-screen bg-[#070707] text-white"><div className="flex min-h-screen">
    <aside className={`${mobileNav ? 'fixed inset-y-0 left-0 z-50 flex' : 'hidden'} w-[248px] shrink-0 flex-col border-r border-white/[0.07] bg-[#090909] lg:flex`}><div className="flex h-16 items-center justify-between border-b border-white/[0.06] px-5"><div className="flex items-center gap-2"><div className="grid h-8 w-8 place-items-center rounded-xl bg-white text-black"><Sparkles className="h-4 w-4" /></div><span className="text-sm font-semibold">Studio Hórus</span></div><button onClick={() => setMobileNav(false)} className="p-2 text-white/40 lg:hidden"><X className="h-4 w-4" /></button></div><nav className="flex-1 space-y-1 p-3">{navItems.map(({ label, href, icon: Icon }) => href ? <a key={label} href={href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/45 hover:bg-white/[0.05] hover:text-white"><Icon className="h-4 w-4" />{label}</a> : <div key={label} className="flex items-center gap-3 rounded-xl bg-white/[0.07] px-3 py-2.5 text-sm"><Icon className="h-4 w-4" />{label}</div>)}</nav><div className="border-t border-white/[0.06] p-4"><p className="text-xs font-medium">Nexus</p><p className="mt-1 text-[11px] leading-5 text-white/35">Você descreve. O Hórus conduz o trabalho até o resultado.</p></div></aside>
    {mobileNav && <button className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={() => setMobileNav(false)} aria-label="Fechar menu" />}
    <main className="min-w-0 flex-1"><header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#070707]/90 px-4 backdrop-blur-xl sm:px-6"><div className="flex min-w-0 items-center gap-2"><button onClick={() => setMobileNav(true)} className="rounded-xl p-2 text-white/60 lg:hidden"><Menu className="h-5 w-5" /></button><button onClick={() => setMobileProjects((v) => !v)} className="flex min-w-0 items-center gap-2 rounded-xl px-2 py-2 lg:hidden"><span className="truncate text-sm">{selected?.name ?? 'Novo projeto'}</span></button><div className="hidden items-center gap-2 text-sm text-white/55 lg:flex"><Sparkles className="h-4 w-4" /><span>Studio</span><span className="text-white/20">/</span><span className="truncate text-white">{selected?.name ?? 'Workspace'}</span></div></div><div className="flex gap-1.5"><button onClick={() => void loadProjects()} className="rounded-xl p-2.5 text-white/45 hover:bg-white/5"><RefreshCw className="h-4 w-4" /></button><button onClick={() => setShowContext((v) => !v)} className="rounded-xl p-2.5 text-white/45 hover:bg-white/5"><MoreHorizontal className="h-4 w-4" /></button></div></header>
      {mobileProjects && <div className="border-b border-white/[0.06] bg-[#0a0a0a] p-3 lg:hidden"><div className="mb-2 flex justify-between"><span className="text-[10px] uppercase tracking-[0.2em] text-white/35">Projetos</span><button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" /></button></div>{projects.map((project) => <button key={project.id} onClick={() => selectProject(project)} className="block w-full rounded-xl px-3 py-3 text-left hover:bg-white/5"><div className="truncate text-sm">{project.name}</div><div className="mt-1 truncate text-[11px] text-white/35">{project.objective}</div></button>)}</div>}
      <div className="mx-auto flex w-full max-w-[1380px] gap-0 px-3 py-4 sm:px-6 lg:px-8 lg:py-6"><section className="min-w-0 flex-1">
        {!selected ? <div className="flex min-h-[calc(100vh-120px)] flex-col items-center justify-center px-4 text-center"><div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]"><Wand2 className="h-6 w-6" /></div><h1 className="text-4xl font-medium tracking-[-0.04em] sm:text-6xl">Crie qualquer coisa.</h1><p className="mt-5 max-w-2xl text-sm leading-7 text-white/45 sm:text-base">Descreva o que você quer criar, converse com o Nexus e permaneça no mesmo workspace até chegar ao resultado.</p><div className="mt-9 flex flex-wrap justify-center gap-2">{examples.map((example) => <button key={example} onClick={() => { setObjective(example); setName('Novo projeto'); setShowCreate(true); }} className="rounded-full border border-white/10 bg-white/[0.025] px-4 py-2.5 text-xs text-white/55 hover:border-white/20 hover:text-white">{example}</button>)}</div><button onClick={() => setShowCreate(true)} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black"><Plus className="h-4 w-4" />Novo projeto</button></div> : <div className="mx-auto max-w-[920px]">
          <div className="mb-7 flex items-start justify-between gap-4"><div className="min-w-0"><p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/30">Workspace</p><h1 className="truncate text-2xl font-medium tracking-[-0.025em] sm:text-3xl">{selected.name}</h1><p className="mt-2 text-sm leading-6 text-white/40">{selected.objective}</p></div><button onClick={() => setShowCreate(true)} className="rounded-xl border border-white/10 p-2.5 text-white/50"><Plus className="h-4 w-4" /></button></div>
          {messages.length === 0 && !result && <div className="mb-8 rounded-[28px] border border-white/[0.07] bg-gradient-to-b from-white/[0.045] to-white/[0.015] p-7 sm:p-10"><div className="flex items-start gap-4"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-black"><Sparkles className="h-4 w-4" /></div><div><h2 className="text-xl font-medium">Como posso transformar sua ideia em resultado?</h2><p className="mt-2 max-w-xl text-sm leading-6 text-white/40">Descreva livremente. O Nexus entende a intenção, preserva o contexto e decide como realizar o trabalho.</p></div></div><div className="mt-8 grid gap-2 sm:grid-cols-2">{examples.map((example) => <button key={example} onClick={() => { setRequest(example); inputRef.current?.focus(); }} className="rounded-2xl border border-white/[0.07] bg-black/20 p-4 text-left text-xs leading-5 text-white/50 hover:border-white/15 hover:text-white">{example}</button>)}</div></div>}
          <div className="space-y-5">{messages.map((message) => <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`${message.role === 'user' ? 'max-w-[82%] rounded-2xl rounded-br-md bg-white px-4 py-3 text-black' : 'max-w-[88%] rounded-2xl rounded-bl-md border border-white/[0.07] bg-white/[0.025] px-4 py-3 text-white/75'}`}><div className="whitespace-pre-wrap text-sm leading-6">{message.text}</div></div></div>)}
            {result && <section className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0b0b0b] shadow-2xl shadow-black/30"><div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3"><div className="flex items-center gap-2"><div className="grid h-7 w-7 place-items-center rounded-lg bg-white/[0.06]">{kind === 'IMAGE' ? <ImageIcon className="h-3.5 w-3.5" /> : kind === 'VIDEO' ? <Video className="h-3.5 w-3.5" /> : kind === 'AUDIO' ? <Music2 className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}</div><span className="text-xs font-medium">Resultado</span></div><span className="text-[10px] uppercase tracking-[0.18em] text-white/25">Preview</span></div><div className="p-3 sm:p-5"><ResultViewer result={result} /></div><div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] px-4 py-3"><div className="flex gap-1.5"><button onClick={() => result.artifact_url && window.open(result.artifact_url, '_blank', 'noopener,noreferrer')} disabled={!result.artifact_url} className="rounded-lg px-3 py-2 text-xs text-white/50 hover:bg-white/5 disabled:opacity-30">Abrir</button><button onClick={() => result.artifact_url && void navigator.clipboard?.writeText(result.artifact_url)} disabled={!result.artifact_url} className="rounded-lg px-3 py-2 text-xs text-white/50 hover:bg-white/5 disabled:opacity-30">Copiar link</button></div><div className="flex gap-2"><button onClick={() => inputRef.current?.focus()} className="rounded-xl border border-white/10 px-4 py-2.5 text-xs text-white/70">Refinar</button><button disabled={busy || latestApproved || !revisions[0]} onClick={() => void approveLatest()} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black disabled:opacity-40">{latestApproved && <Check className="h-3.5 w-3.5" />}{latestApproved ? 'Aprovado' : 'Aprovar'}</button></div></div></section>}
            {busy && <div className="flex items-center gap-3 px-2 text-sm text-white/40"><div className="h-2 w-2 animate-pulse rounded-full bg-white" />O Nexus está preparando o resultado…</div>}
          </div>
          <form onSubmit={(event: FormEvent) => { event.preventDefault(); void runNexus(); }} className="sticky bottom-3 z-10 mt-7 rounded-[24px] border border-white/[0.1] bg-[#0c0c0c]/95 p-2 shadow-2xl shadow-black/50 backdrop-blur-xl"><textarea ref={inputRef} value={request} onChange={(event) => setRequest(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void runNexus(); } }} placeholder="O que você quer criar?" rows={3} className="max-h-44 min-h-[74px] w-full resize-none bg-transparent px-3 py-2 text-sm leading-6 outline-none placeholder:text-white/25" /><div className="flex items-center justify-between px-1 pb-1"><span className="hidden text-[10px] text-white/25 sm:inline">Enter para enviar · Shift+Enter para nova linha</span><button type="submit" disabled={busy || !request.trim()} className="ml-auto grid h-10 w-10 place-items-center rounded-xl bg-white text-black disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button></div></form>
          {notice && <div className="mt-3 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 text-xs text-white/50">{notice}</div>}
        </div>}
      </section>
      <aside className="ml-6 hidden w-[260px] shrink-0 xl:block"><div className="sticky top-24 space-y-3"><div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"><div className="mb-3 flex items-center justify-between"><span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">Projetos</span><button onClick={() => setShowCreate(true)}><Plus className="h-3.5 w-3.5" /></button></div><div className="max-h-[330px] space-y-1 overflow-y-auto">{loading ? <div className="p-3 text-xs text-white/25">Carregando…</div> : projects.map((project) => <button key={project.id} onClick={() => selectProject(project)} className={`w-full rounded-xl px-3 py-2.5 text-left ${selected.id === project.id ? 'bg-white/[0.07]' : 'hover:bg-white/[0.035]'}`}><div className="truncate text-xs font-medium">{project.name}</div><div className="mt-1 truncate text-[10px] text-white/30">{project.objective}</div></button>)}</div></div><div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">Workspace universal</p><p className="mt-2 text-xs leading-5 text-white/40">Imagem, vídeo, áudio, texto, documentos, código, sites, apps, dados e outros trabalhos usam a mesma superfície.</p></div></div></aside>
      </div>
    </main>
  </div>
  {showContext && selected && <div className="fixed right-4 top-20 z-40 w-[300px] rounded-2xl border border-white/10 bg-[#101010] p-4 shadow-2xl"><div className="flex items-center justify-between"><span className="text-xs font-medium">Contexto do projeto</span><button onClick={() => setShowContext(false)}><X className="h-4 w-4" /></button></div><p className="mt-3 text-xs leading-5 text-white/45">{selected.objective}</p><div className="mt-4 flex flex-wrap gap-1.5">{selected.capabilities?.map((capability) => <span key={capability} className="rounded-full border border-white/10 px-2.5 py-1 text-[9px] uppercase tracking-wider text-white/40">{capability}</span>)}</div></div>}
  {showCreate && <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm"><div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#101010] p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-[10px] uppercase tracking-[0.22em] text-white/30">Novo projeto</p><h2 className="mt-2 text-2xl font-medium">Comece descrevendo o resultado.</h2></div><button onClick={() => setShowCreate(false)}><X className="h-4 w-4" /></button></div><div className="mt-6 space-y-3"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome do projeto" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none" /><textarea value={objective} onChange={(event) => setObjective(event.target.value)} placeholder="O que você quer criar?" rows={5} className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 outline-none" /></div><button disabled={busy || !name.trim() || !objective.trim()} onClick={() => void createProject()} className="mt-4 w-full rounded-xl bg-white py-3 text-sm font-semibold text-black disabled:opacity-30">{busy ? 'Criando…' : 'Criar projeto'}</button></div></div>}
  </div>;
}
